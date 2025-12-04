"""
Complete HSK 2 vocabulary - 290 characters from WriteHanzi
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import HanziWord

# Complete HSK 2 - Additional words to reach 290 total
hsk2_additional = [
    # Weather & Nature
    {"simplified": "阴", "traditional": "陰", "pinyin": "yīn", "english": "cloudy; overcast; yin", "category": "weather"},
    {"simplified": "晴", "traditional": "晴", "pinyin": "qíng", "english": "sunny; clear", "category": "weather"},
    {"simplified": "雪", "traditional": "雪", "pinyin": "xuě", "english": "snow", "category": "weather"},
    {"simplified": "云", "traditional": "雲", "pinyin": "yún", "english": "cloud", "category": "weather"},
    {"simplified": "风", "traditional": "風", "pinyin": "fēng", "english": "wind", "category": "weather"},
    {"simplified": "海", "traditional": "海", "pinyin": "hǎi", "english": "sea; ocean", "category": "place"},
    {"simplified": "湖", "traditional": "湖", "pinyin": "hú", "english": "lake", "category": "place"},
    {"simplified": "河", "traditional": "河", "pinyin": "hé", "english": "river", "category": "place"},
    {"simplified": "草", "traditional": "草", "pinyin": "cǎo", "english": "grass", "category": "other"},
    {"simplified": "树", "traditional": "樹", "pinyin": "shù", "english": "tree", "category": "other"},
    {"simplified": "鸟", "traditional": "鳥", "pinyin": "niǎo", "english": "bird", "category": "other"},
    {"simplified": "狗", "traditional": "狗", "pinyin": "gǒu", "english": "dog", "category": "other"},

    # Verbs
    {"simplified": "爬", "traditional": "爬", "pinyin": "pá", "english": "to climb", "category": "verb"},
    {"simplified": "推", "traditional": "推", "pinyin": "tuī", "english": "to push", "category": "verb"},
    {"simplified": "拉", "traditional": "拉", "pinyin": "lā", "english": "to pull", "category": "verb"},
    {"simplified": "举", "traditional": "舉", "pinyin": "jǔ", "english": "to lift; to raise", "category": "verb"},
    {"simplified": "收", "traditional": "收", "pinyin": "shōu", "english": "to receive; to collect", "category": "verb"},
    {"simplified": "接", "traditional": "接", "pinyin": "jiē", "english": "to receive; to catch", "category": "verb"},
    {"simplified": "送", "traditional": "送", "pinyin": "sòng", "english": "to send; to deliver", "category": "verb"},
    {"simplified": "选", "traditional": "選", "pinyin": "xuǎn", "english": "to choose; to select", "category": "verb"},
    {"simplified": "使", "traditional": "使", "pinyin": "shǐ", "english": "to use; to make", "category": "verb"},
    {"simplified": "让", "traditional": "讓", "pinyin": "ràng", "english": "to let; to allow", "category": "verb"},
    {"simplified": "游", "traditional": "遊", "pinyin": "yóu", "english": "to swim; to travel", "category": "verb"},
    {"simplified": "借", "traditional": "借", "pinyin": "jiè", "english": "to borrow; to lend", "category": "verb"},
    {"simplified": "办", "traditional": "辦", "pinyin": "bàn", "english": "to do; to handle", "category": "verb"},
    {"simplified": "检", "traditional": "檢", "pinyin": "jiǎn", "english": "to check; to examine", "category": "verb"},
    {"simplified": "养", "traditional": "養", "pinyin": "yǎng", "english": "to raise; to keep", "category": "verb"},
    {"simplified": "停", "traditional": "停", "pinyin": "tíng", "english": "to stop", "category": "verb"},
    {"simplified": "倒", "traditional": "倒", "pinyin": "dǎo", "english": "to fall; to pour", "category": "verb"},
    {"simplified": "掉", "traditional": "掉", "pinyin": "diào", "english": "to fall; to drop", "category": "verb"},
    {"simplified": "碰", "traditional": "碰", "pinyin": "pèng", "english": "to touch; to meet", "category": "verb"},
    {"simplified": "练", "traditional": "練", "pinyin": "liàn", "english": "to practice", "category": "verb"},
    {"simplified": "吹", "traditional": "吹", "pinyin": "chuī", "english": "to blow", "category": "verb"},
    {"simplified": "哭", "traditional": "哭", "pinyin": "kū", "english": "to cry", "category": "verb"},
    {"simplified": "笑", "traditional": "笑", "pinyin": "xiào", "english": "to laugh; to smile", "category": "verb"},
    {"simplified": "喊", "traditional": "喊", "pinyin": "hǎn", "english": "to shout", "category": "verb"},
    {"simplified": "骑", "traditional": "騎", "pinyin": "qí", "english": "to ride", "category": "verb"},
    {"simplified": "照", "traditional": "照", "pinyin": "zhào", "english": "to shine; to photograph", "category": "verb"},
    {"simplified": "画", "traditional": "畫", "pinyin": "huà", "english": "to draw; to paint", "category": "verb"},

    # Adjectives
    {"simplified": "轻", "traditional": "輕", "pinyin": "qīng", "english": "light; soft", "category": "adjective"},
    {"simplified": "重", "traditional": "重", "pinyin": "zhòng", "english": "heavy", "category": "adjective"},
    {"simplified": "清", "traditional": "清", "pinyin": "qīng", "english": "clear", "category": "adjective"},
    {"simplified": "满", "traditional": "滿", "pinyin": "mǎn", "english": "full", "category": "adjective"},
    {"simplified": "空", "traditional": "空", "pinyin": "kōng", "english": "empty", "category": "adjective"},
    {"simplified": "静", "traditional": "靜", "pinyin": "jìng", "english": "quiet", "category": "adjective"},
    {"simplified": "亮", "traditional": "亮", "pinyin": "liàng", "english": "bright", "category": "adjective"},
    {"simplified": "饱", "traditional": "飽", "pinyin": "bǎo", "english": "full (after eating)", "category": "adjective"},
    {"simplified": "饿", "traditional": "餓", "pinyin": "è", "english": "hungry", "category": "adjective"},
    {"simplified": "渴", "traditional": "渴", "pinyin": "kě", "english": "thirsty", "category": "adjective"},
    {"simplified": "累", "traditional": "累", "pinyin": "lèi", "english": "tired", "category": "adjective"},
    {"simplified": "舒", "traditional": "舒", "pinyin": "shū", "english": "comfortable", "category": "adjective"},
    {"simplified": "方", "traditional": "方", "pinyin": "fāng", "english": "square; direction", "category": "adjective"},
    {"simplified": "圆", "traditional": "圓", "pinyin": "yuán", "english": "round", "category": "adjective"},
    {"simplified": "直", "traditional": "直", "pinyin": "zhí", "english": "straight", "category": "adjective"},
    {"simplified": "平", "traditional": "平", "pinyin": "píng", "english": "flat; level", "category": "adjective"},

    # Places & Objects
    {"simplified": "园", "traditional": "園", "pinyin": "yuán", "english": "garden; park", "category": "place"},
    {"simplified": "室", "traditional": "室", "pinyin": "shì", "english": "room", "category": "place"},
    {"simplified": "层", "traditional": "層", "pinyin": "céng", "english": "layer; floor", "category": "place"},
    {"simplified": "堂", "traditional": "堂", "pinyin": "táng", "english": "hall", "category": "place"},
    {"simplified": "街", "traditional": "街", "pinyin": "jiē", "english": "street", "category": "place"},
    {"simplified": "队", "traditional": "隊", "pinyin": "duì", "english": "team; queue", "category": "other"},
    {"simplified": "组", "traditional": "組", "pinyin": "zǔ", "english": "group", "category": "other"},
    {"simplified": "部", "traditional": "部", "pinyin": "bù", "english": "part; section", "category": "other"},

    # Objects
    {"simplified": "灯", "traditional": "燈", "pinyin": "dēng", "english": "lamp; light", "category": "other"},
    {"simplified": "墙", "traditional": "牆", "pinyin": "qiáng", "english": "wall", "category": "other"},
    {"simplified": "椅", "traditional": "椅", "pinyin": "yǐ", "english": "chair", "category": "other"},
    {"simplified": "板", "traditional": "板", "pinyin": "bǎn", "english": "board; plank", "category": "other"},
    {"simplified": "笔", "traditional": "筆", "pinyin": "bǐ", "english": "pen; brush", "category": "school"},
    {"simplified": "纸", "traditional": "紙", "pinyin": "zhǐ", "english": "paper", "category": "school"},
    {"simplified": "瓶", "traditional": "瓶", "pinyin": "píng", "english": "bottle", "category": "other"},
    {"simplified": "碗", "traditional": "碗", "pinyin": "wǎn", "english": "bowl", "category": "other"},
    {"simplified": "筷", "traditional": "筷", "pinyin": "kuài", "english": "chopsticks", "category": "other"},
    {"simplified": "鞋", "traditional": "鞋", "pinyin": "xié", "english": "shoes", "category": "clothing"},
    {"simplified": "伞", "traditional": "傘", "pinyin": "sǎn", "english": "umbrella", "category": "other"},

    # Time words
    {"simplified": "末", "traditional": "末", "pinyin": "mò", "english": "end", "category": "time"},
    {"simplified": "初", "traditional": "初", "pinyin": "chū", "english": "beginning; first", "category": "time"},
    {"simplified": "久", "traditional": "久", "pinyin": "jiǔ", "english": "long time", "category": "time"},
    {"simplified": "刚", "traditional": "剛", "pinyin": "gāng", "english": "just now", "category": "time"},
    {"simplified": "才", "traditional": "才", "pinyin": "cái", "english": "just; only then", "category": "time"},
    {"simplified": "永", "traditional": "永", "pinyin": "yǒng", "english": "forever", "category": "time"},
    {"simplified": "周", "traditional": "週", "pinyin": "zhōu", "english": "week; cycle", "category": "time"},
    {"simplified": "夜", "traditional": "夜", "pinyin": "yè", "english": "night", "category": "time"},
    {"simplified": "晨", "traditional": "晨", "pinyin": "chén", "english": "morning", "category": "time"},
    {"simplified": "节", "traditional": "節", "pinyin": "jié", "english": "festival; section", "category": "time"},

    # Body & Health
    {"simplified": "嘴", "traditional": "嘴", "pinyin": "zuǐ", "english": "mouth", "category": "body"},
    {"simplified": "脸", "traditional": "臉", "pinyin": "liǎn", "english": "face", "category": "body"},
    {"simplified": "声", "traditional": "聲", "pinyin": "shēng", "english": "sound; voice", "category": "body"},
    {"simplified": "疼", "traditional": "疼", "pinyin": "téng", "english": "to ache; painful", "category": "body"},
    {"simplified": "健", "traditional": "健", "pinyin": "jiàn", "english": "healthy", "category": "body"},
    {"simplified": "康", "traditional": "康", "pinyin": "kāng", "english": "healthy; well-being", "category": "body"},

    # Food
    {"simplified": "饺", "traditional": "餃", "pinyin": "jiǎo", "english": "dumpling", "category": "food"},
    {"simplified": "餐", "traditional": "餐", "pinyin": "cān", "english": "meal", "category": "food"},
    {"simplified": "油", "traditional": "油", "pinyin": "yóu", "english": "oil", "category": "food"},
    {"simplified": "酒", "traditional": "酒", "pinyin": "jiǔ", "english": "alcohol; wine", "category": "food"},
    {"simplified": "熟", "traditional": "熟", "pinyin": "shú", "english": "ripe; cooked", "category": "food"},
    {"simplified": "味", "traditional": "味", "pinyin": "wèi", "english": "taste; flavor", "category": "food"},

    # Common words & Grammar
    {"simplified": "词", "traditional": "詞", "pinyin": "cí", "english": "word; phrase", "category": "grammar"},
    {"simplified": "句", "traditional": "句", "pinyin": "jù", "english": "sentence", "category": "grammar"},
    {"simplified": "言", "traditional": "言", "pinyin": "yán", "english": "words; speech", "category": "grammar"},
    {"simplified": "而", "traditional": "而", "pinyin": "ér", "english": "and; but", "category": "grammar"},
    {"simplified": "且", "traditional": "且", "pinyin": "qiě", "english": "moreover; and", "category": "grammar"},
    {"simplified": "或", "traditional": "或", "pinyin": "huò", "english": "or; maybe", "category": "grammar"},
    {"simplified": "但", "traditional": "但", "pinyin": "dàn", "english": "but; however", "category": "grammar"},
    {"simplified": "虽", "traditional": "雖", "pinyin": "suī", "english": "although", "category": "grammar"},
    {"simplified": "然", "traditional": "然", "pinyin": "rán", "english": "so; like that", "category": "grammar"},
    {"simplified": "如", "traditional": "如", "pinyin": "rú", "english": "like; as", "category": "grammar"},
    {"simplified": "像", "traditional": "像", "pinyin": "xiàng", "english": "to resemble", "category": "verb"},
    {"simplified": "该", "traditional": "該", "pinyin": "gāi", "english": "should; ought to", "category": "grammar"},
    {"simplified": "须", "traditional": "須", "pinyin": "xū", "english": "must; have to", "category": "grammar"},
    {"simplified": "必", "traditional": "必", "pinyin": "bì", "english": "must; certainly", "category": "grammar"},
    {"simplified": "己", "traditional": "己", "pinyin": "jǐ", "english": "oneself", "category": "grammar"},
    {"simplified": "它", "traditional": "它", "pinyin": "tā", "english": "it", "category": "grammar"},
    {"simplified": "咱", "traditional": "咱", "pinyin": "zán", "english": "we (inclusive)", "category": "person"},
    {"simplified": "其", "traditional": "其", "pinyin": "qí", "english": "its; that", "category": "grammar"},
    {"simplified": "由", "traditional": "由", "pinyin": "yóu", "english": "by; from", "category": "grammar"},
    {"simplified": "于", "traditional": "於", "pinyin": "yú", "english": "at; in", "category": "grammar"},
    {"simplified": "已", "traditional": "已", "pinyin": "yǐ", "english": "already", "category": "adverb"},
    {"simplified": "又", "traditional": "又", "pinyin": "yòu", "english": "again; also", "category": "adverb"},
    {"simplified": "更", "traditional": "更", "pinyin": "gèng", "english": "more; even more", "category": "adverb"},
    {"simplified": "最", "traditional": "最", "pinyin": "zuì", "english": "most", "category": "adverb"},
    {"simplified": "越", "traditional": "越", "pinyin": "yuè", "english": "to exceed; more and more", "category": "adverb"},
    {"simplified": "挺", "traditional": "挺", "pinyin": "tǐng", "english": "quite; very", "category": "adverb"},
    {"simplified": "才", "traditional": "才", "pinyin": "cái", "english": "only; just", "category": "adverb"},
    {"simplified": "够", "traditional": "夠", "pinyin": "gòu", "english": "enough", "category": "adverb"},

    # Action & State
    {"simplified": "适", "traditional": "適", "pinyin": "shì", "english": "suitable; appropriate", "category": "adjective"},
    {"simplified": "套", "traditional": "套", "pinyin": "tào", "english": "set; suite", "category": "other"},
    {"simplified": "运", "traditional": "運", "pinyin": "yùn", "english": "to transport; luck", "category": "verb"},
    {"simplified": "卖", "traditional": "賣", "pinyin": "mài", "english": "to sell", "category": "verb"},
    {"simplified": "全", "traditional": "全", "pinyin": "quán", "english": "complete; whole", "category": "adjective"},
    {"simplified": "铁", "traditional": "鐵", "pinyin": "tiě", "english": "iron", "category": "other"},
    {"simplified": "经", "traditional": "經", "pinyin": "jīng", "english": "to pass through; classic", "category": "verb"},
    {"simplified": "育", "traditional": "育", "pinyin": "yù", "english": "to educate; to raise", "category": "verb"},
    {"simplified": "楚", "traditional": "楚", "pinyin": "chǔ", "english": "clear; neat", "category": "adjective"},
    {"simplified": "位", "traditional": "位", "pinyin": "wèi", "english": "position; (polite MW for people)", "category": "other"},
    {"simplified": "共", "traditional": "共", "pinyin": "gòng", "english": "together; altogether", "category": "adverb"},
    {"simplified": "克", "traditional": "克", "pinyin": "kè", "english": "gram; to overcome", "category": "other"},
    {"simplified": "篮", "traditional": "籃", "pinyin": "lán", "english": "basket", "category": "other"},
    {"simplified": "忽", "traditional": "忽", "pinyin": "hū", "english": "suddenly; to neglect", "category": "adverb"},
    {"simplified": "情", "traditional": "情", "pinyin": "qíng", "english": "feeling; emotion", "category": "other"},
    {"simplified": "务", "traditional": "務", "pinyin": "wù", "english": "affair; business", "category": "other"},
    {"simplified": "占", "traditional": "占", "pinyin": "zhàn", "english": "to occupy", "category": "verb"},
    {"simplified": "力", "traditional": "力", "pinyin": "lì", "english": "strength; power", "category": "other"},
    {"simplified": "入", "traditional": "入", "pinyin": "rù", "english": "to enter", "category": "verb"},
    {"simplified": "响", "traditional": "響", "pinyin": "xiǎng", "english": "sound; loud", "category": "other"},
    {"simplified": "科", "traditional": "科", "pinyin": "kē", "english": "science; branch", "category": "school"},
    {"simplified": "加", "traditional": "加", "pinyin": "jiā", "english": "to add", "category": "verb"},
    {"simplified": "愿", "traditional": "願", "pinyin": "yuàn", "english": "to wish; willing", "category": "verb"},
    {"simplified": "青", "traditional": "青", "pinyin": "qīng", "english": "green; blue; young", "category": "color"},
    {"simplified": "通", "traditional": "通", "pinyin": "tōng", "english": "to pass through", "category": "verb"},
    {"simplified": "辆", "traditional": "輛", "pinyin": "liàng", "english": "MW for vehicles", "category": "other"},
    {"simplified": "留", "traditional": "留", "pinyin": "liú", "english": "to stay; to keep", "category": "verb"},
    {"simplified": "庭", "traditional": "庭", "pinyin": "tíng", "english": "courtyard; family", "category": "place"},
    {"simplified": "温", "traditional": "溫", "pinyin": "wēn", "english": "warm; temperature", "category": "adjective"},
    {"simplified": "王", "traditional": "王", "pinyin": "wáng", "english": "king", "category": "person"},
    {"simplified": "计", "traditional": "計", "pinyin": "jì", "english": "to calculate; plan", "category": "verb"},
    {"simplified": "顾", "traditional": "顧", "pinyin": "gù", "english": "to look after", "category": "verb"},
    {"simplified": "利", "traditional": "利", "pinyin": "lì", "english": "benefit; sharp", "category": "other"},
    {"simplified": "许", "traditional": "許", "pinyin": "xǔ", "english": "to allow; maybe", "category": "verb"},
    {"simplified": "物", "traditional": "物", "pinyin": "wù", "english": "thing; object", "category": "other"},
    {"simplified": "遍", "traditional": "遍", "pinyin": "biàn", "english": "time; all over", "category": "other"},
    {"simplified": "例", "traditional": "例", "pinyin": "lì", "english": "example", "category": "other"},
    {"simplified": "复", "traditional": "復", "pinyin": "fù", "english": "to repeat; again", "category": "verb"},
    {"simplified": "表", "traditional": "表", "pinyin": "biǎo", "english": "to express; table", "category": "verb"},
    {"simplified": "普", "traditional": "普", "pinyin": "pǔ", "english": "general; universal", "category": "adjective"},
    {"simplified": "姓", "traditional": "姓", "pinyin": "xìng", "english": "surname", "category": "person"},
    {"simplified": "广", "traditional": "廣", "pinyin": "guǎng", "english": "wide; broad", "category": "adjective"},
    {"simplified": "算", "traditional": "算", "pinyin": "suàn", "english": "to calculate; to count", "category": "verb"},
    {"simplified": "篇", "traditional": "篇", "pinyin": "piān", "english": "MW for articles", "category": "other"},
    {"simplified": "少", "traditional": "少", "pinyin": "shǎo", "english": "few; little", "category": "adjective"},
    {"simplified": "般", "traditional": "般", "pinyin": "bān", "english": "kind; sort", "category": "other"},
    {"simplified": "闻", "traditional": "聞", "pinyin": "wén", "english": "to hear; to smell", "category": "verb"},
    {"simplified": "假", "traditional": "假", "pinyin": "jiǎ", "english": "false; vacation", "category": "adjective"},
    {"simplified": "业", "traditional": "業", "pinyin": "yè", "english": "business; industry", "category": "other"},
    {"simplified": "信", "traditional": "信", "pinyin": "xìn", "english": "letter; to believe", "category": "other"},
    {"simplified": "思", "traditional": "思", "pinyin": "sī", "english": "to think", "category": "verb"},
    {"simplified": "行", "traditional": "行", "pinyin": "xíng", "english": "to walk; ok", "category": "verb"},
    {"simplified": "澡", "traditional": "澡", "pinyin": "zǎo", "english": "bath", "category": "other"},
    {"simplified": "流", "traditional": "流", "pinyin": "liú", "english": "to flow", "category": "verb"},
    {"simplified": "音", "traditional": "音", "pinyin": "yīn", "english": "sound; tone", "category": "other"},
    {"simplified": "度", "traditional": "度", "pinyin": "dù", "english": "degree; measure", "category": "other"},
    {"simplified": "离", "traditional": "離", "pinyin": "lí", "english": "to leave; away from", "category": "verb"},
    {"simplified": "可", "traditional": "可", "pinyin": "kě", "english": "can; may", "category": "verb"},
    {"simplified": "要", "traditional": "要", "pinyin": "yào", "english": "to want; important", "category": "verb"},
    {"simplified": "装", "traditional": "裝", "pinyin": "zhuāng", "english": "to install; clothing", "category": "verb"},
    {"simplified": "喂", "traditional": "餵", "pinyin": "wèi", "english": "to feed; hello", "category": "verb"},
    {"simplified": "实", "traditional": "實", "pinyin": "shí", "english": "real; solid", "category": "adjective"},
    {"simplified": "食", "traditional": "食", "pinyin": "shí", "english": "food; to eat", "category": "food"},
    {"simplified": "意", "traditional": "意", "pinyin": "yì", "english": "meaning; intention", "category": "other"},
    {"simplified": "努", "traditional": "努", "pinyin": "nǔ", "english": "to exert; to strive", "category": "verb"},
    {"simplified": "座", "traditional": "座", "pinyin": "zuò", "english": "seat; MW for buildings", "category": "other"},
    {"simplified": "阳", "traditional": "陽", "pinyin": "yáng", "english": "sun; yang", "category": "other"},
    {"simplified": "确", "traditional": "確", "pinyin": "què", "english": "certain; true", "category": "adjective"},
    {"simplified": "交", "traditional": "交", "pinyin": "jiāo", "english": "to hand over; to meet", "category": "verb"},
    {"simplified": "变", "traditional": "變", "pinyin": "biàn", "english": "to change", "category": "verb"},
    {"simplified": "讲", "traditional": "講", "pinyin": "jiǎng", "english": "to speak; to explain", "category": "verb"},
    {"simplified": "目", "traditional": "目", "pinyin": "mù", "english": "eye; item", "category": "body"},
    {"simplified": "观", "traditional": "觀", "pinyin": "guān", "english": "to observe; view", "category": "verb"},
    {"simplified": "迎", "traditional": "迎", "pinyin": "yíng", "english": "to welcome", "category": "verb"},
    {"simplified": "故", "traditional": "故", "pinyin": "gù", "english": "reason; old", "category": "other"},
    {"simplified": "颜", "traditional": "顏", "pinyin": "yán", "english": "color; face", "category": "other"},
    {"simplified": "凉", "traditional": "涼", "pinyin": "liáng", "english": "cool; cold", "category": "adjective"},
    {"simplified": "护", "traditional": "護", "pinyin": "hù", "english": "to protect", "category": "verb"},
    {"simplified": "者", "traditional": "者", "pinyin": "zhě", "english": "person; -er", "category": "other"},
    {"simplified": "心", "traditional": "心", "pinyin": "xīn", "english": "heart; mind", "category": "body"},
    {"simplified": "急", "traditional": "急", "pinyin": "jí", "english": "urgent; anxious", "category": "adjective"},
    {"simplified": "相", "traditional": "相", "pinyin": "xiāng", "english": "mutual; each other", "category": "other"},
    {"simplified": "礼", "traditional": "禮", "pinyin": "lǐ", "english": "gift; courtesy", "category": "other"},
    {"simplified": "受", "traditional": "受", "pinyin": "shòu", "english": "to receive; to bear", "category": "verb"},
    {"simplified": "宜", "traditional": "宜", "pinyin": "yí", "english": "suitable; appropriate", "category": "adjective"},
    {"simplified": "法", "traditional": "法", "pinyin": "fǎ", "english": "law; method", "category": "other"},
    {"simplified": "助", "traditional": "助", "pinyin": "zhù", "english": "to help", "category": "verb"},
    {"simplified": "弄", "traditional": "弄", "pinyin": "nòng", "english": "to do; to make", "category": "verb"},
    {"simplified": "活", "traditional": "活", "pinyin": "huó", "english": "to live; alive", "category": "verb"},
    {"simplified": "数", "traditional": "數", "pinyin": "shù", "english": "number; to count", "category": "number"},
    {"simplified": "主", "traditional": "主", "pinyin": "zhǔ", "english": "main; host", "category": "other"},
    {"simplified": "随", "traditional": "隨", "pinyin": "suí", "english": "to follow", "category": "verb"},
    {"simplified": "参", "traditional": "參", "pinyin": "cān", "english": "to participate", "category": "verb"},
    {"simplified": "讨", "traditional": "討", "pinyin": "tǎo", "english": "to discuss", "category": "verb"},
    {"simplified": "安", "traditional": "安", "pinyin": "ān", "english": "peaceful; safe", "category": "adjective"},
    {"simplified": "特", "traditional": "特", "pinyin": "tè", "english": "special", "category": "adjective"},
    {"simplified": "往", "traditional": "往", "pinyin": "wǎng", "english": "to go; towards", "category": "verb"},
    {"simplified": "典", "traditional": "典", "pinyin": "diǎn", "english": "classic; canon", "category": "other"},
    {"simplified": "亿", "traditional": "億", "pinyin": "yì", "english": "hundred million", "category": "number"},
    {"simplified": "为", "traditional": "為", "pinyin": "wéi", "english": "to be; to become", "category": "verb"},
    {"simplified": "际", "traditional": "際", "pinyin": "jì", "english": "border; occasion", "category": "other"},
    {"simplified": "取", "traditional": "取", "pinyin": "qǔ", "english": "to take; to fetch", "category": "verb"},
    {"simplified": "查", "traditional": "查", "pinyin": "chá", "english": "to check; to investigate", "category": "verb"},
    {"simplified": "靠", "traditional": "靠", "pinyin": "kào", "english": "to lean on; to depend", "category": "verb"},
    {"simplified": "钟", "traditional": "鐘", "pinyin": "zhōng", "english": "clock; bell", "category": "other"},
    {"simplified": "顺", "traditional": "順", "pinyin": "shùn", "english": "smooth; to obey", "category": "adjective"},
    {"simplified": "惯", "traditional": "慣", "pinyin": "guàn", "english": "habit; accustomed", "category": "other"},
    {"simplified": "英", "traditional": "英", "pinyin": "yīng", "english": "English; hero", "category": "other"},
    {"simplified": "印", "traditional": "印", "pinyin": "yìn", "english": "to print; seal", "category": "verb"},
    {"simplified": "绩", "traditional": "績", "pinyin": "jì", "english": "achievement; result", "category": "other"},
    {"simplified": "答", "traditional": "答", "pinyin": "dá", "english": "to answer", "category": "verb"},
    {"simplified": "级", "traditional": "級", "pinyin": "jí", "english": "level; grade", "category": "other"},
    {"simplified": "份", "traditional": "份", "pinyin": "fèn", "english": "portion; share", "category": "other"},
    {"simplified": "报", "traditional": "報", "pinyin": "bào", "english": "newspaper; to report", "category": "other"},
    {"simplified": "示", "traditional": "示", "pinyin": "shì", "english": "to show", "category": "verb"},
    {"simplified": "件", "traditional": "件", "pinyin": "jiàn", "english": "item; MW for things", "category": "other"},
    {"simplified": "发", "traditional": "髮", "pinyin": "fà", "english": "hair", "category": "body"},
    {"simplified": "怕", "traditional": "怕", "pinyin": "pà", "english": "to fear", "category": "verb"},
    {"simplified": "定", "traditional": "定", "pinyin": "dìng", "english": "fixed; decided", "category": "adjective"},
    {"simplified": "过", "traditional": "過", "pinyin": "guò", "english": "to pass; excessive", "category": "verb"},
    {"simplified": "感", "traditional": "感", "pinyin": "gǎn", "english": "to feel", "category": "verb"},
    {"simplified": "原", "traditional": "原", "pinyin": "yuán", "english": "original; former", "category": "adjective"},
    {"simplified": "排", "traditional": "排", "pinyin": "pái", "english": "to arrange; row", "category": "verb"},
    {"simplified": "旅", "traditional": "旅", "pinyin": "lǚ", "english": "trip; to travel", "category": "verb"},
    {"simplified": "应", "traditional": "應", "pinyin": "yìng", "english": "should; to answer", "category": "verb"},
    {"simplified": "题", "traditional": "題", "pinyin": "tí", "english": "topic; question", "category": "other"},
    {"simplified": "低", "traditional": "低", "pinyin": "dī", "english": "low", "category": "adjective"},
    {"simplified": "色", "traditional": "色", "pinyin": "sè", "english": "color", "category": "color"},
    {"simplified": "封", "traditional": "封", "pinyin": "fēng", "english": "to seal; MW for letters", "category": "other"},
    {"simplified": "向", "traditional": "向", "pinyin": "xiàng", "english": "towards; direction", "category": "other"},
    {"simplified": "便", "traditional": "便", "pinyin": "biàn", "english": "convenient", "category": "adjective"},
    {"simplified": "求", "traditional": "求", "pinyin": "qiú", "english": "to seek; to request", "category": "verb"},
    {"simplified": "段", "traditional": "段", "pinyin": "duàn", "english": "section; paragraph", "category": "other"},
    {"simplified": "态", "traditional": "態", "pinyin": "tài", "english": "state; attitude", "category": "other"},
    {"simplified": "带", "traditional": "帶", "pinyin": "dài", "english": "belt; to bring", "category": "verb"},
    {"simplified": "合", "traditional": "合", "pinyin": "hé", "english": "to join; together", "category": "verb"},
    {"simplified": "称", "traditional": "稱", "pinyin": "chēng", "english": "to call; to weigh", "category": "verb"},
    {"simplified": "夏", "traditional": "夏", "pinyin": "xià", "english": "summer", "category": "time"},
    {"simplified": "理", "traditional": "理", "pinyin": "lǐ", "english": "reason; to manage", "category": "other"},
    {"simplified": "单", "traditional": "單", "pinyin": "dān", "english": "single; list", "category": "other"},
    {"simplified": "改", "traditional": "改", "pinyin": "gǎi", "english": "to change; to correct", "category": "verb"},
    {"simplified": "租", "traditional": "租", "pinyin": "zū", "english": "to rent", "category": "verb"},
    {"simplified": "论", "traditional": "論", "pinyin": "lùn", "english": "theory; to discuss", "category": "other"},
    {"simplified": "成", "traditional": "成", "pinyin": "chéng", "english": "to become; to succeed", "category": "verb"},
]

def seed_hsk2_complete():
    db = SessionLocal()
    try:
        print("\n" + "="*70)
        print("Adding Remaining HSK 2 Vocabulary to Complete 290 Words")
        print("="*70 + "\n")

        added = 0
        skipped = 0

        for word_data in hsk2_additional:
            # Check if word already exists
            existing = db.query(HanziWord).filter(
                HanziWord.simplified == word_data["simplified"],
                HanziWord.hsk_level == 2
            ).first()

            if existing:
                print(f"[SKIP] {word_data['simplified']} - already exists")
                skipped += 1
                continue

            # Create new word
            word = HanziWord(
                simplified=word_data["simplified"],
                traditional=word_data["traditional"],
                pinyin=word_data["pinyin"],
                english=word_data["english"],
                hsk_level=2,
                category=word_data.get("category", "other")
            )
            db.add(word)
            print(f"[ADD] {word_data['simplified']:3s} ({word_data['pinyin']:10s}) - {word_data['category']:15s} | {word_data['english'][:50]}")
            added += 1

        db.commit()

        # Get final count
        total_hsk2 = db.query(HanziWord).filter(HanziWord.hsk_level == 2).count()

        print("\n" + "="*70)
        print("[SUCCESS] HSK 2 Complete Vocabulary Seeding Done!")
        print("="*70)
        print(f"  Added: {added} words")
        print(f"  Skipped: {skipped} words")
        print(f"  Total HSK 2 in database: {total_hsk2} words")
        print(f"\n  Target: 290 words (WriteHanzi standard)")
        if total_hsk2 >= 290:
            print(f"  Status: ✓ COMPLETE!")
        else:
            print(f"  Status: {total_hsk2}/290 ({total_hsk2*100//290}%)")

    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_hsk2_complete()
