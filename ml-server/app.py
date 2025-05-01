from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import os
import torch
import torchvision.transforms as transforms
from torch.nn import functional as F
from torchvision.models import resnet50

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["OPTIONS", "GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Categories matching your frontend
CATEGORIES = [
    "Card", "Headphone", "Key", "Keyboard", "Lapcharger",
    "Laptop", "Mouse", "Smartphone", "Unknown", "Wallets", "backpack"
]

# Load your model
MODEL_PATH = 'model/best_model.pth'
model = None
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def load_ml_model():
    global model
    if model is None and os.path.exists(MODEL_PATH):
        try:
            # Initialize the model architecture
            model = resnet50(pretrained=False)  # Adjust number of classes if needed
            model.fc = torch.nn.Linear(model.fc.in_features, len(CATEGORIES))
            
            # Load the state dictionary
            state_dict = torch.load(MODEL_PATH, map_location=device)
            model.load_state_dict(state_dict)
            model.to(device)
            model.eval()  # Set to evaluation mode
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            model = None

# Define image transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                       std=[0.229, 0.224, 0.225])
])

def preprocess_image(image):
    img = Image.open(image).convert('RGB')
    img_tensor = transform(img)
    img_tensor = img_tensor.unsqueeze(0)  # Add batch dimension
    return img_tensor

@app.route('/upload-found-item', methods=['POST'])
def predict_category():
    print("Received request to /upload-found-item")
    print("Request files:", request.files)
    print("Request files['image']:", request.files['file'] )
    if 'file' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    try:
        image_file = request.files['file']
        img_tensor = preprocess_image(image_file)
        
        # Load model if not loaded
        load_ml_model()
        
        if model is None:
            # If model is not available, return Unknown category
            return jsonify({'category': 'Unknown'})
        
        # Move tensor to the same device as model
        img_tensor = img_tensor.to(device)
        
        # Make prediction
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = F.softmax(outputs, dim=1)
            predicted_class = torch.argmax(probabilities[0]).item()
            confidence = probabilities[0][predicted_class].item()
        
        # Map to category name
        predicted_category = CATEGORIES[predicted_class]
        
        return jsonify({
            'category': predicted_category,
            'confidence': float(confidence)
        })

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Create model directory if it doesn't exist
    os.makedirs('model', exist_ok=True)
    app.run(port=5001, debug=True)