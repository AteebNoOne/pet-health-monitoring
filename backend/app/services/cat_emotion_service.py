"""
Cat Emotion Detection Service
Uses EfficientNet-B0 model to predict cat emotions from images
"""

import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import os


class CatEmotionDetector:
    """Service class for detecting cat emotions using EfficientNet-B0"""
    
    def __init__(self, model_path=None):
        """
        Initialize the cat emotion detector
        
        Args:
            model_path (str): Path to the .pth model file
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.classes = ["angry", "happy", "sad"]
        
        # Set default model path if not provided
        if model_path is None:
            # Point to the model in backend/app/trained folder
            base_dir = os.path.dirname(os.path.abspath(__file__))  # app/services/
            app_dir = os.path.dirname(base_dir)  # app/
            model_path = os.path.join(app_dir, "trained", "cat_resnet18.pth")
        
        self.model_path = model_path
        
        # Image preprocessing transforms (same as training)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
        ])
        
        # Load the model
        self.model = self._load_model()
    
    def _load_model(self):
        """Load the ResNet18 model with trained weights"""
        try:
            from torchvision import models
            
            print(f"🔄 Loading ResNet18 cat emotion model from: {self.model_path}")
            
            # Create the ResNet18 model architecture
            model = models.resnet18(weights=None)
            model.fc = nn.Linear(model.fc.in_features, 3)  # 3 classes
            
            # Load the trained weights
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found at: {self.model_path}")
            
            print(f"📂 Loading state dict from file...")
            state_dict = torch.load(self.model_path, map_location=self.device)
            model.load_state_dict(state_dict)
            
            # Set to evaluation mode
            model.eval()
            model = model.to(self.device)
            
            print(f"✅ ResNet18 cat emotion model loaded successfully!")
            return model
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR loading model: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Error loading model: {str(e)}")
    
    def predict(self, image_path):
        """
        Predict emotion from a cat image
        
        Args:
            image_path (str): Path to the cat image file
            
        Returns:
            dict: Contains predicted emotion and confidence scores
        """
        try:
            # Load and preprocess the image
            img = Image.open(image_path).convert("RGB")
            img_tensor = self.transform(img).unsqueeze(0).to(self.device)
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(img_tensor)
                probabilities = torch.softmax(outputs, dim=1)
                predicted_idx = torch.argmax(probabilities, dim=1).item()
                confidence = probabilities[0][predicted_idx].item()
            
            # Get all class probabilities
            all_probabilities = {
                self.classes[i]: float(probabilities[0][i].item())
                for i in range(len(self.classes))
            }
            
            # Log prediction results
            print("\n" + "="*60)
            print("🐱 CAT EMOTION PREDICTION RESULT")
            print("="*60)
            print(f"📷 Image: {image_path}")
            print(f"🎯 Predicted Emotion: {self.classes[predicted_idx].upper()}")
            print(f"📊 Confidence: {confidence*100:.2f}%")
            print("\n📈 All Probabilities:")
            for emotion, prob in all_probabilities.items():
                bar = "█" * int(prob * 40)
                print(f"   {emotion:8s}: {prob*100:6.2f}% {bar}")
            print("="*60 + "\n")
            
            return {
                "success": True,
                "emotion": self.classes[predicted_idx],
                "confidence": float(confidence),
                "all_probabilities": all_probabilities
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def predict_from_bytes(self, image_bytes):
        """
        Predict emotion from image bytes (useful for API uploads)
        
        Args:
            image_bytes: Image data in bytes
            
        Returns:
            dict: Contains predicted emotion and confidence scores
        """
        try:
            from io import BytesIO
            
            # Load image from bytes
            img = Image.open(BytesIO(image_bytes)).convert("RGB")
            img_tensor = self.transform(img).unsqueeze(0).to(self.device)
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(img_tensor)
                probabilities = torch.softmax(outputs, dim=1)
                predicted_idx = torch.argmax(probabilities, dim=1).item()
                confidence = probabilities[0][predicted_idx].item()
            
            # Get all class probabilities
            all_probabilities = {
                self.classes[i]: float(probabilities[0][i].item())
                for i in range(len(self.classes))
            }
            
            # Log prediction results
            print("\n" + "="*60)
            print("🐱 CAT EMOTION PREDICTION RESULT (from bytes)")
            print("="*60)
            print(f"🎯 Predicted Emotion: {self.classes[predicted_idx].upper()}")
            print(f"📊 Confidence: {confidence*100:.2f}%")
            print("\n📈 All Probabilities:")
            for emotion, prob in all_probabilities.items():
                bar = "█" * int(prob * 40)
                print(f"   {emotion:8s}: {prob*100:6.2f}% {bar}")
            print("="*60 + "\n")
            
            return {
                "success": True,
                "emotion": self.classes[predicted_idx],
                "confidence": float(confidence),
                "all_probabilities": all_probabilities
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Global instance (singleton pattern)
_detector_instance = None


def get_cat_emotion_detector():
    """
    Get or create the global cat emotion detector instance
    
    Returns:
        CatEmotionDetector: Singleton instance
    """
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = CatEmotionDetector()
    return _detector_instance
