import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { onboardingApi } from '@/services/api'
import type { Goals, Preferences } from '@/types'
import toast from 'react-hot-toast'

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

  // State
  const [goals, setGoals] = useState<Goals>({})
  const [preferences, setPreferences] = useState<Preferences>({})
  const [tookAssessment, setTookAssessment] = useState(false)
  const [determinedLevel, setDeterminedLevel] = useState(1)

  // Completion data
  const [completionData, setCompletionData] = useState<any>(null)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const status = await onboardingApi.getStatus()

      if (status.onboarding_completed) {
        navigate('/dashboard')
        return
      }

      // Resume from saved step
      // Backend step numbers: 2=goals saved, 3=assessment done, 4=assessment skipped
      // Frontend step numbers: 1=welcome, 2=goals, 3=levelSelector, 4=assessment, 5=preferences, 6=completion
      if (status.current_step > 0) {
        const BACKEND_TO_FRONTEND_STEP: Record<number, number> = {
          1: 2, // goals screen
          2: 3, // level selector (goals already saved)
          3: 5, // preferences (assessment done)
          4: 5, // preferences (assessment skipped)
        }
        const frontendStep = BACKEND_TO_FRONTEND_STEP[status.current_step] ?? 1
        setCurrentStep(frontendStep)
        // If assessment was completed (backend step 3), mark tookAssessment
        if (status.current_step === 3) setTookAssessment(true)
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

  const handleWelcomeNext = () => setCurrentStep(2)

  const handleGoalsNext = async (selectedGoals: Goals) => {
    setGoals(selectedGoals)
    try {
      await onboardingApi.saveGoals(selectedGoals)
    } catch {
      toast.error('Could not save goals. Please try again.')
      return
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
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  const handleAssessmentComplete = (level: number, xp: number) => {
    setDeterminedLevel(level)
    void xp // xp tracked server-side
    setCurrentStep(5)
  }

  const handlePreferencesNext = async (selectedPreferences: Preferences) => {
    setPreferences(selectedPreferences)
    try {
      const result = await onboardingApi.complete({
        took_assessment: tookAssessment,
        determined_hsk_level: determinedLevel,
        goals,
        preferences: selectedPreferences,
      })
      setCompletionData(result)
      await checkOnboardingStatus()
      setCurrentStep(6)
    } catch {
      toast.error('Could not complete setup. Please try again.')
    }
  }

  /**
   * Back navigation:
   *  - step 5 (Preferences) → step 3 (Level selector), skipping assessment sub-step
   *  - step 3 (Level) → step 2 (Goals)
   *  - step 2 (Goals) → step 1 (Welcome)
   *  - step 4 (Assessment) and step 6 (Completion) have no back button
   */
  const handleBack = () => {
    if (currentStep === 5) { setCurrentStep(3); return }
    if (currentStep > 1 && currentStep !== 4 && currentStep !== 6) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-gray-500">Loading your profile…</p>
      </div>
    )
  }

  // Show progress for steps 2–5 (not welcome, not completion)
  const showProgress  = currentStep >= 2 && currentStep <= 5
  // Show back button for steps 2, 3, 5 (not assessment=4, not completion=6)
  const showBackButton = currentStep > 1 && currentStep !== 4 && currentStep !== 6

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Logo + Brand */}
        {currentStep < 6 && (
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold font-chinese">汉</span>
            </div>
            <span className="text-sm font-bold text-gray-500 tracking-tight">HanziNarrative</span>
          </div>
        )}

        {/* Progress bar */}
        {showProgress && (
          <div className="mb-6">
            <ProgressIndicator
              currentStep={currentStep}
              onBack={handleBack}
              showBackButton={showBackButton}
            />
          </div>
        )}

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10"
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
