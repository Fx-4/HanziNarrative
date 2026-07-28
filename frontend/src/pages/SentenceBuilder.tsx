import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useAuthStore } from '../store/authStore';
import { vocabularyApi, storiesApi } from '@/services/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { sample } from '@/utils/shuffle';
import DraggableWord from '../components/sentencebuilder/DraggableWord';
import SentenceDropZone from '../components/sentencebuilder/SentenceDropZone';
import ValidationResult from '../components/sentencebuilder/ValidationResult';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/env';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import BlurText from '@/components/animations/BlurText';
import { FadeInOnMount } from '@/components/animations/FadeIn';
import { StaggerOnMount } from '@/components/animations/StaggerContainer';
import StaggerItem from '@/components/animations/StaggerItem';
import { createLogger } from '@/utils/debugLogger'
import { useTranslation } from 'react-i18next'

const sentenceBuilderLogger = createLogger('SentenceBuilder')

interface HanziWord {
  id: number;
  simplified: string;
  traditional: string;
  pinyin: string;
  english: string;
}

interface ValidationFeedback {
  is_correct: boolean;
  score: number;
  feedback: string;
  corrections: string[];
  grammar_issues: string[];
  suggestions: string[];
}

interface UsageStats {
  sentence_validation?: {
    used_today: number;
    limit_daily: number;
    used_this_hour: number;
    limit_hourly: number;
  };
}

export default function SentenceBuilder() {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const [selectedWords, setSelectedWords] = useState<HanziWord[]>([]);
  const [sentence, setSentence] = useState<HanziWord[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [validation, setValidation] = useState<ValidationFeedback | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [hskLevel, setHskLevel] = useState(1);
  const [hintLevel, setHintLevel] = useState(0); // 0 = no hints, 1-3 = progressive hints
  const [targetSentence, setTargetSentence] = useState<string>(''); // For example sentence
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [wordsLoading, setWordsLoading] = useState(true);
  // Kegagalan muat kata dulu dibiarkan senyap (toast-nya dikomentari), sehingga
  // bank kata tampil kosong melompong tanpa penjelasan maupun jalan keluar.
  const [wordsError, setWordsError] = useState(false);

  // Fetch vocabulary for the selected HSK level
  useEffect(() => {
    fetchVocabulary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hskLevel]);

  // Load usage stats on component mount
  useEffect(() => {
    // Only load if user has token
    if (token) {
      loadUsageStats();
    }
  }, [token]);

  const loadUsageStats = async () => {
    try {
      const stats = await storiesApi.getAIUsageStats();
      setUsageStats(stats);
    } catch (err) {
      const e = err as { response?: { status?: number } }
      // Only log if it's not a 401/422 (not authenticated)
      if (e?.response?.status !== 401 && e?.response?.status !== 422) {
        sentenceBuilderLogger.warn('Could not load usage stats (server might be waking up)');
      }
      // Set empty stats on error so it doesn't show "Loading..." forever
      setUsageStats({});
    }
  };

  const fetchVocabulary = async () => {
    setWordsLoading(true);
    setWordsError(false);
    try {
      const allWords = await vocabularyApi.getByHSKLevel(hskLevel);
      // Pilih 12 kata acak. Dulu memakai sort(() => 0.5 - Math.random()) yang bukan
      // pengacakan adil, sehingga sebagian kata jauh lebih sering muncul.
      const words = sample(allWords, 12);
      setSelectedWords(words);

      // Generate a simple example sentence using some of the words
      if (words.length >= 3) {
        setTargetSentence(words.slice(0, 3).map(w => w.simplified).join(''));
      }
    } catch (error) {
      sentenceBuilderLogger.warn('Could not fetch vocabulary (server might be waking up)');
      setWordsError(true);
    } finally {
      setWordsLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Find the word that was dragged
    const word = selectedWords.find(w => w.id === Number(active.id));
    if (!word) return;

    // If dropped in sentence area, add to sentence
    if (over.id === 'sentence-zone') {
      setSentence([...sentence, word]);
      setValidation(null); // Clear previous validation
    }

    // If dropped in sentence and already exists, reorder
    if (sentence.find(w => w.id === word.id)) {
      const oldIndex = sentence.findIndex(w => w.id === Number(active.id));
      const newIndex = sentence.findIndex(w => w.id === Number(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        setSentence(arrayMove(sentence, oldIndex, newIndex));
        setValidation(null);
      }
    }
  };

  const removeFromSentence = (wordId: number) => {
    setSentence(sentence.filter(w => w.id !== wordId));
    setValidation(null);
  };

  const clearSentence = () => {
    setSentence([]);
    setValidation(null);
  };

  const validateSentence = async () => {
    if (sentence.length === 0) {
      toast.error(t('sentenceBuilder.toasts.buildFirst'));
      return;
    }

    if (!token) {
      toast.error(t('sentenceBuilder.toasts.loginFirst'));
      return;
    }

    setIsValidating(true);
    const sentenceText = sentence.map(w => w.simplified).join('');

    try {
      const response = await axios.post(
        `${API_URL}/exercises/validate-sentence`,
        {
          sentence: sentenceText,
          hsk_level: hskLevel
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setValidation(response.data);

      // Refresh usage stats after validation
      loadUsageStats();

      if (response.data.is_correct) {
        toast.success(t('sentenceBuilder.toasts.greatJob', { score: response.data.score }));
      } else {
        toast.error(t('sentenceBuilder.toasts.checkFeedback', { score: response.data.score }));
      }
    } catch (error) {
      const err = error as { response?: { status?: number; data?: { detail?: string } }; message?: string }
      sentenceBuilderLogger.error('Validation failed:', error);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error(t('sentenceBuilder.toasts.authError'));
      } else if (err.response?.status === 429) {
        toast.error(t('sentenceBuilder.toasts.rateLimit'));
      } else {
        toast.error(t('sentenceBuilder.toasts.validateFailed', { detail: err.response?.data?.detail || err.message }));
      }
    } finally {
      setIsValidating(false);
    }
  };

  const generateNewExercise = () => {
    fetchVocabulary();
    setSentence([]);
    setValidation(null);
    setHintLevel(0);
  };

  const showNextHint = () => {
    if (hintLevel < 3) {
      setHintLevel(hintLevel + 1);
      toast.success(t('sentenceBuilder.toasts.hintRevealed', { n: hintLevel + 1 }));
    } else {
      toast(t('sentenceBuilder.toasts.noMoreHints'), { icon: '💡' });
    }
  };

  const getHintContent = () => {
    const hints = [];

    if (hintLevel >= 1) {
      hints.push({
        level: 1,
        title: t('sentenceBuilder.hints.grammarTitle'),
        content: hskLevel <= 2
          ? t('sentenceBuilder.hints.grammarBasic')
          : t('sentenceBuilder.hints.grammarAdvanced')
      });
    }

    if (hintLevel >= 2) {
      hints.push({
        level: 2,
        title: t('sentenceBuilder.hints.wordCountTitle'),
        content: t('sentenceBuilder.hints.wordCountContent', { words: selectedWords.length })
      });
    }

    if (hintLevel >= 3 && targetSentence) {
      hints.push({
        level: 3,
        title: t('sentenceBuilder.hints.exampleTitle'),
        content: t('sentenceBuilder.hints.exampleContent', { sentence: targetSentence, pinyin: selectedWords.slice(0, 3).map(w => w.pinyin).join(' ') })
      });
    }

    return hints;
  };

  const activeWord = selectedWords.find(w => w.id === activeId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeInOnMount direction="up" distance={20} className="text-center mb-6 sm:mb-8">
          <BlurText
            as="h1"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2 justify-center"
            wordDelay={0.07}
          >
            {`${t('sentenceBuilder.title')} 造句练习`}
          </BlurText>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mb-4">
            {t('sentenceBuilder.subtitle')}
          </p>

          {/* AI Usage Stats */}
          {usageStats?.sentence_validation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block bg-white dark:bg-surface-card rounded-xl shadow-md p-4 mt-4 border border-gray-100 dark:border-surface-border"
            >
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('sentenceBuilder.aiLimits')}</div>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">{t('sentenceBuilder.daily')} </span>
                  <span className={`font-semibold ${
                    usageStats.sentence_validation.used_today >= usageStats.sentence_validation.limit_daily
                      ? 'text-error-600 dark:text-error-400' : 'text-primary-600 dark:text-primary-400'
                  }`}>
                    {usageStats.sentence_validation.used_today}/{usageStats.sentence_validation.limit_daily}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">{t('sentenceBuilder.hourly')} </span>
                  <span className={`font-semibold ${
                    usageStats.sentence_validation.used_this_hour >= usageStats.sentence_validation.limit_hourly
                      ? 'text-error-600 dark:text-error-400' : 'text-primary-600 dark:text-primary-400'
                  }`}>
                    {usageStats.sentence_validation.used_this_hour}/{usageStats.sentence_validation.limit_hourly}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </FadeInOnMount>

        {/* HSK Level Selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white dark:bg-surface-card rounded-xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-100 dark:border-surface-border"
        >
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('sentenceBuilder.hskLevel')}
          </p>
          <StaggerOnMount className="flex flex-wrap gap-2" staggerDelay={0.05} delay={0.35}>
            {[1, 2, 3, 4, 5, 6].map(level => (
              <StaggerItem key={level}>
                <motion.button
                  onClick={() => setHskLevel(level)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg font-medium transition-colors cursor-pointer ${
                    hskLevel === level
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-300/40'
                      : 'bg-gray-100 dark:bg-surface-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  HSK {level}
                </motion.button>
              </StaggerItem>
            ))}
          </StaggerOnMount>
        </motion.div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Sentence Construction Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="bg-white dark:bg-surface-card rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-surface-border"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {t('sentenceBuilder.yourSentence')} {sentence.map(w => w.simplified).join('')}
              </h2>
              <motion.button
                onClick={clearSentence}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm text-error-600 hover:text-error-700 font-medium cursor-pointer dark:text-error-400 dark:hover:text-error-300"
              >
                {t('sentenceBuilder.clear')}
              </motion.button>
            </div>

            <SentenceDropZone
              words={sentence.map(w => ({
                id: w.id.toString(),
                chinese: w.simplified,
                pinyin: w.pinyin,
                english: w.english
              }))}
              onRemoveWord={(id) => removeFromSentence(Number(id))}
            />

            <div className="mt-4 flex gap-3 flex-wrap">
              <motion.button
                onClick={validateSentence}
                disabled={isValidating || sentence.length === 0}
                whileHover={{ scale: isValidating || sentence.length === 0 ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-300/30 cursor-pointer"
              >
                {isValidating ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    {t('sentenceBuilder.validating')}
                  </span>
                ) : t('sentenceBuilder.validate')}
              </motion.button>
              <motion.button
                onClick={showNextHint}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-md shadow-blue-300/30 cursor-pointer"
              >
                {t('sentenceBuilder.hint', { n: hintLevel })}
              </motion.button>
              <motion.button
                onClick={generateNewExercise}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                {t('sentenceBuilder.newWords')}
              </motion.button>
            </div>

            {/* Hints Display - staggered reveal */}
            <AnimatePresence>
              {hintLevel > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-2 overflow-hidden"
                >
                  {getHintContent().map((hint, i) => (
                    <motion.div
                      key={hint.level}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.35 }}
                      className="bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-500 p-4 rounded-r-lg"
                    >
                      <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">{hint.title}</p>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">{hint.content}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Validation Result - animated appearance */}
          <AnimatePresence>
            {validation && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
              >
                <ValidationResult
                  isCorrect={validation.is_correct}
                  score={validation.score}
                  feedback={validation.feedback}
                  corrections={validation.corrections}
                  grammarIssues={validation.grammar_issues}
                  suggestions={validation.suggestions}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Word Bank */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="bg-white dark:bg-surface-card rounded-xl shadow-lg p-6 border border-gray-100 dark:border-surface-border"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {`${t('sentenceBuilder.wordBank')} 词库`}
            </h2>
            {!wordsLoading && wordsError && selectedWords.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('sentenceBuilder.wordsError')}</p>
                <button
                  onClick={fetchVocabulary}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors cursor-pointer"
                >
                  {t('sentenceBuilder.wordsRetry')}
                </button>
              </div>
            )}
            {wordsLoading && selectedWords.length === 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            )}
            <SortableContext items={selectedWords.map(w => w.id.toString())}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {selectedWords.map(word => (
                  <DraggableWord
                    key={word.id}
                    id={word.id.toString()}
                    word={word.simplified}
                    pinyin={word.pinyin}
                    english={word.english}
                    isInSentence={sentence.some(w => w.id === word.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </motion.div>

          <DragOverlay>
            {activeWord && (
              <div className="bg-orange-100 dark:bg-orange-900/60 border-2 border-orange-400 rounded-lg p-3 shadow-xl cursor-grabbing">
                <div className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
                  {activeWord.simplified}
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
        >
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">{t('sentenceBuilder.tipsTitle')}</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• {t('sentenceBuilder.tip1')}</li>
            <li>• {t('sentenceBuilder.tip2')}</li>
            <li>• {t('sentenceBuilder.tip3')}</li>
            <li>• {t('sentenceBuilder.tip4')}</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
