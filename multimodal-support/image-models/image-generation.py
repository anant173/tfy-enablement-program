from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
import base64
import os

TFY_BASE_URL = os.getenv("TFY_BASE_URL")
TFY_API_KEY = os.getenv("TFY_API_KEY")
IMAGE_MODEL = os.getenv("IMAGE_GENERATION_MODEL")
OUTPUT_FILE = "./outputs/image_generation_output.png"

prompt = "A beautiful sunset over mountains."

client = OpenAI(
    api_key=TFY_API_KEY,
    base_url=f"https://{TFY_BASE_URL}",
)

try:
    response = client.images.generate(
        model=IMAGE_MODEL,
        prompt=prompt,
        n=1,
        size="1024x1024"
    )

    if hasattr(response.data[0], 'url') and response.data[0].url:
        print(f"Image URL: {response.data[0].url}")

    if hasattr(response.data[0], 'b64_json') and response.data[0].b64_json:
        image_bytes = base64.b64decode(response.data[0].b64_json)
        with open(OUTPUT_FILE, "wb") as f:
            f.write(image_bytes)
        print(f"Image saved at {OUTPUT_FILE}")

except Exception as e:
    print(f"Error: {e}")
