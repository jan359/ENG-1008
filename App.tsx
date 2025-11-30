import React, { useState, useEffect } from 'react';
import QuizConfigForm from './components/QuizConfigForm';
import QuizTaker from './components/QuizTaker';
import QuizResults from './components/QuizResults';
import { generateQuizQuestions, gradeQuestion } from './services/geminiService';
import { Question, QuizConfig, UserAnswer, UserProfile, QuestionType } from './types';

const INITIAL_PROFILE: UserProfile = {
  weakTopics: {},
  totalQuizzes: 0,
  averageScore: 0
};

const App: React.FC = () => {
  // State
  const [phase, setPhase] = useState<'config' | 'loading' | 'quiz' | 'grading' | 'results'>('config');
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<UserAnswer[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Load profile on mount
  useEffect(() => {
    const saved = localStorage.getItem('c_quiz_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  // Save profile on change
  useEffect(() => {
    localStorage.setItem('c_quiz_profile', JSON.stringify(profile));
  }, [profile]);

  const startQuiz = async (config: QuizConfig) => {
    setPhase('loading');
    setLoadingMessage('Consulting the AI Professor...');
    
    try {
      // Get weak topics for personalization
      const weakTopics = Object.entries(profile.weakTopics)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([t]) => t)
        .slice(0, 3);

      const questions = await generateQuizQuestions(config, weakTopics);
      setCurrentQuestions(questions);
      setPhase('quiz');
    } catch (e) {
      alert("Failed to generate quiz. Check API Key or try again.");
      setPhase('config');
    }
  };

  const handleQuizCompletion = async (answers: UserAnswer[]) => {
    setPhase('grading');
    setLoadingMessage('Grading your papers...');
    
    const gradedAnswers = await Promise.all(answers.map(async (ans) => {
      const question = currentQuestions.find(q => q.id === ans.questionId);
      if (!question) return ans;

      // MCQ already graded locally, just need model answer if not present
      if (ans.aiGraded) {
        return { 
          ...ans, 
          // Ensure model answer is present from question definition
          modelAnswer: question.modelAnswer 
        };
      }

      // AI Grading for text answers
      const result = await gradeQuestion(question, ans.answer as string);
      return {
        ...ans,
        score: result.score,
        feedback: result.feedback,
        modelAnswer: result.modelAnswer,
        aiGraded: true
      };
    }));

    setCurrentAnswers(gradedAnswers);
    updateProfile(gradedAnswers, currentQuestions);
    setPhase('results');
  };

  const updateProfile = (answers: UserAnswer[], questions: Question[]) => {
    const newWeakTopics = { ...profile.weakTopics };
    let quizTotalScore = 0;

    answers.forEach(ans => {
      const q = questions.find(q => q.id === ans.questionId);
      const score = ans.score || 0;
      quizTotalScore += score;

      if (score < 70 && q?.topic) {
        newWeakTopics[q.topic] = (newWeakTopics[q.topic] || 0) + 1;
      }
    });

    const quizAvg = quizTotalScore / questions.length;
    // Weighted moving average for total profile score
    const newAvg = profile.totalQuizzes === 0 
      ? quizAvg 
      : (profile.averageScore * profile.totalQuizzes + quizAvg) / (profile.totalQuizzes + 1);

    setProfile({
      weakTopics: newWeakTopics,
      totalQuizzes: profile.totalQuizzes + 1,
      averageScore: newAvg
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Gemini C-Master
            </h1>
          </div>
          <div className="text-sm font-medium text-gray-500">
            Avg Score: <span className="text-blue-600">{Math.round(profile.averageScore)}%</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {phase === 'config' && (
          <QuizConfigForm userProfile={profile} onStart={startQuiz} />
        )}

        {(phase === 'loading' || phase === 'grading') && (
          <div className="flex flex-col items-center justify-center h-64 animate-pulse">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-700">{loadingMessage}</h3>
            <p className="text-sm text-gray-500 mt-2">Processing lecture notes and logic...</p>
          </div>
        )}

        {phase === 'quiz' && (
          <QuizTaker questions={currentQuestions} onComplete={handleQuizCompletion} />
        )}

        {phase === 'results' && (
          <QuizResults 
            questions={currentQuestions} 
            answers={currentAnswers} 
            onRetry={() => setPhase('config')} 
          />
        )}
      </main>
    </div>
  );
};

export default App;