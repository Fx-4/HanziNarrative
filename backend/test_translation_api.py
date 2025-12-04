import requests

r = requests.get('http://localhost:8000/stories')
stories = r.json()

print(f'\nTotal stories: {len(stories)}')

if stories:
    s = stories[0]
    print(f"First story ID: {s['id']}")
    print(f"Has translation field: {'english_translation' in s}")

    if 'english_translation' in s and s['english_translation']:
        preview = s['english_translation'][:100]
        print(f"Translation preview: {preview}...")
        print("\n✅ SUCCESS! English translations are working!")
    else:
        print("\n❌ No translation found")
