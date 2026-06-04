/**
 * HanziNarrative Structured Curriculum
 * Inspired by Duolingo, Super Chinese, ChineseSimple HSK.
 *
 * Structure:
 *   Unit  → themed group of sessions (e.g. "Greetings")
 *   Session → one lesson (~5-12 exercise steps)
 *     type 'vocab'    → word-introduction flow
 *     type 'grammar'  → theory + fill-blank exercises
 *     type 'practice' → mixed review of the unit
 */

export interface Word {
  zh: string   // simplified Chinese
  py: string   // pinyin with tone marks
  en: string   // English meaning
  note?: string
}

export interface FillBlank {
  sentence_zh: string  // use ___ for blank
  sentence_en: string
  options: string[]    // exactly 4
  correct: number      // index 0-3
}

export interface GrammarPoint {
  pattern: string
  explanation: string
  examples: { zh: string; py: string; en: string }[]
  fillBlanks: FillBlank[]
}

export type SessionType = 'vocab' | 'grammar' | 'practice'

export interface SessionDef {
  id: string
  title: string
  subtitle: string
  type: SessionType
  xp: number
  words?: Word[]
  grammarPoints?: GrammarPoint[]
}

export interface UnitDef {
  id: string
  hsk_level: number
  title: string
  subtitle: string
  emoji: string
  color: string        // tailwind gradient classes
  sessions: SessionDef[]
  locked?: boolean     // future placeholder
}

// ─────────────────────────────────────────────────────────────────────────────
// HSK 1  (150 core words, 6 units × 4 sessions)
// ─────────────────────────────────────────────────────────────────────────────

const HSK1: UnitDef[] = [
  {
    id: 'h1-u1', hsk_level: 1,
    title: 'Unit 1', subtitle: '问候 · Greetings',
    emoji: '👋', color: 'from-indigo-500 to-violet-500',
    sessions: [
      {
        id: 'h1-u1-s1', type: 'vocab', xp: 20,
        title: '打招呼', subtitle: 'Basic greetings',
        words: [
          { zh: '你好', py: 'nǐ hǎo',    en: 'Hello',          note: 'Lit. "you good" — most common greeting' },
          { zh: '你',   py: 'nǐ',        en: 'You' },
          { zh: '好',   py: 'hǎo',       en: 'Good / Fine' },
          { zh: '再见', py: 'zàijiàn',   en: 'Goodbye',        note: 'Lit. "see again"' },
          { zh: '谢谢', py: 'xièxie',    en: 'Thank you' },
          { zh: '不客气', py: 'bú kèqi', en: "You're welcome", note: 'Response to 谢谢' },
        ],
      },
      {
        id: 'h1-u1-s2', type: 'vocab', xp: 20,
        title: '道歉', subtitle: 'Apologies & politeness',
        words: [
          { zh: '对不起', py: 'duìbuqǐ',    en: 'Sorry / Excuse me' },
          { zh: '没关系', py: 'méiguānxi',   en: "No problem / It's okay", note: 'Response to 对不起' },
          { zh: '请',     py: 'qǐng',        en: 'Please' },
          { zh: '好的',   py: 'hǎo de',      en: 'Okay / Sure' },
          { zh: '是',     py: 'shì',         en: 'Yes / To be' },
          { zh: '不',     py: 'bù',          en: 'No / Not' },
        ],
      },
      {
        id: 'h1-u1-s3', type: 'grammar', xp: 25,
        title: '语法：我是',  subtitle: 'Identity statements',
        grammarPoints: [
          {
            pattern: 'Subject + 是 + Noun',
            explanation: '是 (shì) means "to be." Use it to state identity, nationality, or profession. It does NOT change form — no conjugation in Chinese!',
            examples: [
              { zh: '我是学生。',   py: 'Wǒ shì xuésheng.',   en: 'I am a student.' },
              { zh: '你是老师吗？', py: 'Nǐ shì lǎoshī ma?',  en: 'Are you a teacher?' },
              { zh: '他是中国人。', py: 'Tā shì Zhōngguórén.', en: 'He is Chinese.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___学生。', sentence_en: 'I ___ a student.', options: ['是', '好', '不', '你'], correct: 0 },
              { sentence_zh: '你___老师吗？', sentence_en: 'Are you ___ teacher?', options: ['好', '是', '我', '他'], correct: 1 },
            ],
          },
          {
            pattern: 'Subject + 不是 + Noun',
            explanation: 'To negate 是, put 不 before it: 不是 (bú shì) = "is not."',
            examples: [
              { zh: '我不是老师。', py: 'Wǒ bú shì lǎoshī.',  en: 'I am not a teacher.' },
              { zh: '他不是学生。', py: 'Tā bú shì xuésheng.', en: 'He is not a student.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___是老师。', sentence_en: 'I am ___ a teacher.', options: ['好', '不', '是', '你'], correct: 1 },
            ],
          },
        ],
      },
      { id: 'h1-u1-s4', type: 'practice', xp: 30, title: '综合练习', subtitle: 'Unit 1 review' },
    ],
  },

  {
    id: 'h1-u2', hsk_level: 1,
    title: 'Unit 2', subtitle: '人称与家庭 · People',
    emoji: '👨‍👩‍👧', color: 'from-pink-500 to-rose-500',
    sessions: [
      {
        id: 'h1-u2-s1', type: 'vocab', xp: 20,
        title: '代词', subtitle: 'Pronouns',
        words: [
          { zh: '我',   py: 'wǒ',     en: 'I / Me' },
          { zh: '他',   py: 'tā',     en: 'He / Him' },
          { zh: '她',   py: 'tā',     en: 'She / Her',  note: '他 and 她 sound identical, differ only in writing' },
          { zh: '我们', py: 'wǒmen',  en: 'We / Us' },
          { zh: '你们', py: 'nǐmen',  en: 'You (plural)' },
          { zh: '他们', py: 'tāmen',  en: 'They / Them' },
          { zh: '谁',   py: 'shéi',   en: 'Who' },
        ],
      },
      {
        id: 'h1-u2-s2', type: 'vocab', xp: 20,
        title: '家人', subtitle: 'Family members',
        words: [
          { zh: '爸爸', py: 'bàba',   en: 'Father / Dad' },
          { zh: '妈妈', py: 'māma',   en: 'Mother / Mom' },
          { zh: '哥哥', py: 'gēge',   en: 'Older brother' },
          { zh: '姐姐', py: 'jiějie', en: 'Older sister' },
          { zh: '弟弟', py: 'dìdi',   en: 'Younger brother' },
          { zh: '妹妹', py: 'mèimei', en: 'Younger sister' },
          { zh: '朋友', py: 'péngyou',en: 'Friend' },
        ],
      },
      {
        id: 'h1-u2-s3', type: 'vocab', xp: 20,
        title: '职业', subtitle: 'Roles & jobs',
        words: [
          { zh: '老师',  py: 'lǎoshī',    en: 'Teacher' },
          { zh: '学生',  py: 'xuésheng',  en: 'Student' },
          { zh: '医生',  py: 'yīshēng',   en: 'Doctor' },
          { zh: '中国人',py: 'Zhōngguórén',en: 'Chinese person' },
          { zh: '名字',  py: 'míngzi',    en: 'Name' },
        ],
      },
      {
        id: 'h1-u2-s4', type: 'grammar', xp: 25,
        title: '语法：的', subtitle: 'Possession with 的',
        grammarPoints: [
          {
            pattern: 'A + 的 + B',
            explanation: "的 (de) is a possessive particle, like 's in English. Place it between the possessor and what is possessed.",
            examples: [
              { zh: '我的书',     py: "wǒ de shū",        en: 'My book' },
              { zh: '你的朋友',   py: "nǐ de péngyou",    en: 'Your friend' },
              { zh: '他的妈妈',   py: "tā de māma",       en: 'His mother' },
              { zh: '我们的老师', py: "wǒmen de lǎoshī",  en: 'Our teacher' },
            ],
            fillBlanks: [
              { sentence_zh: '这是我___书。', sentence_en: "This is my ___ book.", options: ['是', '的', '不', '好'], correct: 1 },
              { sentence_zh: '他___妈妈是老师。', sentence_en: "His ___ mother is a teacher.", options: ['们', '的', '是', '不'], correct: 1 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'h1-u3', hsk_level: 1,
    title: 'Unit 3', subtitle: '数字与时间 · Numbers & Time',
    emoji: '🔢', color: 'from-amber-500 to-orange-500',
    sessions: [
      {
        id: 'h1-u3-s1', type: 'vocab', xp: 20,
        title: '数字 0–10', subtitle: 'Numbers zero to ten',
        words: [
          { zh: '零', py: 'líng', en: 'Zero (0)' },
          { zh: '一', py: 'yī',  en: 'One (1)' },
          { zh: '二', py: 'èr',  en: 'Two (2)' },
          { zh: '三', py: 'sān', en: 'Three (3)' },
          { zh: '四', py: 'sì',  en: 'Four (4)' },
          { zh: '五', py: 'wǔ',  en: 'Five (5)' },
          { zh: '六', py: 'liù', en: 'Six (6)' },
          { zh: '七', py: 'qī',  en: 'Seven (7)' },
          { zh: '八', py: 'bā',  en: 'Eight (8)' },
          { zh: '九', py: 'jiǔ', en: 'Nine (9)' },
          { zh: '十', py: 'shí', en: 'Ten (10)' },
        ],
      },
      {
        id: 'h1-u3-s2', type: 'vocab', xp: 20,
        title: '时间词', subtitle: 'Time expressions',
        words: [
          { zh: '今天', py: 'jīntiān',  en: 'Today' },
          { zh: '明天', py: 'míngtiān', en: 'Tomorrow' },
          { zh: '昨天', py: 'zuótiān',  en: 'Yesterday' },
          { zh: '年',   py: 'nián',     en: 'Year' },
          { zh: '月',   py: 'yuè',      en: 'Month' },
          { zh: '日',   py: 'rì',       en: 'Day (of month)' },
          { zh: '星期', py: 'xīngqī',   en: 'Week / Weekday',   note: '星期一 = Monday, 星期二 = Tuesday…' },
          { zh: '现在', py: 'xiànzài',  en: 'Now / Right now' },
        ],
      },
      {
        id: 'h1-u3-s3', type: 'grammar', xp: 25,
        title: '语法：几点了', subtitle: 'Telling time',
        grammarPoints: [
          {
            pattern: '现在几点？/ 几点了？',
            explanation: "几 (jǐ) = \"how many.\" 点 (diǎn) = \"o'clock.\" Together 几点 = \"what time.\" No verb needed — Chinese time expressions are direct.",
            examples: [
              { zh: '现在几点？',     py: 'Xiànzài jǐ diǎn?',      en: 'What time is it now?' },
              { zh: '现在八点。',     py: 'Xiànzài bā diǎn.',       en: "It's eight o'clock." },
              { zh: '下午三点半。',   py: 'Xiàwǔ sān diǎn bàn.',    en: "It's 3:30 in the afternoon." },
              { zh: '上午九点一刻。', py: 'Shàngwǔ jiǔ diǎn yī kè.',en: "It's 9:15 in the morning." },
            ],
            fillBlanks: [
              { sentence_zh: '现在___点？', sentence_en: 'What ___ is it?', options: ['几', '多', '一', '今'], correct: 0 },
              { sentence_zh: '现在___点。', sentence_en: "It's eight ___.", options: ['年', '月', '八', '七'], correct: 2 },
            ],
          },
        ],
      },
      { id: 'h1-u3-s4', type: 'practice', xp: 30, title: '数字练习', subtitle: 'Numbers & time review' },
    ],
  },

  {
    id: 'h1-u4', hsk_level: 1,
    title: 'Unit 4', subtitle: '地点 · Places',
    emoji: '📍', color: 'from-emerald-500 to-teal-500',
    sessions: [
      {
        id: 'h1-u4-s1', type: 'vocab', xp: 20,
        title: '地方', subtitle: 'Common places',
        words: [
          { zh: '家',   py: 'jiā',       en: 'Home / Family' },
          { zh: '学校', py: 'xuéxiào',   en: 'School' },
          { zh: '医院', py: 'yīyuàn',    en: 'Hospital' },
          { zh: '商店', py: 'shāngdiàn', en: 'Store / Shop' },
          { zh: '饭店', py: 'fàndiàn',   en: 'Restaurant / Hotel' },
          { zh: '中国', py: 'Zhōngguó',  en: 'China' },
          { zh: '北京', py: 'Běijīng',   en: 'Beijing' },
        ],
      },
      {
        id: 'h1-u4-s2', type: 'vocab', xp: 20,
        title: '方位', subtitle: 'Directions & location',
        words: [
          { zh: '上', py: 'shàng', en: 'Above / On top' },
          { zh: '下', py: 'xià',   en: 'Below / Under' },
          { zh: '前', py: 'qián',  en: 'Front / Before' },
          { zh: '后', py: 'hòu',   en: 'Behind / After' },
          { zh: '里', py: 'lǐ',    en: 'Inside' },
          { zh: '外', py: 'wài',   en: 'Outside' },
          { zh: '左', py: 'zuǒ',   en: 'Left' },
          { zh: '右', py: 'yòu',   en: 'Right' },
        ],
      },
      {
        id: 'h1-u4-s3', type: 'grammar', xp: 25,
        title: '语法：在哪里', subtitle: 'Expressing location',
        grammarPoints: [
          {
            pattern: 'Subject + 在 + Place',
            explanation: '在 (zài) means "to be at/in/on." It expresses location. Unlike English, no verb "to be" is needed separately.',
            examples: [
              { zh: '我在家。',      py: 'Wǒ zài jiā.',         en: "I'm at home." },
              { zh: '他在学校。',    py: 'Tā zài xuéxiào.',     en: "He's at school." },
              { zh: '书在桌子上。',  py: 'Shū zài zhuōzi shàng.', en: "The book is on the table." },
              { zh: '你在哪里？',    py: 'Nǐ zài nǎlǐ?',       en: 'Where are you?' },
            ],
            fillBlanks: [
              { sentence_zh: '我___家。', sentence_en: "I'm ___ home.", options: ['是', '有', '在', '不'], correct: 2 },
              { sentence_zh: '书在桌子___。', sentence_en: 'The book is ___ the table.', options: ['里', '下', '上', '外'], correct: 2 },
            ],
          },
        ],
      },
      { id: 'h1-u4-s4', type: 'practice', xp: 30, title: '地点练习', subtitle: 'Places & location review' },
    ],
  },

  {
    id: 'h1-u5', hsk_level: 1,
    title: 'Unit 5', subtitle: '饮食 · Food & Drink',
    emoji: '🍜', color: 'from-red-500 to-orange-400',
    sessions: [
      {
        id: 'h1-u5-s1', type: 'vocab', xp: 20,
        title: '食物与饮料', subtitle: 'Food & beverages',
        words: [
          { zh: '水',   py: 'shuǐ',    en: 'Water' },
          { zh: '茶',   py: 'chá',     en: 'Tea' },
          { zh: '牛奶', py: 'niúnǎi',  en: 'Milk' },
          { zh: '饭',   py: 'fàn',     en: 'Rice / Meal' },
          { zh: '菜',   py: 'cài',     en: 'Dish / Vegetable' },
          { zh: '面条', py: 'miàntiáo',en: 'Noodles' },
          { zh: '苹果', py: 'píngguǒ', en: 'Apple' },
          { zh: '水果', py: 'shuǐguǒ', en: 'Fruit' },
        ],
      },
      {
        id: 'h1-u5-s2', type: 'vocab', xp: 20,
        title: '饮食词汇', subtitle: 'Eating & buying words',
        words: [
          { zh: '吃',     py: 'chī',          en: 'Eat' },
          { zh: '喝',     py: 'hē',           en: 'Drink' },
          { zh: '买',     py: 'mǎi',          en: 'Buy' },
          { zh: '好吃',   py: 'hǎochī',       en: 'Delicious',  note: 'Lit. "good eat"' },
          { zh: '贵',     py: 'guì',          en: 'Expensive' },
          { zh: '便宜',   py: 'piányí',       en: 'Cheap / Inexpensive' },
          { zh: '多少钱', py: 'duōshao qián', en: 'How much money?', note: 'Essential shopping phrase' },
        ],
      },
      {
        id: 'h1-u5-s3', type: 'grammar', xp: 25,
        title: '语法：想', subtitle: 'Expressing wants',
        grammarPoints: [
          {
            pattern: 'Subject + 想 + Verb + Object',
            explanation: '想 (xiǎng) means "want to" or "would like to." Place it before the action verb.',
            examples: [
              { zh: '我想吃米饭。',  py: 'Wǒ xiǎng chī mǐfàn.',  en: 'I want to eat rice.' },
              { zh: '你想喝什么？', py: 'Nǐ xiǎng hē shénme?',   en: 'What do you want to drink?' },
              { zh: '他想买苹果。', py: 'Tā xiǎng mǎi píngguǒ.', en: 'He wants to buy apples.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___吃面条。', sentence_en: 'I ___ eat noodles.', options: ['是', '想', '在', '买'], correct: 1 },
              { sentence_zh: '你想___什么？', sentence_en: 'What do you want to ___?', options: ['吃', '是', '我', '在'], correct: 0 },
            ],
          },
        ],
      },
      { id: 'h1-u5-s4', type: 'practice', xp: 30, title: '饮食练习', subtitle: 'Food & drink review' },
    ],
  },

  {
    id: 'h1-u6', hsk_level: 1,
    title: 'Unit 6', subtitle: '常用动词 · Core Verbs',
    emoji: '⚡', color: 'from-purple-500 to-indigo-500',
    sessions: [
      {
        id: 'h1-u6-s1', type: 'vocab', xp: 20,
        title: '基本动词', subtitle: 'Essential action words',
        words: [
          { zh: '有',  py: 'yǒu',  en: 'Have / There is' },
          { zh: '去',  py: 'qù',   en: 'Go' },
          { zh: '来',  py: 'lái',  en: 'Come' },
          { zh: '看',  py: 'kàn',  en: 'Look / Watch / Read' },
          { zh: '说',  py: 'shuō', en: 'Say / Speak' },
          { zh: '听',  py: 'tīng', en: 'Listen' },
          { zh: '写',  py: 'xiě',  en: 'Write' },
          { zh: '学',  py: 'xué',  en: 'Study / Learn' },
        ],
      },
      {
        id: 'h1-u6-s2', type: 'vocab', xp: 20,
        title: '更多动词', subtitle: 'More useful verbs',
        words: [
          { zh: '做',   py: 'zuò',       en: 'Do / Make' },
          { zh: '知道', py: 'zhīdào',    en: 'Know' },
          { zh: '工作', py: 'gōngzuò',   en: 'Work' },
          { zh: '休息', py: 'xiūxi',     en: 'Rest' },
          { zh: '睡觉', py: 'shuìjiào',  en: 'Sleep' },
          { zh: '打电话',py: 'dǎ diànhuà',en: 'Make a phone call' },
        ],
      },
      {
        id: 'h1-u6-s3', type: 'grammar', xp: 25,
        title: '语法：没 & 不', subtitle: 'Two ways to say "no"',
        grammarPoints: [
          {
            pattern: '不 + Verb  (present / habitual negation)',
            explanation: '不 (bù) negates present or habitual actions and states. Tone changes to bú before 4th-tone syllables.',
            examples: [
              { zh: '我不去。',   py: 'Wǒ bù qù.',     en: "I'm not going." },
              { zh: '他不喜欢茶。', py: 'Tā bù xǐhuān chá.', en: "He doesn't like tea." },
            ],
            fillBlanks: [
              { sentence_zh: '我___去学校。', sentence_en: "I'm ___ going to school.", options: ['没', '不', '在', '是'], correct: 1 },
            ],
          },
          {
            pattern: '没 + 有 / 没 + Verb  (possession or past negation)',
            explanation: '没 (méi) negates 有 (have) or past actions. Use 没 (not 不) before 有.',
            examples: [
              { zh: '我没有钱。',  py: 'Wǒ méiyǒu qián.',  en: "I don't have money." },
              { zh: '他没吃饭。',  py: 'Tā méi chī fàn.',   en: "He didn't eat." },
              { zh: '我没有时间。', py: 'Wǒ méiyǒu shíjiān.', en: "I don't have time." },
            ],
            fillBlanks: [
              { sentence_zh: '我___有钱。', sentence_en: "I ___ have money.", options: ['不', '没', '在', '是'], correct: 1 },
              { sentence_zh: '他___吃饭。', sentence_en: "He didn't ___.", options: ['没', '不', '很', '好'], correct: 0 },
            ],
          },
        ],
      },
      { id: 'h1-u6-s4', type: 'practice', xp: 35, title: '最终测试', subtitle: 'HSK 1 final review' },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// HSK 2  (150 words, 4 units — partial; more to come)
// ─────────────────────────────────────────────────────────────────────────────

const HSK2: UnitDef[] = [
  {
    id: 'h2-u1', hsk_level: 2,
    title: 'Unit 1', subtitle: '形容词 · Adjectives',
    emoji: '🌈', color: 'from-cyan-500 to-blue-500',
    sessions: [
      {
        id: 'h2-u1-s1', type: 'vocab', xp: 25,
        title: '描述词', subtitle: 'Descriptive adjectives',
        words: [
          { zh: '大',   py: 'dà',    en: 'Big / Large' },
          { zh: '小',   py: 'xiǎo',  en: 'Small / Little' },
          { zh: '多',   py: 'duō',   en: 'Many / A lot' },
          { zh: '少',   py: 'shǎo',  en: 'Few / Little amount' },
          { zh: '长',   py: 'cháng', en: 'Long' },
          { zh: '短',   py: 'duǎn',  en: 'Short' },
          { zh: '快',   py: 'kuài',  en: 'Fast / Quick' },
          { zh: '慢',   py: 'màn',   en: 'Slow' },
        ],
      },
      {
        id: 'h2-u1-s2', type: 'vocab', xp: 25,
        title: '感受', subtitle: 'Feelings & states',
        words: [
          { zh: '高兴', py: 'gāoxìng', en: 'Happy / Glad' },
          { zh: '难',   py: 'nán',     en: 'Difficult / Hard' },
          { zh: '容易', py: 'róngyì',  en: 'Easy' },
          { zh: '累',   py: 'lèi',     en: 'Tired' },
          { zh: '热',   py: 'rè',      en: 'Hot' },
          { zh: '冷',   py: 'lěng',    en: 'Cold' },
          { zh: '新',   py: 'xīn',     en: 'New' },
          { zh: '旧',   py: 'jiù',     en: 'Old (not for people)' },
        ],
      },
      {
        id: 'h2-u1-s3', type: 'grammar', xp: 30,
        title: '语法：很 & 非常', subtitle: 'Degree adverbs',
        grammarPoints: [
          {
            pattern: '很 / 非常 + Adjective',
            explanation: '很 (hěn) = "very." 非常 (fēicháng) = "extremely." In simple sentences without contrast, 很 is often required before adjectives (not truly emphatic — just grammatical).',
            examples: [
              { zh: '今天很热。',   py: 'Jīntiān hěn rè.',     en: "It's very hot today." },
              { zh: '这本书非常好。', py: 'Zhè běn shū fēicháng hǎo.', en: 'This book is extremely good.' },
              { zh: '我很高兴。',   py: 'Wǒ hěn gāoxìng.',     en: "I'm very happy." },
            ],
            fillBlanks: [
              { sentence_zh: '今天___热。', sentence_en: "It's ___ hot today.", options: ['是', '很', '没', '不'], correct: 1 },
              { sentence_zh: '这本书___好。', sentence_en: 'This book is ___ good.', options: ['没', '不', '非常', '在'], correct: 2 },
            ],
          },
        ],
      },
      { id: 'h2-u1-s4', type: 'practice', xp: 35, title: '形容词练习', subtitle: 'Adjective review' },
    ],
  },
  {
    id: 'h2-u2', hsk_level: 2,
    title: 'Unit 2', subtitle: '日常生活 · Daily Life',
    emoji: '🏠', color: 'from-green-500 to-emerald-500',
    sessions: [
      {
        id: 'h2-u2-s1', type: 'vocab', xp: 25,
        title: '日常活动', subtitle: 'Everyday activities',
        words: [
          { zh: '起床',   py: 'qǐ chuáng', en: 'Get up / Wake up' },
          { zh: '上班',   py: 'shàng bān', en: 'Go to work' },
          { zh: '下班',   py: 'xià bān',   en: 'Finish work' },
          { zh: '开始',   py: 'kāishǐ',    en: 'Begin / Start' },
          { zh: '结束',   py: 'jiéshù',    en: 'End / Finish' },
          { zh: '打算',   py: 'dǎsuàn',    en: 'Plan to / Intend to' },
          { zh: '帮助',   py: 'bāngzhù',   en: 'Help' },
          { zh: '问题',   py: 'wèntí',     en: 'Question / Problem' },
        ],
      },
      {
        id: 'h2-u2-s2', type: 'vocab', xp: 25,
        title: '时间副词', subtitle: 'Time adverbs',
        words: [
          { zh: '已经', py: 'yǐjīng',  en: 'Already' },
          { zh: '还',   py: 'hái',     en: 'Still / Also' },
          { zh: '就',   py: 'jiù',     en: 'Then / Right away' },
          { zh: '再',   py: 'zài',     en: 'Again' },
          { zh: '一起', py: 'yīqǐ',   en: 'Together' },
          { zh: '以前', py: 'yǐqián',  en: 'Before / Previously' },
          { zh: '以后', py: 'yǐhòu',   en: 'After / In the future' },
        ],
      },
      {
        id: 'h2-u2-s3', type: 'grammar', xp: 30,
        title: '语法：了', subtitle: 'Completion with 了',
        grammarPoints: [
          {
            pattern: 'Verb + 了  (action completed)',
            explanation: '了 (le) after a verb indicates the action has been completed. It is NOT a past tense marker — focus is on completion, not time.',
            examples: [
              { zh: '我吃了。',      py: 'Wǒ chī le.',       en: "I've eaten. / I ate." },
              { zh: '他来了。',      py: 'Tā lái le.',        en: 'He came. / He has arrived.' },
              { zh: '我们买了书。',  py: 'Wǒmen mǎi le shū.', en: 'We bought (a) book(s).' },
            ],
            fillBlanks: [
              { sentence_zh: '我吃___。', sentence_en: "I've eaten ___.", options: ['了', '在', '的', '不'], correct: 0 },
              { sentence_zh: '他来___。', sentence_en: 'He has ___arrived.', options: ['在', '了', '不', '没'], correct: 1 },
            ],
          },
        ],
      },
      { id: 'h2-u2-s4', type: 'practice', xp: 35, title: '日常练习', subtitle: 'Daily life review' },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// HSK 3–6  stubs (locked — content coming soon)
// ─────────────────────────────────────────────────────────────────────────────

function makeStub(level: number, unitCount = 4): UnitDef[] {
  const colors = ['from-slate-400 to-gray-500', 'from-zinc-400 to-stone-500']
  return Array.from({ length: unitCount }, (_, i) => ({
    id: `h${level}-u${i + 1}`,
    hsk_level: level,
    title: `Unit ${i + 1}`,
    subtitle: `HSK ${level} — Coming soon`,
    emoji: '🔒',
    color: colors[i % colors.length],
    locked: true,
    sessions: [
      { id: `h${level}-u${i + 1}-s1`, type: 'vocab' as SessionType, xp: 30, title: 'Vocabulary', subtitle: 'Coming soon' },
      { id: `h${level}-u${i + 1}-s2`, type: 'grammar' as SessionType, xp: 30, title: 'Grammar', subtitle: 'Coming soon' },
      { id: `h${level}-u${i + 1}-s3`, type: 'practice' as SessionType, xp: 35, title: 'Practice', subtitle: 'Coming soon' },
    ],
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Full curriculum export
// ─────────────────────────────────────────────────────────────────────────────

export const CURRICULUM: Record<number, UnitDef[]> = {
  1: HSK1,
  2: HSK2,
  3: makeStub(3),
  4: makeStub(4),
  5: makeStub(5),
  6: makeStub(6),
}

export const ALL_UNITS: UnitDef[] = Object.values(CURRICULUM).flat()

/** Flat list of all session definitions */
export const ALL_SESSIONS: SessionDef[] = ALL_UNITS.flatMap(u => u.sessions)

/** Look up a unit by id */
export function getUnit(unitId: string): UnitDef | undefined {
  return ALL_UNITS.find(u => u.id === unitId)
}

/** Look up a session by id */
export function getSession(sessionId: string): { session: SessionDef; unit: UnitDef } | undefined {
  for (const unit of ALL_UNITS) {
    const session = unit.sessions.find(s => s.id === sessionId)
    if (session) return { session, unit }
  }
  return undefined
}

/** All words from a unit (across all vocab sessions) */
export function getUnitWords(unitId: string): Word[] {
  const unit = getUnit(unitId)
  if (!unit) return []
  return unit.sessions.flatMap(s => s.words ?? [])
}
