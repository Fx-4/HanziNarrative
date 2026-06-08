import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Big Chinese character */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative inline-block mb-6"
        >
          <span className="text-[120px] font-bold text-gray-200 dark:text-gray-800 select-none leading-none font-noto">
            找
          </span>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute -top-2 -right-4 text-2xl font-bold text-error-500 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-lg shadow-md border border-error-200 dark:border-error-800"
          >
            404
          </motion.span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            没找到 · Page Not Found
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-1 font-mono">
            méi zhǎo dào
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-4 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 cursor-pointer transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
