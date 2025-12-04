"""
Complete HSK 4 vocabulary - Part 2
Adding the remaining words to reach 600 total
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import HanziWord

# Remaining HSK 4 vocabulary (Part 2 - D to Z)
hsk4_part2_words = [
    # Format: (simplified, traditional, pinyin, english, strokes, category, radical)

    # Continuing from D
    ("地道", "地道", "dì dào", "authentic; genuine; tunnel", 6, "adjective", "土"),
    ("地理", "地理", "dì lǐ", "geography", 11, "noun", "土"),
    ("地区", "地區", "dì qū", "area; region", 11, "noun", "土"),
    ("地毯", "地毯", "dì tǎn", "carpet; rug", 12, "noun", "土"),
    ("地位", "地位", "dì wèi", "position; status", 7, "noun", "土"),
    ("地震", "地震", "dì zhèn", "earthquake", 15, "noun", "土"),
    ("地址", "地址", "dì zhǐ", "address", 7, "noun", "土"),
    ("递", "遞", "dì", "to hand over; to pass", 10, "verb", "辶"),
    ("点心", "點心", "diǎn xīn", "light refreshments; dim sum", 4, "noun", "灬"),
    ("电池", "電池", "diàn chí", "battery", 6, "noun", "电"),
    ("电台", "電台", "diàn tái", "radio station", 5, "noun", "电"),
    ("钓", "釣", "diào", "to fish; to angle", 8, "verb", "钅"),
    ("丁", "丁", "dīng", "fourth (in sequence); man; cube", 2, "noun", "一"),
    ("订", "訂", "dìng", "to订购; to订阅", 4, "verb", "讠"),
    ("丢", "丟", "diū", "to lose; to throw", 6, "verb", "丿"),
    ("东西", "東西", "dōng xī", "thing; stuff", 5, "noun", "一"),
    ("动画片", "動畫片", "dòng huà piàn", "animated cartoon", 8, "noun", "力"),
    ("冻", "凍", "dòng", "to freeze", 7, "verb", "冫"),
    ("洞", "洞", "dòng", "cave; hole", 9, "noun", "氵"),
    ("豆腐", "豆腐", "dòu fu", "tofu; bean curd", 7, "noun", "豆"),
    ("逗", "逗", "dòu", "to tease; to play with", 11, "verb", "辶"),
    ("独立", "獨立", "dú lì", "independent; to stand alone", 8, "adjective", "犭"),
    ("独特", "獨特", "dú tè", "unique; distinctive", 10, "adjective", "犭"),
    ("度过", "度過", "dù guò", "to pass; to spend (time)", 12, "verb", "广"),
    ("短信", "短信", "duǎn xìn", "text message; SMS", 9, "noun", "矢"),
    ("堆", "堆", "duī", "pile; heap; to pile up", 11, "noun", "土"),
    ("对比", "對比", "duì bǐ", "to contrast; contrast", 4, "verb", "寸"),
    ("对待", "對待", "duì dài", "to treat; treatment", 9, "verb", "寸"),
    ("对方", "對方", "duì fāng", "the other party", 4, "noun", "寸"),
    ("对手", "對手", "duì shǒu", "opponent; adversary", 4, "noun", "寸"),
    ("对象", "對象", "duì xiàng", "target; boyfriend/girlfriend", 11, "noun", "寸"),
    ("兑换", "兌換", "duì huàn", "to exchange; to convert", 7, "verb", "儿"),
    ("吨", "噸", "dūn", "ton", 7, "measure", "口"),
    ("蹲", "蹲", "dūn", "to squat; to crouch", 19, "verb", "足"),
    ("多亏", "多虧", "duō kuī", "thanks to; luckily", 7, "adverb", "夕"),
    ("多余", "多餘", "duō yú", "surplus; superfluous", 15, "adjective", "夕"),
    ("朵", "朵", "duǒ", "measure word for flowers and clouds", 6, "measure", "木"),
    ("躲藏", "躲藏", "duǒ cáng", "to hide; to conceal oneself", 17, "verb", "身"),
    ("恶劣", "惡劣", "è liè", "bad; vile; nasty", 10, "adjective", "心"),
    ("而", "而", "ér", "and; as well as; but; yet", 6, "conjunction", "而"),
    ("儿童", "兒童", "ér tóng", "children", 12, "noun", "儿"),
    ("耳环", "耳環", "ěr huán", "earring", 6, "noun", "耳"),
    ("发表", "發表", "fā biǎo", "to issue; to publish", 8, "verb", "又"),
    ("发愁", "發愁", "fā chóu", "to worry; to be anxious", 13, "verb", "又"),
    ("发达", "發達", "fā dá", "developed; flourishing", 12, "adjective", "又"),
    ("发抖", "發抖", "fā dǒu", "to tremble; to shiver", 7, "verb", "又"),
    ("发挥", "發揮", "fā huī", "to bring into play; to display", 12, "verb", "又"),
    ("发明", "發明", "fā míng", "to invent; invention", 8, "verb", "又"),
    ("发票", "發票", "fā piào", "invoice; receipt", 11, "noun", "又"),
    ("发言", "發言", "fā yán", "to make a speech", 7, "verb", "又"),
    ("罚款", "罰款", "fá kuǎn", "to fine; fine", 9, "verb", "罒"),
    ("法律", "法律", "fǎ lǜ", "law", 9, "noun", "氵"),
    ("法院", "法院", "fǎ yuàn", "court of law", 10, "noun", "氵"),
    ("翻", "翻", "fān", "to turn over; to translate", 18, "verb", "羽"),
    ("繁荣", "繁榮", "fán róng", "prosperous; booming", 14, "adjective", "糸"),
    ("反而", "反而", "fǎn ér", "on the contrary; instead", 6, "conjunction", "又"),
    ("反复", "反複", "fǎn fù", "repeatedly; again and again", 9, "adverb", "又"),
    ("反应", "反應", "fǎn yìng", "to react; reaction", 17, "verb", "又"),
    ("反正", "反正", "fǎn zhèng", "anyway; in any case", 5, "adverb", "又"),
    ("反之", "反之", "fǎn zhī", "conversely; on the other hand", 3, "conjunction", "又"),
    ("范围", "範圍", "fàn wéi", "scope; range", 9, "noun", "艹"),
    ("方", "方", "fāng", "square; direction; method", 4, "noun", "方"),
    ("方案", "方案", "fāng àn", "plan; scheme; program", 10, "noun", "方"),
    ("方式", "方式", "fāng shì", "way; manner; pattern", 6, "noun", "方"),
    ("方向", "方向", "fāng xiàng", "direction; orientation", 6, "noun", "方"),
    ("妨碍", "妨礙", "fáng ài", "to hinder; to obstruct", 13, "verb", "女"),
    ("仿佛", "仿佛", "fǎng fú", "to seem; as if", 6, "adverb", "亻"),
    ("非", "非", "fēi", "not; non-; wrong", 8, "prefix", "非"),
    ("肥皂", "肥皂", "féi zào", "soap", 8, "noun", "月"),
    ("废话", "廢話", "fèi huà", "nonsense; rubbish", 12, "noun", "广"),
    ("废物", "廢物", "fèi wù", "waste; trash; good-for-nothing", 8, "noun", "广"),
    ("分别", "分別", "fēn bié", "to part; to distinguish; respectively", 7, "verb", "刀"),
    ("分布", "分佈", "fēn bù", "to be distributed; distribution", 5, "verb", "刀"),
    ("分配", "分配", "fēn pèi", "to distribute; to allocate", 10, "verb", "刀"),
    ("分析", "分析", "fēn xī", "to analyze; analysis", 8, "verb", "刀"),
    ("纷纷", "紛紛", "fēn fēn", "one after another; in succession", 7, "adverb", "纟"),
    ("奋斗", "奮鬥", "fèn dòu", "to struggle; to fight", 8, "verb", "大"),
    ("风格", "風格", "fēng gé", "style; manner", 10, "noun", "风"),
    ("风景", "風景", "fēng jǐng", "scenery; landscape", 12, "noun", "风"),
    ("风俗", "風俗", "fēng sú", "custom; convention", 9, "noun", "风"),
    ("风险", "風險", "fēng xiǎn", "risk; hazard", 9, "noun", "风"),
    ("疯狂", "瘋狂", "fēng kuáng", "crazy; mad", 9, "adjective", "疒"),
    ("讽刺", "諷刺", "fěng cì", "to satirize; satire", 8, "verb", "讠"),
    ("否定", "否定", "fǒu dìng", "to negate; negative", 7, "verb", "口"),
    ("否认", "否認", "fǒu rèn", "to deny; to disavow", 7, "verb", "口"),
    ("否则", "否則", "fǒu zé", "otherwise; if not", 9, "conjunction", "口"),
    ("扶", "扶", "fú", "to support with hand; to help", 7, "verb", "扌"),
    ("服从", "服從", "fú cóng", "to obey; to comply with", 8, "verb", "月"),
    ("幅", "幅", "fú", "measure word for paintings and textiles", 12, "measure", "巾"),
    ("辅导", "輔導", "fǔ dǎo", "to coach; to tutor", 15, "verb", "车"),
    ("妇女", "婦女", "fù nǚ", "woman", 11, "noun", "女"),
    ("复制", "複製", "fù zhì", "to duplicate; to copy", 14, "verb", "衣"),
    ("改革", "改革", "gǎi gé", "to reform; reform", 9, "verb", "攵"),
    ("改进", "改進", "gǎi jìn", "to improve; to make better", 12, "verb", "攵"),
    ("改善", "改善", "gǎi shàn", "to improve; to ameliorate", 12, "verb", "攵"),
    ("改正", "改正", "gǎi zhèng", "to correct; to amend", 5, "verb", "攵"),
    ("盖", "蓋", "gài", "to cover; lid", 11, "verb", "皿"),
    ("概括", "概括", "gài kuò", "to summarize; to generalize", 9, "verb", "木"),
    ("概念", "概念", "gài niàn", "concept; idea", 8, "noun", "木"),
    ("干脆", "乾脆", "gān cuì", "straightforward; simply", 10, "adjective", "十"),
    ("干燥", "乾燥", "gān zào", "dry; arid", 17, "adjective", "火"),
    ("赶紧", "趕緊", "gǎn jǐn", "hurriedly; quickly", 14, "adverb", "走"),
]

def seed_hsk4_part2():
    """Add HSK 4 vocabulary part 2"""
    db = SessionLocal()

    try:
        added_count = 0
        skipped_count = 0

        for word_data in hsk4_part2_words:
            simplified, traditional, pinyin, english, strokes, category, radical = word_data

            # Check if word already exists
            existing = db.query(HanziWord).filter(
                HanziWord.simplified == simplified,
                HanziWord.hsk_level == 4
            ).first()

            if not existing:
                word = HanziWord(
                    simplified=simplified,
                    traditional=traditional,
                    pinyin=pinyin,
                    english=english,
                    hsk_level=4,
                    strokes=strokes,
                    category=category,
                    radical=radical
                )
                db.add(word)
                added_count += 1
                if added_count % 20 == 0:
                    print(f"Progress: Added {added_count} words...")
            else:
                skipped_count += 1

        db.commit()
        print(f"\n✓ Successfully added {added_count} HSK 4 words (Part 2)")
        print(f"✓ Skipped {skipped_count} existing words")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_hsk4_part2()
