
import React from 'react';
import { Question, UserAnswer, QuestionType } from '../types';

interface Props {
  questions: Question[];
  answers: UserAnswer[];
  onRetry: () => void;
}

const QuizResults: React.FC<Props> = ({ questions, answers, onRetry }) => {
  const totalScore = answers.reduce((acc, curr) => acc + (curr.score || 0), 0);
  // Average calculation considers all questions, essentially giving 0 for skipped ones
  const averageScore = Math.round(totalScore / questions.length);

  // Helper to find answer for a question
  const getAnswer = (qId: string) => answers.find(a => a.questionId === qId);

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
          <div className="text-6xl font-extrabold my-4">{averageScore}%</div>
          <p className="text-blue-100">Average Score across {questions.length} questions</p>
        </div>
        
        <div className="p-8">
          <div className="space-y-8">
            {questions.map((q, index) => {
              const ans = getAnswer(q.id);
              const isSkipped = !ans;
              const isMcq = q.type === QuestionType.MCQ;
              
              // Determine status
              const isCorrect = !isSkipped && ans?.score && ans.score >= 80;
              
              let colorClass = 'border-gray-200 bg-gray-50'; // Default/Skipped
              let icon = '⏭️'; // Skipped icon

              if (!isSkipped) {
                colorClass = isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
                icon = isCorrect ? '✅' : '❌';
              }

              return (
                <div key={q.id} className={`border rounded-xl p-6 ${colorClass}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <span className="text-2xl" title={isSkipped ? "Skipped" : isCorrect ? "Correct" : "Incorrect"}>{icon}</span>
                      <div className="flex-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{q.topic}</span>
                        <h4 className="text-lg font-bold text-gray-800 mt-1 whitespace-pre-wrap font-mono text-sm">{q.text}</h4>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      isSkipped 
                        ? 'bg-gray-200 text-gray-600' 
                        : isCorrect 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                    }`}>
                      {isSkipped ? 'Skipped' : `${ans?.score}/100`}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Your Answer</p>
                      <div className={`p-3 rounded-lg border border-gray-200 font-mono text-sm ${isSkipped ? 'text-gray-400 italic bg-gray-100' : 'text-gray-800 bg-white'}`}>
                        {isSkipped 
                          ? 'No answer submitted' 
                          : isMcq 
                            ? (q.options ? q.options[ans!.answer as number] : 'N/A') 
                            : ans!.answer}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Model Answer / AI Feedback</p>
                      <div className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200 text-sm">
                        {isMcq ? (
                          <>
                            <span className="font-bold text-green-700 block mb-2">
                              Correct: {q.options ? q.options[q.correctOptionIndex!] : ''}
                            </span>
                            <div className="bg-blue-50 p-2 rounded text-blue-800 text-xs border border-blue-100">
                              <span className="font-bold block mb-1">Explanation:</span>
                              {q.modelAnswer}
                            </div>
                          </>
                        ) : (
                          <>
                            {!isSkipped && ans?.feedback && (
                              <p className="mb-2 italic text-gray-600">"{ans.feedback}"</p>
                            )}
                            <div className="border-t pt-2 mt-2">
                              <span className="font-bold text-gray-600 block mb-1">Expected Output / Code:</span>
                              <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-2 rounded">
                                {(!isSkipped && ans?.modelAnswer) ? ans.modelAnswer : q.modelAnswer}
                              </pre>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onRetry}
          className="px-8 py-4 bg-gray-800 text-white font-bold rounded-full shadow-lg hover:bg-gray-900 transition transform hover:-translate-y-1"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default QuizResults;
