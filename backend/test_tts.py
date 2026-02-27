import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, 'd:/uii/belajar mandiri/learn-HSK/backend')

import os
from google.cloud import texttospeech
from google.oauth2 import service_account

CREDS_PATH = os.path.abspath('d:/uii/belajar mandiri/learn-HSK/backend/google-credentials.json')

credentials = service_account.Credentials.from_service_account_file(
    CREDS_PATH,
    scopes=["https://www.googleapis.com/auth/cloud-platform"],
)
client = texttospeech.TextToSpeechClient(credentials=credentials)

test_cases = [
    ("cmn-CN-Wavenet-A",        "cmn-CN", "你好"),
    ("cmn-CN-Wavenet-B",        "cmn-CN", "学习"),
    ("cmn-CN-Wavenet-C",        "cmn-CN", "汉字"),
    ("cmn-CN-Wavenet-D",        "cmn-CN", "中文"),
    ("cmn-CN-Chirp3-HD-Aoede",  "cmn-CN", "你好"),
    ("cmn-CN-Chirp3-HD-Achird", "cmn-CN", "你好"),
    ("cmn-CN-Standard-A",       "cmn-CN", "你好"),
]

out_dir = 'd:/uii/belajar mandiri/learn-HSK/backend/tts_test_output'
os.makedirs(out_dir, exist_ok=True)

for voice_name, lang, text in test_cases:
    try:
        synthesis_input = texttospeech.SynthesisInput(text=text)
        voice = texttospeech.VoiceSelectionParams(language_code=lang, name=voice_name)
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=1.0,
        )
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
        out_path = f"{out_dir}/{voice_name}.mp3"
        with open(out_path, 'wb') as f:
            f.write(response.audio_content)
        print(f"OK   {voice_name} | {len(response.audio_content)} bytes")
    except Exception as e:
        print(f"ERR  {voice_name} | {str(e)[:80]}")

print("\nDone.")
