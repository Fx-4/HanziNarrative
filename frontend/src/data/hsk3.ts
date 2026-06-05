import type { UnitDef } from './curriculum'

// ─────────────────────────────────────────────────────────────────────────────
// HSK 3  (343 words, 8 units × 4–6 sessions = 37 sessions)
// Based on official HSK 3 word list from vault (HSK/Levels/HSK 3.md)
// ─────────────────────────────────────────────────────────────────────────────

export const HSK3: UnitDef[] = [

  // ── Unit 1: 形容词·性格 ─────────────────────────────────────────────────────
  {
    id: 'h3-u1', hsk_level: 3,
    title: 'Unit 1', subtitle: '形容词·性格 · Character & Personality',
    emoji: '🌟', color: 'from-fuchsia-500 to-pink-500',
    sessions: [
      {
        id: 'h3-u1-s1', type: 'vocab', xp: 30,
        title: '积极性格', subtitle: 'Positive character traits',
        words: [
          { zh: '聪明',  py: 'cōngmíng',  en: 'Clever / Intelligent' },
          { zh: '优秀',  py: 'yōuxiù',    en: 'Outstanding / Excellent' },
          { zh: '认真',  py: 'rènzhēn',   en: 'Diligent / Conscientious',   note: '认真学习 = study seriously' },
          { zh: '积极',  py: 'jījí',      en: 'Positive / Active / Enthusiastic' },
          { zh: '诚实',  py: 'chéngshí',  en: 'Honest / Sincere' },
          { zh: '勤快',  py: 'qínkuai',   en: 'Diligent / Hardworking' },
          { zh: '温柔',  py: 'wēnróu',    en: 'Gentle / Tender' },
          { zh: '谦虚',  py: 'qiānxū',    en: 'Modest / Humble' },
          { zh: '幽默',  py: 'yōumò',     en: 'Humorous' },
        ],
      },
      {
        id: 'h3-u1-s2', type: 'vocab', xp: 30,
        title: '情感状态', subtitle: 'Emotional states & feelings',
        words: [
          { zh: '紧张',  py: 'jǐnzhāng',  en: 'Nervous / Tense',           note: '考试前很紧张 = nervous before an exam' },
          { zh: '激动',  py: 'jīdòng',    en: 'Excited / Emotional' },
          { zh: '幸福',  py: 'xìngfú',    en: 'Happy / Blessed' },
          { zh: '骄傲',  py: 'jiāo\'ào',  en: 'Proud (can be positive or negative)' },
          { zh: '孤独',  py: 'gūdú',      en: 'Lonely / Solitary' },
          { zh: '无聊',  py: 'wúliáo',    en: 'Bored / Boring' },
          { zh: '辛苦',  py: 'xīnkǔ',     en: 'Hard / Tiring / Laborious' },
          { zh: '精彩',  py: 'jīngcǎi',   en: 'Brilliant / Wonderful / Splendid' },
        ],
      },
      {
        id: 'h3-u1-s3', type: 'vocab', xp: 30,
        title: '实用形容词', subtitle: 'Practical descriptive adjectives',
        words: [
          { zh: '简单',  py: 'jiǎndān',   en: 'Simple / Easy' },
          { zh: '复杂',  py: 'fùzá',      en: 'Complicated / Complex' },
          { zh: '特别',  py: 'tèbié',     en: 'Special / Especially' },
          { zh: '方便',  py: 'fāngbiàn',  en: 'Convenient' },
          { zh: '合适',  py: 'héshì',     en: 'Suitable / Appropriate' },
          { zh: '重要',  py: 'zhòngyào',  en: 'Important' },
          { zh: '危险',  py: 'wēixiǎn',   en: 'Dangerous' },
          { zh: '安全',  py: 'ānquán',    en: 'Safe / Safety' },
          { zh: '免费',  py: 'miǎnfèi',   en: 'Free of charge' },
        ],
      },
      {
        id: 'h3-u1-s4', type: 'grammar', xp: 35,
        title: '语法：虽然…但是', subtitle: 'Expressing contrast with 虽然…但是',
        grammarPoints: [
          {
            pattern: '虽然 + Situation, 但是 + Contrast',
            explanation: '虽然 (suīrán) = "although / even though." 但是 (dànshì) = "but / however." Together they express a contrast: acknowledging one fact while introducing a different or unexpected result. Both can appear in the same or separate clauses.',
            examples: [
              { zh: '虽然天气很冷，但是他还是去运动了。', py: 'Suīrán tiānqì hěn lěng, dànshì tā hái shì qù yùndòng le.', en: 'Although the weather is cold, he still went to exercise.' },
              { zh: '这道题虽然难，但是我做出来了。',      py: 'Zhè dào tí suīrán nán, dànshì wǒ zuò chūlái le.',          en: 'Although this problem is hard, I solved it.' },
              { zh: '虽然他很聪明，但是不认真学习。',      py: 'Suīrán tā hěn cōngmíng, dànshì bù rènzhēn xuéxí.',         en: "Although he is clever, he doesn't study diligently." },
            ],
            fillBlanks: [
              { sentence_zh: '___天气冷，但是他去跑步了。',    sentence_en: '___ it is cold, he still went running.',         options: ['因为', '虽然', '所以', '如果'],    correct: 1 },
              { sentence_zh: '虽然很贵，___他还是买了。',      sentence_en: 'Although expensive, ___ he still bought it.',    options: ['而且', '但是', '所以', '因为'],    correct: 1 },
              { sentence_zh: '这本书___难，但是很有趣。',      sentence_en: 'This book ___ difficult, but very interesting.', options: ['但是', '虽然', '所以', '如果'],    correct: 1 },
              { sentence_zh: '虽然他努力了，但是___没成功。',  sentence_en: 'Although he tried, ___ he didn\'t succeed.',     options: ['所以', '还是', '因为', '虽然'],    correct: 1 },
            ],
          },
        ],
      },
      { id: 'h3-u1-s5', type: 'practice', xp: 40, title: '性格与情感练习', subtitle: 'Unit 1 review' },
    ],
  },

  // ── Unit 2: 动词·行动 ─────────────────────────────────────────────────────
  {
    id: 'h3-u2', hsk_level: 3,
    title: 'Unit 2', subtitle: '动词·行动 · Action Verbs',
    emoji: '⚡', color: 'from-amber-500 to-orange-500',
    sessions: [
      {
        id: 'h3-u2-s1', type: 'vocab', xp: 30,
        title: '目标与行动', subtitle: 'Goal-oriented verbs',
        words: [
          { zh: '参加',  py: 'cānjiā',    en: 'Participate / Join' },
          { zh: '决定',  py: 'juédìng',   en: 'Decide / Decision' },
          { zh: '完成',  py: 'wánchéng',  en: 'Complete / Finish' },
          { zh: '继续',  py: 'jìxù',      en: 'Continue' },
          { zh: '坚持',  py: 'jiānchí',   en: 'Persist / Keep on' },
          { zh: '准备',  py: 'zhǔnbèi',   en: 'Prepare' },
          { zh: '解决',  py: 'jiějué',    en: 'Solve / Resolve' },
          { zh: '放弃',  py: 'fàngqì',    en: 'Give up / Abandon' },
        ],
      },
      {
        id: 'h3-u2-s2', type: 'vocab', xp: 30,
        title: '交流与沟通', subtitle: 'Communication verbs',
        words: [
          { zh: '介绍',  py: 'jièshào',   en: 'Introduce / Introduction' },
          { zh: '翻译',  py: 'fānyì',     en: 'Translate / Translator' },
          { zh: '联系',  py: 'liánxì',    en: 'Contact / Get in touch' },
          { zh: '通知',  py: 'tōngzhī',   en: 'Notify / Notice' },
          { zh: '讨论',  py: 'tǎolùn',    en: 'Discuss / Discussion' },
          { zh: '感谢',  py: 'gǎnxiè',    en: 'Thank / Be grateful',        note: 'More formal than 谢谢' },
          { zh: '道歉',  py: 'dàoqiàn',   en: 'Apologize' },
          { zh: '鼓励',  py: 'gǔlì',      en: 'Encourage' },
        ],
      },
      {
        id: 'h3-u2-s3', type: 'grammar', xp: 35,
        title: '语法：不但…而且', subtitle: 'Not only...but also with 不但…而且',
        grammarPoints: [
          {
            pattern: '不但 + A, 而且 + B  (Not only A, but also B)',
            explanation: '不但 (búdàn) = "not only." 而且 (érqiě) = "but also / moreover." Together they strengthen a point by adding more evidence or qualities. Both clauses usually share the same subject.',
            examples: [
              { zh: '他不但聪明，而且很勤奋。',         py: 'Tā búdàn cōngmíng, érqiě hěn qínfèn.',          en: 'He is not only clever, but also very hardworking.' },
              { zh: '这本书不但便宜，而且内容很好。',   py: 'Zhè běn shū búdàn piányí, érqiě nèiróng hěn hǎo.', en: "This book is not only cheap, but also has great content." },
              { zh: '她不但会说英语，而且会说法语。',   py: 'Tā búdàn huì shuō Yīngyǔ, érqiě huì shuō Fǎyǔ.',  en: 'She can speak not only English but also French.' },
            ],
            fillBlanks: [
              { sentence_zh: '他___聪明，而且努力。',       sentence_en: 'He is ___ clever, but also hardworking.',     options: ['虽然', '不但', '因为', '如果'],  correct: 1 },
              { sentence_zh: '不但便宜，___质量好。',       sentence_en: 'Not only cheap, ___ good quality.',           options: ['而且', '但是', '所以', '因为'],  correct: 0 },
              { sentence_zh: '她___努力，而且很认真。',     sentence_en: 'She is ___ hardworking, but also diligent.',  options: ['不但', '虽然', '如果', '因为'],  correct: 0 },
              { sentence_zh: '这道菜不但好吃，___做起来容易。', sentence_en: 'This dish is not only delicious, ___ easy to cook.', options: ['但是', '而且', '虽然', '所以'], correct: 1 },
            ],
          },
        ],
      },
      {
        id: 'h3-u2-s4', type: 'vocab', xp: 30,
        title: '变化与发展', subtitle: 'Change & development verbs',
        words: [
          { zh: '发现',  py: 'fāxiàn',    en: 'Discover / Find out' },
          { zh: '发展',  py: 'fāzhǎn',    en: 'Develop / Development' },
          { zh: '改变',  py: 'gǎibiàn',   en: 'Change / Transform' },
          { zh: '提高',  py: 'tígāo',     en: 'Improve / Raise' },
          { zh: '增加',  py: 'zēngjiā',   en: 'Increase / Add' },
          { zh: '减少',  py: 'jiǎnshǎo',  en: 'Reduce / Decrease' },
          { zh: '影响',  py: 'yǐngxiǎng', en: 'Influence / Effect' },
          { zh: '保护',  py: 'bǎohù',     en: 'Protect' },
        ],
      },
      { id: 'h3-u2-s5', type: 'practice', xp: 40, title: '动词行动练习', subtitle: 'Unit 2 review' },
    ],
  },

  // ── Unit 3: 动词·情感与思维 ──────────────────────────────────────────────────
  {
    id: 'h3-u3', hsk_level: 3,
    title: 'Unit 3', subtitle: '动词·情感与思维 · Feelings & Cognition',
    emoji: '💭', color: 'from-violet-500 to-indigo-500',
    sessions: [
      {
        id: 'h3-u3-s1', type: 'vocab', xp: 30,
        title: '情感动词', subtitle: 'Emotional verbs',
        words: [
          { zh: '担心',  py: 'dānxīn',    en: 'Worry / Be concerned' },
          { zh: '害怕',  py: 'hàipà',     en: 'Afraid / Fear' },
          { zh: '生气',  py: 'shēngqì',   en: 'Get angry' },
          { zh: '失望',  py: 'shīwàng',   en: 'Disappointed / Lose hope' },
          { zh: '后悔',  py: 'hòuhuǐ',    en: 'Regret' },
          { zh: '感动',  py: 'gǎndòng',   en: 'Be moved / Be touched emotionally' },
          { zh: '羡慕',  py: 'xiànmù',    en: 'Envy / Admire' },
          { zh: '讨厌',  py: 'tǎoyàn',    en: 'Dislike / Find annoying' },
        ],
      },
      {
        id: 'h3-u3-s2', type: 'vocab', xp: 30,
        title: '思维与认知', subtitle: 'Thinking & cognition verbs',
        words: [
          { zh: '理解',  py: 'lǐjiě',     en: 'Understand / Comprehend' },
          { zh: '怀疑',  py: 'huáiyí',    en: 'Doubt / Suspect' },
          { zh: '相信',  py: 'xiāngxìn',  en: 'Believe / Trust' },
          { zh: '研究',  py: 'yánjiū',    en: 'Research / Study' },
          { zh: '调查',  py: 'diàochá',   en: 'Investigate / Survey' },
          { zh: '回忆',  py: 'huíyì',     en: 'Recall / Memory' },
          { zh: '猜',    py: 'cāi',       en: 'Guess' },
          { zh: '原谅',  py: 'yuánliàng', en: 'Forgive / Excuse' },
        ],
      },
      {
        id: 'h3-u3-s3', type: 'grammar', xp: 35,
        title: '语法：除了…以外', subtitle: 'Besides / Except with 除了…以外',
        grammarPoints: [
          {
            pattern: '除了 + X + 以外, + (还/都) + ...',
            explanation: '除了 (chúle)…以外 (yǐwài) has two meanings: (1) "besides / in addition to" (use 还/也 in the result): 除了苹果以外，我还喜欢橙子。(2) "except for" (use 都 in the result): 除了他以外，大家都来了。Context determines which meaning applies.',
            examples: [
              { zh: '除了汉语以外，她还会说日语。',   py: 'Chúle Hànyǔ yǐwài, tā hái huì shuō Rìyǔ.',   en: 'Besides Chinese, she can also speak Japanese.' },
              { zh: '除了我以外，大家都去了。',       py: 'Chúle wǒ yǐwài, dàjiā dōu qù le.',            en: "Except for me, everyone went." },
              { zh: '除了跑步以外，他还喜欢游泳。',   py: 'Chúle pǎo bù yǐwài, tā hái xǐhuān yóuyǒng.', en: 'Besides running, he also likes swimming.' },
            ],
            fillBlanks: [
              { sentence_zh: '除了汉语___，她还学英语。', sentence_en: '___Chinese, she also studies English.',       options: ['以外', '以内', '以上', '以下'],  correct: 0 },
              { sentence_zh: '___他以外，大家___去了。',  sentence_en: 'Except for him, everyone went.',             options: ['除了/都', '因为/所以', '虽然/但是', '如果/就'], correct: 0 },
              { sentence_zh: '除了工作以外，他___喜欢看书。', sentence_en: 'Besides working, he ___ likes reading.',  options: ['都', '还', '不', '又'],          correct: 1 },
              { sentence_zh: '除了周末___，我每天学习。', sentence_en: '___ weekends, I study every day.',           options: ['以外', '以内', '以上', '以下'],  correct: 0 },
            ],
          },
        ],
      },
      { id: 'h3-u3-s4', type: 'practice', xp: 40, title: '情感与思维练习', subtitle: 'Unit 3 review' },
    ],
  },

  // ── Unit 4: 自然与环境 ───────────────────────────────────────────────────────
  {
    id: 'h3-u4', hsk_level: 3,
    title: 'Unit 4', subtitle: '自然与环境 · Nature & Environment',
    emoji: '🌿', color: 'from-green-500 to-teal-500',
    sessions: [
      {
        id: 'h3-u4-s1', type: 'vocab', xp: 30,
        title: '季节与天象', subtitle: 'Seasons & celestial bodies',
        words: [
          { zh: '春天',  py: 'chūntiān',  en: 'Spring' },
          { zh: '夏天',  py: 'xiàtiān',   en: 'Summer' },
          { zh: '秋天',  py: 'qiūtiān',   en: 'Autumn / Fall' },
          { zh: '冬天',  py: 'dōngtiān',  en: 'Winter' },
          { zh: '季节',  py: 'jìjié',     en: 'Season' },
          { zh: '太阳',  py: 'tàiyáng',   en: 'Sun' },
          { zh: '月亮',  py: 'yuèliang',  en: 'Moon' },
          { zh: '星星',  py: 'xīngxing',  en: 'Star' },
        ],
      },
      {
        id: 'h3-u4-s2', type: 'vocab', xp: 30,
        title: '环境与自然', subtitle: 'Environment & nature vocabulary',
        words: [
          { zh: '空气',  py: 'kōngqì',    en: 'Air' },
          { zh: '气候',  py: 'qìhòu',     en: 'Climate' },
          { zh: '温度',  py: 'wēndù',     en: 'Temperature' },
          { zh: '森林',  py: 'sēnlín',    en: 'Forest' },
          { zh: '大海',  py: 'dàhǎi',     en: 'Ocean / Sea' },
          { zh: '植物',  py: 'zhíwù',     en: 'Plant' },
          { zh: '动物',  py: 'dòngwù',    en: 'Animal' },
          { zh: '污染',  py: 'wūrǎn',     en: 'Pollution / To pollute' },
          { zh: '风景',  py: 'fēngjǐng',  en: 'Scenery / Landscape' },
        ],
      },
      {
        id: 'h3-u4-s3', type: 'grammar', xp: 35,
        title: '语法：越…越', subtitle: 'The more...the more with 越…越',
        grammarPoints: [
          {
            pattern: '越 + Adj/V + 越 + Adj/V  (The more..., the more...)',
            explanation: '越…越 (yuè…yuè) shows a proportional increase: as one thing grows, another grows too. Both elements follow 越. Can use the same or different verbs/adjectives. The subject stays the same across both halves.',
            examples: [
              { zh: '天气越来越冷了。',       py: 'Tiānqì yuè lái yuè lěng le.',          en: 'The weather is getting colder and colder.' },
              { zh: '他越说越激动。',         py: 'Tā yuè shuō yuè jīdòng.',              en: 'The more he spoke, the more excited he became.' },
              { zh: '我越学越喜欢汉语了。',   py: 'Wǒ yuè xué yuè xǐhuān Hànyǔ le.',     en: 'The more I study, the more I like Chinese.' },
              { zh: '这道菜越吃越好吃。',     py: 'Zhè dào cài yuè chī yuè hào chī.',     en: 'The more you eat this dish, the tastier it gets.' },
            ],
            fillBlanks: [
              { sentence_zh: '天气___冷___冷了。',       sentence_en: 'The weather is getting colder ___ colder.',   options: ['越/越', '很/很', '也/也', '比/比'],  correct: 0 },
              { sentence_zh: '他___说___激动。',         sentence_en: 'The more he speaks, ___ more excited.',       options: ['比/比', '越/越', '又/又', '也/也'],  correct: 1 },
              { sentence_zh: '这本书___看___有趣。',     sentence_en: 'This book is ___ interesting the more you read.', options: ['很/很', '越/越', '比/比', '也/也'], correct: 1 },
              { sentence_zh: '我越学汉语，___喜欢它。',  sentence_en: 'The more I study Chinese, ___ I like it.',    options: ['越', '很', '也', '比'],             correct: 0 },
            ],
          },
        ],
      },
      { id: 'h3-u4-s4', type: 'practice', xp: 40, title: '自然与环境练习', subtitle: 'Unit 4 review' },
    ],
  },

  // ── Unit 5: 地点与出行 ───────────────────────────────────────────────────────
  {
    id: 'h3-u5', hsk_level: 3,
    title: 'Unit 5', subtitle: '地点与出行 · Places & Travel',
    emoji: '🗺️', color: 'from-blue-500 to-cyan-500',
    sessions: [
      {
        id: 'h3-u5-s1', type: 'vocab', xp: 30,
        title: '城市场所', subtitle: 'Urban places',
        words: [
          { zh: '城市',  py: 'chéngshì',  en: 'City' },
          { zh: '超市',  py: 'chāoshì',   en: 'Supermarket' },
          { zh: '公园',  py: 'gōngyuán',  en: 'Park' },
          { zh: '银行',  py: 'yínháng',   en: 'Bank' },
          { zh: '邮局',  py: 'yóujú',     en: 'Post office' },
          { zh: '医院',  py: 'yīyuàn',    en: 'Hospital' },
          { zh: '机场',  py: 'jīchǎng',   en: 'Airport' },
          { zh: '火车站', py: 'huǒchēzhàn', en: 'Train station' },
        ],
      },
      {
        id: 'h3-u5-s2', type: 'vocab', xp: 30,
        title: '旅行词汇', subtitle: 'Travel & navigation vocabulary',
        words: [
          { zh: '旅游',  py: 'lǚyóu',     en: 'Travel / Tourism' },
          { zh: '宾馆',  py: 'bīnguǎn',   en: 'Hotel / Guesthouse' },
          { zh: '环境',  py: 'huánjìng',  en: 'Environment / Surroundings' },
          { zh: '地图',  py: 'dìtú',      en: 'Map' },
          { zh: '交通',  py: 'jiāotōng',  en: 'Traffic / Transportation' },
          { zh: '距离',  py: 'jùlí',      en: 'Distance' },
          { zh: '方向',  py: 'fāngxiàng', en: 'Direction' },
          { zh: '导游',  py: 'dǎoyóu',    en: 'Tour guide' },
          { zh: '参观',  py: 'cānguān',   en: 'Visit (a place) / Tour' },
        ],
      },
      {
        id: 'h3-u5-s3', type: 'grammar', xp: 35,
        title: '语法：为了', subtitle: 'Expressing purpose with 为了',
        grammarPoints: [
          {
            pattern: '为了 + Goal + (Subject) + Verb  (In order to...)',
            explanation: '为了 (wèile) = "in order to / for the sake of." It introduces the purpose or goal of an action. The subject usually comes AFTER 为了 + goal. Contrast with 因为 (because), which explains a reason, not a goal.',
            examples: [
              { zh: '为了学好汉语，他每天练习。',       py: 'Wèile xué hǎo Hànyǔ, tā měi tiān liànxí.',    en: 'In order to learn Chinese well, he practices every day.' },
              { zh: '为了健康，她坚持锻炼。',           py: 'Wèile jiànkāng, tā jiānchí duànliàn.',          en: 'For the sake of health, she keeps exercising.' },
              { zh: '他为了省钱，走路去上班。',         py: 'Tā wèile shěng qián, zǒu lù qù shàngbān.',      en: 'In order to save money, he walks to work.' },
            ],
            fillBlanks: [
              { sentence_zh: '___学好汉语，他每天练习。', sentence_en: '___ learn Chinese well, he practices every day.', options: ['因为', '为了', '虽然', '如果'],  correct: 1 },
              { sentence_zh: '___健康，她坚持运动。',    sentence_en: '___ health, she keeps exercising.',              options: ['为了', '因为', '虽然', '所以'],  correct: 0 },
              { sentence_zh: '他___省钱，走路去上班。',  sentence_en: 'He walks to work ___ save money.',               options: ['因为', '虽然', '为了', '如果'],  correct: 2 },
              { sentence_zh: '她___准备考试，整晚没睡。', sentence_en: 'She didn\'t sleep all night ___ prepare for the exam.', options: ['所以', '因为', '为了', '虽然'], correct: 2 },
            ],
          },
        ],
      },
      { id: 'h3-u5-s4', type: 'practice', xp: 40, title: '地点与出行练习', subtitle: 'Unit 5 review' },
    ],
  },

  // ── Unit 6: 家居与物品 ───────────────────────────────────────────────────────
  {
    id: 'h3-u6', hsk_level: 3,
    title: 'Unit 6', subtitle: '家居与物品 · Home & Objects',
    emoji: '🏠', color: 'from-rose-500 to-orange-500',
    sessions: [
      {
        id: 'h3-u6-s1', type: 'vocab', xp: 30,
        title: '家居设备', subtitle: 'Home appliances & rooms',
        words: [
          { zh: '冰箱',  py: 'bīngxiāng', en: 'Refrigerator' },
          { zh: '洗衣机', py: 'xǐyījī',   en: 'Washing machine' },
          { zh: '空调',  py: 'kōngtiáo',  en: 'Air conditioning' },
          { zh: '电梯',  py: 'diàntī',    en: 'Elevator / Lift' },
          { zh: '客厅',  py: 'kètīng',    en: 'Living room' },
          { zh: '卧室',  py: 'wòshì',     en: 'Bedroom' },
          { zh: '厨房',  py: 'chúfáng',   en: 'Kitchen' },
          { zh: '阳台',  py: 'yángtái',   en: 'Balcony' },
          { zh: '镜子',  py: 'jìngzi',    en: 'Mirror' },
        ],
      },
      {
        id: 'h3-u6-s2', type: 'vocab', xp: 30,
        title: '衣物与物品', subtitle: 'Clothing & everyday objects',
        words: [
          { zh: '衬衫',  py: 'chènshān',  en: 'Shirt / Blouse' },
          { zh: '裤子',  py: 'kùzi',      en: 'Pants / Trousers' },
          { zh: '裙子',  py: 'qúnzi',     en: 'Skirt / Dress' },
          { zh: '帽子',  py: 'màozi',     en: 'Hat / Cap' },
          { zh: '袜子',  py: 'wàzi',      en: 'Socks / Stockings' },
          { zh: '眼镜',  py: 'yǎnjìng',   en: 'Glasses / Eyeglasses' },
          { zh: '钥匙',  py: 'yàoshi',    en: 'Key' },
          { zh: '礼物',  py: 'lǐwù',      en: 'Gift / Present' },
          { zh: '照片',  py: 'zhàopiàn',  en: 'Photo / Picture' },
        ],
      },
      {
        id: 'h3-u6-s3', type: 'grammar', xp: 35,
        title: '语法：只有…才', subtitle: 'Only if...then with 只有…才',
        grammarPoints: [
          {
            pattern: '只有 + Condition + 才 + Result  (Only if...then...)',
            explanation: '只有 (zhǐyǒu) = "only if / only when." 才 (cái) = "then / only then." Together they set a strict necessary condition: the result happens ONLY if the condition is met. Compare with 只要…就: 只要 means ANY sufficient condition; 只有 means the ONE and only necessary condition.',
            examples: [
              { zh: '只有努力学习，才能取得好成绩。', py: 'Zhǐyǒu nǔlì xuéxí, cái néng qǔdé hǎo chéngjì.',   en: 'Only by studying hard can you get good grades.' },
              { zh: '只有你来了，我才高兴。',         py: 'Zhǐyǒu nǐ lái le, wǒ cái gāoxìng.',               en: 'Only if you come will I be happy.' },
              { zh: '只有睡好觉，明天才有精神。',     py: 'Zhǐyǒu shuì hǎo jiào, míngtiān cái yǒu jīngshén.', en: 'Only by sleeping well will you have energy tomorrow.' },
            ],
            fillBlanks: [
              { sentence_zh: '___努力，才能成功。',       sentence_en: '___ by working hard can you succeed.',          options: ['只有', '只要', '因为', '如果'],  correct: 0 },
              { sentence_zh: '只有你来，我___高兴。',     sentence_en: 'Only if you come, ___ I will be happy.',        options: ['就', '才', '都', '还'],          correct: 1 },
              { sentence_zh: '___他同意，我们___能做。', sentence_en: 'Only if he agrees can we do it.',                options: ['只有/才', '如果/就', '因为/所以', '虽然/但是'], correct: 0 },
              { sentence_zh: '只有休息好，___有力气工作。', sentence_en: 'Only by resting well will you have energy to work.', options: ['才', '就', '都', '还'],       correct: 0 },
            ],
          },
        ],
      },
      { id: 'h3-u6-s4', type: 'practice', xp: 40, title: '家居与物品练习', subtitle: 'Unit 6 review' },
    ],
  },

  // ── Unit 7: 副词与连词 ───────────────────────────────────────────────────────
  {
    id: 'h3-u7', hsk_level: 3,
    title: 'Unit 7', subtitle: '副词与连词 · Adverbs & Conjunctions',
    emoji: '🔗', color: 'from-cyan-500 to-sky-500',
    sessions: [
      {
        id: 'h3-u7-s1', type: 'vocab', xp: 30,
        title: '程度与频率副词', subtitle: 'Degree & frequency adverbs',
        words: [
          { zh: '稍微',  py: 'shāowēi',   en: 'Slightly / A little' },
          { zh: '渐渐',  py: 'jiànjiàn',  en: 'Gradually' },
          { zh: '往往',  py: 'wǎngwǎng',  en: 'Often / Frequently',         note: '往往 implies a habitual tendency from experience' },
          { zh: '差不多', py: 'chàbuduō', en: 'Almost / About the same' },
          { zh: '其实',  py: 'qíshí',     en: 'Actually / In fact' },
          { zh: '仍然',  py: 'réngrán',   en: 'Still / Yet',                note: 'More literary than 还' },
          { zh: '至少',  py: 'zhìshǎo',   en: 'At least' },
          { zh: '偶尔',  py: 'ǒu\'ěr',    en: 'Occasionally / Once in a while' },
        ],
      },
      {
        id: 'h3-u7-s2', type: 'vocab', xp: 30,
        title: '转折与条件连词', subtitle: 'Conjunctions: concession & condition',
        words: [
          { zh: '虽然',  py: 'suīrán',    en: 'Although / Even though' },
          { zh: '而且',  py: 'érqiě',     en: 'Moreover / And also' },
          { zh: '另外',  py: 'lìngwài',   en: 'In addition / Besides' },
          { zh: '否则',  py: 'fǒuzé',     en: 'Otherwise / Or else' },
          { zh: '既然',  py: 'jìrán',     en: 'Since / Now that' },
          { zh: '即使',  py: 'jíshǐ',     en: 'Even if / Even though' },
          { zh: '无论',  py: 'wúlùn',     en: 'No matter / Regardless' },
          { zh: '只要',  py: 'zhǐyào',    en: 'As long as / Provided that' },
          { zh: '由于',  py: 'yóuyú',     en: 'Due to / Because of' },
        ],
      },
      {
        id: 'h3-u7-s3', type: 'grammar', xp: 35,
        title: '语法：既然…就', subtitle: 'Since...then with 既然…就',
        grammarPoints: [
          {
            pattern: '既然 + Established fact + 就 + Logical consequence',
            explanation: '既然 (jìrán) = "since / given that / now that." It accepts a known fact as the premise. 就 (jiù) = "then / therefore." Together they express: "Given that X is already true, then naturally Y follows." Often used in advice or reasoning from accepted conditions.',
            examples: [
              { zh: '既然你不喜欢，就别买了。',     py: 'Jìrán nǐ bù xǐhuān, jiù bié mǎi le.',         en: "Since you don't like it, don't buy it." },
              { zh: '既然决定了，就要坚持下去。',   py: 'Jìrán juédìng le, jiù yào jiānchí xià qù.',   en: "Since you've decided, keep going." },
              { zh: '既然来了，就好好享受吧。',     py: 'Jìrán lái le, jiù hǎohǎo xiǎngshòu ba.',      en: "Since you're here, just enjoy it." },
            ],
            fillBlanks: [
              { sentence_zh: '___你不喜欢，就别买了。',   sentence_en: '___ you don\'t like it, don\'t buy it.',       options: ['如果', '因为', '既然', '虽然'],  correct: 2 },
              { sentence_zh: '既然决定了，___要坚持。',   sentence_en: 'Since you\'ve decided, ___ keep going.',       options: ['就', '都', '也', '还'],          correct: 0 },
              { sentence_zh: '___来了，就好好学习吧。',   sentence_en: '___ you\'re here, just study well.',           options: ['虽然', '因为', '既然', '如果'],  correct: 2 },
              { sentence_zh: '既然他已经走了，___算了。', sentence_en: 'Since he\'s already gone, ___ let it go.',     options: ['就', '也', '都', '还'],          correct: 0 },
            ],
          },
        ],
      },
      { id: 'h3-u7-s4', type: 'practice', xp: 40, title: '副词与连词练习', subtitle: 'Unit 7 review' },
    ],
  },

  // ── Unit 8: 知识、文化与综合 ─────────────────────────────────────────────────
  {
    id: 'h3-u8', hsk_level: 3,
    title: 'Unit 8', subtitle: '知识与文化 · Knowledge & Culture',
    emoji: '📚', color: 'from-indigo-500 to-violet-500',
    sessions: [
      {
        id: 'h3-u8-s1', type: 'vocab', xp: 30,
        title: '学科与教育', subtitle: 'Academic subjects & education',
        words: [
          { zh: '科学',  py: 'kēxué',     en: 'Science' },
          { zh: '历史',  py: 'lìshǐ',     en: 'History' },
          { zh: '数学',  py: 'shùxué',    en: 'Mathematics' },
          { zh: '体育',  py: 'tǐyù',      en: 'Sports / Physical education' },
          { zh: '音乐',  py: 'yīnyuè',    en: 'Music' },
          { zh: '艺术',  py: 'yìshù',     en: 'Art' },
          { zh: '语法',  py: 'yǔfǎ',      en: 'Grammar' },
          { zh: '字典',  py: 'zìdiǎn',    en: 'Dictionary' },
          { zh: '作文',  py: 'zuòwén',    en: 'Essay / Composition' },
        ],
      },
      {
        id: 'h3-u8-s2', type: 'vocab', xp: 30,
        title: '抽象概念', subtitle: 'Abstract concepts & ideas',
        words: [
          { zh: '关系',  py: 'guānxi',    en: 'Relationship / Connection' },
          { zh: '机会',  py: 'jīhuì',     en: 'Opportunity / Chance' },
          { zh: '方法',  py: 'fāngfǎ',    en: 'Method / Way' },
          { zh: '能力',  py: 'nénglì',    en: 'Ability / Capability' },
          { zh: '水平',  py: 'shuǐpíng',  en: 'Level / Standard' },
          { zh: '知识',  py: 'zhīshi',    en: 'Knowledge' },
          { zh: '经验',  py: 'jīngyàn',   en: 'Experience' },
          { zh: '文化',  py: 'wénhuà',    en: 'Culture' },
          { zh: '习惯',  py: 'xíguàn',    en: 'Habit / Custom' },
        ],
      },
      {
        id: 'h3-u8-s3', type: 'vocab', xp: 30,
        title: '生活与媒体', subtitle: 'Life, media & communication objects',
        words: [
          { zh: '消息',  py: 'xiāoxi',    en: 'Message / News / Information' },
          { zh: '新闻',  py: 'xīnwén',    en: 'News' },
          { zh: '网站',  py: 'wǎngzhàn',  en: 'Website' },
          { zh: '节目',  py: 'jiémù',     en: 'Program / Show' },
          { zh: '广告',  py: 'guǎnggào',  en: 'Advertisement' },
          { zh: '邮件',  py: 'yóujiàn',   en: 'Email / Mail' },
          { zh: '垃圾',  py: 'lājī',      en: 'Garbage / Trash' },
          { zh: '礼物',  py: 'lǐwù',      en: 'Gift / Present' },
        ],
      },
      {
        id: 'h3-u8-s4', type: 'grammar', xp: 35,
        title: '语法：对…来说', subtitle: 'Expressing perspective with 对…来说',
        grammarPoints: [
          {
            pattern: '对 + Person/Group + 来说 + Comment  (For..., / From...\'s perspective)',
            explanation: '对…来说 (duì…lái shuō) introduces whose perspective something applies to. "For [person], [statement]." Use it to express that something is relevant or true specifically from a certain angle or for a certain group.',
            examples: [
              { zh: '对我来说，学汉语很有趣。',     py: 'Duì wǒ lái shuō, xué Hànyǔ hěn yǒuqù.',         en: 'For me, learning Chinese is very interesting.' },
              { zh: '对孩子来说，睡眠很重要。',     py: 'Duì háizi lái shuō, shuìmián hěn zhòngyào.',     en: 'For children, sleep is very important.' },
              { zh: '对外国人来说，汉字很难写。',   py: 'Duì wàiguó rén lái shuō, hànzì hěn nán xiě.',    en: 'For foreigners, Chinese characters are hard to write.' },
            ],
            fillBlanks: [
              { sentence_zh: '___我来说，这很难。',     sentence_en: '___ me, this is very difficult.',         options: ['对', '为', '给', '从'],           correct: 0 },
              { sentence_zh: '对孩子___，游戏很重要。', sentence_en: 'For children ___, games are important.',  options: ['而言', '来说', '来看', '来讲'],    correct: 1 },
              { sentence_zh: '___学生来说，复习很重要。', sentence_en: '___ students, reviewing is important.', options: ['对', '为', '给', '向'],           correct: 0 },
              { sentence_zh: '对外国人来说，汉字___难写。', sentence_en: 'For foreigners, Chinese characters are ___ to write.', options: ['很', '非常', '都', '还'],   correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h3-u8-s5', type: 'grammar', xp: 35,
        title: '语法：把 字句', subtitle: 'The 把 construction for object disposal',
        grammarPoints: [
          {
            pattern: 'Subject + 把 + Object + Verb + Result/Complement',
            explanation: '把 (bǎ) brings the object BEFORE the verb to show that the subject acts on the object and produces a result or change. The verb must be followed by a result complement or directional complement — never stand alone. Use 把 when the object is specific and the action transforms or moves it.',
            examples: [
              { zh: '她把作业做完了。',     py: 'Tā bǎ zuòyè zuò wán le.',     en: 'She finished the homework (lit. dealt with the homework to completion).' },
              { zh: '请把窗户关上。',       py: 'Qǐng bǎ chuānghu guān shàng.', en: 'Please close the window.' },
              { zh: '他把钱包忘在家里了。', py: 'Tā bǎ qiánbāo wàng zài jiā lǐ le.', en: 'He left his wallet at home.' },
            ],
            fillBlanks: [
              { sentence_zh: '她___作业做完了。',   sentence_en: 'She finished ___ the homework.',       options: ['把', '将', '让', '被'],  correct: 0 },
              { sentence_zh: '请___窗户关上。',     sentence_en: 'Please close ___ window.',             options: ['把', '让', '被', '给'],  correct: 0 },
              { sentence_zh: '他把钱包___在家里。', sentence_en: 'He left his wallet ___ at home.',      options: ['放', '忘', '拿', '带'],  correct: 1 },
              { sentence_zh: '请___书放到桌子上。', sentence_en: 'Please put ___ book on the table.',    options: ['把', '被', '让', '给'],  correct: 0 },
            ],
          },
        ],
      },
      { id: 'h3-u8-s6', type: 'practice', xp: 40, title: '知识文化练习', subtitle: 'Unit 8 review' },
    ],
  },

  // ── Unit 9: 人际与社交 ──────────────────────────────────────────────────────
  {
    id: 'h3-u9', hsk_level: 3,
    title: 'Unit 9', subtitle: '人际与社交 · Social Life & Relationships',
    emoji: '👥', color: 'from-indigo-500 to-violet-500',
    sessions: [
      {
        id: 'h3-u9-s1', type: 'vocab', xp: 30,
        title: '社会人物', subtitle: 'People in society',
        words: [
          { zh: '邻居', py: 'línjū',     en: 'Neighbor' },
          { zh: '客人', py: 'kèrén',     en: 'Guest / Visitor' },
          { zh: '观众', py: 'guānzhòng', en: 'Audience / Spectator' },
          { zh: '叔叔', py: 'shūshu',    en: 'Uncle (father\'s younger brother)', note: 'Paternal uncle (younger than father)' },
          { zh: '阿姨', py: 'āyí',       en: 'Aunt / Older woman (polite)',        note: 'Also used politely for any middle-aged woman' },
          { zh: '律师', py: 'lǜshī',     en: 'Lawyer / Attorney' },
          { zh: '作者', py: 'zuòzhě',    en: 'Author / Writer' },
          { zh: '导游', py: 'dǎoyóu',    en: 'Tour guide' },
        ],
      },
      {
        id: 'h3-u9-s2', type: 'vocab', xp: 30,
        title: '社交动作', subtitle: 'Social interaction verbs',
        words: [
          { zh: '安排', py: 'ānpái',    en: 'To arrange / To plan',             note: '安排时间 = arrange time' },
          { zh: '申请', py: 'shēnqǐng', en: 'To apply (for)',                    note: '申请工作/奖学金 = apply for job/scholarship' },
          { zh: '推迟', py: 'tuīchí',   en: 'To postpone / To delay' },
          { zh: '取消', py: 'qǔxiāo',   en: 'To cancel' },
          { zh: '拒绝', py: 'jùjué',    en: 'To refuse / To reject',             note: '拒绝邀请 = decline an invitation' },
          { zh: '接受', py: 'jiēshòu',  en: 'To accept / To receive' },
          { zh: '适应', py: 'shìyìng',  en: 'To adapt / To get used to',         note: '适应新环境 = adapt to a new environment' },
          { zh: '尊重', py: 'zūnzhòng', en: 'To respect',                        note: '尊重别人 = respect others' },
        ],
      },
      {
        id: 'h3-u9-s3', type: 'grammar', xp: 35,
        title: '语法：不过', subtitle: 'Soft contrast with 不过',
        grammarPoints: [
          {
            pattern: 'Clause A, 不过 + Clause B  (however / but — softer than 但是)',
            explanation: '不过 (búguò) = "however / but." Softer and more conversational than 但是. Introduces a mild qualification. Also means "only / just": 不过是小事 = it\'s only a small matter.',
            examples: [
              { zh: '这里的食物很好，不过有点贵。', py: 'Zhèlǐ de shíwù hěn hǎo, búguò yǒudiǎn guì.', en: 'The food here is great, but a bit expensive.' },
              { zh: '他很忙，不过还是来参加了。',   py: 'Tā hěn máng, búguò háishi lái cānjiā le.',   en: 'He was busy, but still came.' },
              { zh: '这不过是一个小问题，别担心。', py: 'Zhè búguò shì yīgè xiǎo wèntí, bié dānxīn.', en: "It's only a small issue, don't worry." },
            ],
            fillBlanks: [
              { sentence_zh: '食物很好，___有点贵。',   sentence_en: 'Food is great, ___ a bit pricey.',       options: ['不过', '因为', '所以', '虽然'], correct: 0 },
              { sentence_zh: '他很忙，___还是来了。',   sentence_en: 'He was busy, ___ he still came.',        options: ['不过', '因为', '所以', '如果'], correct: 0 },
              { sentence_zh: '这___是个小事，别担心。', sentence_en: 'This is ___ a small matter, don\'t worry.', options: ['不过', '已经', '正在', '还是'], correct: 0 },
              { sentence_zh: '我想去，___没有时间。',   sentence_en: 'I want to go, ___ I have no time.',       options: ['不过', '因为', '所以', '而且'], correct: 0 },
            ],
          },
        ],
      },
      { id: 'h3-u9-s4', type: 'practice', xp: 40, title: '社交练习', subtitle: 'Unit 9 review' },
    ],
  },

  // ── Unit 10: 教育与校园 ─────────────────────────────────────────────────────
  {
    id: 'h3-u10', hsk_level: 3,
    title: 'Unit 10', subtitle: '教育与校园 · Education & Campus',
    emoji: '📚', color: 'from-blue-500 to-indigo-500',
    sessions: [
      {
        id: 'h3-u10-s1', type: 'vocab', xp: 30,
        title: '学习材料', subtitle: 'Study materials & school items',
        words: [
          { zh: '笔记本', py: 'bǐjìběn',  en: 'Notebook',                          note: '做笔记 = take notes' },
          { zh: '字典',   py: 'zìdiǎn',   en: 'Dictionary',                        note: '查字典 = look up in a dictionary' },
          { zh: '语法',   py: 'yǔfǎ',     en: 'Grammar' },
          { zh: '作文',   py: 'zuòwén',   en: 'Essay / Composition' },
          { zh: '日记',   py: 'rìjì',     en: 'Diary / Journal',                   note: '写日记 = write in a diary' },
          { zh: '成绩',   py: 'chéngjì',  en: 'Grade / Score / Achievement' },
          { zh: '游戏',   py: 'yóuxì',    en: 'Game',                              note: '电子游戏 = video game' },
          { zh: '比赛',   py: 'bǐsài',    en: 'Competition / Match / Contest',     note: '参加比赛 = join a competition' },
        ],
      },
      {
        id: 'h3-u10-s2', type: 'vocab', xp: 30,
        title: '竞争与成果', subtitle: 'Competition & achievement',
        words: [
          { zh: '赢',   py: 'yíng',     en: 'To win',                              note: '赢了比赛 = won the competition' },
          { zh: '输',   py: 'shū',      en: 'To lose (a game/competition)',        note: '输了 = lost; opposite of 赢' },
          { zh: '合格', py: 'hégé',     en: 'Qualified / Up to standard / To pass', note: '考试合格 = pass the exam standard' },
          { zh: '批评', py: 'pīpíng',   en: 'To criticize / Criticism',            note: '受到批评 = be criticized' },
          { zh: '培养', py: 'péiyǎng',  en: 'To cultivate / To train / To foster', note: '培养能力 = cultivate ability' },
          { zh: '区别', py: 'qūbié',    en: 'Difference / To distinguish',         note: '有什么区别？= What\'s the difference?' },
          { zh: '标准', py: 'biāozhǔn', en: 'Standard / Criterion',               note: '达到标准 = meet the standard' },
          { zh: '规定', py: 'guīdìng',  en: 'Rule / Regulation',                  note: '遵守规定 = follow the rules' },
        ],
      },
      {
        id: 'h3-u10-s3', type: 'grammar', xp: 35,
        title: '语法：不是…而是', subtitle: 'Correcting with 不是…而是',
        grammarPoints: [
          {
            pattern: '不是 + A，而是 + B  (It\'s not A, but rather B)',
            explanation: '不是…而是 (búshì…érshì) = "not A but B." Corrects a mistaken assumption. The focus is on what something IS (B). Stronger than simply denying A; 而是 emphasizes the correct replacement.',
            examples: [
              { zh: '他不是失败了，而是还在努力。', py: 'Tā búshì shībài le, érshì hái zài nǔlì.',       en: "He hasn't failed; he's still working hard." },
              { zh: '这不是问题，而是机会。',       py: 'Zhè búshì wèntí, érshì jīhuì.',               en: "This isn't a problem, but an opportunity." },
              { zh: '她不是不喜欢，而是没时间。',   py: 'Tā búshì bù xǐhuān, érshì méi shíjiān.',     en: "She doesn't dislike it; she just has no time." },
            ],
            fillBlanks: [
              { sentence_zh: '这不是问题，___机会。',      sentence_en: 'This isn\'t a problem, ___ an opportunity.', options: ['而是', '但是', '所以', '还是'], correct: 0 },
              { sentence_zh: '他不是失败，___还在努力。',  sentence_en: 'He hasn\'t failed, ___ is still working.',    options: ['而是', '所以', '因为', '但是'], correct: 0 },
              { sentence_zh: '___是他的错，而是误会。',    sentence_en: '___ is his fault; it\'s a misunderstanding.', options: ['不是', '没有', '虽然', '就是'], correct: 0 },
              { sentence_zh: '我不是不去，___没有时间。',  sentence_en: 'I\'m not refusing; ___ I have no time.',       options: ['而是', '但是', '因为', '所以'], correct: 0 },
            ],
          },
        ],
      },
      { id: 'h3-u10-s4', type: 'practice', xp: 40, title: '教育练习', subtitle: 'Unit 10 review' },
    ],
  },

  // ── Unit 11: 身体与医疗 ─────────────────────────────────────────────────────
  {
    id: 'h3-u11', hsk_level: 3,
    title: 'Unit 11', subtitle: '身体与医疗 · Body & Health Care',
    emoji: '💊', color: 'from-red-500 to-rose-500',
    sessions: [
      {
        id: 'h3-u11-s1', type: 'vocab', xp: 30,
        title: '身体与感官', subtitle: 'Body & senses',
        words: [
          { zh: '皮肤', py: 'pífū',      en: 'Skin' },
          { zh: '头发', py: 'tóufa',     en: 'Hair (on head)' },
          { zh: '感觉', py: 'gǎnjué',    en: 'Feeling / Sensation / Sense',        note: '感觉不好 = feel unwell' },
          { zh: '声音', py: 'shēngyīn',  en: 'Sound / Voice',                      note: '声音很大 = loud voice' },
          { zh: '生命', py: 'shēngmìng', en: 'Life (biological)',                  note: '生命很宝贵 = life is precious' },
          { zh: '营养', py: 'yíngyǎng',  en: 'Nutrition / Nutrients',              note: '营养丰富 = nutritious' },
          { zh: '睡眠', py: 'shuìmián',  en: 'Sleep',                              note: '睡眠质量 = quality of sleep' },
          { zh: '疲劳', py: 'píláo',     en: 'Fatigue / Exhausted',               note: 'More serious than 累; 感到疲劳 = feel fatigued' },
        ],
      },
      {
        id: 'h3-u11-s2', type: 'vocab', xp: 30,
        title: '健康习惯', subtitle: 'Health habits & medical verbs',
        words: [
          { zh: '节约', py: 'jiéyuē',    en: 'To save / To economize',             note: '节约时间/钱 = save time/money' },
          { zh: '浪费', py: 'làngfèi',   en: 'To waste',                           note: '浪费食物/时间 = waste food/time' },
          { zh: '吸烟', py: 'xīyān',     en: 'To smoke (cigarettes)',              note: '禁止吸烟 = no smoking' },
          { zh: '锻炼', py: 'duànliàn',  en: 'To exercise / To work out',          note: '坚持锻炼 = stick to exercising' },
          { zh: '值得', py: 'zhíde',     en: 'To be worth (it)',                   note: '值得努力 = worth the effort' },
          { zh: '养成', py: 'yǎngchéng', en: 'To form (a habit)',                  note: '养成好习惯 = form good habits' },
          { zh: '受伤', py: 'shòu shāng', en: 'To get hurt / To be injured',       note: '受伤了！= Got hurt/injured!' },
          { zh: '恢复', py: 'huīfù',     en: 'To recover / To restore / To resume', note: '恢复健康 = recover health' },
        ],
      },
      {
        id: 'h3-u11-s3', type: 'grammar', xp: 35,
        title: '语法：来得及 / 来不及', subtitle: 'Time pressure expressions',
        grammarPoints: [
          {
            pattern: '来得及 (there\'s still time) vs. 来不及 (no time / too late)',
            explanation: '来得及 (láidejí) = "there\'s still enough time." 来不及 (láibùjí) = "there\'s no time / too late." Both are verb-potential complements. Subject + 来不及 + Verb: 我来不及吃早饭 = I don\'t have time to eat breakfast.',
            examples: [
              { zh: '还早，来得及。',             py: 'Hái zǎo, láidejí.',               en: "It's still early, there's time." },
              { zh: '我来不及准备了。',           py: 'Wǒ láibùjí zhǔnbèi le.',           en: "I don't have time to prepare." },
              { zh: '别担心，我们还来得及赶上。', py: 'Bié dānxīn, wǒmen hái láidejí gǎnshàng.', en: "Don't worry, we can still catch up." },
            ],
            fillBlanks: [
              { sentence_zh: '还早呢，___的，别担心。',   sentence_en: 'It\'s still early, there ___ time.',         options: ['来得及', '来不及', '快要', '已经'], correct: 0 },
              { sentence_zh: '快跑！___迟到了！',         sentence_en: 'Run! There\'s no time, we\'ll be late!',     options: ['来不及', '来得及', '已经', '快要'], correct: 0 },
              { sentence_zh: '你___吗？现在才开始。',     sentence_en: 'Is there still time? It\'s only starting now.', options: ['来得及', '来不及', '快要', '刚才'], correct: 0 },
              { sentence_zh: '他___吃早饭，直接去上班。', sentence_en: 'He had no time to eat breakfast.',           options: ['来不及', '来得及', '已经', '刚才'], correct: 0 },
            ],
          },
        ],
      },
      { id: 'h3-u11-s4', type: 'practice', xp: 40, title: '健康练习', subtitle: 'Unit 11 review' },
    ],
  },

  // ── Unit 12: 媒体与现代生活 ─────────────────────────────────────────────────
  {
    id: 'h3-u12', hsk_level: 3,
    title: 'Unit 12', subtitle: '媒体与现代生活 · Media & Modern Life',
    emoji: '📱', color: 'from-violet-500 to-purple-500',
    sessions: [
      {
        id: 'h3-u12-s1', type: 'vocab', xp: 30,
        title: '媒体词汇', subtitle: 'Media vocabulary',
        words: [
          { zh: '新闻', py: 'xīnwén',   en: 'News',                              note: '看新闻 = read/watch news' },
          { zh: '节目', py: 'jiémù',    en: 'Program / Show / Episode',          note: '电视节目 = TV show' },
          { zh: '广告', py: 'guǎnggào', en: 'Advertisement',                     note: '电视广告 = TV commercial' },
          { zh: '网站', py: 'wǎngzhàn', en: 'Website',                           note: '上网站 = visit a website' },
          { zh: '消息', py: 'xiāoxi',   en: 'Message / News / Information',      note: '好消息！= Good news!; 发消息 = send a message' },
          { zh: '邮件', py: 'yóujiàn',  en: 'Email / Mail',                      note: '发邮件 = send an email' },
          { zh: '信',   py: 'xìn',      en: 'Letter (written)',                  note: '写信 = write a letter; 收到一封信 = received a letter' },
          { zh: '信息', py: 'xìnxī',    en: 'Information / Data',               note: 'More formal than 消息; 获取信息 = get information' },
        ],
      },
      {
        id: 'h3-u12-s2', type: 'vocab', xp: 30,
        title: '常用物品', subtitle: 'Common everyday objects',
        words: [
          { zh: '钥匙',   py: 'yàoshi',      en: 'Key',                           note: '钥匙丢了 = lost the key' },
          { zh: '眼镜',   py: 'yǎnjìng',     en: 'Glasses / Eyeglasses',          note: '戴眼镜 = wear glasses; 一副眼镜 = a pair of glasses' },
          { zh: '信用卡', py: 'xìnyòngkǎ',   en: 'Credit card',                   note: '刷信用卡 = swipe a credit card' },
          { zh: '行李箱', py: 'xínglixiāng',  en: 'Suitcase / Luggage',           note: '托运行李箱 = check in luggage' },
          { zh: '照片',   py: 'zhàopiàn',    en: 'Photo / Picture',               note: '拍照片 = take a photo' },
          { zh: '垃圾',   py: 'lājī',        en: 'Garbage / Trash / Rubbish',     note: '扔垃圾 = throw away trash; 垃圾桶 = trash can' },
          { zh: '礼物',   py: 'lǐwù',        en: 'Gift / Present',                note: '送礼物 = give a gift' },
          { zh: '爱好',   py: 'àihào',       en: 'Hobby / Interest',              note: '你有什么爱好？= What are your hobbies?' },
        ],
      },
      {
        id: 'h3-u12-s3', type: 'grammar', xp: 35,
        title: '语法：于是', subtitle: 'Narrative result with 于是',
        grammarPoints: [
          {
            pattern: 'Situation A, 于是 + Action/Result B  (and so / thereupon)',
            explanation: '于是 (yúshì) = "and so / thereupon / as a result." Shows what someone DID next after a situation. More narrative than 所以 (which explains a logical cause-effect). 于是 tells the story; 所以 explains the logic.',
            examples: [
              { zh: '他迷路了，于是打电话问路。',     py: 'Tā mílù le, yúshì dǎ diànhuà wèn lù.',           en: 'He got lost, and so called to ask for directions.' },
              { zh: '天气很好，于是我们决定出去玩。', py: 'Tiānqì hěn hǎo, yúshì wǒmen juédìng chūqù wán.', en: 'The weather was great, so we decided to go out.' },
              { zh: '来不及了，于是我们跑步去。',     py: 'Láibùjí le, yúshì wǒmen pǎobù qù.',               en: 'There was no time, so we ran there.' },
            ],
            fillBlanks: [
              { sentence_zh: '他迷路了，___打电话问路。', sentence_en: 'He got lost, ___ called for directions.',    options: ['于是', '因为', '所以', '如果'], correct: 0 },
              { sentence_zh: '天气很好，___我们出去了。', sentence_en: 'The weather was good, ___ we went out.',     options: ['于是', '因为', '但是', '虽然'], correct: 0 },
              { sentence_zh: '他看到消息，___很高兴。',   sentence_en: 'He saw the message, ___ was very happy.',   options: ['于是', '因为', '所以', '就是'], correct: 0 },
              { sentence_zh: '来不及了，___我们跑步去。', sentence_en: 'There\'s no time, ___ we ran there.',        options: ['于是', '因为', '但是', '虽然'], correct: 0 },
            ],
          },
        ],
      },
      { id: 'h3-u12-s4', type: 'practice', xp: 50, title: 'HSK 3 总复习', subtitle: 'HSK 3 final grand review' },
    ],
  },
]
