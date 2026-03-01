"""
Complete HSK 3 vocabulary - ~300 words
Based on official HSK 3.0 word list
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import HanziWord

hsk3_words = [
    # ============================================================
    # NOUNS - People & Relationships
    # ============================================================
    {"simplified": "阿姨", "traditional": "阿姨", "pinyin": "āyí", "english": "aunt; auntie", "category": "people"},
    {"simplified": "叔叔", "traditional": "叔叔", "pinyin": "shūshu", "english": "uncle", "category": "people"},
    {"simplified": "邻居", "traditional": "鄰居", "pinyin": "línjū", "english": "neighbor", "category": "people"},
    {"simplified": "客人", "traditional": "客人", "pinyin": "kèrén", "english": "guest; visitor", "category": "people"},
    {"simplified": "作者", "traditional": "作者", "pinyin": "zuòzhě", "english": "author; writer", "category": "people"},
    {"simplified": "观众", "traditional": "觀眾", "pinyin": "guānzhòng", "english": "audience; spectator", "category": "people"},
    {"simplified": "导游", "traditional": "導遊", "pinyin": "dǎoyóu", "english": "tour guide", "category": "people"},
    {"simplified": "律师", "traditional": "律師", "pinyin": "lǜshī", "english": "lawyer", "category": "people"},

    # ============================================================
    # NOUNS - Places & Geography
    # ============================================================
    {"simplified": "世界", "traditional": "世界", "pinyin": "shìjiè", "english": "world", "category": "place"},
    {"simplified": "地方", "traditional": "地方", "pinyin": "dìfang", "english": "place; location", "category": "place"},
    {"simplified": "地图", "traditional": "地圖", "pinyin": "dìtú", "english": "map", "category": "place"},
    {"simplified": "地铁", "traditional": "地鐵", "pinyin": "dìtiě", "english": "subway; metro", "category": "place"},
    {"simplified": "城市", "traditional": "城市", "pinyin": "chéngshì", "english": "city", "category": "place"},
    {"simplified": "环境", "traditional": "環境", "pinyin": "huánjìng", "english": "environment; surroundings", "category": "place"},
    {"simplified": "超市", "traditional": "超市", "pinyin": "chāoshì", "english": "supermarket", "category": "place"},
    {"simplified": "银行", "traditional": "銀行", "pinyin": "yínháng", "english": "bank", "category": "place"},
    {"simplified": "邮局", "traditional": "郵局", "pinyin": "yóujú", "english": "post office", "category": "place"},
    {"simplified": "机场", "traditional": "機場", "pinyin": "jīchǎng", "english": "airport", "category": "place"},
    {"simplified": "火车站", "traditional": "火車站", "pinyin": "huǒchēzhàn", "english": "train station", "category": "place"},
    {"simplified": "公园", "traditional": "公園", "pinyin": "gōngyuán", "english": "park", "category": "place"},
    {"simplified": "医院", "traditional": "醫院", "pinyin": "yīyuàn", "english": "hospital", "category": "place"},
    {"simplified": "饭店", "traditional": "飯店", "pinyin": "fàndiàn", "english": "restaurant; hotel", "category": "place"},
    {"simplified": "宾馆", "traditional": "賓館", "pinyin": "bīnguǎn", "english": "hotel; guesthouse", "category": "place"},

    # ============================================================
    # NOUNS - Home & Appliances
    # ============================================================
    {"simplified": "客厅", "traditional": "客廳", "pinyin": "kètīng", "english": "living room", "category": "home"},
    {"simplified": "厨房", "traditional": "廚房", "pinyin": "chúfáng", "english": "kitchen", "category": "home"},
    {"simplified": "卧室", "traditional": "臥室", "pinyin": "wòshì", "english": "bedroom", "category": "home"},
    {"simplified": "冰箱", "traditional": "冰箱", "pinyin": "bīngxiāng", "english": "refrigerator", "category": "home"},
    {"simplified": "洗衣机", "traditional": "洗衣機", "pinyin": "xǐyījī", "english": "washing machine", "category": "home"},
    {"simplified": "空调", "traditional": "空調", "pinyin": "kōngtiáo", "english": "air conditioning", "category": "home"},
    {"simplified": "电梯", "traditional": "電梯", "pinyin": "diàntī", "english": "elevator; lift", "category": "home"},
    {"simplified": "阳台", "traditional": "陽臺", "pinyin": "yángtái", "english": "balcony", "category": "home"},
    {"simplified": "镜子", "traditional": "鏡子", "pinyin": "jìngzi", "english": "mirror", "category": "home"},

    # ============================================================
    # NOUNS - Personal Items & Travel
    # ============================================================
    {"simplified": "信用卡", "traditional": "信用卡", "pinyin": "xìnyòngkǎ", "english": "credit card", "category": "object"},
    {"simplified": "护照", "traditional": "護照", "pinyin": "hùzhào", "english": "passport", "category": "object"},
    {"simplified": "行李箱", "traditional": "行李箱", "pinyin": "xínglixiāng", "english": "suitcase; luggage", "category": "object"},
    {"simplified": "照片", "traditional": "照片", "pinyin": "zhàopiàn", "english": "photo; picture", "category": "object"},
    {"simplified": "礼物", "traditional": "禮物", "pinyin": "lǐwù", "english": "gift; present", "category": "object"},
    {"simplified": "眼镜", "traditional": "眼鏡", "pinyin": "yǎnjìng", "english": "glasses; eyeglasses", "category": "object"},
    {"simplified": "钥匙", "traditional": "鑰匙", "pinyin": "yàoshi", "english": "key", "category": "object"},

    # ============================================================
    # NOUNS - Media & Communication
    # ============================================================
    {"simplified": "节目", "traditional": "節目", "pinyin": "jiémù", "english": "program; show", "category": "media"},
    {"simplified": "新闻", "traditional": "新聞", "pinyin": "xīnwén", "english": "news", "category": "media"},
    {"simplified": "广告", "traditional": "廣告", "pinyin": "guǎnggào", "english": "advertisement", "category": "media"},
    {"simplified": "信", "traditional": "信", "pinyin": "xìn", "english": "letter; mail", "category": "media"},
    {"simplified": "邮件", "traditional": "郵件", "pinyin": "yóujiàn", "english": "email; mail", "category": "media"},
    {"simplified": "消息", "traditional": "消息", "pinyin": "xiāoxi", "english": "message; news", "category": "media"},
    {"simplified": "网站", "traditional": "網站", "pinyin": "wǎngzhàn", "english": "website", "category": "media"},

    # ============================================================
    # NOUNS - Culture, Society & Abstract
    # ============================================================
    {"simplified": "文化", "traditional": "文化", "pinyin": "wénhuà", "english": "culture", "category": "abstract"},
    {"simplified": "习惯", "traditional": "習慣", "pinyin": "xíguàn", "english": "habit; custom", "category": "abstract"},
    {"simplified": "经验", "traditional": "經驗", "pinyin": "jīngyàn", "english": "experience", "category": "abstract"},
    {"simplified": "关系", "traditional": "關係", "pinyin": "guānxi", "english": "relationship; connection", "category": "abstract"},
    {"simplified": "办法", "traditional": "辦法", "pinyin": "bànfǎ", "english": "method; way", "category": "abstract"},
    {"simplified": "作用", "traditional": "作用", "pinyin": "zuòyòng", "english": "effect; function", "category": "abstract"},
    {"simplified": "影响", "traditional": "影響", "pinyin": "yǐngxiǎng", "english": "influence; effect", "category": "abstract"},
    {"simplified": "机会", "traditional": "機會", "pinyin": "jīhuì", "english": "opportunity; chance", "category": "abstract"},
    {"simplified": "条件", "traditional": "條件", "pinyin": "tiáojiàn", "english": "condition; requirement", "category": "abstract"},
    {"simplified": "结果", "traditional": "結果", "pinyin": "jiéguǒ", "english": "result; outcome", "category": "abstract"},
    {"simplified": "秘密", "traditional": "秘密", "pinyin": "mìmì", "english": "secret", "category": "abstract"},
    {"simplified": "感觉", "traditional": "感覺", "pinyin": "gǎnjué", "english": "feeling; sensation", "category": "abstract"},
    {"simplified": "兴趣", "traditional": "興趣", "pinyin": "xìngqù", "english": "interest", "category": "abstract"},
    {"simplified": "爱好", "traditional": "愛好", "pinyin": "àihào", "english": "hobby; interest", "category": "abstract"},
    {"simplified": "水平", "traditional": "水平", "pinyin": "shuǐpíng", "english": "level; standard", "category": "abstract"},
    {"simplified": "态度", "traditional": "態度", "pinyin": "tàidu", "english": "attitude", "category": "abstract"},
    {"simplified": "声音", "traditional": "聲音", "pinyin": "shēngyīn", "english": "sound; voice", "category": "abstract"},
    {"simplified": "味道", "traditional": "味道", "pinyin": "wèidao", "english": "taste; flavor", "category": "abstract"},
    {"simplified": "方向", "traditional": "方向", "pinyin": "fāngxiàng", "english": "direction", "category": "abstract"},
    {"simplified": "距离", "traditional": "距離", "pinyin": "jùlí", "english": "distance", "category": "abstract"},
    {"simplified": "速度", "traditional": "速度", "pinyin": "sùdù", "english": "speed", "category": "abstract"},
    {"simplified": "重点", "traditional": "重點", "pinyin": "zhòngdiǎn", "english": "key point; emphasis", "category": "abstract"},
    {"simplified": "方法", "traditional": "方法", "pinyin": "fāngfǎ", "english": "method; way", "category": "abstract"},
    {"simplified": "知识", "traditional": "知識", "pinyin": "zhīshi", "english": "knowledge", "category": "abstract"},
    {"simplified": "标准", "traditional": "標準", "pinyin": "biāozhǔn", "english": "standard; criterion", "category": "abstract"},
    {"simplified": "价格", "traditional": "價格", "pinyin": "jiàgé", "english": "price", "category": "abstract"},
    {"simplified": "交通", "traditional": "交通", "pinyin": "jiāotōng", "english": "traffic; transportation", "category": "abstract"},
    {"simplified": "经济", "traditional": "經濟", "pinyin": "jīngjì", "english": "economy; economic", "category": "abstract"},
    {"simplified": "技术", "traditional": "技術", "pinyin": "jìshù", "english": "technology; technique", "category": "abstract"},
    {"simplified": "梦", "traditional": "夢", "pinyin": "mèng", "english": "dream", "category": "abstract"},
    {"simplified": "印象", "traditional": "印象", "pinyin": "yìnxiàng", "english": "impression", "category": "abstract"},
    {"simplified": "效果", "traditional": "效果", "pinyin": "xiàoguǒ", "english": "effect; result", "category": "abstract"},
    {"simplified": "原因", "traditional": "原因", "pinyin": "yuányīn", "english": "reason; cause", "category": "abstract"},
    {"simplified": "目的", "traditional": "目的", "pinyin": "mùdì", "english": "purpose; aim", "category": "abstract"},

    # ============================================================
    # NOUNS - Education & Learning
    # ============================================================
    {"simplified": "自然", "traditional": "自然", "pinyin": "zìrán", "english": "nature; natural", "category": "education"},
    {"simplified": "数学", "traditional": "數學", "pinyin": "shùxué", "english": "mathematics", "category": "education"},
    {"simplified": "历史", "traditional": "歷史", "pinyin": "lìshǐ", "english": "history", "category": "education"},
    {"simplified": "科学", "traditional": "科學", "pinyin": "kēxué", "english": "science", "category": "education"},
    {"simplified": "艺术", "traditional": "藝術", "pinyin": "yìshù", "english": "art", "category": "education"},
    {"simplified": "音乐", "traditional": "音樂", "pinyin": "yīnyuè", "english": "music", "category": "education"},
    {"simplified": "体育", "traditional": "體育", "pinyin": "tǐyù", "english": "sports; physical education", "category": "education"},
    {"simplified": "游戏", "traditional": "遊戲", "pinyin": "yóuxì", "english": "game", "category": "education"},
    {"simplified": "比赛", "traditional": "比賽", "pinyin": "bǐsài", "english": "competition; match", "category": "education"},
    {"simplified": "成绩", "traditional": "成績", "pinyin": "chéngjì", "english": "grade; achievement", "category": "education"},
    {"simplified": "作业", "traditional": "作業", "pinyin": "zuòyè", "english": "homework; assignment", "category": "education"},
    {"simplified": "作文", "traditional": "作文", "pinyin": "zuòwén", "english": "essay; composition", "category": "education"},
    {"simplified": "日记", "traditional": "日記", "pinyin": "rìjì", "english": "diary; journal", "category": "education"},
    {"simplified": "字典", "traditional": "字典", "pinyin": "zìdiǎn", "english": "dictionary", "category": "education"},
    {"simplified": "笔记本", "traditional": "筆記本", "pinyin": "bǐjìběn", "english": "notebook", "category": "education"},
    {"simplified": "语法", "traditional": "語法", "pinyin": "yǔfǎ", "english": "grammar", "category": "education"},

    # ============================================================
    # NOUNS - Body & Appearance
    # ============================================================
    {"simplified": "皮肤", "traditional": "皮膚", "pinyin": "pífū", "english": "skin", "category": "body"},
    {"simplified": "头发", "traditional": "頭髮", "pinyin": "tóufa", "english": "hair (on head)", "category": "body"},

    # ============================================================
    # NOUNS - Clothing
    # ============================================================
    {"simplified": "衬衫", "traditional": "襯衫", "pinyin": "chènshān", "english": "shirt; blouse", "category": "clothing"},
    {"simplified": "裙子", "traditional": "裙子", "pinyin": "qúnzi", "english": "skirt; dress", "category": "clothing"},
    {"simplified": "裤子", "traditional": "褲子", "pinyin": "kùzi", "english": "pants; trousers", "category": "clothing"},
    {"simplified": "帽子", "traditional": "帽子", "pinyin": "màozi", "english": "hat; cap", "category": "clothing"},
    {"simplified": "袜子", "traditional": "襪子", "pinyin": "wàzi", "english": "socks; stockings", "category": "clothing"},
    {"simplified": "手套", "traditional": "手套", "pinyin": "shǒutào", "english": "gloves", "category": "clothing"},

    # ============================================================
    # NOUNS - Nature & Environment
    # ============================================================
    {"simplified": "动物", "traditional": "動物", "pinyin": "dòngwù", "english": "animal", "category": "nature"},
    {"simplified": "植物", "traditional": "植物", "pinyin": "zhíwù", "english": "plant", "category": "nature"},
    {"simplified": "森林", "traditional": "森林", "pinyin": "sēnlín", "english": "forest", "category": "nature"},
    {"simplified": "河流", "traditional": "河流", "pinyin": "héliú", "english": "river", "category": "nature"},
    {"simplified": "太阳", "traditional": "太陽", "pinyin": "tàiyáng", "english": "sun", "category": "nature"},
    {"simplified": "月亮", "traditional": "月亮", "pinyin": "yuèliang", "english": "moon", "category": "nature"},
    {"simplified": "星星", "traditional": "星星", "pinyin": "xīngxing", "english": "star", "category": "nature"},
    {"simplified": "空气", "traditional": "空氣", "pinyin": "kōngqì", "english": "air", "category": "nature"},
    {"simplified": "温度", "traditional": "溫度", "pinyin": "wēndù", "english": "temperature", "category": "nature"},
    {"simplified": "季节", "traditional": "季節", "pinyin": "jìjié", "english": "season", "category": "nature"},
    {"simplified": "春天", "traditional": "春天", "pinyin": "chūntiān", "english": "spring (season)", "category": "nature"},
    {"simplified": "夏天", "traditional": "夏天", "pinyin": "xiàtiān", "english": "summer", "category": "nature"},
    {"simplified": "秋天", "traditional": "秋天", "pinyin": "qiūtiān", "english": "autumn; fall", "category": "nature"},
    {"simplified": "冬天", "traditional": "冬天", "pinyin": "dōngtiān", "english": "winter", "category": "nature"},
    {"simplified": "大海", "traditional": "大海", "pinyin": "dàhǎi", "english": "ocean; sea", "category": "nature"},

    # ============================================================
    # VERBS - Household Actions
    # ============================================================
    {"simplified": "打扫", "traditional": "打掃", "pinyin": "dǎsǎo", "english": "to clean; to sweep", "category": "verb"},
    {"simplified": "打算", "traditional": "打算", "pinyin": "dǎsuàn", "english": "to plan; to intend", "category": "verb"},
    {"simplified": "搬", "traditional": "搬", "pinyin": "bān", "english": "to move (objects)", "category": "verb"},
    {"simplified": "放", "traditional": "放", "pinyin": "fàng", "english": "to put; to place", "category": "verb"},
    {"simplified": "挂", "traditional": "掛", "pinyin": "guà", "english": "to hang", "category": "verb"},
    {"simplified": "拿", "traditional": "拿", "pinyin": "ná", "english": "to take; to hold", "category": "verb"},
    {"simplified": "拉", "traditional": "拉", "pinyin": "lā", "english": "to pull; to drag", "category": "verb"},
    {"simplified": "推", "traditional": "推", "pinyin": "tuī", "english": "to push", "category": "verb"},

    # ============================================================
    # VERBS - Administrative & Formal Actions
    # ============================================================
    {"simplified": "申请", "traditional": "申請", "pinyin": "shēnqǐng", "english": "to apply (for)", "category": "verb"},
    {"simplified": "填", "traditional": "填", "pinyin": "tián", "english": "to fill in; to complete (a form)", "category": "verb"},
    {"simplified": "签", "traditional": "簽", "pinyin": "qiān", "english": "to sign", "category": "verb"},
    {"simplified": "寄", "traditional": "寄", "pinyin": "jì", "english": "to send; to mail", "category": "verb"},
    {"simplified": "收", "traditional": "收", "pinyin": "shōu", "english": "to receive; to collect", "category": "verb"},

    # ============================================================
    # VERBS - Travel & Activity
    # ============================================================
    {"simplified": "参观", "traditional": "參觀", "pinyin": "cānguān", "english": "to visit (a place)", "category": "verb"},
    {"simplified": "旅游", "traditional": "旅遊", "pinyin": "lǚyóu", "english": "to travel; to tour", "category": "verb"},
    {"simplified": "计划", "traditional": "計劃", "pinyin": "jìhuà", "english": "to plan; plan", "category": "verb"},
    {"simplified": "准备", "traditional": "準備", "pinyin": "zhǔnbèi", "english": "to prepare", "category": "verb"},
    {"simplified": "安排", "traditional": "安排", "pinyin": "ānpái", "english": "to arrange; arrangement", "category": "verb"},

    # ============================================================
    # VERBS - Decision & Problem-solving
    # ============================================================
    {"simplified": "决定", "traditional": "決定", "pinyin": "juédìng", "english": "to decide; decision", "category": "verb"},
    {"simplified": "解决", "traditional": "解決", "pinyin": "jiějué", "english": "to solve; to resolve", "category": "verb"},
    {"simplified": "比较", "traditional": "比較", "pinyin": "bǐjiào", "english": "to compare; relatively", "category": "verb"},

    # ============================================================
    # VERBS - Communication & Expression
    # ============================================================
    {"simplified": "表示", "traditional": "表示", "pinyin": "biǎoshì", "english": "to express; to indicate", "category": "verb"},
    {"simplified": "表演", "traditional": "表演", "pinyin": "biǎoyǎn", "english": "to perform; performance", "category": "verb"},
    {"simplified": "介绍", "traditional": "介紹", "pinyin": "jièshào", "english": "to introduce; introduction", "category": "verb"},
    {"simplified": "讨论", "traditional": "討論", "pinyin": "tǎolùn", "english": "to discuss; discussion", "category": "verb"},
    {"simplified": "翻译", "traditional": "翻譯", "pinyin": "fānyì", "english": "to translate; translator", "category": "verb"},

    # ============================================================
    # VERBS - Research & Development
    # ============================================================
    {"simplified": "研究", "traditional": "研究", "pinyin": "yánjiū", "english": "to research; research", "category": "verb"},
    {"simplified": "调查", "traditional": "調查", "pinyin": "diàochá", "english": "to investigate; survey", "category": "verb"},
    {"simplified": "发展", "traditional": "發展", "pinyin": "fāzhǎn", "english": "to develop; development", "category": "verb"},
    {"simplified": "提高", "traditional": "提高", "pinyin": "tígāo", "english": "to improve; to raise", "category": "verb"},
    {"simplified": "发现", "traditional": "發現", "pinyin": "fāxiàn", "english": "to discover; to find", "category": "verb"},
    {"simplified": "改变", "traditional": "改變", "pinyin": "gǎibiàn", "english": "to change; to transform", "category": "verb"},
    {"simplified": "保护", "traditional": "保護", "pinyin": "bǎohù", "english": "to protect", "category": "verb"},

    # ============================================================
    # VERBS - Mental & Cognitive
    # ============================================================
    {"simplified": "理解", "traditional": "理解", "pinyin": "lǐjiě", "english": "to understand; to comprehend", "category": "verb"},
    {"simplified": "相信", "traditional": "相信", "pinyin": "xiāngxìn", "english": "to believe; to trust", "category": "verb"},
    {"simplified": "怀疑", "traditional": "懷疑", "pinyin": "huáiyí", "english": "to doubt; to suspect", "category": "verb"},
    {"simplified": "回忆", "traditional": "回憶", "pinyin": "huíyì", "english": "to recall; memory", "category": "verb"},
    {"simplified": "提醒", "traditional": "提醒", "pinyin": "tíxǐng", "english": "to remind", "category": "verb"},

    # ============================================================
    # VERBS - Social Interaction
    # ============================================================
    {"simplified": "鼓励", "traditional": "鼓勵", "pinyin": "gǔlì", "english": "to encourage", "category": "verb"},
    {"simplified": "批评", "traditional": "批評", "pinyin": "pīpíng", "english": "to criticize; criticism", "category": "verb"},
    {"simplified": "原谅", "traditional": "原諒", "pinyin": "yuánliàng", "english": "to forgive; to excuse", "category": "verb"},
    {"simplified": "拒绝", "traditional": "拒絕", "pinyin": "jùjué", "english": "to refuse; to reject", "category": "verb"},
    {"simplified": "接受", "traditional": "接受", "pinyin": "jiēshòu", "english": "to accept", "category": "verb"},
    {"simplified": "感动", "traditional": "感動", "pinyin": "gǎndòng", "english": "to move (emotionally); touched", "category": "verb"},
    {"simplified": "感谢", "traditional": "感謝", "pinyin": "gǎnxiè", "english": "to thank; grateful", "category": "verb"},
    {"simplified": "羡慕", "traditional": "羨慕", "pinyin": "xiànmù", "english": "to envy; to admire", "category": "verb"},

    # ============================================================
    # VERBS - Emotions & States
    # ============================================================
    {"simplified": "担心", "traditional": "擔心", "pinyin": "dānxīn", "english": "to worry", "category": "verb"},
    {"simplified": "害怕", "traditional": "害怕", "pinyin": "hàipà", "english": "to be afraid; to fear", "category": "verb"},
    {"simplified": "后悔", "traditional": "後悔", "pinyin": "hòuhuǐ", "english": "to regret", "category": "verb"},
    {"simplified": "生气", "traditional": "生氣", "pinyin": "shēngqì", "english": "to get angry", "category": "verb"},
    {"simplified": "失望", "traditional": "失望", "pinyin": "shīwàng", "english": "to be disappointed", "category": "verb"},

    # ============================================================
    # VERBS - Persistence & Achievement
    # ============================================================
    {"simplified": "适应", "traditional": "適應", "pinyin": "shìyìng", "english": "to adapt; to get used to", "category": "verb"},
    {"simplified": "坚持", "traditional": "堅持", "pinyin": "jiānchí", "english": "to persist; to insist", "category": "verb"},
    {"simplified": "放弃", "traditional": "放棄", "pinyin": "fàngqì", "english": "to give up; to abandon", "category": "verb"},
    {"simplified": "完成", "traditional": "完成", "pinyin": "wánchéng", "english": "to complete; to finish", "category": "verb"},
    {"simplified": "继续", "traditional": "繼續", "pinyin": "jìxù", "english": "to continue", "category": "verb"},
    {"simplified": "赢", "traditional": "贏", "pinyin": "yíng", "english": "to win", "category": "verb"},
    {"simplified": "输", "traditional": "輸", "pinyin": "shū", "english": "to lose (a game)", "category": "verb"},

    # ============================================================
    # VERBS - Organization & Education
    # ============================================================
    {"simplified": "参加", "traditional": "參加", "pinyin": "cānjiā", "english": "to participate; to join", "category": "verb"},
    {"simplified": "组织", "traditional": "組織", "pinyin": "zǔzhī", "english": "to organize; organization", "category": "verb"},
    {"simplified": "培养", "traditional": "培養", "pinyin": "péiyǎng", "english": "to train; to cultivate", "category": "verb"},
    {"simplified": "教育", "traditional": "教育", "pinyin": "jiàoyù", "english": "to educate; education", "category": "verb"},
    {"simplified": "修理", "traditional": "修理", "pinyin": "xiūlǐ", "english": "to repair; to fix", "category": "verb"},
    {"simplified": "打扮", "traditional": "打扮", "pinyin": "dǎban", "english": "to dress up; to make up", "category": "verb"},

    # ============================================================
    # VERBS - Additional Common Verbs
    # ============================================================
    {"simplified": "吸引", "traditional": "吸引", "pinyin": "xīyǐn", "english": "to attract", "category": "verb"},
    {"simplified": "通知", "traditional": "通知", "pinyin": "tōngzhī", "english": "to notify; notice", "category": "verb"},
    {"simplified": "来不及", "traditional": "來不及", "pinyin": "láibují", "english": "there's not enough time", "category": "verb"},
    {"simplified": "来得及", "traditional": "來得及", "pinyin": "láidejí", "english": "there's still time", "category": "verb"},
    {"simplified": "弄", "traditional": "弄", "pinyin": "nòng", "english": "to do; to make; to handle", "category": "verb"},
    {"simplified": "猜", "traditional": "猜", "pinyin": "cāi", "english": "to guess", "category": "verb"},
    {"simplified": "获得", "traditional": "獲得", "pinyin": "huòdé", "english": "to obtain; to gain", "category": "verb"},
    {"simplified": "减少", "traditional": "減少", "pinyin": "jiǎnshǎo", "english": "to reduce; to decrease", "category": "verb"},
    {"simplified": "增加", "traditional": "增加", "pinyin": "zēngjiā", "english": "to increase; to add", "category": "verb"},
    {"simplified": "存", "traditional": "存", "pinyin": "cún", "english": "to save; to store; to deposit", "category": "verb"},
    {"simplified": "交", "traditional": "交", "pinyin": "jiāo", "english": "to hand over; to submit", "category": "verb"},
    {"simplified": "养成", "traditional": "養成", "pinyin": "yǎngchéng", "english": "to form (a habit); to develop", "category": "verb"},
    {"simplified": "道歉", "traditional": "道歉", "pinyin": "dàoqiàn", "english": "to apologize", "category": "verb"},
    {"simplified": "尊重", "traditional": "尊重", "pinyin": "zūnzhòng", "english": "to respect", "category": "verb"},
    {"simplified": "区别", "traditional": "區別", "pinyin": "qūbié", "english": "to distinguish; difference", "category": "verb"},

    # ============================================================
    # ADJECTIVES - Safety & Complexity
    # ============================================================
    {"simplified": "安全", "traditional": "安全", "pinyin": "ānquán", "english": "safe; safety", "category": "adjective"},
    {"simplified": "危险", "traditional": "危險", "pinyin": "wēixiǎn", "english": "dangerous; danger", "category": "adjective"},
    {"simplified": "复杂", "traditional": "複雜", "pinyin": "fùzá", "english": "complicated; complex", "category": "adjective"},
    {"simplified": "简单", "traditional": "簡單", "pinyin": "jiǎndān", "english": "simple; easy", "category": "adjective"},
    {"simplified": "丰富", "traditional": "豐富", "pinyin": "fēngfù", "english": "rich; abundant", "category": "adjective"},

    # ============================================================
    # ADJECTIVES - Quality & Character
    # ============================================================
    {"simplified": "正常", "traditional": "正常", "pinyin": "zhèngcháng", "english": "normal; regular", "category": "adjective"},
    {"simplified": "普通", "traditional": "普通", "pinyin": "pǔtōng", "english": "ordinary; common", "category": "adjective"},
    {"simplified": "特别", "traditional": "特別", "pinyin": "tèbié", "english": "special; especially", "category": "adjective"},
    {"simplified": "著名", "traditional": "著名", "pinyin": "zhùmíng", "english": "famous; well-known", "category": "adjective"},
    {"simplified": "重要", "traditional": "重要", "pinyin": "zhòngyào", "english": "important", "category": "adjective"},
    {"simplified": "精彩", "traditional": "精彩", "pinyin": "jīngcǎi", "english": "brilliant; wonderful", "category": "adjective"},
    {"simplified": "美丽", "traditional": "美麗", "pinyin": "měilì", "english": "beautiful", "category": "adjective"},
    {"simplified": "可爱", "traditional": "可愛", "pinyin": "kě'ài", "english": "cute; lovely", "category": "adjective"},

    # ============================================================
    # ADJECTIVES - Personality & Attitude
    # ============================================================
    {"simplified": "幽默", "traditional": "幽默", "pinyin": "yōumò", "english": "humorous", "category": "adjective"},
    {"simplified": "温柔", "traditional": "溫柔", "pinyin": "wēnróu", "english": "gentle; tender", "category": "adjective"},
    {"simplified": "积极", "traditional": "積極", "pinyin": "jījí", "english": "positive; active", "category": "adjective"},
    {"simplified": "消极", "traditional": "消極", "pinyin": "xiāojí", "english": "negative; passive", "category": "adjective"},
    {"simplified": "严格", "traditional": "嚴格", "pinyin": "yángé", "english": "strict; rigorous", "category": "adjective"},
    {"simplified": "勤快", "traditional": "勤快", "pinyin": "qínkuai", "english": "diligent; hardworking", "category": "adjective"},
    {"simplified": "懒", "traditional": "懶", "pinyin": "lǎn", "english": "lazy", "category": "adjective"},
    {"simplified": "聪明", "traditional": "聰明", "pinyin": "cōngmíng", "english": "clever; intelligent", "category": "adjective"},
    {"simplified": "诚实", "traditional": "誠實", "pinyin": "chéngshí", "english": "honest; sincere", "category": "adjective"},
    {"simplified": "骄傲", "traditional": "驕傲", "pinyin": "jiāo'ào", "english": "proud; arrogant", "category": "adjective"},
    {"simplified": "谦虚", "traditional": "謙虛", "pinyin": "qiānxū", "english": "modest; humble", "category": "adjective"},

    # ============================================================
    # ADJECTIVES - Emotions & Feelings
    # ============================================================
    {"simplified": "紧张", "traditional": "緊張", "pinyin": "jǐnzhāng", "english": "nervous; tense", "category": "adjective"},
    {"simplified": "激动", "traditional": "激動", "pinyin": "jīdòng", "english": "excited; emotional", "category": "adjective"},
    {"simplified": "伤心", "traditional": "傷心", "pinyin": "shāngxīn", "english": "sad; heartbroken", "category": "adjective"},
    {"simplified": "孤独", "traditional": "孤獨", "pinyin": "gūdú", "english": "lonely; solitary", "category": "adjective"},
    {"simplified": "无聊", "traditional": "無聊", "pinyin": "wúliáo", "english": "bored; boring", "category": "adjective"},
    {"simplified": "辛苦", "traditional": "辛苦", "pinyin": "xīnkǔ", "english": "hard; laborious", "category": "adjective"},
    {"simplified": "幸福", "traditional": "幸福", "pinyin": "xìngfú", "english": "happy; blessed", "category": "adjective"},
    {"simplified": "满意", "traditional": "滿意", "pinyin": "mǎnyì", "english": "satisfied", "category": "adjective"},

    # ============================================================
    # ADJECTIVES - Physical States
    # ============================================================
    {"simplified": "穷", "traditional": "窮", "pinyin": "qióng", "english": "poor", "category": "adjective"},
    {"simplified": "富", "traditional": "富", "pinyin": "fù", "english": "rich; wealthy", "category": "adjective"},
    {"simplified": "饿", "traditional": "餓", "pinyin": "è", "english": "hungry", "category": "adjective"},
    {"simplified": "渴", "traditional": "渴", "pinyin": "kě", "english": "thirsty", "category": "adjective"},

    # ============================================================
    # ADJECTIVES - Convenience & Suitability
    # ============================================================
    {"simplified": "合适", "traditional": "合適", "pinyin": "héshì", "english": "suitable; appropriate", "category": "adjective"},
    {"simplified": "方便", "traditional": "方便", "pinyin": "fāngbiàn", "english": "convenient", "category": "adjective"},
    {"simplified": "及时", "traditional": "及時", "pinyin": "jíshí", "english": "timely; in time", "category": "adjective"},

    # ============================================================
    # ADJECTIVES - Additional
    # ============================================================
    {"simplified": "正式", "traditional": "正式", "pinyin": "zhèngshì", "english": "formal; official", "category": "adjective"},
    {"simplified": "流利", "traditional": "流利", "pinyin": "liúlì", "english": "fluent", "category": "adjective"},
    {"simplified": "详细", "traditional": "詳細", "pinyin": "xiángxì", "english": "detailed", "category": "adjective"},
    {"simplified": "免费", "traditional": "免費", "pinyin": "miǎnfèi", "english": "free (of charge)", "category": "adjective"},
    {"simplified": "优秀", "traditional": "優秀", "pinyin": "yōuxiù", "english": "excellent; outstanding", "category": "adjective"},
    {"simplified": "基本", "traditional": "基本", "pinyin": "jīběn", "english": "basic; fundamental", "category": "adjective"},
    {"simplified": "完整", "traditional": "完整", "pinyin": "wánzhěng", "english": "complete; intact", "category": "adjective"},
    {"simplified": "准确", "traditional": "準確", "pinyin": "zhǔnquè", "english": "accurate; precise", "category": "adjective"},
    {"simplified": "深", "traditional": "深", "pinyin": "shēn", "english": "deep; profound", "category": "adjective"},
    {"simplified": "浅", "traditional": "淺", "pinyin": "qiǎn", "english": "shallow; light (color)", "category": "adjective"},
    {"simplified": "厚", "traditional": "厚", "pinyin": "hòu", "english": "thick", "category": "adjective"},
    {"simplified": "薄", "traditional": "薄", "pinyin": "báo", "english": "thin", "category": "adjective"},

    # ============================================================
    # ADVERBS
    # ============================================================
    {"simplified": "其实", "traditional": "其實", "pinyin": "qíshí", "english": "actually; in fact", "category": "adverb"},
    {"simplified": "确实", "traditional": "確實", "pinyin": "quèshí", "english": "indeed; really", "category": "adverb"},
    {"simplified": "差不多", "traditional": "差不多", "pinyin": "chàbuduō", "english": "almost; about the same", "category": "adverb"},
    {"simplified": "大概", "traditional": "大概", "pinyin": "dàgài", "english": "probably; roughly", "category": "adverb"},
    {"simplified": "偶尔", "traditional": "偶爾", "pinyin": "ǒu'ěr", "english": "occasionally", "category": "adverb"},
    {"simplified": "忽然", "traditional": "忽然", "pinyin": "hūrán", "english": "suddenly", "category": "adverb"},
    {"simplified": "渐渐", "traditional": "漸漸", "pinyin": "jiànjiàn", "english": "gradually", "category": "adverb"},
    {"simplified": "互相", "traditional": "互相", "pinyin": "hùxiāng", "english": "mutually; each other", "category": "adverb"},
    {"simplified": "的确", "traditional": "的確", "pinyin": "díquè", "english": "indeed; certainly", "category": "adverb"},
    {"simplified": "竟然", "traditional": "竟然", "pinyin": "jìngrán", "english": "unexpectedly; to one's surprise", "category": "adverb"},
    {"simplified": "反而", "traditional": "反而", "pinyin": "fǎn'ér", "english": "on the contrary; instead", "category": "adverb"},
    {"simplified": "千万", "traditional": "千萬", "pinyin": "qiānwàn", "english": "by all means; absolutely must", "category": "adverb"},
    {"simplified": "至少", "traditional": "至少", "pinyin": "zhìshǎo", "english": "at least", "category": "adverb"},
    {"simplified": "往往", "traditional": "往往", "pinyin": "wǎngwǎng", "english": "often; frequently", "category": "adverb"},
    {"simplified": "仍然", "traditional": "仍然", "pinyin": "réngrán", "english": "still; yet", "category": "adverb"},
    {"simplified": "恰好", "traditional": "恰好", "pinyin": "qiàhǎo", "english": "just right; coincidentally", "category": "adverb"},
    {"simplified": "稍微", "traditional": "稍微", "pinyin": "shāowēi", "english": "slightly; a little", "category": "adverb"},

    # ============================================================
    # CONJUNCTIONS & CONNECTORS
    # ============================================================
    {"simplified": "既然", "traditional": "既然", "pinyin": "jìrán", "english": "since; now that", "category": "conjunction"},
    {"simplified": "否则", "traditional": "否則", "pinyin": "fǒuzé", "english": "otherwise; or else", "category": "conjunction"},
    {"simplified": "另外", "traditional": "另外", "pinyin": "lìngwài", "english": "in addition; moreover", "category": "conjunction"},
    {"simplified": "尽管", "traditional": "儘管", "pinyin": "jǐnguǎn", "english": "despite; even though", "category": "conjunction"},
    {"simplified": "由于", "traditional": "由於", "pinyin": "yóuyú", "english": "due to; because of", "category": "conjunction"},
    {"simplified": "于是", "traditional": "於是", "pinyin": "yúshì", "english": "therefore; thereupon", "category": "conjunction"},
    {"simplified": "不过", "traditional": "不過", "pinyin": "búguò", "english": "however; but", "category": "conjunction"},
    {"simplified": "只要", "traditional": "只要", "pinyin": "zhǐyào", "english": "as long as", "category": "conjunction"},
    {"simplified": "如果", "traditional": "如果", "pinyin": "rúguǒ", "english": "if", "category": "conjunction"},
    {"simplified": "虽然", "traditional": "雖然", "pinyin": "suīrán", "english": "although; even though", "category": "conjunction"},
    {"simplified": "即使", "traditional": "即使", "pinyin": "jíshǐ", "english": "even if; even though", "category": "conjunction"},
    {"simplified": "无论", "traditional": "無論", "pinyin": "wúlùn", "english": "no matter; regardless", "category": "conjunction"},
    {"simplified": "不但", "traditional": "不但", "pinyin": "búdàn", "english": "not only", "category": "conjunction"},
    {"simplified": "而且", "traditional": "而且", "pinyin": "érqiě", "english": "moreover; and also", "category": "conjunction"},
    {"simplified": "然而", "traditional": "然而", "pinyin": "rán'ér", "english": "however; but", "category": "conjunction"},
    {"simplified": "因此", "traditional": "因此", "pinyin": "yīncǐ", "english": "therefore; consequently", "category": "conjunction"},

    # ============================================================
    # MEASURE WORDS
    # ============================================================
    {"simplified": "份", "traditional": "份", "pinyin": "fèn", "english": "MW for copies, portions", "category": "measure_word"},
    {"simplified": "双", "traditional": "雙", "pinyin": "shuāng", "english": "MW for pairs; pair", "category": "measure_word"},
    {"simplified": "副", "traditional": "副", "pinyin": "fù", "english": "MW for pairs (glasses, gloves)", "category": "measure_word"},
    {"simplified": "把", "traditional": "把", "pinyin": "bǎ", "english": "MW for objects with handles", "category": "measure_word"},
    {"simplified": "根", "traditional": "根", "pinyin": "gēn", "english": "MW for long thin objects", "category": "measure_word"},
    {"simplified": "条", "traditional": "條", "pinyin": "tiáo", "english": "MW for long things; strip", "category": "measure_word"},
    {"simplified": "首", "traditional": "首", "pinyin": "shǒu", "english": "MW for songs and poems", "category": "measure_word"},
    {"simplified": "篇", "traditional": "篇", "pinyin": "piān", "english": "MW for articles and essays", "category": "measure_word"},
    {"simplified": "场", "traditional": "場", "pinyin": "chǎng", "english": "MW for events, games", "category": "measure_word"},
    {"simplified": "座", "traditional": "座", "pinyin": "zuò", "english": "MW for buildings, mountains", "category": "measure_word"},
    {"simplified": "页", "traditional": "頁", "pinyin": "yè", "english": "MW for pages", "category": "measure_word"},
    {"simplified": "堆", "traditional": "堆", "pinyin": "duī", "english": "MW for piles; heap", "category": "measure_word"},

    # ============================================================
    # PREPOSITIONS & PARTICLES
    # ============================================================
    {"simplified": "关于", "traditional": "關於", "pinyin": "guānyú", "english": "about; regarding", "category": "grammar"},
    {"simplified": "对于", "traditional": "對於", "pinyin": "duìyú", "english": "with regard to; as for", "category": "grammar"},
    {"simplified": "按照", "traditional": "按照", "pinyin": "ànzhào", "english": "according to", "category": "grammar"},
    {"simplified": "随着", "traditional": "隨著", "pinyin": "suízhe", "english": "along with; as", "category": "grammar"},

    # ============================================================
    # TIME EXPRESSIONS
    # ============================================================
    {"simplified": "刚才", "traditional": "剛才", "pinyin": "gāngcái", "english": "just now; a moment ago", "category": "time"},
    {"simplified": "马上", "traditional": "馬上", "pinyin": "mǎshàng", "english": "immediately; at once", "category": "time"},
    {"simplified": "将来", "traditional": "將來", "pinyin": "jiānglái", "english": "future; in the future", "category": "time"},
    {"simplified": "永远", "traditional": "永遠", "pinyin": "yǒngyuǎn", "english": "forever; always", "category": "time"},
    {"simplified": "暂时", "traditional": "暫時", "pinyin": "zànshí", "english": "temporarily", "category": "time"},
    {"simplified": "从此", "traditional": "從此", "pinyin": "cóngcǐ", "english": "from now on; since then", "category": "time"},

    # ============================================================
    # NOUNS - Additional Common Words
    # ============================================================
    {"simplified": "能力", "traditional": "能力", "pinyin": "nénglì", "english": "ability; capability", "category": "abstract"},
    {"simplified": "责任", "traditional": "責任", "pinyin": "zérèn", "english": "responsibility; duty", "category": "abstract"},
    {"simplified": "规定", "traditional": "規定", "pinyin": "guīdìng", "english": "rule; regulation", "category": "abstract"},
    {"simplified": "情况", "traditional": "情況", "pinyin": "qíngkuàng", "english": "situation; condition", "category": "abstract"},
    {"simplified": "生命", "traditional": "生命", "pinyin": "shēngmìng", "english": "life", "category": "abstract"},
    {"simplified": "困难", "traditional": "困難", "pinyin": "kùnnan", "english": "difficulty; difficult", "category": "abstract"},
    {"simplified": "道理", "traditional": "道理", "pinyin": "dàolǐ", "english": "reason; principle", "category": "abstract"},
    {"simplified": "意见", "traditional": "意見", "pinyin": "yìjiàn", "english": "opinion; suggestion", "category": "abstract"},
    {"simplified": "材料", "traditional": "材料", "pinyin": "cáiliào", "english": "material", "category": "abstract"},
    {"simplified": "质量", "traditional": "質量", "pinyin": "zhìliàng", "english": "quality", "category": "abstract"},
    {"simplified": "功能", "traditional": "功能", "pinyin": "gōngnéng", "english": "function; feature", "category": "abstract"},
    {"simplified": "内容", "traditional": "內容", "pinyin": "nèiróng", "english": "content", "category": "abstract"},
    {"simplified": "活动", "traditional": "活動", "pinyin": "huódòng", "english": "activity; event", "category": "abstract"},
    {"simplified": "任务", "traditional": "任務", "pinyin": "rènwu", "english": "task; mission", "category": "abstract"},
    {"simplified": "气候", "traditional": "氣候", "pinyin": "qìhòu", "english": "climate", "category": "nature"},
    {"simplified": "风景", "traditional": "風景", "pinyin": "fēngjǐng", "english": "scenery; landscape", "category": "nature"},
    {"simplified": "污染", "traditional": "污染", "pinyin": "wūrǎn", "english": "pollution; to pollute", "category": "nature"},
    {"simplified": "垃圾", "traditional": "垃圾", "pinyin": "lājī", "english": "garbage; trash", "category": "object"},
    {"simplified": "塑料袋", "traditional": "塑料袋", "pinyin": "sùliàodài", "english": "plastic bag", "category": "object"},
    {"simplified": "饼干", "traditional": "餅乾", "pinyin": "bǐnggān", "english": "biscuit; cookie", "category": "food"},
    {"simplified": "巧克力", "traditional": "巧克力", "pinyin": "qiǎokèlì", "english": "chocolate", "category": "food"},
    {"simplified": "果汁", "traditional": "果汁", "pinyin": "guǒzhī", "english": "fruit juice", "category": "food"},
    {"simplified": "筷子", "traditional": "筷子", "pinyin": "kuàizi", "english": "chopsticks", "category": "object"},

    # ============================================================
    # ADDITIONAL VERBS
    # ============================================================
    {"simplified": "讨厌", "traditional": "討厭", "pinyin": "tǎoyàn", "english": "to dislike; annoying", "category": "verb"},
    {"simplified": "值得", "traditional": "值得", "pinyin": "zhíde", "english": "to be worth; to deserve", "category": "verb"},
    {"simplified": "推迟", "traditional": "推遲", "pinyin": "tuīchí", "english": "to postpone; to delay", "category": "verb"},
    {"simplified": "联系", "traditional": "聯繫", "pinyin": "liánxì", "english": "to contact; connection", "category": "verb"},
    {"simplified": "吸烟", "traditional": "吸煙", "pinyin": "xīyān", "english": "to smoke (cigarettes)", "category": "verb"},
    {"simplified": "浪费", "traditional": "浪費", "pinyin": "làngfèi", "english": "to waste", "category": "verb"},
    {"simplified": "节约", "traditional": "節約", "pinyin": "jiéyuē", "english": "to save; to economize", "category": "verb"},
    {"simplified": "请假", "traditional": "請假", "pinyin": "qǐngjià", "english": "to ask for leave", "category": "verb"},
    {"simplified": "迟到", "traditional": "遲到", "pinyin": "chídào", "english": "to be late; to arrive late", "category": "verb"},
    {"simplified": "合格", "traditional": "合格", "pinyin": "hégé", "english": "to pass (a test); qualified", "category": "verb"},
    {"simplified": "取消", "traditional": "取消", "pinyin": "qǔxiāo", "english": "to cancel", "category": "verb"},

    # ============================================================
    # ADDITIONAL ADJECTIVES & DESCRIPTORS
    # ============================================================
    {"simplified": "专业", "traditional": "專業", "pinyin": "zhuānyè", "english": "professional; major", "category": "adjective"},
    {"simplified": "主要", "traditional": "主要", "pinyin": "zhǔyào", "english": "main; primary", "category": "adjective"},
    {"simplified": "具体", "traditional": "具體", "pinyin": "jùtǐ", "english": "specific; concrete", "category": "adjective"},
    {"simplified": "合理", "traditional": "合理", "pinyin": "hélǐ", "english": "reasonable; rational", "category": "adjective"},
    {"simplified": "实际", "traditional": "實際", "pinyin": "shíjì", "english": "actual; practical", "category": "adjective"},
]


def seed_hsk3():
    db = SessionLocal()
    try:
        existing = db.query(HanziWord).filter(HanziWord.hsk_level == 3).all()
        existing_simplified = {w.simplified for w in existing}

        added = 0
        for w in hsk3_words:
            if w["simplified"] not in existing_simplified:
                word = HanziWord(
                    simplified=w["simplified"],
                    traditional=w["traditional"],
                    pinyin=w["pinyin"],
                    english=w["english"],
                    hsk_level=3,
                    category=w.get("category")
                )
                db.add(word)
                added += 1

        db.commit()
        print(f"HSK 3: Added {added} new words (already had {len(existing_simplified)})")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_hsk3()
