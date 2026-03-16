"""
OpenAI Realtime API - Audio Streaming
Reference: https://github.com/openai/openai-python/blob/main/examples/realtime/audio_util.py

Requires Python 3.11+
pip install "openai[realtime]" numpy sounddevice
"""
import base64
import asyncio
import threading
import os

import numpy as np
import sounddevice as sd

from openai import AsyncOpenAI
from openai.resources.realtime.realtime import AsyncRealtimeConnection

from dotenv import load_dotenv
load_dotenv()

SAMPLE_RATE = 24000
CHANNELS = 1
CHUNK_LENGTH_S = 0.05

BASE_URL = os.getenv("TFY_BASE_URL")
TFY_API_KEY = os.getenv("TFY_API_KEY")
MODEL = os.getenv("STS_MODEL")

client = AsyncOpenAI(
    api_key=TFY_API_KEY,
    websocket_base_url=f"wss://{BASE_URL}/api/llm/live/{MODEL.split("/")[0]}",
)

class AudioPlayerAsync:
    def __init__(self):
        self.queue = []
        self.lock = threading.Lock()
        self.stream = sd.OutputStream(
            callback=self._callback, samplerate=SAMPLE_RATE,
            channels=CHANNELS, dtype=np.int16,
            blocksize=int(CHUNK_LENGTH_S * SAMPLE_RATE),
        )
        self.playing = False

    def _callback(self, outdata, frames, time, status):
        with self.lock:
            data = np.empty(0, dtype=np.int16)
            while len(data) < frames and self.queue:
                item = self.queue.pop(0)
                needed = frames - len(data)
                data = np.concatenate((data, item[:needed]))
                if len(item) > needed:
                    self.queue.insert(0, item[needed:])
            if len(data) < frames:
                data = np.concatenate((data, np.zeros(frames - len(data), dtype=np.int16)))
        outdata[:] = data.reshape(-1, 1)

    def add_data(self, data: bytes):
        with self.lock:
            self.queue.append(np.frombuffer(data, dtype=np.int16))
            if not self.playing:
                self.playing = True
                self.stream.start()

    def stop(self):
        self.playing = False
        self.stream.stop()
        with self.lock:
            self.queue = []

    def terminate(self):
        self.stream.close()


async def send_mic_audio(connection: AsyncRealtimeConnection):
    read_size = int(SAMPLE_RATE * 0.02)
    stream = sd.InputStream(channels=CHANNELS, samplerate=SAMPLE_RATE, dtype="int16")
    stream.start()
    try:
        while True:
            if stream.read_available < read_size:
                await asyncio.sleep(0)
                continue
            data, _ = stream.read(read_size)
            await connection.input_audio_buffer.append(
                audio=base64.b64encode(data).decode("utf-8"),
            )
            await asyncio.sleep(0)
    except KeyboardInterrupt:
        pass
    finally:
        stream.stop()
        stream.close()


async def main():
    player = AudioPlayerAsync()
    try:
        async with client.realtime.connect(model=MODEL.split("/")[-1]) as connection:
            print("Connected!")

            await connection.session.update(session={
                "type": "realtime",
                "output_modalities": ["audio"],
                "audio": {
                    "input": {
                        "turn_detection": {"type": "server_vad"}
                    },
                    "output": {
                        "voice": "alloy"
                    }
                }
            })

            async def receive_events():
                async for event in connection:
                    if event.type == "response.output_audio.delta":
                        player.add_data(base64.b64decode(event.delta))
                    elif event.type == "response.output_audio_transcript.delta":
                        print(event.delta, end="", flush=True)
                    elif event.type == "response.output_audio_transcript.done":
                        print()
                    elif event.type == "input_audio_buffer.speech_started":
                        player.stop()
                    elif event.type == "error":
                        print(f"\n[ERROR] {event}")

            print("Start speaking! (Ctrl+C to stop)\n")
            async with asyncio.TaskGroup() as tg:
                tg.create_task(send_mic_audio(connection))
                tg.create_task(receive_events())

    except Exception as e:
        print(f"Error: {e}")
    finally:
        player.terminate()

asyncio.run(main())