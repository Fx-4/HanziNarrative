import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HanziWord } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import AudioButton from '@/components/AudioButton'
import StrokeOrderDisplay from '@/components/StrokeOrderDisplay'
import VocabularyImage from '@/components/VocabularyImage'
import CharacterEtymology from '@/components/CharacterEtymology'
import {
  ArrowRight, BookOpen, CheckCircle, XCircle,
  Eye, PenLine, History, Trophy
} from 'lucide-react'

// â”€â”€â”€ Helper functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const getExampleSentence = (word: HanziWord): { chinese: string; pinyin: string; english: string } => {
  const examplePatterns: Record<string, { chinese: string; pinyin: string; english: string }> = {
    'æˆ‘': { chinese: 'æˆ‘æ˜¯å­¦ç”Ÿã€‚', pinyin: 'WÇ’ shÃ¬ xuÃ©shÄ“ng.', english: 'I am a student.' },
    'ä½ ': { chinese: 'ä½ å¥½å—ï¼Ÿ', pinyin: 'NÇ hÇŽo ma?', english: 'How are you?' },
    'ä»–': { chinese: 'ä»–æ˜¯è€å¸ˆã€‚', pinyin: 'TÄ shÃ¬ lÇŽoshÄ«.', english: 'He is a teacher.' },
    'å¥¹': { chinese: 'å¥¹å¾ˆæ¼‚äº®ã€‚', pinyin: 'TÄ hÄ›n piÃ oliang.', english: 'She is beautiful.' },
    'çš„': { chinese: 'æˆ‘çš„ä¹¦', pinyin: 'wÇ’ de shÅ«', english: 'my book' },
    'æ˜¯': { chinese: 'è¿™æ˜¯æˆ‘çš„å®¶ã€‚', pinyin: 'ZhÃ¨ shÃ¬ wÇ’ de jiÄ.', english: 'This is my home.' },
    'ä¸': { chinese: 'æˆ‘ä¸å–œæ¬¢ã€‚', pinyin: 'WÇ’ bÃ¹ xÇhuan.', english: "I don't like it." },
    'äº†': { chinese: 'æˆ‘åƒäº†é¥­ã€‚', pinyin: 'WÇ’ chÄ« le fÃ n.', english: 'I ate.' },
    'åœ¨': { chinese: 'æˆ‘åœ¨å®¶ã€‚', pinyin: 'WÇ’ zÃ i jiÄ.', english: 'I am at home.' },
    'æœ‰': { chinese: 'æˆ‘æœ‰ä¸€æœ¬ä¹¦ã€‚', pinyin: 'WÇ’ yÇ’u yÄ« bÄ›n shÅ«.', english: 'I have a book.' },
    'äºº': { chinese: 'å¾ˆå¤šäººåœ¨è¿™é‡Œã€‚', pinyin: 'HÄ›n duÅ rÃ©n zÃ i zhÃ¨lÇ.', english: 'Many people are here.' },
    'ä¸­å›½': { chinese: 'æˆ‘æ¥è‡ªä¸­å›½ã€‚', pinyin: 'WÇ’ lÃ¡izÃ¬ ZhÅngguÃ³.', english: 'I am from China.' },
    'å¥½': { chinese: 'ä»Šå¤©å¤©æ°”å¾ˆå¥½ã€‚', pinyin: 'JÄ«ntiÄn tiÄnqÃ¬ hÄ›n hÇŽo.', english: 'The weather is nice today.' },
    'å¤§': { chinese: 'è¿™ä¸ªæˆ¿å­å¾ˆå¤§ã€‚', pinyin: 'ZhÃ¨ge fÃ¡ngzi hÄ›n dÃ .', english: 'This house is big.' },
    'å°': { chinese: 'æˆ‘æœ‰ä¸€ä¸ªå°ç‹—ã€‚', pinyin: 'WÇ’ yÇ’u yÄ« gÃ¨ xiÇŽo gÇ’u.', english: 'I have a small dog.' },
    'å­¦ä¹ ': { chinese: 'æˆ‘æ¯å¤©å­¦ä¹ ä¸­æ–‡ã€‚', pinyin: 'WÇ’ mÄ›itiÄn xuÃ©xÃ­ ZhÅngwÃ©n.', english: 'I study Chinese every day.' },
    'å–œæ¬¢': { chinese: 'æˆ‘å–œæ¬¢çœ‹ä¹¦ã€‚', pinyin: 'WÇ’ xÇhuan kÃ nshÅ«.', english: 'I like reading.' },
    'åƒ': { chinese: 'æˆ‘å–œæ¬¢åƒä¸­å›½èœã€‚', pinyin: 'WÇ’ xÇhuan chÄ« ZhÅngguÃ³ cÃ i.', english: 'I like to eat Chinese food.' },
    'å–': { chinese: 'æˆ‘æƒ³å–æ°´ã€‚', pinyin: 'WÇ’ xiÇŽng hÄ“ shuÇ.', english: 'I want to drink water.' },
    'çœ‹': { chinese: 'æˆ‘åœ¨çœ‹ç”µå½±ã€‚', pinyin: 'WÇ’ zÃ i kÃ n diÃ nyÇng.', english: 'I am watching a movie.' },
  }

  if (examplePatterns[word.simplified]) {
    return examplePatterns[word.simplified]
  }

  const category = word.category?.toLowerCase() || ''
  const hanzi = word.simplified
  const pinyin = word.pinyin
  const english = word.english.toLowerCase()

  if (category.includes('time') || ['å¤©', 'å¹´', 'æœˆ', 'æ—¥', 'æ—¶', 'åˆ†', 'ç§’', 'ä»Šå¤©', 'æ˜Žå¤©', 'æ˜¨å¤©', 'çŽ°åœ¨', 'ä»¥å‰', 'ä»¥åŽ'].includes(hanzi)) {
    return { chinese: `${hanzi}å¾ˆé‡è¦ã€‚`, pinyin: `${pinyin.charAt(0).toUpperCase() + pinyin.slice(1)} hÄ›n zhÃ²ngyÃ o.`, english: `${english.charAt(0).toUpperCase() + english.slice(1)} is important.` }
  }
  if (category.includes('number') || ['ä¸€', 'äºŒ', 'ä¸‰', 'å››', 'äº”', 'å…­', 'ä¸ƒ', 'å…«', 'ä¹', 'å', 'ç™¾', 'åƒ', 'ä¸‡'].includes(hanzi)) {
    return { chinese: `æˆ‘æœ‰${hanzi}ä¸ªã€‚`, pinyin: `WÇ’ yÇ’u ${pinyin} gÃ¨.`, english: `I have ${english}.` }
  }
  if (category.includes('food') || category.includes('drink') || ['é¥­', 'èœ', 'è‚‰', 'é±¼', 'èŒ¶', 'å’–å•¡', 'æ°´', 'é…’', 'å¥¶', 'é¢', 'ç±³'].includes(hanzi)) {
    return { chinese: `æˆ‘æƒ³åƒ${hanzi}ã€‚`, pinyin: `WÇ’ xiÇŽng chÄ« ${pinyin}.`, english: `I want to eat ${english}.` }
  }
  if (category.includes('verb') || ['åŽ»', 'æ¥', 'åš', 'è¯´', 'ä¹°', 'å–', 'ç”¨', 'æƒ³', 'çŸ¥é“', 'è®¤è¯†', 'å·¥ä½œ', 'å­¦', 'æ•™', 'çŽ©', 'èµ°', 'è·‘', 'å', 'ç«™', 'ç¡', 'èµ·', 'å¼€', 'å…³'].includes(hanzi)) {
    return { chinese: `æˆ‘æƒ³${hanzi}ã€‚`, pinyin: `WÇ’ xiÇŽng ${pinyin}.`, english: `I want to ${english}.` }
  }
  if (category.includes('adj') || ['é«˜', 'çŸ®', 'èƒ–', 'ç˜¦', 'é•¿', 'çŸ­', 'æ–°', 'æ—§', 'å¿«', 'æ…¢', 'è¿œ', 'è¿‘', 'å¤š', 'å°‘', 'çƒ­', 'å†·', 'è´µ', 'ä¾¿å®œ', 'å¿™', 'ç´¯', 'é¥¿', 'æ¸´'].includes(hanzi)) {
    return { chinese: `è¿™ä¸ªå¾ˆ${hanzi}ã€‚`, pinyin: `ZhÃ¨ge hÄ›n ${pinyin}.`, english: `This is very ${english}.` }
  }
  if (category.includes('place') || category.includes('location') || ['å®¶', 'å­¦æ ¡', 'å…¬å¸', 'åŒ»é™¢', 'é“¶è¡Œ', 'åº—', 'é¥­åº—', 'é…’åº—', 'æœºåœº', 'è½¦ç«™', 'å…¬å›­', 'å›¾ä¹¦é¦†'].includes(hanzi)) {
    return { chinese: `æˆ‘åœ¨${hanzi}ã€‚`, pinyin: `WÇ’ zÃ i ${pinyin}.`, english: `I am at ${english}.` }
  }
  if (category.includes('people') || category.includes('family') || ['çˆ¸çˆ¸', 'å¦ˆå¦ˆ', 'å“¥å“¥', 'å§å§', 'å¼Ÿå¼Ÿ', 'å¦¹å¦¹', 'è€å¸ˆ', 'å­¦ç”Ÿ', 'åŒ»ç”Ÿ', 'æœ‹å‹', 'åŒå­¦'].includes(hanzi)) {
    return { chinese: `ä»–æ˜¯æˆ‘çš„${hanzi}ã€‚`, pinyin: `TÄ shÃ¬ wÇ’ de ${pinyin}.`, english: `He is my ${english}.` }
  }
  if (category.includes('body') || ['æ‰‹', 'è„š', 'å¤´', 'çœ¼ç›', 'è€³æœµ', 'é¼»å­', 'å˜´', 'ç‰™', 'å¿ƒ', 'è‚šå­', 'è…¿', 'èƒ³è†Š'].includes(hanzi)) {
    return { chinese: `æˆ‘çš„${hanzi}ç–¼ã€‚`, pinyin: `WÇ’ de ${pinyin} tÃ©ng.`, english: `My ${english} hurts.` }
  }
  if (category.includes('color') || ['çº¢', 'é»„', 'è“', 'ç»¿', 'é»‘', 'ç™½', 'ç°', 'ç´«', 'ç²‰', 'æ£•'].includes(hanzi)) {
    return { chinese: `æˆ‘å–œæ¬¢${hanzi}è‰²ã€‚`, pinyin: `WÇ’ xÇhuan ${pinyin}sÃ¨.`, english: `I like ${english}.` }
  }
  if (category.includes('weather') || ['é›¨', 'é›ª', 'é£Ž', 'äº‘', 'æ™´', 'é˜´', 'å¤©æ°”'].includes(hanzi)) {
    return { chinese: `ä»Šå¤©${hanzi}å¾ˆå¤§ã€‚`, pinyin: `JÄ«ntiÄn ${pinyin} hÄ›n dÃ .`, english: `There is a lot of ${english} today.` }
  }

  const hash = hanzi.charCodeAt(0) % 5
  const patterns = [
    { chinese: `æˆ‘å¾ˆå–œæ¬¢${hanzi}ã€‚`, pinyin: `WÇ’ hÄ›n xÇhuan ${pinyin}.`, english: `I really like ${english}.` },
    { chinese: `è¿™ä¸ª${hanzi}å¾ˆå¥½ã€‚`, pinyin: `ZhÃ¨ge ${pinyin} hÄ›n hÇŽo.`, english: `This ${english} is good.` },
    { chinese: `ä½ æœ‰${hanzi}å—ï¼Ÿ`, pinyin: `NÇ yÇ’u ${pinyin} ma?`, english: `Do you have ${english}?` },
    { chinese: `æˆ‘æƒ³è¦${hanzi}ã€‚`, pinyin: `WÇ’ xiÇŽng yÃ o ${pinyin}.`, english: `I want ${english}.` },
    { chinese: `${hanzi}åœ¨å“ªé‡Œï¼Ÿ`, pinyin: `${pinyin.charAt(0).toUpperCase() + pinyin.slice(1)} zÃ i nÇŽlÇ?`, english: `Where is ${english}?` }
  ]
  return patterns[hash]
}

const getRadicalBreakdown = (word: HanziWord): { radical: string; meaning: string; story: string } | null => {
  const radicals: Record<string, { radical: string; meaning: string; story: string }> = {
    'æˆ‘': { radical: 'æ‰‹ (shÇ’u) + æˆˆ (gÄ“)', meaning: 'hand + weapon', story: 'Picture a warrior holding their weapon = "I"' },
    'ä½ ': { radical: 'äº»(person) + å°”', meaning: 'person + you', story: 'Person radical shows this relates to people' },
    'ä»–': { radical: 'äº»(person) + ä¹Ÿ', meaning: 'person + also', story: 'Person + also = he/him' },
    'å¥¹': { radical: 'å¥³ (nÇš) + ä¹Ÿ', meaning: 'woman + also', story: 'Woman + also = she/her' },
    'ä»¬': { radical: 'äº»(person) + é—¨', meaning: 'person + door', story: 'Person + gate = people (plural marker)' },
    'äºº': { radical: 'äºº', meaning: 'person (pictograph)', story: 'Two legs walking = person' },
    'å¦ˆ': { radical: 'å¥³ (nÇš) + é©¬ (mÇŽ)', meaning: 'woman + horse', story: 'Woman + é©¬ (sound) = mother' },
    'çˆ¸': { radical: 'çˆ¶ (fÃ¹) + å·´', meaning: 'father + ba', story: 'Father + å·´ (sound) = dad' },
    'å“¥': { radical: 'å¯ + å¯', meaning: 'two "can"', story: 'Double "can" = older brother (capable x2)' },
    'å§': { radical: 'å¥³ + ä¸”', meaning: 'woman + moreover', story: 'Woman + moreover = older sister' },
    'å¼Ÿ': { radical: 'ä¸· + å¼“', meaning: 'two dots + bow', story: 'Young person with bow = younger brother' },
    'å¦¹': { radical: 'å¥³ + æœª', meaning: 'woman + not yet', story: 'Young woman = younger sister' },
    'çš„': { radical: 'ç™½ + å‹º', meaning: 'white + ladle', story: 'White target = possessive marker' },
    'æ˜¯': { radical: 'æ—¥ + æ­£', meaning: 'sun + correct', story: 'Sun = correct/true = "to be"' },
    'ä¸': { radical: 'ä¸€ + ä¸¿ + åœ', meaning: 'lines crossing', story: 'Crossing lines = negation, not' },
    'äº†': { radical: 'äº†', meaning: 'child bent over', story: 'Completion/change particle' },
    'åœ¨': { radical: 'åœŸ + æ‰', meaning: 'earth + talent', story: 'Exists on earth = to be at/in' },
    'æœ‰': { radical: 'æœˆ + åˆ', meaning: 'moon + again', story: 'Hand grasping moon = to have' },
    'å—': { radical: 'å£ + é©¬', meaning: 'mouth + horse', story: 'Mouth (speech) = question marker' },
    'å‘¢': { radical: 'å£ + å°¼', meaning: 'mouth + nun', story: 'Mouth = question/mood particle' },
    'å§': { radical: 'å£ + å·´', meaning: 'mouth + phonetic', story: 'Mouth = suggestion particle' },
    'åƒ': { radical: 'å£ + ä¹ž', meaning: 'mouth + beg', story: 'Mouth begging = to eat' },
    'å–': { radical: 'å£ + æ›·', meaning: 'mouth + why not', story: 'Mouth + liquid = to drink' },
    'è¯´': { radical: 'è® + å…‘', meaning: 'speech + exchange', story: 'Speech radical = to speak/say' },
    'è¯': { radical: 'è® + èˆŒ', meaning: 'speech + tongue', story: 'Speech + tongue = words/talk' },
    'å«': { radical: 'å£ + ä¸©', meaning: 'mouth + twisted', story: 'Mouth calling out = to call/be named' },
    'å¬': { radical: 'å£ + æ–¤', meaning: 'mouth + axe', story: 'Ear near mouth = to listen' },
    'é—®': { radical: 'é—¨ + å£', meaning: 'gate + mouth', story: 'Mouth at gate asking = to ask' },
    'å”±': { radical: 'å£ + æ˜Œ', meaning: 'mouth + prosperous', story: 'Mouth + sun = to sing' },
    'çœ‹': { radical: 'æ‰‹ + ç›®', meaning: 'hand + eye', story: 'Hand shading eye = to look/see/watch' },
    'è§': { radical: 'ç›® + å„¿', meaning: 'eye + person', story: 'Eye sees person = to see/meet' },
    'è§‰': { radical: 'è§ + å­¦', meaning: 'see + learn', story: 'Learning through seeing = to feel/think' },
    'è§†': { radical: 'ç¤»+ è§', meaning: 'show + see', story: 'Showing to see = to view' },
    'æƒ³': { radical: 'ç›¸ + å¿ƒ', meaning: 'mutual + heart', story: 'Heart thinking = to think/miss/want' },
    'çˆ±': { radical: 'çˆ« + å†– + å‹', meaning: 'claw + cover + friend', story: 'Covering friend tenderly = love' },
    'å–œ': { radical: 'å£´ + å£', meaning: 'drum + mouth', story: 'Drumming and singing = happiness/like' },
    'è®¤': { radical: 'è® + äºº', meaning: 'speech + person', story: 'Speaking about person = to recognize' },
    'è¯†': { radical: 'è® + åª', meaning: 'speech + only', story: 'Speech about something = to know/recognize' },
    'æ¥': { radical: 'ä¸€ + ç±³', meaning: 'horizontal + rice', story: 'Wheat/rice growing = to come' },
    'åŽ»': { radical: 'åœŸ + åŽ¶', meaning: 'earth + private', story: 'Person leaving ground = to go' },
    'åš': { radical: 'äº»+ æ•…', meaning: 'person + old', story: 'Person working = to do/make' },
    'ä¹°': { radical: 'ä¹› + å¤´', meaning: 'hook + head', story: 'Reaching for goods = to buy' },
    'å–': { radical: 'å + ä¹°', meaning: 'ten + buy', story: 'Many transactions = to sell' },
    'å': { radical: 'äºº + äºº + åœŸ', meaning: 'two people + earth', story: 'Two people on ground = to sit' },
    'ç«™': { radical: 'ç«‹ + å ', meaning: 'stand + occupy', story: 'Standing to occupy space = to stand' },
    'èµ°': { radical: 'åœŸ + å¤­', meaning: 'earth + bent', story: 'Person moving on earth = to walk/go' },
    'è·‘': { radical: 'è¶³ + åŒ…', meaning: 'foot + wrap', story: 'Feet moving fast = to run' },
    'ç¡': { radical: 'ç›® + åž‚', meaning: 'eye + droop', story: 'Eyes drooping = to sleep' },
    'èµ·': { radical: 'èµ° + å·±', meaning: 'walk + self', story: 'Getting self to walk = to get up/rise' },
    'å¼€': { radical: 'å»¾ + ä¸€', meaning: 'two hands + one', story: 'Two hands opening gate = to open' },
    'å…³': { radical: 'é—¨ + ð¢†', meaning: 'gate + bolt', story: 'Bolt on gate = to close/shut' },
    'å†™': { radical: 'å†– + ä¸Ž', meaning: 'cover + give', story: 'Giving under cover = to write' },
    'è¯»': { radical: 'è® + å–', meaning: 'speech + sell', story: 'Reading aloud (selling words) = to read' },
    'å­¦': { radical: 'âºŒ + å­ + å†–', meaning: 'hands + child + cover', story: 'Teaching child under roof = to study/learn' },
    'æ•™': { radical: 'å­ + æ”µ', meaning: 'filial piety + strike', story: 'Elder teaching child = to teach' },
    'å·¥': { radical: 'å·¥', meaning: 'carpenter square', story: 'Tool for work = to work' },
    'ä½œ': { radical: 'äº»+ ä¹', meaning: 'person + sudden', story: 'Person working = to do/work' },
    'çŽ©': { radical: 'çŽ‹ + å…ƒ', meaning: 'jade + origin', story: 'Playing with jade = to play' },
    'ç”¨': { radical: 'ç”¨', meaning: 'usefulness', story: 'Tool being used = to use' },
    'çŸ¥': { radical: 'çŸ¢ + å£', meaning: 'arrow + mouth', story: 'Arrow-straight speech = to know' },
    'é“': { radical: 'è¾¶ + é¦–', meaning: 'walk + head', story: 'Walking with head = path/way/to say' },
    'ä¼š': { radical: 'äºº + äº‘', meaning: 'people + say', story: 'People gathering = to meet/can' },
    'èƒ½': { radical: 'åŽ¶ + åŒ• + æœˆ', meaning: 'private + spoon + moon', story: 'Bear with power = can/able' },
    'å¥½': { radical: 'å¥³ + å­', meaning: 'woman + child', story: 'Woman with child = good/well' },
    'å¤§': { radical: 'å¤§', meaning: 'big person', story: 'Person with arms stretched = big' },
    'å°': { radical: 'å°', meaning: 'small dots', story: 'Three small dots = small/little' },
    'å¤š': { radical: 'å¤• + å¤•', meaning: 'two evenings', story: 'Many evenings = many/much' },
    'å°‘': { radical: 'å° + ä¸¿', meaning: 'small + slash', story: 'Cut small = few/little' },
    'é«˜': { radical: 'é«˜', meaning: 'tall tower', story: 'Tall building = high/tall' },
    'çŸ®': { radical: 'çŸ¢ + å§”', meaning: 'arrow + bent', story: 'Bent arrow = short/low' },
    'é•¿': { radical: 'é•¿', meaning: 'long hair', story: 'Long flowing hair = long' },
    'çŸ­': { radical: 'çŸ¢ + è±†', meaning: 'arrow + bean', story: 'Short arrow = short' },
    'æ–°': { radical: 'äº² + æ–¤', meaning: 'close + axe', story: 'Cutting fresh wood = new' },
    'æ—§': { radical: 'ä¸¨ + æ—¥', meaning: 'line + sun', story: 'Old sundial = old' },
    'å¿«': { radical: 'å¿„ + å¤¬', meaning: 'heart + decide', story: 'Heart deciding quickly = fast' },
    'æ…¢': { radical: 'å¿„ + æ›¼', meaning: 'heart + graceful', story: 'Heart moving gracefully = slow' },
    'æ—©': { radical: 'æ—¥ + å', meaning: 'sun + ten', story: 'Sun rising = early' },
    'æ™š': { radical: 'æ—¥ + å…', meaning: 'sun + avoid', story: 'Sun avoiding = late/evening' },
    'å†·': { radical: 'å†« + ä»¤', meaning: 'ice + command', story: 'Ice cold = cold' },
    'çƒ­': { radical: 'æ‰§ + ç¬', meaning: 'grasp + fire', story: 'Fire below = hot' },
    'ç¾Ž': { radical: 'ç¾Š + å¤§', meaning: 'sheep + big', story: 'Big sheep = beautiful' },
    'æ¼‚': { radical: 'æ°µ + ç¥¨', meaning: 'water + ticket', story: 'Floating on water = pretty/to float' },
    'äº®': { radical: 'é«˜ + å„¿', meaning: 'tall + person', story: 'Person standing tall = bright' },
    'ä¸€': { radical: 'ä¸€', meaning: 'one line', story: 'One horizontal line = one' },
    'äºŒ': { radical: 'äºŒ', meaning: 'two lines', story: 'Two horizontal lines = two' },
    'ä¸‰': { radical: 'ä¸‰', meaning: 'three lines', story: 'Three horizontal lines = three' },
    'å¤©': { radical: 'ä¸€ + å¤§', meaning: 'one + big', story: 'Big sky above = sky/day/heaven' },
    'å¹´': { radical: 'ç¦¾ + åƒ', meaning: 'grain + thousand', story: 'Harvest every year = year' },
    'æœˆ': { radical: 'æœˆ', meaning: 'crescent moon', story: 'Moon pictograph = moon/month' },
    'æ—¥': { radical: 'æ—¥', meaning: 'sun pictograph', story: 'Sun pictograph = sun/day' },
    'æ—¶': { radical: 'æ—¥ + å¯º', meaning: 'sun + temple', story: 'Sun position at temple = time/hour' },
    'åˆ†': { radical: 'å…« + åˆ€', meaning: 'divide + knife', story: 'Knife dividing = minute/to divide' },
    'å®¶': { radical: 'å®€ + è±•', meaning: 'roof + pig', story: 'Pig under roof = home/family' },
    'æ ¡': { radical: 'æœ¨ + äº¤', meaning: 'wood + cross', story: 'Building for learning = school' },
  }
  return radicals[word.simplified] || null
}

const getStrokeOrderInfo = (word: HanziWord): { strokeCount: number; strokeOrder: string; tips: string } | null => {
  const strokeInfo: Record<string, { strokeCount: number; strokeOrder: string; tips: string }> = {
    'æˆ‘': { strokeCount: 7, strokeOrder: 'Left to right: hand â†’ weapon', tips: 'Write the left side (æ‰‹) first, then right side (æˆˆ)' },
    'ä½ ': { strokeCount: 7, strokeOrder: 'Left to right: person â†’ å°”', tips: 'Person radical (äº») first with 2 strokes' },
    'ä»–': { strokeCount: 5, strokeOrder: 'Left to right: person â†’ ä¹Ÿ', tips: 'Person radical (äº») then ä¹Ÿ' },
    'å¥¹': { strokeCount: 6, strokeOrder: 'Left to right: woman â†’ ä¹Ÿ', tips: 'Woman radical (å¥³) first with 3 strokes' },
    'ä»¬': { strokeCount: 5, strokeOrder: 'Left to right: person â†’ door', tips: 'Person radical (äº») + simplified door' },
    'çš„': { strokeCount: 8, strokeOrder: 'Left to right: white â†’ spoon', tips: 'Write ç™½ first (left), then å‹º (right)' },
    'æ˜¯': { strokeCount: 9, strokeOrder: 'Top to bottom: sun â†’ correct', tips: 'Write æ—¥ on top, then bottom part' },
    'ä¸': { strokeCount: 4, strokeOrder: 'Top to bottom, center out', tips: 'Vertical center line first, then spread' },
    'äº†': { strokeCount: 2, strokeOrder: 'Hook â†’ diagonal', tips: 'Very simple: hook then one stroke' },
    'åœ¨': { strokeCount: 6, strokeOrder: 'Top to bottom: åœŸ â†’ ä¸€', tips: 'Write åœŸ first, then talent (æ‰) below' },
    'æœ‰': { strokeCount: 6, strokeOrder: 'Top to bottom: moon â†’ again', tips: 'Write æœˆ first, then åˆ (hand)' },
    'è¿™': { strokeCount: 7, strokeOrder: 'Top left first, then walk radical', tips: 'æ–‡ component first, then walk (è¾¶) wraps' },
    'ä¸ª': { strokeCount: 3, strokeOrder: 'Left to right: slash â†’ frame', tips: 'Diagonal first, then vertical+hook' },
    'å—': { strokeCount: 6, strokeOrder: 'Left to right: mouth â†’ horse', tips: 'Mouth (å£) first, then é©¬ for sound' },
    'å‘¢': { strokeCount: 8, strokeOrder: 'Left to right: mouth â†’ nun', tips: 'Mouth (å£) radical first' },
    'å§': { strokeCount: 7, strokeOrder: 'Left to right: mouth â†’ ba', tips: 'Mouth (å£) first for speech' },
    'ä¸€': { strokeCount: 1, strokeOrder: 'Single stroke left to right', tips: 'ONE horizontal line, simple!' },
    'äºŒ': { strokeCount: 2, strokeOrder: 'Top line first, then bottom', tips: 'TWO parallel horizontals' },
    'ä¸‰': { strokeCount: 3, strokeOrder: 'Top to bottom, 3 lines', tips: 'THREE stacked horizontals' },
    'å››': { strokeCount: 5, strokeOrder: 'Outside frame â†’ inside lines', tips: 'Box first, then TWO inner strokes' },
    'äº”': { strokeCount: 4, strokeOrder: 'Top to bottom: äºŒ â†’ X', tips: 'Horizontal lines first, then cross' },
    'å…­': { strokeCount: 4, strokeOrder: 'Top dot â†’ spread strokes', tips: 'Dot on top, then expand down' },
    'ä¸ƒ': { strokeCount: 2, strokeOrder: 'Horizontal â†’ vertical hook', tips: 'Horizontal FIRST, then hook down' },
    'å…«': { strokeCount: 2, strokeOrder: 'Left diagonal â†’ right diagonal', tips: "Like a person's legs spreading" },
    'ä¹': { strokeCount: 2, strokeOrder: 'Diagonal â†’ curved hook', tips: 'Short stroke then big hook' },
    'å': { strokeCount: 2, strokeOrder: 'Horizontal â†’ vertical', tips: 'Cross: horizontal FIRST through center' },
    'æ¥': { strokeCount: 7, strokeOrder: 'Top to bottom, center out', tips: '"To come" - wheat growing' },
    'åŽ»': { strokeCount: 5, strokeOrder: 'Top åœŸ â†’ bottom hook', tips: '"To go" - person leaving ground' },
    'çœ‹': { strokeCount: 9, strokeOrder: 'Top æ‰‹ â†’ bottom ç›®', tips: '"To see" - hand shading eye' },
    'å¬': { strokeCount: 7, strokeOrder: 'Left å£ â†’ right component', tips: '"To listen" - mouth receiving' },
    'è¯´': { strokeCount: 9, strokeOrder: 'Left speech â†’ right å…‘', tips: '"To speak" - speech radical first' },
    'è¯»': { strokeCount: 10, strokeOrder: 'Left speech â†’ right å–', tips: '"To read" - selling words aloud' },
    'å†™': { strokeCount: 5, strokeOrder: 'Top cover â†’ bottom part', tips: '"To write" - cover + giving' },
    'åƒ': { strokeCount: 6, strokeOrder: 'Left å£ â†’ right beg', tips: '"To eat" - mouth begging' },
    'å–': { strokeCount: 12, strokeOrder: 'Left å£ â†’ right complex', tips: '"To drink" - mouth + why not liquid' },
    'ä¹°': { strokeCount: 6, strokeOrder: 'Top net â†’ bottom head', tips: '"To buy" - reaching for goods' },
    'å–': { strokeCount: 8, strokeOrder: 'Top å â†’ bottom ä¹°', tips: '"To sell" - many transactions' },
    'åš': { strokeCount: 11, strokeOrder: 'Left äº» â†’ right æ•…', tips: '"To do" - person working' },
    'å': { strokeCount: 7, strokeOrder: 'Top people â†’ bottom earth', tips: '"To sit" - two people on ground' },
    'èµ°': { strokeCount: 7, strokeOrder: 'Top åœŸ â†’ bottom bent', tips: '"To walk" - feet moving on earth' },
    'å¼€': { strokeCount: 4, strokeOrder: 'Two hands opening', tips: '"To open" - hands pushing gate' },
    'ä½': { strokeCount: 7, strokeOrder: 'Left äº» â†’ right master', tips: '"To live" - person at home' },
    'æƒ³': { strokeCount: 13, strokeOrder: 'Top ç›¸ â†’ bottom å¿ƒ', tips: '"To think" - heart thinking' },
    'çˆ±': { strokeCount: 10, strokeOrder: 'Top claw â†’ middle â†’ friend', tips: '"To love" - covering friend tenderly' },
    'å–œ': { strokeCount: 12, strokeOrder: 'Top drum â†’ bottom mouth', tips: '"To like" - drumming happiness' },
    'çŸ¥': { strokeCount: 8, strokeOrder: 'Left arrow â†’ right mouth', tips: '"To know" - arrow-straight speech' },
    'é“': { strokeCount: 12, strokeOrder: 'Left head â†’ right walk', tips: '"Way/path" - walking with head' },
    'ä¼š': { strokeCount: 6, strokeOrder: 'Top cloud â†’ bottomäºº', tips: '"Can/meet" - people gathering' },
    'èƒ½': { strokeCount: 10, strokeOrder: 'Complex - left to right', tips: '"Can/able" - bear with power' },
    'å«': { strokeCount: 5, strokeOrder: 'Left å£ â†’ right twist', tips: '"To call" - mouth calling out' },
    'é—®': { strokeCount: 6, strokeOrder: 'Outside é—¨ â†’ inside å£', tips: '"To ask" - mouth at gate' },
    'å­¦': { strokeCount: 8, strokeOrder: 'Top hands â†’ child â†’ cover', tips: '"To study" - teaching child' },
    'æ•™': { strokeCount: 11, strokeOrder: 'Left filial â†’ right strike', tips: '"To teach" - elder teaching' },
    'å·¥': { strokeCount: 3, strokeOrder: 'Top â†’ middle â†’ bottom', tips: '"Work" - carpenter\'s square tool' },
    'ä½œ': { strokeCount: 7, strokeOrder: 'Left äº» â†’ right sudden', tips: '"To work/do" - person working' },
    'å¦ˆ': { strokeCount: 6, strokeOrder: 'Left å¥³ â†’ right é©¬', tips: 'Woman + horse sound = mom' },
    'çˆ¸': { strokeCount: 8, strokeOrder: 'Top çˆ¶ â†’ bottom å·´', tips: 'Father + ba sound = dad' },
    'å“¥': { strokeCount: 10, strokeOrder: 'Top å¯ â†’ bottom å¯', tips: 'Double "can" = capable older brother' },
    'å§': { strokeCount: 8, strokeOrder: 'Left å¥³ â†’ right ä¸”', tips: 'Woman + moreover = older sister' },
    'å¼Ÿ': { strokeCount: 7, strokeOrder: 'Center out, top to bottom', tips: 'Young person = younger brother' },
    'å¦¹': { strokeCount: 8, strokeOrder: 'Left å¥³ â†’ right æœª', tips: 'Young woman = younger sister' },
    'å„¿': { strokeCount: 2, strokeOrder: 'Diagonal â†’ hook', tips: 'Child with bent legs' },
    'å­': { strokeCount: 3, strokeOrder: 'Hook â†’ hook â†’ horizontal', tips: 'Baby with arms up' },
    'äºº': { strokeCount: 2, strokeOrder: 'Left diagonal â†’ right diagonal', tips: 'Person standing with legs spread' },
    'è€': { strokeCount: 6, strokeOrder: 'Top to bottom', tips: 'Elder person = old' },
    'å¸ˆ': { strokeCount: 6, strokeOrder: 'Left å·¾ â†’ right strokes', tips: 'One who teaches' },
    'ç”Ÿ': { strokeCount: 5, strokeOrder: 'Top to bottom', tips: 'Growing plant = life/student' },
    'æœ‹': { strokeCount: 8, strokeOrder: 'Left æœˆ â†’ right æœˆ', tips: 'Two moons = friend' },
    'å‹': { strokeCount: 4, strokeOrder: 'Top to bottom: hand joining', tips: 'Two hands = friend' },
    'ç”·': { strokeCount: 7, strokeOrder: 'Top ç”° â†’ bottom åŠ›', tips: 'Field + strength = man' },
    'å¥³': { strokeCount: 3, strokeOrder: 'Diagonal â†’ diagonal â†’ horizontal', tips: 'Kneeling woman' },
    'å¥½': { strokeCount: 6, strokeOrder: 'Left å¥³ â†’ right å­', tips: 'Woman + child = good' },
    'å¤§': { strokeCount: 3, strokeOrder: 'Horizontal â†’ two diagonals', tips: 'Person with arms wide = big' },
    'å°': { strokeCount: 3, strokeOrder: 'Center vertical â†’ sides', tips: 'Center stroke first = small' },
    'å¤š': { strokeCount: 6, strokeOrder: 'Two sets of evening', tips: 'Many evenings = much' },
    'å°‘': { strokeCount: 4, strokeOrder: 'å° â†’ diagonal cut', tips: 'Cut small = few/little' },
    'é«˜': { strokeCount: 10, strokeOrder: 'Top dot â†’ complex structure', tips: 'Tall tower = high' },
    'é•¿': { strokeCount: 4, strokeOrder: 'Diagonal â†’ horizontal â†’ vertical â†’ diagonal', tips: 'Long flowing hair = long' },
    'æ–°': { strokeCount: 13, strokeOrder: 'Left tree â†’ right complex', tips: 'Cutting fresh wood = new' },
    'å†·': { strokeCount: 7, strokeOrder: 'Left ice â†’ right command', tips: 'Ice = cold' },
    'çƒ­': { strokeCount: 10, strokeOrder: 'Top grasp â†’ bottom fire', tips: 'Fire below = hot' },
    'å¹´': { strokeCount: 6, strokeOrder: 'Diagonal â†’ horizontals â†’ vertical', tips: 'Grain harvest = year' },
    'æœˆ': { strokeCount: 4, strokeOrder: 'Vertical â†’ hook â†’ horizontals', tips: 'Crescent moon = month' },
    'æ—¥': { strokeCount: 4, strokeOrder: 'Box with horizontal inside', tips: 'Sun square = day' },
    'å¤©': { strokeCount: 4, strokeOrder: 'Two horizontals â†’ person', tips: 'Sky above = heaven/day' },
    'ä»Š': { strokeCount: 4, strokeOrder: 'Top to bottom', tips: 'Now/today' },
    'æ˜Ž': { strokeCount: 8, strokeOrder: 'Left æ—¥ â†’ right æœˆ', tips: 'Sun + moon = bright/tomorrow' },
    'æ˜Ÿ': { strokeCount: 9, strokeOrder: 'Top æ—¥ â†’ bottom ç”Ÿ', tips: 'Sun + life = star' },
    'æœŸ': { strokeCount: 12, strokeOrder: 'Left å…¶ â†’ right æœˆ', tips: 'Period of time' },
    'æ—¶': { strokeCount: 7, strokeOrder: 'Left æ—¥ â†’ right å¯º', tips: 'Sun position = time' },
    'åˆ†': { strokeCount: 4, strokeOrder: 'Divide with knife', tips: 'Splitting = minute/divide' },
    'æ—©': { strokeCount: 6, strokeOrder: 'Top æ—¥ â†’ bottom å', tips: 'Sun rising = early' },
    'ä¸Š': { strokeCount: 3, strokeOrder: 'Vertical â†’ two horizontals', tips: 'Line above = up' },
    'ä¸‹': { strokeCount: 3, strokeOrder: 'Horizontal â†’ vertical â†’ dot', tips: 'Line below = down' },
    'ä¸­': { strokeCount: 4, strokeOrder: 'Vertical â†’ frame â†’ vertical', tips: 'Arrow through center = middle' },
    'é‡Œ': { strokeCount: 7, strokeOrder: 'Top â†’ bottom in field', tips: 'Inside the field = inside' },
    'å¤–': { strokeCount: 5, strokeOrder: 'Top evening â†’ divination', tips: 'Outside divination = outside' },
    'å‰': { strokeCount: 9, strokeOrder: 'Top â†’ middle â†’ bottom', tips: 'Before/in front' },
    'åŽ': { strokeCount: 6, strokeOrder: 'Diagonal â†’ vertical â†’ horizontals', tips: 'After/behind' },
    'å·¦': { strokeCount: 5, strokeOrder: 'Top hand â†’ bottom work', tips: 'Left side' },
    'å³': { strokeCount: 5, strokeOrder: 'Top hand â†’ bottom mouth', tips: 'Right side' },
    'ä¸œ': { strokeCount: 5, strokeOrder: 'Inside tree â†’ outside box', tips: 'Sun through trees = east' },
    'è¥¿': { strokeCount: 6, strokeOrder: 'Top â†’ horizontals in box', tips: 'Sun setting = west' },
    'å—': { strokeCount: 9, strokeOrder: 'Complex compass shape', tips: 'Pointing south' },
    'åŒ—': { strokeCount: 5, strokeOrder: 'Two people back-to-back', tips: 'Facing north' },
    'ä¹¦': { strokeCount: 9, strokeOrder: 'Top â†’ middle â†’ bottom', tips: 'Book with pages' },
    'æœ¬': { strokeCount: 5, strokeOrder: 'Tree with mark at root', tips: 'Root/origin of tree = book' },
    'è½¦': { strokeCount: 4, strokeOrder: 'Top to bottom frame', tips: 'Vehicle with wheels' },
    'æ°´': { strokeCount: 4, strokeOrder: 'Center vertical â†’ sides', tips: 'Water flowing' },
    'ç«': { strokeCount: 4, strokeOrder: 'Top dot â†’ spreading flames', tips: 'Fire flames rising' },
    'æœ¨': { strokeCount: 4, strokeOrder: 'Horizontal â†’ vertical â†’ branches', tips: 'Tree trunk and branches' },
    'åœŸ': { strokeCount: 3, strokeOrder: 'Horizontal â†’ vertical â†’ horizontal', tips: 'Earth/soil' },
    'å±±': { strokeCount: 3, strokeOrder: 'Vertical â†’ fold â†’ vertical', tips: 'Three mountain peaks' },
    'æ‰‹': { strokeCount: 4, strokeOrder: 'Diagonal â†’ horizontals â†’ hook', tips: 'Hand with fingers' },
    'å£': { strokeCount: 3, strokeOrder: 'Vertical â†’ fold â†’ horizontal', tips: 'Mouth opening' },
    'å¿ƒ': { strokeCount: 4, strokeOrder: 'Three dots â†’ hook', tips: 'Heart beating' },
    'é—¨': { strokeCount: 3, strokeOrder: 'Dot â†’ vertical â†’ hook', tips: 'Door/gate' },
    'ç›®': { strokeCount: 5, strokeOrder: 'Box with horizontals inside', tips: 'Eye with pupil' },
    'ç”°': { strokeCount: 5, strokeOrder: 'Box with cross inside', tips: 'Rice field' },
    'çŸ³': { strokeCount: 5, strokeOrder: 'Cliff with rock', tips: 'Stone/rock' },
  }
  return strokeInfo[word.simplified] || null
}

const getVisualAid = (word: HanziWord): string | null => {
  const visualAids: Record<string, string> = {
    'äºº': 'ðŸ‘¤ Person with legs spread walking',
    'å¤§': 'ðŸ¤¸ Person with arms and legs stretched wide',
    'å°': 'ðŸ‘¶ Three small dots like grains of sand',
    'å¤©': 'â˜ï¸ Big sky above the horizon (ä¸€ + å¤§)',
    'æ—¥': 'â˜€ï¸ Square picture of the sun with rays inside',
    'æœˆ': 'ðŸŒ™ Crescent moon shape in the night sky',
    'å±±': 'â›°ï¸ Three mountain peaks side by side',
    'æ°´': 'ðŸ’§ Water flowing down like a river',
    'ç«': 'ðŸ”¥ Flames rising and spreading upward',
    'æœ¨': 'ðŸŒ³ Tree with trunk and branches spreading',
    'åœŸ': 'ðŸŒ± Earth with a plant growing from ground',
    'ç”°': 'ðŸŒ¾ Rice paddy field divided into sections',
    'å£': 'ðŸ‘„ Open mouth ready to speak',
    'ç›®': 'ðŸ‘ï¸ Eye with pupil and iris lines',
    'æ‰‹': 'âœ‹ Hand with four fingers extended',
    'å¿ƒ': 'â¤ï¸ Heart with beats (three dots)',
    'é—¨': 'ðŸšª Double swinging door or gate',
    'è€³': 'ðŸ‘‚ Ear shape from the side view',
    'å¥³': 'ðŸ‘© Woman kneeling gracefully',
    'å­': 'ðŸ‘¶ Baby with arms outstretched upward',
    'ç”·': 'ðŸ’ª Field + strength = man working',
    'å¥½': 'ðŸ‘©â€ðŸ‘¦ Woman + child = goodness, happiness',
    'å®¶': 'ðŸ  Pig under roof = home (ancient wealth)',
    'é©¬': 'ðŸ´ Horse with flowing mane and four legs',
    'ç‰›': 'ðŸ„ Ox with two horns on top',
    'ç¾Š': 'ðŸ‘ Sheep with curved horns',
    'çŠ¬': 'ðŸ• Dog standing alert on guard',
    'é±¼': 'ðŸŸ Fish with scales, fins and tail',
    'é¸Ÿ': 'ðŸ¦… Bird with wings spread in flight',
    'è™«': 'ðŸ› Insect or bug crawling',
    'é¾Ÿ': 'ðŸ¢ Turtle with shell pattern',
    'é›¨': 'ðŸŒ§ï¸ Rain drops falling from clouds',
    'é›ª': 'â„ï¸ Snowflakes falling gently',
    'äº‘': 'â˜ï¸ White cloud floating in sky',
    'é£Ž': 'ðŸ’¨ Wind blowing leaves and air',
    'ç”µ': 'âš¡ Lightning bolt striking down',
    'é›·': 'â›ˆï¸ Thunder and lightning in storm',
    'çŸ³': 'ðŸª¨ Rock or stone under a cliff',
    'æ²™': 'ðŸ–ï¸ Sand particles by water',
    'è‰': 'ðŸŒ¿ Grass blades growing from earth',
    'èŠ±': 'ðŸŒ¸ Flower blooming with petals',
    'æ ‘': 'ðŸŒ² Tall tree standing upright',
    'æž—': 'ðŸŒ²ðŸŒ³ Two trees together = forest',
    'æ£®': 'ðŸŒ²ðŸŒ³ðŸŒ² Three trees = dense forest',
    'å¤´': 'ðŸ¤• Head on top of body',
    'é¢': 'ðŸ˜Š Face with features',
    'çœ¼': 'ðŸ‘€ Two eyes looking',
    'é¼»': 'ðŸ‘ƒ Nose in center of face',
    'å˜´': 'ðŸ‘„ Mouth for eating and speaking',
    'ç‰™': 'ðŸ¦· Teeth for biting',
    'èˆŒ': 'ðŸ‘… Tongue inside mouth',
    'è„š': 'ðŸ¦¶ Foot for walking',
    'è…¿': 'ðŸ¦µ Leg for standing',
    'è‚š': 'ðŸ«„ Belly/stomach area',
    'é¥­': 'ðŸš Cooked rice in bowl',
    'èœ': 'ðŸ¥¬ Vegetable greens',
    'è‚‰': 'ðŸ¥© Meat cut from animal',
    'è›‹': 'ðŸ¥š Egg from chicken',
    'èŒ¶': 'ðŸµ Tea leaves in hot water',
    'é…’': 'ðŸ· Alcoholic drink in vessel',
    'å¥¶': 'ðŸ¥› Milk from cow/mother',
    'ç³–': 'ðŸ¬ Sweet sugar candy',
    'ç›': 'ðŸ§‚ Salt for seasoning',
    'æ²¹': 'ðŸ›¢ï¸ Oil or fat liquid',
    'è½¦': 'ðŸš— Vehicle with wheels',
    'èˆ¹': 'â›µ Boat sailing on water',
    'åˆ€': 'ðŸ”ª Knife blade for cutting',
    'ç¬”': 'âœï¸ Writing brush or pen',
    'çº¸': 'ðŸ“„ Paper sheet for writing',
    'ä¹¦': 'ðŸ“– Book with pages',
    'æ¡Œ': 'ðŸª‘ Table/desk for working',
    'æ¤…': 'ðŸª‘ Chair for sitting',
    'åºŠ': 'ðŸ›ï¸ Bed for sleeping',
    'æ¯': 'ðŸ¥¤ Cup for drinking',
    'ç¢—': 'ðŸ¥£ Bowl for eating',
    'ä¼ž': 'â˜‚ï¸ Umbrella for rain protection',
    'è¡£': 'ðŸ‘• Clothing to wear',
    'å¸½': 'ðŸŽ© Hat on head',
    'éž‹': 'ðŸ‘Ÿ Shoes for feet',
    'åŒ…': 'ðŸŽ’ Bag for carrying things',
    'é’±': 'ðŸ’° Money/coins',
    'ç¯': 'ðŸ’¡ Light/lamp glowing',
    'é’Ÿ': 'ðŸ• Clock showing time',
    'é•œ': 'ðŸªž Mirror for reflection',
    'ä¸€': '1ï¸âƒ£ One horizontal line',
    'äºŒ': '2ï¸âƒ£ Two horizontal lines stacked',
    'ä¸‰': '3ï¸âƒ£ Three horizontal lines stacked',
    'å››': '4ï¸âƒ£ Box with cross inside = four directions',
    'äº”': '5ï¸âƒ£ Five fingers on a hand',
    'å…­': '6ï¸âƒ£ Six sides of a roof',
    'ä¸ƒ': '7ï¸âƒ£ Seven - horizontal with hook',
    'å…«': '8ï¸âƒ£ Eight - two sides spreading',
    'ä¹': '9ï¸âƒ£ Nine - diagonal with hook',
    'å': 'ðŸ”Ÿ Ten - cross shape (vertical + horizontal)',
    'ç™¾': 'ðŸ’¯ Hundred - white (ä¸€) + person',
    'åƒ': 'ðŸŽ¯ Thousand - person (äº») + ten (å)',
    'ä¸‡': 'â­ Ten thousand - many points',
    'ä¸Š': 'â¬†ï¸ Arrow pointing up',
    'ä¸‹': 'â¬‡ï¸ Arrow pointing down',
    'å·¦': 'â¬…ï¸ Hand on left side',
    'å³': 'âž¡ï¸ Hand/mouth on right side',
    'ä¸œ': 'ðŸŒ… Sun rising through trees = east',
    'è¥¿': 'ðŸŒ† Sun setting with basket = west',
    'å—': 'ðŸ§­ Pointing south with compass',
    'åŒ—': 'ðŸ§Š Two people back-to-back = north',
    'ä¸­': 'ðŸŽ¯ Arrow through center target',
    'å‰': 'ðŸ‘‰ Pointing forward ahead',
    'åŽ': 'ðŸ‘ˆ Behind/after in back',
    'é‡Œ': 'ðŸ“ Inside the village/field',
    'å¤–': 'ðŸšª Outside beyond the door',
  }
  return (visualAids[word.simplified] ?? '').replace(/^[^a-zA-Z0-9\u4e00-\u9fff]+/, '').trim() || null
}

const getLearningTip = (word: HanziWord): string => {
  const tips: Record<string, string> = {
    'æˆ‘': 'This character represents "I/me". Notice it looks like a person with a weapon - defending themselves.',
    'ä½ ': 'Used for "you" when speaking to someone. The left part (äº») means "person".',
    'ä»–': 'Means "he". The left side (äº») indicates it\'s person-related.',
    'å¥¹': 'Means "she". Notice the female radical (å¥³) on the left.',
    'çš„': 'One of the most common characters! Used to show possession, like "\'s" in English.',
    'æ˜¯': 'The verb "to be". Essential for basic sentences!',
    'å¥½': 'Can mean "good", "well", or "OK". Notice it combines å¥³ (woman) and å­ (child).',
    'å¤§': 'Looks like a person standing with arms stretched wide - representing "big"!',
    'å°': 'Notice the small dots - they represent something small.',
  }
  if (tips[word.simplified]) return tips[word.simplified]
  if (word.category === 'verb') return 'This is a verb (action word). Try using it with "æˆ‘" (I) to practice!'
  if (word.category === 'noun') return 'This is a noun. You can use it with "è¿™æ˜¯" (this is) to practice.'
  if (word.category === 'adjective') return 'This is an adjective (describing word). Use it with "å¾ˆ" (very) to describe things!'
  return 'Practice this word in different sentences to remember it better!'
}

// â”€â”€â”€ Info Cards (shared between learn and review) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const InfoCards = ({ word, animated = false }: { word: HanziWord; animated?: boolean }) => {
  const radical = getRadicalBreakdown(word)
  const stroke = getStrokeOrderInfo(word)
  const visual = getVisualAid(word)
  const example = getExampleSentence(word)
  const tip = getLearningTip(word)

  const Wrap = animated
    ? ({ delay, children }: { delay: number; children: React.ReactNode }) => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
          {children}
        </motion.div>
      )
    : ({ children }: { delay: number; children: React.ReactNode }) => <>{children}</>

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 mt-3">
        {radical && (
          <Wrap delay={0.4}>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-bold">éƒ¨</span>
                </div>
                <h3 className="text-[10px] font-bold text-purple-900">Radicals</h3>
              </div>
              <div className="space-y-1">
                <div className="text-purple-900 font-medium text-xs">{radical.radical}</div>
                <div className="text-purple-800 text-[10px]">{radical.meaning}</div>
              </div>
            </div>
          </Wrap>
        )}

        {stroke && (
          <Wrap delay={0.5}>
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-4 h-4 bg-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-bold">ç¬”</span>
                </div>
                <h3 className="text-[10px] font-bold text-pink-900">Strokes</h3>
              </div>
              <div className="space-y-1">
                <div className="text-pink-900 font-medium text-xs">{stroke.strokeCount} strokes</div>
                <div className="text-pink-800 text-[10px] font-chinese">{stroke.strokeOrder.substring(0, 20)}...</div>
              </div>
            </div>
          </Wrap>
        )}

        {visual && (
          <Wrap delay={0.6}>
            <div className="bg-success-50 border border-success-200 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-4 h-4 bg-success-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Eye className="w-2.5 h-2.5 text-white" />
                </div>
                <h3 className="text-[10px] font-bold text-success-900">Visual</h3>
              </div>
              <div className="text-success-800 text-[10px] line-clamp-3">{visual}</div>
            </div>
          </Wrap>
        )}

        <Wrap delay={0.7}>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <BookOpen className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <h3 className="text-[10px] font-bold text-blue-900">Example</h3>
            </div>
            <div className="space-y-0.5">
              <div className="text-xs text-gray-900 font-chinese">{example.chinese}</div>
              <div className="text-[10px] text-blue-600">{example.pinyin}</div>
            </div>
          </div>
        </Wrap>

        <Wrap delay={0.8}>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Trophy className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <h3 className="text-[10px] font-bold text-amber-900">Tip</h3>
            </div>
            <div className="text-amber-900 text-[10px] line-clamp-3">{tip}</div>
          </div>
        </Wrap>
      </div>

      <div className="space-y-2 mt-3">
        {stroke && (
          <details className="bg-pink-50 border border-pink-200 rounded-lg">
            <summary className="p-2 cursor-pointer text-xs font-semibold text-pink-900 hover:bg-pink-100 flex items-center gap-1.5">
              <PenLine className="w-3 h-3 flex-shrink-0" /> Interactive Stroke Practice
            </summary>
            <div className="p-3 border-t border-pink-200">
              <div className="flex justify-center">
                <StrokeOrderDisplay character={word.simplified} size={150} showControls={true} />
              </div>
              <p className="text-[10px] text-pink-700 text-center mt-2">
                Click "Animate" to see stroke order, or "Practice" to draw!
              </p>
            </div>
          </details>
        )}

        <details className="bg-amber-50 border border-amber-200 rounded-lg">
          <summary className="p-2 cursor-pointer text-xs font-semibold text-amber-900 hover:bg-amber-100 flex items-center gap-1.5">
            <History className="w-3 h-3 flex-shrink-0" /> Character Evolution History
          </summary>
          <div className="p-3 border-t border-amber-200">
            <CharacterEtymology character={word.simplified} word={word} className="" />
          </div>
        </details>
      </div>
    </>
  )
}

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface LearnReviewModeProps {
  words: HanziWord[]
  currentWordIndex: number
  mode: 'learn' | 'review'
  showAnswer: boolean
  loading: boolean
  onShowAnswer: () => void
  onNextWord: (knewIt?: boolean) => void
  onBack: () => void
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function LearnReviewMode({
  words,
  currentWordIndex,
  mode,
  showAnswer,
  loading,
  onShowAnswer,
  onNextWord,
  onBack,
}: LearnReviewModeProps) {
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
          onClick={onBack}
          className="bg-primary-600 text-white rounded-2xl px-6 py-3.5 font-semibold hover:bg-primary-700 transition-all flex items-center gap-2 cursor-pointer mx-auto"
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
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            â† Back
          </button>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400">
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
                ? 'bg-gradient-to-r from-success-500 to-success-600'
                : 'bg-gradient-to-r from-primary-500 to-primary-600'
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
            <div className="flex flex-col gap-3">

              {/* Top: Character & Image */}
              <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-start">
                <div className="flex-shrink-0 text-center">
                  <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-gray-900 dark:text-gray-100">
                    {currentWord.simplified}
                  </div>
                </div>
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
                {/* Learn mode: show info immediately */}
                {mode === 'learn' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <div className="text-lg sm:text-xl text-primary-600 font-semibold">{currentWord.pinyin}</div>
                      <AudioButton text={currentWord.simplified} language="cmn-CN" size="sm" variant="secondary" tooltipText="Hear the pronunciation" />
                    </div>
                    <div className="text-base sm:text-lg text-gray-700 font-medium text-center sm:text-left">{currentWord.english}</div>
                    {currentWord.category && (
                      <div className="flex justify-center sm:justify-start">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                          {currentWord.category}
                        </span>
                      </div>
                    )}
                    <InfoCards word={currentWord} animated={false} />
                  </motion.div>
                )}

                {/* Review mode: hide until user clicks */}
                {mode === 'review' && showAnswer && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <div className="text-lg sm:text-xl text-primary-600 dark:text-primary-400 font-semibold">{currentWord.pinyin}</div>
                      <AudioButton text={currentWord.simplified} language="cmn-CN" size="sm" variant="secondary" tooltipText="Hear the pronunciation" />
                    </div>
                    <div className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium text-center sm:text-left">{currentWord.english}</div>
                    {currentWord.category && (
                      <div className="flex justify-center sm:justify-start">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400">
                          {currentWord.category}
                        </span>
                      </div>
                    )}
                    {currentWord.image_url && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center"
                      >
                        <VocabularyImage imageUrl={currentWord.image_url} word={currentWord.simplified} size="md" showLabel={false} />
                      </motion.div>
                    )}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                      <InfoCards word={currentWord} animated={true} />
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {mode === 'learn' ? (
                <button
                  onClick={() => onNextWord()}
                  className="bg-primary-600 text-white rounded-2xl px-6 py-3.5 font-semibold hover:bg-primary-700 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <ArrowRight className="w-5 h-5" />
                  Next Word
                </button>
              ) : (
                <>
                  {!showAnswer ? (
                    <button
                      onClick={onShowAnswer}
                      className="bg-primary-600 text-white rounded-2xl px-6 py-3.5 font-semibold hover:bg-primary-700 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <BookOpen className="w-5 h-5" />
                      Show Answer
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => onNextWord(true)}
                        className="bg-primary-600 text-white rounded-2xl px-6 py-3.5 font-semibold hover:bg-primary-700 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <CheckCircle className="w-5 h-5" />
                        I Knew It!
                      </button>
                      <button
                        onClick={() => onNextWord(false)}
                        className="border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl px-6 py-3.5 font-semibold hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6">
        {mode === 'learn' && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800 rounded-2xl p-4">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>Learn Mode:</strong> Take your time to study each character. All information is shown to help you learn.
            </p>
          </div>
        )}
        {mode === 'review' && (
          <div className="bg-success-50 dark:bg-success-950/30 border border-success-100 dark:border-success-800 rounded-2xl p-4">
            <p className="text-sm text-success-900 dark:text-success-300">
              <strong>Review Mode:</strong> Try to recall the meaning before revealing the answer. Active recall strengthens memory!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

