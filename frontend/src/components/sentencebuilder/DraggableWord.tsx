import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableWordProps {
  id: string;
  word: string;
  pinyin: string;
  english: string;
  isInSentence?: boolean;
}

export default function DraggableWord({ id, word, pinyin, english, isInSentence }: DraggableWordProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative cursor-grab active:cursor-grabbing
        px-4 py-3 rounded-xl border-2
        transition-all duration-200 ease-in-out
        hover:scale-105 hover:shadow-lg
        ${isInSentence
          ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400 text-white'
          : 'bg-white border-gray-300 hover:border-blue-400'
        }
        ${isDragging ? 'shadow-2xl scale-110 rotate-2' : ''}
      `}
    >
      {/* Chinese Character - Large and centered */}
      <div className="text-2xl font-bold text-center mb-1">
        {word}
      </div>

      {/* Pinyin - Small and subtle */}
      <div className={`text-xs text-center ${isInSentence ? 'text-blue-100' : 'text-gray-500'}`}>
        {pinyin}
      </div>

      {/* English translation tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1
                      bg-gray-900 text-white text-sm rounded-lg
                      opacity-0 group-hover:opacity-100 pointer-events-none
                      transition-opacity duration-200 whitespace-nowrap
                      z-10">
        {english}
        <div className="absolute top-full left-1/2 -translate-x-1/2
                        border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}
