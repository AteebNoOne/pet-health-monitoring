#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ==================== PIN DEFINITIONS ====================
#define LED_GREEN 25
#define LED_RED 26
#define LED_YELLOW 27
#define ONE_WIRE_BUS 15
#define BUTTON_PIN 33
#define BATTERY_PIN 34

// ==================== BLE UUIDs ====================
#define SERVICE_UUID "0000180d-0000-1000-8000-00805f9b34fb"
#define CHARACTERISTIC_UUID "00002a37-0000-1000-8000-00805f9b34fb"
#define BATTERY_SERVICE_UUID "0000180f-0000-1000-8000-00805f9b34fb"
#define BATTERY_CHAR_UUID "00002a19-0000-1000-8000-00805f9b34fb"

// ==================== THRESHOLDS & CONFIGURATION ====================
#define MIN_IR_VALUE 50000
#define BATTERY_LOW_THRESHOLD 20
#define DISCOVERY_TIMEOUT 120000
#define BUTTON_DEBOUNCE 200

#define BATTERY_MAX_VOLTAGE 4.35
#define BATTERY_MIN_VOLTAGE 3.8
#define VOLTAGE_DIVIDER_RATIO 2.0

// ==================== DEVICE STATES ====================
enum DeviceState {
  STATE_SLEEP,
  STATE_DISCOVERY,
  STATE_CONNECTED
};

// ==================== GLOBAL OBJECTS ====================
MAX30105 particleSensor;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);
BLECharacteristic *dataCharacteristic;
BLECharacteristic *batteryCharacteristic;
BLEServer *pServer;

// ==================== STATE VARIABLES ====================
DeviceState currentState = STATE_SLEEP;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Sensor data
float heartRate = 0.0;
float spo2 = 0.0;
float temperature = 0.0;
uint8_t batteryLevel = 100;

// Timing variables
unsigned long discoveryStartTime = 0;
unsigned long lastBatteryCheck = 0;
unsigned long lastButtonPress = 0;
unsigned long lastBlinkTime = 0;
unsigned long lastDataSend = 0;
unsigned long lastTempRequest = 0;
unsigned long lastGoodIRTime = 0;
unsigned long lastSpO2Calc = 0;

bool blinkState = false;

// Sensor status
bool tempSensorOK = false;
bool maxSensorOK = false;
bool batteryLow = false;

// ==================== HEART RATE DETECTION ====================
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute = 0;
int beatAvg = 0;

// Buffer for IR values to maintain continuity for checkForBeat()
#define BUFFER_SIZE 100
unsigned long lastSampleTime = 0;
const unsigned long SAMPLE_INTERVAL = 10;  // 100Hz sampling (10ms)

// ==================== I2C MUTEX FOR DUAL-CORE ====================
SemaphoreHandle_t i2cMutex = NULL;

// ==================== BLE CALLBACKS ====================
class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) {
    deviceConnected = true;
    Serial.println("✓ Client connected");
  }

  void onDisconnect(BLEServer *pServer) {
    deviceConnected = false;
    Serial.println("✗ Client disconnected");
  }
};

// ==================== FUNCTION PROTOTYPES ====================
void updateBatteryLevel();
void updateLEDStatus();

void handleButtonPress();
void handleSleepState();
void handleDiscoveryState();
void handleConnectedState();

void enterDiscoveryMode();
void exitDiscoveryMode();
void enterConnectedMode();

void sendDataViaBLE();
void updateHeartRate();


// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n╔════════════════════════════════════╗");
  Serial.println("║   Pet Health Belt - Initializing  ║");
  Serial.println("╚════════════════════════════════════╝");

  // Configure pins
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BATTERY_PIN, INPUT);

  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_YELLOW, LOW);

  // Initialize I2C
  Wire.begin(21, 22);
  Wire.setClock(400000);

  // Initialize Temperature Sensor
  Serial.print("→ Temperature sensor: ");
  tempSensor.begin();
  tempSensor.setResolution(12);
  float testTemp = tempSensor.getTempCByIndex(0);
  if (testTemp != DEVICE_DISCONNECTED_C && testTemp > -50 && testTemp < 100) {
    tempSensorOK = true;
    Serial.println("OK");
  } else {
    tempSensorOK = false;
    Serial.println("FAILED");
  }

  // Initialize MAX30102 Sensor
  Serial.print("→ MAX30102 sensor: ");
  if (particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("OK");
    Serial.println("   Place finger on sensor with steady pressure");

    // CRITICAL: Use DEFAULT settings - proven to work with checkForBeat()
    // Custom settings were causing IR saturation (262143)
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A); // Low LED power - prevents saturation
    particleSensor.setPulseAmplitudeGreen(0);  // Turn off green

    delay(100);
    long testIR = particleSensor.getIR();
    if (testIR > 0) {
      maxSensorOK = true;
      Serial.print("   Initial IR: ");
      Serial.println(testIR);
    } else {
      maxSensorOK = false;
      Serial.println("   WARNING: No IR reading");
    }
  } else {
    maxSensorOK = false;
    Serial.println("FAILED - Not detected");
  }

  // Initialize BLE
  Serial.print("→ BLE initialization: ");
  BLEDevice::init("PetHealthBelt");

  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *hrService = pServer->createService(SERVICE_UUID);
  dataCharacteristic = hrService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_NOTIFY);
  dataCharacteristic->addDescriptor(new BLE2902());
  hrService->start();

  BLEService *batteryService = pServer->createService(BATTERY_SERVICE_UUID);
  batteryCharacteristic = batteryService->createCharacteristic(
    BATTERY_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  batteryCharacteristic->addDescriptor(new BLE2902());
  batteryService->start();

  Serial.println("OK");

  updateBatteryLevel();

  currentState = STATE_SLEEP;
  Serial.println("\n→ Device ready - Press button to enter discovery mode");
  Serial.println("═══════════════════════════════════════════════════\n");

  updateLEDStatus();

  // Create I2C mutex
  i2cMutex = xSemaphoreCreateMutex();
  if (i2cMutex == NULL) {
    Serial.println("✗ FATAL: Failed to create I2C mutex!");
    while (1)
      ;
  }
}

// ==================== HEART RATE DETECTION FUNCTION ====================
void updateHeartRate() {
  unsigned long currentTime = millis();

  // Maintain strict 100Hz sampling for checkForBeat()
  if (currentTime - lastSampleTime < SAMPLE_INTERVAL) return;
  lastSampleTime = currentTime;

  long irValue = 0;

  // Read sensor with mutex protection
  if (xSemaphoreTake(i2cMutex, portMAX_DELAY) == pdTRUE) {
    irValue = particleSensor.getIR();
    xSemaphoreGive(i2cMutex);
  }

  // Finger detection
  if (irValue < MIN_IR_VALUE) {
    if (millis() - lastGoodIRTime > 3000) {  // 3 seconds no signal
      maxSensorOK = false;
      heartRate = 0;
      beatsPerMinute = 0;
      beatAvg = 0;
      // Clear buffer
      for (byte i = 0; i < RATE_SIZE; i++) rates[i] = 0;
    }
    return;
  } else {
    lastGoodIRTime = millis();
    maxSensorOK = true;
  }

  // ---- EXACT SPARKFUN EXAMPLE LOGIC ----
  if (checkForBeat(irValue) == true) {
    // We sensed a beat!
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= RATE_SIZE;

      // Take average of readings
      beatAvg = 0;
      for (byte x = 0; x < RATE_SIZE; x++)
        beatAvg += rates[x];
      beatAvg /= RATE_SIZE;

      heartRate = beatAvg;
    }
  }
}


// ==================== MAIN LOOP ====================
void loop() {
  // Always run heart rate detection when sensor is powered
  updateHeartRate();

  // Check button
  if (digitalRead(BUTTON_PIN) == LOW && (millis() - lastButtonPress > BUTTON_DEBOUNCE)) {
    lastButtonPress = millis();
    handleButtonPress();
  }

  // Update battery every 10 seconds
  if (millis() - lastBatteryCheck > 10000) {
    updateBatteryLevel();
    lastBatteryCheck = millis();
  }

  // Handle state machine
  switch (currentState) {
    case STATE_SLEEP:
      handleSleepState();
      break;

    case STATE_DISCOVERY:
      handleDiscoveryState();
      break;

    case STATE_CONNECTED:
      handleConnectedState();
      break;
  }

  // Update LED indicators
  updateLEDStatus();
}

// ==================== BUTTON HANDLER ====================
void handleButtonPress() {
  Serial.println("\n[BUTTON] Pressed");

  if (currentState == STATE_SLEEP) {
    enterDiscoveryMode();
  } else if (currentState == STATE_DISCOVERY) {
    exitDiscoveryMode();
  }
}

// ==================== STATE HANDLERS ====================
void handleSleepState() {
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = true;
    enterConnectedMode();
  }
  delay(100);
}

void handleDiscoveryState() {
  if (millis() - discoveryStartTime > DISCOVERY_TIMEOUT) {
    Serial.println("\n[DISCOVERY] Timeout - returning to sleep mode");
    exitDiscoveryMode();
    return;
  }

  // Blink green LED
  if (millis() - lastBlinkTime > 500) {
    blinkState = !blinkState;
    lastBlinkTime = millis();
  }

  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = true;
    enterConnectedMode();
  }
}

void handleConnectedState() {
  // Check for disconnection
  if (!deviceConnected && oldDeviceConnected) {
    oldDeviceConnected = false;
    Serial.println("✗ Connection Lost");
    enterDiscoveryMode();
    return;
  }

  if (deviceConnected) {
    // Update temperature every 2 seconds
    if (millis() - lastTempRequest > 2000) {
      tempSensor.requestTemperatures();
      float tempC = tempSensor.getTempCByIndex(0);
      if (tempC != DEVICE_DISCONNECTED_C && tempC > -50 && tempC < 100) {
        temperature = (tempC * 9.0 / 5.0) + 32.0;
        tempSensorOK = true;
      } else {
        tempSensorOK = false;
      }
      lastTempRequest = millis();
    }

    // Send data via BLE every second
    if (millis() - lastDataSend > 1000) {
      sendDataViaBLE();
      lastDataSend = millis();
    }
  }
}

// ==================== STATE TRANSITIONS ====================
void enterDiscoveryMode() {
  Serial.println("\n╔═══════════════════════════════════╗");
  Serial.println("║  Entering DISCOVERY Mode          ║");
  Serial.println("║  Timeout: 2 minutes                ║");
  Serial.println("╚═══════════════════════════════════╝");

  currentState = STATE_DISCOVERY;
  discoveryStartTime = millis();
  blinkState = false;
  lastBlinkTime = millis();

  BLEAdvertising *advertising = BLEDevice::getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->setScanResponse(true);
  advertising->setMinPreferred(0x06);
  advertising->setMaxPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("[BLE] Advertising started");
  Serial.println("[BLE] Waiting for connection...\n");
}

void exitDiscoveryMode() {
  Serial.println("\n[DISCOVERY] Exiting discovery mode");
  BLEDevice::stopAdvertising();
  currentState = STATE_SLEEP;
  digitalWrite(LED_GREEN, LOW);
  Serial.println("[STATE] Returned to SLEEP mode\n");
}

void enterConnectedMode() {
  Serial.println("\n╔═══════════════════════════════════╗");
  Serial.println("║  Device CONNECTED                  ║");
  Serial.println("║  Starting data transmission...     ║");
  Serial.println("╚═══════════════════════════════════╝\n");

  currentState = STATE_CONNECTED;

  // Reset heart rate buffers for fresh start
  for (byte i = 0; i < RATE_SIZE; i++) rates[i] = 0;
  rateSpot = 0;
  lastBeat = 0;
  heartRate = 0;
}

// ==================== DATA TRANSMISSION ====================
void sendDataViaBLE() {
  char payload[100];
  snprintf(payload, sizeof(payload),
           "HR:%.1f,Temp:%.1f,Bat:%d",
           heartRate, temperature, batteryLevel);

  if (deviceConnected) {
    dataCharacteristic->setValue(payload);
    dataCharacteristic->notify();

    // Debug output
    long debugIR = 0;
    if (xSemaphoreTake(i2cMutex, portMAX_DELAY) == pdTRUE) {
      debugIR = particleSensor.getIR();
      xSemaphoreGive(i2cMutex);
    }
    
    Serial.print("[DATA] IR=");
    Serial.print(debugIR);
    Serial.print(", HR=");
    Serial.print(heartRate, 1);
    Serial.print(" BPM, Temp=");
    Serial.print(temperature, 1);
    Serial.print("F, Bat=");
    Serial.print(batteryLevel);
    Serial.println("%");
  }
}

// ==================== BATTERY MANAGEMENT ====================
void updateBatteryLevel() {
  int rawValue = analogRead(BATTERY_PIN);
  float voltage = (rawValue / 4095.0) * 3.3 * VOLTAGE_DIVIDER_RATIO;
  batteryLevel = constrain(((voltage - BATTERY_MIN_VOLTAGE) / (BATTERY_MAX_VOLTAGE - BATTERY_MIN_VOLTAGE)) * 100, 0, 100);
  batteryLow = (batteryLevel < BATTERY_LOW_THRESHOLD);

  if (deviceConnected) {
    batteryCharacteristic->setValue(&batteryLevel, 1);
    batteryCharacteristic->notify();
  }
}

// ==================== LED STATUS MANAGEMENT ====================
void updateLEDStatus() {
  // Yellow LED for sensor errors
  digitalWrite(LED_YELLOW, (!tempSensorOK || !maxSensorOK) ? HIGH : LOW);

  // Red LED for low battery
  digitalWrite(LED_RED, batteryLow ? HIGH : LOW);

  // Green LED for status
  switch (currentState) {
    case STATE_DISCOVERY:
      digitalWrite(LED_GREEN, blinkState ? HIGH : LOW);
      break;
    case STATE_CONNECTED:
      digitalWrite(LED_GREEN, HIGH);
      break;
    default:
      digitalWrite(LED_GREEN, LOW);
      break;
  }
}