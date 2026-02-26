/**
 * Pinyin Input Utility
 * Handles conversion of numbered pinyin to tone marks and validation
 */

// Tone mark mappings for each vowel
const toneMap: Record<string, Record<number, string>> = {
  a: { 1: 'ā', 2: 'á', 3: 'ǎ', 4: 'à', 5: 'a' },
  e: { 1: 'ē', 2: 'é', 3: 'ě', 4: 'è', 5: 'e' },
  i: { 1: 'ī', 2: 'í', 3: 'ǐ', 4: 'ì', 5: 'i' },
  o: { 1: 'ō', 2: 'ó', 3: 'ǒ', 4: 'ò', 5: 'o' },
  u: { 1: 'ū', 2: 'ú', 3: 'ǔ', 4: 'ù', 5: 'u' },
  ü: { 1: 'ǖ', 2: 'ǘ', 3: 'ǚ', 4: 'ǜ', 5: 'ü' },
  v: { 1: 'ǖ', 2: 'ǘ', 3: 'ǚ', 4: 'ǜ', 5: 'ü' }
}

/**
 * Converts numbered pinyin to pinyin with tone marks
 * Examples:
 *   - ni3 hao3 → nǐ hǎo
 *   - zhong1 guo2 → zhōng guó
 *   - ma5 → ma (neutral tone)
 */
export function convertNumberedPinyin(text: string): string {
  // Replace v with ü
  text = text.replace(/v/g, 'ü')

  // Process each syllable
  const syllables = text.split(/\s+/)
  const converted = syllables.map(syllable => {
    // Match pinyin with tone number (e.g., "ni3", "hao3")
    const match = syllable.match(/^([a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+?)([1-5])$/i)
    if (!match) return syllable

    const [, pinyin, toneNum] = match
    const tone = parseInt(toneNum)

    return applyToneToSyllable(pinyin.toLowerCase(), tone)
  })

  return converted.join(' ')
}

/**
 * Apply tone mark to a pinyin syllable
 * Rules:
 * 1. Priority: a > e > o > (i, u last)
 * 2. For "iu" or "ui", apply to last vowel
 */
function applyToneToSyllable(pinyin: string, tone: number): string {
  // Find the vowel to apply tone to
  let applied = false
  let result = ''

  // Rule 1: If 'a' or 'e' exists, apply tone to it
  if (pinyin.includes('a')) {
    for (let i = 0; i < pinyin.length; i++) {
      const char = pinyin[i]
      if (char === 'a' && !applied) {
        result += toneMap['a'][tone]
        applied = true
      } else {
        result += char
      }
    }
    return result
  }

  if (pinyin.includes('e')) {
    for (let i = 0; i < pinyin.length; i++) {
      const char = pinyin[i]
      if (char === 'e' && !applied) {
        result += toneMap['e'][tone]
        applied = true
      } else {
        result += char
      }
    }
    return result
  }

  // Rule 2: If 'o' exists, apply tone to it
  if (pinyin.includes('o')) {
    for (let i = 0; i < pinyin.length; i++) {
      const char = pinyin[i]
      if (char === 'o' && !applied) {
        result += toneMap['o'][tone]
        applied = true
      } else {
        result += char
      }
    }
    return result
  }

  // Rule 3: For i/u/ü, apply to the last occurrence
  const vowels = ['i', 'u', 'ü']
  let lastVowelIndex = -1
  let lastVowel = ''

  for (let i = 0; i < pinyin.length; i++) {
    const char = pinyin[i]
    if (vowels.includes(char)) {
      lastVowelIndex = i
      lastVowel = char
    }
  }

  if (lastVowelIndex >= 0) {
    for (let i = 0; i < pinyin.length; i++) {
      const char = pinyin[i]
      if (i === lastVowelIndex) {
        result += toneMap[lastVowel][tone]
      } else {
        result += char
      }
    }
    return result
  }

  // If no vowel found, return as is
  return pinyin
}

/**
 * Compare input pinyin with expected pinyin (spelling only, ignores tones)
 * Returns whether the pinyin spelling is correct
 */
export function comparePinyin(
  input: string,
  expected: string
): { isCorrect: boolean; toneErrors: number[] } {
  // Normalize both inputs by removing tones and extra spaces
  const inputNormalized = removeTones(input.trim().toLowerCase())
  const expectedNormalized = removeTones(expected.trim().toLowerCase())

  // Compare the base spelling only (ignoring tones completely)
  const isCorrect = inputNormalized === expectedNormalized

  // Return empty tone errors array since we're not checking tones
  return { isCorrect, toneErrors: [] }
}

/**
 * Remove tone marks from pinyin to get base letters
 */
function removeTones(pinyin: string): string {
  return pinyin
    .replace(/[āáǎà]/g, 'a')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ūúǔù]/g, 'u')
    .replace(/[ǖǘǚǜ]/g, 'ü')
}

/**
 * Calculate words per minute (WPM) for typing speed
 * For Chinese, counts characters; for pinyin, counts words
 */
export function calculateWPM(
  text: string,
  timeInSeconds: number,
  isChinese: boolean = false
): number {
  if (timeInSeconds === 0) return 0

  // For Chinese, count characters; for pinyin, count words (space-separated)
  const count = isChinese
    ? text.length
    : text.trim().split(/\s+/).length

  // Standard WPM calculation: (count / time) * 60
  const wpm = (count / timeInSeconds) * 60

  // Round to 1 decimal place
  return Math.round(wpm * 10) / 10
}

/**
 * Normalize pinyin for comparison (lowercase, remove extra spaces)
 */
export function normalizePinyin(pinyin: string): string {
  return pinyin.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Check if a string contains tone marks
 */
export function hasToneMarks(text: string): boolean {
  const toneMarks = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/
  return toneMarks.test(text)
}

/**
 * Get tone number from a pinyin syllable
 * Returns 1-4 for tones, 5 for neutral tone, 0 if no tone found
 */
export function getToneNumber(syllable: string): number {
  const toneMarks = {
    1: /[āēīōūǖ]/,
    2: /[áéíóúǘ]/,
    3: /[ǎěǐǒǔǚ]/,
    4: /[àèìòùǜ]/
  }

  for (const [tone, regex] of Object.entries(toneMarks)) {
    if (regex.test(syllable)) {
      return parseInt(tone)
    }
  }

  // Check if it's a valid pinyin syllable without tone (neutral tone)
  if (/^[a-zü]+$/.test(syllable.toLowerCase())) {
    return 5
  }

  return 0
}
