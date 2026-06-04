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
// HSK 1  (150 core words, 10 units × 4–5 sessions = 46 sessions)
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

  // ── Unit 7 ──────────────────────────────────────────────────────────────────
  {
    id: 'h1-u7', hsk_level: 1,
    title: 'Unit 7', subtitle: '语言与描述 · Language & Description',
    emoji: '💬', color: 'from-blue-500 to-cyan-500',
    sessions: [
      {
        id: 'h1-u7-s1', type: 'vocab', xp: 20,
        title: '疑问词', subtitle: 'Question words & key pronouns',
        words: [
          { zh: '什么', py: 'shénme',       en: 'What' },
          { zh: '哪',   py: 'nǎ',           en: 'Which',            note: 'Also: 哪里(nǎlǐ) = where, 哪个(nǎ ge) = which one' },
          { zh: '那',   py: 'nà',           en: 'That',             note: '那(nà 4th) vs 哪(nǎ 3rd) — same sound, different tone!' },
          { zh: '这',   py: 'zhè',          en: 'This',             note: '这 = near you, 那 = far from you' },
          { zh: '怎么', py: 'zěnme',        en: 'How / Why (method)' },
          { zh: '怎么样', py: 'zěnme yàng', en: 'How is it? / What do you think?' },
          { zh: '也',   py: 'yě',           en: 'Also / Too',       note: 'Always before the verb: 我也去 ✓, 我去也 ✗' },
          { zh: '都',   py: 'dōu',          en: 'All / Both',       note: 'Use with plural subjects before the verb' },
        ],
      },
      {
        id: 'h1-u7-s2', type: 'vocab', xp: 20,
        title: '描述与介绍', subtitle: 'Describing & introducing people',
        words: [
          { zh: '和',   py: 'hé',          en: 'And / With',        note: 'Connects nouns: 我和你 = you and me' },
          { zh: '漂亮', py: 'piàoliang',   en: 'Pretty / Beautiful' },
          { zh: '认识', py: 'rènshi',      en: 'Know (a person) / Recognize' },
          { zh: '叫',   py: 'jiào',        en: 'Be called / Named' },
          { zh: '汉语', py: 'Hànyǔ',      en: 'Chinese language',  note: '汉语 = formal written term; 中文 also widely used' },
          { zh: '先生', py: 'xiānsheng',   en: 'Mr. / Gentleman',  note: 'Respectful address for men; also means "husband"' },
          { zh: '小姐', py: 'xiǎojiě',    en: 'Miss / Young lady' },
          { zh: '太',   py: 'tài',         en: 'Too / Extremely',  note: 'Used in the pattern: 太 + Adj + 了' },
          { zh: '人',   py: 'rén',         en: 'Person / People' },
        ],
      },
      {
        id: 'h1-u7-s3', type: 'grammar', xp: 25,
        title: '语法：这和那', subtitle: 'Demonstratives — this & that',
        grammarPoints: [
          {
            pattern: '这/那 + (是) + Noun',
            explanation: '这 (zhè) = "this" (near you). 那 (nà) = "that" (far away). Add 是 to say "this is / that is." Or use directly before a noun: 这个人 = this person, 那本书 = that book.',
            examples: [
              { zh: '这是什么？',   py: 'Zhè shì shénme?',    en: 'What is this?' },
              { zh: '那是我的书。', py: 'Nà shì wǒ de shū.',  en: 'That is my book.' },
              { zh: '这个人是谁？', py: 'Zhège rén shì shéi?', en: 'Who is this person?' },
              { zh: '那不是我的。', py: 'Nà bú shì wǒ de.',   en: 'That is not mine.' },
            ],
            fillBlanks: [
              { sentence_zh: '这___什么？',    sentence_en: 'What ___ this?',            options: ['是', '的', '在', '有'],   correct: 0 },
              { sentence_zh: '___是我的书。',  sentence_en: '___ is my book.',            options: ['谁', '什么', '那', '哪'], correct: 2 },
              { sentence_zh: '这个人是___？',  sentence_en: 'Who is this person?',        options: ['那', '什么', '哪', '谁'], correct: 3 },
              { sentence_zh: '那___是我的。',  sentence_en: 'That is ___ mine.',          options: ['也', '不', '都', '很'],   correct: 1 },
            ],
          },
        ],
      },
      {
        id: 'h1-u7-s4', type: 'grammar', xp: 25,
        title: '语法：也和都', subtitle: 'Also vs All — 也 and 都',
        grammarPoints: [
          {
            pattern: 'Subject + 也 + Verb  (also / too)',
            explanation: '也 (yě) = "also / too." It always comes BEFORE the verb — never at the end of a sentence. Use it when adding one more person or thing to a situation.',
            examples: [
              { zh: '我也是学生。',   py: 'Wǒ yě shì xuésheng.',   en: 'I am also a student.' },
              { zh: '她也喜欢音乐。', py: 'Tā yě xǐhuān yīnyuè.',  en: 'She also likes music.' },
              { zh: '他也不去。',     py: 'Tā yě bù qù.',           en: 'He is not going either.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___是学生。', sentence_en: 'I am ___ a student.', options: ['都', '也', '和', '很'],  correct: 1 },
              { sentence_zh: '她___喜欢茶。', sentence_en: 'She ___ likes tea.',   options: ['也', '都', '很', '在'], correct: 0 },
              { sentence_zh: '他___不去。',   sentence_en: 'He is not going ___.',  options: ['很', '是', '也', '不'], correct: 2 },
            ],
          },
          {
            pattern: 'Plural Subject + 都 + Verb  (all / both)',
            explanation: '都 (dōu) = "all / both." Use with a group or multiple things. Always placed before the verb.',
            examples: [
              { zh: '我们都是学生。',   py: 'Wǒmen dōu shì xuésheng.',      en: 'We are all students.' },
              { zh: '他们都喜欢中文。', py: 'Tāmen dōu xǐhuān Zhōngwén.',   en: 'They all like Chinese.' },
              { zh: '这两本书都很好。', py: 'Zhè liǎng běn shū dōu hěn hǎo.', en: 'Both books are very good.' },
            ],
            fillBlanks: [
              { sentence_zh: '我们___是老师。',     sentence_en: 'We are ___ teachers.', options: ['也', '很', '在', '都'],   correct: 3 },
              { sentence_zh: '他们___去了。',       sentence_en: 'They ___ went.',        options: ['也', '很', '都', '没'],   correct: 2 },
              { sentence_zh: '我和他___喜欢音乐。', sentence_en: 'Both he and I ___ like music.', options: ['很', '都', '也', '在'], correct: 1 },
            ],
          },
        ],
      },
      { id: 'h1-u7-s5', type: 'practice', xp: 30, title: '语言练习', subtitle: 'Unit 7 review' },
    ],
  },

  // ── Unit 8 ──────────────────────────────────────────────────────────────────
  {
    id: 'h1-u8', hsk_level: 1,
    title: 'Unit 8', subtitle: '物品与房间 · Objects & Room',
    emoji: '🏠', color: 'from-teal-500 to-emerald-500',
    sessions: [
      {
        id: 'h1-u8-s1', type: 'vocab', xp: 20,
        title: '物品', subtitle: 'Common household objects',
        words: [
          { zh: '桌子', py: 'zhuōzi',   en: 'Table / Desk' },
          { zh: '椅子', py: 'yǐzi',     en: 'Chair' },
          { zh: '杯子', py: 'bēizi',    en: 'Cup / Glass' },
          { zh: '书',   py: 'shū',      en: 'Book' },
          { zh: '东西', py: 'dōngxi',   en: 'Thing / Stuff / Item' },
          { zh: '衣服', py: 'yīfu',     en: 'Clothes / Clothing' },
          { zh: '手机', py: 'shǒujī',   en: 'Cell phone / Mobile phone' },
          { zh: '房间', py: 'fángjiān', en: 'Room' },
        ],
      },
      {
        id: 'h1-u8-s2', type: 'vocab', xp: 20,
        title: '动作与位置', subtitle: 'Actions & location words',
        words: [
          { zh: '回',   py: 'huí',      en: 'Return / Go back' },
          { zh: '开',   py: 'kāi',      en: 'Open / Turn on / Drive' },
          { zh: '关',   py: 'guān',     en: 'Close / Turn off',    note: 'Opposite of 开' },
          { zh: '看见', py: 'kànjiàn',  en: 'See / Notice',        note: '看 = look, 看见 = actually see/notice' },
          { zh: '住',   py: 'zhù',      en: 'Live (at) / Stay' },
          { zh: '这里', py: 'zhèlǐ',   en: 'Here',                note: 'Also: 这儿 (zhèr) in Beijing dialect' },
          { zh: '那里', py: 'nàlǐ',    en: 'There',               note: 'Also: 那儿 (nàr) in Beijing dialect' },
          { zh: '外面', py: 'wàimiàn', en: 'Outside',             note: 'Opposite: 里面 (lǐmiàn) = inside' },
        ],
      },
      {
        id: 'h1-u8-s3', type: 'grammar', xp: 25,
        title: '语法：量词', subtitle: 'Measure words — the key to counting',
        grammarPoints: [
          {
            pattern: 'Number + 量词 (Measure Word) + Noun',
            explanation: 'Chinese requires a measure word between a number and a noun. Most common: 个(gè, general), 本(běn, books), 杯(bēi, cups), 件(jiàn, clothing), 只(zhī, animals). 个 is the safest default when unsure.',
            examples: [
              { zh: '我有两本书。',     py: 'Wǒ yǒu liǎng běn shū.',      en: 'I have two books.' },
              { zh: '请给我一杯水。',   py: 'Qǐng gěi wǒ yī bēi shuǐ.',   en: 'Please give me a cup of water.' },
              { zh: '她买了三件衣服。', py: 'Tā mǎi le sān jiàn yīfu.',    en: 'She bought three pieces of clothing.' },
              { zh: '那里有一个人。',   py: 'Nàlǐ yǒu yī gè rén.',        en: 'There is a person there.' },
            ],
            fillBlanks: [
              { sentence_zh: '我有两___书。',     sentence_en: 'I have two ___ books.',      options: ['杯', '个', '本', '件'], correct: 2 },
              { sentence_zh: '请给我一___水。',   sentence_en: 'Give me a ___ of water.',    options: ['本', '件', '个', '杯'], correct: 3 },
              { sentence_zh: '她买了三___衣服。', sentence_en: 'She bought three ___ clothes.', options: ['杯', '本', '件', '个'], correct: 2 },
              { sentence_zh: '那里有一___人。',   sentence_en: 'There is one ___ person.',   options: ['件', '本', '杯', '个'], correct: 3 },
            ],
          },
        ],
      },
      {
        id: 'h1-u8-s4', type: 'grammar', xp: 25,
        title: '语法：有表示存在', subtitle: 'Using 有 to express existence',
        grammarPoints: [
          {
            pattern: 'Place + 有 + Object  (There is/are... at/in...)',
            explanation: 'When 有 follows a place expression, it means "there is/are." Word order: PLACE first, then 有, then THING. Negative: Place + 没有 + Object.',
            examples: [
              { zh: '桌子上有一本书。',  py: 'Zhuōzi shàng yǒu yī běn shū.',  en: 'There is a book on the table.' },
              { zh: '房间里有椅子吗？',  py: 'Fángjiān lǐ yǒu yǐzi ma?',      en: 'Are there chairs in the room?' },
              { zh: '那里没有人。',      py: 'Nàlǐ méiyǒu rén.',              en: 'There is no one there.' },
              { zh: '包里有什么东西？',  py: 'Bāo lǐ yǒu shénme dōngxi?',    en: 'What is inside the bag?' },
            ],
            fillBlanks: [
              { sentence_zh: '桌子上___一本书。', sentence_en: 'There ___ a book on the table.', options: ['在', '有', '是', '住'],  correct: 1 },
              { sentence_zh: '房间里___椅子吗？', sentence_en: 'Are there ___ chairs in the room?', options: ['没', '是', '有', '在'], correct: 2 },
              { sentence_zh: '那里___有人。',     sentence_en: 'There is ___ one there.',           options: ['没', '不', '也', '都'], correct: 0 },
              { sentence_zh: '包里___什么东西？', sentence_en: 'What ___ inside the bag?',          options: ['在', '是', '有', '去'],  correct: 2 },
            ],
          },
        ],
      },
      { id: 'h1-u8-s5', type: 'practice', xp: 30, title: '物品练习', subtitle: 'Unit 8 review' },
    ],
  },

  // ── Unit 9 ──────────────────────────────────────────────────────────────────
  {
    id: 'h1-u9', hsk_level: 1,
    title: 'Unit 9', subtitle: '天气与时段 · Weather & Time of Day',
    emoji: '⛅', color: 'from-sky-500 to-blue-400',
    sessions: [
      {
        id: 'h1-u9-s1', type: 'vocab', xp: 20,
        title: '天气词', subtitle: 'Weather vocabulary',
        words: [
          { zh: '天气',   py: 'tiānqì',  en: 'Weather' },
          { zh: '下雨',   py: 'xià yǔ', en: 'To rain / It is raining',  note: 'Lit. "fall rain" — 下雪 = snow, 刮风 = wind' },
          { zh: '热',     py: 'rè',      en: 'Hot',                      note: 'Opposite: 冷 (lěng) = cold' },
          { zh: '冷',     py: 'lěng',    en: 'Cold' },
          { zh: '晴',     py: 'qíng',    en: 'Sunny / Clear (sky)' },
          { zh: '阴',     py: 'yīn',     en: 'Overcast / Cloudy' },
          { zh: '刮风',   py: 'guā fēng', en: 'Windy',                  note: 'Lit. "scrape wind"' },
          { zh: '暖和',   py: 'nuǎnhuo', en: 'Warm',                    note: 'Between hot and cold — pleasant warmth' },
        ],
      },
      {
        id: 'h1-u9-s2', type: 'vocab', xp: 20,
        title: '时段词', subtitle: 'Times of day & duration',
        words: [
          { zh: '上午',   py: 'shàngwǔ',  en: 'Morning (AM)',           note: '上午 = before noon; 早上 (zǎoshàng) = early morning' },
          { zh: '中午',   py: 'zhōngwǔ',  en: 'Noon / Midday' },
          { zh: '下午',   py: 'xiàwǔ',    en: 'Afternoon (PM)' },
          { zh: '晚上',   py: 'wǎnshàng', en: 'Evening / Night',        note: '晚上 = evening/night; 夜 = late night' },
          { zh: '分钟',   py: 'fēnzhōng', en: 'Minute',                 note: '两分钟 = 2 minutes, 半小时 = half an hour' },
          { zh: '小时',   py: 'xiǎoshí',  en: 'Hour',                   note: '一小时 = 1 hour; 小时 ≠ 点 (point in time)' },
          { zh: '一点儿', py: 'yīdiǎnr',  en: 'A little / A bit',       note: 'Softens requests: 等一点儿 = wait a bit' },
          { zh: '一些',   py: 'yīxiē',    en: 'Some / A few',           note: '一些水 = some water; more than 一点儿' },
        ],
      },
      {
        id: 'h1-u9-s3', type: 'grammar', xp: 25,
        title: '语法：怎么样', subtitle: 'Asking how something is',
        grammarPoints: [
          {
            pattern: 'Subject + 怎么样？  (How is/are...?)',
            explanation: '怎么样 (zěnme yàng) asks for an evaluation: "How is it? What do you think? How are you doing?" Answer with 很/不/太 + adjective, or a full sentence.',
            examples: [
              { zh: '天气怎么样？',   py: 'Tiānqì zěnme yàng?',   en: 'How is the weather?' },
              { zh: '今天天气很好。', py: 'Jīntiān tiānqì hěn hǎo.', en: 'The weather today is great.' },
              { zh: '你感觉怎么样？', py: 'Nǐ gǎnjué zěnme yàng?', en: 'How are you feeling?' },
              { zh: '这本书怎么样？', py: 'Zhè běn shū zěnme yàng?', en: 'How is this book?' },
            ],
            fillBlanks: [
              { sentence_zh: '今天天气___？',   sentence_en: 'How is the weather today?', options: ['怎么', '什么', '怎么样', '哪'], correct: 2 },
              { sentence_zh: '天气___好。',     sentence_en: 'The weather is ___ good.',  options: ['很', '太', '也', '都'],        correct: 0 },
              { sentence_zh: '你感觉___？',     sentence_en: 'How are you ___?',          options: ['什么', '哪', '怎么样', '也'],  correct: 2 },
              { sentence_zh: '这本书___？',     sentence_en: 'How is this book?',         options: ['也', '都', '什么', '怎么样'], correct: 3 },
            ],
          },
        ],
      },
      {
        id: 'h1-u9-s4', type: 'grammar', xp: 25,
        title: '语法：太…了', subtitle: 'Expressing excess with 太',
        grammarPoints: [
          {
            pattern: '太 + Adjective + 了  (Too / So...!)',
            explanation: '太 (tài) + Adj + 了 = "too [adj]" or shows strong emotion (= "so [adj]!"). The 了 at the end is required — without it, the sentence sounds incomplete. Often used as an exclamation.',
            examples: [
              { zh: '太热了！',       py: 'Tài rè le!',         en: "It's too hot! / So hot!" },
              { zh: '太贵了！',       py: 'Tài guì le!',        en: "Too expensive!" },
              { zh: '太好了！',       py: 'Tài hǎo le!',        en: "Excellent! / That's great!" },
              { zh: '今天太冷了。',   py: 'Jīntiān tài lěng le.', en: "It's too cold today." },
            ],
            fillBlanks: [
              { sentence_zh: '今天___热了！', sentence_en: 'It is ___ hot today!',       options: ['很', '太', '都', '也'],  correct: 1 },
              { sentence_zh: '太好___！',     sentence_en: 'That\'s ___!',               options: ['吗', '的', '了', '呢'],  correct: 2 },
              { sentence_zh: '这个___贵了。', sentence_en: 'This is ___ expensive.',     options: ['很', '也', '太', '都'],  correct: 2 },
              { sentence_zh: '___难了，我不会。', sentence_en: 'This is ___ hard for me.', options: ['很', '太', '也', '都'], correct: 1 },
            ],
          },
        ],
      },
      { id: 'h1-u9-s5', type: 'practice', xp: 30, title: '天气练习', subtitle: 'Unit 9 review' },
    ],
  },

  // ── Unit 10 ─────────────────────────────────────────────────────────────────
  {
    id: 'h1-u10', hsk_level: 1,
    title: 'Unit 10', subtitle: '爱好与生活 · Hobbies & Life',
    emoji: '🎉', color: 'from-rose-500 to-pink-500',
    sessions: [
      {
        id: 'h1-u10-s1', type: 'vocab', xp: 20,
        title: '爱好', subtitle: 'Hobbies & entertainment',
        words: [
          { zh: '喜欢', py: 'xǐhuān',   en: 'Like / Enjoy' },
          { zh: '爱',   py: 'ài',       en: 'Love',                    note: 'Stronger than 喜欢; also "love" for family/country' },
          { zh: '电视', py: 'diànshì',  en: 'Television / TV' },
          { zh: '电影', py: 'diànyǐng', en: 'Movie / Film' },
          { zh: '音乐', py: 'yīnyuè',   en: 'Music' },
          { zh: '读',   py: 'dú',       en: 'Read (aloud) / Study',    note: '读书 = study / read a book (emphasizes reading aloud)' },
          { zh: '踢球', py: 'tī qiú',   en: 'Play soccer / Kick a ball' },
          { zh: '游泳', py: 'yóuyǒng',  en: 'Swim' },
        ],
      },
      {
        id: 'h1-u10-s2', type: 'vocab', xp: 20,
        title: '生活词汇', subtitle: 'Life, family & money',
        words: [
          { zh: '儿子', py: 'érzi',      en: 'Son' },
          { zh: '女儿', py: "nǚ'ér",    en: 'Daughter' },
          { zh: '同学', py: 'tóngxué',  en: 'Classmate / Schoolmate' },
          { zh: '狗',   py: 'gǒu',      en: 'Dog' },
          { zh: '高兴', py: 'gāoxìng',  en: 'Happy / Glad',            note: 'Used for a specific happy moment; 开心 is more general joy' },
          { zh: '会',   py: 'huì',      en: 'Can / Know how to',       note: 'Learned ability: 会说汉语 = can speak Chinese (have learned it)' },
          { zh: '块',   py: 'kuài',     en: 'Yuan (informal) / Piece', note: 'Informal unit of Chinese currency; formal: 元 (yuán)' },
          { zh: '钱',   py: 'qián',     en: 'Money' },
        ],
      },
      {
        id: 'h1-u10-s3', type: 'grammar', xp: 25,
        title: '语法：喜欢和爱', subtitle: 'Expressing likes with 喜欢 / 爱',
        grammarPoints: [
          {
            pattern: 'Subject + 喜欢/爱 + Verb/Noun  (like / love + action or thing)',
            explanation: '喜欢 (xǐhuān) = "like." 爱 (ài) = "love" (stronger). Both can be followed by a noun (thing you like) or a verb (activity you like). No extra words needed between.',
            examples: [
              { zh: '我喜欢看电影。',  py: 'Wǒ xǐhuān kàn diànyǐng.', en: 'I like watching movies.' },
              { zh: '她爱唱歌。',      py: 'Tā ài chàng gē.',           en: 'She loves singing.' },
              { zh: '你喜欢什么音乐？', py: 'Nǐ xǐhuān shénme yīnyuè?', en: 'What music do you like?' },
              { zh: '他不喜欢狗。',    py: 'Tā bù xǐhuān gǒu.',        en: "He doesn't like dogs." },
            ],
            fillBlanks: [
              { sentence_zh: '我___看电影。',      sentence_en: 'I ___ watching movies.',     options: ['想', '喜欢', '去', '来'],  correct: 1 },
              { sentence_zh: '她非常___唱歌。',    sentence_en: 'She really ___ singing.',    options: ['会', '在', '爱', '是'],    correct: 2 },
              { sentence_zh: '你___什么音乐？',    sentence_en: 'What music do you ___?',     options: ['是', '在', '想', '喜欢'],  correct: 3 },
              { sentence_zh: '妈妈非常___孩子。',  sentence_en: 'Mom really ___ her children.', options: ['喜欢', '爱', '想', '在'], correct: 1 },
            ],
          },
        ],
      },
      {
        id: 'h1-u10-s4', type: 'grammar', xp: 25,
        title: '语法：会', subtitle: 'Expressing ability with 会',
        grammarPoints: [
          {
            pattern: 'Subject + 会 + Verb  (can / know how to)',
            explanation: '会 (huì) = learned ability. Use it for skills you\'ve acquired: 会说汉语 = can speak Chinese (you learned it). Different from 能 (can due to circumstance). 不会 = cannot / don\'t know how.',
            examples: [
              { zh: '你会说汉语吗？',   py: 'Nǐ huì shuō Hànyǔ ma?',    en: 'Can you speak Chinese?' },
              { zh: '我会一点儿。',     py: 'Wǒ huì yīdiǎnr.',           en: 'I can (speak) a little.' },
              { zh: '他不会游泳。',     py: 'Tā bú huì yóuyǒng.',        en: "He can't swim." },
              { zh: '你会不会做饭？',   py: 'Nǐ huì bu huì zuòfàn?',     en: 'Can you cook or not?' },
            ],
            fillBlanks: [
              { sentence_zh: '你___说汉语吗？',   sentence_en: 'Can you ___ Chinese?',     options: ['想', '会', '喜欢', '去'],  correct: 1 },
              { sentence_zh: '他不___游泳。',     sentence_en: "He ___ can't swim.",        options: ['想', '喜欢', '在', '会'],  correct: 3 },
              { sentence_zh: '你___做饭吗？',     sentence_en: 'Can you ___ cook?',         options: ['是', '在', '会', '去'],    correct: 2 },
              { sentence_zh: '我___一点儿汉语。', sentence_en: 'I can speak a little Chinese.', options: ['会', '不', '也', '想'], correct: 0 },
            ],
          },
        ],
      },
      { id: 'h1-u10-s5', type: 'practice', xp: 35, title: 'HSK 1 大回顾', subtitle: 'HSK 1 grand review' },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// HSK 2  (150 new words, units 1–6)
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

  // ── Unit 3 ──────────────────────────────────────────────────────────────────
  {
    id: 'h2-u3', hsk_level: 2,
    title: 'Unit 3', subtitle: '身体与健康 · Body & Health',
    emoji: '💪', color: 'from-rose-500 to-red-500',
    sessions: [
      {
        id: 'h2-u3-s1', type: 'vocab', xp: 25,
        title: '身体部位', subtitle: 'Parts of the body',
        words: [
          { zh: '头',   py: 'tóu',      en: 'Head' },
          { zh: '脸',   py: 'liǎn',     en: 'Face' },
          { zh: '手',   py: 'shǒu',     en: 'Hand' },
          { zh: '脚',   py: 'jiǎo',     en: 'Foot / Feet' },
          { zh: '眼睛', py: 'yǎnjīng',  en: 'Eyes',                   note: 'Singular and plural are the same form in Chinese' },
          { zh: '耳朵', py: 'ěrduǒ',   en: 'Ears' },
          { zh: '嘴',   py: 'zuǐ',      en: 'Mouth' },
          { zh: '鼻子', py: 'bízi',     en: 'Nose' },
          { zh: '身体', py: 'shēntǐ',   en: 'Body / Health',          note: '身体好 = to be in good health' },
        ],
      },
      {
        id: 'h2-u3-s2', type: 'vocab', xp: 25,
        title: '健康词汇', subtitle: 'Health & illness vocabulary',
        words: [
          { zh: '生病',  py: 'shēng bìng', en: 'Get sick / Fall ill' },
          { zh: '感冒',  py: 'gǎnmào',     en: 'Cold / Flu',          note: '发烧 = fever, 感冒 = common cold/flu' },
          { zh: '头疼',  py: 'tóuténg',    en: 'Headache',            note: 'Also: 头痛 (tóutòng) — same meaning' },
          { zh: '发烧',  py: 'fā shāo',    en: 'Have a fever' },
          { zh: '药',    py: 'yào',        en: 'Medicine / Drug' },
          { zh: '检查',  py: 'jiǎnchá',    en: 'Examine / Check up' },
          { zh: '健康',  py: 'jiànkāng',   en: 'Health / Healthy' },
          { zh: '舒服',  py: 'shūfu',      en: 'Comfortable / Well',  note: '不舒服 (bú shūfu) = unwell / uncomfortable' },
        ],
      },
      {
        id: 'h2-u3-s3', type: 'grammar', xp: 30,
        title: '语法：觉得', subtitle: 'Expressing feelings with 觉得',
        grammarPoints: [
          {
            pattern: 'Subject + 觉得 + Adjective / Clause  (feel / think that...)',
            explanation: '觉得 (juéde) = "feel" or "think." Use for subjective feelings or opinions. Followed by an adjective (觉得累 = feel tired) or full clause (觉得这很有趣 = think this is interesting).',
            examples: [
              { zh: '我觉得很累。',       py: 'Wǒ juéde hěn lèi.',             en: 'I feel very tired.' },
              { zh: '她觉得这本书很好。', py: 'Tā juéde zhè běn shū hěn hǎo.', en: 'She thinks this book is great.' },
              { zh: '你觉得怎么样？',     py: 'Nǐ juéde zěnme yàng?',          en: 'How do you feel?' },
              { zh: '我觉得身体不舒服。', py: 'Wǒ juéde shēntǐ bú shūfu.',     en: 'I feel unwell.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___很累。',       sentence_en: 'I ___ very tired.',          options: ['感觉', '觉得', '有', '是'],  correct: 1 },
              { sentence_zh: '她___这本书很好。', sentence_en: 'She ___ this book is great.', options: ['是', '会', '觉得', '在'],    correct: 2 },
              { sentence_zh: '你___怎么样？',     sentence_en: 'How do you ___?',            options: ['在', '觉得', '想', '是'],    correct: 1 },
              { sentence_zh: '我___身体不舒服。', sentence_en: 'I ___ unwell.',              options: ['想', '是', '在', '觉得'],    correct: 3 },
            ],
          },
        ],
      },
      {
        id: 'h2-u3-s4', type: 'grammar', xp: 30,
        title: '语法：应该', subtitle: 'Giving advice with 应该',
        grammarPoints: [
          {
            pattern: 'Subject + 应该 + Verb  (should / ought to)',
            explanation: '应该 (yīnggāi) = "should / ought to." Use for advice, recommendations, or what is expected. 不应该 = "should not." Often used for health advice or moral guidance.',
            examples: [
              { zh: '你应该多休息。',   py: 'Nǐ yīnggāi duō xiūxi.',          en: 'You should rest more.' },
              { zh: '你不应该熬夜。',   py: 'Nǐ bù yīnggāi áoyè.',            en: "You shouldn't stay up late." },
              { zh: '他应该去医院检查。', py: 'Tā yīnggāi qù yīyuàn jiǎnchá.', en: 'He should go to the hospital for a check-up.' },
              { zh: '我们应该多运动。', py: 'Wǒmen yīnggāi duō yùndòng.',     en: 'We should exercise more.' },
            ],
            fillBlanks: [
              { sentence_zh: '你___多休息。',   sentence_en: 'You ___ rest more.',          options: ['会', '想', '应该', '觉得'],  correct: 2 },
              { sentence_zh: '他___去医院。',   sentence_en: 'He ___ go to the hospital.',  options: ['不', '应该', '会', '想'],    correct: 1 },
              { sentence_zh: '你不___熬夜。',   sentence_en: 'You ___ stay up late.',       options: ['会', '应该', '想', '觉得'],  correct: 1 },
              { sentence_zh: '我们___多运动。', sentence_en: 'We ___ exercise more.',       options: ['想', '在', '应该', '会'],    correct: 2 },
            ],
          },
        ],
      },
      { id: 'h2-u3-s5', type: 'practice', xp: 35, title: '健康练习', subtitle: 'Unit 3 review' },
    ],
  },

  // ── Unit 4 ──────────────────────────────────────────────────────────────────
  {
    id: 'h2-u4', hsk_level: 2,
    title: 'Unit 4', subtitle: '情感与心情 · Emotions & Moods',
    emoji: '💭', color: 'from-violet-500 to-purple-500',
    sessions: [
      {
        id: 'h2-u4-s1', type: 'vocab', xp: 25,
        title: '积极情感', subtitle: 'Positive emotions & attitudes',
        words: [
          { zh: '开心',  py: 'kāixīn',   en: 'Happy / Cheerful',       note: '开心 = ongoing happiness; 高兴 = happy about something specific' },
          { zh: '满意',  py: 'mǎnyì',    en: 'Satisfied / Content' },
          { zh: '希望',  py: 'xīwàng',   en: 'Hope / Wish',            note: 'Also a verb: 我希望你来 = I hope you come' },
          { zh: '感谢',  py: 'gǎnxiè',   en: 'Grateful / Thank',       note: 'More formal than 谢谢' },
          { zh: '兴趣',  py: 'xìngqù',   en: 'Interest',               note: '对…有兴趣 = be interested in...' },
          { zh: '愿意',  py: 'yuànyì',   en: 'Willing / Be willing to' },
          { zh: '同意',  py: 'tóngyì',   en: 'Agree / Consent' },
          { zh: '相信',  py: 'xiāngxìn', en: 'Believe / Trust' },
        ],
      },
      {
        id: 'h2-u4-s2', type: 'vocab', xp: 25,
        title: '消极情感', subtitle: 'Negative emotions',
        words: [
          { zh: '难过',  py: 'nánguò',   en: 'Sad / Upset',            note: 'Lit. "difficult to pass through"' },
          { zh: '担心',  py: 'dānxīn',   en: 'Worried / Anxious' },
          { zh: '害怕',  py: 'hàipà',    en: 'Afraid / Scared' },
          { zh: '生气',  py: 'shēngqì',  en: 'Angry / Mad',            note: 'Lit. "produce anger/energy"' },
          { zh: '着急',  py: 'zháojí',   en: 'Anxious / In a hurry' },
          { zh: '失望',  py: 'shīwàng',  en: 'Disappointed' },
          { zh: '后悔',  py: 'hòuhuǐ',   en: 'Regret' },
          { zh: '伤心',  py: 'shāngxīn', en: 'Heartbroken / Sad',      note: 'Lit. "hurt heart" — deeper sadness than 难过' },
        ],
      },
      {
        id: 'h2-u4-s3', type: 'grammar', xp: 30,
        title: '语法：因为…所以', subtitle: 'Explaining reasons with 因为…所以',
        grammarPoints: [
          {
            pattern: '因为 + Reason, 所以 + Result',
            explanation: '因为 (yīnwèi) = "because." 所以 (suǒyǐ) = "therefore / so." They often appear together as a pair, but one can be omitted. 因为 introduces the cause; 所以 introduces the effect.',
            examples: [
              { zh: '因为下雨，所以我们不去了。',  py: 'Yīnwèi xià yǔ, suǒyǐ wǒmen bù qù le.', en: "Because it's raining, we're not going." },
              { zh: '因为他生病，所以没来上班。',  py: 'Yīnwèi tā shēng bìng, suǒyǐ méi lái shàngbān.', en: "Because he is sick, he didn't come to work." },
              { zh: '我很担心，因为她一个人在家。', py: 'Wǒ hěn dānxīn, yīnwèi tā yī gè rén zài jiā.', en: "I'm worried because she's home alone." },
            ],
            fillBlanks: [
              { sentence_zh: '___下雨，所以我不去了。',  sentence_en: '___ it rains, so I\'m not going.',    options: ['因为', '所以', '虽然', '如果'],  correct: 0 },
              { sentence_zh: '因为他生病，___没来。',    sentence_en: 'Because he\'s sick, ___ he didn\'t come.', options: ['因为', '所以', '也', '都'],   correct: 1 },
              { sentence_zh: '___天气好，我们出去了。',  sentence_en: '___ the weather was nice, we went out.', options: ['所以', '因为', '也', '都'],     correct: 1 },
              { sentence_zh: '因为很累，___早点睡了。',  sentence_en: 'Because tired, ___ went to bed early.',  options: ['所以', '也', '都', '很'],      correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h2-u4-s4', type: 'grammar', xp: 30,
        title: '语法：如果…就', subtitle: 'Conditional sentences with 如果…就',
        grammarPoints: [
          {
            pattern: '如果 + Condition, 就 + Result  (If..., then...)',
            explanation: '如果 (rúguǒ) = "if." 就 (jiù) = "then" (as a result). Together they form conditional sentences. 就 shows the immediate consequence. Can also use 如果 alone without 就.',
            examples: [
              { zh: '如果你有问题，就来找我。',     py: 'Rúguǒ nǐ yǒu wèntí, jiù lái zhǎo wǒ.',       en: 'If you have questions, come find me.' },
              { zh: '如果明天下雨，我们就不去了。', py: 'Rúguǒ míngtiān xià yǔ, wǒmen jiù bù qù le.',  en: "If it rains tomorrow, we won't go." },
              { zh: '如果你累了，就先休息吧。',     py: 'Rúguǒ nǐ lèi le, jiù xiān xiūxi ba.',         en: "If you're tired, rest first." },
            ],
            fillBlanks: [
              { sentence_zh: '___你有问题，就来找我。',  sentence_en: '___ you have questions, come find me.', options: ['如果', '因为', '所以', '虽然'], correct: 0 },
              { sentence_zh: '如果天气好，我们___去。',  sentence_en: 'If the weather is good, we ___ go.',    options: ['也', '都', '就', '很'],         correct: 2 },
              { sentence_zh: '___他来了，我就很高兴。', sentence_en: '___ he comes, I\'ll be happy.',          options: ['所以', '如果', '因为', '虽然'],  correct: 1 },
              { sentence_zh: '如果你不喜欢，___不要买。', sentence_en: 'If you don\'t like it, ___ don\'t buy.', options: ['也', '就', '都', '很'],        correct: 1 },
            ],
          },
        ],
      },
      { id: 'h2-u4-s5', type: 'practice', xp: 35, title: '情感练习', subtitle: 'Unit 4 review' },
    ],
  },

  // ── Unit 5 ──────────────────────────────────────────────────────────────────
  {
    id: 'h2-u5', hsk_level: 2,
    title: 'Unit 5', subtitle: '工作与学习 · Work & Study',
    emoji: '📊', color: 'from-amber-500 to-yellow-500',
    sessions: [
      {
        id: 'h2-u5-s1', type: 'vocab', xp: 25,
        title: '工作词汇', subtitle: 'Workplace vocabulary',
        words: [
          { zh: '公司',  py: 'gōngsī',   en: 'Company / Firm' },
          { zh: '同事',  py: 'tóngshì',  en: 'Colleague / Coworker' },
          { zh: '经理',  py: 'jīnglǐ',   en: 'Manager / Director' },
          { zh: '会议',  py: 'huìyì',    en: 'Meeting / Conference' },
          { zh: '电脑',  py: 'diànnǎo',  en: 'Computer' },
          { zh: '认真',  py: 'rènzhēn',  en: 'Serious / Conscientious / Diligent' },
          { zh: '努力',  py: 'nǔlì',     en: 'Work hard / Make an effort' },
          { zh: '成功',  py: 'chénggōng', en: 'Succeed / Success' },
        ],
      },
      {
        id: 'h2-u5-s2', type: 'vocab', xp: 25,
        title: '学习词汇', subtitle: 'Study & school vocabulary',
        words: [
          { zh: '大学',  py: 'dàxué',    en: 'University / College' },
          { zh: '教室',  py: 'jiàoshì',  en: 'Classroom' },
          { zh: '作业',  py: 'zuòyè',    en: 'Homework / Assignment' },
          { zh: '考试',  py: 'kǎoshì',   en: 'Exam / Test',             note: '参加考试 = take an exam; 通过考试 = pass an exam' },
          { zh: '复习',  py: 'fùxí',     en: 'Review / Revise',         note: 'Going over material you\'ve already learned' },
          { zh: '练习',  py: 'liànxí',   en: 'Practice / Exercise',     note: 'Practicing a skill actively' },
          { zh: '成绩',  py: 'chéngjì',  en: 'Grades / Score / Results' },
          { zh: '进步',  py: 'jìnbù',    en: 'Progress / Improve' },
        ],
      },
      {
        id: 'h2-u5-s3', type: 'grammar', xp: 30,
        title: '语法：比', subtitle: 'Making comparisons with 比',
        grammarPoints: [
          {
            pattern: 'A + 比 + B + Adjective  (A is more [adj] than B)',
            explanation: '比 (bǐ) = "compared to / more than." Place it between the two items being compared. The adjective goes at the END. Do NOT add 更 or 很 before the adjective in this pattern. Negative: A + 没有 + B + Adj.',
            examples: [
              { zh: '今天比昨天热。',   py: 'Jīntiān bǐ zuótiān rè.',      en: 'Today is hotter than yesterday.' },
              { zh: '汉语比英语难吗？', py: 'Hànyǔ bǐ Yīngyǔ nán ma?',    en: 'Is Chinese harder than English?' },
              { zh: '她比我高一点儿。', py: 'Tā bǐ wǒ gāo yīdiǎnr.',      en: 'She is a little taller than me.' },
              { zh: '他没有我跑得快。', py: 'Tā méiyǒu wǒ pǎo de kuài.',   en: 'He doesn\'t run as fast as me.' },
            ],
            fillBlanks: [
              { sentence_zh: '今天___昨天热。',   sentence_en: 'Today is ___ hot than yesterday.', options: ['比', '和', '也', '都'], correct: 0 },
              { sentence_zh: '他___我高。',       sentence_en: 'He is taller ___ me.',              options: ['和', '比', '也', '很'], correct: 1 },
              { sentence_zh: '汉语___英语难吗？', sentence_en: 'Is Chinese ___ English difficult?', options: ['和', '也', '比', '都'], correct: 2 },
              { sentence_zh: '她___我跑得快。',   sentence_en: 'She runs faster ___ me.',           options: ['比', '很', '也', '在'], correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h2-u5-s4', type: 'grammar', xp: 30,
        title: '语法：越来越', subtitle: 'Expressing a growing trend with 越来越',
        grammarPoints: [
          {
            pattern: 'Subject + 越来越 + Adjective/Verb  (more and more...)',
            explanation: '越来越 (yuè lái yuè) = "more and more / increasingly." Shows a trend that keeps increasing over time. Always followed by an adjective or verb. Never pair it with 很 or 太.',
            examples: [
              { zh: '我的汉语越来越好了。', py: 'Wǒ de Hànyǔ yuè lái yuè hǎo le.',    en: 'My Chinese is getting better and better.' },
              { zh: '天气越来越冷了。',     py: 'Tiānqì yuè lái yuè lěng le.',          en: 'The weather is getting colder and colder.' },
              { zh: '他越来越努力了。',     py: 'Tā yuè lái yuè nǔlì le.',              en: 'He is working harder and harder.' },
              { zh: '我越来越喜欢中国了。', py: 'Wǒ yuè lái yuè xǐhuān Zhōngguó le.',   en: 'I like China more and more.' },
            ],
            fillBlanks: [
              { sentence_zh: '我的汉语___好了。',  sentence_en: 'My Chinese is getting ___ good.',    options: ['更', '越来越', '很', '非常'],  correct: 1 },
              { sentence_zh: '天气___冷了。',      sentence_en: 'The weather is getting ___ cold.',   options: ['很', '也', '越来越', '非常'],  correct: 2 },
              { sentence_zh: '他___努力了。',      sentence_en: 'He is working ___ hard.',            options: ['越来越', '也', '很', '都'],    correct: 0 },
              { sentence_zh: '我___喜欢学汉语了。', sentence_en: 'I like learning Chinese ___ more.', options: ['都', '越来越', '也', '很'],    correct: 1 },
            ],
          },
        ],
      },
      { id: 'h2-u5-s5', type: 'practice', xp: 35, title: '工作学习练习', subtitle: 'Unit 5 review' },
    ],
  },

  // ── Unit 6 ──────────────────────────────────────────────────────────────────
  {
    id: 'h2-u6', hsk_level: 2,
    title: 'Unit 6', subtitle: '旅行与出行 · Travel & Getting Around',
    emoji: '✈️', color: 'from-indigo-500 to-blue-500',
    sessions: [
      {
        id: 'h2-u6-s1', type: 'vocab', xp: 25,
        title: '交通工具', subtitle: 'Modes of transport',
        words: [
          { zh: '火车',   py: 'huǒchē',     en: 'Train' },
          { zh: '高铁',   py: 'gāotiě',     en: 'High-speed rail (HSR)',  note: 'China\'s bullet train network; hugely popular' },
          { zh: '飞机',   py: 'fēijī',      en: 'Airplane' },
          { zh: '地铁',   py: 'dìtiě',      en: 'Subway / Metro' },
          { zh: '出租车', py: 'chūzūchē',   en: 'Taxi / Cab' },
          { zh: '公交车', py: 'gōngjiāochē', en: 'Public bus' },
          { zh: '坐',     py: 'zuò',        en: 'Sit / Take (transport)', note: '坐地铁 = take the subway; 坐飞机 = fly' },
          { zh: '骑',     py: 'qí',         en: 'Ride (bike, motorcycle)' },
        ],
      },
      {
        id: 'h2-u6-s2', type: 'vocab', xp: 25,
        title: '旅行准备', subtitle: 'Travel preparation vocabulary',
        words: [
          { zh: '旅游',  py: 'lǚyóu',   en: 'Travel / Tourism' },
          { zh: '行李',  py: 'xínglǐ',  en: 'Luggage / Baggage' },
          { zh: '酒店',  py: 'jiǔdiàn', en: 'Hotel',              note: '酒店 is the most common; also 宾馆 (bīnguǎn) = guesthouse' },
          { zh: '订',    py: 'dìng',    en: 'Book / Reserve',     note: '订票 = book a ticket; 订房间 = reserve a room' },
          { zh: '出发',  py: 'chūfā',   en: 'Set off / Depart' },
          { zh: '到达',  py: 'dàodá',   en: 'Arrive',             note: '到 (dào) alone also means arrive; 到达 is more formal' },
          { zh: '回来',  py: 'huí lái', en: 'Come back / Return' },
          { zh: '护照',  py: 'hùzhào',  en: 'Passport' },
        ],
      },
      {
        id: 'h2-u6-s3', type: 'grammar', xp: 30,
        title: '语法：先…再/然后', subtitle: 'Sequencing actions with 先…再/然后',
        grammarPoints: [
          {
            pattern: '先 + V1, 再/然后 + V2  (First..., then...)',
            explanation: '先 (xiān) = "first." 再 (zài) = "then" (same subject continues). 然后 (rán hòu) = "after that / afterward." Use 先…再 for the same person doing sequential steps. 然后 is more flexible.',
            examples: [
              { zh: '先买票，再上车。',         py: 'Xiān mǎi piào, zài shàng chē.',         en: 'Buy the ticket first, then board.' },
              { zh: '先吃饭，然后去图书馆。',   py: 'Xiān chī fàn, rán hòu qù túshūguǎn.',   en: 'First eat, then go to the library.' },
              { zh: '你先去，我再来。',         py: 'Nǐ xiān qù, wǒ zài lái.',               en: 'You go first, I\'ll come later.' },
            ],
            fillBlanks: [
              { sentence_zh: '___买票，再上车。',    sentence_en: '___ buy the ticket, then board.',  options: ['先', '后', '然后', '就'],  correct: 0 },
              { sentence_zh: '先吃饭，___去。',      sentence_en: 'First eat, ___ go.',               options: ['先', '然后', '因为', '如果'], correct: 1 },
              { sentence_zh: '你___坐下，我来。',    sentence_en: 'You sit down ___, then I\'ll come.', options: ['先', '再', '后', '就'],   correct: 0 },
              { sentence_zh: '先订酒店，___买机票。', sentence_en: 'First book the hotel, ___ buy the flight.', options: ['然后', '先', '因为', '所以'], correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h2-u6-s4', type: 'grammar', xp: 30,
        title: '语法：一…就', subtitle: 'Expressing immediate sequence with 一…就',
        grammarPoints: [
          {
            pattern: '一 + V1 + 就 + V2  (As soon as... [then]...)',
            explanation: '一 (yī) before a verb = "as soon as / once." 就 (jiù) introduces the immediate consequence. Together they show two events happening in tight sequence, almost automatically.',
            examples: [
              { zh: '一下班就回家。',       py: 'Yī xià bān jiù huí jiā.',       en: 'As soon as I get off work, I go home.' },
              { zh: '我一到家就吃饭。',     py: 'Wǒ yī dào jiā jiù chī fàn.',    en: 'As soon as I get home, I eat.' },
              { zh: '他一看到我就笑了。',   py: 'Tā yī kàndào wǒ jiù xiào le.',  en: 'As soon as he saw me, he smiled.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___下班就回家。',     sentence_en: 'As ___ as I get off work, I go home.',  options: ['一', '已经', '先', '然后'],  correct: 0 },
              { sentence_zh: '一到家___吃饭。',       sentence_en: 'As soon as (I) get home, ___ eat.',     options: ['就', '先', '再', '然后'],    correct: 0 },
              { sentence_zh: '她___到机场就打电话。', sentence_en: 'As ___ as she reaches the airport, she calls.', options: ['先', '一', '然后', '再'], correct: 1 },
              { sentence_zh: '我一看到他___认识他了。', sentence_en: 'As soon as I saw him, I recognized him.', options: ['才', '就', '先', '再'],  correct: 1 },
            ],
          },
        ],
      },
      { id: 'h2-u6-s5', type: 'practice', xp: 40, title: 'HSK 2 大回顾', subtitle: 'HSK 2 grand review' },
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
