import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizResult } from '../types';

interface ResultViewProps {
  result: QuizResult;
  onRestart: () => void;
  onBackHome: () => void;
}

export function ResultView({ result, onRestart, onBackHome }: ResultViewProps) {
  const scorePercent = Math.round((result.correct / result.total) * 100);
  
  let message = "Good effort!";
  if (scorePercent === 100) message = "Perfect Score!";
  else if (scorePercent >= 80) message = "Excellent work!";
  else if (scorePercent >= 60) message = "Well done!";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[100dvh] p-6 max-w-md mx-auto"
      data-testid="view-result"
    >
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
        <Trophy size={48} strokeWidth={1.5} />
      </div>
      
      <h1 className="text-3xl font-serif text-foreground mb-2 text-center">
        {message}
      </h1>
      <p className="text-muted-foreground text-center mb-10">
        You completed the quiz session.
      </p>

      <div className="w-full bg-card rounded-3xl p-8 shadow-sm border border-card-border mb-10 flex flex-col items-center">
        <div className="text-6xl font-serif text-primary mb-6" data-testid="text-score-percent">
          {scorePercent}%
        </div>
        
        <div className="flex w-full justify-between gap-4 text-center">
          <div className="flex-1 bg-success/10 rounded-xl p-4">
            <p className="text-sm font-medium text-success uppercase tracking-wider mb-1">Correct</p>
            <p className="text-2xl font-semibold text-success dark:text-success-foreground" data-testid="text-correct-count">{result.correct}</p>
          </div>
          <div className="flex-1 bg-destructive/10 rounded-xl p-4">
            <p className="text-sm font-medium text-destructive uppercase tracking-wider mb-1">Incorrect</p>
            <p className="text-2xl font-semibold text-destructive dark:text-destructive-foreground" data-testid="text-incorrect-count">{result.incorrect}</p>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        <Button 
          size="lg" 
          onClick={onRestart}
          className="w-full h-14 text-lg rounded-xl"
          data-testid="button-restart-quiz"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Restart Quiz
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          onClick={onBackHome}
          className="w-full h-14 text-lg rounded-xl border-border hover:bg-secondary/50"
          data-testid="button-back-learning"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Learning
        </Button>
      </div>
    </motion.div>
  );
}
