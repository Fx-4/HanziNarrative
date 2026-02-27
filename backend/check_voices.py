import sys
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

voices = client.list_voices()

print("=== Mandarin / Chinese voices available ===\n")
for voice in voices.voices:
    for lang in voice.language_codes:
        if any(x in lang.lower() for x in ['zh', 'cmn', 'yue', 'cn']):
            print(f"Name: {voice.name}")
            print(f"  Language: {lang}")
            print(f"  Gender: {texttospeech.SsmlVoiceGender(voice.ssml_gender).name}")
            print()
