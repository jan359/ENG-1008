
import React, { useState } from 'react';
import { Question, QuestionType, UserAnswer } from '../types';

interface Props {
  questions: Question[];
  onComplete: (answers: UserAnswer[]) => void;
}

const QuizTaker: React.FC<Props> = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [currentInput, setCurrentInput] = useState<string | number>('');

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const saveCurrentAnswer = () => {
    // Only save if there is actually input, or if it's an MCQ with selection 0 (which is falsy)
    if (currentInput === '' || currentInput === null) return null;

    return {
      questionId: currentQuestion.id,
      answer: currentInput,
      score: currentQuestion.type === QuestionType.MCQ 
        ? (currentInput === currentQuestion.correctOptionIndex ? 100 : 0)
        : undefined,
      aiGraded: currentQuestion.type === QuestionType.MCQ
    } as UserAnswer;
  };

  const handleNext = () => {
    const newAnswer = saveCurrentAnswer();
    const newAnswers = newAnswer ? [...answers, newAnswer] : answers;
    
    setAnswers(newAnswers);
    setCurrentInput('');

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleStopEarly = () => {
    if (confirm("Are you sure you want to stop? Unanswered questions will be marked as skipped.")) {
      // Don't save the current input if they are stopping, just submit what's already done
      onComplete(answers);
    }
  };

  const isAnswerEmpty = currentInput === '' || currentInput === null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 min-h-[400px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            {currentQuestion.type.replace('_', ' ')} • {currentQuestion.topic}
          </span>
          <span className="text-gray-400 text-sm">Question {currentIndex + 1} of {questions.length}</span>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed whitespace-pre-wrap font-mono text-sm">
          {currentQuestion.text}
        </h3>

        <div className="flex-grow">
          {currentQuestion.type === QuestionType.MCQ && currentQuestion.options ? (
            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentInput(idx)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    currentInput === idx 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px] text-gray-700 resize-none font-mono"
              placeholder="Type your code/answer here..."
              value={currentInput as string}
              onChange={(e) => setCurrentInput(e.target.value)}
            />
          )}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <button 
            onClick={handleStopEarly}
            className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
          >
            Stop & Show Answers
          </button>

          <button
            onClick={handleNext}
            disabled={isAnswerEmpty}
            className={`px-8 py-3 rounded-lg font-bold shadow-md transition-all ${
              isAnswerEmpty
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;
