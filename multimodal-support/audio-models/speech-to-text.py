import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

BASE_URL = os.getenv("TFY_BASE_URL")
TFY_API_KEY = os.getenv("TFY_API_KEY")
MODEL = os.getenv("STT_MODEL")
INPUT_FILE = "./outputs/speech_output.mp3"

client = OpenAI(
    api_key=TFY_API_KEY,
    base_url=f"https://{BASE_URL}/api/llm",
)

with open(INPUT_FILE, "rb") as audio_file:
    response = client.audio.transcriptions.create(
        model=MODEL,  # truefoundry model name
        file=audio_file,
    )

print(response)