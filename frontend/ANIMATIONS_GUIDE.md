# HanziNarrative Animations & Interactive Components Guide

This guide documents all the animations, transitions, and interactive components added to make HanziNarrative feel alive and engaging.

## Libraries Used

### Core Animation Libraries
- **Framer Motion** (v11.0.3) - Advanced animation library with spring physics and gestures
- **Lucide React** (v0.307.0) - Beautiful, consistent icon set
- **React Hot Toast** (v2.4.1) - Elegant toast notifications

### UI Component Libraries
- **Radix UI** - Unstyled, accessible component primitives:
  - `@radix-ui/react-dialog` - Modal dialogs
  - `@radix-ui/react-dropdown-menu` - Dropdown menus
  - `@radix-ui/react-select` - Select inputs
  - `@radix-ui/react-tabs` - Tab components
  - `@radix-ui/react-progress` - Progress indicators
  - `@radix-ui/react-toast` - Toast notifications

### Styling Utilities
- **Class Variance Authority** (CVA) - Component variant management
- **clsx** - Conditional className utility
- **tailwind-merge** - Merge Tailwind classes without conflicts

## Custom UI Components

### 1. Button (`src/components/ui/Button.tsx`)

Animated button with multiple variants and hover effects.

**Features:**
- 5 variants: primary, secondary, outline, ghost, success
- 3 sizes: sm, md, lg
- Scale animations on hover (1.05x) and tap (0.95x)
- Smooth transitions
- Focus ring for accessibility

**Usage:**
```tsx
import { Button } from '@/components/ui/Button'

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Variants:**
- `primary` - Primary action button with shadow
- `secondary` - Secondary gray button
- `outline` - Outlined border button
- `ghost` - Transparent with hover
- `success` - Green success button

### 2. Card (`src/components/ui/Card.tsx`)

Animated card component with fade-in and hover lift effects.

**Features:**
- Fade-in animation on mount
- Hover lift effect (-4px transform)
- Shadow transitions
- Composable parts: CardHeader, CardTitle, CardDescription, CardContent, CardFooter

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

<Card hover animated>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### 3. Badge (`src/components/ui/Badge.tsx`)

Small pill-shaped badge with scale-in animation.

**Features:**
- Scale animation from 0 to 1
- Hover scale effect (1.1x)
- 5 color variants

**Usage:**
```tsx
import { Badge } from '@/components/ui/Badge'

<Badge variant="default">HSK Level 2</Badge>
```

**Variants:**
- `default` - Primary red color
- `success` - Green
- `warning` - Yellow
- `error` - Red
- `info` - Blue

### 4. Input (`src/components/ui/Input.tsx`)

Form input with focus animations and error states.

**Features:**
- Label slides on focus
- Error message fade-in
- Focus ring animation
- Accessible with proper ARIA attributes

**Usage:**
```tsx
import { Input } from '@/components/ui/Input'

<Input
  label="Username"
  error={errors.username}
  value={username}
  onChange={e => setUsername(e.target.value)}
/>
```

### 5. Loading Spinners (`src/components/ui/LoadingSpinner.tsx`)

Three loading animation styles.

**Features:**
- `LoadingSpinner` - Rotating circular spinner
- `LoadingDots` - Bouncing dots
- `LoadingPulse` - Pulsing text
- 3 sizes: sm, md, lg

**Usage:**
```tsx
import { LoadingSpinner, LoadingDots, LoadingPulse } from '@/components/ui/LoadingSpinner'

<LoadingSpinner size="lg" />
<LoadingDots />
<LoadingPulse />
```

### 6. Progress (`src/components/ui/Progress.tsx`)

Animated progress bars and circular progress indicators.

**Features:**
- Smooth width animation
- Gradient background
- Optional percentage label
- Circular variant available

**Usage:**
```tsx
import { Progress, CircularProgress } from '@/components/ui/Progress'

<Progress value={75} max={100} showLabel />
<CircularProgress value={75} size={120} />
```

### 7. Toast (`src/components/ui/Toast.tsx`)

Toast notifications with automatic dismiss.

**Features:**
- Slide-in animation
- Auto-dismiss (3 seconds)
- Success, error, info variants
- Positioned top-right

**Usage:**
```tsx
import toast from 'react-hot-toast'

toast.success('Word saved successfully!')
toast.error('Failed to load story')
toast('Information message')
```

## Enhanced Main Components

### 1. HanziWordPopup (`src/components/HanziWordPopup.tsx`)

Interactive popup that appears when clicking words in stories.

**Animations:**
- Backdrop blur fade-in
- Spring scale animation (0.8 → 1.0)
- Staggered children animation
- Character hover scale (1.1x)
- Image zoom on hover (1.05x)
- Exit animations on close

**Interactive Elements:**
- Close button with hover effect
- Save button with toast notification
- Clickable backdrop to dismiss

### 2. VocabularyCard (`src/components/VocabularyCard.tsx`)

3D flip card for vocabulary flashcards.

**Animations:**
- 3D flip animation (rotateY: 0 → 180deg)
- Spring physics for natural feel
- Front side: Bouncing "click to flip" indicator
- Back side: Staggered content reveal
- Hover scale (1.02x)

**Interactive Elements:**
- Click anywhere to flip
- Animated flip indicator
- Preserved 3D perspective

### 3. Navbar (`src/components/Navbar.tsx`)

Sticky navigation bar with smooth transitions.

**Animations:**
- Slide down from top on mount
- Logo wiggle animation (repeating)
- Active link underline (layoutId animation)
- Nav item hover scale
- Smooth auth state transitions

**Interactive Elements:**
- Active page indicator
- Hover effects on all links
- Animated logout with toast
- Icons for all nav items

### 4. Stories Page (`src/pages/Stories.tsx`)

Story listing with grid animations.

**Animations:**
- Page fade-in
- Title slide down
- Filter buttons staggered scale-in
- Story cards stagger animation (0.1s delay between each)
- Loading spinner
- Empty state scale-in

**Interactive Elements:**
- Filterable by HSK level
- Hover lift on cards
- Calendar icons
- Badge indicators

## Animation Patterns

### 1. Staggered Children

Used for lists and grids to create a cascading effect:

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // 100ms delay between children
      },
    },
  }}
>
  {items.map(item => (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

### 2. Spring Animations

Natural, physics-based motion:

```tsx
<motion.div
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
/>
```

### 3. Hover & Tap Gestures

Interactive feedback:

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### 4. Layout Animations

Smooth transitions when elements move:

```tsx
<motion.div layoutId="underline" />
```

### 5. Exit Animations

Clean component unmounting:

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

## Tailwind Custom Animations

Added to `tailwind.config.js`:

### Keyframe Animations
- `fade-in` - Simple opacity fade
- `slide-up` - Slide from bottom with fade
- `slide-down` - Slide from top with fade
- `bounce-slow` - Slower bounce effect

### Custom Classes
- `perspective-1000` - 3D transform perspective
- `perspective-2000` - Deeper 3D perspective

### Usage:
```tsx
<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-up">Slides up</div>
<div className="perspective-1000">3D container</div>
```

## Performance Tips

### 1. Use `will-change` Sparingly
Only add to elements that will animate:
```css
.animating {
  will-change: transform;
}
```

### 2. Prefer `transform` and `opacity`
These properties are GPU-accelerated:
```tsx
// Good
<motion.div animate={{ x: 100, opacity: 0.5 }} />

// Avoid
<motion.div animate={{ left: "100px", backgroundColor: "red" }} />
```

### 3. Use `layoutId` for Shared Elements
Smooth morphing between components:
```tsx
<motion.div layoutId="shared-element" />
```

### 4. Disable Animations on Initial Mount
When you don't want animation on first render:
```tsx
<motion.div initial={false} animate={{ x: 100 }} />
```

## Accessibility

### Focus Indicators
All interactive elements have visible focus rings:
```css
focus:ring-2 focus:ring-primary-500 focus:outline-none
```

### Reduced Motion
Respect user preferences:
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

<motion.div
  animate={prefersReducedMotion ? {} : { x: 100 }}
/>
```

### Keyboard Navigation
All interactive components support keyboard:
- Buttons: Enter/Space
- Links: Enter
- Cards: Tab navigation

## Best Practices

### 1. Consistent Timing
Use consistent durations across the app:
- Quick interactions: 0.2-0.3s
- Page transitions: 0.5s
- Complex animations: 0.6-1s

### 2. Natural Easing
Use spring physics for natural feel:
```tsx
transition={{ type: "spring", stiffness: 300, damping: 25 }}
```

### 3. Meaningful Motion
Every animation should have a purpose:
- Guide user attention
- Provide feedback
- Show relationships
- Reduce cognitive load

### 4. Test Performance
Monitor frame rates and optimize:
```tsx
// Use Chrome DevTools > Performance
// Aim for 60fps (16.67ms per frame)
```

## Component Composition Example

Combining components for rich interactions:

```tsx
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export function StoryCard({ story }) {
  const handleClick = () => {
    toast.success(`Opening "${story.title}"`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
    >
      <Card>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-600" />
            {story.title}
          </h3>
          <Badge variant="default">HSK {story.hsk_level}</Badge>
        </div>
        <p className="text-gray-600 mb-4">{story.description}</p>
        <Button onClick={handleClick} variant="primary">
          Read Story
        </Button>
      </Card>
    </motion.div>
  )
}
```

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Lucide Icons](https://lucide.dev/)
- [TailwindCSS Animations](https://tailwindcss.com/docs/animation)
- [Web Animations Best Practices](https://web.dev/animations-guide/)

## Next Steps

Consider adding:
- Page transition animations
- Skeleton loading states
- Micro-interactions (button ripples, etc.)
- Scroll-triggered animations
- Parallax effects
- Gesture-based interactions (swipe, drag)
- Sound effects (optional, with user preference)
