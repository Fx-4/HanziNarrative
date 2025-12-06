import { useState } from 'react'
import TranslationTooltip from './TranslationTooltip'
import { Button } from './ui/Button'
import { Languages } from 'lucide-react'

interface Word {
  id?: number
  simplified: string
  traditional?: string
  pinyin: string
  english: string
}

interface ChineseTextWithTranslationProps {
  text: string
  words?: Word[]
  showToggle?: boolean
  defaultEnabled?: boolean
}

export default function ChineseTextWithTranslation({
  text,
  words = [],
  showToggle = true,
  defaultEnabled = false
}: ChineseTextWithTranslationProps) {
  const [translationEnabled, setTranslationEnabled] = useState(defaultEnabled)

  // Create a map for quick word lookup
  const wordMap = new Map<string, Word>()
  words.forEach(word => {
    // Map by simplified character
    wordMap.set(word.simplified, word)
    // Also map by traditional if available
    if (word.traditional) {
      wordMap.set(word.traditional, word)
    }
  })

  // Function to find the longest matching word starting at position
  const findWordAt = (text: string, startIndex: number): { word: Word; length: number } | null => {
    // Try to match words of decreasing length (max 4 characters)
    for (let length = Math.min(4, text.length - startIndex); length >= 1; length--) {
      const substring = text.substring(startIndex, startIndex + length)
      const word = wordMap.get(substring)
      if (word) {
        return { word, length }
      }
    }
    return null
  }

  // Parse text into segments with translation info
  const parseText = () => {
    if (!translationEnabled || words.length === 0) {
      return [{ text, type: 'plain' as const }]
    }

    const segments: Array<{ text: string; type: 'plain' | 'word'; word?: Word }> = []
    let i = 0

    while (i < text.length) {
      const match = findWordAt(text, i)

      if (match) {
        segments.push({
          text: match.word.simplified,
          type: 'word',
          word: match.word
        })
        i += match.length
      } else {
        // Add non-matching character as plain text
        const char = text[i]
        if (segments.length > 0 && segments[segments.length - 1].type === 'plain') {
          // Append to previous plain segment
          segments[segments.length - 1].text += char
        } else {
          segments.push({ text: char, type: 'plain' })
        }
        i++
      }
    }

    return segments
  }

  const segments = parseText()

  return (
    <div>
      {showToggle && (
        <div className="mb-4">
          <Button
            variant={translationEnabled ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTranslationEnabled(!translationEnabled)}
          >
            <Languages className="w-4 h-4 mr-2" />
            {translationEnabled ? 'Hide Translations' : 'Show Translations'}
          </Button>
        </div>
      )}

      <div className="text-lg leading-relaxed">
        {segments.map((segment, index) => {
          if (segment.type === 'word' && segment.word) {
            return (
              <TranslationTooltip
                key={index}
                chinese={segment.word.simplified}
                pinyin={segment.word.pinyin}
                english={segment.word.english}
                mode="hover"
              />
            )
          }
          return <span key={index}>{segment.text}</span>
        })}
      </div>
    </div>
  )
}
