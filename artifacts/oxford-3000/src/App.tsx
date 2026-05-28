import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useVocabulary } from "@/hooks/use-vocabulary";
import { HomeView } from "@/components/HomeView";
import { LearningView } from "@/components/LearningView";
import { QuizView } from "@/components/QuizView";
import { ResultView } from "@/components/ResultView";
import { ViewState, QuizResult } from "@/types";
import { Loader2 } from "lucide-react";

export default function App() {
  const { 
    words, 
    isLoading, 
    error,
    currentIndex, 
    setCurrentIndex, 
    learnedWords, 
    markLearned 
  } = useVocabulary();

  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || words.length === 0) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-2xl font-serif text-destructive mb-2">Failed to load data</h1>
        <p className="text-muted-foreground">{error || "No words found in dictionary."}</p>
      </div>
    );
  }

  const handleNextWord = () => {
    markLearned(currentIndex);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleQuizComplete = (result: QuizResult) => {
    setQuizResult(result);
    setCurrentView('result');
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background overflow-hidden relative">
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <HomeView
            key="home"
            totalWords={words.length}
            learnedCount={learnedWords.length}
            onStart={() => setCurrentView('learning')}
          />
        )}
        
        {currentView === 'learning' && (
          <LearningView
            key="learning"
            words={words}
            currentIndex={currentIndex}
            learnedWords={learnedWords}
            onNext={handleNextWord}
            onPrev={handlePrevWord}
            onQuizClick={() => setCurrentView('quiz')}
            onBackHome={() => setCurrentView('home')}
          />
        )}
        
        {currentView === 'quiz' && (
          <QuizView
            key="quiz"
            words={words}
            learnedWords={learnedWords}
            onComplete={handleQuizComplete}
            onExit={() => setCurrentView('learning')}
          />
        )}
        
        {currentView === 'result' && quizResult && (
          <ResultView
            key="result"
            result={quizResult}
            onRestart={() => setCurrentView('quiz')}
            onBackHome={() => setCurrentView('learning')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
