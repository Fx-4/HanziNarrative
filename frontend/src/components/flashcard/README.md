# Flashcard Components

Component flashcard modular untuk menampilkan vocabulary HSK dengan animasi flip.

## 📁 Struktur File

```
flashcard/
├── FlashcardContainer.tsx   # Container utama dengan logic flip
├── FlashcardFront.tsx        # Tampilan depan card (karakter Chinese)
├── FlashcardBack.tsx         # Tampilan belakang card (pinyin + translation)
├── index.ts                  # Export semua components
└── README.md                 # Dokumentasi ini
```

## 🎨 Color Scheme

### Front Card (Depan)
```css
background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)
```
- Warna: Peach/Orange gradient
- Text: Dark gray (#2d3748)
- Icon: Orange-600

### Back Card (Belakang)
```css
background: linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)
```
- Warna: Orange to Pink gradient
- Text: White dengan shadow
- Badge: Glassmorphism effect (white/20 opacity)

## 🚀 Cara Menggunakan

### Di Page/Component Lain:

```tsx
import { FlashcardContainer } from '@/components/flashcard'

// Gunakan di page
<FlashcardContainer word={wordData} />

// Dengan answer langsung terlihat
<FlashcardContainer word={wordData} showAnswer={true} />
```

### Langsung Import Component Terpisah:

```tsx
import { FlashcardFront, FlashcardBack } from '@/components/flashcard'

// Custom implementation
<FlashcardFront word={wordData} />
<FlashcardBack word={wordData} isFlipped={true} />
```

## 🎨 Kustomisasi Warna

### Mengubah Warna Front Card

Edit `FlashcardFront.tsx`, line 13-15:

```tsx
style={{
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  // Ubah gradient di sini:
  background: 'linear-gradient(135deg, #WARNA1 0%, #WARNA2 100%)',
}}
```

**Rekomendasi Gradient:**
- **Warm Orange:** `#ffecd2 → #fcb69f` (Default)
- **Cool Blue:** `#a8edea → #fed6e3`
- **Purple Dream:** `#c471ed → #f64f59`
- **Mint Fresh:** `#c2e9fb → #a1c4fd`
- **Sunset:** `#ff9a56 → #ff6a88`

### Mengubah Warna Back Card

Edit `FlashcardBack.tsx`, line 13-16:

```tsx
style={{
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  transform: 'rotateY(180deg)',
  // Ubah gradient di sini:
  background: 'linear-gradient(135deg, #WARNA1 0%, #WARNA2 100%)',
}}
```

## 🔧 Customisasi Font

Edit di masing-masing component, cari `style={{ fontFamily: ... }}`:

```tsx
// Chinese Characters
style={{
  fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
  // Atau gunakan font lain yang support Chinese
}}

// Pinyin & English
style={{
  fontFamily: '"Noto Sans", "Arial", sans-serif',
}}
```

## 📐 Ukuran & Spacing

### Front Card:
- Character size: `text-8xl` (96px)
- Traditional size: `text-4xl` (36px)
- Icon size: `w-14 h-14` (56px)

### Back Card:
- Character size: `text-6xl` (60px)
- Pinyin size: `text-3xl` (30px)
- English size: `text-2xl` (24px)

## 🎯 Props

### FlashcardContainer

```tsx
interface FlashcardContainerProps {
  word: HanziWord           // Required: Data vocabulary
  showAnswer?: boolean      // Optional: Show back side immediately (default: false)
}
```

### FlashcardFront

```tsx
interface FlashcardFrontProps {
  word: HanziWord           // Required: Data vocabulary
}
```

### FlashcardBack

```tsx
interface FlashcardBackProps {
  word: HanziWord           // Required: Data vocabulary
  isFlipped: boolean        // Required: Flip state untuk animasi
}
```

## 📊 HanziWord Type

```tsx
interface HanziWord {
  id: number
  simplified: string        // Simplified Chinese
  traditional: string       // Traditional Chinese
  pinyin: string           // Romanization
  english: string          // Translation
  hsk_level: number        // HSK Level (1-6)
  image_url?: string       // Optional image
}
```

## ✨ Features

- ✅ **3D Flip Animation** - Spring animation dengan framer-motion
- ✅ **Responsive Design** - Adapt ke berbagai ukuran layar
- ✅ **Hover Effects** - Scale on hover
- ✅ **Bouncing Indicator** - Click to reveal animation
- ✅ **Font Optimization** - Noto Sans SC untuk Chinese characters
- ✅ **Text Shadows** - Better readability
- ✅ **Glassmorphism Badge** - Modern UI untuk HSK level
- ✅ **Image Support** - Optional image display

## 🎨 Color Palette Examples

### Option 1: Peachy Orange (Current)
- Front: `#ffecd2 → #fcb69f`
- Back: `#ff9a56 → #ff6a88`

### Option 2: Ocean Blue
- Front: `#e0f7fa → #b2ebf2`
- Back: `#0288d1 → #0277bd`

### Option 3: Forest Green
- Front: `#e8f5e9 → #c8e6c9`
- Back: `#388e3c → #2e7d32`

### Option 4: Royal Purple
- Front: `#f3e5f5 → #e1bee7`
- Back: `#7b1fa2 → #6a1b9a`

## 📝 Example Usage in Vocabulary Page

```tsx
import { FlashcardContainer } from '@/components/flashcard'

export default function VocabularyPage() {
  const words = useVocabularyData()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {words.map((word) => (
        <FlashcardContainer key={word.id} word={word} />
      ))}
    </div>
  )
}
```

## 🔄 Update Warna di Satu Tempat

Untuk update warna secara konsisten, cukup edit:
- **FlashcardFront.tsx** (line 13) - untuk warna depan
- **FlashcardBack.tsx** (line 16) - untuk warna belakang

Semua page yang menggunakan `VocabularyCard` atau `FlashcardContainer` akan otomatis update! ✨
