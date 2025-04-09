import requests
import os
from PIL import Image
import io

def download_and_save_image(url, save_path):
    """
    Download an image from a URL and save it locally.
    
    Args:
        url (str): URL of the image
        save_path (str): Path where to save the image
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        with open(save_path, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"Error downloading image: {str(e)}")
        return False

def test_image_upload(image_path):
    """
    Test the image upload endpoint with a given image.
    
    Args:
        image_path (str): Path to the image file to upload
    """
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return
    
    # Open and prepare the image
    with open(image_path, 'rb') as img_file:
        files = {'image': ('test.jpg', img_file, 'image/jpeg')}
        
        try:
            # Send POST request to the server
            response = requests.post('http://127.0.0.1:5000/upload-found-item', files=files)
            
            # Print the response
            print("\nResponse Status Code:", response.status_code)
            print("\nResponse Content:")
            print(response.json())
            
        except requests.exceptions.ConnectionError:
            print("Error: Could not connect to the server. Make sure the server is running.")
        except Exception as e:
            print(f"Error occurred: {str(e)}")

if __name__ == "__main__":
    # Sample laptop image URL (replace with your actual image URL)
    image_url = "https://example.com/laptop.jpg"  # This is a placeholder
    test_image_path = "test.jpg"
    
    # Try to download and save the image
    if download_and_save_image(image_url, test_image_path):
        test_image_upload(test_image_path)
    else:
        print("Failed to download the image. Please provide a local image file.") 