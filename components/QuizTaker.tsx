
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Quiz, Question } from '../types';
import { ArrowPathIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, TrophyIcon, XCircleIcon } from './icons';

interface QuizTakerProps {
  quiz: Quiz;
  onReset: () => void;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, onReset }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'FINISHED'>('START');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [time, setTime] = useState(0);

  useEffect(() => {
    let timer: number | null = null;
    if (gameState === 'PLAYING') {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  const score = useMemo(() => {
    return quiz.questions.reduce((acc, question, index) => {
      return acc + (userAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
  }, [quiz.questions, userAnswers]);

  const handleSelectAnswer = (questionIndex: number, answer: string) => {
    if (userAnswers.hasOwnProperty(questionIndex)) return; // Prevent changing answer
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinishQuiz = () => {
    setGameState('FINISHED');
  };
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  if (gameState === 'START') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-900">
        <div className="text-center w-full max-w-2xl bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">{quiz.title}</h1>
          <p className="text-slate-400 mb-6 text-sm md:text-base">{`Ready to test your knowledge? There are ${quiz.questions.length} questions.`}</p>
          <button
            onClick={() => setGameState('PLAYING')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 text-base md:text-lg transform hover:scale-105"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'FINISHED') {
    const scoreColor = score / quiz.questions.length >= 0.7 ? 'text-green-400' : score / quiz.questions.length >= 0.4 ? 'text-yellow-400' : 'text-red-400';
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-900">
        <div className="w-full max-w-3xl bg-slate-800 p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-700 shadow-2xl">
          <div className="text-center">
            <TrophyIcon className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Quiz Completed!</h1>
            <p className="text-slate-400 mt-2">Here's how you did:</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-10 my-6 text-xl sm:text-2xl font-semibold">
              <div className="flex flex-col items-center">
                <span className={`block text-3xl sm:text-4xl ${scoreColor}`}>{score} / {quiz.questions.length}</span>
                <span className="text-slate-400 text-sm mt-1">SCORE</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="block text-3xl sm:text-4xl text-indigo-400">{formatTime(time)}</span>
                <span className="text-slate-400 text-sm mt-1">TIME</span>
              </div>
            </div>
          </div>
          <div className="mt-8 max-h-80 overflow-y-auto space-y-4 pr-2">
            {quiz.questions.map((q, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div key={index} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  <p className="font-semibold text-white">{index + 1}. {q.questionText}</p>
                  <p className={`mt-2 flex items-center text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <XCircleIcon className="w-5 h-5 mr-2" />}
                    Your answer: {userAnswer || "Not answered"}
                  </p>
                  {!isCorrect && (
                    <p className="mt-1 flex items-center text-sm text-cyan-400">
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Correct answer: {q.correctAnswer}
                    </p>
                  )}
                  <div className="mt-3 pt-3 border-t border-slate-600/50 text-slate-400 text-sm">
                    <p><span className="font-semibold text-slate-300">Explanation:</span> {q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={onReset}
            className="w-full mt-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Create a New Quiz
          </button>
        </div>
      </div>
    );
  }

  const isCurrentQuestionAnswered = userAnswers.hasOwnProperty(currentQuestionIndex);
  const userAnswerForCurrentQuestion = userAnswers[currentQuestionIndex];
  const wasCorrect = userAnswerForCurrentQuestion === currentQuestion.correctAnswer;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-900">
        <div className="w-full max-w-3xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 md:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-indigo-400">{quiz.title}</h2>
                    <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-full text-base md:text-lg font-semibold text-white">
                        <ClockIcon className="w-6 h-6 text-slate-400" />
                        <span>{formatTime(time)}</span>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-slate-400 mb-1">
                        <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>

                <div className="min-h-[100px] mb-6">
                    <p className="text-lg md:text-xl font-medium text-white">{currentQuestion.questionText}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = userAnswerForCurrentQuestion === option;
                        const isCorrectAnswer = currentQuestion.correctAnswer === option;
                        
                        let buttonClasses = 'w-full text-left p-3 md:p-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm md:text-base';

                        if (isCurrentQuestionAnswered) {
                            if (isCorrectAnswer) {
                                buttonClasses += ' bg-green-500/20 border-green-500 text-white cursor-not-allowed';
                            } else if (isSelected && !isCorrectAnswer) {
                                buttonClasses += ' bg-red-500/20 border-red-500 text-white cursor-not-allowed';
                            } else {
                                buttonClasses += ' bg-slate-700 border-slate-600 text-slate-400 opacity-70 cursor-not-allowed';
                            }
                        } else {
                             buttonClasses += ' bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-indigo-500 text-slate-300';
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleSelectAnswer(currentQuestionIndex, option)}
                                disabled={isCurrentQuestionAnswered}
                                className={buttonClasses}
                                aria-label={`Answer option ${index + 1}: ${option}`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>

                {isCurrentQuestionAnswered && (
                    <div className="mt-6 p-4 rounded-lg bg-slate-700/50">
                        <div className="text-center">
                            {wasCorrect ? (
                                <div className="flex items-center justify-center gap-2 text-green-400">
                                    <CheckCircleIcon className="w-6 h-6" />
                                    <span className="text-lg font-semibold">Correct!</span>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-center gap-2 text-red-400">
                                        <XCircleIcon className="w-6 h-6" />
                                        <span className="text-lg font-semibold">Incorrect!</span>
                                    </div>
                                    <p className="text-slate-300 mt-2">The correct answer is: <strong className="text-white">{currentQuestion.correctAnswer}</strong></p>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-600 text-left">
                            <p className="text-slate-300">{currentQuestion.explanation}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-slate-800/50 border-t border-slate-700 p-4 flex justify-between items-center">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                    Previous
                </button>

                {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <button
                        onClick={handleFinishQuiz}
                        disabled={!isCurrentQuestionAnswered}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Finish Quiz
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={!isCurrentQuestionAnswered || currentQuestionIndex === quiz.questions.length - 1}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                    >
                        Next
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default QuizTaker;
