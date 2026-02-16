import React from 'react';
import { User, Course, Enrollment } from '../types';
import { Clock, AlertTriangle, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../utils';

interface DashboardProps {
  user: User;
  courses: Course[];
  enrollments: Enrollment[];
  onNavigate: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, courses, enrollments, onNavigate }) => {
  const activeEnrollments = enrollments.filter(e => e.status !== 'completed');
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.displayName}</h1>
        <p className="text-slate-500 mt-2">Personal Training & Compliance Portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">Active Courses</p>
                <p className="text-2xl font-bold text-slate-900">{activeEnrollments.length}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <Award className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">CE Units Earned</p>
                <p className="text-2xl font-bold text-slate-900">{user.role === 'admin' ? 24.0 : 12.5}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">Compliance Alerts</p>
                <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
        </div>
      </div>

      <div className="space-y-10">
        {/* In Progress */}
        <section>
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-brand-500 rounded-full" />
                Current Training
              </h2>
          </div>

          {activeEnrollments.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl py-12 text-center">
              <p className="text-slate-400">No active training. Browse the catalog to begin.</p>
              <Button variant="ghost" className="mt-2" onClick={() => onNavigate('/courses')}>Open Catalog</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeEnrollments.map(enrollment => {
                    const course = courses.find(c => c.id === enrollment.courseId);
                    if (!course) return null;
                    return (
                        <div key={enrollment.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                  <h3 className="font-bold text-slate-900 leading-tight">{course.title}</h3>
                                  <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded uppercase tracking-tighter">
                                    {enrollment.progress}%
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
                                  <div className="h-full bg-brand-500" style={{ width: `${enrollment.progress}%` }} />
                                </div>
                                <Button className="w-full" size="sm" onClick={() => onNavigate('/player')}>
                                    Resume Module
                                    <ArrowRight className="h-3 w-3 ml-2" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
          )}
        </section>

        {/* Completed */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-green-500 rounded-full" />
            Recently Completed
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
             {completedEnrollments.length === 0 ? (
               <div className="p-8 text-center text-slate-400 text-sm">Completed certificates will appear here.</div>
             ) : (
               completedEnrollments.map(enrollment => {
                 const course = courses.find(c => c.id === enrollment.courseId);
                 return (
                   <div key={enrollment.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="bg-green-100 p-2 rounded-full">
                           <CheckCircle2 className="h-5 w-5 text-green-600" />
                         </div>
                         <div>
                            <p className="font-bold text-slate-900 text-sm">{course?.title}</p>
                            <p className="text-xs text-slate-500">Earned {course?.ceCredits} CE Credits</p>
                         </div>
                      </div>
                      <Button variant="ghost" size="sm">Download PDF</Button>
                   </div>
                 );
               })
             )}
          </div>
        </section>
      </div>
    </div>
  );
};