import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  const [activeUpload, setActiveUpload] = useState(null);
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [mcqCount, setMcqCount] = useState(5);
  const [theoryCount, setTheoryCount] = useState(3);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [quizSession, setQuizSession] = useState(null);

  // Fix #3 — clear all quiz state the moment Firebase reports the user signed out.
  // QuizProvider renders inside AuthProvider, so it can't use useAuth().
  // Instead we subscribe to the same Firebase auth stream directly.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setActiveUpload(null);
        setSelectedPersonality(null);
        setMcqCount(5);
        setTheoryCount(3);
        setGeneratedContent(null);
        setQuizSession(null);
      }
    });
    return unsub;
  }, []);

  const resetQuiz = () => {
    setGeneratedContent(null);
    setQuizSession(null);
  };

  const clearAllQuizState = () => {
    setActiveUpload(null);
    setSelectedPersonality(null);
    setMcqCount(5);
    setTheoryCount(3);
    setGeneratedContent(null);
    setQuizSession(null);
  };

  return (
    <QuizContext.Provider value={{
      activeUpload, setActiveUpload,
      selectedPersonality, setSelectedPersonality,
      mcqCount, setMcqCount,
      theoryCount, setTheoryCount,
      generatedContent, setGeneratedContent,
      quizSession, setQuizSession,
      resetQuiz,
      clearAllQuizState,
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used inside QuizProvider');
  return ctx;
}
