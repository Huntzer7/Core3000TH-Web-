import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, BrainCircuit, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Word } from '../types';

interface LearningViewProps {
  words: Word[];
  currentIndex: number;
  learnedWords: number[];
  onNext: () => void;
  onPrev: () => void;
  onQuizClick: () => void;
  onBackHome: () => void;
}

export function LearningView({ 
  words, 
  currentIndex, 
  learnedWords,
  onNext, 
  onPrev, 
  onQuizClick,
  onBackHome
}: LearningViewProps) {
  const [showMeaning, setShowMeaning] = useState(false);

  // Reset show meaning when word changes
  useEffect(() => {
    setShowMeaning(false);
  }, [currentIndex]);

  const word = words[currentIndex];
  if (!word) return null;

  const totalWords = words.length;
  const progress = ((currentIndex + 1) / totalWords) * 100;
  
  const canQuiz = learnedWords.length >= 4;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-[100dvh] max-w-md mx-auto bg-background"
      data-testid="view-learning"
    >
      {/* Top Bar */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBackHome} data-testid="button-back-home" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-1">
            Word {currentIndex + 1} / {totalWords}
          </span>
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onQuizClick}
          disabled={!canQuiz}
          className={`transition-colors ${canQuiz ? 'text-primary hover:text-primary/80 hover:bg-primary/10' : 'text-muted-foreground/30'}`}
          data-testid="button-quiz-mode"
          title={canQuiz ? "Quiz Mode" : "Learn at least 4 words first"}
        >
          <BrainCircuit className="w-6 h-6" />
        </Button>
      </header>

      {/* Main Card Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full aspect-[4/5] bg-card rounded-3xl shadow-sm border border-card-border p-8 flex flex-col items-center justify-center relative overflow-hidden"
            data-testid="card-flashcard"
          >
            {/* Word Type Badge */}
            <div className="absolute top-6">
              <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full tracking-wide">
                {word.type}
              </span>
            </div>

            {/* Word */}
            <h2 className="text-5xl font-serif text-foreground text-center leading-tight mb-8" data-testid="text-word">
              {word.word}
            </h2>

            {/* Meaning Area */}
            <div className="h-24 w-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                {showMeaning ? (
                  <motion.p 
                    key="meaning"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-2xl text-primary text-center font-medium"
                    data-testid="text-meaning"
                  >
                    {word.meaning}
                  </motion.p>
                ) : (
                  <motion.div
                    key="hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Button 
                      variant="outline" 
                      onClick={() => setShowMeaning(true)}
                      className="rounded-full px-6 text-muted-foreground border-dashed"
                      data-testid="button-reveal-meaning"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Reveal Meaning
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Controls */}
      <footer className="p-6 pt-0 flex gap-4">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex-1 h-14 rounded-xl border-border hover:bg-secondary/50"
          data-testid="button-prev"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button 
          size="lg" 
          onClick={onNext}
          className="flex-1 h-14 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
          data-testid="button-next"
        >
          Next
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </footer>
    </motion.div>
  );
}
