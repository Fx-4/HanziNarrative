import type { UnitDef } from './curriculum'

// ─────────────────────────────────────────────────────────────────────────────
// HSK 2  — 10 thematic units × 5 sessions = 50 sessions
// Vocabulary strictly from official HSK 2 word list (~268 words)
// Grammar: 20 patterns across 10 units (2 per unit)
// ─────────────────────────────────────────────────────────────────────────────

export const HSK2: UnitDef[] = [

  // ── Unit 1: 外貌与性格 ──────────────────────────────────────────────────────
  {
    id: 'h2-u1', hsk_level: 2,
    title: 'Unit 1', subtitle: '外貌与性格 · Appearance & Character',
    emoji: '👤', color: 'from-cyan-500 to-blue-500',
    sessions: [
      {
        id: 'h2-u1-s1', type: 'vocab', xp: 25,
        title: '外表描述', subtitle: 'Describing appearance',
        words: [
          { zh: '高',    py: 'gāo',      en: 'Tall',           note: '他很高 = He is very tall' },
          { zh: '矮',    py: 'ǎi',       en: 'Short (height)' },
          { zh: '胖',    py: 'pàng',     en: 'Fat / Chubby' },
          { zh: '瘦',    py: 'shòu',     en: 'Thin / Slim' },
          { zh: '漂亮',  py: 'piàoliang', en: 'Beautiful / Pretty' },
          { zh: '帅',    py: 'shuài',    en: 'Handsome' },
          { zh: '老',    py: 'lǎo',      en: 'Old (person/thing)',  note: '老朋友 = old friend; 老了 = got old' },
          { zh: '年轻',  py: 'niánqīng', en: 'Young' },
        ],
      },
      {
        id: 'h2-u1-s2', type: 'vocab', xp: 25,
        title: '性格品质', subtitle: 'Personality & character',
        words: [
          { zh: '热情',  py: 'rèqíng',  en: 'Warm / Enthusiastic / Passionate' },
          { zh: '有名',  py: 'yǒumíng', en: 'Famous / Well-known' },
          { zh: '清楚',  py: 'qīngchu', en: 'Clear / Clearly understood',   note: '说清楚 = say clearly; 我清楚 = I understand clearly' },
          { zh: '当然',  py: 'dāngrán', en: 'Of course / Naturally' },
          { zh: '其实',  py: 'qíshí',   en: 'Actually / In fact',           note: '其实我不知道 = Actually I don\'t know' },
          { zh: '一样',  py: 'yīyàng',  en: 'Same / Alike',                 note: '不一样 = different; 一样高 = same height' },
          { zh: '比较',  py: 'bǐjiào',  en: 'Relatively / Fairly / Compare', note: '比较好 = relatively good; 比较一下 = compare' },
          { zh: '自己',  py: 'zìjǐ',    en: 'Oneself / Myself / Yourself',  note: '你自己去 = go yourself; 我自己做 = I\'ll do it myself' },
        ],
      },
      {
        id: 'h2-u1-s3', type: 'grammar', xp: 30,
        title: '语法：比', subtitle: 'Comparisons with 比',
        grammarPoints: [
          {
            pattern: 'A + 比 + B + Adjective  (A is more [adj] than B)',
            explanation: '比 (bǐ) makes direct comparisons. Never put 很 before the adjective. To express degree: 比 B + Adj + 一点儿 (a little), 多了/得多 (much more). Negative: A + 没有 + B + 那么 + Adj.',
            examples: [
              { zh: '他比我高。',         py: 'Tā bǐ wǒ gāo.',                    en: 'He is taller than me.' },
              { zh: '今天比昨天冷多了。', py: 'Jīntiān bǐ zuótiān lěng duō le.',  en: 'Today is much colder than yesterday.' },
              { zh: '汉语比英语难一点儿。', py: 'Hànyǔ bǐ Yīngyǔ nán yīdiǎnr.',  en: 'Chinese is a little harder than English.' },
            ],
            fillBlanks: [
              { sentence_zh: '他___我高一点儿。',   sentence_en: 'He is a little taller ___ me.',      options: ['比', '和', '跟', '都'], correct: 0 },
              { sentence_zh: '今天___昨天冷多了。', sentence_en: 'Today is much colder ___ yesterday.', options: ['跟', '比', '和', '又'], correct: 1 },
              { sentence_zh: '汉语___英语难吗？',   sentence_en: 'Is Chinese harder ___ English?',     options: ['和', '跟', '比', '也'], correct: 2 },
              { sentence_zh: '她没有他___得快。',   sentence_en: 'She doesn\'t run as fast as him.',   options: ['跑', '走', '飞', '游'], correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h2-u1-s4', type: 'grammar', xp: 30,
        title: '语法：有点儿 vs 一点儿', subtitle: 'Expressing "a bit"',
        grammarPoints: [
          {
            pattern: '有点儿 + Adj (slightly — before adj, mild negative) / Adj + 一点儿 (a little — after adj)',
            explanation: '有点儿 (yǒudiǎnr) goes BEFORE an adjective; often implies mild complaint. 一点儿 (yīdiǎnr) goes AFTER an adjective — in comparisons or requests (快一点儿 = go a bit faster).',
            examples: [
              { zh: '这道题有点儿难。', py: 'Zhè dào tí yǒudiǎnr nán.',   en: 'This question is a bit difficult.' },
              { zh: '他比我高一点儿。', py: 'Tā bǐ wǒ gāo yīdiǎnr.',     en: 'He is a little taller than me.' },
              { zh: '请说慢一点儿。',   py: 'Qǐng shuō màn yīdiǎnr.',     en: 'Please speak a little slower.' },
            ],
            fillBlanks: [
              { sentence_zh: '这里___安静。',     sentence_en: 'It\'s ___ quiet here (slightly).',    options: ['有点儿', '一点儿', '很', '非常'], correct: 0 },
              { sentence_zh: '请说慢___。',       sentence_en: 'Please speak a little ___.',          options: ['一点儿', '有点儿', '很', '太'],   correct: 0 },
              { sentence_zh: '今天___冷，多穿点。', sentence_en: 'Today is ___ cold; dress warmly.',  options: ['有点儿', '一点儿', '真', '也'],   correct: 0 },
              { sentence_zh: '他比我高___。',     sentence_en: 'He is ___ taller than me.',           options: ['一点儿', '有点儿', '很', '非常'], correct: 0 },
            ],
          },
        ],
      },
      { id: 'h2-u1-s5', type: 'practice', xp: 35, title: '外貌性格练习', subtitle: 'Unit 1 review' },
    ],
  },

  // ── Unit 2: 生活习惯 ──────────────────────────────────────────────────────
  {
    id: 'h2-u2', hsk_level: 2,
    title: 'Unit 2', subtitle: '生活习惯 · Daily Habits & Routines',
    emoji: '🌅', color: 'from-yellow-400 to-orange-500',
    sessions: [
      {
        id: 'h2-u2-s1', type: 'vocab', xp: 25,
        title: '日常动作', subtitle: 'Everyday routine actions',
        words: [
          { zh: '起床',   py: 'qǐ chuáng', en: 'Get up / Wake up' },
          { zh: '刷牙',   py: 'shuā yá',   en: 'Brush teeth' },
          { zh: '洗澡',   py: 'xǐ zǎo',    en: 'Take a shower / Bath' },
          { zh: '穿',     py: 'chuān',      en: 'Wear / Put on (clothing)',   note: '穿衣服 = put on clothes; 穿鞋 = put on shoes' },
          { zh: '打扫',   py: 'dǎsǎo',      en: 'Clean / Sweep',              note: '打扫房间/卫生 = clean room/hygiene' },
          { zh: '整理',   py: 'zhěnglǐ',    en: 'Tidy up / Organize',         note: '整理书包 = tidy up one\'s bag' },
          { zh: '休息',   py: 'xiūxi',      en: 'Rest / Take a break' },
          { zh: '帮助',   py: 'bāngzhù',    en: 'Help / Assist',              note: '帮助别人 = help others' },
        ],
      },
      {
        id: 'h2-u2-s2', type: 'vocab', xp: 25,
        title: '时间副词', subtitle: 'Time adverbs & frequency',
        words: [
          { zh: '正在',   py: 'zhèngzài', en: 'Currently / In the middle of',  note: '正在吃饭 = currently eating' },
          { zh: '总是',   py: 'zǒngshì',  en: 'Always / Constantly' },
          { zh: '常常',   py: 'chángcháng', en: 'Often / Frequently' },
          { zh: '有时候', py: 'yǒushíhou',  en: 'Sometimes' },
          { zh: '突然',   py: 'tūrán',    en: 'Suddenly / Unexpectedly' },
          { zh: '马上',   py: 'mǎshàng',  en: 'Immediately / Right away',
            funFact: '马 = "horse" + 上 = "on top of" → literally "on horseback". In the old days the fastest way to do or deliver something was on a galloping horse, so "on the horse" came to mean "right away".' },
          { zh: '一会儿', py: 'yīhuìr',   en: 'In a moment / A while',        note: '等一会儿 = wait a moment; 一会儿来 = come in a while' },
          { zh: '刚',     py: 'gāng',     en: 'Just now / Just did',          note: '刚来 = just arrived; 刚吃 = just ate' },
        ],
      },
      {
        id: 'h2-u2-s3', type: 'grammar', xp: 30,
        title: '语法：正在…呢', subtitle: 'Expressing ongoing actions',
        grammarPoints: [
          {
            pattern: '正在 + Verb (+ 呢)  (currently doing / right in the middle of)',
            explanation: '正在 (zhèngzài) = "currently / in the process of." Place before the verb. 呢 (ne) at the end adds an emphasis — "right in the middle of it." Both together emphasize the action is happening THIS MOMENT.',
            examples: [
              { zh: '我正在吃饭。',       py: 'Wǒ zhèngzài chī fàn.',           en: 'I am currently eating.' },
              { zh: '他正在打扫房间呢。', py: 'Tā zhèngzài dǎsǎo fángjiān ne.',  en: 'He\'s right in the middle of cleaning.' },
              { zh: '我们正在等你呢！',   py: 'Wǒmen zhèngzài děng nǐ ne!',      en: 'We\'re waiting for you right now!' },
            ],
            fillBlanks: [
              { sentence_zh: '我___吃饭，等一下。',   sentence_en: 'I\'m ___ eating; wait a moment.',      options: ['正在', '已经', '突然', '马上'],  correct: 0 },
              { sentence_zh: '他___打扫房间呢。',     sentence_en: 'He\'s in the middle of cleaning.',      options: ['正在', '总是', '刚', '有时候'], correct: 0 },
              { sentence_zh: '我们___等你呢！',       sentence_en: 'We\'re waiting for you right now!',     options: ['正在', '已经', '突然', '刚'],   correct: 0 },
              { sentence_zh: '她___学习，别打扰。',   sentence_en: 'She\'s ___ studying, don\'t disturb.', options: ['正在', '马上', '总是', '刚'],   correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h2-u2-s4', type: 'grammar', xp: 30,
        title: '语法：先…再/然后', subtitle: 'Sequencing daily actions',
        grammarPoints: [
          {
            pattern: '先 + V1, 再/然后 + V2  (First V1, then V2)',
            explanation: '先 (xiān) = "first." 再 (zài) = "then" (same subject, sequential steps). 然后 (ránhòu) = "after that" (more flexible, can switch subjects). Use 先...再 for step-by-step instructions.',
            examples: [
              { zh: '先刷牙，再洗澡。',       py: 'Xiān shuā yá, zài xǐ zǎo.',          en: 'Brush teeth first, then shower.' },
              { zh: '先吃饭，然后去图书馆。', py: 'Xiān chī fàn, rán hòu qù túshūguǎn.', en: 'First eat, then go to the library.' },
              { zh: '你先去，我然后来。',     py: 'Nǐ xiān qù, wǒ rán hòu lái.',         en: 'You go first; I\'ll come after.' },
            ],
            fillBlanks: [
              { sentence_zh: '___刷牙，再洗澡。',     sentence_en: '___ brush teeth, then shower.',        options: ['先', '再', '然后', '就'],   correct: 0 },
              { sentence_zh: '先吃饭，___去学习。',   sentence_en: 'First eat, ___ go study.',             options: ['然后', '先', '如果', '所以'], correct: 0 },
              { sentence_zh: '你___去，我再来。',     sentence_en: 'You go ___, I\'ll come after.',        options: ['先', '再', '然后', '就'],   correct: 0 },
              { sentence_zh: '先查一查，___做决定。', sentence_en: 'Check first, ___ make a decision.',    options: ['再', '先', '所以', '因为'], correct: 0 },
            ],
          },
        ],
      },
      { id: 'h2-u2-s5', type: 'practice', xp: 35, title: '生活习惯练习', subtitle: 'Unit 2 review' },
    ],
  },

  // ── Unit 3: 身体与看病 ──────────────────────────────────────────────────────
  {
    id: 'h2-u3', hsk_level: 2,
    title: 'Unit 3', subtitle: '身体与看病 · Body & Visiting the Doctor',
    emoji: '🏥', color: 'from-rose-500 to-red-500',
    sessions: [
      {
        id: 'h2-u3-s1', type: 'vocab', xp: 25,
        title: '身体部位', subtitle: 'Parts of the body',
        words: [
          { zh: '头',   py: 'tóu',     en: 'Head' },
          { zh: '脸',   py: 'liǎn',    en: 'Face' },
          { zh: '眼睛', py: 'yǎnjīng', en: 'Eyes',   note: '眼睛不好 = have poor eyesight' },
          { zh: '耳朵', py: 'ěrduǒ',   en: 'Ears' },
          { zh: '嘴',   py: 'zuǐ',     en: 'Mouth' },
          { zh: '鼻子', py: 'bízi',    en: 'Nose' },
          { zh: '手',   py: 'shǒu',    en: 'Hand' },
          { zh: '脚',   py: 'jiǎo',    en: 'Foot / Feet' },
        ],
      },
      {
        id: 'h2-u3-s2', type: 'vocab', xp: 25,
        title: '生病就医', subtitle: 'Illness & medical vocabulary',
        words: [
          { zh: '生病', py: 'shēng bìng', en: 'Get sick / Fall ill' },
          { zh: '感冒', py: 'gǎnmào',     en: 'Cold / Flu',                note: '感冒了 = caught a cold; 发烧 = have a fever' },
          { zh: '头疼', py: 'tóuténg',    en: 'Headache',                  note: '头疼得很 = have a bad headache' },
          { zh: '发烧', py: 'fāshāo',     en: 'Have a fever',              note: '发高烧 = have a high fever' },
          { zh: '检查', py: 'jiǎnchá',    en: 'Examine / Check-up',        note: '去医院检查 = get a check-up at the hospital' },
          { zh: '药',   py: 'yào',        en: 'Medicine / Drug',           note: '吃药 = take medicine; 开药 = prescribe medicine' },
          { zh: '健康', py: 'jiànkāng',   en: 'Health / Healthy',          note: '身体健康 = be in good health' },
          { zh: '舒服', py: 'shūfu',      en: 'Comfortable / Well',        note: '不舒服 = unwell; 很舒服 = very comfortable' },
        ],
      },
      {
        id: 'h2-u3-s3', type: 'grammar', xp: 30,
        title: '语法：应该', subtitle: 'Giving advice with 应该',
        grammarPoints: [
          {
            pattern: 'Subject + 应该 + Verb  (should / ought to)',
            explanation: '应该 (yīnggāi) = "should / ought to." Used for advice, moral expectations, and recommendations. 不应该 = "should not." Often used in health and lifestyle advice.',
            examples: [
              { zh: '你应该多喝水。',     py: 'Nǐ yīnggāi duō hē shuǐ.',         en: 'You should drink more water.' },
              { zh: '你不应该熬夜。',     py: 'Nǐ bù yīnggāi áoyè.',             en: "You shouldn't stay up late." },
              { zh: '他应该去医院检查。', py: 'Tā yīnggāi qù yīyuàn jiǎnchá.',   en: 'He should go to the hospital for a check-up.' },
            ],
            fillBlanks: [
              { sentence_zh: '你___多休息。',   sentence_en: 'You ___ rest more.',            options: ['应该', '想', '能', '在'],   correct: 0 },
              { sentence_zh: '他___去医院。',   sentence_en: 'He ___ go to the hospital.',    options: ['会', '应该', '想', '有'],   correct: 1 },
              { sentence_zh: '你不___熬夜。',   sentence_en: 'You ___ stay up late.',         options: ['应该', '会', '想', '觉得'], correct: 0 },
              { sentence_zh: '我们___多运动。', sentence_en: 'We ___ exercise more.',         options: ['想', '在', '应该', '能'],   correct: 2 },
            ],
          },
        ],
      },
      {
        id: 'h2-u3-s4', type: 'grammar', xp: 30,
        title: '语法：觉得', subtitle: 'Expressing opinions with 觉得',
        grammarPoints: [
          {
            pattern: 'Subject + 觉得 + Adj / Clause  (feel / think that...)',
            explanation: '觉得 (juéde) = "feel" or "think." Used for subjective feelings or opinions. Can be followed directly by an adjective (觉得累) or a full clause (觉得这很难). It is about personal perception, not objective fact.',
            examples: [
              { zh: '我觉得很累。',         py: 'Wǒ juéde hěn lèi.',               en: 'I feel very tired.' },
              { zh: '你觉得这道题怎么样？', py: 'Nǐ juéde zhè dào tí zěnme yàng?', en: 'What do you think of this question?' },
              { zh: '我觉得身体不舒服。',   py: 'Wǒ juéde shēntǐ bú shūfu.',        en: 'I feel unwell.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___很累。',         sentence_en: 'I ___ very tired.',              options: ['感觉', '觉得', '有', '是'],  correct: 1 },
              { sentence_zh: '你___这本书怎么样？', sentence_en: 'What do you ___ about this book?', options: ['是', '会', '觉得', '在'],   correct: 2 },
              { sentence_zh: '他___身体不舒服。',   sentence_en: 'He ___ unwell.',                  options: ['想', '是', '在', '觉得'],   correct: 3 },
              { sentence_zh: '我___这个很难。',     sentence_en: 'I ___ this is very difficult.',   options: ['觉得', '一定', '可以', '应该'], correct: 0 },
            ],
          },
        ],
      },
      { id: 'h2-u3-s5', type: 'practice', xp: 35, title: '身体健康练习', subtitle: 'Unit 3 review' },
    ],
  },

  // ── Unit 4: 说说心情 ──────────────────────────────────────────────────────
  {
    id: 'h2-u4', hsk_level: 2,
    title: 'Unit 4', subtitle: '说说心情 · Talking About Feelings',
    emoji: '💬', color: 'from-violet-500 to-purple-500',
    sessions: [
      {
        id: 'h2-u4-s1', type: 'vocab', xp: 25,
        title: '积极情感', subtitle: 'Positive emotions & attitudes',
        words: [
          { zh: '高兴',  py: 'gāoxìng',  en: 'Happy / Glad',                note: '我很高兴 = I\'m very happy; 高兴地说 = said happily' },
          { zh: '开心',  py: 'kāixīn',   en: 'Happy / Cheerful / Pleased',   note: 'More casual; 开心地玩 = play happily' },
          { zh: '快乐',  py: 'kuàilè',   en: 'Happy / Joyful (sustained)',   note: '快乐的童年 = happy childhood; 快乐! = Happy [holiday]!' },
          { zh: '满意',  py: 'mǎnyì',    en: 'Satisfied / Content' },
          { zh: '感谢',  py: 'gǎnxiè',   en: 'Grateful / Thank (formal)',   note: '非常感谢 = thank you very much; more formal than 谢谢' },
          { zh: '愿意',  py: 'yuànyì',   en: 'Willing / Be willing to' },
          { zh: '同意',  py: 'tóngyì',   en: 'Agree / Consent' },
          { zh: '希望',  py: 'xīwàng',   en: 'Hope / Wish',                 note: '我希望你来 = I hope you come; 有希望 = there is hope' },
        ],
      },
      {
        id: 'h2-u4-s2', type: 'vocab', xp: 25,
        title: '负面情感', subtitle: 'Negative emotions',
        words: [
          { zh: '难过',  py: 'nánguò',   en: 'Sad / Upset',                note: 'Lit. "difficult to get through"; 很难过 = very sad' },
          { zh: '担心',  py: 'dānxīn',   en: 'Worried / Anxious',          note: '担心你 = worried about you; 别担心 = don\'t worry' },
          { zh: '害怕',  py: 'hàipà',    en: 'Afraid / Scared' },
          { zh: '生气',  py: 'shēngqì',  en: 'Angry / Mad',                note: '生气了 = got angry; 别生气 = don\'t be angry',
            funFact: '生 = "to generate" + 气 = "qi / air / vital energy" → "to generate qi". In Chinese thought, anger is your inner energy (qi) flaring up, so getting angry is literally "producing qi".' },
          { zh: '着急',  py: 'zháojí',   en: 'Anxious / In a hurry / Flustered', note: '别着急 = don\'t panic; 很着急 = very anxious' },
          { zh: '失望',  py: 'shīwàng',  en: 'Disappointed' },
          { zh: '后悔',  py: 'hòuhuǐ',   en: 'Regret / Feel sorry' },
          { zh: '伤心',  py: 'shāngxīn', en: 'Heartbroken / Deeply sad',   note: 'Deeper than 难过; 伤心地哭 = cry heartbrokenly' },
        ],
      },
      {
        id: 'h2-u4-s3', type: 'grammar', xp: 30,
        title: '语法：因为…所以', subtitle: 'Explaining reasons',
        grammarPoints: [
          {
            pattern: '因为 + Reason, 所以 + Result  (because... therefore...)',
            explanation: '因为 (yīnwèi) = "because." 所以 (suǒyǐ) = "therefore / so." They often appear as a pair but one can be omitted. 所以 follows the result clause; 因为 introduces the reason.',
            examples: [
              { zh: '因为下雨，所以我们不去了。', py: 'Yīnwèi xià yǔ, suǒyǐ wǒmen bù qù le.',        en: "Because it's raining, we're not going." },
              { zh: '因为他生病，所以没来上班。', py: 'Yīnwèi tā shēng bìng, suǒyǐ méi lái shàng bān.', en: "Because he is sick, he didn't come to work." },
              { zh: '我很担心，因为她一个人在家。', py: 'Wǒ hěn dānxīn, yīnwèi tā yīgè rén zài jiā.', en: "I'm worried because she's home alone." },
            ],
            fillBlanks: [
              { sentence_zh: '___下雨，所以我不去了。', sentence_en: '___ it rains, so I\'m not going.',      options: ['因为', '所以', '虽然', '如果'], correct: 0 },
              { sentence_zh: '因为他生病，___没来。',   sentence_en: 'Because he\'s sick, ___ he didn\'t come.', options: ['因为', '所以', '也', '都'],  correct: 1 },
              { sentence_zh: '___天气好，我们出去了。', sentence_en: '___ the weather was nice, we went out.',  options: ['所以', '因为', '也', '都'],  correct: 1 },
              { sentence_zh: '因为很累，___早点睡了。', sentence_en: 'Because tired, ___ went to bed early.',   options: ['所以', '也', '都', '很'],   correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h2-u4-s4', type: 'grammar', xp: 30,
        title: '语法：如果…就', subtitle: 'Conditional sentences',
        grammarPoints: [
          {
            pattern: '如果 + Condition, 就 + Result  (If..., then...)',
            explanation: '如果 (rúguǒ) = "if." 就 (jiù) = "then" as a result. Together they form conditionals. 就 shows the immediate, certain consequence. Can use 如果 alone without 就, but not 就 without a condition marker.',
            examples: [
              { zh: '如果你有问题，就来找我。',     py: 'Rúguǒ nǐ yǒu wèntí, jiù lái zhǎo wǒ.',       en: 'If you have questions, come find me.' },
              { zh: '如果明天下雨，我们就不去了。', py: 'Rúguǒ míngtiān xià yǔ, wǒmen jiù bù qù le.', en: "If it rains tomorrow, we won't go." },
              { zh: '如果你累了，就先休息吧。',     py: 'Rúguǒ nǐ lèi le, jiù xiān xiūxi ba.',        en: "If you're tired, rest first." },
            ],
            fillBlanks: [
              { sentence_zh: '___你有问题，就来找我。',  sentence_en: '___ you have questions, come find me.', options: ['如果', '因为', '所以', '虽然'], correct: 0 },
              { sentence_zh: '如果天气好，我们___去。',  sentence_en: 'If the weather is good, we ___ go.',   options: ['也', '都', '就', '很'],         correct: 2 },
              { sentence_zh: '___他来了，我就很高兴。',  sentence_en: '___ he comes, I\'ll be happy.',        options: ['所以', '如果', '因为', '虽然'],  correct: 1 },
              { sentence_zh: '如果你不喜欢，___不要买。', sentence_en: 'If you don\'t like it, ___ don\'t buy.', options: ['也', '就', '都', '很'],        correct: 1 },
            ],
          },
        ],
      },
      { id: 'h2-u4-s5', type: 'practice', xp: 35, title: '心情练习', subtitle: 'Unit 4 review' },
    ],
  },

  // ── Unit 5: 求学与工作 ──────────────────────────────────────────────────────
  {
    id: 'h2-u5', hsk_level: 2,
    title: 'Unit 5', subtitle: '求学与工作 · Study & Work Life',
    emoji: '📖', color: 'from-amber-500 to-yellow-500',
    sessions: [
      {
        id: 'h2-u5-s1', type: 'vocab', xp: 25,
        title: '校园学习', subtitle: 'Campus & study vocabulary',
        words: [
          { zh: '大学',  py: 'dàxué',    en: 'University / College' },
          { zh: '教室',  py: 'jiàoshì',  en: 'Classroom',
            funFact: '教 = "to teach" + 室 = "room" → simply "teaching room". Many Chinese place words are this transparent: 室 (room) also appears in 办公室 (office = "handle-work room").' },
          { zh: '图书馆', py: 'túshūguǎn', en: 'Library',              note: '去图书馆学习 = go study at the library',
            funFact: '图 = "pictures/charts" + 书 = "books" + 馆 = "hall" → a "hall of pictures and books". 馆 marks public buildings you visit — you\'ll also see it in 博物馆 (museum) and 饭馆 (restaurant).' },
          { zh: '作业',  py: 'zuòyè',    en: 'Homework / Assignment' },
          { zh: '考试',  py: 'kǎoshì',   en: 'Exam / Test',           note: '参加考试 = take an exam; 通过考试 = pass an exam' },
          { zh: '成绩',  py: 'chéngjì',  en: 'Grades / Score / Results' },
          { zh: '进步',  py: 'jìnbù',    en: 'Progress / Improvement', note: '有进步 = have made progress; 取得进步 = achieve progress' },
          { zh: '努力',  py: 'nǔlì',     en: 'Work hard / Make an effort', note: '努力学习 = study hard; 努力工作 = work hard' },
        ],
      },
      {
        id: 'h2-u5-s2', type: 'vocab', xp: 25,
        title: '职场生活', subtitle: 'Workplace vocabulary',
        words: [
          { zh: '公司',  py: 'gōngsī',    en: 'Company / Firm' },
          { zh: '同事',  py: 'tóngshì',   en: 'Colleague / Coworker' },
          { zh: '经理',  py: 'jīnglǐ',    en: 'Manager / Director',
            funFact: '经 = "to manage/handle" + 理 = "to put in order" → someone who "handles and orders" things: a manager. The same 理 appears in 修理 (to repair) and 道理 (reason/logic).' },
          { zh: '会议',  py: 'huìyì',     en: 'Meeting / Conference',  note: '开会议 = hold a meeting; 参加会议 = attend a meeting' },
          { zh: '认真',  py: 'rènzhēn',   en: 'Serious / Conscientious / Diligent', note: '认真做 = do seriously; 认真听 = listen attentively' },
          { zh: '成功',  py: 'chénggōng', en: 'Succeed / Success',     note: '成功了！= Succeeded!; 希望成功 = hope to succeed' },
          { zh: '问题',  py: 'wèntí',     en: 'Question / Problem',    note: '有问题吗？= Any questions?; 解决问题 = solve a problem' },
          { zh: '迟到',  py: 'chídào',    en: 'Be late / Arrive late', note: '不能迟到 = cannot be late; 迟到了 = was late' },
        ],
      },
      {
        id: 'h2-u5-s3', type: 'grammar', xp: 30,
        title: '语法：越来越', subtitle: 'Expressing a growing trend',
        grammarPoints: [
          {
            pattern: 'Subject + 越来越 + Adj/Verb  (more and more... / increasingly...)',
            explanation: '越来越 (yuèláiyuè) = "more and more / increasingly." Shows a continuously growing trend. Always followed by an adj or verb. Never pair with 很 or 太. Add 了 at end to mark the change as notable.',
            examples: [
              { zh: '我的汉语越来越好了。', py: 'Wǒ de Hànyǔ yuè lái yuè hǎo le.', en: 'My Chinese is getting better and better.' },
              { zh: '天气越来越冷了。',     py: 'Tiānqì yuè lái yuè lěng le.',       en: 'The weather is getting colder and colder.' },
              { zh: '他越来越努力了。',     py: 'Tā yuè lái yuè nǔlì le.',           en: 'He is working harder and harder.' },
            ],
            fillBlanks: [
              { sentence_zh: '我的汉语___好了。',   sentence_en: 'My Chinese is getting ___ good.',    options: ['越来越', '更', '很', '非常'],    correct: 0 },
              { sentence_zh: '天气___冷了。',       sentence_en: 'The weather is getting ___ cold.',   options: ['很', '也', '越来越', '非常'],    correct: 2 },
              { sentence_zh: '他___努力了。',       sentence_en: 'He is working ___ hard.',            options: ['越来越', '也', '很', '都'],      correct: 0 },
              { sentence_zh: '公司___大了。',       sentence_en: 'The company is getting ___ big.',    options: ['也', '越来越', '很', '就'],      correct: 1 },
            ],
          },
        ],
      },
      {
        id: 'h2-u5-s4', type: 'grammar', xp: 30,
        title: '语法：才 vs 就', subtitle: 'Timing contrast: only then vs already',
        grammarPoints: [
          {
            pattern: '才 (only then / not until) vs 就 (already / as early as / right away)',
            explanation: '才 (cái) = "only then / not until" — implies later than expected or after effort. 就 (jiù) = "already / as soon as / right away" — implies earlier than expected, or immediate sequence. Both come before the verb.',
            examples: [
              { zh: '他十点才来。',   py: 'Tā shí diǎn cái lái.',    en: 'He didn\'t come until 10 o\'clock. (late)' },
              { zh: '她七点就来了。', py: 'Tā qī diǎn jiù lái le.',  en: 'She came as early as 7 o\'clock. (early/impressive)' },
              { zh: '我做了两个小时才做完。', py: 'Wǒ zuò le liǎng xiǎoshí cái zuòwán.', en: 'It took me two hours before I finished.' },
            ],
            fillBlanks: [
              { sentence_zh: '他十点___来。',       sentence_en: 'He didn\'t arrive ___ 10 o\'clock.',      options: ['才', '就', '也', '都'],  correct: 0 },
              { sentence_zh: '她七点___来了。',     sentence_en: 'She came as early as 7 o\'clock.',        options: ['才', '就', '也', '都'],  correct: 1 },
              { sentence_zh: '我学了一年___说好。', sentence_en: 'It took a full year before I spoke well.', options: ['才', '就', '也', '还'],  correct: 0 },
              { sentence_zh: '他一看___明白了。',   sentence_en: 'He understood right as soon as he looked.', options: ['就', '才', '也', '都'], correct: 0 },
            ],
          },
        ],
      },
      { id: 'h2-u5-s5', type: 'practice', xp: 35, title: '学习工作练习', subtitle: 'Unit 5 review' },
    ],
  },

  // ── Unit 6: 出行与方向 ──────────────────────────────────────────────────────
  {
    id: 'h2-u6', hsk_level: 2,
    title: 'Unit 6', subtitle: '出行与方向 · Getting Around & Directions',
    emoji: '🚇', color: 'from-indigo-500 to-blue-500',
    sessions: [
      {
        id: 'h2-u6-s1', type: 'vocab', xp: 25,
        title: '交通工具', subtitle: 'Modes of transport',
        words: [
          { zh: '火车',   py: 'huǒchē',      en: 'Train',
            funFact: '火 = "fire" + 车 = "vehicle". The name comes from the age of steam: early trains burned coal/fire to move, so it became the "fire vehicle" — and the word stuck even now that trains run on electricity.' },
          { zh: '高铁',   py: 'gāotiě',      en: 'High-speed rail / Bullet train', note: 'China\'s famous HSR network',
            funFact: '高 = "high" + 铁 = "iron", short for 高速铁路 "high-speed iron road". 铁 (iron) is the everyday shorthand for railways — the same 铁 as in 地铁 (subway).' },
          { zh: '飞机',   py: 'fēijī',       en: 'Airplane',
            funFact: '飞 = "to fly" + 机 = "machine" → a "flying machine". 机 means machine/engine and shows up all over tech words: 手机 (phone = "hand machine"), 相机 (camera), 机器人 (robot).' },
          { zh: '地铁',   py: 'dìtiě',       en: 'Subway / Metro',
            funFact: '地 = "ground/earth" + 铁 = "iron", short for 地下铁路 "underground iron road". The "iron" is the steel rail, so a subway is literally the "underground iron (railway)".' },
          { zh: '出租车', py: 'chūzūchē',    en: 'Taxi / Cab',
            funFact: '出租 = "to rent out" + 车 = "vehicle" → a "rent-out car". A taxi is a car you rent for one trip. In casual speech people just say 打车 (dǎchē) = "hail a car".' },
          { zh: '公共汽车', py: 'gōnggòng qìchē', en: 'Public bus' },
          { zh: '骑',     py: 'qí',          en: 'Ride (bike/motorcycle)' },
          { zh: '开车',   py: 'kāi chē',     en: 'Drive (a car)' },
        ],
      },
      {
        id: 'h2-u6-s2', type: 'vocab', xp: 25,
        title: '方向与位置', subtitle: 'Direction & location words',
        words: [
          { zh: '左边', py: 'zuǒbiān',   en: 'Left side / To the left',   note: '往左边走 = walk to the left; 在左边 = on the left' },
          { zh: '右边', py: 'yòubiān',   en: 'Right side / To the right' },
          { zh: '前面', py: 'qiánmiàn',  en: 'In front / Ahead' },
          { zh: '后面', py: 'hòumiàn',   en: 'Behind / In the back' },
          { zh: '旁边', py: 'pángbiān',  en: 'Beside / Next to' },
          { zh: '附近', py: 'fùjìn',     en: 'Nearby / In the vicinity',  note: '在附近 = nearby; 附近有超市吗？= Is there a supermarket nearby?' },
          { zh: '往',   py: 'wǎng',      en: 'Towards / In the direction of', note: '往左走 = walk towards the left; 往前看 = look ahead' },
          { zh: '直走', py: 'zhí zǒu',   en: 'Go straight' },
        ],
      },
      {
        id: 'h2-u6-s3', type: 'grammar', xp: 30,
        title: '语法：已经…了', subtitle: '"Already" with 已经…了',
        grammarPoints: [
          {
            pattern: '已经 + Verb/Adj + 了  (already done / already the case)',
            explanation: '已经 (yǐjīng) = "already." The 了 at the end confirms a change of state or completed action. 已经...了 together emphasize something has happened BEFORE the expected time, or sooner than thought.',
            examples: [
              { zh: '他已经来了。',     py: 'Tā yǐjīng lái le.',           en: 'He has already come.' },
              { zh: '我已经吃饭了。',   py: 'Wǒ yǐjīng chī fàn le.',       en: 'I\'ve already eaten.' },
              { zh: '天气已经凉了。',   py: 'Tiānqì yǐjīng liáng le.',     en: 'The weather has already turned cool.' },
            ],
            fillBlanks: [
              { sentence_zh: '他___来了。',     sentence_en: 'He has ___ come.',              options: ['已经', '刚', '正在', '快要'],  correct: 0 },
              { sentence_zh: '我___吃饭了。',   sentence_en: 'I\'ve ___ eaten.',               options: ['正在', '已经', '还', '快要'],  correct: 1 },
              { sentence_zh: '她___走了，别等她了。', sentence_en: 'She has ___ left; don\'t wait.', options: ['已经', '突然', '正在', '刚'],  correct: 0 },
              { sentence_zh: '这件衣服我___买了。', sentence_en: 'I\'ve ___ bought this piece of clothing.', options: ['正在', '快要', '已经', '刚'],  correct: 2 },
            ],
          },
        ],
      },
      {
        id: 'h2-u6-s4', type: 'grammar', xp: 30,
        title: '语法：是…的', subtitle: 'Emphasizing circumstances with 是…的',
        grammarPoints: [
          {
            pattern: '是 + [When/Where/How] + Verb + 的  (emphasizing circumstances of past action)',
            explanation: '是…的 (shì…de) emphasizes HOW, WHEN, or WHERE a known action happened. The action itself is not in question — the focus is on the circumstances. 是 can be omitted in speech. Very common in questions: 你是怎么来的？',
            examples: [
              { zh: '我是坐地铁来的。',   py: 'Wǒ shì zuò dìtiě lái de.',          en: 'I came by subway. (how)' },
              { zh: '他是昨天回来的。',   py: 'Tā shì zuótiān huí lái de.',         en: 'He came back yesterday. (when)' },
              { zh: '你是在哪儿学的汉语？', py: 'Nǐ shì zài nǎr xué de Hànyǔ?',   en: 'Where did you learn Chinese? (where)' },
            ],
            fillBlanks: [
              { sentence_zh: '我___坐飞机来___。',   sentence_en: 'I came by airplane.',            options: ['是/的', '在/了', '从/到', '用/吧'], correct: 0 },
              { sentence_zh: '他___昨天回来的。',     sentence_en: 'He came back ___.',              options: ['是', '在', '从', '到'],           correct: 0 },
              { sentence_zh: '你是怎么___的？',       sentence_en: 'How did you ___?',               options: ['来', '去', '出发', '回来'],        correct: 0 },
              { sentence_zh: '她是在北京出生___。',   sentence_en: 'She was born in Beijing.',       options: ['的', '了', '着', '过'],           correct: 0 },
            ],
          },
        ],
      },
      { id: 'h2-u6-s5', type: 'practice', xp: 40, title: '出行练习', subtitle: 'Unit 6 review' },
    ],
  },

  // ── Unit 7: 饮食文化 ──────────────────────────────────────────────────────
  {
    id: 'h2-u7', hsk_level: 2,
    title: 'Unit 7', subtitle: '饮食文化 · Food & Dining Culture',
    emoji: '🍜', color: 'from-orange-500 to-amber-500',
    sessions: [
      {
        id: 'h2-u7-s1', type: 'vocab', xp: 25,
        title: '食物饮品', subtitle: 'Foods & beverages',
        words: [
          { zh: '西瓜', py: 'xīguā',   en: 'Watermelon' },
          { zh: '鱼',   py: 'yú',      en: 'Fish' },
          { zh: '鸡蛋', py: 'jīdàn',   en: 'Egg',                   note: '鸡 = chicken; 蛋 = egg' },
          { zh: '面包', py: 'miànbāo', en: 'Bread' },
          { zh: '饺子', py: 'jiǎozi',  en: 'Dumpling',              note: '包饺子 = make dumplings; 一个饺子 = one dumpling' },
          { zh: '啤酒', py: 'píjiǔ',   en: 'Beer' },
          { zh: '果汁', py: 'guǒzhī',  en: 'Fruit juice',           note: '橙汁 = orange juice; 苹果汁 = apple juice' },
          { zh: '饮料', py: 'yǐnliào', en: 'Beverage / Drink (general)' },
        ],
      },
      {
        id: 'h2-u7-s2', type: 'vocab', xp: 25,
        title: '口味与状态', subtitle: 'Tastes & hunger/thirst states',
        words: [
          { zh: '甜',  py: 'tián',  en: 'Sweet' },
          { zh: '咸',  py: 'xián',  en: 'Salty' },
          { zh: '辣',  py: 'là',    en: 'Spicy / Hot',             note: '很辣！= Very spicy!; 不能吃辣 = can\'t eat spicy food' },
          { zh: '酸',  py: 'suān',  en: 'Sour' },
          { zh: '饱',  py: 'bǎo',   en: 'Full (after eating)',     note: '吃饱了 = have eaten one\'s fill' },
          { zh: '饿',  py: 'è',     en: 'Hungry' },
          { zh: '渴',  py: 'kě',    en: 'Thirsty' },
          { zh: '香',  py: 'xiāng', en: 'Fragrant / Delicious-smelling', note: '好香！= Smells so good!' },
        ],
      },
      {
        id: 'h2-u7-s3', type: 'grammar', xp: 30,
        title: '语法：还是（选择问句）', subtitle: 'Choice questions with 还是',
        grammarPoints: [
          {
            pattern: 'A 还是 B？  (Is it A or is it B? — choice question)',
            explanation: '还是 (háishi) in questions = "or" — offers two alternatives for the listener to choose. Answer by repeating one choice. Different from 或者 (or in statements). 还是 can also mean "had better" in suggestions: 还是不去了 = we\'d better not go.',
            examples: [
              { zh: '你喝茶还是咖啡？',     py: 'Nǐ hē chá háishi kāfēi?',         en: 'Do you want tea or coffee?' },
              { zh: '你吃米饭还是面条？',   py: 'Nǐ chī mǐfàn háishi miàntiáo?',   en: 'Do you want rice or noodles?' },
              { zh: '你喜欢甜的还是辣的？', py: 'Nǐ xǐhuān tián de háishi là de?', en: 'Do you like sweet or spicy?' },
            ],
            fillBlanks: [
              { sentence_zh: '你喝茶___咖啡？',   sentence_en: 'Do you want tea ___ coffee?',       options: ['还是', '和', '或者', '但是'],  correct: 0 },
              { sentence_zh: '你吃米饭___面条？', sentence_en: 'Do you want rice ___ noodles?',     options: ['因为', '和', '还是', '也'],    correct: 2 },
              { sentence_zh: '他是中国人___外国人？', sentence_en: 'Is he Chinese ___ a foreigner?', options: ['也', '和', '都', '还是'],     correct: 3 },
              { sentence_zh: '你要甜的___辣的？', sentence_en: 'Do you want sweet ___ spicy food?', options: ['还是', '因为', '所以', '就'],  correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h2-u7-s4', type: 'grammar', xp: 30,
        title: '语法：一共/多少', subtitle: 'Totals and asking amounts',
        grammarPoints: [
          {
            pattern: '一共 + Number + MW  (altogether / in total) + 多少 + 钱/词 (how much/many)',
            explanation: '一共 (yīgòng) = "altogether / in total." Used for counts and prices: 一共多少钱？= How much in total? 多少 (duōshao) = "how much / how many" (for any uncertain quantity).',
            examples: [
              { zh: '一共多少钱？',     py: 'Yīgòng duōshao qián?',      en: 'How much is it in total?' },
              { zh: '我们一共五个人。', py: 'Wǒmen yīgòng wǔ gè rén.',   en: 'There are five of us in total.' },
              { zh: '你喝了多少杯？',   py: 'Nǐ hē le duōshao bēi?',     en: 'How many cups did you drink?' },
            ],
            fillBlanks: [
              { sentence_zh: '___多少钱？',       sentence_en: 'How much is it ___?',            options: ['一共', '多少', '几个', '什么'],   correct: 0 },
              { sentence_zh: '我们___五个人。',   sentence_en: 'There are five of us ___.',       options: ['一共', '都是', '共同', '有'],     correct: 0 },
              { sentence_zh: '你吃了___个饺子？', sentence_en: 'How ___ dumplings did you eat?', options: ['多少', '一共', '几', '什么'],     correct: 0 },
              { sentence_zh: '这些___二十块钱。', sentence_en: 'All of these ___ 20 yuan.',       options: ['一共', '都', '全', '总共'],       correct: 0 },
            ],
          },
        ],
      },
      { id: 'h2-u7-s5', type: 'practice', xp: 35, title: '饮食练习', subtitle: 'Unit 7 review' },
    ],
  },

  // ── Unit 8: 四季与天气 ──────────────────────────────────────────────────────
  {
    id: 'h2-u8', hsk_level: 2,
    title: 'Unit 8', subtitle: '四季与天气 · Seasons & Weather',
    emoji: '🌤️', color: 'from-sky-500 to-cyan-500',
    sessions: [
      {
        id: 'h2-u8-s1', type: 'vocab', xp: 25,
        title: '四季', subtitle: 'The four seasons',
        words: [
          { zh: '春天', py: 'chūntiān',  en: 'Spring',                 note: '春天来了 = spring is here' },
          { zh: '夏天', py: 'xiàtiān',   en: 'Summer' },
          { zh: '秋天', py: 'qiūtiān',   en: 'Autumn / Fall' },
          { zh: '冬天', py: 'dōngtiān',  en: 'Winter' },
          { zh: '季节', py: 'jìjié',     en: 'Season',                note: '最喜欢的季节 = favourite season' },
          { zh: '暖和', py: 'nuǎnhuo',   en: 'Warm (pleasantly)',     note: '天气很暖和 = the weather is pleasantly warm' },
          { zh: '凉快', py: 'liángkuai', en: 'Cool / Pleasantly cool', note: '秋天很凉快 = autumn is pleasantly cool' },
          { zh: '冷',   py: 'lěng',      en: 'Cold',                  note: '今天很冷 = it\'s cold today; 感冒 = catch a cold' },
        ],
      },
      {
        id: 'h2-u8-s2', type: 'vocab', xp: 25,
        title: '天气状况', subtitle: 'Weather conditions',
        words: [
          { zh: '天气', py: 'tiānqì',    en: 'Weather' },
          { zh: '晴',   py: 'qíng',      en: 'Sunny / Clear',         note: '晴天 = sunny day; 晴朗 = clear and bright' },
          { zh: '阴',   py: 'yīn',       en: 'Overcast / Cloudy',     note: '阴天 = overcast day' },
          { zh: '下雨', py: 'xià yǔ',    en: 'To rain',               note: '下雨了 = it\'s raining; 下大雨 = heavy rain' },
          { zh: '下雪', py: 'xià xuě',   en: 'To snow' },
          { zh: '刮风', py: 'guā fēng',  en: 'To be windy / Wind blows', note: '刮大风 = strong wind is blowing' },
          { zh: '云',   py: 'yún',       en: 'Cloud' },
          { zh: '温度', py: 'wēndù',     en: 'Temperature',           note: '温度很高/低 = high/low temperature; 零下温度 = sub-zero' },
        ],
      },
      {
        id: 'h2-u8-s3', type: 'grammar', xp: 30,
        title: '语法：快要…了', subtitle: 'Something is about to happen',
        grammarPoints: [
          {
            pattern: '快要 + Verb/Adj + 了  (about to… / almost…)',
            explanation: '快要…了 (kuài yào…le) = "about to / almost / going to happen soon." The 了 marks an imminent change. Shorter forms: 快…了, 要…了. Use 就要…了 when a time phrase is present: 明天就要出发了.',
            examples: [
              { zh: '快要下雨了。',     py: 'Kuài yào xià yǔ le.',      en: "It's about to rain." },
              { zh: '他快要毕业了。',   py: 'Tā kuài yào bìyè le.',     en: "He's about to graduate." },
              { zh: '快要冬天了。',     py: 'Kuài yào dōngtiān le.',    en: 'Winter is almost here.' },
              { zh: '明天就要出发了。', py: 'Míngtiān jiù yào chūfā le.', en: 'We\'re departing tomorrow (soon).' },
            ],
            fillBlanks: [
              { sentence_zh: '___下雨了，带雨伞吧。',   sentence_en: "It's ___ to rain; bring an umbrella.",   options: ['快要', '已经', '正在', '在'],   correct: 0 },
              { sentence_zh: '天气___变冷了。',         sentence_en: 'The weather is about to get cold.',       options: ['快要', '已经', '还', '没'],     correct: 0 },
              { sentence_zh: '他___毕业了，开始找工作。', sentence_en: 'He\'s about to graduate; starting job-hunting.',  options: ['快要', '已经', '正在', '以前'], correct: 0 },
              { sentence_zh: '___到了，快走！',         sentence_en: 'We\'re ___ there; let\'s hurry!',         options: ['快要', '就', '刚', '已经'],     correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h2-u8-s4', type: 'grammar', xp: 30,
        title: '语法：一…就', subtitle: 'Immediate sequence with 一…就',
        grammarPoints: [
          {
            pattern: '一 + V1 + 就 + V2  (As soon as V1, then V2)',
            explanation: '一 (yī) before a verb = "as soon as / once." 就 (jiù) introduces the immediate consequence. Two events happen in tight sequence. The 就 clause is nearly automatic or habitual.',
            examples: [
              { zh: '一下班就回家。',     py: 'Yī xià bān jiù huí jiā.',      en: 'As soon as I get off work, I go home.' },
              { zh: '我一到家就吃饭。',   py: 'Wǒ yī dào jiā jiù chī fàn.',   en: 'As soon as I get home, I eat.' },
              { zh: '天一冷，他就感冒。', py: 'Tiān yī lěng, tā jiù gǎnmào.', en: 'As soon as it gets cold, he catches a cold.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___下班就回家。',     sentence_en: 'As ___ as I get off work, I go home.',    options: ['一', '已经', '先', '然后'], correct: 0 },
              { sentence_zh: '一到家___吃饭。',       sentence_en: 'As soon as (I) get home, ___ eat.',       options: ['就', '先', '再', '然后'],   correct: 0 },
              { sentence_zh: '天___冷，就感冒了。',   sentence_en: 'As ___ as it turns cold, got a cold.',    options: ['一', '就', '已经', '再'],   correct: 0 },
              { sentence_zh: '她___到机场就打电话。', sentence_en: 'As soon as she reached the airport, called.', options: ['一', '就', '先', '再'],  correct: 0 },
            ],
          },
        ],
      },
      { id: 'h2-u8-s5', type: 'practice', xp: 35, title: '天气季节练习', subtitle: 'Unit 8 review' },
    ],
  },

  // ── Unit 9: 购物与消费 ──────────────────────────────────────────────────────
  {
    id: 'h2-u9', hsk_level: 2,
    title: 'Unit 9', subtitle: '购物与消费 · Shopping & Spending',
    emoji: '🛍️', color: 'from-pink-500 to-rose-500',
    sessions: [
      {
        id: 'h2-u9-s1', type: 'vocab', xp: 25,
        title: '颜色', subtitle: 'Colors',
        words: [
          { zh: '颜色', py: 'yánsè',  en: 'Color',     note: '什么颜色？= What color?',
            funFact: '颜 originally meant "face / complexion" and 色 meant "look on the face". Together they first described the color of one\'s face, then broadened to mean "color" in general.' },
          { zh: '红',   py: 'hóng',   en: 'Red',       note: '红色 = the color red; 红灯 = red light' },
          { zh: '黄',   py: 'huáng',  en: 'Yellow' },
          { zh: '蓝',   py: 'lán',    en: 'Blue' },
          { zh: '绿',   py: 'lǜ',     en: 'Green',     note: '绿灯 = green light; 绿色 = green color' },
          { zh: '白',   py: 'bái',    en: 'White' },
          { zh: '黑',   py: 'hēi',    en: 'Black' },
          { zh: '粉红', py: 'fěnhóng', en: 'Pink',     note: '粉红色 = pink color; 浅粉 = light pink' },
        ],
      },
      {
        id: 'h2-u9-s2', type: 'vocab', xp: 25,
        title: '购物消费', subtitle: 'Shopping & payment vocabulary',
        words: [
          { zh: '便宜',  py: 'piányí',   en: 'Cheap / Inexpensive' },
          { zh: '贵',    py: 'guì',      en: 'Expensive' },
          { zh: '价格',  py: 'jiàgé',    en: 'Price',               note: '价格怎么样？= How\'s the price?; 价格太贵 = too expensive' },
          { zh: '付钱',  py: 'fùqián',   en: 'To pay',              note: '付现金 = pay cash; 用手机付钱 = pay by phone' },
          { zh: '找钱',  py: 'zhǎoqián', en: 'To give change',      note: '找你五块钱 = here\'s five yuan change' },
          { zh: '打折',  py: 'dǎzhé',    en: 'Discount / On sale',  note: '打八折 = 20% off (80% of price); 打折了！= On sale!' },
          { zh: '换',    py: 'huàn',     en: 'Exchange / Change / Replace', note: '换一件 = exchange for another; 换衣服 = change clothes' },
          { zh: '退',    py: 'tuì',      en: 'Return / Refund',     note: '退货 = return goods; 退钱 = refund money' },
        ],
      },
      {
        id: 'h2-u9-s3', type: 'grammar', xp: 30,
        title: '语法：没有…那么', subtitle: '"Not as… as" with 没有',
        grammarPoints: [
          {
            pattern: 'A + 没有 + B + (那么) + Adj  (A is not as [adj] as B)',
            explanation: '没有 (méiyǒu) creates "not as... as" comparisons. 那么 (nàme) = "that/so much" (optional). This is the negative version of 比 comparisons. Note: 没有 here means "not as" — not "not have."',
            examples: [
              { zh: '这件衣服没有那件贵。',   py: 'Zhè jiàn yīfu méiyǒu nà jiàn guì.',     en: 'This clothing is not as expensive as that one.' },
              { zh: '今天没有昨天那么冷。',   py: 'Jīntiān méiyǒu zuótiān nàme lěng.',     en: 'Today is not as cold as yesterday.' },
              { zh: '他的汉语没有我说得好。', py: 'Tā de Hànyǔ méiyǒu wǒ shuō de hǎo.',   en: 'His Chinese is not spoken as well as mine.' },
            ],
            fillBlanks: [
              { sentence_zh: '这件___那件贵。',       sentence_en: 'This one is not as expensive as that.',  options: ['没有', '比', '很', '也'],  correct: 0 },
              { sentence_zh: '今天___昨天那么冷。',   sentence_en: 'Today is not as cold as yesterday.',     options: ['比', '没有', '也', '还'],  correct: 1 },
              { sentence_zh: '他的汉语___我说得好。', sentence_en: 'His Chinese is not as good as mine.',    options: ['没有', '比', '也', '不'],  correct: 0 },
              { sentence_zh: '这家店___那家便宜。',   sentence_en: 'This shop is not as cheap as that one.', options: ['没有', '比', '和', '跟'],  correct: 0 },
            ],
          },
        ],
      },
      {
        id: 'h2-u9-s4', type: 'grammar', xp: 30,
        title: '语法：让', subtitle: 'Causative sentences with 让',
        grammarPoints: [
          {
            pattern: '让 + Person + Verb  (let / allow / make someone do something)',
            explanation: '让 (ràng) = "let / allow / make." It introduces causative structures. Can express permission (让我去 = let me go), instruction (妈妈让我睡觉 = Mom told me to sleep), or cause (这让我很开心 = this makes me very happy).',
            examples: [
              { zh: '请让我过去。',       py: 'Qǐng ràng wǒ guòqù.',             en: 'Please let me through.' },
              { zh: '妈妈让我早点睡。',   py: 'Māma ràng wǒ zǎo diǎn shuì.',    en: 'Mom told/made me sleep early.' },
              { zh: '这件事让我很担心。', py: 'Zhè jiàn shì ràng wǒ hěn dānxīn.', en: 'This matter makes me very worried.' },
            ],
            fillBlanks: [
              { sentence_zh: '妈妈___我早点睡。',   sentence_en: 'Mom ___ me to sleep early.',     options: ['让', '叫', '使', '把'],   correct: 0 },
              { sentence_zh: '请___我过去一下。',   sentence_en: 'Please ___ me through.',         options: ['让', '叫', '给', '把'],   correct: 0 },
              { sentence_zh: '这件事___我很担心。', sentence_en: 'This matter ___ me very worried.', options: ['让', '叫', '使', '把'],  correct: 0 },
              { sentence_zh: '老师___我们练习。',   sentence_en: 'The teacher ___ us practice.',   options: ['让', '叫', '跟', '给'],   correct: 0 },
            ],
          },
        ],
      },
      { id: 'h2-u9-s5', type: 'practice', xp: 35, title: '购物练习', subtitle: 'Unit 9 review' },
    ],
  },

  // ── Unit 10: 运动与娱乐 ─────────────────────────────────────────────────────
  {
    id: 'h2-u10', hsk_level: 2,
    title: 'Unit 10', subtitle: '运动与娱乐 · Sports & Entertainment',
    emoji: '🏃', color: 'from-teal-500 to-green-500',
    sessions: [
      {
        id: 'h2-u10-s1', type: 'vocab', xp: 25,
        title: '体育运动', subtitle: 'Sports & physical activities',
        words: [
          { zh: '游泳', py: 'yóuyǒng', en: 'To swim / Swimming',          note: '游泳池 = swimming pool; 去游泳 = go swimming' },
          { zh: '跑步', py: 'pǎobù',   en: 'To jog / Run',                note: '每天跑步 = jog every day' },
          { zh: '踢球', py: 'tī qiú',  en: 'Kick a ball / Play football', note: '踢足球 = play football/soccer' },
          { zh: '打球', py: 'dǎ qiú',  en: 'Play ball (hit-type sports)',  note: '打篮球/乒乓球/网球 = basketball/ping-pong/tennis' },
          { zh: '爬山', py: 'páshān',  en: 'Hike / Climb a mountain' },
          { zh: '跳舞', py: 'tiàowǔ',  en: 'To dance' },
          { zh: '运动', py: 'yùndòng', en: 'Exercise / Sport / Physical activity', note: '做运动 = do exercise; 体育运动 = sports' },
          { zh: '比赛', py: 'bǐsài',   en: 'Competition / Match / Contest', note: '参加比赛 = join a competition; 赢了比赛 = won' },
        ],
      },
      {
        id: 'h2-u10-s2', type: 'vocab', xp: 25,
        title: '文化娱乐', subtitle: 'Culture & entertainment',
        words: [
          { zh: '唱歌',  py: 'chànggē', en: 'To sing',                     note: '去KTV唱歌 = go sing at KTV' },
          { zh: '故事',  py: 'gùshi',   en: 'Story',                        note: '讲故事 = tell a story; 听故事 = listen to a story' },
          { zh: '爱好',  py: 'àihào',   en: 'Hobby / Interest',             note: '你有什么爱好？= What are your hobbies?' },
          { zh: '有意思', py: 'yǒu yìsi', en: 'Interesting / Fun',          note: '这很有意思 = this is interesting' },
          { zh: '没意思', py: 'méi yìsi', en: 'Boring / Not interesting',   note: '这没意思 = this is boring' },
          { zh: '遇见',  py: 'yùjiàn',  en: 'To meet (by chance) / Run into', note: '遇见老朋友 = ran into an old friend' },
          { zh: '节日',  py: 'jiérì',   en: 'Festival / Holiday',           note: '过节日 = celebrate a holiday; 春节 = Spring Festival' },
          { zh: '照片',  py: 'zhàopiàn', en: 'Photo / Picture',             note: '拍照片 = take a photo; 看照片 = look at photos' },
        ],
      },
      {
        id: 'h2-u10-s3', type: 'grammar', xp: 30,
        title: '语法：虽然…但是', subtitle: 'Expressing contrast with 虽然…但是',
        grammarPoints: [
          {
            pattern: '虽然 + Situation, 但是 + Contrast  (Although…, but…)',
            explanation: '虽然 (suīrán) = "although." 但是 (dànshì) = "but / however." Acknowledges one fact while introducing a different or unexpected result. Either word can appear in separate clauses. Often 虽然 is omitted and 但是 carries the contrast alone.',
            examples: [
              { zh: '虽然很累，但是他还是去运动了。', py: 'Suīrán hěn lèi, dànshì tā hái shì qù yùndòng le.', en: 'Although very tired, he still went to exercise.' },
              { zh: '这道题虽然难，但是很有趣。',     py: 'Zhè dào tí suīrán nán, dànshì hěn yǒuqù.',         en: 'This problem is difficult, but very interesting.' },
              { zh: '虽然下雨，但是他们还是比赛了。', py: 'Suīrán xià yǔ, dànshì tāmen háishi bǐsài le.',      en: 'Although it rained, they still held the match.' },
            ],
            fillBlanks: [
              { sentence_zh: '___很累，但是还是去了。',   sentence_en: '___ very tired, but still went.',       options: ['虽然', '因为', '所以', '如果'],  correct: 0 },
              { sentence_zh: '虽然很贵，___他还是买了。', sentence_en: 'Although expensive, ___ he still bought it.', options: ['而且', '但是', '所以', '因为'], correct: 1 },
              { sentence_zh: '这本书___难，但是很有用。', sentence_en: 'This book ___ difficult, but very useful.', options: ['但是', '虽然', '所以', '如果'],   correct: 1 },
              { sentence_zh: '虽然比赛输了，___很高兴。', sentence_en: 'Although lost the match, ___ still happy.', options: ['所以', '但是', '因为', '虽然'],   correct: 1 },
            ],
          },
        ],
      },
      {
        id: 'h2-u10-s4', type: 'grammar', xp: 35,
        title: '语法：从来不/没', subtitle: '"Never" with 从来',
        grammarPoints: [
          {
            pattern: '从来不 + Verb (habitually never) / 从来没 + Verb + 过 (have never experienced)',
            explanation: '从来不 (cónglái bù) = "never (by habit)" — an ongoing pattern. 从来没…过 (cónglái méi…guò) = "have never (done in one\'s life)" — an experiential negative. 从来 = "at any time / ever."',
            examples: [
              { zh: '我从来不吃辣的。',     py: 'Wǒ cónglái bù chī là de.',         en: 'I never eat spicy food (habit).' },
              { zh: '他从来没去过北京。',   py: 'Tā cónglái méi qù guò Běijīng.',    en: 'He has never been to Beijing (experience).' },
              { zh: '她从来不迟到。',       py: 'Tā cónglái bù chídào.',             en: 'She is never late.' },
            ],
            fillBlanks: [
              { sentence_zh: '我___不吃辣的。',         sentence_en: 'I ___ eat spicy food.',                  options: ['从来', '总是', '有时候', '经常'],  correct: 0 },
              { sentence_zh: '他从来没___过北京。',     sentence_en: 'He has never ___ to Beijing.',            options: ['去', '来', '到', '看'],           correct: 0 },
              { sentence_zh: '她___不迟到。',           sentence_en: 'She is ___ late.',                       options: ['从来', '有时候', '经常', '总是'],  correct: 0 },
              { sentence_zh: '我从来没参加过___比赛。', sentence_en: 'I have never participated in a ___ match.', options: ['这种', '一个', '很多', '什么'],   correct: 0 },
            ],
          },
        ],
      },
      { id: 'h2-u10-s5', type: 'practice', xp: 50, title: 'HSK 2 总复习', subtitle: 'HSK 2 final grand review' },
    ],
  },
]
