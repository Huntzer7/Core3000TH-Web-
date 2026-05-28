import { useState, useEffect } from 'react';
import { Word } from '../types';

export function useVocabulary() {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('oxford_currentIndex');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  
  const [learnedWords, setLearnedWords] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('oxford_learnedWords');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetch('/words.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load words');
        return res.json();
      })
      .then(data => {
        setWords(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching words:', err);
        setError('Failed to load vocabulary data.');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('oxford_currentIndex', currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem('oxford_learnedWords', JSON.stringify(learnedWords));
  }, [learnedWords]);

  const markLearned = (index: number) => {
    setLearnedWords(prev => {
      if (prev.includes(index)) return prev;
      return [...prev, index];
    });
  };

  return {
    words,
    isLoading,
    error,
    currentIndex,
    setCurrentIndex,
    learnedWords,
    markLearned
  };
}
