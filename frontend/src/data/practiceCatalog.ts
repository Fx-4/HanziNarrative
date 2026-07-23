/**
 * Katalog alat latihan & permainan — satu sumber untuk Navbar dan halaman
 * Library. Label & deskripsi tiap item hidup di i18n (`nav.items.<key>`),
 * file ini hanya route + ikon.
 */
import type { FC } from 'react'
import {
  BookMarked, Calendar, Dice5, Grid3X3, GraduationCap, Headphones,
  HelpCircle, Keyboard, Layers, Lock, Map, MessageCircle, Mic, Music,
  PenTool, Swords, Target, Type,
} from 'lucide-react'

export interface CatalogItem {
  to: string
  /** i18n key di bawah `nav.items.*` */
  key: string
  icon: FC<{ className?: string }>
  /**
   * Progressive disclosure: jumlah kata yang harus sudah dipelajari sebelum
   * item terbuka. Undefined = selalu tersedia. Menjaga permukaan pilihan user
   * baru tetap kecil; item berat/kompetitif baru muncul setelah ada pijakan.
   */
  unlockAt?: number
}

export const PRACTICE_ITEMS: CatalogItem[] = [
  { to: '/flashcards',       key: 'flashcards',      icon: Layers },
  { to: '/writing',          key: 'writing',         icon: PenTool },
  { to: '/typing',           key: 'typing',          icon: Keyboard },
  { to: '/speaking',         key: 'speaking',        icon: Mic },
  { to: '/dictation',        key: 'dictation',       icon: Headphones },
  { to: '/quiz',             key: 'quiz',            icon: Target },
  { to: '/tones',            key: 'tones',           icon: Music },
  { to: '/mock-test',        key: 'mockTest',        icon: GraduationCap },
  { to: '/vocabulary',       key: 'vocabulary',      icon: BookMarked },
  { to: '/explorer',         key: 'storyBlanks',     icon: HelpCircle },
]

export const PLAY_ITEMS: CatalogItem[] = [
  { to: '/daily-challenge',  key: 'dailyChallenge',  icon: Calendar },
  { to: '/conversation',     key: 'aiChat',          icon: MessageCircle },
  { to: '/matching',         key: 'matchGame',       icon: Grid3X3 },
  { to: '/sentence-builder', key: 'sentenceBuilder', icon: Type },
  { to: '/adventure',        key: 'adventure',       icon: Map,   unlockAt: 20 },
  { to: '/story-challenge',  key: 'storyChallenge',  icon: Lock,  unlockAt: 30 },
  { to: '/battle',           key: 'battle',          icon: Swords, unlockAt: 50 },
  { to: '/ladder',           key: 'ladderRace',      icon: Dice5,  unlockAt: 50 },
]
