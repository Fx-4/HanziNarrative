"""
HSK 3 Complete Vocabulary - 293 characters
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import HanziWord

# Complete HSK 3 vocabulary list (293 characters)
hsk3_vocab = [
    # Part 1: Common words and particles
    {"simplified": "汁", "traditional": "汁", "pinyin": "zhī", "english": "juice", "category": "food"},
    {"simplified": "城", "traditional": "城", "pinyin": "chéng", "english": "city; town", "category": "place"},
    {"simplified": "范", "traditional": "範", "pinyin": "fàn", "english": "pattern; model", "category": "other"},
    {"simplified": "媒", "traditional": "媒", "pinyin": "méi", "english": "medium; matchmaker", "category": "other"},
    {"simplified": "负", "traditional": "負", "pinyin": "fù", "english": "to bear; negative", "category": "verb"},
    {"simplified": "资", "traditional": "資", "pinyin": "zī", "english": "resources; capital", "category": "other"},
    {"simplified": "群", "traditional": "群", "pinyin": "qún", "english": "group; crowd", "category": "other"},
    {"simplified": "景", "traditional": "景", "pinyin": "jǐng", "english": "scenery; view", "category": "other"},
    {"simplified": "象", "traditional": "象", "pinyin": "xiàng", "english": "elephant; appearance", "category": "other"},
    {"simplified": "整", "traditional": "整", "pinyin": "zhěng", "english": "whole; to fix", "category": "adjective"},
    {"simplified": "支", "traditional": "支", "pinyin": "zhī", "english": "to support; branch", "category": "verb"},
    {"simplified": "乱", "traditional": "亂", "pinyin": "luàn", "english": "chaos; messy", "category": "adjective"},
    {"simplified": "极", "traditional": "極", "pinyin": "jí", "english": "extreme; pole", "category": "adjective"},
    {"simplified": "展", "traditional": "展", "pinyin": "zhǎn", "english": "to展开; exhibition", "category": "verb"},
    {"simplified": "划", "traditional": "劃", "pinyin": "huá", "english": "to row; to划分", "category": "verb"},
    {"simplified": "状", "traditional": "狀", "pinyin": "zhuàng", "english": "state; condition", "category": "other"},
    {"simplified": "拍", "traditional": "拍", "pinyin": "pāi", "english": "to pat; to shoot", "category": "verb"},
    {"simplified": "善", "traditional": "善", "pinyin": "shàn", "english": "good; kind", "category": "adjective"},
    {"simplified": "标", "traditional": "標", "pinyin": "biāo", "english": "mark; sign", "category": "other"},
    {"simplified": "境", "traditional": "境", "pinyin": "jìng", "english": "boundary; condition", "category": "other"},

    # Part 2: Actions and states
    {"simplified": "束", "traditional": "束", "pinyin": "shù", "english": "bundle; to束缚", "category": "verb"},
    {"simplified": "演", "traditional": "演", "pinyin": "yǎn", "english": "to perform; to演示", "category": "verb"},
    {"simplified": "及", "traditional": "及", "pinyin": "jí", "english": "to reach; and", "category": "grammar"},
    {"simplified": "顿", "traditional": "頓", "pinyin": "dùn", "english": "pause; MW for meals", "category": "other"},
    {"simplified": "台", "traditional": "臺", "pinyin": "tái", "english": "platform; Taiwan", "category": "place"},
    {"simplified": "补", "traditional": "補", "pinyin": "bǔ", "english": "to mend; to supplement", "category": "verb"},
    {"simplified": "证", "traditional": "證", "pinyin": "zhèng", "english": "certificate; proof", "category": "other"},
    {"simplified": "此", "traditional": "此", "pinyin": "cǐ", "english": "this", "category": "grammar"},
    {"simplified": "保", "traditional": "保", "pinyin": "bǎo", "english": "to protect; to keep", "category": "verb"},
    {"simplified": "始", "traditional": "始", "pinyin": "shǐ", "english": "to begin; start", "category": "verb"},
    {"simplified": "判", "traditional": "判", "pinyin": "pàn", "english": "to judge", "category": "verb"},
    {"simplified": "烟", "traditional": "煙", "pinyin": "yān", "english": "smoke; cigarette", "category": "other"},
    {"simplified": "立", "traditional": "立", "pinyin": "lì", "english": "to stand; to establish", "category": "verb"},
    {"simplified": "咖", "traditional": "咖", "pinyin": "kā", "english": "coffee (咖啡)", "category": "food"},
    {"simplified": "播", "traditional": "播", "pinyin": "bō", "english": "to broadcast", "category": "verb"},
    {"simplified": "持", "traditional": "持", "pinyin": "chí", "english": "to hold; to maintain", "category": "verb"},
    {"simplified": "区", "traditional": "區", "pinyin": "qū", "english": "district; area", "category": "place"},
    {"simplified": "误", "traditional": "誤", "pinyin": "wù", "english": "mistake; to误解", "category": "verb"},
    {"simplified": "造", "traditional": "造", "pinyin": "zào", "english": "to make; to create", "category": "verb"},
    {"simplified": "架", "traditional": "架", "pinyin": "jià", "english": "frame; MW for machines", "category": "other"},

    # Part 3: More vocabulary
    {"simplified": "界", "traditional": "界", "pinyin": "jiè", "english": "boundary; world", "category": "other"},
    {"simplified": "古", "traditional": "古", "pinyin": "gǔ", "english": "ancient; old", "category": "adjective"},
    {"simplified": "每", "traditional": "每", "pinyin": "měi", "english": "every; each", "category": "grammar"},
    {"simplified": "华", "traditional": "華", "pinyin": "huá", "english": "splendid; China", "category": "other"},
    {"simplified": "步", "traditional": "步", "pinyin": "bù", "english": "step; pace", "category": "other"},
    {"simplified": "续", "traditional": "續", "pinyin": "xù", "english": "to continue", "category": "verb"},
    {"simplified": "规", "traditional": "規", "pinyin": "guī", "english": "rule; regulation", "category": "other"},
    {"simplified": "管", "traditional": "管", "pinyin": "guǎn", "english": "to manage; pipe", "category": "verb"},
    {"simplified": "输", "traditional": "輸", "pinyin": "shū", "english": "to lose; to transport", "category": "verb"},
    {"simplified": "泳", "traditional": "泳", "pinyin": "yǒng", "english": "swimming", "category": "verb"},
    {"simplified": "众", "traditional": "眾", "pinyin": "zhòng", "english": "crowd; many", "category": "other"},
    {"simplified": "曾", "traditional": "曾", "pinyin": "zēng", "english": "once; already", "category": "adverb"},
    {"simplified": "品", "traditional": "品", "pinyin": "pǐn", "english": "product; quality", "category": "other"},
    {"simplified": "啡", "traditional": "啡", "pinyin": "fēi", "english": "coffee (咖啡)", "category": "food"},
    {"simplified": "何", "traditional": "何", "pinyin": "hé", "english": "what; how", "category": "question"},
    {"simplified": "羊", "traditional": "羊", "pinyin": "yáng", "english": "sheep", "category": "other"},
    {"simplified": "警", "traditional": "警", "pinyin": "jǐng", "english": "police; to警告", "category": "other"},
    {"simplified": "格", "traditional": "格", "pinyin": "gé", "english": "pattern; standard", "category": "other"},
    {"simplified": "宣", "traditional": "宣", "pinyin": "xuān", "english": "to declare", "category": "verb"},
    {"simplified": "派", "traditional": "派", "pinyin": "pài", "english": "faction; to派遣", "category": "verb"},
    {"simplified": "建", "traditional": "建", "pinyin": "jiàn", "english": "to build", "category": "verb"},
    {"simplified": "精", "traditional": "精", "pinyin": "jīng", "english": "essence;精神", "category": "adjective"},
    {"simplified": "苹", "traditional": "蘋", "pinyin": "píng", "english": "apple (苹果)", "category": "food"},
    {"simplified": "训", "traditional": "訓", "pinyin": "xùn", "english": "to train", "category": "verb"},
    {"simplified": "剧", "traditional": "劇", "pinyin": "jù", "english": "drama; play", "category": "other"},
    {"simplified": "痛", "traditional": "痛", "pinyin": "tòng", "english": "pain; painful", "category": "adjective"},
    {"simplified": "双", "traditional": "雙", "pinyin": "shuāng", "english": "pair; double", "category": "number"},
    {"simplified": "望", "traditional": "望", "pinyin": "wàng", "english": "to hope; to look", "category": "verb"},
    {"simplified": "具", "traditional": "具", "pinyin": "jù", "english": "tool; to具备", "category": "other"},
    {"simplified": "显", "traditional": "顯", "pinyin": "xiǎn", "english": "to show; obvious", "category": "verb"},
    {"simplified": "概", "traditional": "概", "pinyin": "gài", "english": "general; roughly", "category": "adverb"},
    {"simplified": "齐", "traditional": "齊", "pinyin": "qí", "english": "neat; uniform", "category": "adjective"},
    {"simplified": "背", "traditional": "背", "pinyin": "bèi", "english": "back; to recite", "category": "body"},
    {"simplified": "止", "traditional": "止", "pinyin": "zhǐ", "english": "to stop", "category": "verb"},
    {"simplified": "某", "traditional": "某", "pinyin": "mǒu", "english": "certain; some", "category": "grammar"},
    {"simplified": "性", "traditional": "性", "pinyin": "xìng", "english": "nature; gender", "category": "other"},
    {"simplified": "汤", "traditional": "湯", "pinyin": "tāng", "english": "soup", "category": "food"},
    {"simplified": "围", "traditional": "圍", "pinyin": "wéi", "english": "to surround", "category": "verb"},
    {"simplified": "厂", "traditional": "廠", "pinyin": "chǎng", "english": "factory", "category": "place"},
    {"simplified": "验", "traditional": "驗", "pinyin": "yàn", "english": "to test; to验证", "category": "verb"},
    {"simplified": "赛", "traditional": "賽", "pinyin": "sài", "english": "competition; match", "category": "other"},
    {"simplified": "救", "traditional": "救", "pinyin": "jiù", "english": "to save; to rescue", "category": "verb"},
    {"simplified": "防", "traditional": "防", "pinyin": "fáng", "english": "to prevent; defense", "category": "verb"},
    {"simplified": "器", "traditional": "器", "pinyin": "qì", "english": "tool; device", "category": "other"},
    {"simplified": "幸", "traditional": "幸", "pinyin": "xìng", "english": "lucky; fortunate", "category": "adjective"},
    {"simplified": "破", "traditional": "破", "pinyin": "pò", "english": "to break; broken", "category": "verb"},
    {"simplified": "险", "traditional": "險", "pinyin": "xiǎn", "english": "danger;险恶", "category": "adjective"},
    {"simplified": "效", "traditional": "效", "pinyin": "xiào", "english": "effect; to效仿", "category": "other"},
    {"simplified": "责", "traditional": "責", "pinyin": "zé", "english": "responsibility", "category": "other"},
    {"simplified": "了", "traditional": "了", "pinyin": "le", "english": "particle (completion)", "category": "grammar"},
    {"simplified": "沙", "traditional": "沙", "pinyin": "shā", "english": "sand", "category": "other"},
    {"simplified": "础", "traditional": "礎", "pinyin": "chǔ", "english": "foundation; base", "category": "other"},
    {"simplified": "环", "traditional": "環", "pinyin": "huán", "english": "ring; environment", "category": "other"},
    {"simplified": "希", "traditional": "希", "pinyin": "xī", "english": "to hope", "category": "verb"},
    {"simplified": "死", "traditional": "死", "pinyin": "sǐ", "english": "to die; death", "category": "verb"},
    {"simplified": "甜", "traditional": "甜", "pinyin": "tián", "english": "sweet", "category": "adjective"},
    {"simplified": "邮", "traditional": "郵", "pinyin": "yóu", "english": "post; mail", "category": "other"},
    {"simplified": "世", "traditional": "世", "pinyin": "shì", "english": "world; generation", "category": "other"},
    {"simplified": "足", "traditional": "足", "pinyin": "zú", "english": "foot; enough", "category": "body"},
    {"simplified": "访", "traditional": "訪", "pinyin": "fǎng", "english": "to visit", "category": "verb"},
    {"simplified": "预", "traditional": "預", "pinyin": "yù", "english": "in advance; to预测", "category": "verb"},
    {"simplified": "猪", "traditional": "豬", "pinyin": "zhū", "english": "pig", "category": "other"},
    {"simplified": "社", "traditional": "社", "pinyin": "shè", "english": "society; organization", "category": "other"},
    {"simplified": "终", "traditional": "終", "pinyin": "zhōng", "english": "end; finally", "category": "adverb"},
    {"simplified": "卫", "traditional": "衛", "pinyin": "wèi", "english": "to defend; guard", "category": "verb"},
    {"simplified": "设", "traditional": "設", "pinyin": "shè", "english": "to set up", "category": "verb"},
    {"simplified": "金", "traditional": "金", "pinyin": "jīn", "english": "gold; metal", "category": "other"},
    {"simplified": "互", "traditional": "互", "pinyin": "hù", "english": "mutual; each other", "category": "adverb"},
    {"simplified": "神", "traditional": "神", "pinyin": "shén", "english": "god; spirit", "category": "other"},
    {"simplified": "怪", "traditional": "怪", "pinyin": "guài", "english": "strange; to blame", "category": "adjective"},
    {"simplified": "继", "traditional": "繼", "pinyin": "jì", "english": "to continue", "category": "verb"},
    {"simplified": "势", "traditional": "勢", "pinyin": "shì", "english": "power;势力", "category": "other"},
    {"simplified": "刀", "traditional": "刀", "pinyin": "dāo", "english": "knife", "category": "other"},
    {"simplified": "艺", "traditional": "藝", "pinyin": "yì", "english": "art; skill", "category": "other"},
    {"simplified": "巧", "traditional": "巧", "pinyin": "qiǎo", "english": "skillful; coincidence", "category": "adjective"},
    {"simplified": "程", "traditional": "程", "pinyin": "chéng", "english": "rule; journey", "category": "other"},
    {"simplified": "失", "traditional": "失", "pinyin": "shī", "english": "to lose", "category": "verb"},
    {"simplified": "绝", "traditional": "絕", "pinyin": "jué", "english": "to cut off; extreme", "category": "verb"},
    {"simplified": "断", "traditional": "斷", "pinyin": "duàn", "english": "to break; to断定", "category": "verb"},
    {"simplified": "苦", "traditional": "苦", "pinyin": "kǔ", "english": "bitter; hardship", "category": "adjective"},
    {"simplified": "指", "traditional": "指", "pinyin": "zhǐ", "english": "finger; to point", "category": "body"},
    {"simplified": "首", "traditional": "首", "pinyin": "shǒu", "english": "head; first", "category": "other"},
    {"simplified": "仅", "traditional": "僅", "pinyin": "jǐn", "english": "only; merely", "category": "adverb"},
    {"simplified": "批", "traditional": "批", "pinyin": "pī", "english": "batch; to批评", "category": "verb"},
    {"simplified": "属", "traditional": "屬", "pinyin": "shǔ", "english": "to belong to", "category": "verb"},
    {"simplified": "币", "traditional": "幣", "pinyin": "bì", "english": "currency", "category": "other"},
    {"simplified": "存", "traditional": "存", "pinyin": "cún", "english": "to exist; to存储", "category": "verb"},
    {"simplified": "配", "traditional": "配", "pinyin": "pèi", "english": "to match; to配置", "category": "verb"},
    {"simplified": "牌", "traditional": "牌", "pinyin": "pái", "english": "sign; brand", "category": "other"},
    {"simplified": "屋", "traditional": "屋", "pinyin": "wū", "english": "house; room", "category": "place"},
    {"simplified": "冒", "traditional": "冒", "pinyin": "mào", "english": "to emit; to冒险", "category": "verb"},
    {"simplified": "反", "traditional": "反", "pinyin": "fǎn", "english": "opposite; to反对", "category": "verb"},
    {"simplified": "制", "traditional": "制", "pinyin": "zhì", "english": "system; to制造", "category": "verb"},
    {"simplified": "民", "traditional": "民", "pinyin": "mín", "english": "people; civilian", "category": "person"},
    {"simplified": "除", "traditional": "除", "pinyin": "chú", "english": "to remove; except", "category": "verb"},
    {"simplified": "产", "traditional": "產", "pinyin": "chǎn", "english": "to produce", "category": "verb"},
    {"simplified": "功", "traditional": "功", "pinyin": "gōng", "english": "merit; achievement", "category": "other"},
    {"simplified": "哈", "traditional": "哈", "pinyin": "hā", "english": "ha (laughter)", "category": "other"},
    {"simplified": "蕉", "traditional": "蕉", "pinyin": "jiāo", "english": "banana (香蕉)", "category": "food"},
    {"simplified": "夫", "traditional": "夫", "pinyin": "fū", "english": "husband; man", "category": "person"},
    {"simplified": "福", "traditional": "福", "pinyin": "fú", "english": "blessing; fortune", "category": "other"},
    {"simplified": "易", "traditional": "易", "pinyin": "yì", "english": "easy; to exchange", "category": "adjective"},
    {"simplified": "龙", "traditional": "龍", "pinyin": "lóng", "english": "dragon", "category": "other"},
    {"simplified": "约", "traditional": "約", "pinyin": "yuē", "english": "to约定; about", "category": "verb"},
    {"simplified": "暖", "traditional": "暖", "pinyin": "nuǎn", "english": "warm", "category": "adjective"},
    {"simplified": "箱", "traditional": "箱", "pinyin": "xiāng", "english": "box; case", "category": "other"},
    {"simplified": "速", "traditional": "速", "pinyin": "sù", "english": "speed; fast", "category": "adjective"},
    {"simplified": "较", "traditional": "較", "pinyin": "jiào", "english": "to compare; rather", "category": "adverb"},
    {"simplified": "赶", "traditional": "趕", "pinyin": "gǎn", "english": "to rush; to catch up", "category": "verb"},
    {"simplified": "章", "traditional": "章", "pinyin": "zhāng", "english": "chapter; seal", "category": "other"},
    {"simplified": "处", "traditional": "處", "pinyin": "chǔ", "english": "place; to处理", "category": "verb"},
    {"simplified": "消", "traditional": "消", "pinyin": "xiāo", "english": "to消失; to消除", "category": "verb"},
    {"simplified": "员", "traditional": "員", "pinyin": "yuán", "english": "member; employee", "category": "person"},
    {"simplified": "彩", "traditional": "彩", "pinyin": "cǎi", "english": "color; lottery", "category": "color"},
    {"simplified": "突", "traditional": "突", "pinyin": "tū", "english": "sudden; to突破", "category": "adverb"},
    {"simplified": "裤", "traditional": "褲", "pinyin": "kù", "english": "pants; trousers", "category": "clothing"},
    {"simplified": "增", "traditional": "增", "pinyin": "zēng", "english": "to increase", "category": "verb"},
    {"simplified": "危", "traditional": "危", "pinyin": "wēi", "english": "danger; peril", "category": "adjective"},
    {"simplified": "杂", "traditional": "雜", "pinyin": "zá", "english": "mixed; miscellaneous", "category": "adjective"},
    {"simplified": "亲", "traditional": "親", "pinyin": "qīn", "english": "親人; to kiss", "category": "person"},
    {"simplified": "糖", "traditional": "糖", "pinyin": "táng", "english": "sugar; candy", "category": "food"},
    {"simplified": "谈", "traditional": "談", "pinyin": "tán", "english": "to talk; to chat", "category": "verb"},
    {"simplified": "迷", "traditional": "迷", "pinyin": "mí", "english": "to迷惑; fan", "category": "verb"},
    {"simplified": "跳", "traditional": "跳", "pinyin": "tiào", "english": "to jump; to跳舞", "category": "verb"},
    {"simplified": "并", "traditional": "並", "pinyin": "bìng", "english": "and; moreover", "category": "grammar"},
    {"simplified": "大", "traditional": "大", "pinyin": "dà", "english": "big; large", "category": "adjective"},
    {"simplified": "领", "traditional": "領", "pinyin": "lǐng", "english": "to lead; collar", "category": "verb"},
    {"simplified": "啤", "traditional": "啤", "pinyin": "pí", "english": "beer (啤酒)", "category": "food"},
    {"simplified": "香", "traditional": "香", "pinyin": "xiāng", "english": "fragrant; incense", "category": "adjective"},
    {"simplified": "纪", "traditional": "紀", "pinyin": "jì", "english": "纪录; century", "category": "other"},
    {"simplified": "祝", "traditional": "祝", "pinyin": "zhù", "english": "to wish; to祝福", "category": "verb"},
    {"simplified": "坚", "traditional": "堅", "pinyin": "jiān", "english": "firm; strong", "category": "adjective"},
    {"simplified": "需", "traditional": "需", "pinyin": "xū", "english": "to need", "category": "verb"},
    {"simplified": "根", "traditional": "根", "pinyin": "gēn", "english": "root; basis", "category": "other"},
    {"simplified": "念", "traditional": "念", "pinyin": "niàn", "english": "to念书; thought", "category": "verb"},
    {"simplified": "伤", "traditional": "傷", "pinyin": "shāng", "english": "injury; to伤害", "category": "verb"},
    {"simplified": "术", "traditional": "術", "pinyin": "shù", "english": "skill; technique", "category": "other"},
    {"simplified": "线", "traditional": "線", "pinyin": "xiàn", "english": "line; thread", "category": "other"},
    {"simplified": "升", "traditional": "升", "pinyin": "shēng", "english": "to rise; liter", "category": "verb"},
    {"simplified": "族", "traditional": "族", "pinyin": "zú", "english": "ethnic group; clan", "category": "person"},
    {"simplified": "害", "traditional": "害", "pinyin": "hài", "english": "harm; to害怕", "category": "verb"},
    {"simplified": "李", "traditional": "李", "pinyin": "lǐ", "english": "plum; surname Li", "category": "person"},
    {"simplified": "吵", "traditional": "吵", "pinyin": "chǎo", "english": "to吵闹; noisy", "category": "verb"},
    {"simplified": "采", "traditional": "採", "pinyin": "cǎi", "english": "to采集; to pick", "category": "verb"},
    {"simplified": "农", "traditional": "農", "pinyin": "nóng", "english": "agriculture; farmer", "category": "person"},
    {"simplified": "值", "traditional": "值", "pinyin": "zhí", "english": "value; worth", "category": "other"},
    {"simplified": "伟", "traditional": "偉", "pinyin": "wěi", "english": "great; mighty", "category": "adjective"},
    {"simplified": "乡", "traditional": "鄉", "pinyin": "xiāng", "english": "countryside; home", "category": "place"},
    {"simplified": "衬", "traditional": "襯", "pinyin": "chèn", "english": "shirt; lining", "category": "clothing"},
    {"simplified": "皮", "traditional": "皮", "pinyin": "pí", "english": "skin; leather", "category": "body"},
    {"simplified": "决", "traditional": "決", "pinyin": "jué", "english": "to decide", "category": "verb"},
    {"simplified": "导", "traditional": "導", "pinyin": "dǎo", "english": "to guide; to lead", "category": "verb"},
    {"simplified": "奇", "traditional": "奇", "pinyin": "qí", "english": "strange; odd", "category": "adjective"},
    {"simplified": "胖", "traditional": "胖", "pinyin": "pàng", "english": "fat", "category": "adjective"},
    {"simplified": "抓", "traditional": "抓", "pinyin": "zhuā", "english": "to grab; to catch", "category": "verb"},
    {"simplified": "解", "traditional": "解", "pinyin": "jiě", "english": "to understand; to解释", "category": "verb"},
    {"simplified": "美", "traditional": "美", "pinyin": "měi", "english": "beautiful; America", "category": "adjective"},
    {"simplified": "至", "traditional": "至", "pinyin": "zhì", "english": "to; until", "category": "grammar"},
    {"simplified": "父", "traditional": "父", "pinyin": "fù", "english": "father", "category": "person"},
    {"simplified": "深", "traditional": "深", "pinyin": "shēn", "english": "deep", "category": "adjective"},
    {"simplified": "修", "traditional": "修", "pinyin": "xiū", "english": "to修理; to修改", "category": "verb"},
    {"simplified": "济", "traditional": "濟", "pinyin": "jì", "english": "to济助; economy", "category": "verb"},
    {"simplified": "按", "traditional": "按", "pinyin": "àn", "english": "to press; according to", "category": "verb"},
    {"simplified": "戏", "traditional": "戲", "pinyin": "xì", "english": "play; drama", "category": "other"},
    {"simplified": "察", "traditional": "察", "pinyin": "chá", "english": "to observe", "category": "verb"},
    {"simplified": "志", "traditional": "志", "pinyin": "zhì", "english": "will; ambition", "category": "other"},
    {"simplified": "恐", "traditional": "恐", "pinyin": "kǒng", "english": "fear; afraid", "category": "adjective"},
    {"simplified": "结", "traditional": "結", "pinyin": "jié", "english": "to tie; knot", "category": "verb"},
    {"simplified": "团", "traditional": "團", "pinyin": "tuán", "english": "group;团体", "category": "other"},
    {"simplified": "争", "traditional": "爭", "pinyin": "zhēng", "english": "to争论; to compete", "category": "verb"},
    {"simplified": "把", "traditional": "把", "pinyin": "bǎ", "english": "to hold; BA particle", "category": "grammar"},
    {"simplified": "搬", "traditional": "搬", "pinyin": "bān", "english": "to move; to搬运", "category": "verb"},
    {"simplified": "石", "traditional": "石", "pinyin": "shí", "english": "stone; rock", "category": "other"},
    {"simplified": "积", "traditional": "積", "pinyin": "jī", "english": "to积累; product", "category": "verb"},
    {"simplified": "布", "traditional": "布", "pinyin": "bù", "english": "cloth; to announce", "category": "other"},
    {"simplified": "赢", "traditional": "贏", "pinyin": "yíng", "english": "to win", "category": "verb"},
    {"simplified": "费", "traditional": "費", "pinyin": "fèi", "english": "fee; to费用", "category": "other"},
    {"simplified": "握", "traditional": "握", "pinyin": "wò", "english": "to hold; to握手", "category": "verb"},
    {"simplified": "内", "traditional": "內", "pinyin": "nèi", "english": "inside; within", "category": "other"},
    {"simplified": "被", "traditional": "被", "pinyin": "bèi", "english": "BEI (passive); quilt", "category": "grammar"},
    {"simplified": "庆", "traditional": "慶", "pinyin": "qìng", "english": "to celebrate", "category": "verb"},
    {"simplified": "联", "traditional": "聯", "pinyin": "lián", "english": "to联系; union", "category": "verb"},
    {"simplified": "否", "traditional": "否", "pinyin": "fǒu", "english": "to否定; or not", "category": "grammar"},
    {"simplified": "义", "traditional": "義", "pinyin": "yì", "english": "righteousness; meaning", "category": "other"},
    {"simplified": "命", "traditional": "命", "pinyin": "mìng", "english": "life; fate", "category": "other"},
    {"simplified": "充", "traditional": "充", "pinyin": "chōng", "english": "to fill; to充满", "category": "verb"},
    {"simplified": "衫", "traditional": "衫", "pinyin": "shān", "english": "shirt", "category": "clothing"},
    {"simplified": "丽", "traditional": "麗", "pinyin": "lì", "english": "beautiful", "category": "adjective"},
    {"simplified": "退", "traditional": "退", "pinyin": "tuì", "english": "to退出; to retreat", "category": "verb"},
    {"simplified": "优", "traditional": "優", "pinyin": "yōu", "english": "excellent; superior", "category": "adjective"},
    {"simplified": "代", "traditional": "代", "pinyin": "dài", "english": "generation; to代替", "category": "other"},
    {"simplified": "紧", "traditional": "緊", "pinyin": "jǐn", "english": "tight; urgent", "category": "adjective"},
    {"simplified": "议", "traditional": "議", "pinyin": "yì", "english": "to议论; proposal", "category": "verb"},
    {"simplified": "舞", "traditional": "舞", "pinyin": "wǔ", "english": "dance; to舞蹈", "category": "verb"},
    {"simplified": "追", "traditional": "追", "pinyin": "zhuī", "english": "to追求; to chase", "category": "verb"},
    {"simplified": "村", "traditional": "村", "pinyin": "cūn", "english": "village", "category": "place"},
    {"simplified": "缺", "traditional": "缺", "pinyin": "quē", "english": "to lack; shortage", "category": "verb"},
    {"simplified": "挂", "traditional": "掛", "pinyin": "guà", "english": "to hang", "category": "verb"},
    {"simplified": "历", "traditional": "歷", "pinyin": "lì", "english": "history; calendar", "category": "other"},
    {"simplified": "都", "traditional": "都", "pinyin": "dōu", "english": "all; capital", "category": "adverb"},
    {"simplified": "困", "traditional": "困", "pinyin": "kùn", "english": "困难; sleepy", "category": "adjective"},
    {"simplified": "连", "traditional": "連", "pinyin": "lián", "english": "to连接; even", "category": "verb"},
    {"simplified": "浪", "traditional": "浪", "pinyin": "làng", "english": "wave", "category": "other"},
    {"simplified": "武", "traditional": "武", "pinyin": "wǔ", "english": "martial; military", "category": "other"},
    {"simplified": "录", "traditional": "錄", "pinyin": "lù", "english": "to录制; to record", "category": "verb"},
    {"simplified": "光", "traditional": "光", "pinyin": "guāng", "english": "light", "category": "other"},
    {"simplified": "化", "traditional": "化", "pinyin": "huà", "english": "to transform", "category": "verb"},
    {"simplified": "容", "traditional": "容", "pinyin": "róng", "english": "to容纳; appearance", "category": "verb"},
    {"simplified": "基", "traditional": "基", "pinyin": "jī", "english": "base; foundation", "category": "other"},
    {"simplified": "烈", "traditional": "烈", "pinyin": "liè", "english": "strong; intense", "category": "adjective"},
    {"simplified": "订", "traditional": "訂", "pinyin": "dìng", "english": "to订阅; to book", "category": "verb"},
    {"simplified": "职", "traditional": "職", "pinyin": "zhí", "english": "职业; position", "category": "other"},
    {"simplified": "底", "traditional": "底", "pinyin": "dǐ", "english": "bottom; base", "category": "other"},
    {"simplified": "娘", "traditional": "娘", "pinyin": "niáng", "english": "mother; young lady", "category": "person"},
    {"simplified": "各", "traditional": "各", "pinyin": "gè", "english": "each; every", "category": "grammar"},
    {"simplified": "丰", "traditional": "豐", "pinyin": "fēng", "english": "abundant; rich", "category": "adjective"},
    {"simplified": "营", "traditional": "營", "pinyin": "yíng", "english": "to营业; camp", "category": "verb"},
    {"simplified": "土", "traditional": "土", "pinyin": "tǔ", "english": "earth; soil", "category": "other"},
    {"simplified": "式", "traditional": "式", "pinyin": "shì", "english": "style; type", "category": "other"},
    {"simplified": "裙", "traditional": "裙", "pinyin": "qún", "english": "skirt", "category": "clothing"},
    {"simplified": "母", "traditional": "母", "pinyin": "mǔ", "english": "mother", "category": "person"},
    {"simplified": "初", "traditional": "初", "pinyin": "chū", "english": "beginning; first", "category": "time"},
    {"simplified": "另", "traditional": "另", "pinyin": "lìng", "english": "other; another", "category": "grammar"},
    {"simplified": "麻", "traditional": "麻", "pinyin": "má", "english": "hemp; numb", "category": "other"},
    {"simplified": "烦", "traditional": "煩", "pinyin": "fán", "english": "annoyed; troublesome", "category": "adjective"},
    {"simplified": "胜", "traditional": "勝", "pinyin": "shèng", "english": "victory; to胜利", "category": "verb"},
    {"simplified": "富", "traditional": "富", "pinyin": "fù", "english": "rich; wealthy", "category": "adjective"},
    {"simplified": "达", "traditional": "達", "pinyin": "dá", "english": "to达到; to express", "category": "verb"},
    {"simplified": "类", "traditional": "類", "pinyin": "lèi", "english": "type; category", "category": "other"},
    {"simplified": "张", "traditional": "張", "pinyin": "zhāng", "english": "MW for flat objects", "category": "other"},
    {"simplified": "任", "traditional": "任", "pinyin": "rèn", "english": "to任命; responsibility", "category": "verb"},
    {"simplified": "材", "traditional": "材", "pinyin": "cái", "english": "material; talent", "category": "other"},
    {"simplified": "调", "traditional": "調", "pinyin": "diào", "english": "to调整; tune", "category": "verb"},
    {"simplified": "姑", "traditional": "姑", "pinyin": "gū", "english": "aunt (father's sister)", "category": "person"},
    {"simplified": "形", "traditional": "形", "pinyin": "xíng", "english": "shape; form", "category": "other"},
    {"simplified": "总", "traditional": "總", "pinyin": "zǒng", "english": "total; always", "category": "adverb"},
    {"simplified": "技", "traditional": "技", "pinyin": "jì", "english": "skill; technique", "category": "other"},
    {"simplified": "木", "traditional": "木", "pinyin": "mù", "english": "wood; tree", "category": "other"},
    {"simplified": "付", "traditional": "付", "pinyin": "fù", "english": "to pay", "category": "verb"},
    {"simplified": "婚", "traditional": "婚", "pinyin": "hūn", "english": "marriage; wedding", "category": "other"},
    {"simplified": "况", "traditional": "況", "pinyin": "kuàng", "english": "condition; moreover", "category": "other"},
    {"simplified": "桥", "traditional": "橋", "pinyin": "qiáo", "english": "bridge", "category": "place"},
    {"simplified": "只", "traditional": "只", "pinyin": "zhī", "english": "MW for animals", "category": "other"},
    {"simplified": "敢", "traditional": "敢", "pinyin": "gǎn", "english": "to dare", "category": "verb"},
    {"simplified": "据", "traditional": "據", "pinyin": "jù", "english": "according to; evidence", "category": "grammar"},
    {"simplified": "仍", "traditional": "仍", "pinyin": "réng", "english": "still; yet", "category": "adverb"},
    {"simplified": "压", "traditional": "壓", "pinyin": "yā", "english": "to press; pressure", "category": "verb"},
    {"simplified": "简", "traditional": "簡", "pinyin": "jiǎn", "english": "simple; brief", "category": "adjective"},
    {"simplified": "旧", "traditional": "舊", "pinyin": "jiù", "english": "old; used", "category": "adjective"},
    {"simplified": "专", "traditional": "專", "pinyin": "zhuān", "english": "specialized; expert", "category": "adjective"},
    {"simplified": "集", "traditional": "集", "pinyin": "jí", "english": "to集合; collection", "category": "verb"},
    {"simplified": "价", "traditional": "價", "pinyin": "jià", "english": "price; value", "category": "other"},
    {"simplified": "注", "traditional": "注", "pinyin": "zhù", "english": "to注意; note", "category": "verb"},
]

def seed_hsk3():
    db = SessionLocal()
    try:
        print("\n" + "="*70)
        print("Seeding HSK 3 Vocabulary - 293 Characters")
        print("="*70 + "\n")

        added = 0
        skipped = 0

        for word_data in hsk3_vocab:
            # Check if word already exists
            existing = db.query(HanziWord).filter(
                HanziWord.simplified == word_data["simplified"],
                HanziWord.hsk_level == 3
            ).first()

            if existing:
                skipped += 1
                continue

            # Create new word
            word = HanziWord(
                simplified=word_data["simplified"],
                traditional=word_data["traditional"],
                pinyin=word_data["pinyin"],
                english=word_data["english"],
                hsk_level=3,
                category=word_data.get("category", "other")
            )
            db.add(word)
            added += 1

            if added % 50 == 0:
                print(f"Progress: {added} words added...")

        db.commit()

        # Get final count
        total_hsk3 = db.query(HanziWord).filter(HanziWord.hsk_level == 3).count()

        print("\n" + "="*70)
        print("[SUCCESS] HSK 3 Vocabulary Seeding Complete!")
        print("="*70)
        print(f"  Added: {added} words")
        print(f"  Skipped: {skipped} words")
        print(f"  Total HSK 3: {total_hsk3} words")
        print(f"\n  Target: 293 words (WriteHanzi standard)")
        if total_hsk3 >= 290:
            print(f"  Status: ✓ COMPLETE!")
        else:
            print(f"  Status: {total_hsk3}/293")

    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_hsk3()
