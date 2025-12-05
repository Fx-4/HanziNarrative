import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import DraggableWord from '../components/sentencebuilder/DraggableWord';
import SentenceDropZone from '../components/sentencebuilder/SentenceDropZone';
import ValidationResult from '../components/sentencebuilder/ValidationResult';
import toast from 'react-hot-toast';

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

  // Fetch vocabulary for the selected HSK level
  useEffect(() => {
    fetchVocabulary();
  }, [hskLevel]);

  const fetchVocabulary = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/vocabulary/hsk/${hskLevel}`);
      const allWords = response.data;
      // Randomly select 10-15 words for the exercise
      const shuffled = allWords.sort(() => 0.5 - Math.random());
      const words = shuffled.slice(0, 12);
      setSelectedWords(words);

      // Generate a simple example sentence using some of the words
      if (words.length >= 3) {
        setTargetSentence(words.slice(0, 3).map(w => w.simplified).join(''));
      }
    } catch (error) {
      console.error('Failed to fetch vocabulary:', error);
      toast.error('Failed to load vocabulary');
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
        'http://localhost:8000/exercises/validate-sentence',
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

      if (response.data.is_correct) {
        toast.success(`Great job! Score: ${response.data.score}/100`);
      } else {
        toast.error(`Score: ${response.data.score}/100 - Check feedback below`);
      }
    } catch (error: any) {
      console.error('Validation failed:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Authentication error. Please login again.');
      } else if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        toast.error(`Failed to validate sentence: ${error.response?.data?.detail || error.message}`);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Sentence Builder 造句练习
          </h1>
          <p className="text-lg text-gray-600">
            Drag words to build Chinese sentences and get AI-powered feedback
          </p>
        </div>

        {/* HSK Level Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HSK Level:
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map(level => (
              <button
                key={level}
                onClick={() => setHskLevel(level)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  hskLevel === level
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                HSK {level}
              </button>
            ))}
          </div>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Sentence Construction Area */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Your Sentence: {sentence.map(w => w.simplified).join('')}
              </h2>
              <button
                onClick={clearSentence}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear
              </button>
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

            <div className="mt-4 flex gap-3">
              <button
                onClick={validateSentence}
                disabled={isValidating || sentence.length === 0}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? 'Validating...' : 'Validate Sentence'}
              </button>
              <button
                onClick={showNextHint}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                💡 Hint ({hintLevel}/3)
              </button>
              <button
                onClick={generateNewExercise}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                New Words
              </button>
            </div>

            {/* Hints Display */}
            {hintLevel > 0 && (
              <div className="mt-4 space-y-2">
                {getHintContent().map((hint) => (
                  <div
                    key={hint.level}
                    className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg"
                  >
                    <p className="font-semibold text-blue-900 mb-1">{hint.title}</p>
                    <p className="text-blue-800 text-sm">{hint.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Validation Result */}
          {validation && (
            <div className="mb-6">
              <ValidationResult
                isCorrect={validation.is_correct}
                score={validation.score}
                feedback={validation.feedback}
                corrections={validation.corrections}
                grammarIssues={validation.grammar_issues}
                suggestions={validation.suggestions}
              />
            </div>
          )}

          {/* Word Bank */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
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
          </div>

          <DragOverlay>
            {activeWord && (
              <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-3 shadow-xl cursor-grabbing">
                <div className="text-2xl font-bold text-center text-gray-800">
                  {activeWord.simplified}
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Tips:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Drag words from the word bank to build your sentence</li>
            <li>• You can reorder words in your sentence by dragging them</li>
            <li>• Click the X to remove a word from your sentence</li>
            <li>• AI will check grammar, naturalness, and provide feedback</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
