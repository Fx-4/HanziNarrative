import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useAuthStore } from '../store/authStore';
import { vocabularyApi, storiesApi } from '@/services/api';
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
    try {
      const allWords = await vocabularyApi.getByHSKLevel(hskLevel);
      // Randomly select 10-15 words for the exercise
      const shuffled = allWords.sort(() => 0.5 - Math.random());
      const words = shuffled.slice(0, 12);
      setSelectedWords(words);

      // Generate a simple example sentence using some of the words
      if (words.length >= 3) {
        setTargetSentence(words.slice(0, 3).map(w => w.simplified).join(''));
      }
    } catch (error) {
      sentenceBuilderLogger.warn('Could not fetch vocabulary (server might be waking up)');
      // Only show toast for manual refreshes, not on initial mount if network error
      // toast.error('Failed to load vocabulary'); 
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
      toast.error('Please build a sentence first');
      return;
    }

    if (!token) {
      toast.error('Please login first to use sentence validation');
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
        toast.success(`Great job! Score: ${response.data.score}/100`);
      } else {
        toast.error(`Score: ${response.data.score}/100 - Check feedback below`);
      }
    } catch (error) {
      const err = error as { response?: { status?: number; data?: { detail?: string } }; message?: string }
      sentenceBuilderLogger.error('Validation failed:', error);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Authentication error. Please login again.');
      } else if (err.response?.status === 429) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        toast.error(`Failed to validate sentence: ${err.response?.data?.detail || err.message}`);
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
      toast.success(`Hint ${hintLevel + 1} revealed!`);
    } else {
      toast('No more hints available!', { icon: '💡' });
    }
  };

  const getHintContent = () => {
    const hints = [];

    if (hintLevel >= 1) {
      hints.push({
        level: 1,
        title: '📝 Grammar Pattern',
        content: hskLevel <= 2
          ? 'Basic pattern: Subject + Verb / Subject + Verb + Object'
          : 'Try: Subject + Time/Location + Verb + Object / Modifier + Noun'
      });
    }

    if (hintLevel >= 2) {
      hints.push({
        level: 2,
        title: '🔢 Word Count',
        content: `A good sentence uses 3-5 words. Try combining ${selectedWords.length} available words.`
      });
    }

    if (hintLevel >= 3 && targetSentence) {
      hints.push({
        level: 3,
        title: '✨ Example',
        content: `Example sentence: ${targetSentence} (${selectedWords.slice(0, 3).map(w => w.pinyin).join(' ')})`
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
            Sentence Builder 造句练习
          </BlurText>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mb-4">
            Drag words to build Chinese sentences and get AI-powered feedback
          </p>

          {/* AI Usage Stats */}
          {usageStats?.sentence_validation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block bg-white dark:bg-gray-900 rounded-xl shadow-md p-4 mt-4 border border-gray-100 dark:border-gray-800"
            >
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">AI Validation Limits:</div>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Daily: </span>
                  <span className={`font-semibold ${
                    usageStats.sentence_validation.used_today >= usageStats.sentence_validation.limit_daily
                      ? 'text-error-600' : 'text-primary-600'
                  }`}>
                    {usageStats.sentence_validation.used_today}/{usageStats.sentence_validation.limit_daily}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Hourly: </span>
                  <span className={`font-semibold ${
                    usageStats.sentence_validation.used_this_hour >= usageStats.sentence_validation.limit_hourly
                      ? 'text-error-600' : 'text-primary-600'
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
          className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-100 dark:border-gray-800"
        >
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            HSK Level:
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
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Your Sentence: {sentence.map(w => w.simplified).join('')}
              </h2>
              <motion.button
                onClick={clearSentence}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm text-error-600 hover:text-error-700 font-medium cursor-pointer dark:text-error-400"
              >
                Clear
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
                    Validating...
                  </span>
                ) : 'Validate Sentence'}
              </motion.button>
              <motion.button
                onClick={showNextHint}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-md shadow-blue-300/30 cursor-pointer"
              >
                Hint ({hintLevel}/3)
              </motion.button>
              <motion.button
                onClick={generateNewExercise}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                New Words
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
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-800"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Word Bank 词库
            </h2>
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
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Tips:</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Drag words from the word bank to build your sentence</li>
            <li>• You can reorder words in your sentence by dragging them</li>
            <li>• Click the X to remove a word from your sentence</li>
            <li>• AI will check grammar, naturalness, and provide feedback</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
