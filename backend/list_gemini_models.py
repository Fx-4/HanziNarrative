"""
List available Gemini models
"""
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

print("\nAvailable Gemini Models:")
print("=" * 60)

try:
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"\nModel: {model.name}")
            print(f"Display Name: {model.display_name}")
            print(f"Description: {model.description}")
            print(f"Methods: {', '.join(model.supported_generation_methods)}")
except Exception as e:
    print(f"Error listing models: {e}")
