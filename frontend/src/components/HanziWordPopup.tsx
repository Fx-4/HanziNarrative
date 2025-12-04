import { motion, AnimatePresence } from 'framer-motion'
import { HanziWord } from '@/types'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { BookmarkPlus, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface HanziWordPopupProps {
  word: HanziWord
  position: { x: number; y: number }
  onClose: () => void
}

export default function HanziWordPopup({ word, position, onClose }: HanziWordPopupProps) {
  const handleSaveWord = () => {
    toast.success(`Saved "${word.simplified}" to your collection!`)
    console.log('Add to set:', word.id)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed z-50 bg-white rounded-xl shadow-2xl p-6 max-w-sm border-2 border-primary-100"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -120%)',
        }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.div
            className="text-center"
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <motion.h2
              className="text-6xl font-bold text-gray-900 mb-2"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {word.simplified}
            </motion.h2>
            {word.traditional !== word.simplified && (
              <p className="text-2xl text-gray-600">{word.traditional}</p>
            )}
          </motion.div>

          <motion.div
            className="border-t pt-4"
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0 },
            }}
          >
            <p className="text-2xl text-primary-600 font-medium mb-2">
              {word.pinyin}
            </p>
            <p className="text-lg text-gray-700">
              {word.english}
            </p>
          </motion.div>

          {word.image_url && (
            <motion.div
              className="border-t pt-4"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
              }}
            >
              <motion.img
                src={word.image_url}
                alt={word.english}
                className="w-full h-48 object-cover rounded-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          )}

          <motion.div
            className="border-t pt-4 flex justify-between items-center"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <Badge variant="default">
              HSK Level {word.hsk_level}
            </Badge>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveWord}
            >
              <BookmarkPlus className="w-4 h-4 mr-1" />
              Save
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
