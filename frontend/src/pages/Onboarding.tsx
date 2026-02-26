import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { onboardingApi } from '@/services/api'
import type { Goals, Preferences } from '@/types'

// Components
import ProgressIndicator from '@/components/onboarding/ProgressIndicator'
import WelcomeScreen from '@/components/onboarding/WelcomeScreen'
import GoalSelector from '@/components/onboarding/GoalSelector'
import LevelSelector from '@/components/onboarding/LevelSelector'
import AdaptiveAssessment from '@/components/onboarding/AdaptiveAssessment'
import PreferencesCustomizer from '@/components/onboarding/PreferencesCustomizer'
import CompletionScreen from '@/components/onboarding/CompletionScreen'
import { Loader2 } from 'lucide-react'

const Onboarding = () => {
  const navigate = useNavigate()
  const { checkOnboardingStatus } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [totalSteps] = useState(5)

  // State
  const [goals, setGoals] = useState<Goals>({})
  const [preferences, setPreferences] = useState<Preferences>({})
  const [tookAssessment, setTookAssessment] = useState(false)
  const [determinedLevel, setDeterminedLevel] = useState(1)
  const [_assessmentXP, setAssessmentXP] = useState(0)

  // Completion data
  const [completionData, setCompletionData] = useState<any>(null)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const status = await onboardingApi.getStatus()

      // If already completed, redirect to dashboard
      if (status.onboarding_completed) {
        navigate('/dashboard')
        return
      }

      // Resume from current step if needed
      if (status.current_step > 0) {
        setCurrentStep(status.current_step)
        if (status.goals) setGoals(status.goals)
        if (status.preferences) setPreferences(status.preferences)
        if (status.determined_hsk_level) setDeterminedLevel(status.determined_hsk_level)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to check onboarding status:', error)
      setLoading(false)
    }
  }

  const handleWelcomeNext = () => {
    setCurrentStep(2)
  }

  const handleGoalsNext = async (selectedGoals: Goals) => {
    setGoals(selectedGoals)

    // Save goals to backend
    try {
      await onboardingApi.saveGoals(selectedGoals)
    } catch (error) {
      console.error('Failed to save goals:', error)
    }

    setCurrentStep(3)
  }

  const handleTakeAssessment = () => {
    setTookAssessment(true)
    setCurrentStep(4)
  }

  const handleSkipAssessment = async () => {
    setTookAssessment(false)

    try {
      await onboardingApi.skipAssessment()
      setDeterminedLevel(1)
      setCurrentStep(5)
    } catch (error) {
      console.error('Failed to skip assessment:', error)
    }
  }

  const handleAssessmentComplete = (level: number, xp: number) => {
    setDeterminedLevel(level)
    setAssessmentXP(xp)
    setCurrentStep(5)
  }

  const handlePreferencesNext = async (selectedPreferences: Preferences) => {
    setPreferences(selectedPreferences)

    // Complete onboarding
    try {
      const result = await onboardingApi.complete({
        took_assessment: tookAssessment,
        determined_hsk_level: determinedLevel,
        goals,
        preferences: selectedPreferences
      })

      setCompletionData(result)

      // Update auth store
      await checkOnboardingStatus()

      // Move to completion screen
      setCurrentStep(6)
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
  }

  const handleBack = () => {
    if (currentStep > 1 && currentStep !== 4 && currentStep !== 6) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const showProgress = currentStep > 1 && currentStep <= totalSteps
  const showBackButton = currentStep > 1 && currentStep !== 4 && currentStep !== 6

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Progress Indicator */}
        {showProgress && (
          <div className="mb-8">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              onBack={handleBack}
              showBackButton={showBackButton}
            />
          </div>
        )}

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
          >
            {currentStep === 1 && <WelcomeScreen onNext={handleWelcomeNext} />}

            {currentStep === 2 && (
              <GoalSelector initialGoals={goals} onNext={handleGoalsNext} />
            )}

            {currentStep === 3 && (
              <LevelSelector
                onTakeAssessment={handleTakeAssessment}
                onSkipAssessment={handleSkipAssessment}
              />
            )}

            {currentStep === 4 && (
              <AdaptiveAssessment onComplete={handleAssessmentComplete} />
            )}

            {currentStep === 5 && (
              <PreferencesCustomizer
                initialPreferences={preferences}
                onNext={handlePreferencesNext}
              />
            )}

            {currentStep === 6 && completionData && (
              <CompletionScreen
                determinedLevel={determinedLevel}
                xpEarned={completionData.xp_earned}
                currentLevel={completionData.level}
                leveledUp={completionData.leveled_up}
                achievementUnlocked={completionData.achievement_unlocked}
                initialWordsCount={completionData.initial_words_count}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Onboarding
