import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { learningApi } from '@/services/api'
import { HanziWord } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import AudioButton from '@/components/AudioButton'
import StrokeOrderDisplay from '@/components/StrokeOrderDisplay'
import VocabularyImage from '@/components/VocabularyImage'
import CharacterEtymology from '@/components/CharacterEtymology'
import {
  RefreshCw,
  Target,
  CheckCircle,
  XCircle,
  ArrowRight,
  BookOpen,
  Trophy,
  Flame,
  Dumbbell,
  Zap,
  Rocket,
  Star,
  Sparkles,
  Gem,
  Eye,
  PenLine,
  History
} from 'lucide-react'
import { toast } from 'react-hot-toast'

type LearningMode = 'learn' | 'review' | 'test'
type QuestionType = 'recognition' | 'meaning' | 'pinyin'

interface Question {
  word: HanziWord
  type: QuestionType
  options: string[]
  correctAnswer: number
}

// Motivational messages for breaks (youth-friendly!)
const MOTIVATIONAL_MESSAGES = [
  {
    Icon: Flame,
    iconClass: 'text-orange-500',
    title: 'You\'re on fire!',
    message: 'Keep up the amazing work! Your Chinese is getting better with every answer.',
    color: 'from-orange-400 to-red-500'
  },
  {
    Icon: Dumbbell,
    iconClass: 'text-purple-500',
    title: 'Beast mode activated!',
    message: 'You\'re crushing it! Remember, every character you learn makes you stronger.',
    color: 'from-purple-400 to-pink-500'
  },
  {
    Icon: Zap,
    iconClass: 'text-yellow-500',
    title: 'Power up!',
    message: 'Your brain is leveling up! Take a deep breath and keep going.',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    Icon: Rocket,
    iconClass: 'text-blue-500',
    title: 'To the moon!',
    message: 'Your progress is out of this world! The Chinese language is yours to conquer.',
    color: 'from-blue-400 to-purple-500'
  },
  {
    Icon: Target,
    iconClass: 'text-green-500',
    title: 'Right on target!',
    message: 'Your focus is incredible! Keep that energy going - you got this!',
    color: 'from-green-400 to-blue-500'
  },
  {
    Icon: Star,
    iconClass: 'text-yellow-400',
    title: 'Superstar alert!',
    message: 'You\'re absolutely killing it! Every question brings you closer to fluency.',
    color: 'from-yellow-400 to-pink-500'
  },
  {
    Icon: Sparkles,
    iconClass: 'text-cyan-500',
    title: 'Shining bright!',
    message: 'Your dedication is inspiring! Keep shining and learning!',
    color: 'from-cyan-400 to-blue-500'
  },
  {
    Icon: Gem,
    iconClass: 'text-indigo-500',
    title: 'Diamond in the making!',
    message: 'Pressure makes diamonds, and you\'re forming into something brilliant!',
    color: 'from-indigo-400 to-purple-500'
  }
]

// Helper function to generate example sentences
const getExampleSentence = (word: HanziWord): { chinese: string; pinyin: string; english: string } => {
  // Common example patterns for HSK 1-3 words
  const examplePatterns: Record<string, { chinese: string; pinyin: string; english: string }> = {
    '我': { chinese: '我是学生。', pinyin: 'Wǒ shì xuéshēng.', english: 'I am a student.' },
    '你': { chinese: '你好吗？', pinyin: 'Nǐ hǎo ma?', english: 'How are you?' },
    '他': { chinese: '他是老师。', pinyin: 'Tā shì lǎoshī.', english: 'He is a teacher.' },
    '她': { chinese: '她很漂亮。', pinyin: 'Tā hěn piàoliang.', english: 'She is beautiful.' },
    '的': { chinese: '我的书', pinyin: 'wǒ de shū', english: 'my book' },
    '是': { chinese: '这是我的家。', pinyin: 'Zhè shì wǒ de jiā.', english: 'This is my home.' },
    '不': { chinese: '我不喜欢。', pinyin: 'Wǒ bù xǐhuan.', english: 'I don\'t like it.' },
    '了': { chinese: '我吃了饭。', pinyin: 'Wǒ chī le fàn.', english: 'I ate.' },
    '在': { chinese: '我在家。', pinyin: 'Wǒ zài jiā.', english: 'I am at home.' },
    '有': { chinese: '我有一本书。', pinyin: 'Wǒ yǒu yī běn shū.', english: 'I have a book.' },
    '人': { chinese: '很多人在这里。', pinyin: 'Hěn duō rén zài zhèlǐ.', english: 'Many people are here.' },
    '中国': { chinese: '我来自中国。', pinyin: 'Wǒ láizì Zhōngguó.', english: 'I am from China.' },
    '好': { chinese: '今天天气很好。', pinyin: 'Jīntiān tiānqì hěn hǎo.', english: 'The weather is nice today.' },
    '大': { chinese: '这个房子很大。', pinyin: 'Zhège fángzi hěn dà.', english: 'This house is big.' },
    '小': { chinese: '我有一个小狗。', pinyin: 'Wǒ yǒu yī gè xiǎo gǒu.', english: 'I have a small dog.' },
    '学习': { chinese: '我每天学习中文。', pinyin: 'Wǒ měitiān xuéxí Zhōngwén.', english: 'I study Chinese every day.' },
    '喜欢': { chinese: '我喜欢看书。', pinyin: 'Wǒ xǐhuan kànshū.', english: 'I like reading.' },
    '吃': { chinese: '我喜欢吃中国菜。', pinyin: 'Wǒ xǐhuan chī Zhōngguó cài.', english: 'I like to eat Chinese food.' },
    '喝': { chinese: '我想喝水。', pinyin: 'Wǒ xiǎng hē shuǐ.', english: 'I want to drink water.' },
    '看': { chinese: '我在看电影。', pinyin: 'Wǒ zài kàn diànyǐng.', english: 'I am watching a movie.' },
  }

  // Check if we have a predefined example
  if (examplePatterns[word.simplified]) {
    return examplePatterns[word.simplified]
  }

  // Generate contextual examples based on category
  const category = word.category?.toLowerCase() || ''
  const hanzi = word.simplified
  const pinyin = word.pinyin
  const english = word.english.toLowerCase()

  // Time-related words
  if (category.includes('time') || ['天', '年', '月', '日', '时', '分', '秒', '今天', '明天', '昨天', '现在', '以前', '以后'].includes(hanzi)) {
    return { chinese: `${hanzi}很重要。`, pinyin: `${pinyin.charAt(0).toUpperCase() + pinyin.slice(1)} hěn zhòngyào.`, english: `${english.charAt(0).toUpperCase() + english.slice(1)} is important.` }
  }

  // Numbers
  if (category.includes('number') || ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万'].includes(hanzi)) {
    return { chinese: `我有${hanzi}个。`, pinyin: `Wǒ yǒu ${pinyin} gè.`, english: `I have ${english}.` }
  }

  // Food & Drinks
  if (category.includes('food') || category.includes('drink') || ['饭', '菜', '肉', '鱼', '茶', '咖啡', '水', '酒', '奶', '面', '米'].includes(hanzi)) {
    return { chinese: `我想吃${hanzi}。`, pinyin: `Wǒ xiǎng chī ${pinyin}.`, english: `I want to eat ${english}.` }
  }

  // Verbs
  if (category.includes('verb') || ['去', '来', '做', '说', '买', '卖', '用', '想', '知道', '认识', '工作', '学', '教', '玩', '走', '跑', '坐', '站', '睡', '起', '开', '关'].includes(hanzi)) {
    return { chinese: `我想${hanzi}。`, pinyin: `Wǒ xiǎng ${pinyin}.`, english: `I want to ${english}.` }
  }

  // Adjectives
  if (category.includes('adj') || ['高', '矮', '胖', '瘦', '长', '短', '新', '旧', '快', '慢', '远', '近', '多', '少', '热', '冷', '贵', '便宜', '忙', '累', '饿', '渴', '冷', '热'].includes(hanzi)) {
    return { chinese: `这个很${hanzi}。`, pinyin: `Zhège hěn ${pinyin}.`, english: `This is very ${english}.` }
  }

  // Places
  if (category.includes('place') || category.includes('location') || ['家', '学校', '公司', '医院', '银行', '店', '饭店', '酒店', '机场', '车站', '公园', '图书馆'].includes(hanzi)) {
    return { chinese: `我在${hanzi}。`, pinyin: `Wǒ zài ${pinyin}.`, english: `I am at ${english}.` }
  }

  // People & Relationships
  if (category.includes('people') || category.includes('family') || ['爸爸', '妈妈', '哥哥', '姐姐', '弟弟', '妹妹', '老师', '学生', '医生', '朋友', '同学'].includes(hanzi)) {
    return { chinese: `他是我的${hanzi}。`, pinyin: `Tā shì wǒ de ${pinyin}.`, english: `He is my ${english}.` }
  }

  // Body parts
  if (category.includes('body') || ['手', '脚', '头', '眼睛', '耳朵', '鼻子', '嘴', '牙', '心', '肚子', '腿', '胳膊'].includes(hanzi)) {
    return { chinese: `我的${hanzi}疼。`, pinyin: `Wǒ de ${pinyin} téng.`, english: `My ${english} hurts.` }
  }

  // Colors
  if (category.includes('color') || ['红', '黄', '蓝', '绿', '黑', '白', '灰', '紫', '粉', '棕'].includes(hanzi)) {
    return { chinese: `我喜欢${hanzi}色。`, pinyin: `Wǒ xǐhuan ${pinyin}sè.`, english: `I like ${english}.` }
  }

  // Weather
  if (category.includes('weather') || ['雨', '雪', '风', '云', '晴', '阴', '天气'].includes(hanzi)) {
    return { chinese: `今天${hanzi}很大。`, pinyin: `Jīntiān ${pinyin} hěn dà.`, english: `There is a lot of ${english} today.` }
  }

  // Default varied patterns (rotate through different structures)
  const hash = hanzi.charCodeAt(0) % 5
  const patterns = [
    { chinese: `我很喜欢${hanzi}。`, pinyin: `Wǒ hěn xǐhuan ${pinyin}.`, english: `I really like ${english}.` },
    { chinese: `这个${hanzi}很好。`, pinyin: `Zhège ${pinyin} hěn hǎo.`, english: `This ${english} is good.` },
    { chinese: `你有${hanzi}吗？`, pinyin: `Nǐ yǒu ${pinyin} ma?`, english: `Do you have ${english}?` },
    { chinese: `我想要${hanzi}。`, pinyin: `Wǒ xiǎng yào ${pinyin}.`, english: `I want ${english}.` },
    { chinese: `${hanzi}在哪里？`, pinyin: `${pinyin.charAt(0).toUpperCase() + pinyin.slice(1)} zài nǎlǐ?`, english: `Where is ${english}?` }
  ]
  
  return patterns[hash]
}

// Helper function to get radical breakdown
const getRadicalBreakdown = (word: HanziWord): { radical: string; meaning: string; story: string } | null => {
  const radicals: Record<string, { radical: string; meaning: string; story: string }> = {
    // Pronouns & People
    '我': { radical: '手 (shǒu) + 戈 (gē)', meaning: 'hand + weapon', story: 'Picture a warrior holding their weapon = "I"' },
    '你': { radical: '亻(person) + 尔', meaning: 'person + you', story: 'Person radical shows this relates to people' },
    '他': { radical: '亻(person) + 也', meaning: 'person + also', story: 'Person + also = he/him' },
    '她': { radical: '女 (nǚ) + 也', meaning: 'woman + also', story: 'Woman + also = she/her' },
    '们': { radical: '亻(person) + 门', meaning: 'person + door', story: 'Person + gate = people (plural marker)' },
    '人': { radical: '人', meaning: 'person (pictograph)', story: 'Two legs walking = person' },

    // Family
    '妈': { radical: '女 (nǚ) + 马 (mǎ)', meaning: 'woman + horse', story: 'Woman + 马 (sound) = mother' },
    '爸': { radical: '父 (fù) + 巴', meaning: 'father + ba', story: 'Father + 巴 (sound) = dad' },
    '哥': { radical: '可 + 可', meaning: 'two "can"', story: 'Double "can" = older brother (capable x2)' },
    '姐': { radical: '女 + 且', meaning: 'woman + moreover', story: 'Woman + moreover = older sister' },
    '弟': { radical: '丷 + 弓', meaning: 'two dots + bow', story: 'Young person with bow = younger brother' },
    '妹': { radical: '女 + 未', meaning: 'woman + not yet', story: 'Young woman = younger sister' },

    // Particles & Common Words
    '的': { radical: '白 + 勺', meaning: 'white + ladle', story: 'White target = possessive marker' },
    '是': { radical: '日 + 正', meaning: 'sun + correct', story: 'Sun = correct/true = "to be"' },
    '不': { radical: '一 + 丿 + 卜', meaning: 'lines crossing', story: 'Crossing lines = negation, not' },
    '了': { radical: '了', meaning: 'child bent over', story: 'Completion/change particle' },
    '在': { radical: '土 + 才', meaning: 'earth + talent', story: 'Exists on earth = to be at/in' },
    '有': { radical: '月 + 又', meaning: 'moon + again', story: 'Hand grasping moon = to have' },
    '吗': { radical: '口 + 马', meaning: 'mouth + horse', story: 'Mouth (speech) = question marker' },
    '呢': { radical: '口 + 尼', meaning: 'mouth + nun', story: 'Mouth = question/mood particle' },
    '吧': { radical: '口 + 巴', meaning: 'mouth + phonetic', story: 'Mouth = suggestion particle' },

    // Verbs - Mouth/Speech
    '吃': { radical: '口 + 乞', meaning: 'mouth + beg', story: 'Mouth begging = to eat' },
    '喝': { radical: '口 + 曷', meaning: 'mouth + why not', story: 'Mouth + liquid = to drink' },
    '说': { radical: '讠+ 兑', meaning: 'speech + exchange', story: 'Speech radical = to speak/say' },
    '话': { radical: '讠+ 舌', meaning: 'speech + tongue', story: 'Speech + tongue = words/talk' },
    '叫': { radical: '口 + 丩', meaning: 'mouth + twisted', story: 'Mouth calling out = to call/be named' },
    '听': { radical: '口 + 斤', meaning: 'mouth + axe', story: 'Ear near mouth = to listen' },
    '问': { radical: '门 + 口', meaning: 'gate + mouth', story: 'Mouth at gate asking = to ask' },
    '唱': { radical: '口 + 昌', meaning: 'mouth + prosperous', story: 'Mouth + sun = to sing' },

    // Verbs - Looking/Seeing
    '看': { radical: '手 + 目', meaning: 'hand + eye', story: 'Hand shading eye = to look/see/watch' },
    '见': { radical: '目 + 儿', meaning: 'eye + person', story: 'Eye sees person = to see/meet' },
    '觉': { radical: '见 + 学', meaning: 'see + learn', story: 'Learning through seeing = to feel/think' },
    '视': { radical: '礻+ 见', meaning: 'show + see', story: 'Showing to see = to view' },

    // Verbs - Emotions/Thinking
    '想': { radical: '相 + 心', meaning: 'mutual + heart', story: 'Heart thinking = to think/miss/want' },
    '爱': { radical: '爫 + 冖 + 友', meaning: 'claw + cover + friend', story: 'Covering friend tenderly = love' },
    '喜': { radical: '壴 + 口', meaning: 'drum + mouth', story: 'Drumming and singing = happiness/like' },
    '认': { radical: '讠+ 人', meaning: 'speech + person', story: 'Speaking about person = to recognize' },
    '识': { radical: '讠+ 只', meaning: 'speech + only', story: 'Speech about something = to know/recognize' },

    // Verbs - Action
    '来': { radical: '一 + 米', meaning: 'horizontal + rice', story: 'Wheat/rice growing = to come' },
    '去': { radical: '土 + 厶', meaning: 'earth + private', story: 'Person leaving ground = to go' },
    '做': { radical: '亻+ 故', meaning: 'person + old', story: 'Person working = to do/make' },
    '买': { radical: '乛 + 头', meaning: 'hook + head', story: 'Reaching for goods = to buy' },
    '卖': { radical: '十 + 买', meaning: 'ten + buy', story: 'Many transactions = to sell' },
    '坐': { radical: '人 + 人 + 土', meaning: 'two people + earth', story: 'Two people on ground = to sit' },
    '站': { radical: '立 + 占', meaning: 'stand + occupy', story: 'Standing to occupy space = to stand' },
    '走': { radical: '土 + 夭', meaning: 'earth + bent', story: 'Person moving on earth = to walk/go' },
    '跑': { radical: '足 + 包', meaning: 'foot + wrap', story: 'Feet moving fast = to run' },
    '睡': { radical: '目 + 垂', meaning: 'eye + droop', story: 'Eyes drooping = to sleep' },
    '起': { radical: '走 + 己', meaning: 'walk + self', story: 'Getting self to walk = to get up/rise' },
    '开': { radical: '廾 + 一', meaning: 'two hands + one', story: 'Two hands opening gate = to open' },
    '关': { radical: '门 + 𢆍', meaning: 'gate + bolt', story: 'Bolt on gate = to close/shut' },
    '写': { radical: '冖 + 与', meaning: 'cover + give', story: 'Giving under cover = to write' },
    '读': { radical: '讠+ 卖', meaning: 'speech + sell', story: 'Reading aloud (selling words) = to read' },
    '学': { radical: '⺌ + 子 + 冖', meaning: 'hands + child + cover', story: 'Teaching child under roof = to study/learn' },
    '教': { radical: '孝 + 攵', meaning: 'filial piety + strike', story: 'Elder teaching child = to teach' },
    '工': { radical: '工', meaning: 'carpenter square', story: 'Tool for work = to work' },
    '作': { radical: '亻+ 乍', meaning: 'person + sudden', story: 'Person working = to do/work' },
    '玩': { radical: '王 + 元', meaning: 'jade + origin', story: 'Playing with jade = to play' },
    '用': { radical: '用', meaning: 'usefulness', story: 'Tool being used = to use' },
    '知': { radical: '矢 + 口', meaning: 'arrow + mouth', story: 'Arrow-straight speech = to know' },
    '道': { radical: '辶 + 首', meaning: 'walk + head', story: 'Walking with head = path/way/to say' },
    '会': { radical: '人 + 云', meaning: 'people + say', story: 'People gathering = to meet/can' },
    '能': { radical: '厶 + 匕 + 月', meaning: 'private + spoon + moon', story: 'Bear with power = can/able' },

    // Adjectives
    '好': { radical: '女 + 子', meaning: 'woman + child', story: 'Woman with child = good/well' },
    '大': { radical: '大', meaning: 'big person', story: 'Person with arms stretched = big' },
    '小': { radical: '小', meaning: 'small dots', story: 'Three small dots = small/little' },
    '多': { radical: '夕 + 夕', meaning: 'two evenings', story: 'Many evenings = many/much' },
    '少': { radical: '小 + 丿', meaning: 'small + slash', story: 'Cut small = few/little' },
    '高': { radical: '高', meaning: 'tall tower', story: 'Tall building = high/tall' },
    '矮': { radical: '矢 + 委', meaning: 'arrow + bent', story: 'Bent arrow = short/low' },
    '长': { radical: '长', meaning: 'long hair', story: 'Long flowing hair = long' },
    '短': { radical: '矢 + 豆', meaning: 'arrow + bean', story: 'Short arrow = short' },
    '新': { radical: '亲 + 斤', meaning: 'close + axe', story: 'Cutting fresh wood = new' },
    '旧': { radical: '丨 + 日', meaning: 'line + sun', story: 'Old sundial = old' },
    '快': { radical: '忄 + 夬', meaning: 'heart + decide', story: 'Heart deciding quickly = fast' },
    '慢': { radical: '忄 + 曼', meaning: 'heart + graceful', story: 'Heart moving gracefully = slow' },
    '早': { radical: '日 + 十', meaning: 'sun + ten', story: 'Sun rising = early' },
    '晚': { radical: '日 + 免', meaning: 'sun + avoid', story: 'Sun avoiding = late/evening' },
    '冷': { radical: '冫 + 令', meaning: 'ice + command', story: 'Ice cold = cold' },
    '热': { radical: '执 + 灬', meaning: 'grasp + fire', story: 'Fire below = hot' },
    '美': { radical: '羊 + 大', meaning: 'sheep + big', story: 'Big sheep = beautiful' },
    '漂': { radical: '氵 + 票', meaning: 'water + ticket', story: 'Floating on water = pretty/to float' },
    '亮': { radical: '高 + 儿', meaning: 'tall + person', story: 'Person standing tall = bright' },

    // Numbers
    '一': { radical: '一', meaning: 'one line', story: 'One horizontal line = one' },
    '二': { radical: '二', meaning: 'two lines', story: 'Two horizontal lines = two' },
    '三': { radical: '三', meaning: 'three lines', story: 'Three horizontal lines = three' },

    // Time/Place
    '天': { radical: '一 + 大', meaning: 'one + big', story: 'Big sky above = sky/day/heaven' },
    '年': { radical: '禾 + 千', meaning: 'grain + thousand', story: 'Harvest every year = year' },
    '月': { radical: '月', meaning: 'crescent moon', story: 'Moon pictograph = moon/month' },
    '日': { radical: '日', meaning: 'sun pictograph', story: 'Sun pictograph = sun/day' },
    '时': { radical: '日 + 寺', meaning: 'sun + temple', story: 'Sun position at temple = time/hour' },
    '分': { radical: '八 + 刀', meaning: 'divide + knife', story: 'Knife dividing = minute/to divide' },
    '家': { radical: '宀 + 豕', meaning: 'roof + pig', story: 'Pig under roof = home/family' },
    '校': { radical: '木 + 交', meaning: 'wood + cross', story: 'Building for learning = school' },
  }

  return radicals[word.simplified] || null
}

// Helper function to get stroke order information
const getStrokeOrderInfo = (word: HanziWord): { strokeCount: number; strokeOrder: string; tips: string } | null => {
  // Note: Stroke order shown as numbered sequence for clarity
  // Format: "1.stroke_name 2.stroke_name..." with practical writing tips
  const strokeInfo: Record<string, { strokeCount: number; strokeOrder: string; tips: string }> = {
    // HSK 1 Top 150 Most Common Characters
    // Basic Pronouns
    '我': { strokeCount: 7, strokeOrder: 'Left to right: hand → weapon', tips: 'Write the left side (手) first, then right side (戈)' },
    '你': { strokeCount: 7, strokeOrder: 'Left to right: person → 尔', tips: 'Person radical (亻) first with 2 strokes' },
    '他': { strokeCount: 5, strokeOrder: 'Left to right: person → 也', tips: 'Person radical (亻) then 也' },
    '她': { strokeCount: 6, strokeOrder: 'Left to right: woman → 也', tips: 'Woman radical (女) first with 3 strokes' },
    '们': { strokeCount: 5, strokeOrder: 'Left to right: person → door', tips: 'Person radical (亻) + simplified door' },
    
    // Essential particles
    '的': { strokeCount: 8, strokeOrder: 'Left to right: white → spoon', tips: 'Write 白 first (left), then 勺 (right)' },
    '是': { strokeCount: 9, strokeOrder: 'Top to bottom: sun → correct', tips: 'Write 日 on top, then bottom part' },
    '不': { strokeCount: 4, strokeOrder: 'Top to bottom, center out', tips: 'Vertical center line first, then spread' },
    '了': { strokeCount: 2, strokeOrder: 'Hook → diagonal', tips: 'Very simple: hook then one stroke' },
    '在': { strokeCount: 6, strokeOrder: 'Top to bottom: 土 → 一', tips: 'Write 土 first, then talent (才) below' },
    '有': { strokeCount: 6, strokeOrder: 'Top to bottom: moon → again', tips: 'Write 月 first, then 又 (hand)' },
    '这': { strokeCount: 7, strokeOrder: 'Top left first, then walk radical', tips: '文 component first, then walk (辶) wraps' },
    '个': { strokeCount: 3, strokeOrder: 'Left to right: slash → frame', tips: 'Diagonal first, then vertical+hook' },
    '吗': { strokeCount: 6, strokeOrder: 'Left to right: mouth → horse', tips: 'Mouth (口) first, then 马 for sound' },
    '呢': { strokeCount: 8, strokeOrder: 'Left to right: mouth → nun', tips: 'Mouth (口) radical first' },
    '吧': { strokeCount: 7, strokeOrder: 'Left to right: mouth → ba', tips: 'Mouth (口) first for speech' },
    
    // Numbers 1-10
    '一': { strokeCount: 1, strokeOrder: 'Single stroke left to right', tips: 'ONE horizontal line, simple!' },
    '二': { strokeCount: 2, strokeOrder: 'Top line first, then bottom', tips: 'TWO parallel horizontals' },
    '三': { strokeCount: 3, strokeOrder: 'Top to bottom, 3 lines', tips: 'THREE stacked horizontals' },
    '四': { strokeCount: 5, strokeOrder: 'Outside frame → inside lines', tips: 'Box first, then TWO inner strokes' },
    '五': { strokeCount: 4, strokeOrder: 'Top to bottom: 二 → X', tips: 'Horizontal lines first, then cross' },
    '六': { strokeCount: 4, strokeOrder: 'Top dot → spread strokes', tips: 'Dot on top, then expand down' },
    '七': { strokeCount: 2, strokeOrder: 'Horizontal → vertical hook', tips: 'Horizontal FIRST, then hook down' },
    '八': { strokeCount: 2, strokeOrder: 'Left diagonal → right diagonal', tips: 'Like a person\'s legs spreading' },
    '九': { strokeCount: 2, strokeOrder: 'Diagonal → curved hook', tips: 'Short stroke then big hook' },
    '十': { strokeCount: 2, strokeOrder: 'Horizontal → vertical', tips: 'Cross: horizontal FIRST through center' },
    
    // Common verbs
    '来': { strokeCount: 7, strokeOrder: 'Top to bottom, center out', tips: '"To come" - wheat growing' },
    '去': { strokeCount: 5, strokeOrder: 'Top 土 → bottom hook', tips: '"To go" - person leaving ground' },
    '看': { strokeCount: 9, strokeOrder: 'Top 手 → bottom 目', tips: '"To see" - hand shading eye' },
    '听': { strokeCount: 7, strokeOrder: 'Left 口 → right component', tips: '"To listen" - mouth receiving' },
    '说': { strokeCount: 9, strokeOrder: 'Left speech → right 兑', tips: '"To speak" - speech radical first' },
    '读': { strokeCount: 10, strokeOrder: 'Left speech → right 卖', tips: '"To read" - selling words aloud' },
    '写': { strokeCount: 5, strokeOrder: 'Top cover → bottom part', tips: '"To write" - cover + giving' },
    '吃': { strokeCount: 6, strokeOrder: 'Left 口 → right beg', tips: '"To eat" - mouth begging' },
    '喝': { strokeCount: 12, strokeOrder: 'Left 口 → right complex', tips: '"To drink" - mouth + why not liquid' },
    '买': { strokeCount: 6, strokeOrder: 'Top net → bottom head', tips: '"To buy" - reaching for goods' },
    '卖': { strokeCount: 8, strokeOrder: 'Top 十 → bottom 买', tips: '"To sell" - many transactions' },
    '做': { strokeCount: 11, strokeOrder: 'Left 亻 → right 故', tips: '"To do" - person working' },
    '坐': { strokeCount: 7, strokeOrder: 'Top people → bottom earth', tips: '"To sit" - two people on ground' },
    '走': { strokeCount: 7, strokeOrder: 'Top 土 → bottom bent', tips: '"To walk" - feet moving on earth' },
    '开': { strokeCount: 4, strokeOrder: 'Two hands opening', tips: '"To open" - hands pushing gate' },
    '住': { strokeCount: 7, strokeOrder: 'Left 亻 → right master', tips: '"To live" - person at home' },
    '想': { strokeCount: 13, strokeOrder: 'Top 相 → bottom 心', tips: '"To think" - heart thinking' },
    '爱': { strokeCount: 10, strokeOrder: 'Top claw → middle → friend', tips: '"To love" - covering friend tenderly' },
    '喜': { strokeCount: 12, strokeOrder: 'Top drum → bottom mouth', tips: '"To like" - drumming happiness' },
    '知': { strokeCount: 8, strokeOrder: 'Left arrow → right mouth', tips: '"To know" - arrow-straight speech' },
    '道': { strokeCount: 12, strokeOrder: 'Left head → right walk', tips: '"Way/path" - walking with head' },
    '会': { strokeCount: 6, strokeOrder: 'Top cloud → bottom人', tips: '"Can/meet" - people gathering' },
    '能': { strokeCount: 10, strokeOrder: 'Complex - left to right', tips: '"Can/able" - bear with power' },
    '叫': { strokeCount: 5, strokeOrder: 'Left 口 → right twist', tips: '"To call" - mouth calling out' },
    '问': { strokeCount: 6, strokeOrder: 'Outside 门 → inside 口', tips: '"To ask" - mouth at gate' },
    '学': { strokeCount: 8, strokeOrder: 'Top hands → child → cover', tips: '"To study" - teaching child' },
    '教': { strokeCount: 11, strokeOrder: 'Left filial → right strike', tips: '"To teach" - elder teaching' },
    '工': { strokeCount: 3, strokeOrder: 'Top → middle → bottom', tips: '"Work" - carpenter\'s square tool' },
    '作': { strokeCount: 7, strokeOrder: 'Left 亻 → right sudden', tips: '"To work/do" - person working' },
    
    // Family
    '妈': { strokeCount: 6, strokeOrder: 'Left 女 → right 马', tips: 'Woman + horse sound = mom' },
    '爸': { strokeCount: 8, strokeOrder: 'Top 父 → bottom 巴', tips: 'Father + ba sound = dad' },
    '哥': { strokeCount: 10, strokeOrder: 'Top 可 → bottom 可', tips: 'Double "can" = capable older brother' },
    '姐': { strokeCount: 8, strokeOrder: 'Left 女 → right 且', tips: 'Woman + moreover = older sister' },
    '弟': { strokeCount: 7, strokeOrder: 'Center out, top to bottom', tips: 'Young person = younger brother' },
    '妹': { strokeCount: 8, strokeOrder: 'Left 女 → right 未', tips: 'Young woman = younger sister' },
    '儿': { strokeCount: 2, strokeOrder: 'Diagonal → hook', tips: 'Child with bent legs' },
    '子': { strokeCount: 3, strokeOrder: 'Hook → hook → horizontal', tips: 'Baby with arms up' },
    
    // People & professions
    '人': { strokeCount: 2, strokeOrder: 'Left diagonal → right diagonal', tips: 'Person standing with legs spread' },
    '老': { strokeCount: 6, strokeOrder: 'Top to bottom', tips: 'Elder person = old' },
    '师': { strokeCount: 6, strokeOrder: 'Left 巾 → right strokes', tips: 'One who teaches' },
    '生': { strokeCount: 5, strokeOrder: 'Top to bottom', tips: 'Growing plant = life/student' },
    '朋': { strokeCount: 8, strokeOrder: 'Left 月 → right 月', tips: 'Two moons = friend' },
    '友': { strokeCount: 4, strokeOrder: 'Top to bottom: hand joining', tips: 'Two hands = friend' },
    '男': { strokeCount: 7, strokeOrder: 'Top 田 → bottom 力', tips: 'Field + strength = man' },
    '女': { strokeCount: 3, strokeOrder: 'Diagonal → diagonal → horizontal', tips: 'Kneeling woman' },
    
    // Adjectives
    '好': { strokeCount: 6, strokeOrder: 'Left 女 → right 子', tips: 'Woman + child = good' },
    '大': { strokeCount: 3, strokeOrder: 'Horizontal → two diagonals', tips: 'Person with arms wide = big' },
    '小': { strokeCount: 3, strokeOrder: 'Center vertical → sides', tips: 'Center stroke first = small' },
    '多': { strokeCount: 6, strokeOrder: 'Two sets of evening', tips: 'Many evenings = much' },
    '少': { strokeCount: 4, strokeOrder: '小 → diagonal cut', tips: 'Cut small = few/little' },
    '高': { strokeCount: 10, strokeOrder: 'Top dot → complex structure', tips: 'Tall tower = high' },
    '长': { strokeCount: 4, strokeOrder: 'Diagonal → horizontal → vertical → diagonal', tips: 'Long flowing hair = long' },
    '新': { strokeCount: 13, strokeOrder: 'Left tree → right complex', tips: 'Cutting fresh wood = new' },
    '冷': { strokeCount: 7, strokeOrder: 'Left ice → right command', tips: 'Ice = cold' },
    '热': { strokeCount: 10, strokeOrder: 'Top grasp → bottom fire', tips: 'Fire below = hot' },
    
    // Time words
    '年': { strokeCount: 6, strokeOrder: 'Diagonal → horizontals → vertical', tips: 'Grain harvest = year' },
    '月': { strokeCount: 4, strokeOrder: 'Vertical → hook → horizontals', tips: 'Crescent moon = month' },
    '日': { strokeCount: 4, strokeOrder: 'Box with horizontal inside', tips: 'Sun square = day' },
    '天': { strokeCount: 4, strokeOrder: 'Two horizontals → person', tips: 'Sky above = heaven/day' },
    '今': { strokeCount: 4, strokeOrder: 'Top to bottom', tips: 'Now/today' },
    '明': { strokeCount: 8, strokeOrder: 'Left 日 → right 月', tips: 'Sun + moon = bright/tomorrow' },
    '星': { strokeCount: 9, strokeOrder: 'Top 日 → bottom 生', tips: 'Sun + life = star' },
    '期': { strokeCount: 12, strokeOrder: 'Left 其 → right 月', tips: 'Period of time' },
    '时': { strokeCount: 7, strokeOrder: 'Left 日 → right 寺', tips: 'Sun position = time' },
    '分': { strokeCount: 4, strokeOrder: 'Divide with knife', tips: 'Splitting = minute/divide' },
    '早': { strokeCount: 6, strokeOrder: 'Top 日 → bottom 十', tips: 'Sun rising = early' },
    
    // Directions & positions
    '上': { strokeCount: 3, strokeOrder: 'Vertical → two horizontals', tips: 'Line above = up' },
    '下': { strokeCount: 3, strokeOrder: 'Horizontal → vertical → dot', tips: 'Line below = down' },
    '中': { strokeCount: 4, strokeOrder: 'Vertical → frame → vertical', tips: 'Arrow through center = middle' },
    '里': { strokeCount: 7, strokeOrder: 'Top → bottom in field', tips: 'Inside the field = inside' },
    '外': { strokeCount: 5, strokeOrder: 'Top evening → divination', tips: 'Outside divination = outside' },
    '前': { strokeCount: 9, strokeOrder: 'Top → middle → bottom', tips: 'Before/in front' },
    '后': { strokeCount: 6, strokeOrder: 'Diagonal → vertical → horizontals', tips: 'After/behind' },
    '左': { strokeCount: 5, strokeOrder: 'Top hand → bottom work', tips: 'Left side' },
    '右': { strokeCount: 5, strokeOrder: 'Top hand → bottom mouth', tips: 'Right side' },
    '东': { strokeCount: 5, strokeOrder: 'Inside tree → outside box', tips: 'Sun through trees = east' },
    '西': { strokeCount: 6, strokeOrder: 'Top → horizontals in box', tips: 'Sun setting = west' },
    '南': { strokeCount: 9, strokeOrder: 'Complex compass shape', tips: 'Pointing south' },
    '北': { strokeCount: 5, strokeOrder: 'Two people back-to-back', tips: 'Facing north' },
    
    // Basic objects
    '书': { strokeCount: 9, strokeOrder: 'Top → middle → bottom', tips: 'Book with pages' },
    '本': { strokeCount: 5, strokeOrder: 'Tree with mark at root', tips: 'Root/origin of tree = book' },
    '车': { strokeCount: 4, strokeOrder: 'Top to bottom frame', tips: 'Vehicle with wheels' },
    '水': { strokeCount: 4, strokeOrder: 'Center vertical → sides', tips: 'Water flowing' },
    '火': { strokeCount: 4, strokeOrder: 'Top dot → spreading flames', tips: 'Fire flames rising' },
    '木': { strokeCount: 4, strokeOrder: 'Horizontal → vertical → branches', tips: 'Tree trunk and branches' },
    '土': { strokeCount: 3, strokeOrder: 'Horizontal → vertical → horizontal', tips: 'Earth/soil' },
    '山': { strokeCount: 3, strokeOrder: 'Vertical → fold → vertical', tips: 'Three mountain peaks' },
    '手': { strokeCount: 4, strokeOrder: 'Diagonal → horizontals → hook', tips: 'Hand with fingers' },
    '口': { strokeCount: 3, strokeOrder: 'Vertical → fold → horizontal', tips: 'Mouth opening' },
    '心': { strokeCount: 4, strokeOrder: 'Three dots → hook', tips: 'Heart beating' },
    '门': { strokeCount: 3, strokeOrder: 'Dot → vertical → hook', tips: 'Door/gate' },
    '目': { strokeCount: 5, strokeOrder: 'Box with horizontals inside', tips: 'Eye with pupil' },
    '田': { strokeCount: 5, strokeOrder: 'Box with cross inside', tips: 'Rice field' },
    '石': { strokeCount: 5, strokeOrder: 'Cliff with rock', tips: 'Stone/rock' },
  }

  return strokeInfo[word.simplified] || null
}

// Helper function to get visual learning aids
const getVisualAid = (word: HanziWord): string | null => {
  const visualAids: Record<string, string> = {
    // HSK 1 - Pictographic & Visual Characters
    '人': '👤 Person with legs spread walking',
    '大': '🤸 Person with arms and legs stretched wide',
    '小': '👶 Three small dots like grains of sand',
    '天': '☁️ Big sky above the horizon (一 + 大)',
    '日': '☀️ Square picture of the sun with rays inside',
    '月': '🌙 Crescent moon shape in the night sky',
    '山': '⛰️ Three mountain peaks side by side',
    '水': '💧 Water flowing down like a river',
    '火': '🔥 Flames rising and spreading upward',
    '木': '🌳 Tree with trunk and branches spreading',
    '土': '🌱 Earth with a plant growing from ground',
    '田': '🌾 Rice paddy field divided into sections',
    '口': '👄 Open mouth ready to speak',
    '目': '👁️ Eye with pupil and iris lines',
    '手': '✋ Hand with four fingers extended',
    '心': '❤️ Heart with beats (three dots)',
    '门': '🚪 Double swinging door or gate',
    '耳': '👂 Ear shape from the side view',
    '女': '👩 Woman kneeling gracefully',
    '子': '👶 Baby with arms outstretched upward',
    '男': '💪 Field + strength = man working',
    '好': '👩‍👦 Woman + child = goodness, happiness',
    '家': '🏠 Pig under roof = home (ancient wealth)',
    
    // Animals
    '马': '🐴 Horse with flowing mane and four legs',
    '牛': '🐄 Ox with two horns on top',
    '羊': '🐑 Sheep with curved horns',
    '犬': '🐕 Dog standing alert on guard',
    '鱼': '🐟 Fish with scales, fins and tail',
    '鸟': '🦅 Bird with wings spread in flight',
    '虫': '🐛 Insect or bug crawling',
    '龟': '🐢 Turtle with shell pattern',
    
    // Nature
    '雨': '🌧️ Rain drops falling from clouds',
    '雪': '❄️ Snowflakes falling gently',
    '云': '☁️ White cloud floating in sky',
    '风': '💨 Wind blowing leaves and air',
    '电': '⚡ Lightning bolt striking down',
    '雷': '⛈️ Thunder and lightning in storm',
    '石': '🪨 Rock or stone under a cliff',
    '沙': '🏖️ Sand particles by water',
    '草': '🌿 Grass blades growing from earth',
    '花': '🌸 Flower blooming with petals',
    '树': '🌲 Tall tree standing upright',
    '林': '🌲🌳 Two trees together = forest',
    '森': '🌲🌳🌲 Three trees = dense forest',
    
    // Body Parts
    '头': '🤕 Head on top of body',
    '面': '😊 Face with features',
    '眼': '👀 Two eyes looking',
    '鼻': '👃 Nose in center of face',
    '嘴': '👄 Mouth for eating and speaking',
    '牙': '🦷 Teeth for biting',
    '舌': '👅 Tongue inside mouth',
    '脚': '🦶 Foot for walking',
    '腿': '🦵 Leg for standing',
    '肚': '🫄 Belly/stomach area',
    
    // Food & Drink
    '饭': '🍚 Cooked rice in bowl',
    '菜': '🥬 Vegetable greens',
    '肉': '🥩 Meat cut from animal',
    '蛋': '🥚 Egg from chicken',
    '茶': '🍵 Tea leaves in hot water',
    '酒': '🍷 Alcoholic drink in vessel',
    '奶': '🥛 Milk from cow/mother',
    '糖': '🍬 Sweet sugar candy',
    '盐': '🧂 Salt for seasoning',
    '油': '🛢️ Oil or fat liquid',
    
    // Objects
    '车': '🚗 Vehicle with wheels',
    '船': '⛵ Boat sailing on water',
    '刀': '🔪 Knife blade for cutting',
    '笔': '✏️ Writing brush or pen',
    '纸': '📄 Paper sheet for writing',
    '书': '📖 Book with pages',
    '桌': '🪑 Table/desk for working',
    '椅': '🪑 Chair for sitting',
    '床': '🛏️ Bed for sleeping',
    '杯': '🥤 Cup for drinking',
    '碗': '🥣 Bowl for eating',
    '伞': '☂️ Umbrella for rain protection',
    '衣': '👕 Clothing to wear',
    '帽': '🎩 Hat on head',
    '鞋': '👟 Shoes for feet',
    '包': '🎒 Bag for carrying things',
    '钱': '💰 Money/coins',
    '灯': '💡 Light/lamp glowing',
    '钟': '🕐 Clock showing time',
    '镜': '🪞 Mirror for reflection',
    
    // Numbers & Time
    '一': '1️⃣ One horizontal line',
    '二': '2️⃣ Two horizontal lines stacked',
    '三': '3️⃣ Three horizontal lines stacked',
    '四': '4️⃣ Box with cross inside = four directions',
    '五': '5️⃣ Five fingers on a hand',
    '六': '6️⃣ Six sides of a roof',
    '七': '7️⃣ Seven - horizontal with hook',
    '八': '8️⃣ Eight - two sides spreading',
    '九': '9️⃣ Nine - diagonal with hook',
    '十': '🔟 Ten - cross shape (vertical + horizontal)',
    '百': '💯 Hundred - white (一) + person',
    '千': '🎯 Thousand - person (亻) + ten (十)',
    '万': '⭐ Ten thousand - many points',
    
    // Directions & Positions
    '上': '⬆️ Arrow pointing up',
    '下': '⬇️ Arrow pointing down',
    '左': '⬅️ Hand on left side',
    '右': '➡️ Hand/mouth on right side',
    '东': '🌅 Sun rising through trees = east',
    '西': '🌆 Sun setting with basket = west',
    '南': '🧭 Pointing south with compass',
    '北': '🧊 Two people back-to-back = north',
    '中': '🎯 Arrow through center target',
    '前': '👉 Pointing forward ahead',
    '后': '👈 Behind/after in back',
    '里': '📍 Inside the village/field',
    '外': '🚪 Outside beyond the door',
  }

  return (visualAids[word.simplified] ?? '').replace(/^[^a-zA-Z0-9\u4e00-\u9fff]+/, '').trim() || null
}

// Helper function to provide learning tips
const getLearningTip = (word: HanziWord): string => {
  const tips: Record<string, string> = {
    '我': 'This character represents "I/me". Notice it looks like a person with a weapon - defending themselves.',
    '你': 'Used for "you" when speaking to someone. The left part (亻) means "person".',
    '他': 'Means "he". The left side (亻) indicates it\'s person-related.',
    '她': 'Means "she". Notice the female radical (女) on the left.',
    '的': 'One of the most common characters! Used to show possession, like "\'s" in English.',
    '是': 'The verb "to be". Essential for basic sentences!',
    '好': 'Can mean "good", "well", or "OK". Notice it combines 女 (woman) and 子 (child).',
    '大': 'Looks like a person standing with arms stretched wide - representing "big"!',
    '小': 'Notice the small dots - they represent something small.',
  }

  if (tips[word.simplified]) {
    return tips[word.simplified]
  }

  // Generic tips based on category
  if (word.category === 'verb') {
    return `This is a verb (action word). Try using it with "我" (I) to practice!`
  } else if (word.category === 'noun') {
    return `This is a noun. You can use it with "这是" (this is) to practice.`
  } else if (word.category === 'adjective') {
    return `This is an adjective (describing word). Use it with "很" (very) to describe things!`
  }

  return `Practice this word in different sentences to remember it better!`
}

export default function Practice() {
  const [mode, setMode] = useState<LearningMode | null>(null)
  const [hskLevel, setHskLevel] = useState(1)
  const [words, setWords] = useState<HanziWord[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  // Test mode state
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [testComplete, setTestComplete] = useState(false)
  const [showMotivationalBreak, setShowMotivationalBreak] = useState(false)

  const loadWords = async () => {
    setLoading(true)
    try {
      let wordsToUse: HanziWord[] = []

      if (mode === 'learn') {
        // Get new words for learning (words not yet started)
        const data = await learningApi.getNewWords(hskLevel, 20)
        wordsToUse = data.words || []
      } else if (mode === 'review') {
        // Get words due for review (SRS system)
        const data = await learningApi.getReviewWords(hskLevel)
        wordsToUse = (data.reviews || []).map((r: { word: HanziWord }) => r.word)
      } else if (mode === 'test') {
        // Get words for testing (learned words)
        const data = await learningApi.getTestWords(hskLevel, 20)
        wordsToUse = (data.words || []).map((w: { word: HanziWord }) => w.word)
      }

      setWords(wordsToUse)

      if (mode === 'test' && wordsToUse.length > 0) {
        generateQuestions(wordsToUse)
      } else if (mode === 'test' && wordsToUse.length === 0) {
        toast.error('No words available for testing. Practice more words first!')
      }
    } catch (error) {
      // Only show error if not 401 (handled by interceptor)
      const err = error as { response?: { status?: number; data?: { detail?: string } }; message?: string }
      if (err.response?.status !== 401) {
        console.error('Failed to load words:', error)
        toast.error(`Failed to load vocabulary: ${err.response?.data?.detail || err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const generateQuestions = (wordList: HanziWord[]) => {
    const shuffled = [...wordList].sort(() => Math.random() - 0.5).slice(0, 10)
    const qs: Question[] = shuffled.map(word => {
      const questionTypes: QuestionType[] = ['recognition', 'meaning', 'pinyin']
      const type = questionTypes[Math.floor(Math.random() * questionTypes.length)]

      // Generate 3 wrong options + 1 correct
      const wrongWords = wordList
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

      let options: string[] = []
      const correctAnswer = Math.floor(Math.random() * 4)

      if (type === 'recognition') {
        // Show pinyin/english, ask for character
        options = wrongWords.map(w => w.simplified)
        options.splice(correctAnswer, 0, word.simplified)
      } else if (type === 'meaning') {
        // Show character, ask for meaning
        options = wrongWords.map(w => w.english)
        options.splice(correctAnswer, 0, word.english)
      } else {
        // Show character, ask for pinyin
        options = wrongWords.map(w => w.pinyin)
        options.splice(correctAnswer, 0, word.pinyin)
      }

      return { word, type, options, correctAnswer }
    })

    setQuestions(qs)
  }

  const handleModeSelect = (selectedMode: LearningMode) => {
    setMode(selectedMode)
    setCurrentWordIndex(0)
    setCurrentQuestionIndex(0)
    setScore(0)
    setTestComplete(false)
    setSelectedAnswer(null)
    setShowMotivationalBreak(false)
  }

  useEffect(() => {
    if (mode) {
      loadWords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, hskLevel])

  const handleNextWord = (knewIt: boolean = true) => {
    if (mode === 'learn' || mode === 'review') {
      // Fire-and-forget: record progress without blocking the UI
      const currentWord = words[currentWordIndex]
      const quality = mode === 'review' ? (knewIt ? 4 : 2) : 3
      learningApi.recordReview(currentWord.id, quality).catch(err =>
        console.error('Failed to update progress:', err)
      )
    }

    // Move to next word immediately — don't wait for the API
    setShowAnswer(false)

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
    } else {
      toast.success('Great job! You completed this set!')
      setMode(null)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(answerIndex)
    const question = questions[currentQuestionIndex]

    if (answerIndex === question.correctAnswer) {
      setScore(score + 1)
      toast.success('Correct!')
    } else {
      toast.error('Incorrect')
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1
        // Show motivational break every 5 questions (but not at the end)
        if (nextIndex % 5 === 0 && nextIndex < questions.length - 1) {
          setShowMotivationalBreak(true)
        } else {
          setCurrentQuestionIndex(nextIndex)
          setSelectedAnswer(null)
        }
      } else {
        setTestComplete(true)
      }
    }, 1500)
  }

  const renderModeSelection = () => (
    <div className="max-w-6xl mx-auto px-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
          Practice & Learn
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
          Choose your learning mode and HSK level
        </p>
      </motion.div>

      {/* HSK Level Selection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Select HSK Level</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() => setHskLevel(level)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                  hskLevel === level
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                HSK {level}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleModeSelect('learn')}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 text-center cursor-pointer hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-700 transition-all group overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 sm:mb-8" />
          <div className="mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
            Learn Mode
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            Study new words with flashcards. See the character, pinyin, and meaning.
          </p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400">
            Beginner Friendly
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => handleModeSelect('review')}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 text-center cursor-pointer hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-700 transition-all group overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 sm:mb-8" />
          <div className="mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
            Review Mode
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            Test yourself without seeing the answer first. Hide the meaning until you're ready!
          </p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400">
            Active Recall
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleModeSelect('test')}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 text-center cursor-pointer hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-700 transition-all group overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 sm:mb-8" />
          <div className="mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
            Test Mode
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            Quiz yourself with multiple choice questions. Track your score!
          </p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400">
            Challenge
          </span>
        </motion.div>
      </div>
    </div>
  )

  const renderLearnMode = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    if (words.length === 0) {
      return (
        <div className="max-w-2xl mx-auto text-center py-20 px-3 sm:px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">No Words Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {mode === 'learn' && 'All words for this level have been started. Try a different HSK level!'}
            {mode === 'review' && 'No words due for review right now. Great job staying on top of your reviews!'}
          </p>
          <button
            onClick={() => setMode(null)}
            className="bg-indigo-600 text-white rounded-2xl px-6 py-3.5 font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer mx-auto"
          >
            Back to Menu
          </button>
        </div>
      )
    }

    const currentWord = words[currentWordIndex]
    const progress = ((currentWordIndex + 1) / words.length) * 100
    const isReviewMode = mode === 'review'

    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setMode(null)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400">
                {isReviewMode ? 'Review Mode' : 'Learn Mode'}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentWordIndex + 1} / {words.length}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isReviewMode
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentWordIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
              {/* Compact Responsive Layout */}
              <div className="flex flex-col gap-3">

                {/* Top: Character & Image Side by Side on Desktop, Stacked on Mobile */}
                <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-start">
                  {/* Character Display */}
                  <div className="flex-shrink-0 text-center">
                    <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-gray-900 dark:text-gray-100">
                      {currentWord.simplified}
                    </div>
                  </div>
                  
                  {/* Vocabulary Image - Compact size */}
                  {mode === 'learn' && currentWord.image_url && (
                    <div className="flex-shrink-0">
                      <VocabularyImage 
                        imageUrl={currentWord.image_url}
                        word={currentWord.simplified}
                        size="md"
                        showLabel={false}
                      />
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="w-full">
                  {/* Learn mode: Show info immediately */}
                  {mode === 'learn' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      {/* Pinyin and Audio */}
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <div className="text-lg sm:text-xl text-indigo-600 font-semibold">
                          {currentWord.pinyin}
                        </div>
                        <AudioButton
                          text={currentWord.simplified}
                          language="cmn-CN"
                          size="sm"
                          variant="secondary"
                          tooltipText="Hear the pronunciation"
                        />
                      </div>

                      {/* English Translation */}
                      <div className="text-base sm:text-lg text-gray-700 font-medium text-center sm:text-left">
                        {currentWord.english}
                      </div>

                      {/* Category Badge */}
                      {currentWord.category && (
                        <div className="flex justify-center sm:justify-start">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                            {currentWord.category}
                          </span>
                        </div>
                      )}

                      {/* Compact 5-Color Card Grid - 2 columns on mobile, 3 on tablet, 5 on desktop */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 mt-3">
                        
                        {/* 1. Purple: Radical Breakdown */}
                        {getRadicalBreakdown(currentWord) && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-[10px] font-bold">部</span>
                              </div>
                              <h3 className="text-[10px] font-bold text-purple-900">Radicals</h3>
                            </div>
                            <div className="space-y-1">
                              <div className="text-purple-900 font-medium text-xs">
                                {getRadicalBreakdown(currentWord)!.radical}
                              </div>
                              <div className="text-purple-800 text-[10px]">
                                {getRadicalBreakdown(currentWord)!.meaning}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. Pink: Stroke Order */}
                        {getStrokeOrderInfo(currentWord) && (
                          <div className="bg-pink-50 border border-pink-200 rounded-lg p-2">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-4 h-4 bg-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-[10px] font-bold">笔</span>
                              </div>
                              <h3 className="text-[10px] font-bold text-pink-900">Strokes</h3>
                            </div>
                            <div className="space-y-1">
                              <div className="text-pink-900 font-medium text-xs">
                                {getStrokeOrderInfo(currentWord)!.strokeCount} strokes
                              </div>
                              <div className="text-pink-800 text-[10px] font-chinese">
                                {getStrokeOrderInfo(currentWord)!.strokeOrder.substring(0, 20)}...
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. Emerald: Visual Aid */}
                        {getVisualAid(currentWord) && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Eye className="w-2.5 h-2.5 text-white" />
                              </div>
                              <h3 className="text-[10px] font-bold text-emerald-900">Visual</h3>
                            </div>
                            <div className="text-emerald-800 text-[10px] line-clamp-3">
                              {getVisualAid(currentWord)}
                            </div>
                          </div>
                        )}

                        {/* 4. Blue: Example */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-1">
                            <BookOpen className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            <h3 className="text-[10px] font-bold text-blue-900">Example</h3>
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs text-gray-900 font-chinese">
                              {getExampleSentence(currentWord).chinese}
                            </div>
                            <div className="text-[10px] text-blue-600">
                              {getExampleSentence(currentWord).pinyin}
                            </div>
                          </div>
                        </div>

                        {/* 5. Amber: Tip */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Trophy className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <h3 className="text-[10px] font-bold text-amber-900">Tip</h3>
                          </div>
                          <div className="text-amber-900 text-[10px] line-clamp-3">
                            {getLearningTip(currentWord)}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Detailed Sections - Click to expand */}
                      <div className="space-y-2 mt-3">
                        {/* Full Stroke Order with Animation */}
                        {getStrokeOrderInfo(currentWord) && (
                          <details className="bg-pink-50 border border-pink-200 rounded-lg">
                            <summary className="p-2 cursor-pointer text-xs font-semibold text-pink-900 hover:bg-pink-100 flex items-center gap-1.5">
                              <PenLine className="w-3 h-3 flex-shrink-0" /> Interactive Stroke Practice
                            </summary>
                            <div className="p-3 border-t border-pink-200">
                              <div className="flex justify-center">
                                <StrokeOrderDisplay
                                  character={currentWord.simplified}
                                  size={150}
                                  showControls={true}
                                />
                              </div>
                              <p className="text-[10px] text-pink-700 text-center mt-2">
                                Click "Animate" to see stroke order, or "Practice" to draw!
                              </p>
                            </div>
                          </details>
                        )}

                        {/* Character Etymology */}
                        <details className="bg-amber-50 border border-amber-200 rounded-lg">
                          <summary className="p-2 cursor-pointer text-xs font-semibold text-amber-900 hover:bg-amber-100 flex items-center gap-1.5">
                            <History className="w-3 h-3 flex-shrink-0" /> Character Evolution History
                          </summary>
                          <div className="p-3 border-t border-amber-200">
                            <CharacterEtymology
                              character={currentWord.simplified}
                              word={currentWord}
                              className=""
                            />
                          </div>
                        </details>
                      </div>
                    </motion.div>
                  )}

                  {/* Review mode: Hide until user clicks */}
                  {mode === 'review' && showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      {/* Pinyin and Audio */}
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <div className="text-lg sm:text-xl text-indigo-600 dark:text-indigo-400 font-semibold">
                          {currentWord.pinyin}
                        </div>
                        <AudioButton
                          text={currentWord.simplified}
                          language="cmn-CN"
                          size="sm"
                          variant="secondary"
                          tooltipText="Hear the pronunciation"
                        />
                      </div>

                      {/* English Translation */}
                      <div className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium text-center sm:text-left">
                        {currentWord.english}
                      </div>

                      {/* Category Badge */}
                      {currentWord.category && (
                        <div className="flex justify-center sm:justify-start">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400">
                            {currentWord.category}
                          </span>
                        </div>
                      )}

                      {/* Image reveal after showing answer */}
                      {currentWord.image_url && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex justify-center"
                        >
                          <VocabularyImage
                            imageUrl={currentWord.image_url}
                            word={currentWord.simplified}
                            size="md"
                            showLabel={false}
                          />
                        </motion.div>
                      )}

                      {/* 5-Color Card Grid - Same as Learn Mode but with stagger animation */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 mt-3"
                      >
                        {/* 1. Purple: Radical Breakdown */}
                        {getRadicalBreakdown(currentWord) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-purple-50 border border-purple-200 rounded-lg p-2"
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-[10px] font-bold">部</span>
                              </div>
                              <h3 className="text-[10px] font-bold text-purple-900">Radicals</h3>
                            </div>
                            <div className="space-y-1">
                              <div className="text-purple-900 font-medium text-xs">
                                {getRadicalBreakdown(currentWord)!.radical}
                              </div>
                              <div className="text-purple-800 text-[10px]">
                                {getRadicalBreakdown(currentWord)!.meaning}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* 2. Pink: Stroke Order */}
                        {getStrokeOrderInfo(currentWord) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-pink-50 border border-pink-200 rounded-lg p-2"
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-4 h-4 bg-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-[10px] font-bold">笔</span>
                              </div>
                              <h3 className="text-[10px] font-bold text-pink-900">Strokes</h3>
                            </div>
                            <div className="space-y-1">
                              <div className="text-pink-900 font-medium text-xs">
                                {getStrokeOrderInfo(currentWord)!.strokeCount} strokes
                              </div>
                              <div className="text-pink-800 text-[10px] font-chinese">
                                {getStrokeOrderInfo(currentWord)!.strokeOrder.substring(0, 20)}...
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* 3. Emerald: Visual Aid */}
                        {getVisualAid(currentWord) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-emerald-50 border border-emerald-200 rounded-lg p-2"
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Eye className="w-2.5 h-2.5 text-white" />
                              </div>
                              <h3 className="text-[10px] font-bold text-emerald-900">Visual</h3>
                            </div>
                            <div className="text-emerald-800 text-[10px] line-clamp-3">
                              {getVisualAid(currentWord)}
                            </div>
                          </motion.div>
                        )}

                        {/* 4. Blue: Example */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                          className="bg-blue-50 border border-blue-200 rounded-lg p-2"
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <BookOpen className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            <h3 className="text-[10px] font-bold text-blue-900">Example</h3>
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs text-gray-900 font-chinese">
                              {getExampleSentence(currentWord).chinese}
                            </div>
                            <div className="text-[10px] text-blue-600">
                              {getExampleSentence(currentWord).pinyin}
                            </div>
                          </div>
                        </motion.div>

                        {/* 5. Amber: Tip */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="bg-amber-50 border border-amber-200 rounded-lg p-2"
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <Trophy className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <h3 className="text-[10px] font-bold text-amber-900">Tip</h3>
                          </div>
                          <div className="text-amber-900 text-[10px] line-clamp-3">
                            {getLearningTip(currentWord)}
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* Expandable Detailed Sections */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="space-y-2 mt-3"
                      >
                        {/* Full Stroke Order with Animation */}
                        {getStrokeOrderInfo(currentWord) && (
                          <details className="bg-pink-50 border border-pink-200 rounded-lg">
                            <summary className="p-2 cursor-pointer text-xs font-semibold text-pink-900 hover:bg-pink-100 flex items-center gap-1.5">
                              <PenLine className="w-3 h-3 flex-shrink-0" /> Interactive Stroke Practice
                            </summary>
                            <div className="p-3 border-t border-pink-200">
                              <div className="flex justify-center">
                                <StrokeOrderDisplay
                                  character={currentWord.simplified}
                                  size={150}
                                  showControls={true}
                                />
                              </div>
                              <p className="text-[10px] text-pink-700 text-center mt-2">
                                Click "Animate" to see stroke order, or "Practice" to draw!
                              </p>
                            </div>
                          </details>
                        )}

                        {/* Character Etymology */}
                        <details className="bg-amber-50 border border-amber-200 rounded-lg">
                          <summary className="p-2 cursor-pointer text-xs font-semibold text-amber-900 hover:bg-amber-100 flex items-center gap-1.5">
                            <History className="w-3 h-3 flex-shrink-0" /> Character Evolution History
                          </summary>
                          <div className="p-3 border-t border-amber-200">
                            <CharacterEtymology
                              character={currentWord.simplified}
                              word={currentWord}
                              className=""
                            />
                          </div>
                        </details>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Always at Bottom */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {mode === 'learn' ? (
                  <button
                    onClick={() => handleNextWord()}
                    className="bg-indigo-600 text-white rounded-2xl px-6 py-3.5 font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Next Word
                  </button>
                ) : (
                  <>
                    {!showAnswer ? (
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="bg-indigo-600 text-white rounded-2xl px-6 py-3.5 font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <BookOpen className="w-5 h-5" />
                        Show Answer
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleNextWord(true)}
                          className="bg-indigo-600 text-white rounded-2xl px-6 py-3.5 font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                        >
                          <CheckCircle className="w-5 h-5" />
                          I Knew It!
                        </button>
                        <button
                          onClick={() => handleNextWord(false)}
                          className="border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl px-6 py-3.5 font-semibold hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                        >
                          <XCircle className="w-5 h-5" />
                          Missed It
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Hint card */}
        {mode === 'learn' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800 rounded-2xl p-4">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <strong>Learn Mode:</strong> Take your time to study each character.
                All information is shown to help you learn.
              </p>
            </div>
          </motion.div>
        )}

        {mode === 'review' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4">
              <p className="text-sm text-emerald-900 dark:text-emerald-300">
                <strong>Review Mode:</strong> Try to recall the meaning before revealing the answer.
                Active recall strengthens memory!
              </p>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const renderMotivationalBreak = () => {
    const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
    const questionsCompleted = currentQuestionIndex + 1
    const questionsRemaining = questions.length - questionsCompleted

    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-12 text-center overflow-hidden relative">
          {/* Animated gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${randomMessage.color} opacity-10 dark:opacity-20`} />

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative z-10"
          >
            <div className="flex justify-center mb-6">
              <randomMessage.Icon className={`w-20 h-20 ${randomMessage.iconClass}`} />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {randomMessage.title}
            </h2>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {randomMessage.message}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{questionsCompleted}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              <div className="text-2xl text-gray-300 dark:text-gray-600">•</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{score}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>
              <div className="text-2xl text-gray-300 dark:text-gray-600">•</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{questionsRemaining}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">To go</div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => {
                  setShowMotivationalBreak(false)
                  setCurrentQuestionIndex(currentQuestionIndex + 1)
                  setSelectedAnswer(null)
                }}
                className="bg-indigo-600 text-white rounded-2xl px-8 py-3.5 font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer mx-auto"
              >
                Let's Keep Going! <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  const renderTestMode = () => {
    if (loading || questions.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    if (showMotivationalBreak) {
      return renderMotivationalBreak()
    }

    if (testComplete) {
      const percentage = Math.round((score / questions.length) * 100)
      const passed = percentage >= 70

      return (
        <div className="max-w-2xl mx-auto px-3 sm:px-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
            >
              <div className="mb-8">
                {passed ? (
                  <Trophy className="w-24 h-24 mx-auto text-yellow-500 dark:text-yellow-400" />
                ) : (
                  <Target className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-500" />
                )}
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {passed ? 'Congratulations!' : 'Good Effort!'}
              </h2>

              <div className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-6">
                {percentage}%
              </div>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8">
                You got {score} out of {questions.length} correct
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setMode(null)}
                  className="border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl px-6 py-3.5 font-semibold hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  Back to Menu
                </button>
                <button
                  onClick={() => handleModeSelect('test')}
                  className="bg-indigo-600 text-white rounded-2xl px-6 py-3.5 font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )
    }

    const question = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setMode(null)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} / {questions.length}
              </span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                Score: {score}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
              <div className="mb-8">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 mb-4">
                  {question.type === 'recognition' && 'Character Recognition'}
                  {question.type === 'meaning' && 'Meaning'}
                  {question.type === 'pinyin' && 'Pinyin'}
                </span>

                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {question.type === 'recognition' && `What character is "${question.word.pinyin}" (${question.word.english})?`}
                  {question.type === 'meaning' && `What does "${question.word.simplified}" mean?`}
                  {question.type === 'pinyin' && `What is the pinyin for "${question.word.simplified}"?`}
                </h3>
              </div>

              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === index
                  const isCorrect = index === question.correctAnswer
                  const showResult = selectedAnswer !== null

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        showResult && isCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                          : showResult && isSelected && !isCorrect
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                          : isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-lg text-gray-900 dark:text-gray-100 ${question.type === 'recognition' ? 'text-4xl font-chinese' : ''}`}>
                          {option}
                        </span>
                        {showResult && isCorrect && (
                          <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      {!mode && renderModeSelection()}
      {(mode === 'learn' || mode === 'review') && renderLearnMode()}
      {mode === 'test' && renderTestMode()}
    </div>
  )
}
