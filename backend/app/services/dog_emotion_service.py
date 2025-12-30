"""
Dog Emotion Detection Service
Uses EfficientNet-B0 (Keras) model to predict dog emotions from images
"""

import tensorflow as tf
import numpy as np
from PIL import Image
import os
from io import BytesIO


class DogEmotionDetector:
    """Service class for detecting dog emotions using EfficientNet-B0 (Keras)"""
    
    def __init__(self, model_path=None):
        """
        Initialize the dog emotion detector
        
        Args:
            model_path (str): Path to the .h5 model file
        """
        self.classes = ["angry", "happy", "relaxed", "sad"]
        self.img_size = 224
        
        # Set default model path if not provided
        if model_path is None:
            # Point to the model in backend/app/trained folder
            base_dir = os.path.dirname(os.path.abspath(__file__))  # app/services/
            app_dir = os.path.dirname(base_dir)  # app/
            model_path = os.path.join(app_dir, "trained", "dog.h5")
        
        self.model_path = model_path
        
        # Load the model
        self.model = self._load_model()
    
    def _load_model(self):
        """Load the EfficientNet-B0 Keras model with trained weights"""
        try:
            # Load the trained model
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found at: {self.model_path}")
            
            model = tf.keras.models.load_model(self.model_path)
            
            print(f"✅ Dog emotion model loaded successfully from: {self.model_path}")
            return model
            
        except Exception as e:
            raise Exception(f"Error loading model: {str(e)}")
    
    def _preprocess_image(self, img):
        """
        Preprocess image for EfficientNet-B0
        
        Args:
            img: PIL Image
            
        Returns:
            Preprocessed numpy array
        """
        # Resize image
        img = img.resize((self.img_size, self.img_size))
        
        # Convert to array
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        
        # Add batch dimension
        img_array = tf.expand_dims(img_array, 0)
        
        # Preprocess for EfficientNet
        img_array = tf.keras.applications.efficientnet.preprocess_input(img_array)
        
        return img_array
    
    def predict(self, image_path):
        """
        Predict emotion from a dog image file
        
        Args:
            image_path (str): Path to the dog image file
            
        Returns:
            dict: Contains predicted emotion and confidence scores
        """
        try:
            # Load and preprocess the image
            img = Image.open(image_path).convert("RGB")
            img_array = self._preprocess_image(img)
            
            # Make prediction
            predictions = self.model.predict(img_array, verbose=0)
            class_id = np.argmax(predictions[0])
            confidence = float(np.max(predictions[0]))
            
            # Get all class probabilities
            all_probabilities = {
                self.classes[i]: float(predictions[0][i])
                for i in range(len(self.classes))
            }
            
            return {
                "success": True,
                "emotion": self.classes[class_id],
                "confidence": confidence,
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
            # Load image from bytes
            img = Image.open(BytesIO(image_bytes)).convert("RGB")
            img_array = self._preprocess_image(img)
            
            # Make prediction
            predictions = self.model.predict(img_array, verbose=0)
            class_id = np.argmax(predictions[0])
            confidence = float(np.max(predictions[0]))
            
            # Get all class probabilities
            all_probabilities = {
                self.classes[i]: float(predictions[0][i])
                for i in range(len(self.classes))
            }
            
            return {
                "success": True,
                "emotion": self.classes[class_id],
                "confidence": confidence,
                "all_probabilities": all_probabilities
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Global instance (singleton pattern)
_detector_instance = None


def get_dog_emotion_detector():
    """
    Get or create the global dog emotion detector instance
    
    Returns:
        DogEmotionDetector: Singleton instance
    """
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = DogEmotionDetector()
    return _detector_instance
