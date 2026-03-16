from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
import os
import base64

BASE_URL = os.getenv("TFY_BASE_URL")
TFY_API_KEY = os.getenv("TFY_API_KEY")
IMAGE_MODEL = os.getenv("IMAGE_EDIT_MODEL")
INPUT_FILE = "./outputs/image_generation_output.png"
OUTPUT_FILE = "./outputs/image_edit_output.png"

# Configure OpenAI client with TrueFoundry settings
client = OpenAI(
    api_key=TFY_API_KEY,
    base_url=f"https://{BASE_URL}/api/llm",
)

response = client.images.edit(
    model=IMAGE_MODEL,
    image=[
        open(INPUT_FILE, "rb"),  # First source image
    ],
    prompt="Replace the background with a beach scene and add palm trees on both sides",
    # mask=open("mask.png", "rb")    # Optional mask to specify edit areas
)

image_base64 = response.data[0].b64_json
image_bytes = base64.b64decode(image_base64)

# Save the image to a file
with open(OUTPUT_FILE, "wb") as f:
    f.write(image_bytes)