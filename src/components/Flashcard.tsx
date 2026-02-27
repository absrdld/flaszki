import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Artwork } from '../data/artworks';
import { RotateCw } from 'lucide-react';
import { getArtworkImageUrl } from '../utils/imageLoader';
import { getStyleColor } from '../utils/colors';

interface FlashcardProps {
  artwork: Artwork;
  question: string;
  questionType: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ artwork, question, questionType, isFlipped, onFlip }) => {
  const [imageState, setImageState] = useState<'DEFAULT' | 'NFD' | 'ERROR'>('DEFAULT');

  const defaultPath = getArtworkImageUrl(artwork);
  const styleColor = getStyleColor(artwork.style);
  
  const getSrc = () => {
    if (imageState === 'ERROR') {
      return `https://placehold.co/600x800/2a2a2a/FFF?text=${encodeURIComponent(artwork.title)}`;
    }
    
    if (imageState === 'NFD' && !artwork.imageUrl) {
      const cleanFilename = artwork.filename.replace(/^"|"$/g, '');
      return `/images/${cleanFilename.normalize('NFD')}.png`;
    }
    
    return defaultPath;
  };

  const handleError = () => {
    if (imageState === 'DEFAULT' && !artwork.imageUrl) {
      const cleanFilename = artwork.filename.replace(/^"|"$/g, '');
      if (cleanFilename !== cleanFilename.normalize('NFD')) {
        setImageState('NFD');
        return;
      }
    }
    setImageState('ERROR');
  };

  const isAnswer = (type: string) => questionType === type;

  return (
    <div className="relative w-full h-full perspective-1000 cursor-pointer group" onClick={onFlip}>
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }} // Faster animation
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card (Image + Question) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl shadow-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex flex-col">
          {/* Image Area */}
          <div className="flex-1 relative bg-black w-full overflow-hidden">
            <img 
              src={getSrc()} 
              alt="Artwork"
              className="absolute inset-0 w-full h-full object-contain"
              onError={handleError}
              referrerPolicy="no-referrer"
            />
          </div>
          
          {/* Question Area (Bottom of front) */}
          <div className="h-[20%] min-h-[80px] bg-white dark:bg-neutral-800 p-4 flex flex-col items-center justify-center text-center border-t border-neutral-200 dark:border-neutral-700">
            <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mb-1">Pytanie</span>
            <h3 className="text-lg md:text-xl font-serif font-bold text-neutral-900 dark:text-white leading-tight">
              {question}
            </h3>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-neutral-400">
              <RotateCw size={10} />
              <span>Dotknij, aby sprawdzić</span>
            </div>
          </div>
        </div>

        {/* Back of card (All Details) */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-3xl shadow-xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col justify-center items-center text-center"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-full flex flex-col justify-center gap-4 overflow-y-auto">
            <div className={`transition-all duration-300 ${isAnswer('Tytuł') ? 'scale-105' : 'opacity-90'}`}>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">Tytuł</p>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-neutral-900 dark:text-white leading-tight">
                {artwork.title}
              </h2>
              <div className="w-12 h-1 bg-indigo-500 mx-auto rounded-full mt-2"></div>
            </div>

            <div className="space-y-3 w-full">
              <div className={`bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl transition-all duration-300 ${isAnswer('Autor') ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-0.5">Autor</p>
                <p className="text-base font-medium text-neutral-800 dark:text-neutral-200">{artwork.author}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-0.5">Rok</p>
                  <p className="text-base font-mono text-neutral-800 dark:text-neutral-200">{artwork.year}</p>
                </div>
                <div 
                  className={`p-2.5 rounded-xl transition-all duration-300 ${isAnswer('Wiek') ? 'ring-2 ring-indigo-500 shadow-md' : ''}`}
                  style={{ backgroundColor: styleColor }}
                >
                  <p className="text-[10px] uppercase tracking-widest text-neutral-700/70 mb-0.5">Wiek</p>
                  <p className="text-base font-mono text-neutral-900 font-bold">{artwork.century}</p>
                </div>
              </div>

              <div 
                className={`p-2.5 rounded-xl transition-all duration-300 ${isAnswer('Styl') ? 'ring-2 ring-indigo-500 shadow-md' : ''}`}
                style={{ backgroundColor: styleColor }}
              >
                <p className="text-[10px] uppercase tracking-widest text-neutral-700/70 mb-0.5">Styl</p>
                <span className="inline-block text-base font-bold text-neutral-900">
                  {artwork.style}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
