"""
Test Gemini AI sentence validation
"""
import asyncio
import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.services.gemini_service import validate_chinese_sentence, test_gemini_connection


async def test_validation():
    """Test sentence validation with various examples"""

    test_sentences = [
        {
            "sentence": "我爱你",
            "expected": "I love you",
            "should_be": "correct"
        },
        {
            "sentence": "你好吗",
            "expected": "How are you",
            "should_be": "correct"
        },
        {
            "sentence": "我喜欢吃饭",
            "expected": "I like to eat",
            "should_be": "correct"
        },
        {
            "sentence": "吃我饭喜欢",  # Wrong order
            "expected": "I like to eat",
            "should_be": "incorrect"
        },
    ]

    print("=" * 70)
    print("Testing Gemini AI Sentence Validation")
    print("=" * 70)
    print()

    # First test connection
    print("Testing API connection...")
    connection_result = await test_gemini_connection()
    if not connection_result:
        print("FAILED: Could not connect to Gemini API")
        print("Please check:")
        print("1. API key is correct in .env file")
        print("2. You have API quota remaining")
        print("3. Internet connection is working")
        return False
    print("SUCCESS: Gemini API connection working!\n")

    # Test each sentence
    all_passed = True
    for i, test in enumerate(test_sentences, 1):
        print(f"\nTest {i}: {test['sentence']}")
        print(f"Expected meaning: {test['expected']}")
        print(f"Should be: {test['should_be']}")
        print("-" * 70)

        try:
            result = await validate_chinese_sentence(
                sentence=test['sentence'],
                expected_meaning=test['expected'],
                hsk_level=1
            )

            print(f"Is correct: {result.is_correct}")
            print(f"Score: {result.score}/100")
            print(f"Feedback: {result.feedback}")

            if result.corrections:
                print(f"Corrections: {', '.join(result.corrections)}")
            if result.grammar_issues:
                print(f"Grammar issues: {', '.join(result.grammar_issues)}")
            if result.suggestions:
                print(f"Suggestions: {', '.join(result.suggestions)}")

            # Verify result matches expectation
            if test['should_be'] == 'correct' and not result.is_correct:
                print("⚠️  WARNING: Expected correct but got incorrect")
                all_passed = False
            elif test['should_be'] == 'incorrect' and result.is_correct:
                print("⚠️  WARNING: Expected incorrect but got correct")
                all_passed = False
            else:
                print("✓ Test passed")

        except Exception as e:
            print(f"ERROR: {str(e)}")
            all_passed = False

        print()

    print("=" * 70)
    if all_passed:
        print("All tests PASSED! Gemini AI is working correctly.")
    else:
        print("Some tests FAILED. Check the output above.")
    print("=" * 70)

    return all_passed


if __name__ == "__main__":
    success = asyncio.run(test_validation())
    sys.exit(0 if success else 1)
