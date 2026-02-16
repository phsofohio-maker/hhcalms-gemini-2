import React, { useState } from 'react';
import { User, UserRoleType, Course, Enrollment, Module } from './types';
import { MOCK_USERS, MOCK_COURSES } from './services/mockData';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ModuleBuilder } from './pages/ModuleBuilder';
import { AuditLogs } from './pages/AuditLogs';
import { UserManagement } from './pages/UserManagement';
import { CourseCatalog } from './pages/CourseCatalog';
import { CoursePlayer } from './pages/CoursePlayer';
import { CourseManager } from './pages/CourseManager';
import { MyGrades } from './pages/MyGrades';
import { GradeManagement } from './pages/GradeManagement';
import { Invitations } from './pages/Invitations';
import { auditService } from './services/auditService';
import { Lock } from 'lucide-react';
import { Button } from './components/ui/Button';
import { generateId } from './utils';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPath, setCurrentPath] = useState('/');
  
  // App State
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES.map(c => ({ ...c, status: 'published' })));
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  
  // Selection State
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  const handleLogin = (role: UserRoleType) => {
    const mockUser = MOCK_USERS.find(u => u.role === role);
    if (mockUser) {
      setUser(mockUser);
      auditService.logAction(mockUser.uid, mockUser.displayName, 'USER_LOGIN', 'system', `Logged in as ${role}`);
    }
  };

  const handleEnroll = (courseId: string, userId?: string) => {
    const targetUser = userId ? MOCK_USERS.find(u => u.uid === userId) : user;
    if (!targetUser) return;
    if (enrollments.some(e => e.courseId === courseId && e.userId === targetUser.uid)) return;

    const newEnrollment: Enrollment = {
      id: generateId(),
      userId: targetUser.uid,
      courseId,
      progress: 0,
      status: 'in_progress',
      enrolledAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    };
    setEnrollments(prev => [...prev, newEnrollment]);
    auditService.logAction(targetUser.uid, targetUser.displayName, 'ENROLLMENT', courseId, userId ? `Admin enrolled ${targetUser.displayName}` : 'Staff self-enrolled');
  };

  const handleCompleteModule = (courseId: string, score: number, answers?: Record<string, any[]>, needsReview?: boolean) => {
    if (!user) return;
    setEnrollments(prev => prev.map(e => {
      if (e.courseId === courseId && e.userId === user.uid) {
        return { 
            ...e, 
            status: needsReview ? 'needs_review' : 'completed', 
            progress: 100, 
            score, 
            quizAnswers: answers,
            lastAccessedAt: new Date().toISOString() 
        };
      }
      return e;
    }));
  };

  const handleManualReview = (enrollmentId: string, score: number) => {
    if (!user) return;
    setEnrollments(prev => prev.map(e => {
      if (e.id === enrollmentId) {
        auditService.logAction(user.uid, user.displayName, 'MANUAL_GRADE', e.courseId, `Admin approved submission for enrollment ${enrollmentId}`);
        return { ...e, status: 'completed', score, lastAccessedAt: new Date().toISOString() };
      }
      return e;
    }));
  };

  const handleSaveCourseCurriculum = (updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const handleCreateNewCourse = () => {
    const newCourse: Course = {
      id: generateId(),
      title: 'New Clinical Course',
      description: 'Enter description here...',
      category: 'clinical_skills',
      ceCredits: 1.0,
      thumbnailUrl: `https://picsum.photos/400/200?random=${Math.random()}`,
      status: 'draft',
      modules: [{
        id: generateId(),
        courseId: 'temp',
        title: 'Module 1: Getting Started',
        description: '',
        status: 'draft',
        passingScore: 80,
        estimatedMinutes: 10,
        blocks: []
      }]
    };
    newCourse.modules[0].courseId = newCourse.id;
    setCourses(prev => [newCourse, ...prev]);
    setEditingCourseId(newCourse.id);
    setEditingModuleId(newCourse.modules[0].id);
    setCurrentPath('/builder');
  };

  const handleTogglePublish = (id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'published' ? 'draft' : 'published' } : c));
  };

  const renderContent = () => {
    if (!user) {
      return (
        <div className="min-h-screen bg-brand-900 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-slate-50 p-10 text-center">
                    <div className="h-16 w-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8 text-brand-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Harmony Health LMS</h1>
                    <p className="text-slate-500 mt-2 text-sm">Secure Portal Login</p>
                </div>
                <div className="p-8 space-y-4">
                    <Button onClick={() => handleLogin('admin')} className="w-full h-12">Administrator Login</Button>
                    <Button onClick={() => handleLogin('staff')} variant="outline" className="w-full h-12">Staff Access</Button>
                </div>
            </div>
        </div>
      );
    }

    if (currentPath === '/player' && activeCourseId) {
       const activeCourse = courses.find(c => c.id === activeCourseId);
       return (
         <CoursePlayer 
            course={activeCourse!}
            userUid={user.uid} 
            onComplete={(score, answers, needsReview) => handleCompleteModule(activeCourseId, score, answers, needsReview)}
            onBack={() => setCurrentPath('/courses')} 
         />
       );
    }

    if (currentPath === '/builder' && editingCourseId && editingModuleId) {
      const editingCourse = courses.find(c => c.id === editingCourseId);
      return (
        <ModuleBuilder 
          course={editingCourse!}
          moduleId={editingModuleId}
          userUid={user.uid}
          onSave={handleSaveCourseCurriculum}
          onBack={() => setCurrentPath('/curriculum')}
        />
      );
    }

    const Router = () => {
      switch (currentPath) {
        case '/':
          return <Dashboard user={user} courses={courses} enrollments={enrollments} onNavigate={setCurrentPath} />;
        case '/curriculum':
          return (
            <CourseManager 
              courses={courses}
              onCreateCourse={handleCreateNewCourse}
              onDeleteCourse={(id) => setCourses(prev => prev.filter(c => c.id !== id))}
              onUpdateMetadata={(course) => setCourses(prev => prev.map(c => c.id === course.id ? course : c))}
              onEditCurriculum={(cid, mid) => {
                setEditingCourseId(cid);
                setEditingModuleId(mid);
                setCurrentPath('/builder');
              }}
              onTogglePublish={handleTogglePublish}
            />
          );
        case '/grade-management':
            return <GradeManagement enrollments={enrollments} courses={courses} onReviewSubmission={handleManualReview} />;
        case '/my-grades':
            return <MyGrades user={user} enrollments={enrollments} courses={courses} />;
        case '/invitations':
            return <Invitations />;
        case '/audit':
            return <AuditLogs />;
        case '/users':
            return <UserManagement enrollments={enrollments} onEnroll={handleEnroll} courses={courses} />;
        case '/courses':
            return (
              <CourseCatalog 
                courses={courses.filter(c => c.status === 'published' || user.role === 'admin')} 
                enrollments={enrollments} 
                onEnroll={handleEnroll} 
                onNavigate={(path, id) => {
                   if (id) setActiveCourseId(id);
                   setCurrentPath(path);
                }} 
              />
            );
        default:
          return <Dashboard user={user} courses={courses} enrollments={enrollments} onNavigate={setCurrentPath} />;
      }
    };

    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar 
            user={user} 
            currentPath={currentPath} 
            onNavigate={setCurrentPath} 
            onLogout={() => {
                setUser(null);
                setCurrentPath('/');
            }} 
        />
        <main className="flex-1 ml-64">
          <Router />
        </main>
      </div>
    );
  };

  return renderContent();
};

export default App;