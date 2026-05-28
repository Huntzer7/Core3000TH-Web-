import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomeViewProps {
  totalWords: number;
  learnedCount: number;
  onStart: () => void;
}

export function HomeView({ totalWords, learnedCount, onStart }: HomeViewProps) {
  const remaining = Math.max(0, totalWords - learnedCount);
  const progressPercent = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[100dvh] p-6 max-w-md mx-auto"
      data-testid="view-home"
    >
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-8 text-primary">
        <BookOpen size={40} strokeWidth={1.5} />
      </div>
      
      <h1 className="text-4xl font-serif text-foreground mb-2 text-center" data-testid="text-title">
        Oxford 3000
      </h1>
      <p className="text-muted-foreground text-center mb-12">
        The core vocabulary for English learners.
      </p>

      <div className="w-full bg-card rounded-2xl p-6 shadow-sm border border-card-border mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">LEARNED</p>
            <p className="text-3xl font-serif text-foreground" data-testid="text-learned-count">{learnedCount}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">REMAINING</p>
            <p className="text-3xl font-serif text-muted-foreground" data-testid="text-remaining-count">{remaining}</p>
          </div>
        </div>
        
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-primary" 
          />
        </div>
        <p className="text-right text-xs text-muted-foreground mt-2 font-medium">
          {progressPercent}% Complete
        </p>
      </div>

      <Button 
        size="lg" 
        className="w-full h-14 text-lg rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        onClick={onStart}
        data-testid="button-start-learning"
      >
        Continue Learning
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </motion.div>
  );
}
