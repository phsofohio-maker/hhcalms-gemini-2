import React, { useState } from 'react';
import { Course, Module, QuizBlockData, Enrollment } from '../types';
import { BlockRenderer } from '../components/player/BlockRenderer';
import { auditService } from '../services/auditService';
import { Button } from '../components/ui/Button';
import { ArrowLeft, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface CoursePlayerProps {
  course: Course;
  userUid: string;
  onComplete: (score: number, answers?: Record<string, any[]>, needsReview?: boolean) => void;
  onBack: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, userUid, onComplete, onBack }) => {
  const activeModule = course.modules[0]; 
  const [answers, setAnswers] = useState<Record<string, any[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [grade, setGrade] = useState<{ score: number; passed: boolean; needsReview: boolean } | null>(null);

  const handleQuizAnswer = (blockId: string, questionIndex: number, answer: any) => {
    if (isSubmitted) return;
    setAnswers(prev => {
      const blockAnswers = prev[blockId] ? [...prev[blockId]] : [];
      blockAnswers[questionIndex] = answer;
      return { ...prev, [blockId]: blockAnswers };
    });
  };

  const calculateGrade = () => {
    let totalPoints = 0;
    let earnedPoints = 0;
    let hasQuiz = false;
    let needsReview = false;

    activeModule.blocks.forEach(block => {
      if (block.type === 'quiz') {
        hasQuiz = true;
        const quiz = block.data as QuizBlockData;
        const blockAnswers = answers[block.id] || [];
        
        quiz.questions.forEach((q, idx) => {
          totalPoints += 1;
          const userAns = blockAnswers[idx];

          if (q.type === 'multiple-choice' || q.type === 'true-false') {
            if (userAns === q.correctAnswer) earnedPoints += 1;
          } else if (q.type === 'fill-blank') {
            if (userAns?.toString().toLowerCase().trim() === q.correctAnswer.toString().toLowerCase().trim()) {
              earnedPoints += 1;
            }
          } else if (q.type === 'matching') {
            const correctPairs = q.matchingPairs || [];
            const userPairs = userAns as string[] || [];
            const isMatch = correctPairs.every((pair, pIdx) => pair.right === userPairs[pIdx]);
            if (isMatch && userPairs.length === correctPairs.length) earnedPoints += 1;
          } else if (q.type === 'short-answer') {
            needsReview = true;
            if (userAns && userAns.length >= 20) {
              earnedPoints += 1;
            }
          }
        });
      }
    });

    if (!hasQuiz) return { score: 100, passed: true, needsReview: false };
    const score = Math.round((earnedPoints / totalPoints) * 100);
    return { score, passed: score >= activeModule.passingScore, needsReview };
  };

  const handleSubmit = () => {
    const result = calculateGrade();
    setGrade(result);
    setIsSubmitted(true);

    if (result.passed || result.needsReview) {
      onComplete(result.score, answers, result.needsReview);
      auditService.logAction(userUid, 'Staff', 'GRADE_ENTRY', activeModule.id, result.needsReview ? `Submitted "${course.title}" for review` : `Passed "${course.title}" with ${result.score}%`);
    }
  };

  const canSubmit = activeModule.blocks.every(block => {
    if (block.type !== 'quiz') return true;
    const quiz = block.data as QuizBlockData;
    const blockAnswers = answers[block.id] || [];
    return quiz.questions.every((q, idx) => {
      const ans = blockAnswers[idx];
      if (q.type === 'matching') {
        return (ans as string[])?.every(v => !!v) && (ans as string[])?.length === q.matchingPairs?.length;
      }
      if (q.type === 'short-answer') {
        return ans && ans.length >= 20; 
      }
      return ans !== undefined && ans !== '';
    });
  });

  if (grade?.needsReview) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-10 text-center border border-slate-200">
          <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Submitted for Review</h2>
          <p className="text-slate-500 mb-2 leading-relaxed">
            Your clinical reflections have been logged. An instructor will verify your competency and issue credit shortly.
          </p>
          <div className="text-sm font-bold text-amber-600 mb-8 bg-amber-50 inline-block px-3 py-1 rounded">Status: Pending Verification</div>
          <Button onClick={onBack} className="w-full h-12">Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (grade?.passed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-10 text-center border border-slate-200">
          <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Module Verified</h2>
          <p className="text-slate-500 mb-2 leading-relaxed">You have completed <strong>{course.title}</strong>.</p>
          <div className="text-sm font-bold text-green-600 mb-8 bg-green-50 inline-block px-3 py-1 rounded">Score: {grade.score}%</div>
          <Button onClick={onBack} className="w-full h-12">Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft className="h-5 w-5" /></button>
           <div>
             <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{course.title}</h1>
             <p className="text-sm font-bold text-slate-900">{activeModule.title}</p>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-3xl mx-auto py-12 px-6">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-16 min-h-[80vh]">
              {grade && !grade.passed && !grade.needsReview && (
                  <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
                      <AlertCircle className="h-5 w-5" />
                      <div className="flex-1">
                          <p className="font-bold text-sm">Attempt Failed ({grade.score}%)</p>
                          <p className="text-xs opacity-80">Required: {activeModule.passingScore}%</p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-700" onClick={() => { setIsSubmitted(false); setGrade(null); }}>Retry Assessment</Button>
                  </div>
              )}

              {activeModule.blocks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic">This module contains no content.</div>
              ) : (
                activeModule.blocks.map(block => (
                  <BlockRenderer key={block.id} block={block} onQuizAnswer={handleQuizAnswer} answers={answers} />
                ))
              )}

              <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col items-center gap-6">
                 <Button size="lg" className="w-full md:w-auto px-16 h-14 text-lg" onClick={handleSubmit} disabled={!canSubmit || isSubmitted || activeModule.blocks.length === 0}>
                   {isSubmitted ? 'Verifying...' : 'Submit Module'}
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};