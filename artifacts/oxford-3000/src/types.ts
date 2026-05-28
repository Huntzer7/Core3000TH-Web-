export interface Word {
  word: string;
  type: string;
  meaning: string;
}

export type ViewState = 'home' | 'learning' | 'quiz' | 'result';

export interface QuizQuestion {
  wordIndex: number;
  word: string;
  correctMeaning: string;
  options: string[];
}

export interface QuizResult {
  correct: number;
  incorrect: number;
  total: number;
}
