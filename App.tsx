
import React, { useState } from 'react';
import QuizCreator from './components/QuizCreator';
import QuizTaker from './components/QuizTaker';
import type { Quiz } from './types';

const App: React.FC = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const handleQuizCreated = (newQuiz: Quiz) => {
    setQuiz(newQuiz);
  };

  const handleReset = () => {
    setQuiz(null);
  };

  return (
    <main className="min-h-screen bg-slate-900">
      {quiz ? (
        <QuizTaker quiz={quiz} onReset={handleReset} />
      ) : (
        <QuizCreator onQuizCreated={handleQuizCreated} />
      )}
    </main>
  );
};

export default App;
