import httpx
import os
from elevenlabs import ElevenLabs
from dotenv import load_dotenv
load_dotenv()

BASE_URL = os.getenv("TFY_BASE_URL")
TFY_API_KEY = os.getenv("TFY_API_KEY")
MODEL = os.getenv("TTS_MODEL")
OUTPUT_FILE = "./outputs/speech_output.mp3"

client = ElevenLabs(
    api_key="dummy",
    base_url=f"https://{BASE_URL}/api/llm/tts/{MODEL.split("/")[0]}",
    httpx_client=httpx.Client(
        headers={"x-tfy-api-key": TFY_API_KEY},
    ),
)

response = client.text_to_speech.convert(
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    output_format="mp3_44100_128",
    text="The first move is what sets everything in motion.",
    model_id=MODEL.split("/")[-1],  # actual model id
)

with open(OUTPUT_FILE, "wb") as f:
    for chunk in response:
        f.write(chunk)

print(OUTPUT_FILE)