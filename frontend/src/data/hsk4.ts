import type { UnitDef } from './curriculum'

// ─────────────────────────────────────────────────────────────────────────────
// HSK 4  (597 words, 10 units × 4–6 sessions = 48 sessions)
// Based on official HSK 4 word list from vault (HSK/Levels/HSK 4.md)
// ─────────────────────────────────────────────────────────────────────────────

export const HSK4: UnitDef[] = [

  // ── Unit 1: 形容词·个人品质 ──────────────────────────────────────────────────
  {
    id: 'h4-u1', hsk_level: 4,
    title: 'Unit 1', subtitle: '形容词·个人品质 · Personal Qualities',
    emoji: '🏅', color: 'from-yellow-500 to-amber-500',
    sessions: [
      {
        id: 'h4-u1-s1', type: 'vocab', xp: 35,
        title: '积极品质', subtitle: 'Positive character qualities',
        words: [
          { zh: '勇敢',  py: 'yǒnggǎn',   en: 'Brave / Courageous' },
          { zh: '坚强',  py: 'jiānqiáng',  en: 'Strong / Firm / Resilient' },
          { zh: '善良',  py: 'shànliáng',  en: 'Kind-hearted / Good-natured' },
          { zh: '热情',  py: 'rèqíng',     en: 'Enthusiastic / Warm / Passionate' },
          { zh: '耐心',  py: 'nàixīn',     en: 'Patient / Patience' },
          { zh: '自信',  py: 'zìxìn',      en: 'Confident / Self-confident' },
          { zh: '勤奋',  py: 'qínfèn',     en: 'Diligent / Studious' },
          { zh: '主动',  py: 'zhǔdòng',    en: 'Active / Proactive / Taking initiative' },
          { zh: '能干',  py: 'nénggàn',    en: 'Capable / Competent' },
        ],
      },
      {
        id: 'h4-u1-s2', type: 'vocab', xp: 35,
        title: '消极与中性品质', subtitle: 'Negative & neutral character traits',
        words: [
          { zh: '骄傲',  py: 'jiāo\'ào',   en: 'Arrogant (negative) / Proud',  note: '骄傲 can mean either proud or arrogant — context matters' },
          { zh: '粗心',  py: 'cūxīn',      en: 'Careless / Thoughtless' },
          { zh: '懒惰',  py: 'lǎnduò',     en: 'Lazy / Slothful' },
          { zh: '烦恼',  py: 'fánnǎo',     en: 'Troubled / Vexed / Distressed' },
          { zh: '固执',  py: 'gùzhí',      en: 'Stubborn / Obstinate' },
          { zh: '谨慎',  py: 'jǐnshèn',    en: 'Cautious / Careful / Prudent' },
          { zh: '随便',  py: 'suíbiàn',    en: 'Casual / Careless / Whatever' },
          { zh: '诚恳',  py: 'chéngkěn',   en: 'Sincere / Earnest' },
        ],
      },
      {
        id: 'h4-u1-s3', type: 'grammar', xp: 40,
        title: '语法：不管/无论…都', subtitle: 'No matter what with 不管/无论…都',
        grammarPoints: [
          {
            pattern: '不管/无论 + Question word / all options + 都/也 + Result',
            explanation: '不管 (bùguǎn) and 无论 (wúlùn) both mean "no matter / regardless of." They introduce all possible conditions, and 都/也 shows the result holds in every case. Must be followed by a question word (什么, 怎么, 谁, 多) or a pair of opposites (好不好, 来不来). 无论 is slightly more formal/literary.',
            examples: [
              { zh: '不管天气怎么样，他都去跑步。',   py: 'Bùguǎn tiānqì zěnme yàng, tā dōu qù pǎobù.',  en: 'No matter what the weather is, he runs.' },
              { zh: '无论多难，他也不放弃。',          py: 'Wúlùn duō nán, tā yě bù fàngqì.',              en: 'No matter how hard, he never gives up.' },
              { zh: '不管你去不去，我都去。',          py: 'Bùguǎn nǐ qù bù qù, wǒ dōu qù.',              en: "Whether or not you go, I'm going." },
            ],
            fillBlanks: [
              { sentence_zh: '___天气怎么样，他都去运动。', sentence_en: '___ the weather, he always exercises.',     options: ['如果', '不管', '因为', '虽然'],  correct: 1 },
              { sentence_zh: '无论多难，他___不放弃。',     sentence_en: 'No matter how hard, ___ he never gives up.', options: ['都', '还', '也', '就'],          correct: 2 },
              { sentence_zh: '不管你同意不同意，我___去。', sentence_en: 'Whether you agree or not, ___ I\'m going.', options: ['都', '还', '才', '就'],          correct: 0 },
              { sentence_zh: '___发生什么，我都支持你。',   sentence_en: '___ what happens, I support you.',          options: ['不管', '因为', '虽然', '如果'],  correct: 0 },
            ],
          },
        ],
      },
      { id: 'h4-u1-s4', type: 'practice', xp: 45, title: '品质形容词练习', subtitle: 'Unit 1 review' },
    ],
  },

  // ── Unit 2: 形容词·状态与评价 ────────────────────────────────────────────────
  {
    id: 'h4-u2', hsk_level: 4,
    title: 'Unit 2', subtitle: '形容词·状态与评价 · States & Evaluation',
    emoji: '🎯', color: 'from-teal-500 to-green-500',
    sessions: [
      {
        id: 'h4-u2-s1', type: 'vocab', xp: 35,
        title: '状态与性质', subtitle: 'States & properties',
        words: [
          { zh: '明显',  py: 'míngxiǎn',   en: 'Obvious / Evident / Clear' },
          { zh: '普遍',  py: 'pǔbiàn',     en: 'Universal / Widespread / Common' },
          { zh: '严重',  py: 'yánzhòng',   en: 'Serious / Severe / Grave' },
          { zh: '紧急',  py: 'jǐnjí',      en: 'Urgent / Emergency' },
          { zh: '稳定',  py: 'wěndìng',    en: 'Stable / Steady' },
          { zh: '灵活',  py: 'línghuó',    en: 'Flexible / Agile' },
          { zh: '冷静',  py: 'lěngjìng',   en: 'Calm / Cool-headed / Composed' },
          { zh: '乐观',  py: 'lèguān',     en: 'Optimistic / Hopeful' },
          { zh: '悲观',  py: 'bēiguān',    en: 'Pessimistic' },
        ],
      },
      {
        id: 'h4-u2-s2', type: 'vocab', xp: 35,
        title: '评价形容词', subtitle: 'Evaluation adjectives',
        words: [
          { zh: '合理',  py: 'hélǐ',       en: 'Reasonable / Rational' },
          { zh: '有效',  py: 'yǒuxiào',    en: 'Effective / Valid' },
          { zh: '充分',  py: 'chōngfèn',   en: 'Ample / Sufficient / Full' },
          { zh: '全面',  py: 'quánmiàn',   en: 'Comprehensive / Overall' },
          { zh: '先进',  py: 'xiānjìn',    en: 'Advanced / Progressive' },
          { zh: '正式',  py: 'zhèngshì',   en: 'Formal / Official' },
          { zh: '深刻',  py: 'shēnkè',     en: 'Profound / Deep / Penetrating' },
          { zh: '典型',  py: 'diǎnxíng',   en: 'Typical / Representative' },
        ],
      },
      {
        id: 'h4-u2-s3', type: 'grammar', xp: 40,
        title: '语法：即使…也', subtitle: 'Even if...still with 即使…也',
        grammarPoints: [
          {
            pattern: '即使 + Hypothetical condition + 也 + Unchanged result',
            explanation: '即使 (jíshǐ) = "even if / even though." 也 (yě) = "still / also." Together they say: even in this extreme or hypothetical case, the result stays the same. The condition in 即使 is often unlikely or contrary to fact. Compare with 虽然…但是 (actual fact) vs 即使…也 (hypothetical/extreme).',
            examples: [
              { zh: '即使下雨，比赛也照常进行。',     py: 'Jíshǐ xià yǔ, bǐsài yě zhàocháng jìnxíng.',   en: 'Even if it rains, the match will proceed as normal.' },
              { zh: '即使很难，他也不会放弃。',       py: 'Jíshǐ hěn nán, tā yě bú huì fàngqì.',          en: 'Even if it is very hard, he won\'t give up.' },
              { zh: '即使你不告诉我，我也知道。',     py: 'Jíshǐ nǐ bù gàosu wǒ, wǒ yě zhīdào.',          en: 'Even if you don\'t tell me, I still know.' },
            ],
            fillBlanks: [
              { sentence_zh: '___下雨，比赛___照常进行。', sentence_en: 'Even if it rains, ___ the match proceeds.',   options: ['即使/也', '虽然/但是', '如果/就', '因为/所以'], correct: 0 },
              { sentence_zh: '即使很难，他___不放弃。',    sentence_en: 'Even if very hard, he ___ won\'t give up.',   options: ['也', '都', '就', '才'],           correct: 0 },
              { sentence_zh: '___他不来，我___去。',       sentence_en: 'Even if he doesn\'t come, I\'ll ___ go.',    options: ['即使/也', '因为/所以', '虽然/但是', '如果/就'], correct: 0 },
              { sentence_zh: '即使你不说，我___会发现的。', sentence_en: 'Even if you don\'t say it, I\'ll ___ find out.', options: ['也', '就', '才', '都'],         correct: 0 },
            ],
          },
        ],
      },
      { id: 'h4-u2-s4', type: 'practice', xp: 45, title: '状态与评价练习', subtitle: 'Unit 2 review' },
    ],
  },

  // ── Unit 3: 动词·发展与创造 ──────────────────────────────────────────────────
  {
    id: 'h4-u3', hsk_level: 4,
    title: 'Unit 3', subtitle: '动词·发展与创造 · Development & Creation',
    emoji: '🚀', color: 'from-sky-500 to-blue-600',
    sessions: [
      {
        id: 'h4-u3-s1', type: 'vocab', xp: 35,
        title: '建立与发展', subtitle: 'Establishing & developing verbs',
        words: [
          { zh: '建立',  py: 'jiànlì',     en: 'Establish / Set up / Found' },
          { zh: '创造',  py: 'chuàngzào',  en: 'Create / Produce / Creation' },
          { zh: '发明',  py: 'fāmíng',     en: 'Invent / Invention' },
          { zh: '实现',  py: 'shíxiàn',    en: 'Realize / Achieve / Accomplish' },
          { zh: '促进',  py: 'cùjìn',      en: 'Promote / Advance / Facilitate' },
          { zh: '扩大',  py: 'kuòdà',      en: 'Expand / Enlarge / Extend' },
          { zh: '形成',  py: 'xíngchéng',  en: 'Form / Take shape' },
          { zh: '产生',  py: 'chǎnshēng',  en: 'Produce / Generate / Arise' },
        ],
      },
      {
        id: 'h4-u3-s2', type: 'vocab', xp: 35,
        title: '改变与控制', subtitle: 'Change & control verbs',
        words: [
          { zh: '改革',  py: 'gǎigé',      en: 'Reform / Overhaul' },
          { zh: '改善',  py: 'gǎishàn',    en: 'Improve / Ameliorate' },
          { zh: '调整',  py: 'tiáozhěng',  en: 'Adjust / Regulate' },
          { zh: '控制',  py: 'kòngzhì',    en: 'Control / Dominate' },
          { zh: '限制',  py: 'xiànzhì',    en: 'Limit / Restrict' },
          { zh: '破坏',  py: 'pòhuài',     en: 'Destroy / Damage / Sabotage' },
          { zh: '恢复',  py: 'huīfù',      en: 'Recover / Restore / Resume' },
          { zh: '完善',  py: 'wánshàn',    en: 'Perfect / Improve' },
        ],
      },
      {
        id: 'h4-u3-s3', type: 'grammar', xp: 40,
        title: '语法：只要…就', subtitle: 'As long as...then with 只要…就',
        grammarPoints: [
          {
            pattern: '只要 + Sufficient condition + 就 + Result',
            explanation: '只要 (zhǐyào) = "as long as / provided that." 就 (jiù) = "then." Contrast with 只有…才: 只要 means ANY sufficient condition that guarantees the result; 只有 means the ONE necessary condition. 只要 is more common in everyday speech.',
            examples: [
              { zh: '只要努力，就会成功。',         py: 'Zhǐyào nǔlì, jiù huì chénggōng.',          en: 'As long as you work hard, you will succeed.' },
              { zh: '只要你来，我们就开始。',       py: 'Zhǐyào nǐ lái, wǒmen jiù kāishǐ.',          en: 'As long as you come, we\'ll start.' },
              { zh: '只要坚持，汉语一定能学好。',   py: 'Zhǐyào jiānchí, Hànyǔ yīdìng néng xué hǎo.', en: 'As long as you persist, you will definitely learn Chinese well.' },
            ],
            fillBlanks: [
              { sentence_zh: '___努力，就会成功。',       sentence_en: '___ you work hard, you will succeed.',         options: ['只要', '只有', '因为', '如果'],   correct: 0 },
              { sentence_zh: '只要你来，我们___开始。',   sentence_en: 'As long as you come, we ___ will start.',      options: ['才', '都', '就', '还'],           correct: 2 },
              { sentence_zh: '___你喜欢，___可以学。',   sentence_en: 'As long as you like it, you can learn it.',     options: ['只要/就', '只有/才', '虽然/但是', '因为/所以'], correct: 0 },
              { sentence_zh: '只要坚持，___一定能学好。', sentence_en: 'As long as you persist, ___ you can learn it.', options: ['就', '才', '都', '也'],           correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h4-u3-s4', type: 'vocab', xp: 35,
        title: '生产与使用', subtitle: 'Production & utilization verbs',
        words: [
          { zh: '生产',  py: 'shēngchǎn', en: 'Produce / Manufacture' },
          { zh: '使用',  py: 'shǐyòng',   en: 'Use / Employ / Apply' },
          { zh: '利用',  py: 'lìyòng',    en: 'Utilize / Make use of' },
          { zh: '应用',  py: 'yìngyòng',  en: 'Apply / Application' },
          { zh: '实行',  py: 'shíxíng',   en: 'Implement / Carry out' },
          { zh: '执行',  py: 'zhíxíng',   en: 'Execute / Carry out' },
          { zh: '推广',  py: 'tuīguǎng',  en: 'Promote / Popularize' },
          { zh: '传播',  py: 'chuánbō',   en: 'Spread / Disseminate / Broadcast' },
        ],
      },
      { id: 'h4-u3-s5', type: 'practice', xp: 45, title: '发展与创造练习', subtitle: 'Unit 3 review' },
    ],
  },

  // ── Unit 4: 动词·沟通与合作 ──────────────────────────────────────────────────
  {
    id: 'h4-u4', hsk_level: 4,
    title: 'Unit 4', subtitle: '动词·沟通与合作 · Communication & Cooperation',
    emoji: '🤝', color: 'from-emerald-500 to-teal-500',
    sessions: [
      {
        id: 'h4-u4-s1', type: 'vocab', xp: 35,
        title: '沟通与表达', subtitle: 'Communication & expression verbs',
        words: [
          { zh: '表达',  py: 'biǎodá',    en: 'Express / Convey' },
          { zh: '表现',  py: 'biǎoxiàn',  en: 'Show / Display / Performance' },
          { zh: '解释',  py: 'jiěshì',    en: 'Explain / Interpret' },
          { zh: '说明',  py: 'shuōmíng',  en: 'Explain / Illustrate / Explanation' },
          { zh: '交流',  py: 'jiāoliú',   en: 'Exchange / Communicate' },
          { zh: '沟通',  py: 'gōutōng',   en: 'Communicate / Communication' },
          { zh: '宣传',  py: 'xuānchuán', en: 'Publicize / Promote / Spread' },
          { zh: '反映',  py: 'fǎnyìng',   en: 'Reflect / Report / Mirror' },
        ],
      },
      {
        id: 'h4-u4-s2', type: 'vocab', xp: 35,
        title: '合作与管理', subtitle: 'Cooperation & management verbs',
        words: [
          { zh: '合作',  py: 'hézuò',     en: 'Cooperate / Collaborate' },
          { zh: '管理',  py: 'guǎnlǐ',    en: 'Manage / Administer / Management' },
          { zh: '组织',  py: 'zǔzhī',     en: 'Organize / Organization' },
          { zh: '举办',  py: 'jǔbàn',     en: 'Hold / Host (an event)' },
          { zh: '参与',  py: 'cānyù',     en: 'Participate in / Take part' },
          { zh: '承担',  py: 'chéngdān',  en: 'Bear / Undertake / Assume' },
          { zh: '贡献',  py: 'gòngxiàn',  en: 'Contribute / Contribution' },
          { zh: '支持',  py: 'zhīchí',    en: 'Support / Back up' },
        ],
      },
      {
        id: 'h4-u4-s3', type: 'grammar', xp: 40,
        title: '语法：宁可…也不/也要', subtitle: 'Would rather...than with 宁可',
        grammarPoints: [
          {
            pattern: '宁可 + Chosen option + 也不/也要 + Rejected/Insisted option',
            explanation: '宁可 (nìngkě) = "would rather / prefer to." Use 也不 (also not) to say what one refuses to do, or 也要 (also must) to say what one insists on doing. Shows a strong preference that accepts a cost. More literary/emphatic than 宁愿.',
            examples: [
              { zh: '我宁可走路，也不坐出租车。',     py: 'Wǒ nìngkě zǒu lù, yě bù zuò chūzūchē.',      en: 'I would rather walk than take a taxi.' },
              { zh: '她宁可失败，也要尝试。',         py: 'Tā nìngkě shībài, yě yào chángshì.',          en: 'She would rather fail than not try.' },
              { zh: '他宁可少赚钱，也不做不诚实的事。', py: 'Tā nìngkě shǎo zhuàn qián, yě bù zuò bù chéngshí de shì.', en: 'He would rather earn less money than do dishonest things.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___走路，也不坐出租车。',     sentence_en: 'I would ___ walk than take a taxi.',     options: ['宁可', '虽然', '如果', '因为'],    correct: 0 },
              { sentence_zh: '她宁可失败，___要尝试。',       sentence_en: 'She would rather fail, ___ try anyway.', options: ['也', '都', '就', '才'],            correct: 0 },
              { sentence_zh: '他宁可少赚钱，___不撒谎。',     sentence_en: 'He would rather earn less, ___ never lie.', options: ['也', '都', '就', '才'],          correct: 0 },
              { sentence_zh: '我___等，___不说错。',          sentence_en: 'I would rather wait than ___ speak wrongly.', options: ['宁可/也', '虽然/但是', '如果/就', '因为/所以'], correct: 0 },
            ],
          },
        ],
      },
      { id: 'h4-u4-s4', type: 'practice', xp: 45, title: '沟通与合作练习', subtitle: 'Unit 4 review' },
    ],
  },

  // ── Unit 5: 动词·思维与决策 ──────────────────────────────────────────────────
  {
    id: 'h4-u5', hsk_level: 4,
    title: 'Unit 5', subtitle: '动词·思维与决策 · Thinking & Decision-Making',
    emoji: '🧠', color: 'from-purple-500 to-violet-600',
    sessions: [
      {
        id: 'h4-u5-s1', type: 'vocab', xp: 35,
        title: '分析与判断', subtitle: 'Analysis & judgment verbs',
        words: [
          { zh: '考虑',  py: 'kǎolǜ',     en: 'Consider / Think about' },
          { zh: '判断',  py: 'pànduàn',   en: 'Judge / Determine / Judgment' },
          { zh: '分析',  py: 'fēnxī',     en: 'Analyze / Analysis' },
          { zh: '观察',  py: 'guānchá',   en: 'Observe / Watch / Observation' },
          { zh: '估计',  py: 'gūjì',      en: 'Estimate / Reckon' },
          { zh: '证明',  py: 'zhèngmíng', en: 'Prove / Demonstrate / Proof' },
          { zh: '确定',  py: 'quèdìng',   en: 'Determine / Confirm / Definite' },
          { zh: '思考',  py: 'sīkǎo',     en: 'Think / Ponder / Reflect' },
        ],
      },
      {
        id: 'h4-u5-s2', type: 'vocab', xp: 35,
        title: '选择与行动', subtitle: 'Choice & action verbs',
        words: [
          { zh: '选择',  py: 'xuǎnzé',    en: 'Choose / Select / Choice' },
          { zh: '采取',  py: 'cǎiqǔ',     en: 'Adopt / Take (measures)' },
          { zh: '实践',  py: 'shíjiàn',   en: 'Practice / Put into practice' },
          { zh: '追求',  py: 'zhuīqiú',   en: 'Pursue / Seek / Pursuit' },
          { zh: '达到',  py: 'dádào',     en: 'Reach / Achieve / Attain' },
          { zh: '满足',  py: 'mǎnzú',     en: 'Satisfy / Meet (needs) / Satisfied' },
          { zh: '克服',  py: 'kèfú',      en: 'Overcome / Conquer' },
          { zh: '面对',  py: 'miànduì',   en: 'Face / Confront' },
        ],
      },
      {
        id: 'h4-u5-s3', type: 'grammar', xp: 40,
        title: '语法：之所以…是因为', subtitle: 'The reason why...is because',
        grammarPoints: [
          {
            pattern: 'Subject + 之所以 + Result + 是因为 + Reason',
            explanation: '之所以 (zhī suǒ yǐ)…是因为 (shì yīnwèi) = "The reason [subject] [did X] is because..." This structure puts the RESULT first and the REASON after. It is the formal/literary inverse of 因为…所以. Often used in written Chinese to explain surprising or important facts.',
            examples: [
              { zh: '他之所以成功，是因为坚持不懈。',   py: 'Tā zhī suǒ yǐ chénggōng, shì yīnwèi jiānchí bùxiè.',     en: 'The reason he succeeded is because he never gave up.' },
              { zh: '我之所以学汉语，是因为喜欢中国文化。', py: 'Wǒ zhī suǒ yǐ xué Hànyǔ, shì yīnwèi xǐhuān Zhōngguó wénhuà.', en: 'The reason I study Chinese is because I love Chinese culture.' },
              { zh: '她之所以伤心，是因为失去了机会。', py: 'Tā zhī suǒ yǐ shāngxīn, shì yīnwèi shīqù le jīhuì.', en: 'The reason she is sad is because she lost the opportunity.' },
            ],
            fillBlanks: [
              { sentence_zh: '他___成功，是因为努力。',     sentence_en: 'The reason he succeeded ___ is hard work.',    options: ['之所以', '所以', '因为', '为了'],  correct: 0 },
              { sentence_zh: '我之所以来，___想见你。',     sentence_en: 'The reason I came ___ is I wanted to see you.', options: ['是因为', '所以', '因为', '为了'],  correct: 0 },
              { sentence_zh: '___他不说话，是因为不同意。', sentence_en: 'The reason ___ he didn\'t speak is disagreement.', options: ['他之所以', '所以', '因此', '于是'], correct: 0 },
              { sentence_zh: '她之所以努力，___有个梦想。', sentence_en: 'The reason she works hard ___ is she has a dream.', options: ['是因为', '所以', '但是', '而且'],  correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h4-u5-s4', type: 'vocab', xp: 35,
        title: '处理与解决', subtitle: 'Handling & solving verbs',
        words: [
          { zh: '处理',  py: 'chǔlǐ',     en: 'Handle / Deal with / Process' },
          { zh: '解决',  py: 'jiějué',    en: 'Solve / Resolve' },
          { zh: '反对',  py: 'fǎnduì',    en: 'Oppose / Be against' },
          { zh: '同意',  py: 'tóngyì',    en: 'Agree / Consent / Approve' },
          { zh: '允许',  py: 'yǔnxǔ',     en: 'Permit / Allow' },
          { zh: '禁止',  py: 'jìnzhǐ',    en: 'Prohibit / Forbid / Ban' },
          { zh: '要求',  py: 'yāoqiú',    en: 'Require / Demand / Requirement' },
          { zh: '坚持',  py: 'jiānchí',   en: 'Persist in / Insist on' },
        ],
      },
      { id: 'h4-u5-s5', type: 'practice', xp: 45, title: '思维与决策练习', subtitle: 'Unit 5 review' },
    ],
  },

  // ── Unit 6: 名词·社会与文化 ──────────────────────────────────────────────────
  {
    id: 'h4-u6', hsk_level: 4,
    title: 'Unit 6', subtitle: '名词·社会与文化 · Society & Culture',
    emoji: '🏛️', color: 'from-orange-500 to-red-500',
    sessions: [
      {
        id: 'h4-u6-s1', type: 'vocab', xp: 35,
        title: '社会与制度', subtitle: 'Society & institutions',
        words: [
          { zh: '社会',  py: 'shèhuì',    en: 'Society / Social' },
          { zh: '文化',  py: 'wénhuà',    en: 'Culture / Civilization' },
          { zh: '传统',  py: 'chuántǒng', en: 'Tradition / Traditional' },
          { zh: '制度',  py: 'zhìdù',     en: 'System / Institution' },
          { zh: '法律',  py: 'fǎlǜ',      en: 'Law / Legislation' },
          { zh: '政策',  py: 'zhèngcè',   en: 'Policy' },
          { zh: '原则',  py: 'yuánzé',    en: 'Principle / Tenet' },
          { zh: '道德',  py: 'dàodé',     en: 'Morality / Ethics / Virtue' },
        ],
      },
      {
        id: 'h4-u6-s2', type: 'vocab', xp: 35,
        title: '人与群体', subtitle: 'People & groups',
        words: [
          { zh: '人才',  py: 'réncái',    en: 'Talent / Talented person' },
          { zh: '人口',  py: 'rénkǒu',    en: 'Population' },
          { zh: '民族',  py: 'mínzú',     en: 'Nationality / Ethnic group' },
          { zh: '青少年', py: 'qīngshàonián', en: 'Teenager / Youth' },
          { zh: '儿童',  py: 'értóng',    en: 'Children' },
          { zh: '老板',  py: 'lǎobǎn',    en: 'Boss / Employer' },
          { zh: '教授',  py: 'jiàoshòu',  en: 'Professor' },
          { zh: '律师',  py: 'lǜshī',     en: 'Lawyer / Attorney' },
        ],
      },
      {
        id: 'h4-u6-s3', type: 'grammar', xp: 40,
        title: '语法：难道…吗', subtitle: 'Rhetorical questions with 难道…吗',
        grammarPoints: [
          {
            pattern: '难道 + Statement + 吗/不成?  (Could it really be that...? / Don\'t tell me...!)',
            explanation: '难道 (nándào) introduces a rhetorical question that expresses surprise, disbelief, or challenge. The expected answer is "no" (or the opposite of what is stated). It is often used to refute or question a situation. More emphatic than simply using 吗 alone.',
            examples: [
              { zh: '难道你不知道这件事吗？',     py: 'Nándào nǐ bù zhīdào zhè jiàn shì ma?',       en: 'Could it be that you don\'t know about this? (You must know!)' },
              { zh: '难道我们就这样放弃吗？',     py: 'Nándào wǒmen jiù zhèyàng fàngqì ma?',         en: 'Are we really just going to give up like this? (We shouldn\'t!)' },
              { zh: '难道你忘了我们的约定吗？',   py: 'Nándào nǐ wàng le wǒmen de yuēdìng ma?',      en: 'Don\'t tell me you forgot our agreement!' },
            ],
            fillBlanks: [
              { sentence_zh: '___你不知道这件事吗？', sentence_en: 'Don\'t tell me you don\'t know ___ this?',      options: ['难道', '是否', '到底', '究竟'],  correct: 0 },
              { sentence_zh: '难道我们就放弃___？', sentence_en: 'Are we really going to give up ___ like this?', options: ['吗', '了', '呢', '啊'],           correct: 0 },
              { sentence_zh: '___他就不在乎别人吗？', sentence_en: 'Could it be that he ___ doesn\'t care about others?', options: ['难道', '因为', '虽然', '如果'], correct: 0 },
              { sentence_zh: '___你忘了我们的约定___？', sentence_en: 'Don\'t tell me you forgot our agreement?', options: ['难道/吗', '因为/所以', '虽然/但是', '如果/就'], correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h4-u6-s4', type: 'vocab', xp: 35,
        title: '文化与艺术', subtitle: 'Culture, arts & language',
        words: [
          { zh: '文学',  py: 'wénxué',    en: 'Literature' },
          { zh: '艺术',  py: 'yìshù',     en: 'Art / Fine arts' },
          { zh: '语言',  py: 'yǔyán',     en: 'Language' },
          { zh: '成语',  py: 'chéngyǔ',   en: 'Idiom / Set phrase' },
          { zh: '风格',  py: 'fēnggé',    en: 'Style / Manner' },
          { zh: '风俗',  py: 'fēngsú',    en: 'Custom / Convention' },
          { zh: '印象',  py: 'yìnxiàng',  en: 'Impression' },
          { zh: '意义',  py: 'yìyì',      en: 'Meaning / Significance' },
        ],
      },
      { id: 'h4-u6-s5', type: 'practice', xp: 45, title: '社会与文化练习', subtitle: 'Unit 6 review' },
    ],
  },

  // ── Unit 7: 名词·工作与经济 ──────────────────────────────────────────────────
  {
    id: 'h4-u7', hsk_level: 4,
    title: 'Unit 7', subtitle: '名词·工作与经济 · Work & Economy',
    emoji: '💼', color: 'from-slate-500 to-gray-600',
    sessions: [
      {
        id: 'h4-u7-s1', type: 'vocab', xp: 35,
        title: '工作与职场', subtitle: 'Work & workplace vocabulary',
        words: [
          { zh: '工资',  py: 'gōngzī',    en: 'Salary / Wages' },
          { zh: '收入',  py: 'shōurù',    en: 'Income / Revenue' },
          { zh: '工程',  py: 'gōngchéng', en: 'Engineering / Project' },
          { zh: '工具',  py: 'gōngjù',    en: 'Tool / Instrument' },
          { zh: '功能',  py: 'gōngnéng',  en: 'Function / Feature' },
          { zh: '程序',  py: 'chéngxù',   en: 'Procedure / Program' },
          { zh: '系统',  py: 'xìtǒng',    en: 'System' },
          { zh: '技术',  py: 'jìshù',     en: 'Technology / Technique / Skill' },
        ],
      },
      {
        id: 'h4-u7-s2', type: 'vocab', xp: 35,
        title: '经济与商业', subtitle: 'Economy & commerce',
        words: [
          { zh: '经济',  py: 'jīngjì',    en: 'Economy / Economics' },
          { zh: '市场',  py: 'shìchǎng',  en: 'Market / Marketplace' },
          { zh: '贸易',  py: 'màoyì',     en: 'Trade / Commerce' },
          { zh: '产品',  py: 'chǎnpǐn',   en: 'Product / Goods' },
          { zh: '商品',  py: 'shāngpǐn',  en: 'Commodity / Merchandise' },
          { zh: '成本',  py: 'chéngběn',  en: 'Cost (of production)' },
          { zh: '利润',  py: 'lìrùn',     en: 'Profit' },
          { zh: '竞争',  py: 'jìngzhēng', en: 'Competition / Compete' },
        ],
      },
      {
        id: 'h4-u7-s3', type: 'grammar', xp: 40,
        title: '语法：一旦…就', subtitle: 'Once/If ever...then with 一旦…就',
        grammarPoints: [
          {
            pattern: '一旦 + Triggering event + 就 + Consequence',
            explanation: '一旦 (yídàn) = "once / if ever / the moment that." It introduces a condition that, once triggered, immediately leads to a consequence. Often used for warnings or important turning points. The event in 一旦 may be hypothetical or something that only needs to happen once to have lasting effects.',
            examples: [
              { zh: '一旦失去信任，就很难再建立。',   py: 'Yídàn shīqù xìnrèn, jiù hěn nán zài jiànlì.',   en: 'Once trust is lost, it is hard to rebuild.' },
              { zh: '一旦决定了，就不要后悔。',       py: 'Yídàn juédìng le, jiù bùyào hòuhuǐ.',            en: 'Once you\'ve decided, don\'t regret it.' },
              { zh: '一旦掌握了方法，学习就容易了。', py: 'Yídàn zhǎngwò le fāngfǎ, xuéxí jiù róngyì le.', en: 'Once you grasp the method, studying becomes easy.' },
            ],
            fillBlanks: [
              { sentence_zh: '___失去信任，就很难建立。', sentence_en: '___ trust is lost, it\'s hard to rebuild.',      options: ['一旦', '如果', '因为', '虽然'],  correct: 0 },
              { sentence_zh: '一旦决定了，___不要后悔。', sentence_en: 'Once decided, ___ don\'t regret it.',           options: ['就', '才', '都', '也'],          correct: 0 },
              { sentence_zh: '___掌握了方法，学习___容易了。', sentence_en: 'Once you grasp the method, ___ it\'s easy.', options: ['一旦/就', '虽然/但是', '如果/才', '因为/所以'], correct: 0 },
              { sentence_zh: '一旦习惯了，___会觉得简单。', sentence_en: 'Once you get used to it, ___ it feels simple.', options: ['就', '才', '都', '也'],         correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h4-u7-s4', type: 'vocab', xp: 35,
        title: '资源与能源', subtitle: 'Resources, environment & society',
        words: [
          { zh: '资源',  py: 'zīyuán',    en: 'Resources' },
          { zh: '能源',  py: 'néngyuán',  en: 'Energy (source)' },
          { zh: '环境',  py: 'huánjìng',  en: 'Environment / Surroundings' },
          { zh: '气候',  py: 'qìhòu',     en: 'Climate' },
          { zh: '污染',  py: 'wūrǎn',     en: 'Pollution / Contamination' },
          { zh: '地区',  py: 'dìqū',      en: 'Region / Area / District' },
          { zh: '农村',  py: 'nóngcūn',   en: 'Rural area / Countryside' },
          { zh: '人口',  py: 'rénkǒu',    en: 'Population' },
        ],
      },
      { id: 'h4-u7-s5', type: 'practice', xp: 45, title: '工作与经济练习', subtitle: 'Unit 7 review' },
    ],
  },

  // ── Unit 8: 副词 ─────────────────────────────────────────────────────────────
  {
    id: 'h4-u8', hsk_level: 4,
    title: 'Unit 8', subtitle: '副词 · Advanced Adverbs',
    emoji: '🔄', color: 'from-pink-500 to-rose-500',
    sessions: [
      {
        id: 'h4-u8-s1', type: 'vocab', xp: 35,
        title: '时间与程度副词', subtitle: 'Time & degree adverbs',
        words: [
          { zh: '曾经',  py: 'céngjīng',  en: 'Once / Formerly / Ever',     note: '曾经 always refers to the past: 我曾经住在北京 = I once lived in Beijing' },
          { zh: '立刻',  py: 'lìkè',      en: 'Immediately / At once' },
          { zh: '逐渐',  py: 'zhújiàn',   en: 'Gradually / Little by little' },
          { zh: '始终',  py: 'shǐzhōng',  en: 'All along / From beginning to end' },
          { zh: '相当',  py: 'xiāngdāng', en: 'Quite / Fairly / Considerably' },
          { zh: '总算',  py: 'zǒngsuàn',  en: 'Finally / At last' },
          { zh: '毕竟',  py: 'bìjìng',    en: 'After all / When all is said and done' },
          { zh: '竟然',  py: 'jìngrán',   en: 'Unexpectedly / Surprisingly' },
        ],
      },
      {
        id: 'h4-u8-s2', type: 'vocab', xp: 35,
        title: '语气与情态副词', subtitle: 'Mood & modal adverbs',
        words: [
          { zh: '恐怕',  py: 'kǒngpà',    en: 'I\'m afraid / Perhaps / Probably',  note: 'Used for negative or uncertain guesses' },
          { zh: '似乎',  py: 'sìhū',       en: 'Seemingly / As if / It seems' },
          { zh: '实在',  py: 'shízài',     en: 'Really / Truly / Honestly' },
          { zh: '显然',  py: 'xiǎnrán',   en: 'Obviously / Evidently' },
          { zh: '果然',  py: 'guǒrán',    en: 'As expected / Sure enough' },
          { zh: '反正',  py: 'fǎnzhèng',  en: 'Anyway / In any case' },
          { zh: '幸亏',  py: 'xìngkuī',   en: 'Fortunately / Luckily' },
          { zh: '未必',  py: 'wèibì',      en: 'Not necessarily / May not' },
        ],
      },
      {
        id: 'h4-u8-s3', type: 'grammar', xp: 40,
        title: '语法：通过…来', subtitle: 'Achieving goals through means with 通过…来',
        grammarPoints: [
          {
            pattern: '通过 + Method/Means + 来 + Goal  (Through / By means of...to achieve...)',
            explanation: '通过 (tōngguò) = "through / by means of / via." 来 (lái) connects the method to the purpose. Structure: 通过 + [method] + 来 + [achieve goal]. Also used as a verb: 通过考试 = pass the exam. The 来 can be omitted in shorter sentences.',
            examples: [
              { zh: '通过学习来提高自己的能力。',   py: 'Tōngguò xuéxí lái tígāo zìjǐ de nénglì.',        en: 'Improve your abilities through studying.' },
              { zh: '他通过努力来实现自己的梦想。', py: 'Tā tōngguò nǔlì lái shíxiàn zìjǐ de mèngxiǎng.', en: 'He realizes his dreams through hard work.' },
              { zh: '通过沟通来解决问题。',         py: 'Tōngguò gōutōng lái jiějué wèntí.',               en: 'Solve problems through communication.' },
            ],
            fillBlanks: [
              { sentence_zh: '___学习来提高能力。',       sentence_en: '___ studying to improve ability.',            options: ['通过', '为了', '因为', '由于'],  correct: 0 },
              { sentence_zh: '他通过努力___实现梦想。',   sentence_en: 'He realized his dreams ___ hard work.',       options: ['来', '去', '到', '在'],          correct: 0 },
              { sentence_zh: '___沟通来解决矛盾。',       sentence_en: '___ communication to resolve conflict.',       options: ['通过', '因为', '虽然', '如果'],  correct: 0 },
              { sentence_zh: '我们通过练习___提高水平。', sentence_en: 'We improve our level ___ through practice.',  options: ['来', '去', '把', '被'],          correct: 0 },
            ],
          },
        ],
      },
      { id: 'h4-u8-s4', type: 'practice', xp: 45, title: '副词练习', subtitle: 'Unit 8 review' },
    ],
  },

  // ── Unit 9: 连词与高级结构 ────────────────────────────────────────────────────
  {
    id: 'h4-u9', hsk_level: 4,
    title: 'Unit 9', subtitle: '连词与结构 · Conjunctions & Advanced Structures',
    emoji: '🔗', color: 'from-indigo-500 to-blue-500',
    sessions: [
      {
        id: 'h4-u9-s1', type: 'vocab', xp: 35,
        title: '连词', subtitle: 'Advanced conjunctions',
        words: [
          { zh: '并且',  py: 'bìngqiě',   en: 'And besides / Moreover' },
          { zh: '除非',  py: 'chúfēi',    en: 'Unless / Only if' },
          { zh: '何况',  py: 'hékuàng',   en: 'Let alone / Much less / All the more' },
          { zh: '既然',  py: 'jìrán',     en: 'Since / Now that / Given that' },
          { zh: '从而',  py: 'cóng\'ér',  en: 'Thereby / Thus / And so' },
          { zh: '总之',  py: 'zǒngzhī',   en: 'In short / In a word / In brief' },
          { zh: '然而',  py: 'rán\'ér',   en: 'However / But / Yet',             note: 'More literary than 但是' },
          { zh: '至于',  py: 'zhìyú',     en: 'As for / As to / Regarding' },
        ],
      },
      {
        id: 'h4-u9-s2', type: 'vocab', xp: 35,
        title: '介词与结构词', subtitle: 'Prepositions & structure words',
        words: [
          { zh: '根据',  py: 'gēnjù',     en: 'According to / Based on',         note: '根据调查 = according to the survey' },
          { zh: '对于',  py: 'duìyú',     en: 'With regard to / As for' },
          { zh: '关于',  py: 'guānyú',    en: 'About / Regarding / Concerning' },
          { zh: '为了',  py: 'wèile',     en: 'In order to / For the sake of' },
          { zh: '随着',  py: 'suízhe',    en: 'Along with / As / Following' },
          { zh: '以',    py: 'yǐ',        en: 'By means of / With / In order to', note: 'Literary; in modern use often appears in 以…为…' },
          { zh: '之间',  py: 'zhījiān',   en: 'Between / Among' },
          { zh: '之所以', py: 'zhīsuǒyǐ', en: 'The reason why (connective)',     note: '之所以…是因为… = the reason why...is because...' },
        ],
      },
      {
        id: 'h4-u9-s3', type: 'grammar', xp: 40,
        title: '语法：被 字句 (passive)', subtitle: 'The 被 passive construction',
        grammarPoints: [
          {
            pattern: 'Subject (patient) + 被 + Agent + Verb + Result',
            explanation: '被 (bèi) marks the passive: the subject RECEIVES the action. Often used when something undesirable or significant happens to the subject. The agent (doer) can be omitted. The verb must be followed by a result/complement — never stand alone. In spoken Chinese, 叫 and 让 also form passives (more colloquial).',
            examples: [
              { zh: '我的钱包被人偷了。',       py: 'Wǒ de qiánbāo bèi rén tōu le.',     en: 'My wallet was stolen.' },
              { zh: '这本书被很多人读过了。',   py: 'Zhè běn shū bèi hěn duō rén dú guò le.', en: 'This book has been read by many people.' },
              { zh: '会议被推迟了。',           py: 'Huìyì bèi tuīchí le.',               en: 'The meeting was postponed.' },
            ],
            fillBlanks: [
              { sentence_zh: '我的钱包___偷了。',       sentence_en: 'My wallet ___ stolen.',                    options: ['被', '把', '让', '为'],  correct: 0 },
              { sentence_zh: '这件事___他告诉我了。',   sentence_en: 'This matter was told ___ to me by him.',   options: ['被', '把', '给', '让'],  correct: 0 },
              { sentence_zh: '会议___推迟了。',         sentence_en: 'The meeting ___ postponed.',               options: ['被', '把', '让', '给'],  correct: 0 },
              { sentence_zh: '他的建议___大家接受了。', sentence_en: 'His suggestion was accepted ___ by everyone.', options: ['被', '把', '让', '向'],  correct: 0 },
            ],
          },
        ],
      },
      { id: 'h4-u9-s4', type: 'practice', xp: 45, title: '连词与结构练习', subtitle: 'Unit 9 review' },
    ],
  },

  // ── Unit 10: HSK 4 综合 ────────────────────────────────────────────────────────
  {
    id: 'h4-u10', hsk_level: 4,
    title: 'Unit 10', subtitle: '综合·名词专题 · Key Nouns & Grand Review',
    emoji: '🎓', color: 'from-violet-600 to-fuchsia-600',
    sessions: [
      {
        id: 'h4-u10-s1', type: 'vocab', xp: 35,
        title: '抽象名词', subtitle: 'Abstract nouns (concepts & ideas)',
        words: [
          { zh: '目标',  py: 'mùbiāo',    en: 'Goal / Target / Objective' },
          { zh: '理想',  py: 'lǐxiǎng',   en: 'Ideal / Dream' },
          { zh: '思想',  py: 'sīxiǎng',   en: 'Thought / Thinking / Ideology' },
          { zh: '观点',  py: 'guāndiǎn',  en: 'Viewpoint / Standpoint / Opinion' },
          { zh: '信心',  py: 'xìnxīn',    en: 'Confidence / Faith' },
          { zh: '压力',  py: 'yālì',      en: 'Pressure / Stress' },
          { zh: '挑战',  py: 'tiǎozhàn',  en: 'Challenge / To challenge' },
          { zh: '机会',  py: 'jīhuì',     en: 'Opportunity / Chance' },
        ],
      },
      {
        id: 'h4-u10-s2', type: 'vocab', xp: 35,
        title: '关键名词', subtitle: 'Key nouns for HSK 4',
        words: [
          { zh: '智慧',  py: 'zhìhuì',    en: 'Wisdom / Intelligence' },
          { zh: '性格',  py: 'xìnggé',    en: 'Character / Personality / Temperament' },
          { zh: '感情',  py: 'gǎnqíng',   en: 'Feeling / Emotion / Affection' },
          { zh: '结论',  py: 'jiélùn',    en: 'Conclusion' },
          { zh: '基础',  py: 'jīchǔ',     en: 'Foundation / Basis' },
          { zh: '效率',  py: 'xiàolǜ',    en: 'Efficiency' },
          { zh: '阶段',  py: 'jiēduàn',   en: 'Stage / Phase / Period' },
          { zh: '特点',  py: 'tèdiǎn',    en: 'Characteristic / Feature' },
        ],
      },
      {
        id: 'h4-u10-s3', type: 'grammar', xp: 40,
        title: '语法：随着…的发展', subtitle: 'Along with changes using 随着',
        grammarPoints: [
          {
            pattern: '随着 + Change/Process + (Subject) + Change result',
            explanation: '随着 (suízhe) = "along with / as / following." It introduces a changing situation, and the main clause shows a corresponding change. Both changes happen in parallel. Often used with nouns like 随着时代、随着发展、随着年龄. Common in formal/written contexts.',
            examples: [
              { zh: '随着经济的发展，生活水平提高了。', py: 'Suízhe jīngjì de fāzhǎn, shēnghuó shuǐpíng tígāo le.', en: 'As the economy develops, the standard of living has improved.' },
              { zh: '随着年龄的增长，他越来越成熟。',   py: 'Suízhe niánlíng de zēngzhǎng, tā yuè lái yuè chéngshú.', en: 'As he grows older, he becomes more and more mature.' },
              { zh: '随着科技进步，手机越来越智能。',   py: 'Suízhe kējì jìnbù, shǒujī yuè lái yuè zhìnéng.',         en: 'As technology advances, phones become smarter and smarter.' },
            ],
            fillBlanks: [
              { sentence_zh: '___经济的发展，生活水平提高了。', sentence_en: '___ economic development, living standards improved.', options: ['随着', '因为', '为了', '通过'], correct: 0 },
              { sentence_zh: '随着年龄增长，他___成熟了。',     sentence_en: 'As he grows older, he became ___ more mature.',       options: ['越来越', '很', '非常', '更'],   correct: 0 },
              { sentence_zh: '___科技进步，生活变得更方便了。', sentence_en: '___ technological progress, life became more convenient.', options: ['随着', '虽然', '虽然', '即使'], correct: 0 },
              { sentence_zh: '随着___的发展，机会越来越多。',   sentence_en: 'As ___ develops, opportunities are increasing.',       options: ['社会', '虽然', '但是', '因为'], correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h4-u10-s4', type: 'grammar', xp: 40,
        title: '语法：除非…否则', subtitle: 'Unless...otherwise with 除非…否则',
        grammarPoints: [
          {
            pattern: '除非 + Necessary condition + (否则/不然) + Consequence if not met',
            explanation: '除非 (chúfēi) = "unless / only if." 否则 (fǒuzé) / 不然 (bùrán) = "otherwise." Together: "Unless X, otherwise Y (bad result)." 除非 sets the ONE condition that prevents a negative outcome. The structure asserts that the condition is the only way to avoid the consequence.',
            examples: [
              { zh: '除非你道歉，否则我不原谅你。', py: 'Chúfēi nǐ dàoqiàn, fǒuzé wǒ bù yuánliàng nǐ.', en: 'Unless you apologize, I won\'t forgive you.' },
              { zh: '除非下大雨，否则我们照常出发。', py: 'Chúfēi xià dà yǔ, fǒuzé wǒmen zhàocháng chūfā.', en: 'Unless it rains heavily, we\'ll set off as planned.' },
              { zh: '除非他亲自来，不然我不相信。',  py: 'Chúfēi tā qīnzì lái, bùrán wǒ bù xiāngxìn.', en: 'Unless he comes in person, I won\'t believe it.' },
            ],
            fillBlanks: [
              { sentence_zh: '___你道歉，否则我不原谅你。', sentence_en: '___ you apologize, I won\'t forgive you.',       options: ['除非', '如果', '因为', '只要'],  correct: 0 },
              { sentence_zh: '除非下大雨，___我们照常出发。', sentence_en: 'Unless it rains, ___ we\'ll set off.',        options: ['否则', '所以', '然后', '如果'],  correct: 0 },
              { sentence_zh: '___他来，不然我们取消。',      sentence_en: '___ he comes, otherwise we\'ll cancel.',      options: ['除非', '如果', '因为', '所以'],  correct: 0 },
              { sentence_zh: '除非天气好，___我才去爬山。',  sentence_en: 'Unless the weather is good, ___ I\'ll go hiking.', options: ['否则', '不然', '才', '都'],    correct: 2 },
            ],
          },
        ],
      },
      { id: 'h4-u10-s5', type: 'practice', xp: 60, title: 'HSK 4 大回顾', subtitle: 'HSK 4 grand review' },
    ],
  },
]
