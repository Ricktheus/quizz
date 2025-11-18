
import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import type { Quiz } from '../types';
import { SparklesIcon } from './icons';

interface QuizCreatorProps {
  onQuizCreated: (quiz: Quiz) => void;
}

const QuizCreator: React.FC<QuizCreatorProps> = ({ onQuizCreated }) => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const quizData = await generateQuiz(topic, numQuestions);
      onQuizCreated(quizData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-900 text-white">
      <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-700">
        <div className="text-center mb-8">
            <SparklesIcon className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Gemini Quiz Generator</h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base">Enter any topic and let AI create a quiz for you!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">
              Quiz Topic
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Roman History, React.js Hooks"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="numQuestions" className="block text-sm font-medium text-slate-300 mb-2">
              Number of Questions: <span className="font-bold text-indigo-400">{numQuestions}</span>
            </label>
            <input
              type="range"
              id="numQuestions"
              min="3"
              max="25"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Quiz...
              </>
            ) : (
                <>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Generate Quiz
                </>
            )}
          </button>
        </form>
        
        {error && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
                <p><strong>Oops! Something went wrong.</strong></p>
                <p className="text-sm">{error}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default QuizCreator;