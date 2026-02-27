import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Artwork } from '../data/artworks';
import { RotateCw } from 'lucide-react';
import { getArtworkImageUrl } from '../utils/imageLoader';

interface FlashcardProps {
  artwork: Artwork;
  question: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ artwork, question, isFlipped, onFlip }) => {
  const [imageError, setImageError] = useState(false);

  const imagePath = getArtworkImageUrl(artwork);
  
  // Fallback placeholder
  const placeholderImage = `https://placehold.co/600x800/2a2a2a/FFF?text=${encodeURIComponent(artwork.title)}`;

  return (
    <div className="relative w-full max-w-sm md:max-w-md aspect-[3/5] md:aspect-[3/4] perspective-1000 cursor-pointer group" onClick={onFlip}>
      <motion.div
        className="w-full h-full relative preserve-3d transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card (Image + Question) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl shadow-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex flex-col">
          {/* Image Area */}
          <div className="flex-1 relative bg-black w-full overflow-hidden">
            <img 
              src={imageError ? placeholderImage : imagePath} 
              alt="Artwork"
              className="absolute inset-0 w-full h-full object-contain"
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
            />
          </div>
          
          {/* Question Area (Bottom of front) */}
          <div className="h-1/4 min-h-[100px] bg-white dark:bg-neutral-800 p-6 flex flex-col items-center justify-center text-center border-t border-neutral-200 dark:border-neutral-700">
            <span className="text-xs uppercase tracking-widest text-indigo-500 font-bold mb-2">Pytanie</span>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-neutral-900 dark:text-white">
              {question}
            </h3>
            <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
              <RotateCw size={12} />
              <span>Dotknij, aby sprawdzić</span>
            </div>
          </div>
        </div>

        {/* Back of card (All Details) */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-3xl shadow-xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 flex flex-col justify-center items-center text-center"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="w-full space-y-6 overflow-y-auto max-h-full py-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">Tytuł</p>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-neutral-900 dark:text-white leading-tight">
                {artwork.title}
              </h2>
              <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full mt-3"></div>
            </div>

            <div className="space-y-4">
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl">
                <p className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">Autor</p>
                <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200">{artwork.author}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl">
                  <p className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">Rok</p>
                  <p className="text-lg font-mono text-neutral-800 dark:text-neutral-200">{artwork.year}</p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl">
                  <p className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">Wiek</p>
                  <p className="text-lg font-mono text-neutral-800 dark:text-neutral-200">{artwork.century}</p>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl">
                <p className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">Styl</p>
                <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium">
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
