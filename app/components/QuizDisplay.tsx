'use client';

import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
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
        alert('Quiz results copied to clipboard!');
      });
    }
  };

  if (showResults) {
    const score = getScore();
    const accuracy = getAccuracy();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-purple-200">
        <nav className="w-full bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
            <div className="text-gray-900 px-4 py-2 cursor-pointer" onClick={onRestart}>
              <span className="text-lg font-bold">QuizzDrop</span>
            </div>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              title="View on GitHub"
              className="text-white p-2"
            >
              <FaGithub className="w-5 h-5" />
            </a>
          </div>
        </nav>

        <main className="flex flex-col items-center justify-center px-4 py-8 min-h-[calc(100vh-60px)]">
          <div className="max-w-2xl w-full text-center space-y-8">
            
            <div className="bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 shadow-xl p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">Quiz Complete! 🎉</h1>
              
              <div className="bg-white/40 rounded-2xl p-6 mb-6">
                <div className="text-6xl font-bold text-purple-600 mb-2">
                  {score}/{questions.length}
                </div>
                <p className="text-xl text-gray-700">
                  You answered {score} correctly out of {questions.length}
                </p>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Stats</h2>
              <div className="bg-white/40 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-600">
                  Accuracy {accuracy}%
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onRestart}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg transform hover:-translate-y-1 hover:shadow-xl"
              >
                New Quiz
              </button>
              
              <button
                onClick={handleRetryQuiz}
                className="px-8 py-3 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg transform hover:-translate-y-1 hover:shadow-xl"
              >
                Retry Quiz
              </button>
              
              <button
                onClick={handleShareQuiz}
                className="px-8 py-3 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg transform hover:-translate-y-1 hover:shadow-xl"
              >
                Share Quiz
              </button>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-gray-700 italic">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-purple-200">
      <nav className="w-full bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-gray-900 px-6 py-3 cursor-pointer" onClick={onRestart}>
            <span className="text-xl font-bold">QuizzDrop</span>
          </div>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            title="View on GitHub"
            className="text-white p-3"
          >
            <FaGithub className="w-6 h-6" />
          </a>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center px-6 py-16 min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <div className="text-sm text-purple-600 font-medium mb-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className="w-full bg-white/30 rounded-full h-2 mb-4">
              <div 
                className="bg-purple-500 h-2 rounded-full progress-bar"
                ref={(el) => {
                  if (el) {
                    el.style.width = `${progressPercentage}%`;
                  }
                }}
              ></div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 shadow-xl p-8 mb-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
                Question: {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 font-medium ${
                    showExplanation
                      ? index === currentQuestion.correctAnswer
                        ? 'bg-green-100 border-green-400 text-green-800'
                        : selectedOption === index && index !== currentQuestion.correctAnswer
                        ? 'bg-red-100 border-red-400 text-red-800'
                        : 'bg-white/50 border-gray-200 text-gray-700'
                      : selectedOption === index
                      ? 'bg-purple-100 border-purple-400 text-purple-800'
                      : 'bg-white/50 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300'
                  }`}
                  disabled={showExplanation}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {showExplanation && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-6 animate-fadeIn">
                <h3 className="font-bold text-blue-900 mb-2">Explanation:</h3>
                <p className="text-blue-800 leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 hover:shadow-lg transform hover:-translate-y-1'
              }`}
            >
              Previous
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Score</div>
              <div className="text-2xl font-bold text-purple-600">
                {getScore()}/{questions.length}
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!showExplanation}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                !showExplanation
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg transform hover:-translate-y-1'
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
