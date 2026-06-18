import { CheckCircle, XCircle, Lightbulb, AlertCircle, Sparkles } from 'lucide-react';

interface ValidationResultProps {
  isCorrect: boolean;
  score: number;
  feedback: string;
  corrections: string[];
  grammarIssues: string[];
  suggestions: string[];
}

export default function ValidationResult({
  isCorrect,
  score,
  feedback,
  corrections,
  grammarIssues,
  suggestions,
}: ValidationResultProps) {
  return (
    <div className={`
      rounded-2xl p-6 border-2 space-y-4
      ${isCorrect
        ? 'bg-gradient-to-br from-success-50 to-success-50 border-success-300 dark:from-success-950/30 dark:to-success-950/30'
        : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 dark:from-yellow-950/30 dark:to-orange-950/30'
      }
    `}>
      {/* Header with score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-400" />
          ) : (
            <XCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          )}
          <div>
            <h3 className={`text-xl font-bold ${isCorrect ? 'text-success-700 dark:text-success-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
              {isCorrect ? 'Excellent! 很好！' : 'Good Try! 再试试！'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isCorrect ? 'Your sentence is correct!' : 'Let\'s improve this sentence'}
            </p>
          </div>
        </div>

        {/* Score Badge */}
        <div className={`
          px-4 py-2 rounded-full font-bold text-lg shadow-sm
          ${score >= 80 ? 'bg-success-500 text-white shadow-success-500/20' :
            score >= 60 ? 'bg-yellow-500 text-white shadow-yellow-500/20' :
            'bg-orange-500 text-white shadow-orange-500/20'}
        `}>
          {score}/100
        </div>
      </div>

      {/* AI Feedback */}
      <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0 dark:text-purple-400" />
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">AI Feedback</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{feedback}</p>
          </div>
        </div>
      </div>

      {/* Corrections */}
      {corrections.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0 dark:text-yellow-400" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Corrections / 更正</h4>
              <ul className="space-y-1">
                {corrections.map((correction, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-yellow-600 font-bold dark:text-yellow-400">•</span>
                    <span>{correction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Grammar Issues */}
      {grammarIssues.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 border border-error-200 dark:border-error-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-error-600 mt-0.5 flex-shrink-0 dark:text-error-400" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Grammar Issues / 语法问题</h4>
              <ul className="space-y-1">
                {grammarIssues.map((issue, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-error-600 font-bold dark:text-error-400">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 dark:text-blue-400" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Suggestions / 建议</h4>
              <ul className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-blue-600 font-bold dark:text-blue-400">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
