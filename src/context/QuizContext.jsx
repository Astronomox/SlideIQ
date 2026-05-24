import React, { createContext, useContext, useState } from 'react';

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  const [activeUpload, setActiveUpload] = useState(null);
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [mcqCount, setMcqCount] = useState(5);
  const [theoryCount, setTheoryCount] = useState(3);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [quizSession, setQuizSession] = useState(null);

  const resetQuiz = () => {
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
