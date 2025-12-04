import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableWord from './DraggableWord';

interface Word {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
}

interface SentenceDropZoneProps {
  words: Word[];
  onRemoveWord: (id: string) => void;
}

export default function SentenceDropZone({ words, onRemoveWord }: SentenceDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'sentence-zone',
  });

  return (
    <div className="w-full space-y-3">
      {/* Zone Label */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">
          Your Sentence / 你的句子
        </h3>
        {words.length > 0 && (
          <button
            onClick={() => words.forEach(w => onRemoveWord(w.id))}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`
          min-h-[120px] p-6 rounded-2xl border-3 border-dashed
          transition-all duration-300 ease-in-out
          ${isOver
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 bg-gray-50'
          }
          ${words.length === 0 ? 'flex items-center justify-center' : ''}
        `}
      >
        {words.length === 0 ? (
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">Drag words here to build your sentence</p>
            <p className="text-xs mt-1">拖动汉字到这里组成句子</p>
          </div>
        ) : (
          <SortableContext
            items={words.map(w => w.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-3">
              {words.map((word) => (
                <div key={word.id} className="relative group">
                  <DraggableWord
                    id={word.id}
                    word={word.chinese}
                    pinyin={word.pinyin}
                    english={word.english}
                    isInSentence={true}
                  />
                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveWord(word.id)}
                    className="absolute -top-2 -right-2 w-6 h-6
                             bg-red-500 hover:bg-red-600 text-white
                             rounded-full opacity-0 group-hover:opacity-100
                             transition-opacity duration-200
                             flex items-center justify-center
                             text-sm font-bold shadow-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}
