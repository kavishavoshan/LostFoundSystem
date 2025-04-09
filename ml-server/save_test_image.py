from PIL import Image
import io

# Create a new image (this is just a placeholder - we'll replace it with the actual laptop image)
img = Image.new('RGB', (800, 600), color='white')
img.save('test.jpg', 'JPEG')
print("Test image saved as test.jpg") 