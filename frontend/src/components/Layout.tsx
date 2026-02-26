import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import PageTransition from './animations/PageTransition'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <footer className="bg-gray-900 text-gray-400 py-6 mt-12">
        <div className="max-w-screen-2xl mx-auto px-4 text-center">
          <p className="text-sm">&copy; 2024 HanziNarrative. Interactive HSK Learning.</p>
        </div>
      </footer>
    </div>
  )
}
