/**
 * IndexedDB cache for TTS audio blobs.
 * After a user hears a word once, subsequent plays use zero network requests.
 */

const DB_NAME = 'hsk-tts-cache'
const DB_VERSION = 1
const STORE_NAME = 'audio'

let _db: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result
      resolve(_db)
    }
    req.onerror = () => reject(req.error)
  })
}

export function buildCacheKey(
  text: string,
  language: string,
  voiceName: string,
  rate: number,
): string {
  return `${text}|${language}|${voiceName}|${rate}`
}

export async function getAudio(key: string): Promise<Blob | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(key)
      req.onsuccess = () => resolve((req.result as Blob) ?? null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

export async function saveAudio(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(blob, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve() // non-fatal
    })
  } catch {
    // IndexedDB unavailable (private browsing, etc.) — silently skip
  }
}
