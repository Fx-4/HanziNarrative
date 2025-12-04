import psycopg2

try:
    conn = psycopg2.connect(
        dbname="hanzinarrative",
        user="hanzinarrative",
        password="hanzinarrative_dev",
        host="localhost"
    )
    cur = conn.cursor()

    # First, list all tables
    cur.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
    """)
    print("\n=== Tables in Database ===")
    tables = cur.fetchall()
    for table in tables:
        print(f"- {table[0]}")

    # Check columns in hanzi_words
    cur.execute("""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'hanzi_words'
    """)
    print("\n=== Columns in hanzi_words ===")
    columns = cur.fetchall()
    for col, dtype in columns:
        print(f"- {col}: {dtype}")

    # Get count by hsk_level
    cur.execute("""
        SELECT hsk_level, COUNT(*)
        FROM hanzi_words
        GROUP BY hsk_level
        ORDER BY hsk_level
    """)

    print("\n=== Jumlah Vocabulary per Level ===")
    results = cur.fetchall()
    for level, count in results:
        print(f"HSK {level}: {count} kata")

    # Get total
    cur.execute("SELECT COUNT(*) FROM hanzi_words")
    total = cur.fetchone()[0]
    print(f"\nTotal: {total} kata")

    # Expected counts for each HSK level
    expected = {
        1: 150,
        2: 150,
        3: 300,
        4: 600,
        5: 1300,
        6: 2500
    }

    print("\n=== Status Kelengkapan ===")
    for level, count in results:
        exp = expected.get(level, "?")
        if isinstance(exp, int):
            percentage = (count / exp) * 100
            status = "[OK] Lengkap" if count >= exp else f"[!] {percentage:.1f}%"
        else:
            status = "?"
        print(f"HSK {level}: {status}")

    cur.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")
