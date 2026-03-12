/**
 * Custom character data loader for HanziWriter.
 * Uses jsdelivr CDN with fallback to ensure characters load reliably.
 * Only supports single characters — returns first character if multi-char string is passed.
 */
export function loadCharacterData(char: string): Promise<any> {
  // HanziWriter only supports single characters
  const singleChar = char.charAt(0)
  const code = singleChar.charCodeAt(0)
  const hexCode = code.toString(16)

  return fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${hexCode}.json`)
    .then(res => {
      if (!res.ok) throw new Error(`jsdelivr returned ${res.status}`)
      return res.json()
    })
    .catch(() => {
      // Fallback: try without @latest
      return fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data/${hexCode}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`fallback returned ${res.status}`)
          return res.json()
        })
    })
}

/**
 * Sanitize a character string for HanziWriter.
 * Returns only the first character since HanziWriter only supports single characters.
 */
export function sanitizeCharacter(char: string): string {
  return char.charAt(0)
}
