// User Roles
export type UserRoleType = 'admin' | 'instructor' | 'staff' | 'content_author';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  role: UserRoleType;
  department?: string;
  complianceScore?: number; // 0-100 percentage
}

// Content Block Types
export type BlockType = 
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'quiz'
  | 'checklist';

export type QuizQuestionType = 'multiple-choice' | 'true-false' | 'matching' | 'fill-blank' | 'short-answer';

// Specific Data Interfaces
export interface TextBlockData {
  content: string;
  variant?: 'paragraph' | 'callout-info' | 'callout-warning' | 'callout-critical';
}

export interface ImageBlockData {
  url: string;
  caption?: string;
  altText?: string;
}

export interface VideoBlockData {
  url: string;
  title: string;
  duration: number;
  transcript?: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options: string[]; // Used for MC and TF
  correctAnswer: any; // index (number) for MC/TF, string for fill-blank, array of correct right-side indices for matching, exemplar for short-answer
  matchingPairs?: MatchingPair[]; 
  points: number;
}

export interface QuizBlockData {
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export type AnyBlockData = TextBlockData | ImageBlockData | VideoBlockData | QuizBlockData | { [key: string]: any };

export interface ContentBlock {
  id: string;
  moduleId: string;
  type: BlockType;
  order: number;
  required: boolean;
  data: AnyBlockData;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  passingScore: number;
  estimatedMinutes: number;
  blocks: ContentBlock[]; 
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'hospice' | 'compliance' | 'clinical_skills';
  ceCredits: number;
  thumbnailUrl: string;
  modules: Module[];
  status: 'draft' | 'published';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actionType: 'GRADE_ENTRY' | 'MODULE_UPDATE' | 'COURSE_PUBLISH' | 'USER_LOGIN' | 'ENROLLMENT' | 'MANUAL_GRADE';
  targetId: string;
  details: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // 0-100
  status: 'not_started' | 'in_progress' | 'completed' | 'needs_review';
  enrolledAt: string;
  lastAccessedAt: string;
  score?: number;
  quizAnswers?: Record<string, any[]>; // For manual review
}

export interface GradeSubmission {
  id: string;
  userId: string;
  courseId: string;
  submittedAt: string;
  answers: Record<string, any[]>;
  status: 'pending' | 'graded';
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRoleType;
  department?: string;
  sentAt: string;
  status: 'pending' | 'expired' | 'accepted';
}