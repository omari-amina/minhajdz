
// --- ENUMS & BASICS ---
export enum UserRole {
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export type EducationStage = 'MIDDLE' | 'HIGH';

export interface NotificationPreferences {
  homeworkReminder: 'none' | '15_min' | '1_hour' | '1_day' | '2_days' | '3_days' | '1_week';
  classReminder: 'none' | '15_min' | '30_min' | '1_hour';
  dailyReminderTime?: string; // "HH:MM" format for long-term reminders
  enableSystemNotifications: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolName: string;
  academicYear: string;
  educationStage: EducationStage;
  subjects: string[];
  levels: string[]; // e.g., ["1AS", "2AS"] - General Grade Levels
  assignedClassIds: string[]; // e.g., ["c1", "c3"] - Specific Sections (The new source of truth)
  avatar?: string;
  notificationSettings?: NotificationPreferences;
}

export interface ClassGroup {
  id: string;
  name: string;
  gradeLevel: string;
  stream?: string;
}

export interface SubjectFeatures {
  hasLab: boolean;
  hasProjects: boolean;
  defaultDuration: number;
  skillsModule?: string;
  customFields: any[];
}

export interface CurriculumStandard {
  id: string;
  code?: string; // Unique Reference Code (e.g. SCI-1AS-U1-L1) for easy updates
  cycle: 'middle' | 'secondary'; // Unified Cycle Layer
  subject: string;
  level: string; // Grade (1AS, 2AS...)
  stream?: string; // Track (Science, Arts...)
  domain: string; // Unit/Field (المجال)
  unit: string; // Learning Unit (الوحدة)
  lessonTitle: string; // Lesson (الدرس)
  targetCompetencies: string[]; // Competencies
  performanceIndicators?: string[]; // Indicators
  suggestedDuration: number;
}

// --- CURRICULUM REPORTING & AUDIT ---
export interface CurriculumReport {
  id: string;
  reporterId: string;
  reporterName: string;
  curriculumId: string;
  type: 'ERROR' | 'MISSING_INFO' | 'SUGGESTION';
  description: string;
  date: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'RESOLVE_REPORT';
  entityType: 'CURRICULUM';
  entityId: string;
  details: string;
  timestamp: string;
  snapshot?: {
    before?: any;
    after?: any;
  };
}

// --- LESSON & PLANNING ---
export enum LessonType {
  BUILD = 'BUILD',
  CONSOLIDATE = 'CONSOLIDATE',
  INTEGRATE = 'INTEGRATE',
  EVALUATE = 'EVALUATE',
  SUPPORT = 'SUPPORT'
}

export enum LessonStatus {
  PLANNED = 'PLANNED',
  COMPLETED = 'COMPLETED'
}

export interface SubjectDetails {
  civEngCriteria?: any[];
  englishSkills?: ('Listening' | 'Speaking' | 'Reading' | 'Writing')[];
  englishTask?: string;
  arabicDomain?: string;
  mathMistakes?: string;
  mathRemediation?: string;
  csPractical?: boolean;
}

// --- REFLECTIVE PRACTICE ---
export interface TeacherReflection {
  studentActivation: number; // 1-5
  participationRate: string;
  instructionsClarity: number; // 1-5
  objectivesMet: boolean;
  contentAccuracy: boolean;
  planFollowed: boolean;
  timeManagement: boolean;
  activityBalance: boolean;
  activityPacing: 'FAST' | 'SLOW' | 'GOOD';
  unexpectedDifficulties: string;
  improvementPlan: string;
}

// --- WAYGROUND INTEGRATION ---
export interface WaygroundConfig {
  isEnabled: boolean;
  assignmentLink?: string;
  assignmentId?: string;
  status?: 'OPEN' | 'ASSIGNED' | 'COLLECTED';
}

export interface Lesson {
  id: string;
  title: string;
  classIds: string[];
  curriculumId?: string;
  subject: string;
  domain: string;
  unit: string;
  type: LessonType;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  objectives: string[];
  prerequisites: string;
  performanceIndicators: string;
  materials: string;
  learningSituation: string;
  theoreticalContent: string;
  practicalContent: string;
  homework: string;
  homeworkDueDate?: string;
  notes: string;
  status: LessonStatus;
  resourceIds: string[];
  wayground?: WaygroundConfig;
  reflection?: TeacherReflection;
  subjectDetails?: SubjectDetails;
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: number;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  classId: string;
  room: string;
}

// --- RESOURCES & LIBRARY ---
export enum ResourceType {
  DOC = 'DOC',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  ARCHIVE = 'ARCHIVE',
  YOUTUBE = 'YOUTUBE', // Added
  LINK = 'LINK'        // Added
}

export enum ResourceCategory {
  LESSON_MEMO = 'LESSON_MEMO',
  EXERCISES = 'EXERCISES',
  EXAM = 'EXAM',
  SUMMARY = 'SUMMARY',
  PROJECT = 'PROJECT',
  MEDIA = 'MEDIA',
  OTHER = 'OTHER'
}

export interface ResourceLink {
  subject?: string;
  level?: string;
  stream?: string;
  unit?: string;
  lessonId?: string; // Links directly to a specific lesson ID
  curriculumId?: string; // Links to a standard curriculum item
}

export interface ResourceFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description?: string; // Added
  type: ResourceType;
  category: ResourceCategory;
  url: string; // Blob URL or External URL
  size: string;
  dateAdded: string;
  tags: string[];
  
  // Linking & Organization
  folderId?: string | null;
  links: ResourceLink;
  
  // Metadata
  isFavorite: boolean;
  usageCount: number; // For ranking
  lastUsed?: string;
  
  version: number;
  originalId?: string;
  
  // Legacy fields (optional for migration)
  subject?: string;
  level?: string;
  unit?: string;
  stream?: string;
  stage?: EducationStage;
}

// --- DAILY LOG ---
export interface DailyLogEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  classId: string;
  lessonId?: string;
  topic: string;
  contentSummary: string;
  absentees: string;
  observations: string;
}

// --- LAB & REQUESTS ---
export interface LabRequest {
  id: string;
  title: string;
  date: string;
  status: 'PENDING' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface LabItem {
  id: string;
  name: string;
  category: 'DEVICE' | 'GLASSWARE' | 'CHEMICAL' | 'TOOL' | 'OTHER';
  quantity: number;
  status: 'GOOD' | 'FAIR' | 'POOR' | 'BROKEN' | 'CONSUMED';
  location?: string;
  notes?: string;
}

// --- NOTIFICATIONS ---
export interface AppNotification {
  id: string;
  type: 'CLASS' | 'HOMEWORK' | 'SYSTEM';
  title: string;
  message: string;
  date: string;
  read: boolean;
  link?: string;
}

// --- ASSESSMENT & QUESTION BANK ---
export enum QuestionType {
  TEXT = 'TEXT',
  MCQ = 'MCQ',
  TRUE_FALSE = 'TRUE_FALSE',
  WAYGROUND_LINK = 'WAYGROUND_LINK'
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  options?: string[];
  difficulty: DifficultyLevel;
  gradingRubric: string;
  modelAnswer: string;
  justificationRequired?: boolean;
  waygroundId?: string;
  waygroundUrl?: string;
  linkedCompetency?: string;
  unit?: string;
  tags?: string[];
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  level: string;
  term: 'TERM_1' | 'TERM_2' | 'TERM_3';
  type: 'TEST' | 'WORKSHEET' | 'HOMEWORK';
  duration: number;
  totalPoints: number;
  questions: Question[];
  dateCreated: string;
  isGenerated?: boolean;
}

// --- ANNUAL PLANNER ---
export interface PlanWeek {
  weekNumber: number;
  startDate: string;
  term: 'TERM_1' | 'TERM_2' | 'TERM_3';
  assignedCurriculumIds: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  notes?: string;
}

export interface AnnualPlan {
  id: string;
  subject: string;
  level: string;
  stream?: string;
  academicYear: string;
  weeks: PlanWeek[];
  lastUpdated: string;
}

// --- STUDENT & MARKS ---
export interface Student {
  id: string;
  name: string;
  fullName: string;
  classId: string;
  level?: 'EXCELLENT' | 'AVERAGE' | 'WEAK';
}

export interface MarkEntry {
  studentId: string;
  subject: string;
  term: 'TERM_1' | 'TERM_2' | 'TERM_3';
  evaluation?: number;
  homework?: number;
  exam?: number;
}

// --- CONTEXT ---
export interface ContextState {
  subject: string;
  stage: EducationStage;
  features: SubjectFeatures;
}

export interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{success: boolean, error?: string}>;
  signup: (data: Partial<User>, pass: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (u: User) => void;
  currentContext: ContextState;
  switchContext: (subject: string, stage?: EducationStage) => void;
}
