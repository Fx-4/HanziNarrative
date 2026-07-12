import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { onboardingApi } from '@/services/api'
import type { Goals, Preferences, OnboardingCompleteResponse } from '@/types'
import toast from 'react-hot-toast'
import { saveShowPinyinPref } from '@/utils/uiPrefs'

// Components
import ProgressIndicator from '@/components/onboarding/ProgressIndicator'
import WelcomeScreen from '@/components/onboarding/WelcomeScreen'
import GoalSelector from '@/components/onboarding/GoalSelector'
import LevelSelector from '@/components/onboarding/LevelSelector'
import AdaptiveAssessment from '@/components/onboarding/AdaptiveAssessment'
import PreferencesCustomizer from '@/components/onboarding/PreferencesCustomizer'
import CompletionScreen from '@/components/onboarding/CompletionScreen'
import { createLogger } from '@/utils/debugLogger'
import { useTranslation } from 'react-i18next'

const onboardingLogger = createLogger('Onboarding')

const Onboarding = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  // (checkOnboardingStatus not needed here — we setState directly for instant sync)

  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)

  // State
  const [goals, setGoals] = useState<Goals>({})
  const [preferences, setPreferences] = useState<Preferences>({})
  const [tookAssessment, setTookAssessment] = useState(false)
  const [determinedLevel, setDeterminedLevel] = useState(1)

  // Completion data
  const [completionData, setCompletionData] = useState<OnboardingCompleteResponse | null>(null)

  const checkStatus = useCallback(async () => {
    try {
      const status = await onboardingApi.getStatus()

      if (status.onboarding_completed) {
        // Sync store flag in background — don't block navigation
        useAuthStore.setState({ onboardingCompleted: true })
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
          5: 5, // keep user on preferences instead of resetting to welcome
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
      onboardingLogger.error('Failed to check onboarding status:', error)
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    void checkStatus()
  }, [checkStatus])

  const handleWelcomeNext = () => setCurrentStep(2)

  const handleGoalsNext = (selectedGoals: Goals) => {
    setGoals(selectedGoals)
    setCurrentStep(3)
    // Fire-and-forget — failure is non-blocking (user can still proceed)
    onboardingApi.saveGoals(selectedGoals).catch(() =>
      toast(t('onboarding.toastGoals'), { icon: '⚠️', duration: 3000 })
    )
  }

  const handleTakeAssessment = () => {
    setTookAssessment(true)
    setCurrentStep(4)
  }

  const handleSkipAssessment = () => {
    setTookAssessment(false)
    setDeterminedLevel(1)
    setCurrentStep(5)
    // Fire-and-forget — just marks the step on the backend
    onboardingApi.skipAssessment().catch(() => { /* non-critical */ })
  }

  const handleAssessmentComplete = (level: number, xp: number) => {
    setDeterminedLevel(level)
    void xp // xp tracked server-side
    setCurrentStep(5)
  }

  const handlePreferencesNext = async (selectedPreferences: Preferences) => {
    setPreferences(selectedPreferences)
    // Mirror to localStorage so reading pages (stories, adventure, chat)
    // honor the choice without an extra API call
    saveShowPinyinPref(selectedPreferences.show_pinyin_by_default ?? true)

    // Optimistic: show completion screen immediately with sensible defaults
    setCompletionData({
      message: 'Setup complete!',
      xp_earned: 150,
      level: 1,
      leveled_up: false,
      initial_words_count: 10,
      achievement_unlocked: true,
      redirect_to: '/dashboard',
    })
    useAuthStore.setState({ onboardingCompleted: true })
    setCurrentStep(6)

    // Update with real server data (XP, level-up, etc.) in the background
    onboardingApi.complete({
      took_assessment: tookAssessment,
      determined_hsk_level: determinedLevel,
      goals,
      preferences: selectedPreferences,
    }).then(result => setCompletionData(result))
      .catch(() => {
        toast(t('onboarding.toastSaved'), { icon: '⚠️', duration: 4000 })
      })
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 via-white to-violet-50 px-4">
        <div className="w-full max-w-lg space-y-4">
          <div className="animate-pulse bg-gray-200 rounded-lg h-8 w-2/3 mx-auto" />
          <div className="animate-pulse bg-gray-200 rounded-3xl h-48" />
          <div className="animate-pulse bg-gray-200 rounded-2xl h-12 w-40 mx-auto" />
          <p className="text-sm text-center text-gray-500">{t('onboarding.loading')}</p>
        </div>
      </div>
    )
  }

  // Show progress for steps 2–5 (not welcome, not completion)
  const showProgress  = currentStep >= 2 && currentStep <= 5
  // Show back button for steps 2, 3, 5 (not assessment=4, not completion=6)
  const showBackButton = currentStep > 1 && currentStep !== 4 && currentStep !== 6

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-violet-50 dark:from-surface-page dark:via-surface-page dark:to-surface-page py-8">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Logo + Brand */}
        {currentStep < 6 && (
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold font-chinese">汉</span>
            </div>
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-tight">HanziNarrative</span>
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
            className="bg-white dark:bg-surface-card rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-10"
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
