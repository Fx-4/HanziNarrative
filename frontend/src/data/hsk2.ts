import type { UnitDef } from './curriculum'

// ─────────────────────────────────────────────────────────────────────────────
// HSK 2  (150 new words, 6 units × 4–5 sessions = 30 sessions)
// ─────────────────────────────────────────────────────────────────────────────

export const HSK2: UnitDef[] = [
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
              { zh: '今天很热。',       py: 'Jīntiān hěn rè.',           en: "It's very hot today." },
              { zh: '这本书非常好。',   py: 'Zhè běn shū fēicháng hǎo.', en: 'This book is extremely good.' },
              { zh: '我很高兴。',       py: 'Wǒ hěn gāoxìng.',           en: "I'm very happy." },
            ],
            fillBlanks: [
              { sentence_zh: '今天___热。',   sentence_en: "It's ___ hot today.",    options: ['是', '很', '没', '不'],    correct: 1 },
              { sentence_zh: '这本书___好。', sentence_en: 'This book is ___ good.', options: ['没', '不', '非常', '在'],  correct: 2 },
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
              { zh: '我吃了。',      py: 'Wǒ chī le.',        en: "I've eaten. / I ate." },
              { zh: '他来了。',      py: 'Tā lái le.',         en: 'He came. / He has arrived.' },
              { zh: '我们买了书。',  py: 'Wǒmen mǎi le shū.',  en: 'We bought (a) book(s).' },
            ],
            fillBlanks: [
              { sentence_zh: '我吃___。', sentence_en: "I've eaten ___.", options: ['了', '在', '的', '不'], correct: 0 },
              { sentence_zh: '他来___。', sentence_en: 'He has arrived ___.', options: ['在', '了', '不', '没'], correct: 1 },
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
          { zh: '头',   py: 'tóu',     en: 'Head' },
          { zh: '脸',   py: 'liǎn',    en: 'Face' },
          { zh: '手',   py: 'shǒu',    en: 'Hand' },
          { zh: '脚',   py: 'jiǎo',    en: 'Foot / Feet' },
          { zh: '眼睛', py: 'yǎnjīng', en: 'Eyes',                    note: 'Singular and plural are the same form in Chinese' },
          { zh: '耳朵', py: 'ěrduǒ',   en: 'Ears' },
          { zh: '嘴',   py: 'zuǐ',     en: 'Mouth' },
          { zh: '鼻子', py: 'bízi',    en: 'Nose' },
          { zh: '身体', py: 'shēntǐ',  en: 'Body / Health',           note: '身体好 = to be in good health' },
        ],
      },
      {
        id: 'h2-u3-s2', type: 'vocab', xp: 25,
        title: '健康词汇', subtitle: 'Health & illness vocabulary',
        words: [
          { zh: '生病', py: 'shēng bìng', en: 'Get sick / Fall ill' },
          { zh: '感冒', py: 'gǎnmào',     en: 'Cold / Flu',           note: '发烧 = fever, 感冒 = common cold/flu' },
          { zh: '头疼', py: 'tóuténg',    en: 'Headache',             note: 'Also: 头痛 (tóutòng) — same meaning' },
          { zh: '发烧', py: 'fā shāo',    en: 'Have a fever' },
          { zh: '药',   py: 'yào',        en: 'Medicine / Drug' },
          { zh: '检查', py: 'jiǎnchá',    en: 'Examine / Check up' },
          { zh: '健康', py: 'jiànkāng',   en: 'Health / Healthy' },
          { zh: '舒服', py: 'shūfu',      en: 'Comfortable / Well',   note: '不舒服 (bú shūfu) = unwell / uncomfortable' },
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
              { zh: '我觉得很累。',       py: 'Wǒ juéde hěn lèi.',              en: 'I feel very tired.' },
              { zh: '她觉得这本书很好。', py: 'Tā juéde zhè běn shū hěn hǎo.',  en: 'She thinks this book is great.' },
              { zh: '你觉得怎么样？',     py: 'Nǐ juéde zěnme yàng?',           en: 'How do you feel?' },
              { zh: '我觉得身体不舒服。', py: 'Wǒ juéde shēntǐ bú shūfu.',      en: 'I feel unwell.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___很累。',       sentence_en: 'I ___ very tired.',           options: ['感觉', '觉得', '有', '是'],  correct: 1 },
              { sentence_zh: '她___这本书很好。', sentence_en: 'She ___ this book is great.',  options: ['是', '会', '觉得', '在'],    correct: 2 },
              { sentence_zh: '你___怎么样？',     sentence_en: 'How do you ___?',             options: ['在', '觉得', '想', '是'],    correct: 1 },
              { sentence_zh: '我___身体不舒服。', sentence_en: 'I ___ unwell.',               options: ['想', '是', '在', '觉得'],    correct: 3 },
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
              { zh: '你应该多休息。',     py: 'Nǐ yīnggāi duō xiūxi.',           en: 'You should rest more.' },
              { zh: '你不应该熬夜。',     py: 'Nǐ bù yīnggāi áoyè.',             en: "You shouldn't stay up late." },
              { zh: '他应该去医院检查。', py: 'Tā yīnggāi qù yīyuàn jiǎnchá.',   en: 'He should go to the hospital for a check-up.' },
              { zh: '我们应该多运动。',   py: 'Wǒmen yīnggāi duō yùndòng.',      en: 'We should exercise more.' },
            ],
            fillBlanks: [
              { sentence_zh: '你___多休息。',   sentence_en: 'You ___ rest more.',          options: ['会', '想', '应该', '觉得'],  correct: 2 },
              { sentence_zh: '他___去医院。',   sentence_en: 'He ___ go to the hospital.',  options: ['不', '应该', '会', '想'],    correct: 1 },
              { sentence_zh: '你不___熬夜。',   sentence_en: 'You ___ stay up late.',        options: ['会', '应该', '想', '觉得'],  correct: 1 },
              { sentence_zh: '我们___多运动。', sentence_en: 'We ___ exercise more.',        options: ['想', '在', '应该', '会'],    correct: 2 },
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
          { zh: '开心',  py: 'kāixīn',    en: 'Happy / Cheerful',       note: '开心 = ongoing happiness; 高兴 = happy about something specific' },
          { zh: '满意',  py: 'mǎnyì',     en: 'Satisfied / Content' },
          { zh: '希望',  py: 'xīwàng',    en: 'Hope / Wish',            note: 'Also a verb: 我希望你来 = I hope you come' },
          { zh: '感谢',  py: 'gǎnxiè',    en: 'Grateful / Thank',       note: 'More formal than 谢谢' },
          { zh: '兴趣',  py: 'xìngqù',    en: 'Interest',               note: '对…有兴趣 = be interested in...' },
          { zh: '愿意',  py: 'yuànyì',    en: 'Willing / Be willing to' },
          { zh: '同意',  py: 'tóngyì',    en: 'Agree / Consent' },
          { zh: '相信',  py: 'xiāngxìn',  en: 'Believe / Trust' },
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
            explanation: '因为 (yīnwèi) = "because." 所以 (suǒyǐ) = "therefore / so." They often appear together as a pair, but one can be omitted.',
            examples: [
              { zh: '因为下雨，所以我们不去了。',   py: 'Yīnwèi xià yǔ, suǒyǐ wǒmen bù qù le.',          en: "Because it's raining, we're not going." },
              { zh: '因为他生病，所以没来上班。',   py: 'Yīnwèi tā shēng bìng, suǒyǐ méi lái shàngbān.', en: "Because he is sick, he didn't come to work." },
              { zh: '我很担心，因为她一个人在家。', py: 'Wǒ hěn dānxīn, yīnwèi tā yī gè rén zài jiā.',   en: "I'm worried because she's home alone." },
            ],
            fillBlanks: [
              { sentence_zh: '___下雨，所以我不去了。',  sentence_en: '___ it rains, so I\'m not going.',         options: ['因为', '所以', '虽然', '如果'],  correct: 0 },
              { sentence_zh: '因为他生病，___没来。',    sentence_en: 'Because he\'s sick, ___ he didn\'t come.',  options: ['因为', '所以', '也', '都'],      correct: 1 },
              { sentence_zh: '___天气好，我们出去了。',  sentence_en: '___ the weather was nice, we went out.',    options: ['所以', '因为', '也', '都'],      correct: 1 },
              { sentence_zh: '因为很累，___早点睡了。',  sentence_en: 'Because tired, ___ went to bed early.',     options: ['所以', '也', '都', '很'],        correct: 0 },
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
              { zh: '如果你有问题，就来找我。',     py: 'Rúguǒ nǐ yǒu wèntí, jiù lái zhǎo wǒ.',      en: 'If you have questions, come find me.' },
              { zh: '如果明天下雨，我们就不去了。', py: 'Rúguǒ míngtiān xià yǔ, wǒmen jiù bù qù le.', en: "If it rains tomorrow, we won't go." },
              { zh: '如果你累了，就先休息吧。',     py: 'Rúguǒ nǐ lèi le, jiù xiān xiūxi ba.',        en: "If you're tired, rest first." },
            ],
            fillBlanks: [
              { sentence_zh: '___你有问题，就来找我。',    sentence_en: '___ you have questions, come find me.',   options: ['如果', '因为', '所以', '虽然'],  correct: 0 },
              { sentence_zh: '如果天气好，我们___去。',    sentence_en: 'If the weather is good, we ___ go.',      options: ['也', '都', '就', '很'],          correct: 2 },
              { sentence_zh: '___他来了，我就很高兴。',   sentence_en: '___ he comes, I\'ll be happy.',            options: ['所以', '如果', '因为', '虽然'],   correct: 1 },
              { sentence_zh: '如果你不喜欢，___不要买。', sentence_en: 'If you don\'t like it, ___ don\'t buy.',   options: ['也', '就', '都', '很'],          correct: 1 },
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
          { zh: '公司',  py: 'gōngsī',    en: 'Company / Firm' },
          { zh: '同事',  py: 'tóngshì',   en: 'Colleague / Coworker' },
          { zh: '经理',  py: 'jīnglǐ',    en: 'Manager / Director' },
          { zh: '会议',  py: 'huìyì',     en: 'Meeting / Conference' },
          { zh: '文件',  py: 'wénjiàn',   en: 'Document / File',        note: '发文件 = send a file; 文件夹 = folder' },
          { zh: '认真',  py: 'rènzhēn',   en: 'Serious / Conscientious / Diligent' },
          { zh: '努力',  py: 'nǔlì',      en: 'Work hard / Make an effort' },
          { zh: '成功',  py: 'chénggōng', en: 'Succeed / Success' },
        ],
      },
      {
        id: 'h2-u5-s2', type: 'vocab', xp: 25,
        title: '学习词汇', subtitle: 'Study & school vocabulary',
        words: [
          { zh: '大学', py: 'dàxué',    en: 'University / College' },
          { zh: '教室', py: 'jiàoshì',  en: 'Classroom' },
          { zh: '作业', py: 'zuòyè',    en: 'Homework / Assignment' },
          { zh: '考试', py: 'kǎoshì',   en: 'Exam / Test',              note: '参加考试 = take an exam; 通过考试 = pass an exam' },
          { zh: '复习', py: 'fùxí',     en: 'Review / Revise',          note: 'Going over material you\'ve already learned' },
          { zh: '练习', py: 'liànxí',   en: 'Practice / Exercise',      note: 'Practicing a skill actively' },
          { zh: '成绩', py: 'chéngjì',  en: 'Grades / Score / Results' },
          { zh: '进步', py: 'jìnbù',    en: 'Progress / Improve' },
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
              { zh: '今天比昨天热。',   py: 'Jīntiān bǐ zuótiān rè.',     en: 'Today is hotter than yesterday.' },
              { zh: '汉语比英语难吗？', py: 'Hànyǔ bǐ Yīngyǔ nán ma?',   en: 'Is Chinese harder than English?' },
              { zh: '她比我高一点儿。', py: 'Tā bǐ wǒ gāo yīdiǎnr.',     en: 'She is a little taller than me.' },
              { zh: '他没有我跑得快。', py: 'Tā méiyǒu wǒ pǎo de kuài.', en: 'He doesn\'t run as fast as me.' },
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
              { zh: '我的汉语越来越好了。', py: 'Wǒ de Hànyǔ yuè lái yuè hǎo le.',  en: 'My Chinese is getting better and better.' },
              { zh: '天气越来越冷了。',     py: 'Tiānqì yuè lái yuè lěng le.',        en: 'The weather is getting colder and colder.' },
              { zh: '他越来越努力了。',     py: 'Tā yuè lái yuè nǔlì le.',            en: 'He is working harder and harder.' },
              { zh: '我越来越喜欢中国了。', py: 'Wǒ yuè lái yuè xǐhuān Zhōngguó le.', en: 'I like China more and more.' },
            ],
            fillBlanks: [
              { sentence_zh: '我的汉语___好了。',   sentence_en: 'My Chinese is getting ___ good.',   options: ['更', '越来越', '很', '非常'],  correct: 1 },
              { sentence_zh: '天气___冷了。',       sentence_en: 'The weather is getting ___ cold.',  options: ['很', '也', '越来越', '非常'],  correct: 2 },
              { sentence_zh: '他___努力了。',       sentence_en: 'He is working ___ hard.',           options: ['越来越', '也', '很', '都'],    correct: 0 },
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
          { zh: '火车',   py: 'huǒchē',      en: 'Train' },
          { zh: '高铁',   py: 'gāotiě',      en: 'High-speed rail (HSR)',   note: 'China\'s bullet train network; hugely popular' },
          { zh: '飞机',   py: 'fēijī',       en: 'Airplane' },
          { zh: '地铁',   py: 'dìtiě',       en: 'Subway / Metro' },
          { zh: '出租车', py: 'chūzūchē',    en: 'Taxi / Cab' },
          { zh: '公交车', py: 'gōngjiāochē', en: 'Public bus' },
          { zh: '坐',     py: 'zuò',         en: 'Sit / Take (transport)',   note: '坐地铁 = take the subway; 坐飞机 = fly' },
          { zh: '骑',     py: 'qí',          en: 'Ride (bike, motorcycle)' },
        ],
      },
      {
        id: 'h2-u6-s2', type: 'vocab', xp: 25,
        title: '旅行准备', subtitle: 'Travel preparation vocabulary',
        words: [
          { zh: '旅游', py: 'lǚyóu',   en: 'Travel / Tourism' },
          { zh: '行李', py: 'xínglǐ',  en: 'Luggage / Baggage' },
          { zh: '酒店', py: 'jiǔdiàn', en: 'Hotel',               note: '酒店 is the most common; also 宾馆 (bīnguǎn) = guesthouse' },
          { zh: '订',   py: 'dìng',    en: 'Book / Reserve',      note: '订票 = book a ticket; 订房间 = reserve a room' },
          { zh: '出发', py: 'chūfā',   en: 'Set off / Depart' },
          { zh: '到达', py: 'dàodá',   en: 'Arrive',              note: '到 (dào) alone also means arrive; 到达 is more formal' },
          { zh: '回来', py: 'huí lái', en: 'Come back / Return' },
          { zh: '护照', py: 'hùzhào',  en: 'Passport' },
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
              { zh: '先买票，再上车。',       py: 'Xiān mǎi piào, zài shàng chē.',       en: 'Buy the ticket first, then board.' },
              { zh: '先吃饭，然后去图书馆。', py: 'Xiān chī fàn, rán hòu qù túshūguǎn.', en: 'First eat, then go to the library.' },
              { zh: '你先去，我再来。',       py: 'Nǐ xiān qù, wǒ zài lái.',             en: 'You go first, I\'ll come later.' },
            ],
            fillBlanks: [
              { sentence_zh: '___买票，再上车。',     sentence_en: '___ buy the ticket, then board.',          options: ['先', '后', '然后', '就'],      correct: 0 },
              { sentence_zh: '先吃饭，___去。',       sentence_en: 'First eat, ___ go.',                       options: ['先', '然后', '因为', '如果'],  correct: 1 },
              { sentence_zh: '你___坐下，我来。',     sentence_en: 'You sit down ___, then I\'ll come.',       options: ['先', '再', '后', '就'],        correct: 0 },
              { sentence_zh: '先订酒店，___买机票。', sentence_en: 'First book the hotel, ___ buy the flight.', options: ['然后', '先', '因为', '所以'],  correct: 0 },
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
              { zh: '一下班就回家。',     py: 'Yī xià bān jiù huí jiā.',      en: 'As soon as I get off work, I go home.' },
              { zh: '我一到家就吃饭。',   py: 'Wǒ yī dào jiā jiù chī fàn.',   en: 'As soon as I get home, I eat.' },
              { zh: '他一看到我就笑了。', py: 'Tā yī kàndào wǒ jiù xiào le.', en: 'As soon as he saw me, he smiled.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___下班就回家。',       sentence_en: 'As ___ as I get off work, I go home.',        options: ['一', '已经', '先', '然后'],  correct: 0 },
              { sentence_zh: '一到家___吃饭。',         sentence_en: 'As soon as (I) get home, ___ eat.',           options: ['就', '先', '再', '然后'],    correct: 0 },
              { sentence_zh: '她___到机场就打电话。',   sentence_en: 'As ___ as she reaches the airport, she calls.', options: ['先', '一', '然后', '再'],  correct: 1 },
              { sentence_zh: '我一看到他___认识他了。', sentence_en: 'As soon as I saw him, I recognized him.',      options: ['才', '就', '先', '再'],      correct: 1 },
            ],
          },
        ],
      },
      { id: 'h2-u6-s5', type: 'practice', xp: 40, title: 'HSK 2 大回顾', subtitle: 'HSK 2 grand review' },
    ],
  },
]
