# Cat Emotion Detection API Integration Guide

## 📋 Overview

This guide explains how to integrate the cat emotion detection model (EfficientNet-B0) into your backend and test it from your mobile app.

## 🏗️ Architecture

```
Mobile App (React Native)
    ↓ (sends cat image)
Flask Backend API (/api/cat-emotion/detect)
    ↓
Cat Emotion Service (PyTorch Model)
    ↓ (returns emotion prediction)
Response: {emotion, confidence, probabilities}
```

## 📦 Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Note**: Installing PyTorch may take some time (it's a large package ~1-2GB).

For CPU-only version (faster download):
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### 2. Verify Model File

Make sure the model file exists at:
```
ai-pet-monitoring-app/
  └── ai/
      └── CAT/
          └── cat_emotion_efficientnet.pth  ← This file must exist
```

## 🚀 API Endpoints

### 1. **POST** `/api/cat-emotion/detect`
Main endpoint for emotion detection (processes image in-memory, doesn't save)

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `image` field with cat image file

**Response:**
```json
{
  "success": true,
  "data": {
    "emotion": "happy",
    "confidence": 0.9234,
    "probabilities": {
      "angry": 0.0123,
      "happy": 0.9234,
      "sad": 0.0643
    }
  }
}
```

### 2. **POST** `/api/cat-emotion/detect-saved`
Alternative endpoint that saves the image before processing

**Request:** Same as above

**Response:**
```json
{
  "success": true,
  "data": {
    "emotion": "sad",
    "confidence": 0.8567,
    "probabilities": {
      "angry": 0.0234,
      "happy": 0.1199,
      "sad": 0.8567
    },
    "saved_path": "/uploads/cat_emotions/cat_image_1234.jpg"
  }
}
```

### 3. **GET** `/api/cat-emotion/health`
Health check endpoint to verify model is loaded

**Response:**
```json
{
  "success": true,
  "message": "Cat emotion detector is ready",
  "device": "cpu",
  "classes": ["angry", "happy", "sad"]
}
```

## 📱 Mobile App Integration (React Native)

### Example Code

```javascript
// Function to detect cat emotion from image
const detectCatEmotion = async (imageUri) => {
  try {
    const formData = new FormData();
    
    // Add the image file
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg', // or image/png
      name: 'cat_photo.jpg',
    });

    const response = await fetch('http://YOUR_BACKEND_URL/api/cat-emotion/detect', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Emotion:', result.data.emotion);
      console.log('Confidence:', result.data.confidence);
      console.log('All probabilities:', result.data.probabilities);
      
      return result.data;
    } else {
      console.error('Error:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
};

// Usage example
const handleCatImageSelected = async (imageUri) => {
  const emotion = await detectCatEmotion(imageUri);
  
  if (emotion) {
    alert(`Your cat is ${emotion.emotion}! (${(emotion.confidence * 100).toFixed(1)}% confident)`);
  }
};
```

### With Axios

```javascript
import axios from 'axios';

const detectCatEmotion = async (imageUri) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'cat_photo.jpg',
  });

  try {
    const response = await axios.post(
      'http://YOUR_BACKEND_URL/api/cat-emotion/detect',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error detecting emotion:', error);
    return null;
  }
};
```

## 🧪 Testing

### Using cURL (Command Line)

```bash
# Test with a cat image
curl -X POST \
  -F "image=@/path/to/your/cat_image.jpg" \
  http://localhost:5000/api/cat-emotion/detect

# Health check
curl http://localhost:5000/api/cat-emotion/health
```

### Using Postman

1. Create a new POST request
2. URL: `http://localhost:5000/api/cat-emotion/detect`
3. Body → form-data
4. Key: `image` (type: File)
5. Value: Select a cat image
6. Send

### Using Python

```python
import requests

url = "http://localhost:5000/api/cat-emotion/detect"
files = {'image': open('cat_image.jpg', 'rb')}

response = requests.post(url, files=files)
print(response.json())
```

## ⚙️ Configuration

### Change Model Path
Edit `backend/app/services/cat_emotion_service.py`:

```python
detector = CatEmotionDetector(model_path="/custom/path/to/model.pth")
```

### Use GPU (if available)
The service automatically uses GPU if CUDA is available. Check with health endpoint:

```bash
curl http://localhost:5000/api/cat-emotion/health
```

Response will show `"device": "cuda"` if GPU is being used.

## 🔍 Troubleshooting

### Model File Not Found
**Error:** `Model file not found at: ...`
**Solution:** Ensure `cat_emotion_efficientnet.pth` exists in `ai/CAT/` folder

### Import Error: efficientnet_pytorch
**Error:** `Please install efficientnet_pytorch`
**Solution:** 
```bash
pip install efficientnet_pytorch
```

### Out of Memory
**Error:** CUDA out of memory or Python memory error
**Solution:** Process images one at a time, or resize images before uploading

### Wrong Predictions
- Ensure the image contains a cat face clearly visible
- Image should be in good lighting
- Model is trained on 3 emotions: angry, happy, sad
- Model accuracy is ~93.6% on test data

## 📊 Model Performance

- **Architecture:** EfficientNet-B0
- **Classes:** angry, happy, sad
- **Test Accuracy:** 93.59%
- **Validation Accuracy:** 91.4%
- **Input Size:** 224x224 RGB
- **Training Epochs:** 15

## 🎯 Best Practices

1. **Image Quality:** Use clear, well-lit images of cat faces
2. **Image Size:** Resize large images before uploading to save bandwidth
3. **Error Handling:** Always check `success` field in response
4. **Confidence Threshold:** Consider predictions with confidence > 0.7 as reliable
5. **Caching:** Model loads once and stays in memory (singleton pattern)

## 📝 Example Response Handling

```javascript
const handleEmotionResult = (result) => {
  if (!result.success) {
    alert('Failed to detect emotion: ' + result.error);
    return;
  }

  const { emotion, confidence, probabilities } = result.data;
  
  // Show result to user
  if (confidence > 0.8) {
    console.log(`High confidence: Cat is ${emotion}`);
  } else if (confidence > 0.6) {
    console.log(`Medium confidence: Cat might be ${emotion}`);
  } else {
    console.log(`Low confidence: Uncertain, but possibly ${emotion}`);
  }
  
  // Show all probabilities
  console.log('Detailed breakdown:');
  Object.entries(probabilities).forEach(([emo, prob]) => {
    console.log(`  ${emo}: ${(prob * 100).toFixed(1)}%`);
  });
};
```

## 🚀 Next Steps

1. Install dependencies: `pip install -r requirements.txt`
2. Test health endpoint: `curl http://localhost:5000/api/cat-emotion/health`
3. Test with a cat image using the test script (see `test_cat_emotion.py`)
4. Integrate into your mobile app using the examples above

## 📞 Support

If you encounter any issues:
1. Check that the model file exists
2. Verify all dependencies are installed
3. Check Flask server logs for errors
4. Test with the health endpoint first
