"""
Test script for Cat Emotion Detection API
Run this to verify the API is working correctly
"""

import requests
import os
import json


def test_health_endpoint(base_url):
    """Test if the model is loaded and ready"""
    print("\n" + "="*50)
    print("Testing Health Endpoint")
    print("="*50)
    
    url = f"{base_url}/api/cat-emotion/health"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('success'):
            print("✅ Model is loaded and ready!")
            return True
        else:
            print("❌ Model not ready:", data.get('error'))
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_emotion_detection(base_url, image_path):
    """Test emotion detection with an image"""
    print("\n" + "="*50)
    print("Testing Emotion Detection")
    print("="*50)
    
    # Check if image exists
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        print("Please provide a valid cat image path")
        return False
    
    print(f"Image: {image_path}")
    
    url = f"{base_url}/api/cat-emotion/detect"
    
    try:
        # Prepare the image file
        with open(image_path, 'rb') as img_file:
            files = {'image': img_file}
            
            # Make the request
            print("Sending request...")
            response = requests.post(url, files=files)
            data = response.json()
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('success'):
            emotion_data = data['data']
            emotion = emotion_data['emotion']
            confidence = emotion_data['confidence']
            
            print(f"\n✅ RESULT:")
            print(f"   Emotion: {emotion.upper()}")
            print(f"   Confidence: {confidence*100:.2f}%")
            print(f"\n   All Probabilities:")
            for emo, prob in emotion_data['probabilities'].items():
                bar = "█" * int(prob * 50)
                print(f"   {emo:8s}: {prob*100:5.2f}% {bar}")
            
            return True
        else:
            print(f"❌ Error: {data.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_saved_detection(base_url, image_path):
    """Test emotion detection with saved image option"""
    print("\n" + "="*50)
    print("Testing Emotion Detection (with save)")
    print("="*50)
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return False
    
    url = f"{base_url}/api/cat-emotion/detect-saved"
    
    try:
        with open(image_path, 'rb') as img_file:
            files = {'image': img_file}
            response = requests.post(url, files=files)
            data = response.json()
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('success'):
            print(f"✅ Image saved at: {data['data'].get('saved_path')}")
            return True
        else:
            print(f"❌ Error: {data.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("\n")
    print("╔" + "="*48 + "╗")
    print("║" + " Cat Emotion Detection API Test Suite ".center(48) + "║")
    print("╚" + "="*48 + "╝")
    
    # Configuration
    BASE_URL = "http://localhost:5000"  # Change if your server runs on different port
    
    # You need to provide a cat image for testing
    # Replace this with an actual path to a cat image
    TEST_IMAGE_PATH = input("\nEnter path to a cat image (or press Enter to skip image tests): ").strip()
    
    # Run tests
    results = []
    
    # Test 1: Health check
    results.append(("Health Check", test_health_endpoint(BASE_URL)))
    
    # Test 2 & 3: Image detection (only if image provided)
    if TEST_IMAGE_PATH:
        results.append(("Emotion Detection", test_emotion_detection(BASE_URL, TEST_IMAGE_PATH)))
        results.append(("Emotion Detection (Saved)", test_saved_detection(BASE_URL, TEST_IMAGE_PATH)))
    else:
        print("\n⚠️  Skipping image detection tests (no image provided)")
    
    # Summary
    print("\n" + "="*50)
    print("TEST SUMMARY")
    print("="*50)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name:30s}: {status}")
    
    total_tests = len(results)
    passed_tests = sum(1 for _, p in results if p)
    
    print(f"\nTotal: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("\n🎉 All tests passed! API is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
        print("\nCommon issues:")
        print("  1. Flask server not running (start with 'flask run' or 'python run.py')")
        print("  2. Model file not found (check ai/CAT/cat_emotion_efficientnet.pth exists)")
        print("  3. Dependencies not installed (run 'pip install -r requirements.txt')")


if __name__ == "__main__":
    main()
