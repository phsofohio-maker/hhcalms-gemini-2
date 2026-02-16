import React, { useState } from 'react';
import { Enrollment, Course, User, QuizBlockData } from '../types';
import { ClipboardCheck, Search, Filter, CheckCircle, Clock, AlertCircle, Eye, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MOCK_USERS } from '../services/mockData';
import { formatDate } from '../utils';

interface GradeManagementProps {
  enrollments: Enrollment[];
  courses: Course[];
  onReviewSubmission: (enrollmentId: string, score: number) => void;
}

export const GradeManagement: React.FC<GradeManagementProps> = ({ enrollments, courses, onReviewSubmission }) => {
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'completed'>('needs_review');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const pendingSubmissions = enrollments.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  const getCourseTitle = (id: string) => courses.find(c => c.id === id)?.title || 'Unknown Course';
  const getUserName = (id: string) => MOCK_USERS.find(u => u.uid === id)?.displayName || 'Unknown Staff';

  const renderReviewModal = (enrollment: Enrollment) => {
    const course = courses.find(c => c.id === enrollment.courseId);
    if (!course) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Review Submission</h2>
              <p className="text-sm text-slate-500">{getUserName(enrollment.userId)} • {course.title}</p>
            </div>
            <Button variant="ghost" onClick={() => setReviewingId(null)}>Close</Button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            <div className="space-y-8 max-w-3xl mx-auto">
              {course.modules[0].blocks.filter(b => b.type === 'quiz').map(block => {
                const quiz = block.data as QuizBlockData;
                const userAns = enrollment.quizAnswers?.[block.id] || [];

                return (
                  <div key={block.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-700">
                      {quiz.title}
                    </div>
                    <div className="p-6 space-y-6">
                      {quiz.questions.map((q, qIdx) => {
                        const ans = userAns[qIdx];
                        const isEssay = q.type === 'short-answer';
                        
                        return (
                          <div key={qIdx} className="space-y-2 pb-6 border-b border-slate-100 last:border-0">
                            <div className="flex justify-between items-start">
                              <p className="font-semibold text-slate-900 text-sm">{qIdx + 1}. {q.question}</p>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{q.type}</span>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                               <p className="text-xs font-bold text-slate-400 uppercase mb-2">Student Response</p>
                               <p className="text-sm text-slate-700 italic">"{ans || '(No answer provided)'}"</p>
                            </div>

                            {isEssay && (
                               <div className="bg-brand-50 p-4 rounded-lg border border-brand-100 mt-2">
                                  <p className="text-[10px] font-bold text-brand-600 uppercase mb-2">Instructor Guidelines / Exemplar</p>
                                  <p className="text-xs text-brand-900">{q.correctAnswer}</p>
                               </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3">
             <Button variant="outline" onClick={() => setReviewingId(null)}>Cancel</Button>
             <Button className="gap-2" onClick={() => {
                onReviewSubmission(enrollment.id, 100);
                setReviewingId(null);
             }}>
               <Check className="h-4 w-4" />
               Approve Submission
             </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {reviewingId && renderReviewModal(enrollments.find(e => e.id === reviewingId)!)}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-brand-600" />
            Grade Management Center
          </h1>
          <p className="text-slate-500 mt-1">Review clinical assessments and verify staff competencies.</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-lg p-1">
           <button 
             onClick={() => setFilter('needs_review')}
             className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", filter === 'needs_review' ? "bg-brand-600 text-white" : "text-slate-500 hover:text-brand-600")}
           >
             Needs Review
           </button>
           <button 
             onClick={() => setFilter('completed')}
             className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", filter === 'completed' ? "bg-brand-600 text-white" : "text-slate-500 hover:text-brand-600")}
           >
             Verified
           </button>
           <button 
             onClick={() => setFilter('all')}
             className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", filter === 'all' ? "bg-brand-600 text-white" : "text-slate-500 hover:text-brand-600")}
           >
             All
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Staff Member</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Course</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Submitted At</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pendingSubmissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No submissions found matching the criteria.</td>
              </tr>
            ) : (
              pendingSubmissions.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/50 group">
                  <td className="px-6 py-4">
                     <div className="font-bold text-slate-900">{getUserName(e.userId)}</div>
                     <div className="text-xs text-slate-400">ID: {e.userId}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{getCourseTitle(e.courseId)}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{formatDate(e.lastAccessedAt)}</td>
                  <td className="px-6 py-4">
                    {e.status === 'needs_review' ? (
                       <span className="flex items-center gap-1.5 text-amber-600 font-bold text-xs uppercase tracking-tight bg-amber-50 px-2 py-1 rounded border border-amber-100">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Needs Review
                       </span>
                    ) : (
                       <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs uppercase tracking-tight bg-green-50 px-2 py-1 rounded border border-green-100">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Verified
                       </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <Button 
                       variant={e.status === 'needs_review' ? 'primary' : 'outline'} 
                       size="sm" 
                       className="gap-1.5"
                       onClick={() => setReviewingId(e.id)}
                     >
                       <Eye className="h-3.5 w-3.5" />
                       Review
                     </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}