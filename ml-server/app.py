from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import os
import torch
import torchvision.transforms as transforms
from torch.nn import functional as F
from torchvision.models import resnet50
from pymongo import MongoClient
import certifi
import faiss
import numpy as np
import torch
from PIL import Image
import requests
import base64
import io

# Embedding search service
API_URL = "http://6b60-34-143-174-25.ngrok-free.app/encode"
def encode_image_api(image_data):
    try:
        # Handle base64 image data
        if isinstance(image_data, str):
            if image_data.startswith('data:image'):
                # Remove data URL prefix
                image_data = image_data.split(',')[1]
            
            try:
                # Clean and pad base64 string
                image_data = image_data.strip()
                # Remove any non-base64 characters
                image_data = ''.join(c for c in image_data if c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=')
                padding = 4 - (len(image_data) % 4)
                if padding != 4:
                    image_data += '=' * padding
                # Decode base64 to bytes
                image_bytes = base64.b64decode(image_data)
            except Exception as e:
                print(f"Base64 decode error: {e}")
                return None
        else:
            # Assume it's already bytes
            image_bytes = image_data

        # Convert bytes to PIL Image to verify it's valid
        try:
            img = Image.open(io.BytesIO(image_bytes))
            # Convert to RGB mode if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            # Save to bytes with proper format
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            image_bytes = img_byte_arr.getvalue()
        except Exception as e:
            print(f"Image processing error: {e}")
            return None

        # Create multipart form data
        files = {
            'image': ('image.png', image_bytes, 'image/png')
        }

        # Make request with increased timeout
        response = requests.post(
            API_URL,
            files=files,
            timeout=30,
            headers={'Accept': 'application/json'}
        )

        if response.status_code == 200:
            try:
                data = response.json()
                if 'embedding' in data:
                    return np.array(data['embedding'])
                print(f"No embedding in response. Response: {data}")
                return None
            except ValueError as e:
                print(f"JSON parse error: {e}")
                return None
        else:
            print(f"Server error {response.status_code}: {response.text[:200]}")
            return None

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return None

def perform_similarity_search(item_with_image_to_search, array_of_items):
    found_embeddings = []
    found_items = []  # Store items for later mapping
    
    # Encode the image to search
    try:
        for item in array_of_items:
            if item["image"]:  # Check if image exists
                image_path = item["image"]
                embedding = encode_image_api(image_path)  # Use API for encoding

                if embedding is not None:  # Check for successful encoding
                    found_embeddings.append(embedding)
                    found_items.append(item)  # Store corresponding item
        
        if not found_embeddings:
            return []
            
        # Stack all embeddings
        found_embeddings = np.vstack(found_embeddings)
        image_to_search_embedding = encode_image_api(item_with_image_to_search["image"])
        
        # Reshape search embedding to match FAISS requirements
        image_to_search_embedding = image_to_search_embedding.reshape(1, -1)

        # 512 = dimension of CLIP embeddings
        index = faiss.IndexFlatL2(512)
        index.add(found_embeddings)

        # Search for top 5 similar images
        D, I = index.search(image_to_search_embedding, k=5)
        
        # Create matches array with similarity scores
        matches = []
        for distance, idx in zip(D[0], I[0]):
            if idx < len(found_items):  # Ensure valid index
                match = {
                    'search_item': item_with_image_to_search,
                    'found_item': found_items[idx],
                    'similarity_score': float(1 / (1 + distance))  # Convert distance to similarity score
                }
                matches.append(match)
        
        # Sort by similarity score and return top matches
        matches.sort(key=lambda x: x['similarity_score'], reverse=True)
        return matches

    except Exception as e:
        print(f"Error in similarity search: {str(e)}")
        return []

# DB connection
uri = "mongodb+srv://reclaim703:UBahmiQ4OjoXqnNS@cluster0.f1uuqyo.mongodb.net/lostfound?retryWrites=true&w=majority"
client = MongoClient(
    uri,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=30000,  # Increased timeout
    connectTimeoutMS=20000,
    socketTimeoutMS=20000,
    maxPoolSize=50,
    retryWrites=True,
    readPreference='secondaryPreferred'  # Allow reading from secondary nodes
)

# Flask service
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

def get_all_items_from_mongodb():
    lost_items_collection = database.get_collection("lostitems")
    found_items_collection = database.get_collection("founditems")

    all_lost_items = lost_items_collection.find({})
    all_found_items = found_items_collection.find({})
    
    lost_items_list = []
    found_items_list = []
    
    for item in all_lost_items:
        item_dict = {
            'id': str(item.get('_id')),
            'description': item.get('description'),
            'location': item.get('location'),
            'contactNumber': item.get('contactNumber'),
            'category': item.get('category'),
            'image': item.get('image'),
            'status': item.get('status'),
            'userId': str(item.get('userId')),
            'createdAt': item.get('createdAt'),
            'updatedAt': item.get('updatedAt')
        }
        lost_items_list.append(item_dict)

    for item in all_found_items:
        item_dict = {
            'id': str(item.get('_id')),
            'description': item.get('description'),
            'location': item.get('location'),
            'contactNumber': item.get('contactNumber'),
            'category': item.get('category'),
            'image': item.get('image'),
            'status': item.get('status'),
            'userId': str(item.get('userId')),
            'createdAt': item.get('createdAt'),
            'updatedAt': item.get('updatedAt')
        }
        found_items_list.append(item_dict)

    return lost_items_list, found_items_list

@app.route('/search', methods=['GET'])
def similarity_search_lost_and_found_items():
    # Get all the lost and found items from mongodb
    lost_items, found_items = get_all_items_from_mongodb()
    all_results = []

    print(f"Found {len(lost_items)} lost items and {len(found_items)} found items.")

    # Iterate through each lost item with progress bar
    for lost_item in lost_items:
        # Perform faiss similarity search for the lost item against the found items
        results = perform_similarity_search(lost_item, found_items)
        for match in results:
            print(f"Lost item: {match['search_item']['description']}")
            print(f"Found item: {match['found_item']['description']}")
            print(f"Similarity score: {match['similarity_score']:.2f}")
        
        all_results.append(results)

    return all_results

if __name__ == '__main__':
    try:
        # First connect to the mongodb database
        database = client.get_database("lostfound")
        print("MongoDB connection successful")

        # Create model directory if it doesn't exist
        os.makedirs('model', exist_ok=True)
        print("Model directory created")

        # Run the Flask app
        app.run(port=5001, debug=True)

    except Exception as e:
        print(f"MongoDB connection failed: {str(e)}")
