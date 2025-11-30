
import React, { useState } from 'react';
import { QuizConfig, UserProfile } from '../types';
import { AVAILABLE_TOPICS } from '../constants';

interface Props {
  userProfile: UserProfile;
  onStart: (config: QuizConfig) => void;
}

const QuizConfigForm: React.FC<Props> = ({ userProfile, onStart }) => {
  const [mcqCount, setMcqCount] = useState(3);
  const [shortCount, setShortCount] = useState(2);
  const [longCount, setLongCount] = useState(1);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [usePersonalization, setUsePersonalization] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const getWeakTopics = () => {
    return Object.entries(userProfile.weakTopics)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([topic]) => topic);
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleStart = () => {
    const focusTopics = usePersonalization ? getWeakTopics() : [];
    onStart({
      mcqCount,
      shortCount,
      longCount,
      difficulty,
      focusTopics,
      selectedTopics
    });
  };

  const weakList = getWeakTopics();

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Configure Your Quiz</h2>
        <p className="text-gray-500">Customize the AI generation based on your needs.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">MCQs</label>
            <input 
              type="number" 
              min="0" max="20"
              value={mcqCount}
              onChange={(e) => setMcqCount(parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Answer</label>
            <input 
              type="number" 
              min="0" max="10"
              value={shortCount}
              onChange={(e) => setShortCount(parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Long Answer</label>
            <input 
              type="number" 
              min="0" max="5"
              value={longCount}
              onChange={(e) => setLongCount(parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <div className="flex gap-4">
            {(['easy', 'medium', 'hard'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficulty(lvl)}
                className={`flex-1 py-3 rounded-lg capitalize font-medium transition-all ${
                  difficulty === lvl 
                    ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Topic Focus</label>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => handleTopicToggle(topic)}
                className={`text-left px-4 py-2 rounded-lg text-sm border transition-all ${
                  selectedTopics.includes(topic)
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {selectedTopics.includes(topic) ? '✓ ' : ''}{topic}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Select topics to ensure they appear in the quiz.</p>
        </div>

        {weakList.length > 0 && (
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-orange-500 text-xl">⚡</span>
                <h3 className="font-semibold text-gray-800">Smart Personalization</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={usePersonalization} 
                  onChange={(e) => setUsePersonalization(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Auto-include questions from your weak areas:
            </p>
            <div className="flex flex-wrap gap-2">
              {weakList.map(topic => (
                <span key={topic} className="px-2 py-1 bg-white text-orange-600 text-xs font-bold rounded border border-orange-200 shadow-sm">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transform transition hover:-translate-y-0.5 active:translate-y-0"
        >
          Generate AI Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizConfigForm;
