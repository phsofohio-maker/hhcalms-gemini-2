import React from 'react';
import { Course, Enrollment } from '../types';
import { Clock, BookOpen, Award, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface CourseCatalogProps {
  courses: Course[];
  enrollments: Enrollment[];
  onEnroll: (courseId: string) => void;
  onNavigate: (path: string, id?: string) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ courses, enrollments, onEnroll, onNavigate }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Training Library</h1>
        <p className="text-slate-500 mt-1">Select a module to begin your required training.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const isEnrolled = enrollments.some(e => e.courseId === course.id);
          const isCompleted = enrollments.some(e => e.courseId === course.id && e.status === 'completed');

          return (
            <div key={course.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
              <div className="h-40 bg-slate-100 relative overflow-hidden">
                <img 
                  src={course.thumbnailUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                      {course.category}
                    </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-900 mb-2 leading-tight">{course.title}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{course.description}</p>
                
                <div className="space-y-3 mt-auto">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{course.modules.reduce((acc, m) => acc + m.estimatedMinutes, 0)}m</span>
                      </div>
                      <div className="flex items-center gap-1 text-brand-600">
                          <Award className="h-3 w-3" />
                          <span>{course.ceCredits.toFixed(1)} CEU</span>
                      </div>
                    </div>
                    
                    {isCompleted ? (
                      <div className="w-full flex items-center justify-center gap-2 py-2 bg-green-50 text-green-700 text-sm font-bold rounded border border-green-100">
                        <CheckCircle className="h-4 w-4" />
                        Training Completed
                      </div>
                    ) : (
                      <Button 
                        className="w-full justify-between group-hover:bg-brand-700" 
                        onClick={() => {
                          if (!isEnrolled) onEnroll(course.id);
                          onNavigate('/player', course.id);
                        }}
                      >
                        {isEnrolled ? 'Resume Module' : 'Begin Training'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};