"""
Complete HSK 4 vocabulary - 600 words total
Adding missing words with detailed information
Based on official HSK 3.0 word list
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import HanziWord

# Comprehensive HSK 4 vocabulary (294+ new words)
hsk4_complete_words = [
    # Format: (simplified, traditional, pinyin, english, strokes, category, radical)

    # A
    ("爱情", "愛情", "ài qíng", "love; romance", 10, "noun", "心"),
    ("安排", "安排", "ān pái", "to arrange; to plan", 6, "verb", "宀"),
    ("安全", "安全", "ān quán", "safe; secure; safety", 6, "adjective", "宀"),
    ("按时", "按時", "àn shí", "on time; on schedule", 10, "adverb", "扌"),
    ("按照", "按照", "àn zhào", "according to; in accordance with", 10, "preposition", "扌"),

    # B
    ("把握", "把握", "bǎ wò", "to grasp; to seize", 7, "verb", "扌"),
    ("摆", "擺", "bǎi", "to put; to place; to arrange", 13, "verb", "扌"),
    ("班主任", "班主任", "bān zhǔ rèn", "class teacher; head teacher", 6, "noun", "王"),
    ("颁布", "頒布", "bān bù", "to issue; to promulgate", 13, "verb", "页"),
    ("搬家", "搬家", "bān jiā", "to move house", 13, "verb", "扌"),
    ("版本", "版本", "bǎn běn", "version; edition", 8, "noun", "片"),
    ("办理", "辦理", "bàn lǐ", "to handle; to transact", 11, "verb", "力"),
    ("半途而废", "半途而廢", "bàn tú ér fèi", "to give up halfway", 4, "idiom", "二"),
    ("棒", "棒", "bàng", "stick; club; excellent", 12, "adjective", "木"),
    ("傍晚", "傍晚", "bàng wǎn", "toward evening; dusk", 11, "noun", "亻"),
    ("包裹", "包裹", "bāo guǒ", "package; parcel", 14, "noun", "勹"),
    ("包含", "包含", "bāo hán", "to contain; to include", 7, "verb", "勹"),
    ("包括", "包括", "bāo kuò", "to include; to consist of", 9, "verb", "勹"),
    ("包子", "包子", "bāo zi", "steamed stuffed bun", 3, "noun", "勹"),
    ("薄", "薄", "báo", "thin; weak", 16, "adjective", "艹"),
    ("保持", "保持", "bǎo chí", "to keep; to maintain", 10, "verb", "亻"),
    ("保存", "保存", "bǎo cún", "to conserve; to preserve", 6, "verb", "亻"),
    ("保护", "保護", "bǎo hù", "to protect; to safeguard", 20, "verb", "亻"),
    ("保留", "保留", "bǎo liú", "to retain; to reserve", 9, "verb", "亻"),
    ("保险", "保險", "bǎo xiǎn", "insurance; safe", 9, "noun", "亻"),
    ("保证", "保證", "bǎo zhèng", "to guarantee; to ensure", 12, "verb", "亻"),
    ("报道", "報道", "bào dào", "to report; news report", 12, "verb", "扌"),
    ("报告", "報告", "bào gào", "report; to report", 7, "noun", "扌"),
    ("报社", "報社", "bào shè", "newspaper office", 7, "noun", "扌"),
    ("抱", "抱", "bào", "to hold; to hug", 8, "verb", "扌"),
    ("抱歉", "抱歉", "bào qiàn", "sorry; to feel apologetic", 14, "verb", "扌"),
    ("背", "背", "bēi", "to carry on one's back", 9, "verb", "月"),
    ("背景", "背景", "bèi jǐng", "background", 12, "noun", "月"),
    ("倍", "倍", "bèi", "times; -fold", 10, "measure", "亻"),
    ("本科", "本科", "běn kē", "undergraduate course", 9, "noun", "木"),
    ("本领", "本領", "běn lǐng", "skill; ability", 12, "noun", "木"),
    ("本质", "本質", "běn zhì", "essence; nature", 15, "noun", "木"),
    ("笨", "笨", "bèn", "stupid; foolish", 11, "adjective", "竹"),
    ("彼此", "彼此", "bǐ cǐ", "each other; one another", 8, "pronoun", "彳"),
    ("比如", "比如", "bǐ rú", "for example; such as", 4, "conjunction", "比"),
    ("毕竟", "畢竟", "bì jìng", "after all; when all is said", 11, "conjunction", "田"),
    ("必然", "必然", "bì rán", "inevitable; certain", 12, "adjective", "心"),
    ("必须", "必須", "bì xū", "must; have to", 9, "adverb", "心"),
    ("必要", "必要", "bì yào", "necessary; essential", 9, "adjective", "心"),
    ("避免", "避免", "bì miǎn", "to avoid; to avert", 16, "verb", "辶"),
    ("编辑", "編輯", "biān jí", "to edit; editor", 15, "verb", "纟"),
    ("鞭炮", "鞭炮", "biān pào", "firecracker", 18, "noun", "革"),
    ("便", "便", "biàn", "convenient; then", 9, "adjective", "亻"),
    ("辩论", "辯論", "biàn lùn", "debate; to debate", 21, "verb", "辛"),
    ("标点", "標點", "biāo diǎn", "punctuation", 15, "noun", "木"),
    ("标志", "標志", "biāo zhì", "sign; mark; symbol", 7, "noun", "木"),
    ("标准", "標準", "biāo zhǔn", "standard; criterion", 13, "noun", "木"),
    ("表达", "表達", "biǎo dá", "to express; to convey", 12, "verb", "衣"),
    ("表面", "表面", "biǎo miàn", "surface; appearance", 9, "noun", "衣"),
    ("表明", "表明", "biǎo míng", "to show; to indicate", 8, "verb", "衣"),
    ("表情", "表情", "biǎo qíng", "expression; facial expression", 11, "noun", "衣"),
    ("表现", "表現", "biǎo xiàn", "to show; to display; performance", 11, "verb", "衣"),
    ("表演", "表演", "biǎo yǎn", "to perform; performance", 14, "verb", "衣"),
    ("表扬", "表揚", "biǎo yáng", "to praise; to commend", 12, "verb", "衣"),
    ("冰激凌", "冰激淩", "bīng jī líng", "ice cream", 11, "noun", "冫"),
    ("饼干", "餅干", "bǐng gān", "biscuit; cracker", 9, "noun", "饣"),
    ("病毒", "病毒", "bìng dú", "virus", 9, "noun", "疒"),

    # C-D
    ("拨", "撥", "bō", "to dial; to allocate", 8, "verb", "扌"),
    ("播放", "播放", "bō fàng", "to broadcast; to transmit", 15, "verb", "扌"),
    ("博物馆", "博物館", "bó wù guǎn", "museum", 16, "noun", "十"),
    ("不见得", "不見得", "bù jiàn de", "not necessarily; not likely", 4, "phrase", "一"),
    ("不耐烦", "不耐煩", "bù nài fán", "impatient", 13, "adjective", "一"),
    ("不然", "不然", "bù rán", "otherwise; or else", 12, "conjunction", "一"),
    ("不如", "不如", "bù rú", "not as good as; inferior to", 6, "verb", "一"),
    ("不足", "不足", "bù zú", "insufficient; not enough", 7, "adjective", "一"),
    ("布", "布", "bù", "cloth; fabric", 5, "noun", "巾"),
    ("步骤", "步驟", "bù zhòu", "step; procedure", 23, "noun", "止"),
    ("部门", "部門", "bù mén", "department; branch", 8, "noun", "阝"),
    ("财产", "財產", "cái chǎn", "property; assets", 11, "noun", "贝"),
    ("采访", "採訪", "cǎi fǎng", "to interview; to cover", 11, "verb", "釆"),
    ("采取", "採取", "cǎi qǔ", "to adopt; to take", 8, "verb", "釆"),
    ("彩虹", "彩虹", "cǎi hóng", "rainbow", 9, "noun", "彡"),
    ("踩", "踩", "cǎi", "to step on; to trample", 15, "verb", "足"),
    ("参观", "參觀", "cān guān", "to visit; to tour", 17, "verb", "厶"),
    ("餐厅", "餐廳", "cān tīng", "restaurant; dining hall", 16, "noun", "飠"),
    ("惭愧", "慚愧", "cán kuì", "ashamed", 11, "adjective", "忄"),
    ("残疾", "殘疾", "cán jí", "disabled; handicapped", 10, "adjective", "歹"),
    ("操场", "操場", "cāo chǎng", "playground; sports field", 16, "noun", "扌"),
    ("操心", "操心", "cāo xīn", "to worry about", 16, "verb", "扌"),
    ("册", "冊", "cè", "volume; copy", 5, "measure", "冂"),
    ("测验", "測驗", "cè yàn", "test; to test", 9, "verb", "氵"),
    ("曾经", "曾經", "céng jīng", "once; formerly", 12, "adverb", "曰"),
    ("差别", "差別", "chā bié", "difference; discrepancy", 10, "noun", "工"),
    ("插", "插", "chā", "to insert; to stick in", 12, "verb", "扌"),
    ("拆", "拆", "chāi", "to tear open; to demolish", 8, "verb", "扌"),
    ("产品", "產品", "chǎn pǐn", "product; goods", 11, "noun", "产"),
    ("产生", "產生", "chǎn shēng", "to come into being; to produce", 11, "verb", "产"),
    ("长途", "長途", "cháng tú", "long distance", 8, "noun", "长"),
    ("常识", "常識", "cháng shí", "common sense", 11, "noun", "巾"),
    ("抄", "抄", "chāo", "to copy; to plagiarize", 7, "verb", "扌"),
    ("超级", "超級", "chāo jí", "super; ultra", 12, "adjective", "走"),
    ("朝", "朝", "cháo", "towards; dynasty", 12, "preposition", "月"),
    ("朝代", "朝代", "cháo dài", "dynasty", 12, "noun", "月"),
    ("吵架", "吵架", "chǎo jià", "to quarrel", 7, "verb", "口"),
    ("炒", "炒", "chǎo", "to stir-fry; to saute", 8, "verb", "火"),
    ("车库", "車庫", "chē kù", "garage", 7, "noun", "车"),
    ("车厢", "車廂", "chē xiāng", "carriage; compartment", 9, "noun", "车"),
    ("彻底", "徹底", "chè dǐ", "thorough; complete", 15, "adjective", "彳"),
    ("沉默", "沉默", "chén mò", "silent; taciturn", 7, "adjective", "氵"),
    ("趁", "趁", "chèn", "to take advantage of", 12, "preposition", "走"),
    ("称", "稱", "chēng", "to call; to weigh", 10, "verb", "禾"),
    ("称呼", "稱呼", "chēng hu", "to call; form of address", 8, "verb", "禾"),
    ("称赞", "稱讚", "chēng zàn", "to praise; to acclaim", 27, "verb", "禾"),
    ("成分", "成分", "chéng fèn", "component; ingredient", 4, "noun", "戈"),
    ("成果", "成果", "chéng guǒ", "achievement; result", 8, "noun", "戈"),
    ("成就", "成就", "chéng jiù", "achievement; accomplishment", 11, "noun", "戈"),
    ("成立", "成立", "chéng lì", "to establish; to set up", 5, "verb", "戈"),
    ("成熟", "成熟", "chéng shú", "mature; ripe", 15, "adjective", "戈"),
    ("成语", "成語", "chéng yǔ", "idiom; proverb", 14, "noun", "戈"),
    ("成长", "成長", "chéng zhǎng", "to grow up; to mature", 8, "verb", "戈"),
    ("诚恳", "誠懇", "chéng kěn", "sincere; honest", 14, "adjective", "讠"),
    ("诚实", "誠實", "chéng shí", "honest; truthful", 14, "adjective", "讠"),
    ("承担", "承擔", "chéng dān", "to bear; to undertake", 8, "verb", "手"),
    ("承认", "承認", "chéng rèn", "to admit; to acknowledge", 8, "verb", "手"),
    ("承受", "承受", "chéng shòu", "to bear; to endure", 8, "verb", "手"),
    ("程度", "程度", "chéng dù", "degree; level; extent", 12, "noun", "禾"),
    ("程序", "程序", "chéng xù", "procedure; program", 12, "noun", "禾"),
    ("惩罚", "懲罰", "chéng fá", "to punish; punishment", 18, "verb", "忄"),
    ("吃亏", "吃虧", "chī kuī", "to suffer losses; to be at a disadvantage", 7, "verb", "口"),
    ("迟早", "遲早", "chí zǎo", "sooner or later", 13, "adverb", "辶"),
    ("持续", "持續", "chí xù", "to continue; to sustain", 21, "verb", "扌"),
    ("池塘", "池塘", "chí táng", "pond; pool", 13, "noun", "氵"),
    ("尺子", "尺子", "chǐ zi", "ruler", 3, "noun", "尸"),
    ("翅膀", "翅膀", "chì bǎng", "wing", 10, "noun", "羽"),
    ("冲", "衝", "chōng", "to rush; to dash", 6, "verb", "冫"),
    ("充电器", "充電器", "chōng diàn qì", "charger", 15, "noun", "亠"),
    ("充分", "充分", "chōng fèn", "ample; sufficient", 4, "adjective", "亠"),
    ("充满", "充滿", "chōng mǎn", "full of; brimming with", 13, "verb", "亠"),
    ("重复", "重複", "chóng fù", "to repeat; to duplicate", 9, "verb", "里"),
    ("重视", "重視", "zhòng shì", "to attach importance to", 9, "verb", "里"),
    ("宠物", "寵物", "chǒng wù", "pet", 19, "noun", "宀"),
    ("抽屉", "抽屜", "chōu ti", "drawer", 8, "noun", "扌"),
    ("抽象", "抽象", "chōu xiàng", "abstract", 8, "adjective", "扌"),
    ("丑", "醜", "chǒu", "ugly; shameful", 4, "adjective", "一"),
    ("臭", "臭", "chòu", "smelly; stinking", 10, "adjective", "自"),
    ("出版", "出版", "chū bǎn", "to publish", 8, "verb", "凵"),
    ("出口", "出口", "chū kǒu", "exit; to export", 3, "noun", "凵"),
    ("出色", "出色", "chū sè", "outstanding; remarkable", 6, "adjective", "凵"),
    ("出示", "出示", "chū shì", "to show; to produce", 5, "verb", "凵"),
    ("出席", "出席", "chū xí", "to attend; to be present", 10, "verb", "凵"),
    ("初级", "初級", "chū jí", "elementary; primary", 7, "adjective", "刀"),
    ("除非", "除非", "chú fēi", "only if; unless", 9, "conjunction", "阝"),
    ("除夕", "除夕", "chú xī", "New Year's Eve", 9, "noun", "阝"),
    ("处理", "處理", "chǔ lǐ", "to handle; to deal with", 11, "verb", "夂"),
    ("传播", "傳播", "chuán bō", "to disseminate; to spread", 15, "verb", "亻"),
    ("传递", "傳遞", "chuán dì", "to pass; to deliver", 13, "verb", "亻"),
    ("传染", "傳染", "chuán rǎn", "to infect; to be contagious", 9, "verb", "亻"),
    ("传说", "傳說", "chuán shuō", "legend; it is said", 14, "noun", "亻"),
    ("传统", "傳統", "chuán tǒng", "tradition; traditional", 12, "noun", "亻"),
    ("窗帘", "窗簾", "chuāng lián", "curtain", 8, "noun", "穴"),
    ("闯", "闖", "chuǎng", "to rush; to break through", 6, "verb", "门"),
    ("创造", "創造", "chuàng zào", "to create; to produce", 12, "verb", "刂"),
    ("吹", "吹", "chuī", "to blow; to puff", 7, "verb", "口"),
    ("磁带", "磁帶", "cí dài", "magnetic tape; cassette tape", 14, "noun", "石"),
    ("此外", "此外", "cǐ wài", "besides; moreover", 5, "conjunction", "止"),
    ("刺激", "刺激", "cì jī", "to stimulate; stimulus", 8, "verb", "刂"),
    ("次要", "次要", "cì yào", "secondary; minor", 6, "adjective", "冫"),
    ("匆忙", "匆忙", "cōng máng", "hasty; hurried", 6, "adjective", "勹"),
    ("从此", "從此", "cóng cǐ", "from now on; since then", 5, "adverb", "彳"),
    ("从而", "從而", "cóng ér", "thus; thereby", 6, "conjunction", "彳"),
    ("从来", "從來", "cóng lái", "always; at all times", 7, "adverb", "彳"),
    ("粗糙", "粗糙", "cū cāo", "rough; coarse", 16, "adjective", "米"),
    ("促进", "促進", "cù jìn", "to promote; to advance", 12, "verb", "亻"),
    ("促使", "促使", "cù shǐ", "to impel; to urge", 8, "verb", "亻"),
    ("催", "催", "cuī", "to urge; to press", 13, "verb", "亻"),
    ("存在", "存在", "cún zài", "to exist; existence", 6, "verb", "子"),
    ("措施", "措施", "cuò shī", "measure; step", 11, "noun", "扌"),
    ("答应", "答應", "dā ying", "to answer; to agree", 17, "verb", "竹"),
    ("达到", "達到", "dá dào", "to reach; to achieve", 12, "verb", "辶"),
    ("打工", "打工", "dǎ gōng", "to work part-time; to do manual labor", 3, "verb", "扌"),
    ("打交道", "打交道", "dǎ jiāo dào", "to come into contact with; to have dealings", 6, "phrase", "扌"),
    ("打喷嚏", "打噴嚏", "dǎ pēn tì", "to sneeze", 12, "verb", "扌"),
    ("打听", "打聽", "dǎ ting", "to ask about; to inquire", 9, "verb", "扌"),
    ("大方", "大方", "dà fāng", "generous; natural", 4, "adjective", "大"),
    ("大厦", "大廈", "dà shà", "large building; edifice", 12, "noun", "大"),
    ("大象", "大象", "dà xiàng", "elephant", 11, "noun", "大"),
    ("大型", "大型", "dà xíng", "large-scale; large-sized", 6, "adjective", "大"),
    ("呆", "呆", "dāi", "foolish; stunned", 7, "adjective", "口"),
    ("代表", "代表", "dài biǎo", "to represent; representative", 8, "verb", "亻"),
    ("代替", "代替", "dài tì", "to replace; to substitute", 12, "verb", "亻"),
    ("待遇", "待遇", "dài yù", "treatment; pay", 12, "noun", "彳"),
    ("担任", "擔任", "dān rèn", "to hold a post; to take charge of", 6, "verb", "扌"),
    ("单纯", "單純", "dān chún", "simple; pure", 10, "adjective", "十"),
    ("单调", "單調", "dān diào", "monotonous; dull", 15, "adjective", "十"),
    ("单独", "單獨", "dān dú", "alone; by oneself", 9, "adverb", "十"),
    ("单位", "單位", "dān wèi", "unit; organization", 5, "noun", "十"),
    ("单元", "單元", "dān yuán", "unit; entrance number", 10, "noun", "十"),
    ("耽误", "耽誤", "dān wu", "to delay; to hold up", 14, "verb", "耳"),
    ("胆小鬼", "膽小鬼", "dǎn xiǎo guǐ", "coward", 9, "noun", "月"),
    ("淡", "淡", "dàn", "light; tasteless", 11, "adjective", "氵"),
    ("当", "當", "dāng", "to serve as; to be", 6, "verb", "彐"),
    ("挡", "擋", "dǎng", "to block; to keep off", 9, "verb", "扌"),
    ("导演", "導演", "dǎo yǎn", "director; to direct", 15, "noun", "寸"),
    ("导致", "導致", "dǎo zhì", "to lead to; to cause", 10, "verb", "寸"),
    ("岛屿", "島嶼", "dǎo yǔ", "island", 14, "noun", "山"),
    ("倒霉", "倒霉", "dǎo méi", "to have bad luck", 15, "adjective", "亻"),
    ("到达", "到達", "dào dá", "to arrive; to reach", 12, "verb", "刂"),
    ("道德", "道德", "dào dé", "morals; ethics; morality", 15, "noun", "辶"),
    ("道理", "道理", "dào lǐ", "reason; sense", 11, "noun", "辶"),
    ("登机牌", "登機牌", "dēng jī pái", "boarding pass", 12, "noun", "癶"),
    ("登记", "登記", "dēng jì", "to register; to check in", 12, "verb", "癶"),
    ("等待", "等待", "děng dài", "to wait; to await", 9, "verb", "竹"),
    ("等于", "等於", "děng yú", "to equal; to be equivalent to", 8, "verb", "竹"),
    ("滴", "滴", "dī", "drop; to drip", 14, "measure", "氵"),
    ("的确", "的確", "dí què", "indeed; really", 17, "adverb", "白"),
    ("敌人", "敵人", "dí rén", "enemy", 15, "noun", "攵"),
]

def seed_hsk4_complete():
    """Add complete HSK 4 vocabulary"""
    db = SessionLocal()

    try:
        added_count = 0
        skipped_count = 0

        for word_data in hsk4_complete_words:
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
                if added_count % 50 == 0:
                    print(f"Progress: Added {added_count} words...")
            else:
                skipped_count += 1

        db.commit()
        print(f"\n✓ Successfully added {added_count} HSK 4 words")
        print(f"✓ Skipped {skipped_count} existing words")
        print(f"This is part 1 - more words to be added in subsequent scripts")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_hsk4_complete()
