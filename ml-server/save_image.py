import base64
import requests
from PIL import Image
import io

# URL of the laptop image
image_url = "https://raw.githubusercontent.com/apple/swift/main/docs/images/swift-og-image.jpg"  # This is a placeholder URL

try:
    # Download the image
    response = requests.get(image_url)
    response.raise_for_status()
    
    # Save the image
    with open('test.jpg', 'wb') as f:
        f.write(response.content)
    
    print("Image saved successfully as test.jpg")
    
except Exception as e:
    print(f"Error saving image: {str(e)}") 