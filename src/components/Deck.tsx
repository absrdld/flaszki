import React, { useState, useEffect, useMemo } from 'react';
import { Artwork, artworks } from '../data/artworks';
import { Flashcard } from './Flashcard';
import { Shuffle, RotateCcw, Filter, Info, X, Check, X as XIcon, GraduationCap, Trash2 } from 'lucide-react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'motion/react';

type QuestionType = 'Tytuł' | 'Autor' | 'Wiek' | 'Styl';

interface CardItem {
  id: string;
  artwork: Artwork;
  questionType: QuestionType;
  question: string;
}

export const Deck: React.FC = () => {
  // State for Known/Unknown (using string IDs now)
  const [knownIds, setKnownIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('knownCards');
    return saved ? JSON.parse(saved) : [];
  });
  
  // View Mode: 'all' (Wszystkie), 'learning' (Do nauki - default), 'known' (Nauczone)
  const [viewMode, setViewMode] = useState<'all' | 'learning' | 'known'>('learning');
  
  // Filters
  const [selectedStyle, setSelectedStyle] = useState<string>('Wszystkie');
  const [selectedCentury, setSelectedCentury] = useState<string>('Wszystkie');
  
  // Deck State
  const [deck, setDeck] = useState<CardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Drag state
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  const bgKnownOpacity = useTransform(x, [0, 150], [0, 0.5]);
  const bgUnknownOpacity = useTransform(x, [-150, 0], [0.5, 0]);

  // Persist known IDs
  useEffect(() => {
    localStorage.setItem('knownCards', JSON.stringify(knownIds));
  }, [knownIds]);

  // Derived data for filters
  const styles = useMemo(() => ['Wszystkie', ...new Set(artworks.map(a => a.style))], []);
  const centuries = useMemo(() => ['Wszystkie', ...new Set(artworks.map(a => a.century))], []);

  // Generate full deck (4 cards per artwork)
  const fullDeck = useMemo(() => {
    return artworks.flatMap(art => [
      { id: `${art.id}-title`, artwork: art, questionType: 'Tytuł' as QuestionType, question: 'Jaki jest tytuł tego dzieła?' },
      { id: `${art.id}-author`, artwork: art, questionType: 'Autor' as QuestionType, question: 'Kto jest autorem tego dzieła?' },
      { id: `${art.id}-century`, artwork: art, questionType: 'Wiek' as QuestionType, question: 'Z którego wieku pochodzi to dzieło?' },
      { id: `${art.id}-style`, artwork: art, questionType: 'Styl' as QuestionType, question: 'Jaki to styl?' },
    ]);
  }, []);

  // Initialize and filter deck
  useEffect(() => {
    let filtered = fullDeck;

    // 1. Filter by View Mode
    if (viewMode === 'learning') {
      filtered = filtered.filter(item => !knownIds.includes(item.id));
    } else if (viewMode === 'known') {
      filtered = filtered.filter(item => knownIds.includes(item.id));
    }

    // 2. Filter by Style/Century (based on artwork properties)
    if (selectedStyle !== 'Wszystkie') {
      filtered = filtered.filter(item => item.artwork.style === selectedStyle);
    }
    if (selectedCentury !== 'Wszystkie') {
      filtered = filtered.filter(item => item.artwork.century === selectedCentury);
    }

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);

    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setDirection(0);
  }, [viewMode, selectedStyle, selectedCentury, fullDeck]);

  const currentCard = deck[currentIndex];

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 100); // Faster transition
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      markAsKnown();
    } else if (info.offset.x < -threshold) {
      markAsUnknown();
    }
  };

  const markAsKnown = () => {
    if (!currentCard) return;
    if (!knownIds.includes(currentCard.id)) {
      setKnownIds(prev => [...prev, currentCard.id]);
    }
    // Animate out right
    setDirection(1);
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Refresh deck logic if needed, or just stay
      }
    }, 100);
  };

  const markAsUnknown = () => {
    if (!currentCard) return;
    if (knownIds.includes(currentCard.id)) {
      setKnownIds(prev => prev.filter(id => id !== currentCard.id));
    }
    // Animate out left
    setDirection(-1);
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 100);
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setDirection(0);
  };

  const handleResetProgress = () => {
    if (confirm("Czy na pewno chcesz zresetować postępy? Wszystkie karty wrócą do 'Do nauki'.")) {
      setKnownIds([]);
      setViewMode('learning');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') markAsKnown();
      if (e.key === 'ArrowLeft') markAsUnknown();
      if (e.key === ' ' || e.key === 'Enter') setIsFlipped(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, deck.length, currentCard]);

  if (deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-4 text-center">
        <div className="bg-neutral-100 dark:bg-neutral-800 p-8 rounded-3xl shadow-sm max-w-sm w-full">
          <GraduationCap size={48} className="mx-auto text-indigo-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Brak kart w tym widoku</h3>
          <p className="text-neutral-500 mb-6">
            {viewMode === 'learning' 
              ? "Gratulacje! Znasz już wszystkie dzieła z obecnych filtrów." 
              : viewMode === 'known' 
                ? "Jeszcze nie oznaczyłeś żadnych kart jako 'Znam'." 
                : "Brak wyników dla wybranych filtrów."}
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setViewMode('all')}
              className="px-6 py-3 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl font-medium hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
            >
              Pokaż wszystkie
            </button>
            {viewMode === 'learning' && (
              <button 
                onClick={handleResetProgress}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Resetuj postępy
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-[100dvh] overflow-hidden bg-neutral-100 dark:bg-neutral-950">
      
      {/* Top Bar (Compact) */}
      <div className="w-full max-w-md px-4 pt-4 pb-2 z-20 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold font-serif">Historia Sztuki</h1>
          <div className="flex gap-1">
             <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"><Filter size={18} /></button>
             <button onClick={handleShuffle} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"><Shuffle size={18} /></button>
             <button onClick={handleResetProgress} className="p-2 rounded-full hover:bg-red-100 text-red-500"><Trash2 size={18} /></button>
             <button onClick={() => setShowHelp(true)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"><Info size={18} /></button>
          </div>
        </div>

        {/* View Mode Tabs (Compact) */}
        <div className="flex p-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg">
          <button onClick={() => setViewMode('learning')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'learning' ? 'bg-white dark:bg-neutral-700 shadow-sm text-indigo-600' : 'text-neutral-500'}`}>Do nauki</button>
          <button onClick={() => setViewMode('known')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'known' ? 'bg-white dark:bg-neutral-700 shadow-sm text-green-600' : 'text-neutral-500'}`}>Umiem ({knownIds.length})</button>
          <button onClick={() => setViewMode('all')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'all' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'text-neutral-500'}`}>Wszystkie</button>
        </div>
      </div>

      {/* Filters Panel Overlay */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full max-w-md px-4 z-30 absolute top-28"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 mb-1">Styl</label>
                <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs">
                  {styles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 mb-1">Wiek</label>
                <select value={selectedCentury} onChange={(e) => setSelectedCentury(e.target.value)} className="w-full p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs">
                  {centuries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Area (Flexible height) */}
      <div className="flex-1 w-full max-w-md flex items-center justify-center p-4 relative z-10 overflow-hidden">
        {/* Swipe Indicators */}
        <motion.div style={{ opacity: bgUnknownOpacity }} className="absolute inset-0 bg-red-500/20 pointer-events-none z-0 flex items-center justify-start pl-8">
          <XIcon size={48} className="text-red-500" />
        </motion.div>
        <motion.div style={{ opacity: bgKnownOpacity }} className="absolute inset-0 bg-green-500/20 pointer-events-none z-0 flex items-center justify-end pr-8">
          <Check size={48} className="text-green-500" />
        </motion.div>

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentCard.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -100, scale: 0.9 }}
            transition={{ duration: 0.15 }} // Fast slide
            className="w-full h-full max-h-[600px] aspect-[3/5] md:aspect-[3/4]"
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
          >
            <Flashcard 
              artwork={currentCard.artwork} 
              question={currentCard.question}
              questionType={currentCard.questionType}
              isFlipped={isFlipped} 
              onFlip={() => setIsFlipped(!isFlipped)} 
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls (Fixed) */}
      <div className="w-full max-w-md px-4 pb-6 pt-2 shrink-0 z-20">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={markAsUnknown}
            className="flex-1 py-4 rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-sm"
          >
            NIE ZNAM
          </button>
          
          <div className="text-xs font-mono text-neutral-400">
            {currentIndex + 1} / {deck.length}
          </div>
          
          <button
            onClick={markAsKnown}
            className="flex-1 py-4 rounded-2xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-sm"
          >
            ZNAM
          </button>
        </div>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Gestures & Controls</h3>
                <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
                <p>👉 <strong>Przesuń w PRAWO</strong>: Oznacz jako "Znam" (Zielony).</p>
                <p>👈 <strong>Przesuń w LEWO</strong>: Oznacz jako "Nie znam" (Czerwony).</p>
                <p>👆 <strong>Dotknij karty</strong>: Odwróć, aby zobaczyć odpowiedź.</p>
              </div>
              <button 
                onClick={() => setShowHelp(false)}
                className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
              >
                Rozumiem
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
