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
        "origins": "*",
        "methods": ["POST", "OPTIONS"],
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
        model = resnet50(pretrained=False)
        model.fc = torch.nn.Linear(2048, len(CATEGORIES))
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model.to(device)
        model.eval()
        print("Model loaded successfully")
    return model

# Define image transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                       std=[0.229, 0.224, 0.225])
])

def preprocess_image(image_file):
    img = Image.open(image_file).convert('RGB')
    img_tensor = transform(img)
    return img_tensor.unsqueeze(0)

@app.route('/predict', methods=['POST'])
def predict_category():
    print("Received request to /predict")
    print("Request files:", request.files)
    
    if 'image' not in request.files:
        print("No image found in request")
        return jsonify({'error': 'No image provided', 'predicted_category': 'Unknown'}), 400

    try:
        image_file = request.files['image']
        print("Processing image:", image_file.filename)
        img_tensor = preprocess_image(image_file)
        
        # Load model if not loaded
        load_ml_model()
        
        if model is None:
            print("Model not available")
            return jsonify({'predicted_category': 'Unknown'})
        
        # Move tensor to the same device as model
        img_tensor = img_tensor.to(device)
        
        # Make prediction
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = F.softmax(outputs, dim=1)
            predicted_class = torch.argmax(probabilities[0]).item()
            confidence = probabilities[0][predicted_class].item()
        
        predicted_category = CATEGORIES[predicted_class]
        print(f"Predicted category: {predicted_category} with confidence: {confidence:.2f}")
        
        return jsonify({
            'predicted_category': predicted_category,
            'confidence': float(confidence)
        })
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({'error': str(e), 'predicted_category': 'Unknown'}), 500

if __name__ == '__main__':
    # Create model directory if it doesn't exist
    os.makedirs('model', exist_ok=True)
    app.run(port=5001, debug=True)