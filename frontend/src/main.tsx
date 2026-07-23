import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App.tsx'
import './index.css'
import './i18n/config'

// Auto-reload when a lazy-loaded chunk 404s after a new deployment.
// Vite fires this event before React even sees the error, so the page
// reloads cleanly and fetches the new asset hashes from the fresh index.html.
window.addEventListener('vite:preloadError', () => {
  window.location.reload()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {/* reducedMotion="user": seluruh animasi framer-motion otomatis
          nonaktif bila OS user menyetel prefers-reduced-motion */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>,
)
