# ML Model Server for Lost & Found System

This server provides the ML model prediction endpoint for the Lost & Found System. It classifies images of items into predefined categories using a PyTorch model.

## Setup Instructions

1. Place your trained model file in the `model` directory:
   ```bash
   ml-server/
   └── model/
       └── best_model.pth  # Your PyTorch model file
   ```

2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the server:
   ```bash
   python app.py
   ```

The server will run on `http://localhost:5000`.

## API Endpoint

### POST /upload-found-item

Upload an image to get category prediction.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: 
  - image: (file) The image to classify

**Response:**
```json
{
    "category": "string",
    "confidence": float
}
```

## Categories

The model classifies items into the following categories:
- Card
- Headphone
- Key
- Keyboard
- Lapcharger
- Laptop
- Mouse
- Smartphone
- Unknown
- Wallets
- backpack

## Model Requirements

The model expects:
- PyTorch model (.pth file)
- Input shape: (1, 3, 224, 224)
- RGB images
- Normalized with ImageNet statistics:
  - mean: [0.485, 0.456, 0.406]
  - std: [0.229, 0.224, 0.225] 