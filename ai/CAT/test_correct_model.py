"""
Test script for Cat Emotion Detection using the CORRECT model
This uses EfficientNet-B0 model (93.59% accuracy) instead of ResNet18 (85.47%)
"""

from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms

# Install if needed: pip install efficientnet_pytorch
from efficientnet_pytorch import EfficientNet


def test_cat_emotion_model():
    """Test the correct EfficientNet-B0 model"""
    
    # Configuration
    classes = ["angry", "happy", "sad"]
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model_path = "cat_emotion_efficientnet.pth"  # The CORRECT model
    
    # Load EfficientNet-B0 model
    print("Loading EfficientNet-B0 model...")
    model = EfficientNet.from_pretrained('efficientnet-b0', num_classes=3)
    
    # Load trained weights
    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)
    model.eval()
    model = model.to(device)
    print(f"✅ Model loaded successfully from: {model_path}")
    
    # Image preprocessing
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])
    
    # Test function
    def predict(img_path):
        """Predict emotion from image"""
        img = Image.open(img_path).convert("RGB")
        x = transform(img).unsqueeze(0).to(device)
        
        with torch.no_grad():
            out = model(x)
            probabilities = torch.softmax(out, dim=1)
            predicted_idx = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][predicted_idx].item()
        
        result = {
            "emotion": classes[predicted_idx],
            "confidence": confidence,
            "all_probabilities": {
                classes[i]: float(probabilities[0][i].item())
                for i in range(len(classes))
            }
        }
        return result
    
    # Test with sample images
    test_images = [
        "test/happy/1047_jpg.rf.b72d660338fc0ea07b6f5136b64e8a8b.jpg",
        "test/angry/100_a_jpeg.rf.171bba951365131b44e1ba2d52385ea4.jpg",
        "test/sad/1015_jpg.rf.0e7fb80a23c9eb5a66c36e7e1e88e7b1.jpg"
    ]
    
    print("\n" + "="*60)
    print("TESTING CAT EMOTION DETECTION")
    print("="*60)
    
    for img_path in test_images:
        try:
            result = predict(img_path)
            print(f"\n📷 Image: {img_path}")
            print(f"   Predicted Emotion: {result['emotion'].upper()}")
            print(f"   Confidence: {result['confidence']*100:.2f}%")
            print(f"   All Probabilities:")
            for emo, prob in result['all_probabilities'].items():
                bar = "█" * int(prob * 40)
                print(f"      {emo:8s}: {prob*100:5.2f}% {bar}")
        except FileNotFoundError:
            print(f"\n⚠️  Image not found: {img_path}")
    
    print("\n" + "="*60)
    print("✅ Testing complete!")
    print("="*60)


if __name__ == "__main__":
    test_cat_emotion_model()
