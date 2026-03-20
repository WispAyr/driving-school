import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { BookOpen, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export default function TheoryTest() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);

  useEffect(() => { api.get('/admin/theory').then(q => setQuestions(q.filter(x => x.question))).catch(() => {}); }, []);

  const q = questions[current];
  const opts = q?.options ? JSON.parse(q.options) : [];

  const handleAnswer = (opt) => {
    if (showAnswer) return;
    setSelected(opt);
    setShowAnswer(true);
    setScore(s => ({ correct: s.correct + (opt === q.correct_answer ? 1 : 0), total: s.total + 1 }));
  };

  const next = () => {
    if (current >= questions.length - 1) { setFinished(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
    setShowAnswer(false);
  };

  const restart = () => { setCurrent(0); setSelected(null); setShowAnswer(false); setScore({ correct: 0, total: 0 }); setFinished(false); };

  if (questions.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Theory Test Practice</h1>
      <p className="text-gray-500">No questions available yet. Check back soon!</p>
    </div>
  );

  if (finished) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl p-8 shadow-sm border">
        <h2 className="text-2xl font-bold mb-4">Practice Complete!</h2>
        <p className="text-5xl font-extrabold text-blue-600 mb-2">{score.correct}/{score.total}</p>
        <p className="text-gray-500 mb-6">{Math.round(score.correct/score.total*100)}% correct</p>
        <button onClick={restart} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto"><RotateCcw className="w-5 h-5" /> Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Theory Practice</h1>
        <span className="text-sm text-gray-500">{current + 1} / {questions.length}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6"><div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(current+1)/questions.length*100}%` }}></div></div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full mb-3 inline-block">{q.category}</span>
        <h2 className="text-lg font-semibold mb-4">{q.question}</h2>
        <div className="space-y-3">
          {opts.map(opt => {
            let cls = 'border rounded-xl p-4 cursor-pointer transition text-left w-full ';
            if (showAnswer) {
              if (opt === q.correct_answer) cls += 'border-green-500 bg-green-50';
              else if (opt === selected) cls += 'border-red-500 bg-red-50';
              else cls += 'border-gray-200 opacity-50';
            } else {
              cls += 'border-gray-200 hover:border-blue-400 hover:bg-blue-50';
            }
            return (
              <button key={opt} onClick={() => handleAnswer(opt)} className={cls}>
                <span className="flex items-center gap-2">
                  {showAnswer && opt === q.correct_answer && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {showAnswer && opt === selected && opt !== q.correct_answer && <XCircle className="w-5 h-5 text-red-600" />}
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
        {showAnswer && q.explanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm text-blue-800">
            <p className="font-medium mb-1">Explanation:</p>
            <p>{q.explanation}</p>
          </div>
        )}
        {showAnswer && <button onClick={next} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium">{current >= questions.length - 1 ? 'See Results' : 'Next Question'}</button>}
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">Score: {score.correct}/{score.total}</div>
    </div>
  );
}
