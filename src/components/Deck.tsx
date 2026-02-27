import React, { useState, useEffect, useMemo } from 'react';
import { Artwork, artworks } from '../data/artworks';
import { Flashcard } from './Flashcard';
import { Shuffle, RotateCcw, Filter, Info, X, Check, X as XIcon, GraduationCap, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type QuestionType = 'Tytuł' | 'Autor' | 'Wiek' | 'Styl';
const QUESTIONS: QuestionType[] = ['Tytuł', 'Autor', 'Wiek', 'Styl'];

export const Deck: React.FC = () => {
  // State for Known/Unknown
  const [knownIds, setKnownIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('knownArtworks');
    return saved ? JSON.parse(saved) : [];
  });
  
  // View Mode: 'all' (Wszystkie), 'learning' (Do nauki - default), 'known' (Nauczone)
  const [viewMode, setViewMode] = useState<'all' | 'learning' | 'known'>('learning');
  
  // Filters
  const [selectedStyle, setSelectedStyle] = useState<string>('Wszystkie');
  const [selectedCentury, setSelectedCentury] = useState<string>('Wszystkie');
  
  // Deck State
  const [deck, setDeck] = useState<Artwork[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<string>('Tytuł');

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Persist known IDs
  useEffect(() => {
    localStorage.setItem('knownArtworks', JSON.stringify(knownIds));
  }, [knownIds]);

  // Derived data for filters
  const styles = useMemo(() => ['Wszystkie', ...new Set(artworks.map(a => a.style))], []);
  const centuries = useMemo(() => ['Wszystkie', ...new Set(artworks.map(a => a.century))], []);

  // Initialize and filter deck
  useEffect(() => {
    let filtered = artworks;

    // 1. Filter by View Mode
    if (viewMode === 'learning') {
      filtered = filtered.filter(a => !knownIds.includes(a.id));
    } else if (viewMode === 'known') {
      filtered = filtered.filter(a => knownIds.includes(a.id));
    }

    // 2. Filter by Style/Century
    if (selectedStyle !== 'Wszystkie') {
      filtered = filtered.filter(a => a.style === selectedStyle);
    }
    if (selectedCentury !== 'Wszystkie') {
      filtered = filtered.filter(a => a.century === selectedCentury);
    }

    setDeck(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
    setDirection(0);
    generateNewQuestion();
  }, [viewMode, selectedStyle, selectedCentury, knownIds.length]); // Re-run when knownIds changes size (added/removed)

  const generateNewQuestion = () => {
    const randomQ = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    let questionText = "";
    switch (randomQ) {
      case 'Tytuł': questionText = "Jaki jest tytuł tego dzieła?"; break;
      case 'Autor': questionText = "Kto jest autorem tego dzieła?"; break;
      case 'Wiek': questionText = "Z którego wieku pochodzi to dzieło?"; break;
      case 'Styl': questionText = "Jaki to styl?"; break;
    }
    setCurrentQuestion(questionText);
  };

  const currentCard = deck[currentIndex];

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        generateNewQuestion();
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        generateNewQuestion();
      }, 150);
    }
  };

  const markAsKnown = () => {
    if (!currentCard) return;
    if (!knownIds.includes(currentCard.id)) {
      setKnownIds(prev => [...prev, currentCard.id]);
      // If we are in 'learning' mode, this card will disappear from the deck.
      // We need to handle index carefully.
      // Actually, useEffect will trigger re-render of deck.
      // But for smooth UX, maybe we just move to next?
      // Let's let the useEffect handle the deck update, but we might need to adjust index if it goes out of bounds.
    }
    // If already known, maybe just move next?
    if (currentIndex < deck.length - 1) {
      handleNext();
    }
  };

  const markAsUnknown = () => {
    if (!currentCard) return;
    if (knownIds.includes(currentCard.id)) {
      setKnownIds(prev => prev.filter(id => id !== currentCard.id));
    }
    handleNext();
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setDirection(0);
    generateNewQuestion();
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
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ' || e.key === 'Enter') setIsFlipped(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, deck.length]);

  if (deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
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
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 pb-24 md:pb-12 relative min-h-screen">
      
      {/* View Mode Tabs */}
      <div className="w-full flex p-1 bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-6">
        <button
          onClick={() => setViewMode('learning')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'learning' ? 'bg-white dark:bg-neutral-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
        >
          Do nauki
        </button>
        <button
          onClick={() => setViewMode('known')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'known' ? 'bg-white dark:bg-neutral-700 shadow-sm text-green-600 dark:text-green-400' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
        >
          Umiem ({knownIds.length})
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'all' ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
        >
          Wszystkie
        </button>
      </div>

      {/* Top Controls */}
      <div className="w-full flex items-center justify-between text-sm text-neutral-500 font-mono mb-4">
        <span>{currentIndex + 1} / {deck.length}</span>
        
        <div className="flex gap-2">
           <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            title="Filtruj"
          >
            <Filter size={20} />
          </button>
          <button 
            onClick={handleShuffle}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Tasuj"
          >
            <Shuffle size={20} />
          </button>
          <button 
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Pomoc"
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full mb-6 overflow-hidden bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm"
          >
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase text-neutral-500 mb-1">Styl</label>
                <select 
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-none text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  {styles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-500 mb-1">Wiek</label>
                <select 
                  value={selectedCentury}
                  onChange={(e) => setSelectedCentury(e.target.value)}
                  className="w-full p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-none text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  {centuries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Area */}
      <div className="w-full flex-1 flex justify-center items-start mb-24 md:mb-8 relative z-10">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentCard.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.2 }}
            className="w-full flex justify-center"
          >
            <Flashcard 
              artwork={currentCard} 
              question={currentQuestion}
              isFlipped={isFlipped} 
              onFlip={() => setIsFlipped(!isFlipped)} 
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Bottom Controls (Mobile First) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 z-50 flex justify-center">
        <div className="w-full max-w-md flex items-center justify-between gap-4">
          
          {/* Nie znam (Red) */}
          <button
            onClick={markAsUnknown}
            className="flex-1 flex flex-col items-center justify-center p-3 rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors active:scale-95"
          >
            <XIcon size={24} className="mb-1" />
            <span className="text-xs font-bold uppercase tracking-wide">Nie znam</span>
          </button>

          {/* Flip Button (Center) */}
          {/* Only visible if needed, but card click handles flip too. Maybe just navigation? */}
          {/* Let's keep it simple: Prev/Next are less important than Know/Don't Know in this mode */}
          
          {/* Znam (Green) */}
          <button
            onClick={markAsKnown}
            className="flex-1 flex flex-col items-center justify-center p-3 rounded-2xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors active:scale-95"
          >
            <Check size={24} className="mb-1" />
            <span className="text-xs font-bold uppercase tracking-wide">Znam</span>
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
                <h3 className="text-xl font-bold">Jak korzystać?</h3>
                <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
                <p>
                  1. <strong>Zobacz obraz i pytanie</strong>: Na przodzie karty zobaczysz dzieło i losowe pytanie (np. o autora).
                </p>
                <p>
                  2. <strong>Odwróć kartę</strong>: Dotknij karty, aby zobaczyć wszystkie informacje.
                </p>
                <p>
                  3. <strong>Oceń wiedzę</strong>:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><span className="text-green-600 font-bold">ZNAM</span>: Karta trafi do puli "Nauczone".</li>
                    <li><span className="text-red-600 font-bold">NIE ZNAM</span>: Karta zostanie w puli "Do nauki".</li>
                  </ul>
                </p>
                <p className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <strong>Zdjęcia:</strong> Format <code>.png</code> w folderze <code>public/images</code>.
                </p>
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
