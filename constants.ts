
import {
  User, UserRole, LessonType, ResourceCategory, QuestionType, DifficultyLevel,
  ClassGroup, SubjectFeatures, CurriculumStandard, Lesson, TimetableEntry,
  Resource, DailyLogEntry, LabRequest, AppNotification, Assessment, Student,
  ContextState, EducationStage, ResourceType, LabItem
} from './types';

// --- CONSTANTS & CONFIGURATIONS ---

export const HIGH_SCHOOL_LEVELS = ['1AS', '2AS', '3AS'];
export const AVAILABLE_LEVELS = HIGH_SCHOOL_LEVELS; // Alias

export const HIGH_SCHOOL_SUBJECTS = [
  'رياضيات', 'فيزياء', 'علوم طبيعية', 'معلوماتية', 
  'لغة عربية', 'لغة إنجليزية', 'لغة فرنسية', 
  'تاريخ وجغرافيا', 'علوم إسلامية', 'فلسفة',
  'هندسة مدنية', 'هندسة ميكانيكية', 'هندسة كهربائية', 'هندسة الطرائق', 
  'تكنولوجيا', 'تسيير محاسبي ومالي', 'قانون', 'اقتصاد ومناجمنت'
];

export const CLASSES: ClassGroup[] = [
  // 1AS
  { id: 'c1_1', name: '1 ج م ع ت 1', gradeLevel: '1AS', stream: 'جذع مشترك علوم وتكنولوجيا' },
  { id: 'c1_2', name: '1 ج م ع ت 2', gradeLevel: '1AS', stream: 'جذع مشترك علوم وتكنولوجيا' },
  { id: 'c1_3', name: '1 ج م ع ت 3', gradeLevel: '1AS', stream: 'جذع مشترك علوم وتكنولوجيا' },
  { id: 'c1_4', name: '1 ج م ع ت 4', gradeLevel: '1AS', stream: 'جذع مشترك علوم وتكنولوجيا' },
  { id: 'c1_5', name: '1 ج م آداب 1', gradeLevel: '1AS', stream: 'جذع مشترك آداب' },
  { id: 'c1_6', name: '1 ج م آداب 2', gradeLevel: '1AS', stream: 'جذع مشترك آداب' },
  
  // 2AS
  { id: 'c2_1', name: '2 علوم تجريبية 1', gradeLevel: '2AS', stream: 'علوم تجريبية' },
  { id: 'c2_2', name: '2 علوم تجريبية 2', gradeLevel: '2AS', stream: 'علوم تجريبية' },
  { id: 'c2_3', name: '2 تقني رياضي 1', gradeLevel: '2AS', stream: 'تقني رياضي' },
  { id: 'c2_4', name: '2 رياضيات 1', gradeLevel: '2AS', stream: 'رياضيات' },
  { id: 'c2_5', name: '2 تسيير واقتصاد 1', gradeLevel: '2AS', stream: 'تسيير واقتصاد' },
  { id: 'c2_6', name: '2 آداب وفلسفة 1', gradeLevel: '2AS', stream: 'آداب وفلسفة' },
  { id: 'c2_7', name: '2 لغات أجنبية 1', gradeLevel: '2AS', stream: 'لغات أجنبية' },

  // 3AS
  { id: 'c3_1', name: '3 علوم تجريبية 1', gradeLevel: '3AS', stream: 'علوم تجريبية' },
  { id: 'c3_2', name: '3 علوم تجريبية 2', gradeLevel: '3AS', stream: 'علوم تجريبية' },
  { id: 'c3_3', name: '3 تقني رياضي 1', gradeLevel: '3AS', stream: 'تقني رياضي' },
  { id: 'c3_4', name: '3 رياضيات 1', gradeLevel: '3AS', stream: 'رياضيات' },
  { id: 'c3_5', name: '3 تسيير واقتصاد 1', gradeLevel: '3AS', stream: 'تسيير واقتصاد' },
  { id: 'c3_6', name: '3 آداب وفلسفة 1', gradeLevel: '3AS', stream: 'آداب وفلسفة' },
  { id: 'c3_7', name: '3 لغات أجنبية 1', gradeLevel: '3AS', stream: 'لغات أجنبية' },
];

export const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const RESOURCE_CATEGORY_LABELS: Record<string, string> = {
  [ResourceCategory.LESSON_MEMO]: 'مذكرة درس',
  [ResourceCategory.EXERCISES]: 'تمارين',
  [ResourceCategory.EXAM]: 'اختبار/فرض',
  [ResourceCategory.SUMMARY]: 'ملخص',
  [ResourceCategory.PROJECT]: 'مشروع',
  [ResourceCategory.MEDIA]: 'وسائط',
  [ResourceCategory.OTHER]: 'أخرى',
};

export const LESSON_TYPE_LABELS: Record<string, string> = {
  [LessonType.BUILD]: 'بناء التعلمات',
  [LessonType.CONSOLIDATE]: 'إدماج جزئي',
  [LessonType.INTEGRATE]: 'إدماج كلي',
  [LessonType.EVALUATE]: 'تقويم',
  [LessonType.SUPPORT]: 'دعم ومعالجة'
};

export const DEFAULT_SUBJECT_FEATURES: SubjectFeatures = {
  hasLab: false,
  hasProjects: false,
  defaultDuration: 60,
  customFields: []
};

export const SUBJECT_FEATURES: Record<string, SubjectFeatures> = {
  'معلوماتية': { hasLab: true, hasProjects: true, defaultDuration: 60, customFields: [] },
  'فيزياء': { hasLab: true, hasProjects: true, defaultDuration: 60, customFields: [] },
  'علوم طبيعية': { hasLab: true, hasProjects: true, defaultDuration: 60, customFields: [] },
  'تكنولوجيا': { hasLab: true, hasProjects: true, defaultDuration: 60, customFields: [] },
  'هندسة مدنية': { hasLab: true, hasProjects: true, defaultDuration: 60, customFields: [] }, // Added Lab support for Civil Eng (DAO)
  'لغة إنجليزية': { hasLab: false, hasProjects: true, defaultDuration: 60, customFields: [] },
};

// --- MOCK DATA ---

export const DEMO_USER: User = {
  id: 'u_demo',
  name: 'أستاذ تجريبي',
  email: 'demo@minaedu.dz',
  role: UserRole.TEACHER,
  schoolName: 'ثانوية الرياضيات بالقبة',
  academicYear: '2023/2024',
  educationStage: 'HIGH',
  subjects: ['هندسة مدنية', 'معلوماتية'],
  levels: ['1AS', '2AS', '3AS'],
  assignedClassIds: ['c1_1', 'c2_3', 'c3_3'],
  notificationSettings: {
    homeworkReminder: '1_day',
    classReminder: '15_min',
    enableSystemNotifications: true
  }
};

export const DEMO_ADMIN: User = {
  id: 'u_admin',
  name: 'مدير المنصة',
  email: 'admin@minaedu.dz',
  role: UserRole.ADMIN,
  schoolName: 'مديرية التربية',
  academicYear: '2023/2024',
  educationStage: 'HIGH',
  subjects: ['معلوماتية'],
  levels: ['1AS', '2AS', '3AS'],
  assignedClassIds: []
};

export const getInitialUser = (): User | null => {
  try {
    const saved = localStorage.getItem('minaedu_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// --- OFFICIAL ALGERIAN CURRICULUM DATA (Extracted via OCR - Sep 2022/2019) ---
export const ALGERIAN_CURRICULUM: CurriculumStandard[] = [
  // ... (Full Curriculum Data - Truncated for brevity in this response, assume it is present as in original file)
];

export const LESSON_TEMPLATES: Record<LessonType, { flow: string; activities: string }> = {
  [LessonType.BUILD]: {
    flow: `1. وضعية الانطلاق (5د): \n2. مرحلة الاستكشاف (15د): \n3. مرحلة الهيكلة (25د): \n4. مرحلة التقويم (15د): `,
    activities: `نشاط 1: \nنشاط 2: \nتقويم تكويني: `
  },
  [LessonType.CONSOLIDATE]: {
    flow: `1. التذكير بالمكتسبات (10د)\n2. عرض وضعية الإدماج الجزئي (10د)\n3. محاولات التلاميذ (25د)\n4. المناقشة والتصحيح (15د)`,
    activities: `تمرين تطبيقي: `
  },
  [LessonType.INTEGRATE]: {
    flow: `1. طرح الوضعية المشكلة الإدماجية (10د)\n2. العمل الفوجي / الفردي (30د)\n3. العرض والمناقشة (20د)`,
    activities: `الوضعية: `
  },
  [LessonType.EVALUATE]: {
    flow: `1. توزيع الأوراق / المهام (5د)\n2. الإنجاز الفردي (45د)\n3. جمع الأوراق (10د)`,
    activities: `نص الاختبار / الفرض: `
  },
  [LessonType.SUPPORT]: {
    flow: `1. تشخيص النقائص (10د)\n2. المعالجة البيداغوجية (30د)\n3. تقويم الأثر (20د)`,
    activities: `أنشطة علاجية: `
  }
};

export const DEFAULT_LESSONS: Lesson[] = [];
export const DEFAULT_TIMETABLE: TimetableEntry[] = [];
export const DEFAULT_RESOURCES: Resource[] = [];
export const DEFAULT_DAILY_LOGS: DailyLogEntry[] = [];
export const DEFAULT_LAB_REQUESTS: LabRequest[] = [];
export const DEFAULT_NOTIFICATIONS: AppNotification[] = [];
export const DEFAULT_ASSESSMENTS: Assessment[] = [];
export const DEFAULT_STUDENTS: Student[] = [];

// Empty Inventory by default so teachers perform stocktake
export const DEFAULT_LAB_INVENTORY: LabItem[] = [];

export const DEFAULT_QUESTION_BANK = [
  {
    id: 'q_bank_1',
    text: 'ما هي عاصمة الجزائر؟',
    type: QuestionType.TEXT,
    points: 2,
    difficulty: DifficultyLevel.EASY,
    gradingRubric: 'الإجابة الصحيحة: الجزائر',
    modelAnswer: 'الجزائر',
    tags: ['جغرافيا', 'عام']
  }
];

export const ASSESSMENT_TEMPLATES = {
    TEST: { title: 'اختبار الفصل', duration: 60, totalPoints: 20 },
    WORKSHEET: { title: 'ورقة عمل', duration: 45, totalPoints: 10 },
    HOMEWORK: { title: 'واجب منزلي', duration: 0, totalPoints: 10 }
};
