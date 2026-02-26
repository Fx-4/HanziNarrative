import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { BookOpen, PenLine, PenTool, Target, BarChart3 } from 'lucide-react'
import BlurText from '@/components/animations/BlurText'
import { FadeInOnMount } from '@/components/animations/FadeIn'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'
import SpotlightCard from '@/components/animations/SpotlightCard'
import TiltCard from '@/components/animations/TiltCard'
import ScrollReveal from '@/components/animations/ScrollReveal'
import GradientText from '@/components/animations/GradientText'
import { motion } from 'framer-motion'

export default function Home() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero */}
      <section className="text-center py-10 sm:py-16 lg:py-20">
        <BlurText
          as="h1"
          className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 justify-center"
          wordDelay={0.07}
        >
          Learn HSK Through Stories
        </BlurText>

        <FadeInOnMount delay={0.45} duration={0.6} direction="up" distance={16}>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto px-2">
            Immerse yourself in interactive Chinese stories. Click any word to see its Pinyin,
            English meaning, and an illustrative image. Transform traditional memorization into
            an intuitive and fun narrative experience.
          </p>
        </FadeInOnMount>

        <FadeInOnMount delay={0.65} duration={0.5} direction="up" distance={12}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/stories" className="btn-primary text-lg px-8 py-3">
                Start Reading
              </Link>
            </motion.div>
            {!isAuthenticated && (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className="btn-secondary text-lg px-8 py-3">
                  Sign Up Free
                </Link>
              </motion.div>
            )}
          </div>
        </FadeInOnMount>
      </section>

      {/* Feature cards */}
      <StaggerContainer
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 py-10 sm:py-14 lg:py-16"
        delay={0.1}
        staggerDelay={0.12}
      >
        {[
          {
            Icon: BookOpen,
            title: 'Interactive Stories',
            desc: 'Read engaging stories with clickable words revealing Pinyin and meanings',
            color: 'rgba(79,70,229,0.10)',
            iconColor: 'text-primary-600 dark:text-primary-400',
          },
          {
            Icon: Target,
            title: 'HSK Focused',
            desc: 'Content organized by HSK levels from beginner to advanced',
            color: 'rgba(34,197,94,0.10)',
            iconColor: 'text-success-600 dark:text-success-400',
          },
          {
            Icon: BarChart3,
            title: 'Track Progress',
            desc: 'Save words, create custom sets, and monitor your learning journey',
            color: 'rgba(245,158,11,0.10)',
            iconColor: 'text-accent-600 dark:text-accent-400',
          },
        ].map(({ Icon, title, desc, color, iconColor }) => (
          <StaggerItem key={title}>
            <SpotlightCard
              className="card text-center rounded-xl"
              spotlightColor={color}
            >
              <div className="flex justify-center mb-4">
                <Icon className={`w-12 h-12 ${iconColor}`} />
              </div>
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{desc}</p>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* How It Works */}
      <section className="py-10 sm:py-14 lg:py-16 bg-primary-50 dark:bg-primary-950/30 -mx-4 px-4 rounded-lg">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-10 lg:mb-12">
            How It{' '}
            <GradientText colors={['#4F46E5', '#818CF8', '#22C55E', '#4F46E5']}>
              Works
            </GradientText>
          </h2>
        </ScrollReveal>

        <StaggerContainer
          className="max-w-4xl mx-auto space-y-8"
          staggerDelay={0.15}
        >
          {[
            {
              n: '1',
              title: 'Choose Your Level',
              desc: 'Select stories matching your HSK level or challenge yourself with higher levels',
            },
            {
              n: '2',
              title: 'Read & Click',
              desc: 'Click any Hanzi word in the story to see its pronunciation, meaning, and image',
            },
            {
              n: '3',
              title: 'Review & Master',
              desc: 'Save words to your personal collection and review them with flashcards',
            },
          ].map(({ n, title, desc }) => (
            <StaggerItem key={n} direction="left">
              <div className="flex items-start gap-4">
                <motion.div
                  className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-xl font-bold"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {n}
                </motion.div>
                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2">{title}</h3>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* More Learning Tools */}
      <section className="py-16">
        <ScrollReveal>
          <h2 className="text-4xl font-bold text-center mb-4">More Learning Tools</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Explore additional features to enhance your Chinese learning journey
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.12}>
          <StaggerItem>
            <TiltCard maxTilt={8} scale={1.03}>
              <Link to="/stories">
                <SpotlightCard
                  className="card h-full hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/60 dark:to-blue-900/40 border-blue-200 dark:border-blue-800 rounded-xl"
                  spotlightColor="rgba(59,130,246,0.15)"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-600 text-white p-3 rounded-lg">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Stories</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Read interactive Chinese stories with clickable words for instant translations and pronunciation
                  </p>
                  <span className="text-blue-600 font-medium hover:underline">Start Reading →</span>
                </SpotlightCard>
              </Link>
            </TiltCard>
          </StaggerItem>

          <StaggerItem>
            <TiltCard maxTilt={8} scale={1.03}>
              <Link to="/writing">
                <SpotlightCard
                  className="card h-full hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/60 dark:to-purple-900/40 border-purple-200 dark:border-purple-800 rounded-xl"
                  spotlightColor="rgba(139,92,246,0.15)"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-600 text-white p-3 rounded-lg">
                      <PenLine className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Writing</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Practice writing Chinese characters with stroke order guidance and real-time feedback
                  </p>
                  <span className="text-purple-600 font-medium hover:underline">Start Writing →</span>
                </SpotlightCard>
              </Link>
            </TiltCard>
          </StaggerItem>

          <StaggerItem>
            <TiltCard maxTilt={8} scale={1.03}>
              <Link to="/sentence-builder">
                <SpotlightCard
                  className="card h-full hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/60 dark:to-green-900/40 border-green-200 dark:border-green-800 rounded-xl"
                  spotlightColor="rgba(34,197,94,0.15)"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-600 text-white p-3 rounded-lg">
                      <PenTool className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sentence Builder</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Construct Chinese sentences by arranging words in the correct order to master grammar
                  </p>
                  <span className="text-green-600 font-medium hover:underline">Build Sentences →</span>
                </SpotlightCard>
              </Link>
            </TiltCard>
          </StaggerItem>
        </StaggerContainer>
      </section>
    </div>
  )
}
