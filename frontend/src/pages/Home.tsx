import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { BookOpen, PenLine, PenTool } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="max-w-6xl mx-auto">
      <section className="text-center py-20">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Learn HSK Through <span className="text-primary-600">Stories</span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Immerse yourself in interactive Chinese stories. Click any word to see its Pinyin,
          English meaning, and an illustrative image. Transform traditional memorization into
          an intuitive and fun narrative experience.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/stories" className="btn-primary text-lg px-8 py-3">
            Start Reading
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn-secondary text-lg px-8 py-3">
              Sign Up Free
            </Link>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 py-16">
        <div className="card text-center">
          <div className="text-4xl mb-4">📖</div>
          <h3 className="text-xl font-bold mb-2">Interactive Stories</h3>
          <p className="text-gray-600">
            Read engaging stories with clickable words revealing Pinyin and meanings
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-2">HSK Focused</h3>
          <p className="text-gray-600">
            Content organized by HSK levels from beginner to advanced
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">Track Progress</h3>
          <p className="text-gray-600">
            Save words, create custom sets, and monitor your learning journey
          </p>
        </div>
      </section>

      <section className="py-16 bg-primary-50 -mx-4 px-4 rounded-lg">
        <h2 className="text-4xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-start gap-4">
            <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-xl font-bold">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Choose Your Level</h3>
              <p className="text-gray-700">
                Select stories matching your HSK level or challenge yourself with higher levels
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-xl font-bold">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Read & Click</h3>
              <p className="text-gray-700">
                Click any Hanzi word in the story to see its pronunciation, meaning, and image
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-xl font-bold">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Review & Master</h3>
              <p className="text-gray-700">
                Save words to your personal collection and review them with flashcards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-16">
        <h2 className="text-4xl font-bold text-center mb-4">
          More Learning Tools
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Explore additional features to enhance your Chinese learning journey
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/stories">
              <div className="card h-full hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-600 text-white p-3 rounded-lg">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Stories</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Read interactive Chinese stories with clickable words for instant translations and pronunciation
                </p>
                <span className="text-blue-600 font-medium hover:underline">
                  Start Reading →
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/writing">
              <div className="card h-full hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-600 text-white p-3 rounded-lg">
                    <PenLine className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Writing</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Practice writing Chinese characters with stroke order guidance and real-time feedback
                </p>
                <span className="text-purple-600 font-medium hover:underline">
                  Start Writing →
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/sentence-builder">
              <div className="card h-full hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-600 text-white p-3 rounded-lg">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Sentence Builder</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Construct Chinese sentences by arranging words in the correct order to master grammar
                </p>
                <span className="text-green-600 font-medium hover:underline">
                  Build Sentences →
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
