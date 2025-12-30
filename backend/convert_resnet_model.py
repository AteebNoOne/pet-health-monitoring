import torch
import torch.nn as nn
from torchvision import models
import os
import pickle

def load_legacy_directory_model(directory):
    print(f"Loading legacy model from directory: {directory}")
    data_pkl = os.path.join(directory, "data.pkl")
    data_dir = os.path.join(directory, "data")
    
    if not os.path.exists(data_pkl):
        raise FileNotFoundError(f"Missing data.pkl in {directory}")
    if not os.path.exists(data_dir):
        raise FileNotFoundError(f"Missing data directory in {directory}")
        
    class CustomUnpickler(pickle.Unpickler):
        def find_class(self, module, name):
            return super().find_class(module, name)
        
        def persistent_load(self, saved_id):
            if isinstance(saved_id, tuple) and saved_id[0] == 'storage':
                # ('storage', type, key, location, size)
                storage_type, key, location, size = saved_id[1], saved_id[2], saved_id[3], saved_id[4]
                storage_path = os.path.join(data_dir, str(key))
                
                type_map = {
                    'FloatStorage': torch.FloatStorage,
                    'LongStorage': torch.LongStorage,
                    'IntStorage': torch.IntStorage,
                    'DoubleStorage': torch.DoubleStorage,
                    'ByteStorage': torch.ByteStorage,
                    'BoolStorage': torch.BoolStorage,
                    # 'HalfStorage': torch.HalfStorage, # Often requires special handling or CUDA
                    'CharStorage': torch.CharStorage,
                    'ShortStorage': torch.ShortStorage
                }
                
                if not isinstance(storage_type, str):
                    storage_type = storage_type.__name__
                
                cls = type_map.get(storage_type)
                if cls is None:
                    try: 
                        cls = getattr(torch, storage_type)
                    except AttributeError: 
                        raise ValueError(f"Unknown storage type: {storage_type}")

                # Create storage from file
                return cls.from_file(storage_path, shared=False, size=size)
            return None

    with open(data_pkl, 'rb') as f:
        return CustomUnpickler(f).load()

# Main setup
model_dir = r"d:\IU Fyps\ai-pet-monitoring-app\ai\CAT\model"
output_file = r"d:\IU Fyps\ai-pet-monitoring-app\backend\app\trained\cat_resnet18.pth"

try:
    print("Beginning conversion...")
    state_dict = load_legacy_directory_model(model_dir)
    print("State dict loaded successfully.")
    
    print("Creating ResNet18 model...")
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 3)
    
    print("Loading weights...")
    model.load_state_dict(state_dict)
    
    print(f"Saving to {output_file}...")
    torch.save(model.state_dict(), output_file)
    print("✅ Conversion complete!")
    
except Exception as e:
    print(f"❌ Failed: {e}")
    import traceback
    traceback.print_exc()
