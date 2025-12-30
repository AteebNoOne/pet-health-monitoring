"""
Cat Emotion Detection Service
Uses EfficientNet-B0 model to predict cat emotions from images
"""

from PIL import Image
import os
import logging
from traceback import format_exc

# Lazy-import placeholders for torch/torchvision to avoid DLL init crashes
_TORCH_IMPORT_ERROR = None
_TORCH = None
_TORCH_NN = None
_TORCH_TRANSFORMS = None

# ==========================
# LOGGING CONFIGURATION
# ==========================
logging.basicConfig(
    level=logging.DEBUG,  # change to INFO in production
    format='[%(levelname)s] %(asctime)s - %(name)s - %(message)s'
)
logger = logging.getLogger("CatEmotionDetector")


class CatEmotionDetector:
    """Service class for detecting cat emotions using EfficientNet-B0"""
    
    def __init__(self, model_path=None):
        logger.debug("Initializing CatEmotionDetector service...")
        
        self.device = "cpu"
        logger.debug(f"Selected device: {self.device}")

        self.classes = ["angry", "happy", "sad"]

        try:
            if model_path is None:
                base_dir = os.path.dirname(os.path.abspath(__file__))
                app_dir = os.path.dirname(base_dir)
                model_path = os.path.join(app_dir, "trained", "cat_resnet18.pth")

            self.model_path = model_path
            logger.debug(f"Model path resolved to: {self.model_path}")

            # model and transforms are created during lazy import in _load_model
            self.model = self._load_model()

        except Exception as e:
            logger.error("❌ Error during initialization")
            logger.debug(format_exc())
            raise e
    
    
    def _load_model(self):
        """Load the ResNet18 model with trained weights"""
        try:
            logger.info(f"Loading model from: {self.model_path}")

            # Lazy import torch/torchvision here so the module can be imported
            # without triggering Windows DLL initialization failures.
            global _TORCH_IMPORT_ERROR, _TORCH, _TORCH_NN, _TORCH_TRANSFORMS
            try:
                import torch as _t
                import torch.nn as _nn
                from torchvision import models, transforms as _transforms
                _TORCH = _t
                _TORCH_NN = _nn
                _TORCH_TRANSFORMS = _transforms
            except Exception as imp_err:
                _TORCH_IMPORT_ERROR = imp_err
                logger.critical(f"PyTorch import failed: {imp_err}")
                raise

            # Build model
            model = models.resnet18(weights=None)
            model.fc = _TORCH_NN.Linear(model.fc.in_features, 3)

            # Set device now that torch is imported
            self.device = "cuda" if _TORCH.cuda.is_available() else "cpu"
            logger.debug(f"Resolved device after torch import: {self.device}")

            # Create transforms
            self.transform = _TORCH_TRANSFORMS.Compose([
                _TORCH_TRANSFORMS.Resize((224, 224)),
                _TORCH_TRANSFORMS.ToTensor(),
            ])

            if not os.path.exists(self.model_path):
                logger.critical(f"Model file does not exist: {self.model_path}")
                raise FileNotFoundError(f"Model missing at: {self.model_path}")

            logger.debug("Loading model state_dict...")
            state_dict = _TORCH.load(self.model_path, map_location=self.device)
            model.load_state_dict(state_dict)

            model.eval()
            model.to(self.device)

            logger.info("Model loaded successfully ✔")
            return model
        
        except Exception as e:
            logger.error("❌ Failed to load model.")
            logger.debug(format_exc())
            raise e
    
    
    def predict(self, image_path):
        logger.debug(f"Starting prediction for image: {image_path}")
        
        if not os.path.exists(image_path):
            logger.error(f"Image path does not exist: {image_path}")
            return {"success": False, "error": "Image file not found"}
        
        try:
            img = Image.open(image_path).convert("RGB")
            logger.debug("Image loaded successfully.")
            
            img_tensor = self.transform(img).unsqueeze(0).to(self.device)
            logger.debug("Image preprocessing completed.")
            
            with _TORCH.no_grad():
                outputs = self.model(img_tensor)

            probabilities = _TORCH.softmax(outputs, dim=1)
            predicted_idx = _TORCH.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][predicted_idx].item()
            
            logger.info(
                f"Prediction completed - Emotion: {self.classes[predicted_idx]}, "
                f"Confidence: {confidence:.4f}"
            )
            
            all_probabilities = {
                self.classes[i]: float(probabilities[0][i].item())
                for i in range(len(self.classes))
            }
            
            return {
                "success": True,
                "emotion": self.classes[predicted_idx],
                "confidence": float(confidence),
                "all_probabilities": all_probabilities
            }
        
        except Exception as e:
            logger.error("❌ Prediction failed due to an exception.")
            logger.debug(format_exc())
            return {"success": False, "error": str(e)}
    
    
    def predict_from_bytes(self, image_bytes):
        logger.debug("Starting prediction from image bytes stream...")
        
        try:
            from io import BytesIO
            
            img = Image.open(BytesIO(image_bytes)).convert("RGB")
            img_tensor = self.transform(img).unsqueeze(0).to(self.device)

            with _TORCH.no_grad():
                outputs = self.model(img_tensor)

            probabilities = _TORCH.softmax(outputs, dim=1)
            predicted_idx = _TORCH.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][predicted_idx].item()
            
            logger.info(f"Predicted from bytes: {self.classes[predicted_idx]} ({confidence:.4f})")
            
            all_probabilities = {
                self.classes[i]: float(probabilities[0][i].item())
                for i in range(len(self.classes))
            }
            
            return {
                "success": True,
                "emotion": self.classes[predicted_idx],
                "confidence": float(confidence),
                "all_probabilities": all_probabilities
            }
        
        except Exception as e:
            logger.error("❌ Error predicting from bytes")
            logger.debug(format_exc())
            return {"success": False, "error": str(e)}


# Singleton pattern
_detector_instance = None

def get_cat_emotion_detector():
    global _detector_instance
    if _detector_instance is None:
        logger.debug("Creating new global CatEmotionDetector instance.")
        try:
            _detector_instance = CatEmotionDetector()
        except Exception as e:
            # If initialization failed (e.g., PyTorch DLL error), return a
            # dummy detector that surfaces the error in API responses.
            err = str(e)
            if _TORCH_IMPORT_ERROR is not None:
                err = f"PyTorch import error: {_TORCH_IMPORT_ERROR}"
            logger.error(f"Falling back to DummyDetector due to: {err}")
            class DummyDetector:
                def __init__(self, message):
                    self.device = "cpu"
                    self.classes = ["angry", "happy", "sad"]
                    self._error = message

                def predict(self, image_path):
                    return {"success": False, "error": f"Model not available: {self._error}"}

                def predict_from_bytes(self, image_bytes):
                    return {"success": False, "error": f"Model not available: {self._error}"}

            _detector_instance = DummyDetector(err)
    return _detector_instance
