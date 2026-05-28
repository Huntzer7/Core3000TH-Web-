import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Word, QuizQuestion, QuizResult } from '../types';

interface QuizViewProps {
  words: Word[];
  learnedWords: number[];
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

export function QuizView({ words, learnedWords, onComplete, onExit }: QuizViewProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (words.length === 0 || learnedWords.length < 4) return;
    
    // Select up to 10 random learned words for the quiz
    const shuffledLearned = [...learnedWords].sort(() => Math.random() - 0.5);
    const selectedIndices = shuffledLearned.slice(0, 10);
    
    const qs: QuizQuestion[] = selectedIndices.map(index => {
      const correctWord = words[index];
      
      const wrongOptions: string[] = [];
      let attempts = 0;
      while (wrongOptions.length < 3 && attempts < 100) {
        const r = Math.floor(Math.random() * words.length);
        if (r !== index && !wrongOptions.includes(words[r].meaning) && words[r].meaning !== correctWord.meaning) {
          wrongOptions.push(words[r].meaning);
        }
        attempts++;
      }
      
      const options = [correctWord.meaning, ...wrongOptions].sort(() => Math.random() - 0.5);
      
      return {
        wordIndex: index,
        word: correctWord.word,
        correctMeaning: correctWord.meaning,
        options
      };
    });
    
    setQuestions(qs);
  }, [words, learnedWords]);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-serif mb-4">Not enough words</h2>
        <p className="text-muted-foreground mb-8">Learn at least 4 words to unlock Quiz Mode.</p>
        <Button onClick={onExit} size="lg" className="rounded-xl">Back to Learning</Button>
      </div>
    );
  }

  const question = questions[currentQIndex];
  const isAnswered = selectedAnswer !== null;

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    
    const isCorrect = option === question.correctMeaning;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        onComplete({
          correct: correctCount + (isCorrect ? 1 : 0),
          incorrect: questions.length - (correctCount + (isCorrect ? 1 : 0)),
          total: questions.length
        });
      }
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col min-h-[100dvh] max-w-md mx-auto bg-background"
      data-testid="view-quiz"
    >
      <header className="flex items-center justify-between p-4 mb-4">
        <div className="w-10"></div>
        <div className="text-sm font-semibold text-muted-foreground tracking-widest uppercase">
          Question {currentQIndex + 1} of {questions.length}
        </div>
        <Button variant="ghost" size="icon" onClick={onExit} data-testid="button-exit-quiz">
          <X className="w-6 h-6 text-muted-foreground" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col px-6 pb-6">
        <div className="flex-1 flex flex-col items-center justify-center mb-8">
          <span className="text-sm text-primary font-medium mb-4 tracking-wide uppercase">What is the meaning of:</span>
          <h2 className="text-5xl font-serif text-foreground text-center" data-testid="text-quiz-word">
            {question.word}
          </h2>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {question.options.map((option, i) => {
              let stateClass = "bg-card border-card-border hover:border-primary/50 hover:bg-secondary/30";
              let icon = null;
              
              if (isAnswered) {
                if (option === question.correctMeaning) {
                  stateClass = "bg-success/10 border-success text-success-foreground dark:text-success";
                  icon = <CheckCircle2 className="w-5 h-5 text-success" />;
                } else if (option === selectedAnswer) {
                  stateClass = "bg-destructive/10 border-destructive text-destructive-foreground dark:text-destructive";
                  icon = <XCircle className="w-5 h-5 text-destructive" />;
                } else {
                  stateClass = "bg-card border-card-border opacity-50";
                }
              }

              return (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  disabled={isAnswered}
                  onClick={() => handleSelect(option)}
                  className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${stateClass}`}
                  data-testid={`button-quiz-option-${i}`}
                >
                  <span className="text-lg font-medium">{option}</span>
                  {icon}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
}
