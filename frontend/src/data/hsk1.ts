import type { UnitDef } from './curriculum'

// ─────────────────────────────────────────────────────────────────────────────
// HSK 1  — 150 core words, 10 units × 4-6 sessions = 49 sessions
// Based on official HSK 1 (old standard) word list; aligned with HSK 3.0 Band 1.
// ─────────────────────────────────────────────────────────────────────────────

export const HSK1: UnitDef[] = [
  {
    id: 'h1-u1', hsk_level: 1,
    title: 'Unit 1', subtitle: '问候 · Greetings',
    emoji: '👋', color: 'from-indigo-500 to-violet-500',
    culturalNote: '你好 is textbook-polite — close friends greet with "吃了吗?" (Have you eaten?) or just a name. Use 您 (nín) for teachers, elders, and customers.',
    sessions: [
      {
        id: 'h1-u1-s1', type: 'vocab', xp: 20,
        title: '打招呼', subtitle: 'Basic greetings',
        words: [
          { zh: '你好', py: 'nǐ hǎo',    en: 'Hello',              note: 'Lit. "you good" — most common greeting',
            example: { zh: '你好！你是学生吗？', py: 'Nǐ hǎo! Nǐ shì xuésheng ma?', en: 'Hello! Are you a student?' } },
          { zh: '你',   py: 'nǐ',        en: 'You',
            example: { zh: '你好吗？', py: 'Nǐ hǎo ma?', en: 'How are you?' } },
          { zh: '好',   py: 'hǎo',       en: 'Good / Fine',
            example: { zh: '我很好。', py: 'Wǒ hěn hǎo.', en: 'I am fine.' } },
          { zh: '再见', py: 'zàijiàn',   en: 'Goodbye',            note: 'Lit. "see again"',
            example: { zh: '再见，老师！', py: 'Zàijiàn, lǎoshī!', en: 'Goodbye, teacher!' } },
          { zh: '谢谢', py: 'xièxie',    en: 'Thank you',
            example: { zh: '谢谢你！', py: 'Xièxie nǐ!', en: 'Thank you!' } },
          { zh: '不客气', py: 'bú kèqi', en: "You're welcome",     note: 'Response to 谢谢',
            example: { zh: '谢谢！— 不客气。', py: 'Xièxie! — Bú kèqi.', en: "Thanks! — You're welcome." } },
          { zh: '喂',   py: 'wèi',       en: 'Hello (on the phone)', note: 'Only for phone calls; never use in person',
            example: { zh: '喂，你好！', py: 'Wéi, nǐ hǎo!', en: 'Hello? (answering the phone)' },
            funFact: 'Why phone-only? 喂 began as a shout to get someone\'s attention — like "hey!". When telephones reached China, speakers needed a word to check the line was alive, and 喂 stuck. Saying it face-to-face sounds like barking "hey!" at someone, so in person you greet with 你好 instead. On the phone it is usually softened to a rising second tone: wéi?' },
        ],
      },
      {
        id: 'h1-u1-s2', type: 'vocab', xp: 20,
        title: '道歉', subtitle: 'Apologies & politeness',
        words: [
          { zh: '对不起', py: 'duìbuqǐ',  en: 'Sorry / Excuse me',
            example: { zh: '对不起，我不是老师。', py: 'Duìbuqǐ, wǒ bú shì lǎoshī.', en: 'Sorry, I am not the teacher.' } },
          { zh: '没关系', py: 'méiguānxi', en: "No problem / It's okay", note: 'Response to 对不起',
            example: { zh: '对不起！— 没关系。', py: 'Duìbuqǐ! — Méiguānxi.', en: "Sorry! — It's okay." } },
          { zh: '请',     py: 'qǐng',     en: 'Please',            note: '请坐 = please sit; 请问 = excuse me, may I ask',
            example: { zh: '请坐。', py: 'Qǐng zuò.', en: 'Please sit down.' } },
          { zh: '好的',   py: 'hǎo de',   en: 'Okay / Sure',
            example: { zh: '好的，谢谢你！', py: 'Hǎo de, xièxie nǐ!', en: 'Okay, thank you!' } },
          { zh: '是',     py: 'shì',      en: 'Yes / To be',
            example: { zh: '我是学生。', py: 'Wǒ shì xuésheng.', en: 'I am a student.' } },
          { zh: '不',     py: 'bù',       en: 'No / Not',          note: 'Tone changes to bú before a 4th-tone syllable',
            example: { zh: '我不是老师。', py: 'Wǒ bú shì lǎoshī.', en: 'I am not a teacher.' } },
        ],
      },
      {
        id: 'h1-u1-s3', type: 'grammar', xp: 25,
        title: '语法：我是', subtitle: 'Identity statements',
        grammarPoints: [
          {
            pattern: 'Subject + 是 + Noun',
            explanation: '是 (shì) means "to be." Use it to state identity, nationality, or profession. It does NOT change form — no conjugation in Chinese!',
            examples: [
              { zh: '我是学生。',   py: 'Wǒ shì xuésheng.',    en: 'I am a student.' },
              { zh: '你是老师吗？', py: 'Nǐ shì lǎoshī ma?',   en: 'Are you a teacher?' },
              { zh: '他是中国人。', py: 'Tā shì Zhōngguórén.', en: 'He is Chinese.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___学生。',   sentence_en: 'I ___ a student.',        options: ['是', '好', '不', '你'], correct: 0 },
              { sentence_zh: '你___老师吗？', sentence_en: 'Are you ___ a teacher?',  options: ['好', '是', '我', '他'], correct: 1 },
            ],
          },
          {
            pattern: 'Subject + 不是 + Noun',
            explanation: 'To negate 是, put 不 before it: 不是 (bú shì) = "is not."',
            examples: [
              { zh: '我不是老师。', py: 'Wǒ bú shì lǎoshī.',   en: 'I am not a teacher.' },
              { zh: '他不是学生。', py: 'Tā bú shì xuésheng.', en: 'He is not a student.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___是老师。', sentence_en: 'I am ___ a teacher.', options: ['好', '不', '是', '你'], correct: 1 },
            ],
          },
        ],
      },
      { id: 'h1-u1-s4', type: 'practice', xp: 30, title: '综合练习', subtitle: 'Unit 1 review' },
      {
        id: 'h1-u1-s5', type: 'grammar', xp: 25,
        title: '语法：吗', subtitle: 'Turning statements into questions',
        grammarPoints: [
          {
            pattern: 'Statement + 吗？',
            explanation: '吗 (ma) turns any statement into a yes/no question by adding it to the end. No word order change needed — unlike English! Answer with 是 (yes) or 不是/不 (no), or repeat the verb.',
            examples: [
              { zh: '你是学生吗？',   py: 'Nǐ shì xuésheng ma?',   en: 'Are you a student?' },
              { zh: '你有时间吗？',   py: 'Nǐ yǒu shíjiān ma?',    en: 'Do you have time?' },
              { zh: '这是你的书吗？', py: 'Zhè shì nǐ de shū ma?', en: 'Is this your book?' },
              { zh: '他是中国人吗？', py: 'Tā shì Zhōngguórén ma?', en: 'Is he Chinese?' },
            ],
            fillBlanks: [
              { sentence_zh: '你是老师___？',   sentence_en: 'Are you a teacher ___?', options: ['吗', '呢', '了', '不'],   correct: 0 },
              { sentence_zh: '这是你的书___？', sentence_en: 'Is this your book ___?', options: ['不', '吗', '呢', '了'],   correct: 1 },
              { sentence_zh: '他是中国人___？', sentence_en: 'Is he Chinese ___?',      options: ['了', '的', '吗', '也'],   correct: 2 },
              { sentence_zh: '你有时间___？',   sentence_en: 'Do you have time ___?',  options: ['的', '呢', '了', '吗'],   correct: 3 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'h1-u2', hsk_level: 1,
    title: 'Unit 2', subtitle: '人称与家庭 · People',
    emoji: '👨‍👩‍👧', color: 'from-pink-500 to-rose-500',
    culturalNote: 'Chinese family words encode age order: 哥哥 (older brother) vs 弟弟 (younger brother). Seniority shapes how you address everyone — even strangers can be 阿姨 (auntie).',
    sessions: [
      {
        id: 'h1-u2-s1', type: 'vocab', xp: 20,
        title: '代词', subtitle: 'Pronouns',
        words: [
          { zh: '我',   py: 'wǒ',     en: 'I / Me' },
          { zh: '他',   py: 'tā',     en: 'He / Him' },
          { zh: '她',   py: 'tā',     en: 'She / Her',           note: '他 and 她 sound identical, differ only in writing' },
          { zh: '我们', py: 'wǒmen',  en: 'We / Us' },
          { zh: '你们', py: 'nǐmen',  en: 'You (plural)' },
          { zh: '他们', py: 'tāmen',  en: 'They / Them' },
          { zh: '谁',   py: 'shéi',   en: 'Who' },
          { zh: '您',   py: 'nín',    en: 'You (respectful)',    note: 'Polite form of 你 — use for elders, teachers, customers' },
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
          { zh: '中国人',py: 'Zhōngguórén', en: 'Chinese person' },
          { zh: '名字',  py: 'míngzi',    en: 'Name' },
        ],
      },
      {
        id: 'h1-u2-s4', type: 'grammar', xp: 25,
        title: '语法：的', subtitle: 'Possession with 的',
        grammarPoints: [
          {
            pattern: 'A + 的 + B',
            explanation: "的 (de) is a possessive particle, like 's in English. Place it between the possessor and what is possessed. With close family members, 的 can be omitted: 我妈妈 (my mom).",
            examples: [
              { zh: '我的书',       py: 'wǒ de shū',        en: 'My book' },
              { zh: '你的朋友',     py: 'nǐ de péngyou',    en: 'Your friend' },
              { zh: '他的妈妈',     py: 'tā de māma',       en: 'His mother' },
              { zh: '我们的老师',   py: 'wǒmen de lǎoshī',  en: 'Our teacher' },
            ],
            fillBlanks: [
              { sentence_zh: '这是我___书。',     sentence_en: "This is my ___ book.",        options: ['是', '的', '不', '好'],   correct: 1 },
              { sentence_zh: '他___妈妈是老师。', sentence_en: "His ___ mother is a teacher.", options: ['们', '的', '是', '不'],   correct: 1 },
              { sentence_zh: '这是你___名字吗？', sentence_en: "Is this your ___ name?",       options: ['是', '不', '的', '们'],   correct: 2 },
            ],
          },
        ],
      },
      { id: 'h1-u2-s5', type: 'practice', xp: 30, title: '综合练习', subtitle: 'Unit 2 review' },
    ],
  },

  {
    id: 'h1-u3', hsk_level: 1,
    title: 'Unit 3', subtitle: '数字与时间 · Numbers & Time',
    emoji: '🔢', color: 'from-amber-500 to-orange-500',
    culturalNote: '8 (八 bā) is lucky — it sounds like 发 fā "get rich". 4 (四 sì) sounds like 死 sǐ "death", so many buildings skip the 4th floor entirely.',
    sessions: [
      {
        id: 'h1-u3-s1', type: 'vocab', xp: 20,
        title: '数字 0–10', subtitle: 'Numbers zero to ten',
        words: [
          { zh: '零', py: 'líng', en: 'Zero (0)' },
          { zh: '一', py: 'yī',  en: 'One (1)',   note: 'Tone changes to yí before 4th tone (一个 yí gè) and yì before other tones' },
          { zh: '二', py: 'èr',  en: 'Two (2)',   note: 'Used in compound numbers: 二十 = 20; use 两 with measure words' },
          { zh: '三', py: 'sān', en: 'Three (3)' },
          { zh: '四', py: 'sì',  en: 'Four (4)' },
          { zh: '五', py: 'wǔ',  en: 'Five (5)' },
          { zh: '六', py: 'liù', en: 'Six (6)' },
          { zh: '七', py: 'qī',  en: 'Seven (7)' },
          { zh: '八', py: 'bā',  en: 'Eight (8)' },
          { zh: '九', py: 'jiǔ', en: 'Nine (9)' },
          { zh: '十', py: 'shí', en: 'Ten (10)',  note: '十一 = 11, 二十 = 20, 三十 = 30 … 一百 = 100' },
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
          { zh: '日',   py: 'rì',       en: 'Day (formal, of month)',   note: '三月十五日 = March 15th (formal/written)' },
          { zh: '星期', py: 'xīngqī',   en: 'Week / Weekday',           note: '星期一 = Monday, 星期二 = Tuesday … 星期日/天 = Sunday' },
          { zh: '现在', py: 'xiànzài',  en: 'Now / Right now' },
          { zh: '号',   py: 'hào',      en: 'Date (of month, spoken)',  note: '今天几号？= What is today\'s date? 三号 = the 3rd (spoken)' },
          { zh: '时候', py: 'shíhou',   en: 'Time / Moment',            note: '什么时候？= When? (at what time/moment)' },
        ],
      },
      {
        id: 'h1-u3-s3', type: 'grammar', xp: 25,
        title: '语法：几点了', subtitle: 'Telling time',
        grammarPoints: [
          {
            pattern: '现在几点？/ 几点了？',
            explanation: "几 (jǐ) = \"how many.\" 点 (diǎn) = \"o'clock.\" Together 几点 = \"what time.\" No verb needed — Chinese time expressions are direct. 半 (bàn) = half past; 刻 (kè) = quarter.",
            examples: [
              { zh: '现在几点？',     py: 'Xiànzài jǐ diǎn?',       en: 'What time is it now?' },
              { zh: '现在八点。',     py: 'Xiànzài bā diǎn.',        en: "It's eight o'clock." },
              { zh: '下午三点半。',   py: 'Xiàwǔ sān diǎn bàn.',     en: "It's 3:30 in the afternoon." },
              { zh: '上午九点一刻。', py: 'Shàngwǔ jiǔ diǎn yī kè.', en: "It's 9:15 in the morning." },
            ],
            fillBlanks: [
              { sentence_zh: '现在___点？',   sentence_en: 'What ___ is it now?',    options: ['几', '多', '一', '今'],   correct: 0 },
              { sentence_zh: '现在八___。',   sentence_en: "It's eight ___.",         options: ['年', '月', '点', '七'],   correct: 2 },
              { sentence_zh: '今天___号？',   sentence_en: "What ___ is today?",      options: ['多', '几', '是', '有'],   correct: 1 },
              { sentence_zh: '下午___点半。', sentence_en: "It's ___ thirty in the afternoon.", options: ['四', '三', '两', '日'], correct: 1 },
            ],
          },
        ],
      },
      { id: 'h1-u3-s4', type: 'practice', xp: 30, title: '数字练习', subtitle: 'Numbers & time review' },
      {
        id: 'h1-u3-s5', type: 'grammar', xp: 25,
        title: '语法：几岁了', subtitle: 'Asking age + 两 vs 二',
        grammarPoints: [
          {
            pattern: '你多大了？ / 你几岁了？  (How old are you?)',
            explanation: '多大 (duō dà) = how old (for anyone). 几岁 (jǐ suì) = how old (for young children, under ~10). Answer: 我 + [number] + 岁 (suì = year of age). Important: use 两 (liǎng) before measure words (两个人 = 2 people; 两岁 = 2 years old), and 二 (èr) in compound numbers (二十 = 20).',
            examples: [
              { zh: '你今年多大了？',       py: 'Nǐ jīnnián duō dà le?',       en: 'How old are you this year?' },
              { zh: '我二十五岁。',         py: 'Wǒ èrshíwǔ suì.',             en: 'I am twenty-five years old.' },
              { zh: '他的女儿两岁了。',     py: 'Tā de nǚ\'ér liǎng suì le.',   en: 'His daughter is two years old.' },
              { zh: '我有两个哥哥。',       py: 'Wǒ yǒu liǎng gè gēge.',       en: 'I have two older brothers.' },
            ],
            fillBlanks: [
              { sentence_zh: '你今年多大___？',   sentence_en: 'How old are you this year ___?', options: ['吗', '了', '的', '呢'],   correct: 1 },
              { sentence_zh: '我二十___。',       sentence_en: 'I am twenty ___ years old.',      options: ['号', '月', '岁', '年'],   correct: 2 },
              { sentence_zh: '今天几___？',       sentence_en: 'What is today\'s date?',          options: ['岁', '点', '号', '月'],   correct: 2 },
              { sentence_zh: '我有___个姐姐。',   sentence_en: 'I have two older sisters.',       options: ['二', '两', '三', '几'],   correct: 1 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'h1-u4', hsk_level: 1,
    title: 'Unit 4', subtitle: '地点与交通 · Places & Transport',
    emoji: '📍', color: 'from-emerald-500 to-teal-500',
    culturalNote: 'Chinese addresses run big → small: country, city, district, street, number. The same logic shapes dates (year-month-day) and names (family name first).',
    sessions: [
      {
        id: 'h1-u4-s1', type: 'vocab', xp: 20,
        title: '地方', subtitle: 'Common places',
        words: [
          { zh: '家',   py: 'jiā',       en: 'Home / Family' },
          { zh: '学校', py: 'xuéxiào',   en: 'School' },
          { zh: '医院', py: 'yīyuàn',    en: 'Hospital' },
          { zh: '商店', py: 'shāngdiàn', en: 'Store / Shop' },
          { zh: '饭馆', py: 'fànguǎn',   en: 'Restaurant',          note: 'Common informal restaurant; 饭店 (fàndiàn) can also mean hotel' },
          { zh: '中国', py: 'Zhōngguó',  en: 'China' },
          { zh: '北京', py: 'Běijīng',   en: 'Beijing' },
        ],
      },
      {
        id: 'h1-u4-s2', type: 'vocab', xp: 20,
        title: '方位', subtitle: 'Directions & location',
        words: [
          { zh: '上',   py: 'shàng',     en: 'Above / On top' },
          { zh: '下',   py: 'xià',       en: 'Below / Under' },
          { zh: '前面', py: 'qiánmiàn',  en: 'In front / Ahead',    note: '前 alone = front; 前面 = in front of [something]' },
          { zh: '后面', py: 'hòumiàn',   en: 'Behind / In back',    note: '后 alone = behind; 后面 = the back of [something]' },
          { zh: '里',   py: 'lǐ',        en: 'Inside' },
          { zh: '外',   py: 'wài',       en: 'Outside' },
          { zh: '左',   py: 'zuǒ',       en: 'Left' },
          { zh: '右',   py: 'yòu',       en: 'Right' },
        ],
      },
      {
        id: 'h1-u4-s3', type: 'grammar', xp: 25,
        title: '语法：在哪里', subtitle: 'Expressing location',
        grammarPoints: [
          {
            pattern: 'Subject + 在 + Place',
            explanation: '在 (zài) means "to be at/in/on." It expresses location. Unlike English, no separate verb "to be" is needed.',
            examples: [
              { zh: '我在家。',        py: 'Wǒ zài jiā.',             en: "I'm at home." },
              { zh: '他在学校。',      py: 'Tā zài xuéxiào.',         en: "He's at school." },
              { zh: '书在桌子上。',    py: 'Shū zài zhuōzi shàng.',   en: 'The book is on the table.' },
              { zh: '学校在前面。',    py: 'Xuéxiào zài qiánmiàn.',   en: 'The school is ahead / in front.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___家。',       sentence_en: "I'm ___ home.",             options: ['是', '有', '在', '不'],   correct: 2 },
              { sentence_zh: '书在桌子___。',   sentence_en: 'The book is ___ the table.', options: ['里', '下', '上', '外'],   correct: 2 },
              { sentence_zh: '你在哪___？',     sentence_en: 'Where are you?',             options: ['里', '边', '面', '儿'],   correct: 0 },
            ],
          },
        ],
      },
      { id: 'h1-u4-s4', type: 'practice', xp: 30, title: '地点练习', subtitle: 'Places & location review' },
      {
        id: 'h1-u4-s5', type: 'vocab', xp: 25,
        title: '交通工具', subtitle: 'Getting around — transportation',
        words: [
          { zh: '飞机',   py: 'fēijī',      en: 'Airplane',            note: '坐飞机 = take a plane; 飞机场 (fēijīchǎng) = airport' },
          { zh: '出租车', py: 'chūzūchē',   en: 'Taxi / Cab',          note: '打车 (dǎ chē) = hail a cab — very common spoken term' },
          { zh: '火车站', py: 'huǒchēzhàn', en: 'Train station',       note: '火车 = train; 站 = station/stop; 地铁站 = subway station' },
          { zh: '坐',     py: 'zuò',        en: 'Sit / Take (transport)', note: '坐飞机 = fly; 坐出租车 = take a taxi; 坐 also means "sit"' },
          { zh: '开车',   py: 'kāi chē',    en: 'Drive a car',         note: '开 = operate/drive; 开门 = open a door' },
        ],
      },
    ],
  },

  {
    id: 'h1-u5', hsk_level: 1,
    title: 'Unit 5', subtitle: '饮食 · Food & Drink',
    emoji: '🍜', color: 'from-red-500 to-orange-400',
    culturalNote: 'Meals are shared — dishes sit in the middle of the table for everyone. "你吃了吗?" (Have you eaten?) is a warm greeting, not literally an invitation to dinner.',
    sessions: [
      {
        id: 'h1-u5-s1', type: 'vocab', xp: 20,
        title: '食物与饮料', subtitle: 'Food & beverages',
        words: [
          { zh: '水',   py: 'shuǐ',    en: 'Water' },
          { zh: '茶',   py: 'chá',     en: 'Tea' },
          { zh: '牛奶', py: 'niúnǎi',  en: 'Milk' },
          { zh: '米饭', py: 'mǐfàn',   en: 'Cooked rice',         note: '米 = uncooked rice; 米饭 = the cooked dish' },
          { zh: '菜',   py: 'cài',     en: 'Dish / Vegetable',    note: '中国菜 = Chinese cuisine; 炒菜 = stir-fried dish' },
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
          { zh: '好吃',   py: 'hǎochī',       en: 'Delicious',   note: 'Lit. "good eat"' },
          { zh: '贵',     py: 'guì',          en: 'Expensive' },
          { zh: '便宜',   py: 'piányí',       en: 'Cheap / Inexpensive' },
          { zh: '多少钱', py: 'duōshao qián', en: 'How much money?', note: 'Essential shopping phrase — 多少 = how many/much, 钱 = money' },
        ],
      },
      {
        id: 'h1-u5-s3', type: 'grammar', xp: 25,
        title: '语法：想', subtitle: 'Expressing wants',
        grammarPoints: [
          {
            pattern: 'Subject + 想 + Verb + Object',
            explanation: '想 (xiǎng) means "want to" or "would like to." Place it before the action verb. It also means "think" or "miss someone" when used differently.',
            examples: [
              { zh: '我想吃米饭。',  py: 'Wǒ xiǎng chī mǐfàn.',  en: 'I want to eat rice.' },
              { zh: '你想喝什么？', py: 'Nǐ xiǎng hē shénme?',   en: 'What do you want to drink?' },
              { zh: '他想买苹果。', py: 'Tā xiǎng mǎi píngguǒ.', en: 'He wants to buy apples.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___吃面条。',  sentence_en: 'I ___ eat noodles.',          options: ['是', '想', '在', '买'],   correct: 1 },
              { sentence_zh: '你想___什么？',  sentence_en: 'What do you want to ___?',     options: ['吃', '是', '我', '在'],   correct: 0 },
              { sentence_zh: '他___买苹果。',  sentence_en: 'He wants to ___ apples.',      options: ['在', '想', '是', '买'],   correct: 1 },
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
    culturalNote: 'Chinese verbs never conjugate — 去 is go/goes/went/going. Time is carried by context and particles: 不 negates habits and the future, 没 negates the past.',
    sessions: [
      {
        id: 'h1-u6-s1', type: 'vocab', xp: 20,
        title: '基本动词', subtitle: 'Essential action words',
        words: [
          { zh: '有',   py: 'yǒu',   en: 'Have / There is' },
          { zh: '去',   py: 'qù',    en: 'Go' },
          { zh: '来',   py: 'lái',   en: 'Come' },
          { zh: '看',   py: 'kàn',   en: 'Look / Watch / Read' },
          { zh: '说',   py: 'shuō',  en: 'Say / Speak' },
          { zh: '听',   py: 'tīng',  en: 'Listen' },
          { zh: '写',   py: 'xiě',   en: 'Write' },
          { zh: '学习', py: 'xuéxí', en: 'Study / Learn',      note: '学习 is the full compound; 学 alone can mean "learn/mimic"' },
        ],
      },
      {
        id: 'h1-u6-s2', type: 'vocab', xp: 20,
        title: '更多动词', subtitle: 'More useful verbs',
        words: [
          { zh: '做',    py: 'zuò',        en: 'Do / Make' },
          { zh: '工作',  py: 'gōngzuò',    en: 'Work' },
          { zh: '睡觉',  py: 'shuìjiào',   en: 'Sleep' },
          { zh: '打电话',py: 'dǎ diànhuà', en: 'Make a phone call' },
          { zh: '坐',    py: 'zuò',        en: 'Sit / Take (transport)', note: '坐火车 = take the train; 请坐 = please sit down' },
          { zh: '知道',  py: 'zhīdào',     en: 'Know (a fact)',           note: '我不知道 = I don\'t know — one of the most useful phrases!' },
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
              { zh: '我不去。',     py: 'Wǒ bù qù.',       en: "I'm not going." },
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
              { zh: '我没有钱。',  py: 'Wǒ méiyǒu qián.',   en: "I don't have money." },
              { zh: '他没吃饭。',  py: 'Tā méi chī fàn.',    en: "He didn't eat." },
              { zh: '我没有时间。', py: 'Wǒ méiyǒu shíjiān.', en: "I don't have time." },
            ],
            fillBlanks: [
              { sentence_zh: '我___有钱。', sentence_en: "I ___ have money.",     options: ['不', '没', '在', '是'], correct: 1 },
              { sentence_zh: '他___吃饭。', sentence_en: "He didn't eat.",        options: ['没', '不', '很', '好'], correct: 0 },
            ],
          },
        ],
      },
      { id: 'h1-u6-s4', type: 'practice', xp: 35, title: '最终测试', subtitle: 'HSK 1 halfway review' },
    ],
  },

  // ── Unit 7 ──────────────────────────────────────────────────────────────────
  {
    id: 'h1-u7', hsk_level: 1,
    title: 'Unit 7', subtitle: '语言与描述 · Language & Description',
    emoji: '💬', color: 'from-blue-500 to-cyan-500',
    culturalNote: 'Mandarin is 普通话 "common speech" — one of many Chinese languages. Speakers of Cantonese or Shanghainese may not understand each other, yet all share one writing system.',
    sessions: [
      {
        id: 'h1-u7-s1', type: 'vocab', xp: 20,
        title: '疑问词与助词', subtitle: 'Question words & sentence particles',
        words: [
          { zh: '什么', py: 'shénme',     en: 'What' },
          { zh: '哪',   py: 'nǎ',         en: 'Which',            note: '哪个(nǎge) = which one; 哪里/哪儿 = where' },
          { zh: '哪儿', py: 'nǎr',        en: 'Where',            note: 'Spoken "where"; written form is 哪里(nǎlǐ) — same meaning' },
          { zh: '那',   py: 'nà',         en: 'That',             note: '那(nà 4th) vs 哪(nǎ 3rd) — same sound, different tone & meaning!' },
          { zh: '这',   py: 'zhè',        en: 'This',             note: '这 = near speaker; 那 = far from speaker' },
          { zh: '怎么', py: 'zěnme',      en: 'How / Why (method)' },
          { zh: '也',   py: 'yě',         en: 'Also / Too',       note: 'Always before the verb: 我也去 ✓, 我去也 ✗' },
          { zh: '都',   py: 'dōu',        en: 'All / Both',       note: 'Use with plural subjects before the verb' },
          { zh: '吗',   py: 'ma',         en: 'Question particle (yes/no)', note: 'Turns a statement into a question: 你好吗？' },
          { zh: '呢',   py: 'ne',         en: 'Sentence particle (and you? / what about?)', note: '你呢？= And you? / What about you?' },
        ],
      },
      {
        id: 'h1-u7-s2', type: 'vocab', xp: 20,
        title: '描述与介绍', subtitle: 'Describing & introducing people',
        words: [
          { zh: '和',   py: 'hé',        en: 'And / With',        note: 'Connects nouns: 我和你 = you and me (not for verbs!)' },
          { zh: '漂亮', py: 'piàoliang', en: 'Pretty / Beautiful' },
          { zh: '认识', py: 'rènshi',    en: 'Know (a person) / Recognize' },
          { zh: '叫',   py: 'jiào',      en: 'Be called / Named', note: '你叫什么名字？= What is your name?' },
          { zh: '汉语', py: 'Hànyǔ',    en: 'Chinese language',  note: '汉语 = formal; 中文 (Zhōngwén) also widely used' },
          { zh: '先生', py: 'xiānsheng', en: 'Mr. / Gentleman',   note: 'Respectful address for men; also means "husband" (spoken)' },
          { zh: '小姐', py: 'xiǎojiě',  en: 'Miss / Young lady' },
          { zh: '人',   py: 'rén',       en: 'Person / People' },
          { zh: '字',   py: 'zì',        en: 'Character / Written word', note: '汉字 (Hànzì) = Chinese character; 这个字怎么读？= How to read this character?' },
          { zh: '能',   py: 'néng',      en: 'Can / Be able to (circumstances)', note: 'Based on circumstances or permission — different from 会 (learned skill)' },
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
              { zh: '这是什么？',   py: 'Zhè shì shénme?',     en: 'What is this?' },
              { zh: '那是我的书。', py: 'Nà shì wǒ de shū.',   en: 'That is my book.' },
              { zh: '这个人是谁？', py: 'Zhège rén shì shéi?', en: 'Who is this person?' },
              { zh: '那不是我的。', py: 'Nà bú shì wǒ de.',    en: 'That is not mine.' },
            ],
            fillBlanks: [
              { sentence_zh: '这___什么？',    sentence_en: 'What ___ this?',           options: ['是', '的', '在', '有'],   correct: 0 },
              { sentence_zh: '___是我的书。',  sentence_en: '___ is my book.',           options: ['谁', '什么', '那', '哪'], correct: 2 },
              { sentence_zh: '这个人是___？',  sentence_en: 'Who is this person?',       options: ['那', '什么', '哪', '谁'], correct: 3 },
              { sentence_zh: '那___是我的。',  sentence_en: 'That is ___ mine.',         options: ['也', '不', '都', '很'],   correct: 1 },
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
            explanation: '也 (yě) = "also / too." It always comes BEFORE the verb — never at the end of a sentence. Use it when adding one more person or thing.',
            examples: [
              { zh: '我也是学生。',   py: 'Wǒ yě shì xuésheng.',   en: 'I am also a student.' },
              { zh: '她也喜欢音乐。', py: 'Tā yě xǐhuān yīnyuè.',  en: 'She also likes music.' },
              { zh: '他也不去。',     py: 'Tā yě bù qù.',           en: 'He is not going either.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___是学生。', sentence_en: 'I am ___ a student.', options: ['都', '也', '和', '很'],  correct: 1 },
              { sentence_zh: '她___喜欢茶。', sentence_en: 'She ___ likes tea.',   options: ['也', '都', '很', '在'],  correct: 0 },
              { sentence_zh: '他___不去。',   sentence_en: 'He is not going ___.',  options: ['很', '是', '也', '不'],  correct: 2 },
            ],
          },
          {
            pattern: 'Plural Subject + 都 + Verb  (all / both)',
            explanation: '都 (dōu) = "all / both." Use with a group or multiple things. Always placed before the verb.',
            examples: [
              { zh: '我们都是学生。',   py: 'Wǒmen dōu shì xuésheng.',        en: 'We are all students.' },
              { zh: '他们都喜欢中文。', py: 'Tāmen dōu xǐhuān Zhōngwén.',     en: 'They all like Chinese.' },
              { zh: '这两本书都很好。', py: 'Zhè liǎng běn shū dōu hěn hǎo.', en: 'Both books are very good.' },
            ],
            fillBlanks: [
              { sentence_zh: '我们___是老师。',     sentence_en: 'We are ___ teachers.',           options: ['也', '很', '在', '都'],   correct: 3 },
              { sentence_zh: '他们___去了。',       sentence_en: 'They ___ went.',                 options: ['也', '很', '都', '没'],   correct: 2 },
              { sentence_zh: '我和他___喜欢音乐。', sentence_en: 'Both he and I ___ like music.',   options: ['很', '都', '也', '在'],   correct: 1 },
            ],
          },
        ],
      },
      { id: 'h1-u7-s5', type: 'practice', xp: 30, title: '语言练习', subtitle: 'Unit 7 review' },
      {
        id: 'h1-u7-s6', type: 'grammar', xp: 25,
        title: '语法：能', subtitle: 'Circumstantial ability with 能',
        grammarPoints: [
          {
            pattern: 'Subject + 能 + Verb  (can — circumstances allow)',
            explanation: '能 (néng) = "can" based on circumstances, health, permission, or physical ability. Compare: 会 (huì) = "can" because you learned the skill. 你能来吗？= Are you free to come? 你会说中文吗？= Can you speak Chinese (have you learned it)?',
            examples: [
              { zh: '你能来吗？',       py: 'Nǐ néng lái ma?',         en: 'Can you come? (Are you free?)' },
              { zh: '我现在不能去。',   py: 'Wǒ xiànzài bù néng qù.',  en: "I can't go right now. (circumstances)" },
              { zh: '这里能拍照吗？',   py: 'Zhèlǐ néng pāizhào ma?',  en: 'Can I take photos here? (permission)' },
              { zh: '我感冒了，不能出去。', py: 'Wǒ gǎnmào le, bù néng chūqù.', en: "I have a cold, I can't go out." },
            ],
            fillBlanks: [
              { sentence_zh: '你___来吗？',       sentence_en: 'Can you come? (Are you free?)',     options: ['是', '会', '能', '在'],   correct: 2 },
              { sentence_zh: '这里___拍照吗？',   sentence_en: 'May I take photos here?',           options: ['想', '会', '是', '能'],   correct: 3 },
              { sentence_zh: '我现在不___去。',   sentence_en: "I can't go right now (busy).",       options: ['是', '能', '会', '想'],   correct: 1 },
              { sentence_zh: '你___帮我吗？',     sentence_en: 'Can you help me?',                  options: ['是', '在', '能', '想'],   correct: 2 },
            ],
          },
        ],
      },
    ],
  },

  // ── Unit 8 ──────────────────────────────────────────────────────────────────
  {
    id: 'h1-u8', hsk_level: 1,
    title: 'Unit 8', subtitle: '物品与房间 · Objects & Room',
    emoji: '🏠', color: 'from-teal-500 to-emerald-500',
    culturalNote: 'Measure words are mandatory: 一本书 "one [volume] book", never 一书. There are hundreds, but 个 (gè) is the universal fallback when you are unsure.',
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
          { zh: '电脑', py: 'diànnǎo',  en: 'Computer / Laptop' },
          { zh: '猫',   py: 'māo',      en: 'Cat',                note: '猫 and 狗 (dog) are the two most common pets in Chinese content' },
        ],
      },
      {
        id: 'h1-u8-s2', type: 'vocab', xp: 20,
        title: '动作与位置', subtitle: 'Actions & location words',
        words: [
          { zh: '回',   py: 'huí',      en: 'Return / Go back' },
          { zh: '开',   py: 'kāi',      en: 'Open / Turn on / Drive',  note: '开门 = open a door; 开车 = drive; 开始 = start' },
          { zh: '关',   py: 'guān',     en: 'Close / Turn off',        note: 'Opposite of 开' },
          { zh: '看见', py: 'kànjiàn',  en: 'See / Notice',            note: '看 = look (effort); 看见 = actually see/notice (result)' },
          { zh: '住',   py: 'zhù',      en: 'Live (at) / Stay' },
          { zh: '这里', py: 'zhèlǐ',   en: 'Here',                    note: 'Also: 这儿 (zhèr) in Beijing speech — same meaning' },
          { zh: '那里', py: 'nàlǐ',    en: 'There',                   note: 'Also: 那儿 (nàr) in Beijing speech — same meaning' },
          { zh: '外面', py: 'wàimiàn', en: 'Outside',                 note: 'Opposite: 里面 (lǐmiàn) = inside; 外面 more common than 外' },
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
              { zh: '我有两本书。',     py: 'Wǒ yǒu liǎng běn shū.',     en: 'I have two books.' },
              { zh: '请给我一杯水。',   py: 'Qǐng gěi wǒ yī bēi shuǐ.',  en: 'Please give me a cup of water.' },
              { zh: '她买了三件衣服。', py: 'Tā mǎi le sān jiàn yīfu.',   en: 'She bought three pieces of clothing.' },
              { zh: '那里有一个人。',   py: 'Nàlǐ yǒu yī gè rén.',       en: 'There is a person there.' },
            ],
            fillBlanks: [
              { sentence_zh: '我有两___书。',     sentence_en: 'I have two ___ books.',       options: ['杯', '个', '本', '件'], correct: 2 },
              { sentence_zh: '请给我一___水。',   sentence_en: 'Give me a ___ of water.',      options: ['本', '件', '个', '杯'], correct: 3 },
              { sentence_zh: '她买了三___衣服。', sentence_en: 'She bought three ___ clothes.', options: ['杯', '本', '件', '个'], correct: 2 },
              { sentence_zh: '那里有一___人。',   sentence_en: 'There is one ___ person.',      options: ['件', '本', '杯', '个'], correct: 3 },
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
              { sentence_zh: '桌子上___一本书。', sentence_en: 'There ___ a book on the table.',    options: ['在', '有', '是', '住'],  correct: 1 },
              { sentence_zh: '房间里___椅子吗？', sentence_en: 'Are there chairs in the room?',     options: ['没', '是', '有', '在'],  correct: 2 },
              { sentence_zh: '那里___有人。',     sentence_en: 'There is no one there.',             options: ['没', '不', '也', '都'],  correct: 0 },
              { sentence_zh: '包里___什么东西？', sentence_en: 'What is inside the bag?',            options: ['在', '是', '有', '去'],  correct: 2 },
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
    culturalNote: 'Weather is the classic small-talk opener in China too — and everyday speech loves the dramatic 太…了 pattern: 太热了! "SO hot!", 太好了! "Awesome!".',
    sessions: [
      {
        id: 'h1-u9-s1', type: 'vocab', xp: 20,
        title: '天气词', subtitle: 'Weather vocabulary',
        words: [
          { zh: '天气',   py: 'tiānqì',   en: 'Weather' },
          { zh: '下雨',   py: 'xià yǔ',  en: 'To rain / It is raining', note: 'Lit. "fall rain"; 下雪 (xià xuě) = snow; 刮风 (guā fēng) = wind' },
          { zh: '热',     py: 'rè',       en: 'Hot',                     note: 'Opposite: 冷 (lěng) = cold' },
          { zh: '冷',     py: 'lěng',     en: 'Cold' },
          { zh: '晴',     py: 'qíng',     en: 'Sunny / Clear (sky)' },
          { zh: '阴',     py: 'yīn',      en: 'Overcast / Cloudy' },
          { zh: '刮风',   py: 'guā fēng', en: 'Windy',                   note: 'Lit. "scrape wind"' },
          { zh: '暖和',   py: 'nuǎnhuo',  en: 'Warm',                    note: 'Between hot and cold — a pleasant temperature' },
        ],
      },
      {
        id: 'h1-u9-s2', type: 'vocab', xp: 20,
        title: '时段词', subtitle: 'Times of day & duration',
        words: [
          { zh: '上午',   py: 'shàngwǔ',  en: 'Morning (AM)',         note: '上午 = before noon; 早上 (zǎoshàng) = early morning' },
          { zh: '中午',   py: 'zhōngwǔ',  en: 'Noon / Midday' },
          { zh: '下午',   py: 'xiàwǔ',    en: 'Afternoon (PM)' },
          { zh: '晚上',   py: 'wǎnshàng', en: 'Evening / Night',      note: '晚上好 = good evening' },
          { zh: '分钟',   py: 'fēnzhōng', en: 'Minute',               note: '两分钟 = 2 minutes; 半小时 = half an hour' },
          { zh: '小时',   py: 'xiǎoshí',  en: 'Hour',                 note: '一小时 = 1 hour; 小时 = duration; 点 = point in time (3 o\'clock)' },
          { zh: '一点儿', py: 'yīdiǎnr',  en: 'A little / A bit',     note: 'Softens requests: 等一点儿 = wait a bit' },
          { zh: '一些',   py: 'yīxiē',    en: 'Some / A few',         note: '一些水 = some water; more quantity than 一点儿' },
        ],
      },
      {
        id: 'h1-u9-s3', type: 'grammar', xp: 25,
        title: '语法：怎么样', subtitle: 'Asking how something is',
        grammarPoints: [
          {
            pattern: 'Subject + 怎么样？  (How is/are...?)',
            explanation: '怎么样 (zěnme yàng) asks for an evaluation: "How is it? What do you think? How are you?" Answer with 很/不/太 + adjective, or a full sentence.',
            examples: [
              { zh: '天气怎么样？',   py: 'Tiānqì zěnme yàng?',     en: 'How is the weather?' },
              { zh: '今天天气很好。', py: 'Jīntiān tiānqì hěn hǎo.', en: 'The weather today is great.' },
              { zh: '你感觉怎么样？', py: 'Nǐ gǎnjué zěnme yàng?',  en: 'How are you feeling?' },
              { zh: '这本书怎么样？', py: 'Zhè běn shū zěnme yàng?', en: 'How is this book?' },
            ],
            fillBlanks: [
              { sentence_zh: '今天天气___？',   sentence_en: 'How is the weather today?',  options: ['怎么', '什么', '怎么样', '哪'],   correct: 2 },
              { sentence_zh: '天气___好。',     sentence_en: 'The weather is ___ good.',   options: ['很', '太', '也', '都'],           correct: 0 },
              { sentence_zh: '你感觉___？',     sentence_en: 'How are you ___?',           options: ['什么', '哪', '怎么样', '也'],     correct: 2 },
              { sentence_zh: '这本书___？',     sentence_en: 'How is this book?',          options: ['也', '都', '什么', '怎么样'],     correct: 3 },
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
            explanation: '太 (tài) + Adj + 了 = "too [adj]" or shows strong emotion (= "so [adj]!"). The 了 at the end is required — without it, the sentence sounds incomplete.',
            examples: [
              { zh: '太热了！',       py: 'Tài rè le!',           en: "It's too hot! / So hot!" },
              { zh: '太贵了！',       py: 'Tài guì le!',          en: "Too expensive!" },
              { zh: '太好了！',       py: 'Tài hǎo le!',          en: "Excellent! / That's great!" },
              { zh: '今天太冷了。',   py: 'Jīntiān tài lěng le.', en: "It's too cold today." },
            ],
            fillBlanks: [
              { sentence_zh: '今天___热了！', sentence_en: 'It is ___ hot today!',      options: ['很', '太', '都', '也'],  correct: 1 },
              { sentence_zh: '太好___！',     sentence_en: "That's ___!",                options: ['吗', '的', '了', '呢'],  correct: 2 },
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
    culturalNote: '会 means a LEARNED skill (我会游泳 — I can swim, I learned it) while 能 is circumstance (我能来 — I can come, nothing stops me). English "can" hides this difference.',
    sessions: [
      {
        id: 'h1-u10-s1', type: 'vocab', xp: 20,
        title: '爱好', subtitle: 'Hobbies & entertainment',
        words: [
          { zh: '喜欢', py: 'xǐhuān',   en: 'Like / Enjoy' },
          { zh: '爱',   py: 'ài',       en: 'Love',                   note: 'Stronger than 喜欢; also "love" for family/country' },
          { zh: '电视', py: 'diànshì',  en: 'Television / TV' },
          { zh: '电影', py: 'diànyǐng', en: 'Movie / Film' },
          { zh: '音乐', py: 'yīnyuè',   en: 'Music' },
          { zh: '读',   py: 'dú',       en: 'Read (aloud) / Study',   note: '读书 = study / read a book; emphasizes reading aloud' },
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
          { zh: '高兴', py: 'gāoxìng',  en: 'Happy / Glad',           note: 'Used for a specific happy moment; 开心 is more general joy' },
          { zh: '会',   py: 'huì',      en: 'Can / Know how to',      note: 'Learned skill: 会说汉语 = can speak Chinese (have learned it)' },
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
            explanation: '喜欢 (xǐhuān) = "like." 爱 (ài) = "love" (stronger). Both can be followed by a noun (thing you like) or a verb (activity you enjoy). No extra words needed between.',
            examples: [
              { zh: '我喜欢看电影。',   py: 'Wǒ xǐhuān kàn diànyǐng.', en: 'I like watching movies.' },
              { zh: '她爱唱歌。',       py: 'Tā ài chàng gē.',          en: 'She loves singing.' },
              { zh: '你喜欢什么音乐？', py: 'Nǐ xǐhuān shénme yīnyuè?', en: 'What music do you like?' },
              { zh: '他不喜欢狗。',     py: 'Tā bù xǐhuān gǒu.',       en: "He doesn't like dogs." },
            ],
            fillBlanks: [
              { sentence_zh: '我___看电影。',     sentence_en: 'I ___ watching movies.',       options: ['想', '喜欢', '去', '来'],   correct: 1 },
              { sentence_zh: '她非常___唱歌。',   sentence_en: 'She really ___ singing.',      options: ['会', '在', '爱', '是'],     correct: 2 },
              { sentence_zh: '你___什么音乐？',   sentence_en: 'What music do you ___?',       options: ['是', '在', '想', '喜欢'],   correct: 3 },
              { sentence_zh: '妈妈非常___孩子。', sentence_en: 'Mom really ___ her children.',  options: ['喜欢', '爱', '想', '在'],   correct: 1 },
            ],
          },
        ],
      },
      {
        id: 'h1-u10-s4', type: 'grammar', xp: 25,
        title: '语法：会', subtitle: 'Learned ability with 会',
        grammarPoints: [
          {
            pattern: 'Subject + 会 + Verb  (can / know how to — learned skill)',
            explanation: '会 (huì) = learned ability. Use it for skills you\'ve acquired through practice. Compare with 能 (Unit 7): 能 = circumstances allow; 会 = you have the skill. 不会 = cannot / don\'t know how.',
            examples: [
              { zh: '你会说汉语吗？',   py: 'Nǐ huì shuō Hànyǔ ma?',  en: 'Can you speak Chinese? (have you learned it?)' },
              { zh: '我会一点儿。',     py: 'Wǒ huì yīdiǎnr.',         en: 'I can (speak) a little.' },
              { zh: '他不会游泳。',     py: 'Tā bú huì yóuyǒng.',      en: "He can't swim. (never learned)" },
              { zh: '你会不会做饭？',   py: 'Nǐ huì bu huì zuòfàn?',   en: 'Can you cook or not?' },
            ],
            fillBlanks: [
              { sentence_zh: '你___说汉语吗？', sentence_en: 'Can you ___ Chinese?',           options: ['想', '会', '喜欢', '去'],   correct: 1 },
              { sentence_zh: '他不___游泳。',   sentence_en: "He ___ can't swim.",               options: ['想', '喜欢', '在', '会'],   correct: 3 },
              { sentence_zh: '你___做饭吗？',   sentence_en: 'Can you ___ cook?',                options: ['是', '在', '会', '去'],     correct: 2 },
              { sentence_zh: '我___一点儿汉语。', sentence_en: 'I can speak a little Chinese.',  options: ['会', '不', '也', '想'],     correct: 0 },
            ],
          },
        ],
      },
      { id: 'h1-u10-s5', type: 'practice', xp: 35, title: 'HSK 1 大回顾', subtitle: 'HSK 1 grand review' },
    ],
  },
]
