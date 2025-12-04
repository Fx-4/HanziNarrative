import psycopg2
import sys
import io

# Set UTF-8 encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    conn = psycopg2.connect(
        dbname="hanzinarrative",
        user="hanzinarrative",
        password="hanzinarrative_dev",
        host="localhost"
    )
    cur = conn.cursor()

    # Get HSK 3 words
    print("\n=== HSK 3 Words (Total: 293) ===")
    cur.execute("""
        SELECT simplified, pinyin, english
        FROM hanzi_words
        WHERE hsk_level = 3
        ORDER BY simplified
    """)
    hsk3_words = cur.fetchall()
    print(f"Total HSK 3: {len(hsk3_words)} words\n")

    # Show first 10 and last 10
    print("First 10:")
    for word in hsk3_words[:10]:
        print(f"  {word[0]} ({word[1]}) - {word[2]}")
    print(f"\n... ({len(hsk3_words) - 20} more words) ...\n")
    print("Last 10:")
    for word in hsk3_words[-10:]:
        print(f"  {word[0]} ({word[1]}) - {word[2]}")

    # Get HSK 4 words
    print("\n\n=== HSK 4 Words (Total: 306) ===")
    cur.execute("""
        SELECT simplified, pinyin, english
        FROM hanzi_words
        WHERE hsk_level = 4
        ORDER BY simplified
    """)
    hsk4_words = cur.fetchall()
    print(f"Total HSK 4: {len(hsk4_words)} words\n")

    # Show first 10 and last 10
    print("First 10:")
    for word in hsk4_words[:10]:
        print(f"  {word[0]} ({word[1]}) - {word[2]}")
    print(f"\n... ({len(hsk4_words) - 20} more words) ...\n")
    print("Last 10:")
    for word in hsk4_words[-10:]:
        print(f"  {word[0]} ({word[1]}) - {word[2]}")

    # Save all to files for reference
    with open('existing_hsk3.txt', 'w', encoding='utf-8') as f:
        for word in hsk3_words:
            f.write(f"{word[0]}\t{word[1]}\t{word[2]}\n")

    with open('existing_hsk4.txt', 'w', encoding='utf-8') as f:
        for word in hsk4_words:
            f.write(f"{word[0]}\t{word[1]}\t{word[2]}\n")

    print("\n\nFiles created:")
    print("- existing_hsk3.txt")
    print("- existing_hsk4.txt")

    cur.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")
