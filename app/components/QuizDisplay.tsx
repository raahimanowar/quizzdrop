'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import { QuizQuestion } from '../services/quizGeneration';

interface QuizDisplayProps {
  questions: QuizQuestion[];
  onRestart: () => void;
}

export default function QuizDisplay({ questions, onRestart }: QuizDisplayProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [copyFeedback, setCopyFeedback] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleOptionSelect = (optionIndex: number) => {
    if (!showExplanation) {
      setSelectedOption(optionIndex);
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = optionIndex;
      setUserAnswers(newAnswers);
      setShowExplanation(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(userAnswers[currentQuestionIndex - 1]);
      setShowExplanation(userAnswers[currentQuestionIndex - 1] !== null);
    }
  };

  const handleContinue = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(userAnswers[currentQuestionIndex + 1]);
      setShowExplanation(userAnswers[currentQuestionIndex + 1] !== null);
    } else {
      setShowResults(true);
    }
  };

  const getScore = () => {
    return userAnswers.reduce((score, answer, index) => {
      if (answer === questions[index].correctAnswer) {
        return (score || 0) + 1;
      }
      return score || 0;
    }, 0);
  };

  const getAccuracy = () => {
    const score = getScore() || 0;
    return Math.round((score / questions.length) * 100);
  };

  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setShowResults(false);
    setUserAnswers(new Array(questions.length).fill(null));
  };

  const handleShareQuiz = () => {
    const score = getScore();
    const accuracy = getAccuracy();
    const shareText = `🎯 I just scored ${score}/${questions.length} (${accuracy}%) on a QuizzDrop quiz! Try it yourself: ${window.location.origin}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'QuizzDrop Quiz Results',
        text: shareText,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      });
    }
  };

  if (showResults) {
    const score = getScore();
    const accuracy = getAccuracy();
    
    return (
      <div className="min-h-screen bg-white">
        <Navbar onLogoClick={onRestart} />

        <main className="flex flex-col items-center justify-center px-4 py-2 min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] overflow-hidden">
          <div className="max-w-lg w-full h-full flex flex-col justify-center space-y-3">
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">Quiz Complete! 🎉</h1>

              <div className="bg-purple-50 rounded-xl p-3 mb-3 border border-purple-100">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {score}/{questions.length}
                </div>
                <p className="text-base text-gray-700">
                  You answered {score} correctly out of {questions.length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">Stats</h2>
              <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                <div className="text-2xl font-bold text-purple-600">
                  Accuracy {accuracy}%
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={onRestart}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg text-xs"
              >
                New Quiz
              </button>
              
              <button
                onClick={handleRetryQuiz}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg text-xs"
              >
                Retry Quiz
              </button>
              
              <button
                onClick={handleShareQuiz}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg text-xs relative"
              >
                {copyFeedback ? 'Copied!' : 'Share Quiz'}
              </button>
            </div>

            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
              <p className="text-gray-700 text-sm">
                {accuracy >= 90 ? "🌟 Excellent work! You're a quiz master!" :
                 accuracy >= 70 ? "👍 Great job! You have a solid understanding!" :
                 accuracy >= 50 ? "📚 Good effort! Keep studying and you'll improve!" :
                 "💪 Don't give up! Practice makes perfect!"}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onLogoClick={onRestart} />

      <main className="flex flex-col px-4 py-2 min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] overflow-hidden">
        <div className="max-w-2xl w-full mx-auto flex flex-col h-full">
          <div className="text-center mb-2">
            <div className="text-sm text-purple-600 font-semibold mb-1">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
              <div 
                className="bg-purple-600 h-1 rounded-full progress-bar transition-all duration-500"
                ref={(el) => {
                  if (el) {
                    el.style.width = `${progressPercentage}%`;
                  }
                }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-3 mb-2 flex-1 overflow-hidden">
            <div className="mb-2">
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-2 mb-2 overflow-y-auto max-h-48">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full p-2 text-left rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                    showExplanation
                      ? index === currentQuestion.correctAnswer
                        ? 'bg-green-50 border-green-500 text-green-800'
                        : selectedOption === index && index !== currentQuestion.correctAnswer
                        ? 'bg-red-50 border-red-500 text-red-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                      : selectedOption === index
                      ? 'bg-purple-50 border-purple-500 text-purple-800'
                      : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-purple-50 hover:border-purple-300'
                  }`}
                  disabled={showExplanation}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-purple-600">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {showExplanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 animate-fadeIn">
                <h3 className="font-bold text-blue-800 mb-1 text-xs">Explanation:</h3>
                <p className="text-blue-700 leading-relaxed text-xs">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-2">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-xs ${
                currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg'
              }`}
            >
              Previous
            </button>

            <div className="text-center bg-purple-50 rounded-xl p-2 border border-purple-200">
              <div className="text-xs text-purple-600">Score</div>
              <div className="text-lg font-bold text-purple-600">
                {getScore()}/{questions.length}
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!showExplanation}
              className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-xs ${
                !showExplanation
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
              }`}
            >
              {currentQuestionIndex === questions.length - 1 ? 'View Results' : 'Continue'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
