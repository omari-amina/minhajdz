
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
  'هندسة مدنية': { hasLab: true, hasProjects: true, defaultDuration: 60, customFields: [] },
  'لغة إنجليزية': { 
      hasLab: false, 
      hasProjects: true, 
      defaultDuration: 60, 
      customFields: [],
      skillsModule: 'Listening, Speaking, Reading, Writing'
  },
  'لغة عربية': { 
      hasLab: false, 
      hasProjects: true, 
      defaultDuration: 60, 
      customFields: [],
      skillsModule: 'نص أدبي, نص تواصلي, قواعد, بالغة/عروض, تعبير'
  },
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
  subjects: ['لغة إنجليزية', 'هندسة مدنية', 'معلوماتية', 'لغة عربية'],
  levels: ['1AS', '2AS', '3AS'],
  assignedClassIds: ['c1_1', 'c2_3', 'c3_3', 'c1_5'],
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

// --- OFFICIAL ALGERIAN CURRICULUM DATA ---
export const ALGERIAN_CURRICULUM: CurriculumStandard[] = [
  
  // ==========================================
  // 1. ARABIC 1AS (Common Core)
  // ==========================================
  {
    id: 'arb_1as_lit_u1',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'العصر الجاهلي',
    unit: 'الصلح والسلم',
    lessonTitle: 'نص أدبي: الإشادة بالصلح والسلم (زهير بن أبي سلمى)',
    suggestedDuration: 2,
    targetCompetencies: ['تعرف الشعر الجاهلي', 'الوقوف على قيم السلم', 'بناء القصيدة الجاهلية']
  },
  {
    id: 'arb_1as_lit_u2',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'العصر الجاهلي',
    unit: 'الفروسية',
    lessonTitle: 'نص أدبي: الفروسية (عنترة بن شداد)',
    suggestedDuration: 2,
    targetCompetencies: ['شعر الحماسة والفروسية', 'القيم الخلقية في الجاهلية']
  },
  {
    id: 'arb_1as_sci_u1',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'العصر الجاهلي',
    unit: 'الكرم العربي',
    lessonTitle: 'نص أدبي: من الكرم العربي (حاتم الطائي)',
    suggestedDuration: 2,
    targetCompetencies: ['مظاهر الكرم العربي', 'النمط السردي والوصفي']
  },
  {
    id: 'arb_1as_sci_u2',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'عصر صدر الإسلام',
    unit: 'القيم الروحية والاجتماعية',
    lessonTitle: 'نص أدبي: من هدي القرآن الكريم',
    suggestedDuration: 2,
    targetCompetencies: ['أثر الإسلام في اللغة والأدب', 'اقتباس القرآن']
  },

  // ==========================================
  // 2. ARABIC 2AS (Arts & Science)
  // ==========================================
  {
    id: 'arb_2as_lit_u1_1',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '2AS',
    stream: 'آداب وفلسفة',
    domain: 'العصر العباسي الأول',
    unit: 'النزعة العقلية',
    lessonTitle: 'نص أدبي: تهديد ونصح (بشار بن برد)',
    suggestedDuration: 2,
    targetCompetencies: ['مظاهر النزعة العقلية', 'الشعوبية', 'بحر الخفيف']
  },
  {
    id: 'arb_2as_lit_u1_2',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '2AS',
    stream: 'آداب وفلسفة',
    domain: 'العصر العباسي الأول',
    unit: 'وصف الطبيعة',
    lessonTitle: 'نص أدبي: وصف النخل (أبو نواس)',
    suggestedDuration: 2,
    targetCompetencies: ['التجديد في الوصف', 'الخصومة بين القدماء والمحدثين']
  },
  {
    id: 'arb_2as_lit_u3',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '2AS',
    stream: 'آداب وفلسفة',
    domain: 'العصر العباسي الثاني',
    unit: 'الحكمة وفلسفة الحياة',
    lessonTitle: 'نص أدبي: حكمة المتنبي',
    suggestedDuration: 2,
    targetCompetencies: ['شعر الحكمة', 'شخصية المتنبي']
  },
  {
    id: 'arb_2as_lit_u4',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '2AS',
    stream: 'آداب وفلسفة',
    domain: 'الأدب الأندلسي',
    unit: 'رثاء الممالك',
    lessonTitle: 'نص أدبي: رثاء الأندلس (أبو البقاء الرندي)',
    suggestedDuration: 2,
    targetCompetencies: ['شعر الرثاء', 'نكبة الأندلس']
  },
  {
    id: 'arb_2as_sci_u1_1',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '2AS',
    stream: 'علوم تجريبية',
    domain: 'العصر العباسي الأول',
    unit: 'النزعة العقلية',
    lessonTitle: 'نص أدبي: زحف عربي ظافر (أبو تمام)',
    suggestedDuration: 2,
    targetCompetencies: ['شعر الفتوحات', 'توظيف البديع']
  },
  {
    id: 'arb_2as_sci_u2',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '2AS',
    stream: 'علوم تجريبية',
    domain: 'العصر العباسي',
    unit: 'النثر العلمي',
    lessonTitle: 'نص أدبي: في البصريات (ابن الهيثم)',
    suggestedDuration: 2,
    targetCompetencies: ['خصائص النثر العلمي', 'المصطلحات العلمية']
  },

  // ==========================================
  // 3. ARABIC 3AS (Arts, Philo, Languages)
  // ==========================================
  {
    id: 'arb_3as_lit_u1_1',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'عصر الضعف',
    unit: 'شعر الزهد والمديح',
    lessonTitle: 'نص أدبي: في مدح الرسول (البوصيري)',
    suggestedDuration: 2,
    targetCompetencies: ['خصائص المديح النبوي', 'بديعيات البوصيري', 'الإعراب اللفظي']
  },
  {
    id: 'arb_3as_lit_u1_2',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'عصر الضعف',
    unit: 'شعر الزهد والمديح',
    lessonTitle: 'قواعد: الإعراب اللفظي',
    suggestedDuration: 1,
    targetCompetencies: ['أحكام التعذر والثقل']
  },
  {
    id: 'arb_3as_lit_u1_3',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'عصر الضعف',
    unit: 'شعر الزهد والمديح',
    lessonTitle: 'نص أدبي: في الزهد (ابن نباتة)',
    suggestedDuration: 2,
    targetCompetencies: ['شعر الزهد', 'ظاهرة التضمين']
  },
  {
    id: 'arb_3as_lit_u1_4',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'عصر الضعف',
    unit: 'النثر العلمي المتأدب',
    lessonTitle: 'نص أدبي: علم التاريخ (ابن خلدون)',
    suggestedDuration: 2,
    targetCompetencies: ['خصائص النثر العلمي', 'أسلوب ابن خلدون', 'الإعراب التقديري']
  },
  {
    id: 'arb_3as_lit_u2_1',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'العصر الحديث',
    unit: 'شعر المنفى',
    lessonTitle: 'نص أدبي: آلام الاغتراب (البارودي)',
    suggestedDuration: 2,
    targetCompetencies: ['مدرسة الإحياء والبعث', 'شعر الحنين', 'بلاغة المجاز']
  },
  {
    id: 'arb_3as_lit_u2_2',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'العصر الحديث',
    unit: 'شعر المنفى',
    lessonTitle: 'نص أدبي: من وحي المنفى (أحمد شوقي)',
    suggestedDuration: 2,
    targetCompetencies: ['الكلاسيكية الجديدة', 'التجديد في التقليد']
  },
  {
    id: 'arb_3as_lit_u2_3',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'العصر الحديث',
    unit: 'النزعة الإنسانية',
    lessonTitle: 'نص أدبي: أنا (إيليا أبو ماضي)',
    suggestedDuration: 2,
    targetCompetencies: ['الأدب المهجري', 'الرومانسية', 'إذ، إذا، إذًا، حينئذ']
  },
  {
    id: 'arb_3as_lit_u2_4',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'العصر الحديث',
    unit: 'الالتزام والقضايا القومية',
    lessonTitle: 'نص أدبي: منشورات فدائية (نزار قباني)',
    suggestedDuration: 2,
    targetCompetencies: ['شعر التفعيلة', 'الالتزام', 'الجمل التي لا محل لها من الإعراب']
  },
  {
    id: 'arb_3as_lit_u2_5',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'العصر الحديث',
    unit: 'الثورة الجزائرية',
    lessonTitle: 'نص أدبي: الإنسان الكبير (محمد صالح باوية)',
    suggestedDuration: 2,
    targetCompetencies: ['الثورة في الشعر العربي', 'الرمز', 'المسند والمسند إليه']
  },
  {
    id: 'arb_3as_lit_u2_6',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'العصر الحديث',
    unit: 'ظاهرة الحزن والألم',
    lessonTitle: 'نص أدبي: أغنيات للألم (نازك الملائكة)',
    suggestedDuration: 2,
    targetCompetencies: ['الشعر المعاصر', 'الرمز والأسطورة', 'جموع القلة']
  },
  {
    id: 'arb_3as_lit_u3_1',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'الفنون النثرية الحديثة',
    unit: 'المقال',
    lessonTitle: 'نص أدبي: منزلة المثقفين (البشير الإبراهيمي)',
    suggestedDuration: 2,
    targetCompetencies: ['فن المقال', 'مدرسة الصنعة اللفظية', 'لو، لولا، لوما']
  },
  {
    id: 'arb_3as_lit_u3_2',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'الفنون النثرية الحديثة',
    unit: 'المقال النقدي',
    lessonTitle: 'نص أدبي: الصراع بين التقليد والتجديد (طه حسين)',
    suggestedDuration: 2,
    targetCompetencies: ['النقد الأدبي', 'طه حسين', 'أمّا، إمّا']
  },
  {
    id: 'arb_3as_lit_u3_3',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'الفنون النثرية الحديثة',
    unit: 'القصة القصيرة',
    lessonTitle: 'نص أدبي: الطريق إلى قرية الطوب (محمد شنوفي)',
    suggestedDuration: 2,
    targetCompetencies: ['القصة الجزائرية', 'عناصر السرد', 'اسم الجمع']
  },
  {
    id: 'arb_3as_lit_u3_4',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'الفنون النثرية الحديثة',
    unit: 'المسرح',
    lessonTitle: 'نص أدبي: شهرزاد (توفيق الحكيم)',
    suggestedDuration: 2,
    targetCompetencies: ['أبو المسرح العربي', 'الصراع الدرامي', 'أي، أيّ، كم، كأيّن']
  },

  // ==========================================
  // 4. ARABIC 3AS (Scientific Streams)
  // ==========================================
  {
    id: 'arb_3as_sci_u1_1',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'عصر الضعف',
    unit: 'الشعر التعليمي',
    lessonTitle: 'نص أدبي: وصايا وتوجيهات (ابن الوردي)',
    suggestedDuration: 2,
    targetCompetencies: ['الشعر التعليمي', 'النصح والإرشاد', 'المجاز العقلي والمرسل']
  },
  {
    id: 'arb_3as_sci_u1_2',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'عصر الضعف',
    unit: 'النثر العلمي',
    lessonTitle: 'نص أدبي: علم التاريخ (ابن خلدون)',
    suggestedDuration: 2,
    targetCompetencies: ['الموضوعية العلمية', 'المصطلحات', 'الإعراب اللفظي والتقديري']
  },
  {
    id: 'arb_3as_sci_u2_1',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'العصر الحديث',
    unit: 'شعر المنفى',
    lessonTitle: 'نص أدبي: من وحي المنفى (أحمد شوقي)',
    suggestedDuration: 2,
    targetCompetencies: ['الكلاسيكية', 'الحنين للوطن', 'المعارضات']
  },
  {
    id: 'arb_3as_sci_u2_2',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'العصر الحديث',
    unit: 'النزعة الإنسانية',
    lessonTitle: 'نص أدبي: أنا (إيليا أبو ماضي)',
    suggestedDuration: 2,
    targetCompetencies: ['مدرسة الرابطة القلمية', 'التفاؤل', 'إذ، إذا']
  },
  {
    id: 'arb_3as_sci_u2_3',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'العصر الحديث',
    unit: 'القضية الفلسطينية',
    lessonTitle: 'نص أدبي: حالة حصار (محمود درويش)',
    suggestedDuration: 2,
    targetCompetencies: ['أدب المقاومة', 'الرمزية', 'الجمل التي لا محل لها من الإعراب']
  },
  {
    id: 'arb_3as_sci_u2_4',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'العصر الحديث',
    unit: 'الثورة الجزائرية',
    lessonTitle: 'نص أدبي: جميلة (شفيق الكمالي)',
    suggestedDuration: 2,
    targetCompetencies: ['القيم الثورية', 'الالتزام', 'الحال والتمييز']
  },
  {
    id: 'arb_3as_sci_u2_5',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'العصر الحديث',
    unit: 'الشعر الاجتماعي',
    lessonTitle: 'نص أدبي: الفراغ (أدونيس)',
    suggestedDuration: 2,
    targetCompetencies: ['الواقعية', 'الغموض الفني', 'البدل وعطف البيان']
  },
  {
    id: 'arb_3as_sci_u3_1',
    cycle: 'secondary',
    subject: 'لغة عربية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'الفنون النثرية',
    unit: 'المقال',
    lessonTitle: 'نص أدبي: منزلة المثقفين (البشير الإبراهيمي)',
    suggestedDuration: 2,
    targetCompetencies: ['جمعية العلماء', 'السجع والبديع', 'لو، لولا، لوما']
  },

  // ... (English 1AS content kept as is) ...
  {
    id: 'eng_1as_lit_u1_1',
    code: 'ENG-1AS-LIT-U1-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'Intercultural Exchanges',
    unit: 'Getting Through',
    lessonTitle: 'Communicate: Email & Invitations',
    suggestedDuration: 4,
    targetCompetencies: [
      'Interact: Write emails/letters of invitation, refusal, acceptance',
      'Interpret: Read and understand informal letters',
      'Grammar: The imperative, Modals (need to, have to)'
    ],
    performanceIndicators: [
      'Learner can distinguish between formal and informal letters',
      'Learner can write short notes to invite and reply'
    ]
  },
  {
    id: 'eng_1as_lit_u1_2',
    code: 'ENG-1AS-LIT-U1-L2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'Intercultural Exchanges',
    unit: 'Getting Through',
    lessonTitle: 'Language Focus: Technology & Devices',
    suggestedDuration: 3,
    targetCompetencies: [
      'Interact: Name main parts of a computer',
      'Grammar: Sequencers (first, next...), Frequency adverbs',
      'Producing: Ordering instructions'
    ],
    performanceIndicators: [
      'Learner can label computer parts',
      'Learner can write a process paragraph using sequencers'
    ]
  },
  {
    id: 'eng_1as_lit_u1_3',
    code: 'ENG-1AS-LIT-U1-L3',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'Intercultural Exchanges',
    unit: 'Getting Through',
    lessonTitle: 'Writing: Job Application & CV',
    suggestedDuration: 5,
    targetCompetencies: [
      'Producing: Fill in a résumé (CV)',
      'Producing: Write an application letter',
      'Grammar: Prepositions of time and place (in, on, at)'
    ],
    performanceIndicators: [
      'Learner creates a job application booklet',
      'Learner produces a correct formal letter'
    ]
  },
  {
    id: 'eng_1as_lit_u2_1',
    code: 'ENG-1AS-LIT-U2-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'Communication & The Press',
    unit: 'Our Findings Show',
    lessonTitle: 'Reporting: Surveys & Interview',
    suggestedDuration: 6,
    targetCompetencies: [
      'Interacting: Conduct surveys and interviews',
      'Grammar: Direct & Indirect speech, Reporting verbs',
      'Interpreting: Read reports and newspaper articles'
    ],
    performanceIndicators: [
      'Learner can transform statements to reported speech',
      'Learner can analyze a graph or survey result'
    ]
  },
  {
    id: 'eng_1as_lit_u2_2',
    code: 'ENG-1AS-LIT-U2-L2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'Communication & The Press',
    unit: 'Our Findings Show',
    lessonTitle: 'Language Focus: Expressing Preference & Advice',
    suggestedDuration: 4,
    targetCompetencies: [
      'Producing: Express point of view',
      'Grammar: Quotation marks, Adverbs of manner (politely, fast)',
      'Grammar: Silent letters, Stress in compound words'
    ]
  },
  {
    id: 'eng_1as_lit_u3_1',
    code: 'ENG-1AS-LIT-U3-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'Environment & Pollution',
    unit: 'Back to Nature',
    lessonTitle: 'Climate Change & Pollution',
    suggestedDuration: 6,
    targetCompetencies: [
      'Interacting: Speak about pollution and global warming',
      'Grammar: Conditional types 0, 1, 2',
      'Grammar: Expressing cause/effect (as a result, consequently)'
    ]
  },
  {
    id: 'eng_1as_lit_u3_2',
    code: 'ENG-1AS-LIT-U3-L2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'Environment & Pollution',
    unit: 'Back to Nature',
    lessonTitle: 'Writing: Consumer Guide / Letter of Complaint',
    suggestedDuration: 5,
    targetCompetencies: [
      'Producing: Write a letter of complaint',
      'Producing: Design a consumer guide',
      'Grammar: Link words, Polite requests'
    ]
  },
  {
    id: 'eng_1as_lit_u4_1',
    code: 'ENG-1AS-LIT-U4-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'Innovation & Technology',
    unit: 'Eureka',
    lessonTitle: 'Inventions & Discoveries',
    suggestedDuration: 5,
    targetCompetencies: [
      'Interacting: Describe objects (shape, dimensions)',
      'Grammar: The Passive Voice (implied context), Used to',
      'Grammar: Expressing concession (however, although)'
    ]
  },
  {
    id: 'eng_1as_lit_u5_1',
    code: 'ENG-1AS-LIT-U5-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'Famous People',
    unit: 'Once Upon a Time',
    lessonTitle: 'Narrative: Biography & Tales',
    suggestedDuration: 8,
    targetCompetencies: [
      'Interpreting: Read literary portraits and tales',
      'Grammar: Past Simple vs Past Continuous (when, while)',
      'Grammar: Relative pronouns (who, whom, which)'
    ]
  },

  // ==========================================
  // ENGLISH 1AS (Scientific Stream - جذع مشترك علوم)
  // ==========================================
  {
    id: 'eng_1as_sci_u1_1',
    code: 'ENG-1AS-SCI-U1-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'Intercultural Exchanges',
    unit: 'Getting Through',
    lessonTitle: 'Communication Basics & Email',
    suggestedDuration: 5,
    targetCompetencies: [
      'Interact: Write emails and letters',
      'Grammar: Modals, Imperative, Prepositions',
      'Project: Making a job application booklet'
    ],
    performanceIndicators: [
      'Learner can write an inquiry letter'
    ]
  },
  {
    id: 'eng_1as_sci_u1_2',
    code: 'ENG-1AS-SCI-U1-L2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'Intercultural Exchanges',
    unit: 'Getting Through',
    lessonTitle: 'Computing & Processes',
    suggestedDuration: 4,
    targetCompetencies: [
      'Producing: Describe a process (Sequencers)',
      'Lexis: Computer related words'
    ]
  },
  {
    id: 'eng_1as_sci_u2_1',
    code: 'ENG-1AS-SCI-U2-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'Communication & The Press',
    unit: 'Our Findings Show',
    lessonTitle: 'Reporting & Surveying',
    suggestedDuration: 6,
    targetCompetencies: [
      'Interacting: Conduct a survey',
      'Grammar: Reported Speech (Statements/Questions)',
      'Producing: Write a report based on a graph'
    ]
  },
  {
    id: 'eng_1as_sci_u3_1',
    code: 'ENG-1AS-SCI-U3-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'Environment & Pollution',
    unit: 'Back to Nature',
    lessonTitle: 'Environmental Issues',
    suggestedDuration: 7,
    targetCompetencies: [
      'Interpreting: Understand pollution causes/effects',
      'Grammar: Conditional Type 1 & 2',
      'Grammar: Expressing cause and effect'
    ]
  },
  {
    id: 'eng_1as_sci_u4_1',
    code: 'ENG-1AS-SCI-U4-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'Innovation & Technology',
    unit: 'Eureka',
    lessonTitle: 'Invention & Tech Profile',
    suggestedDuration: 7,
    targetCompetencies: [
      'Producing: Making an invention profile',
      'Grammar: Concession, Dimensions, Definite Article',
      'Project: Biography of a scientist'
    ]
  },

  // ==========================================
  // ENGLISH 2AS (Scientific / Maths / Technical)
  // ==========================================
  {
    id: 'eng_2as_sci_u1_1',
    code: 'ENG-2AS-SCI-U1-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'علوم تجريبية',
    domain: 'Peace and Conflict Resolution',
    unit: 'Make Peace',
    lessonTitle: 'Discovering Language: Conflict & Peace',
    suggestedDuration: 7,
    targetCompetencies: [
      'Define conflict and types of conflicts',
      'Express obligation and prohibition (Must/Have to)',
      'Grammar: Ability (Can/Could/Able to)',
      'Lexis: Peace, Rights, Duties'
    ]
  },
  {
    id: 'eng_2as_sci_u1_2',
    code: 'ENG-2AS-SCI-U1-L2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'علوم تجريبية',
    domain: 'Peace and Conflict Resolution',
    unit: 'Make Peace',
    lessonTitle: 'Developing Skills: Writing a Statement/Charter',
    suggestedDuration: 7,
    targetCompetencies: [
      'Write a poem denouncing prejudice',
      'Analyze a charter (form and context)',
      'Expressing appreciation and deduction',
      'Project: Statement of achievements (Nobel Peace Prize)'
    ]
  },
  {
    id: 'eng_2as_sci_u1_3',
    code: 'ENG-2AS-SCI-U1-L3',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'علوم تجريبية',
    domain: 'Peace and Conflict Resolution',
    unit: 'Make Peace',
    lessonTitle: 'Project Workshop: Nobel Peace Prize',
    suggestedDuration: 7,
    targetCompetencies: [
      'Researching famous peace makers',
      'Writing biographies',
      'Class presentation'
    ]
  },
  {
    id: 'eng_2as_sci_u2_1',
    code: 'ENG-2AS-SCI-U2-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'علوم تجريبية',
    domain: 'Poverty and World Resources',
    unit: 'Waste not, Want not',
    lessonTitle: 'Discovering Language: Energy & Resources',
    suggestedDuration: 7,
    targetCompetencies: [
      'Identify natural resources',
      'Grammar: Passive voice (Modals)',
      'Grammar: Future Perfect (will have done)',
      'Lexis: Energy, Poverty, Sustainability'
    ]
  },
  {
    id: 'eng_2as_sci_u2_2',
    code: 'ENG-2AS-SCI-U2-L2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'علوم تجريبية',
    domain: 'Poverty and World Resources',
    unit: 'Waste not, Want not',
    lessonTitle: 'Developing Skills: Sustainable Development',
    suggestedDuration: 7,
    targetCompetencies: [
      'Write a press release about conservation',
      'Expressing cause and effect',
      'Grammar: Intonation in complex sentences',
      'Project: Charter against poverty'
    ]
  },
  {
    id: 'eng_2as_sci_u3_1',
    code: 'ENG-2AS-SCI-U3-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'علوم تجريبية',
    domain: 'Technology and Innovation',
    unit: 'Budding Scientist',
    lessonTitle: 'Scientific Experiments & Reporting',
    suggestedDuration: 10,
    targetCompetencies: [
      'Discuss scientific discoveries',
      'Grammar: Conditionals Type 0 & 1',
      'Grammar: Stress in words ending in -gy, -ical',
      'Project: Report on a scientific experiment'
    ]
  },
  {
    id: 'eng_2as_sci_u4_1',
    code: 'ENG-2AS-SCI-U4-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'علوم تجريبية',
    domain: 'Disasters and Safety',
    unit: 'No Man is an Island',
    lessonTitle: 'Safety Measures & Disasters',
    suggestedDuration: 11,
    targetCompetencies: [
      'List types of disasters',
      'Grammar: Reported Speech (Statements/Questions)',
      'Grammar: Had better / Ought to',
      'Write a public announcement on safety'
    ]
  },

  // ==========================================
  // ENGLISH 2AS (Economy - تسيير واقتصاد)
  // ==========================================
  // Re-uses Units 1, 2, 3 from Science but replaces Unit 4
  {
    id: 'eng_2as_eco_u1',
    code: 'ENG-2AS-ECO-U1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'تسيير واقتصاد',
    domain: 'Peace and Conflict Resolution',
    unit: 'Make Peace',
    lessonTitle: 'Peace & Conflict (See Science Stream)',
    suggestedDuration: 21,
    targetCompetencies: ['Identical to Science Stream']
  },
  {
    id: 'eng_2as_eco_u2',
    code: 'ENG-2AS-ECO-U2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'تسيير واقتصاد',
    domain: 'Poverty and World Resources',
    unit: 'Waste not, Want not',
    lessonTitle: 'Poverty & Resources (See Science Stream)',
    suggestedDuration: 21,
    targetCompetencies: ['Identical to Science Stream']
  },
  {
    id: 'eng_2as_eco_u3',
    code: 'ENG-2AS-ECO-U3',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'تسيير واقتصاد',
    domain: 'Technology and Innovation',
    unit: 'Budding Scientist',
    lessonTitle: 'Technology (See Science Stream)',
    suggestedDuration: 21,
    targetCompetencies: ['Identical to Science Stream']
  },
  {
    id: 'eng_2as_eco_u4_1',
    code: 'ENG-2AS-ECO-U4-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'تسيير واقتصاد',
    domain: 'Management and Efficiency',
    unit: 'Business is Business',
    lessonTitle: 'Management Forms & Business Writing',
    suggestedDuration: 10,
    targetCompetencies: [
      'Define efficiency in business',
      'Write a business report / annual report',
      'Grammar: Present Perfect, Passive Voice',
      'Lexis: Management, Marketing, Business',
      'Project: Profile of a good manager'
    ]
  },
  {
    id: 'eng_2as_eco_u4_2',
    code: 'ENG-2AS-ECO-U4-L2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'تسيير واقتصاد',
    domain: 'Management and Efficiency',
    unit: 'Business is Business',
    lessonTitle: 'Correspondence & Reporting',
    suggestedDuration: 11,
    targetCompetencies: [
      'Write a facsimile and reply',
      'Grammar: Imperatives (Past/Future context)',
      'Functions: Persuading, Negotiating, Advising'
    ]
  },

  // ==========================================
  // ENGLISH 2AS (Literary & Philosophy - آداب وفلسفة)
  // ==========================================
  {
    id: 'eng_2as_lit_u1_1',
    code: 'ENG-2AS-LIT-U1-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'آداب وفلسفة',
    domain: 'Diversity / Lifestyles',
    unit: 'Signs of the Time',
    lessonTitle: 'Lifestyles: Past, Present & Future',
    suggestedDuration: 6,
    targetCompetencies: [
      'Compare cultural differences and lifestyles',
      'Grammar: Used to / Going to',
      'Grammar: Comparatives & Superlatives',
      'Lexis: Clothes, Food, Habits'
    ]
  },
  {
    id: 'eng_2as_lit_u1_2',
    code: 'ENG-2AS-LIT-U1-L2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'آداب وفلسفة',
    domain: 'Diversity / Lifestyles',
    unit: 'Signs of the Time',
    lessonTitle: 'Language Focus: Contrast & Similarity',
    suggestedDuration: 6,
    targetCompetencies: [
      'Grammar: Non-defining relative clauses',
      'Grammar: Link words (comparing/contrasting)',
      'Project: Profile of teenagers (Then vs Now)'
    ]
  },
  {
    id: 'eng_2as_lit_u2',
    code: 'ENG-2AS-LIT-U2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'آداب وفلسفة',
    domain: 'Peace and Conflict',
    unit: 'Make Peace',
    lessonTitle: 'Peace & Conflict (Extended)',
    suggestedDuration: 18,
    targetCompetencies: ['Similar to Science but more focus on writing/literature']
  },
  {
    id: 'eng_2as_lit_u3',
    code: 'ENG-2AS-LIT-U3',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'آداب وفلسفة',
    domain: 'Poverty and World Resources',
    unit: 'Waste not, Want not',
    lessonTitle: 'Resources & Poverty',
    suggestedDuration: 24,
    targetCompetencies: ['Similar to Science stream']
  },
  {
    id: 'eng_2as_lit_u4_1',
    code: 'ENG-2AS-LIT-U4-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'آداب وفلسفة',
    domain: 'Technology and the Arts',
    unit: 'Fiction or Reality',
    lessonTitle: 'Science Fiction',
    suggestedDuration: 10,
    targetCompetencies: [
      'Explain concept of Science Fiction',
      'Grammar: Conditionals Type 2 & 3',
      'Grammar: If only / I wish',
      'Write a sci-fi story or article'
    ]
  },
  {
    id: 'eng_2as_lit_u5',
    code: 'ENG-2AS-LIT-U5',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'آداب وفلسفة',
    domain: 'Disasters and Safety',
    unit: 'No Man is an Island',
    lessonTitle: 'Safety & Disasters',
    suggestedDuration: 20,
    targetCompetencies: ['Similar to Science stream']
  },

  // ==========================================
  // ENGLISH 2AS (Foreign Languages - لغات أجنبية)
  // ==========================================
  {
    id: 'eng_2as_lang_u1',
    code: 'ENG-2AS-LANG-U1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'لغات أجنبية',
    domain: 'Diversity / Lifestyles',
    unit: 'Signs of the Time',
    lessonTitle: 'Lifestyles (Intensive)',
    suggestedDuration: 25,
    targetCompetencies: ['Extended vocabulary on culture', 'More focus on speaking']
  },
  {
    id: 'eng_2as_lang_u2',
    code: 'ENG-2AS-LANG-U2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'لغات أجنبية',
    domain: 'Peace and Conflict',
    unit: 'Make Peace',
    lessonTitle: 'Peace & Diplomacy',
    suggestedDuration: 25,
    targetCompetencies: ['UN Role', 'Diplomacy vocabulary']
  },
  {
    id: 'eng_2as_lang_u3',
    code: 'ENG-2AS-LANG-U3',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'لغات أجنبية',
    domain: 'Poverty and Resources',
    unit: 'Waste not, Want not',
    lessonTitle: 'Global Issues',
    suggestedDuration: 25,
    targetCompetencies: ['Global poverty', 'Resource management']
  },
  {
    id: 'eng_2as_lang_u4',
    code: 'ENG-2AS-LANG-U4',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'لغات أجنبية',
    domain: 'Technology and Innovation',
    unit: 'Budding Scientist',
    lessonTitle: 'Innovation & Progress',
    suggestedDuration: 20,
    targetCompetencies: ['Impact of technology', 'Scientific ethics']
  },
  {
    id: 'eng_2as_lang_u5',
    code: 'ENG-2AS-LANG-U5',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'لغات أجنبية',
    domain: 'Technology and the Arts',
    unit: 'Fiction or Reality',
    lessonTitle: 'Literature & Sci-Fi',
    suggestedDuration: 20,
    targetCompetencies: ['Analyzing fiction', 'Writing narratives']
  },
  {
    id: 'eng_2as_lang_u6',
    code: 'ENG-2AS-LANG-U6',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '2AS',
    stream: 'لغات أجنبية',
    domain: 'Disasters and Safety',
    unit: 'No Man is an Island',
    lessonTitle: 'Solidarity & Safety',
    suggestedDuration: 20,
    targetCompetencies: ['International solidarity', 'Safety reports']
  },

  // ==========================================
  // ENGLISH 3AS (Common Streams: Science, Maths, Tech, Eco)
  // ==========================================
  {
    id: 'eng_3as_sci_u1_1',
    code: 'ENG-3AS-SCI-U1-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'Ethics in Business',
    unit: 'Ill Gotten Gains Never Prosper',
    lessonTitle: 'Corruption & Fraud',
    suggestedDuration: 8,
    targetCompetencies: [
      'Define ethics in business',
      'Grammar: Expressing condition (Provided that/as long as)',
      'Grammar: Wish and Desire (It’s high time)',
      'Lexis: Fraud, Corruption, Money Laundering'
    ]
  },
  {
    id: 'eng_3as_sci_u1_2',
    code: 'ENG-3AS-SCI-U1-L2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'Ethics in Business',
    unit: 'Ill Gotten Gains Never Prosper',
    lessonTitle: 'Developing Skills: Argumentative Speech',
    suggestedDuration: 8,
    targetCompetencies: [
      'Write an opinion article about counterfeiting',
      'Grammar: Advising (Should, Ought to, Had better)',
      'Grammar: Cause/Effect (so...that, consequently)',
      'Project: Charter of Ethics'
    ]
  },
  {
    id: 'eng_3as_sci_u2_1',
    code: 'ENG-3AS-SCI-U2-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'Advertising, Consumers and Safety',
    unit: 'Safety First',
    lessonTitle: 'Advertising & Food Safety',
    suggestedDuration: 12,
    targetCompetencies: [
      'Discuss impact of advertising',
      'Grammar: Probability (May, Might, Can)',
      'Grammar: Conditionals Type 1',
      'Lexis: Consumption, Safety, Organic food'
    ]
  },
  {
    id: 'eng_3as_sci_u2_2',
    code: 'ENG-3AS-SCI-U2-L2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'Advertising, Consumers and Safety',
    unit: 'Safety First',
    lessonTitle: 'Developing Skills: Persuasion',
    suggestedDuration: 12,
    targetCompetencies: [
      'Write a letter of complaint',
      'Make a survey on eating habits',
      'Grammar: Imperatives & Persuasion techniques',
      'Project: Booklet on Food Safety'
    ]
  },
  {
    id: 'eng_3as_sci_u3_1',
    code: 'ENG-3AS-SCI-U3-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'Astronomy and the Solar System',
    unit: 'It’s a Giant Leap for Mankind',
    lessonTitle: 'Space & Solar System',
    suggestedDuration: 9,
    targetCompetencies: [
      'Describe solar system and planets',
      'Grammar: Conditionals (Unless, If)',
      'Grammar: Comparatives (Like, Unlike, Whereas)',
      'Lexis: Space, Dimensions, Satellites'
    ]
  },
  {
    id: 'eng_3as_sci_u3_2',
    code: 'ENG-3AS-SCI-U3-L2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'Astronomy and the Solar System',
    unit: 'It’s a Giant Leap for Mankind',
    lessonTitle: 'Developing Skills: Expository Writing',
    suggestedDuration: 9,
    targetCompetencies: [
      'Write an article about space exploration',
      'Expressing Concession (However, Although)',
      'Project: Astronomy Booklet'
    ]
  },
  {
    id: 'eng_3as_sci_u4_1',
    code: 'ENG-3AS-SCI-U4-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'علوم تجريبية',
    domain: 'Feelings and Emotions',
    unit: 'We are a Family',
    lessonTitle: 'Emotions & Humour',
    suggestedDuration: 18,
    targetCompetencies: [
      'Expressing feelings (Love, Anger, Friendship)',
      'Grammar: Articles with abstract nouns',
      'Grammar: Quantifiers (Each other, One another)',
      'Grammar: Forming adjectives/verbs (-ful, -en)',
      'Project: Booklet on coping with emotions'
    ]
  },

  // ==========================================
  // ENGLISH 3AS (Literature & Philosophy / Foreign Languages)
  // ==========================================
  {
    id: 'eng_3as_lit_u1_1',
    code: 'ENG-3AS-LIT-U1-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'Exploring the Past',
    unit: 'Ancient Civilizations',
    lessonTitle: 'Rise & Fall of Civilizations',
    suggestedDuration: 14,
    targetCompetencies: [
      'Identify major ancient civilizations',
      'Describe past habits (Used to)',
      'Grammar: Past Simple vs Past Perfect',
      'Lexis: Archaeology, History, Myths'
    ]
  },
  {
    id: 'eng_3as_lit_u1_2',
    code: 'ENG-3AS-LIT-U1-L2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'Exploring the Past',
    unit: 'Ancient Civilizations',
    lessonTitle: 'Developing Skills: Historical Account',
    suggestedDuration: 14,
    targetCompetencies: [
      'Write a historical account of a civilization',
      'Grammar: Concession (Though, In spite of)',
      'Grammar: Quantifiers (Few, Little)',
      'Project: Booklet on Ancient Civilizations'
    ]
  },
  {
    id: 'eng_3as_lit_u2_1',
    code: 'ENG-3AS-LIT-U2-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'Ethics in Business',
    unit: 'Ill Gotten Gains Never Prosper',
    lessonTitle: 'Ethics & Corruption (Extended)',
    suggestedDuration: 28,
    targetCompetencies: [
      'Similar to Science stream but deeper analysis',
      'Focus on argumentative writing',
      'Defending a point of view on ethics'
    ]
  },
  {
    id: 'eng_3as_lit_u3_1',
    code: 'ENG-3AS-LIT-U3-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'Education in the World',
    unit: 'Schools: Different and Alike',
    lessonTitle: 'Comparing Educational Systems',
    suggestedDuration: 14,
    targetCompetencies: [
      'Compare different school systems',
      'Grammar: Present Passive',
      'Grammar: Conditionals (1, 2, 3)',
      'Lexis: Education, Curriculum, Exams'
    ]
  },
  {
    id: 'eng_3as_lit_u3_2',
    code: 'ENG-3AS-LIT-U3-L2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'Education in the World',
    unit: 'Schools: Different and Alike',
    lessonTitle: 'Developing Skills: Educational Report',
    suggestedDuration: 14,
    targetCompetencies: [
      'Write an expository article on exam stress',
      'Expressing Desire/Wish (I wish, If only)',
      'Project: School Website / Brochure'
    ]
  },
  {
    id: 'eng_3as_lit_u4_1',
    code: 'ENG-3AS-LIT-U4-L1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'آداب وفلسفة',
    domain: 'Feelings and Emotions',
    unit: 'We are a Family',
    lessonTitle: 'Emotions & Literature',
    suggestedDuration: 28,
    targetCompetencies: [
      'Analyze literary texts about emotions',
      'Grammar: Emotional adjectives',
      'Expressing feelings in different cultures'
    ]
  },

  // ==========================================
  // ENGLISH 3AS (Foreign Languages - Mirrors Lit/Phil mostly)
  // ==========================================
  {
    id: 'eng_3as_lang_u1',
    code: 'ENG-3AS-LANG-U1',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'لغات أجنبية',
    domain: 'Exploring the Past',
    unit: 'Ancient Civilizations',
    lessonTitle: 'Ancient Civilizations (Intensive)',
    suggestedDuration: 28,
    targetCompetencies: ['Detailed historical analysis', 'Myths and Legends']
  },
  {
    id: 'eng_3as_lang_u2',
    code: 'ENG-3AS-LANG-U2',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'لغات أجنبية',
    domain: 'Ethics in Business',
    unit: 'Ill Gotten Gains Never Prosper',
    lessonTitle: 'Business Ethics',
    suggestedDuration: 28,
    targetCompetencies: ['Ethics case studies', 'Debate on corruption']
  },
  {
    id: 'eng_3as_lang_u3',
    code: 'ENG-3AS-LANG-U3',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'لغات أجنبية',
    domain: 'Education in the World',
    unit: 'Schools: Different and Alike',
    lessonTitle: 'Global Education',
    suggestedDuration: 28,
    targetCompetencies: ['Comparative education', 'Educational challenges']
  },
  {
    id: 'eng_3as_lang_u4',
    code: 'ENG-3AS-LANG-U4',
    cycle: 'secondary',
    subject: 'لغة إنجليزية',
    level: '3AS',
    stream: 'لغات أجنبية',
    domain: 'Feelings and Emotions',
    unit: 'We are a Family',
    lessonTitle: 'Feelings & Relations',
    suggestedDuration: 28,
    targetCompetencies: ['Humour and satire', 'Cross-cultural emotions']
  },

  // --- INFORMATICS 1AS (SCIENCE/TECH) ---
  // ... (Existing Informatics Curriculum kept as is) ...
  {
    id: 'info_1as_d1_u1',
    code: 'INFO-1AS-D1-U1',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'بيئة التعامل مع الحاسوب',
    unit: 'تقنية المعلومات',
    lessonTitle: 'مفاهيم أساسية في تكنولوجيا المعلومات',
    suggestedDuration: 2,
    targetCompetencies: [
      'يتعرف على مفهوم تكنولوجيا الإعلام والاتصال TIC',
      'يتعرف على مفهوم المعلوماتية',
      'يتعرف على مراحل تطور تقنية المعلومات IT',
      'يميز بين البيانات والمعلومات'
    ],
    performanceIndicators: [
      'يذكر تعريف المعلوماتية بدقة',
      'يعدد مراحل تطور تقنية المعلومات',
      'يستنتج أهمية تكنولوجيا الإعلام والاتصال في الحياة اليومية'
    ]
  },
  {
    id: 'info_1as_lit_d1_u1',
    code: 'INFO-1AS-LIT-D1-U1',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'بيئة التعامل مع الحاسوب',
    unit: 'تقنية المعلومات',
    lessonTitle: 'مفاهيم أساسية في تكنولوجيا المعلومات',
    suggestedDuration: 2,
    targetCompetencies: [
      'يتعرف على مفهوم تكنولوجيا الإعلام والاتصال TIC',
      'يتعرف على مفهوم المعلوماتية',
      'يتعرف على مراحل تطور تقنية المعلومات'
    ],
    performanceIndicators: [
      'يميز بين البيانات والمعلومات',
      'يذكر أهم الميادين التي استفادت من التطور التكنولوجي'
    ]
  },
  {
    id: 'info_1as_lit_d1_u2',
    code: 'INFO-1AS-LIT-D1-U2',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'بيئة التعامل مع الحاسوب',
    unit: 'تجميع الحاسوب',
    lessonTitle: 'مكونات الحاسوب وكيفية تجميعها',
    suggestedDuration: 4,
    targetCompetencies: [
      'يتعرف على مواضع كل المكونات وكيفية توصيلها',
      'يميز بين وحدات الإدخال والإخراج والمعالجة',
      'يفهم مبدأ عمل الذاكرة والمعالج'
    ],
    performanceIndicators: [
      'يذكر مراحل تركيب الحاسوب',
      'ينجز عمليات تحويل بين مختلف وحدات قياس الذاكرة',
      'يستخدم برمجية محاكاة لتركيب الحاسوب'
    ]
  },
  {
    id: 'info_1as_lit_d1_u3',
    code: 'INFO-1AS-LIT-D1-U3',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'بيئة التعامل مع الحاسوب',
    unit: 'نظام التشغيل',
    lessonTitle: 'تثبيت واعداد نظام التشغيل',
    suggestedDuration: 4,
    targetCompetencies: [
      'يتعرف على مفهوم نظام التشغيل',
      'يتعرف على مفهوم تثبيت نظام التشغيل',
      'يتعرف على مفهوم تقسيم القرص وتهيئته',
      'يتعرف على مختلف مراحل التثبيت'
    ],
    performanceIndicators: [
      'يذكر أهم وظائف نظام التشغيل',
      'ينفذ الإقلاع الأول في برنامج الإعداد (BIOS/Boot)',
      'يستعمل برنامج محاكاة لتثبيت النظام'
    ]
  },
  {
    id: 'info_1as_lit_d1_u4',
    code: 'INFO-1AS-LIT-D1-U4',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'بيئة التعامل مع الحاسوب',
    unit: 'لوحة التحكم',
    lessonTitle: 'إعدادات بيئة العمل (لوحة التحكم)',
    suggestedDuration: 1,
    targetCompetencies: [
      'يتعرف على لوحة التحكم',
      'يتعرف على العرض وخصائصه',
      'يتمكن من تغيير الخيارات الإقليمية وخيارات اللغة',
      'يتمكن من إنشاء حسابات مستخدمين وإدارة الصلاحيات'
    ],
    performanceIndicators: [
      'يغير لغة العرض وتنسيق الوقت',
      'ينشئ حساب مستخدم جديد ويحميه بكلمة مرور',
      'يزيل تثبيت برنامج بطريقة صحيحة'
    ]
  },
  {
    id: 'info_1as_lit_d1_u5',
    code: 'INFO-1AS-LIT-D1-U5',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'بيئة التعامل مع الحاسوب',
    unit: 'حماية الحاسوب',
    lessonTitle: 'الفيروسات وبرامج الحماية',
    suggestedDuration: 2,
    targetCompetencies: [
      'يتعرف على الفيروسات وأنواعها',
      'يتعلم كيفية تثبيت مضاد الفيروسات واستعماله',
      'يدرك أهمية التحديث الدوري لقاعدة البيانات'
    ],
    performanceIndicators: [
      'يذكر بعض أعراض الإصابة بالفيروس',
      'يقوم بفحص وحدة تخزين خارجية',
      'يعدد طرق الوقاية من الفيروسات'
    ]
  },
  {
    id: 'info_1as_lit_d1_u6',
    code: 'INFO-1AS-LIT-D1-U6',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'بيئة التعامل مع الحاسوب',
    unit: 'الشبكة المحلية',
    lessonTitle: 'إعداد واستغلال الشبكة المحلية',
    suggestedDuration: 4,
    targetCompetencies: [
      'يتعرف على معنى الشبكة المحلية',
      'يدرس المكونات المادية للشبكة المحلية (طوبولوجيا النجمة)',
      'يتمكن من إعداد الشبكة ومشاركة الموارد (طابعة، مجلدات)'
    ],
    performanceIndicators: [
      'يذكر الفرق بين المحول (Switch) والموزع (Hub)',
      'يقوم بمشاركة مجلد في شبكة محلية',
      'يستكشف الموارد المشتركة في الشبكة'
    ]
  },

  // Domain 2: المكتبية (Arts Stream) - Increased Hours
  {
    id: 'info_1as_lit_d2_u1',
    code: 'INFO-1AS-LIT-D2-U1',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'المكتبية',
    unit: 'معالج النصوص 1',
    lessonTitle: 'تحرير وثيقة متكاملة',
    suggestedDuration: 4,
    targetCompetencies: [
      'يتحكم في تحرير وثيقة متكاملة',
      'ينسق الفقرات والخطوط',
      'يدرج الجداول والصور والأشكال',
      'يتحكم في إعدادات الصفحة والطباعة'
    ],
    performanceIndicators: [
      'يكتب نصاً وينسقه باستعمال الأنماط',
      'يدرج جدولاً ويقوم بتنسيقه',
      'ينشئ استمارة معلومات وحفظها كقالب'
    ]
  },
  {
    id: 'info_1as_lit_d2_u2',
    code: 'INFO-1AS-LIT-D2-U2',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'المكتبية',
    unit: 'معالج النصوص 2',
    lessonTitle: 'دمج المراسلات',
    suggestedDuration: 4,
    targetCompetencies: [
      'يتعرف على مفهوم دمج المراسلات',
      'يتعرف على المستند الرئيسي ومصدر البيانات',
      'ينجز عملية الدمج'
    ],
    performanceIndicators: [
      'ينشئ قاعدة بيانات بسيطة',
      'يربط المستند الرئيسي بمصدر البيانات',
      'ينجز رسائل دعوة متعددة باستخدام الدمج'
    ]
  },
  {
    id: 'info_1as_lit_d2_u3',
    code: 'INFO-1AS-LIT-D2-U3',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'المكتبية',
    unit: 'جداول البيانات 1',
    lessonTitle: 'إنجاز مصنف وتنسيقه',
    suggestedDuration: 4,
    targetCompetencies: [
      'يتمكن من إنجاز مصنف يحوي جدولاً منسقاً',
      'يتعرف على التعامل مع أوراق العمل',
      'يكتب الصيغ ويدرج الدوال البسيطة والمنطقية (SI)'
    ],
    performanceIndicators: [
      'ينجز جدولاً لحساب المعدلات',
      'يستخدم الدالة الشرطية SI لتحديد الملاحظات',
      'ينسق الجدول شرطياً'
    ]
  },
  {
    id: 'info_1as_lit_d2_u4',
    code: 'INFO-1AS-LIT-D2-U4',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'المكتبية',
    unit: 'جداول البيانات 2',
    lessonTitle: 'فرز وترتيب البيانات',
    suggestedDuration: 2,
    targetCompetencies: [
      'يتمكن من فرز وترتيب البيانات حسب معيار أو أكثر'
    ],
    performanceIndicators: [
      'يفرز قائمة تلاميد حسب المعدل تنازلياً',
      'يرتب البيانات أبجدياً'
    ]
  },
  {
    id: 'info_1as_lit_d2_u5',
    code: 'INFO-1AS-LIT-D2-U5',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'المكتبية',
    unit: 'العروض التقديمية 1',
    lessonTitle: 'إنجاز عرض تقديمي وسائط',
    suggestedDuration: 4,
    targetCompetencies: [
      'ينجز عروضاً احترافية',
      'يدمج الصوت، الصور، والفيديو',
      'يتحكم في المراحل الانتقالية (Transitions) والحركات (Animations)'
    ],
    performanceIndicators: [
      'ينجز عرضاً للتعريف بمدينته',
      'يدرج الوسائط المتعددة في الشرائح'
    ]
  },
  {
    id: 'info_1as_lit_d2_u6',
    code: 'INFO-1AS-LIT-D2-U6',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'المكتبية',
    unit: 'العروض التقديمية 2',
    lessonTitle: 'الارتباطات التشعبية في العروض',
    suggestedDuration: 4,
    targetCompetencies: [
      'يتمكن من إدراج واستغلال الارتباطات التشعبية داخل العرض',
      'ينشئ أزرار تنقل تفاعلية'
    ],
    performanceIndicators: [
      'يصمم اختباراً تفاعلياً (QCM) باستخدام الروابط',
      'يتنقل بين الشرائح باستخدام الأزرار'
    ]
  },

  // Domain 3: تقنيات الويب (Arts Stream)
  {
    id: 'info_1as_lit_d3_u1',
    code: 'INFO-1AS-LIT-D3-U1',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'تقنيات الويب',
    unit: 'المتصفح',
    lessonTitle: 'أساسيات التصفح والبحث',
    suggestedDuration: 2,
    targetCompetencies: [
      'يتعرف على بعض المتصفحات',
      'يتمكن من الوصول إلى موقع إلكتروني',
      'يتدرب على طرق البحث المتقدم واستغلال النتائج'
    ],
    performanceIndicators: [
      'يستخدم محركات البحث بفعالية',
      'يحفظ الصفحات والمواقع المفضلة',
      'يبحث عن أهم المعالم السياحية في الجزائر'
    ]
  },
  {
    id: 'info_1as_lit_d3_u2',
    code: 'INFO-1AS-LIT-D3-U2',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'تقنيات الويب',
    unit: 'إنشاء صفحة ويب',
    lessonTitle: 'أساسيات لغة HTML',
    suggestedDuration: 8,
    targetCompetencies: [
      'يكتسب المتعلم معارف لغة HTML',
      'يتعرف على هيكل ملف HTML',
      'يتعرف على أهم الوسوم (نصوص، صور، روابط، جداول)'
    ],
    performanceIndicators: [
      'ينشئ صفحة ويب بسيطة',
      'ينسق النصوص ويدرج الصور',
      'ينشئ ارتباطات تشعبية بين الصفحات'
    ]
  },
  {
    id: 'info_1as_lit_d3_u3',
    code: 'INFO-1AS-LIT-D3-U3',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'تقنيات الويب',
    unit: 'استغلال أدوات التواصل',
    lessonTitle: 'شبكات التواصل الاجتماعي',
    suggestedDuration: 2,
    targetCompetencies: [
      'يتعرف على بعض أدوات التواصل الاجتماعي',
      'يدرك إيجابيات وسلبيات مواقع التواصل',
      'يتعرف على أخلاقيات الاستعمال'
    ],
    performanceIndicators: [
      'يعدد سلبيات وإيجابيات مواقع التواصل',
      'يذكر الأخلاقيات الملزمة للعمل الجماعي'
    ]
  },
  {
    id: 'info_1as_lit_d3_u4',
    code: 'INFO-1AS-LIT-D3-U4',
    cycle: 'secondary',
    subject: 'معلوماتية',
    level: '1AS',
    stream: 'جذع مشترك آداب',
    domain: 'تقنيات الويب',
    unit: 'البريد الإلكتروني',
    lessonTitle: 'إنشاء واستغلال البريد الإلكتروني',
    suggestedDuration: 2,
    targetCompetencies: [
      'يتمكن من إنشاء واستعمال حساب بريد إلكتروني',
      'يتعرف على مكونات عنوان البريد',
      'يرسل ويستقبل الرسائل مع المرفقات'
    ],
    performanceIndicators: [
      'ينشئ حساب بريد إلكتروني',
      'يرسل رسالة إلى زميل مع صورة مرفقة'
    ]
  },
  
  // --- CIVIL ENGINEERING 1AS (Common Core Science & Technology) ---
  {
    id: 'civ_1as_theory_u1',
    code: 'CIV-1AS-TH-U1',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'الجزء النظري',
    unit: 'اإلطالع على ميدان الهندسة المدنية',
    lessonTitle: 'تعريف وتصنيف منشآت الهندسة المدنية واختيار الأرض',
    suggestedDuration: 2,
    targetCompetencies: [
      'يتعرف على الهندسة المدنية ومكانتها',
      'يصنف مختلف منشآت الهندسة المدنية',
      'يتعرف على العوامل المختلفة لاختيار قطعة أرض للبناء'
    ],
    performanceIndicators: [
      'يحدد مكانة الهندسة المدنية',
      'يصنف المنشآت انطلاقاً من صور (مباني، جسور، طرق...)',
      'يلخص مراحل الحصول على قطعة أرض',
      'يناقش العوامل: الموقع، نوعية التربة، التهيئة'
    ]
  },
  {
    id: 'civ_1as_theory_u2',
    code: 'CIV-1AS-TH-U2',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'الجزء النظري',
    unit: 'رخصة البناء',
    lessonTitle: 'الملف الإداري والتقني لرخصة البناء',
    suggestedDuration: 1,
    targetCompetencies: [
      'يتعرف على مختلف الوثائق المكونة لملف رخصة البناء',
      'يدرك أهمية رخصة البناء وطريقة الحصول عليها'
    ],
    performanceIndicators: [
      'يميز بين الوثائق المكتوبة (الطلب، الكشوف، العقد) والوثائق الخطية (المخططات)',
      'يحدد دور المتدخلين (صاحب المشروع، مكتب الدراسات، البلدية)',
      'ينجز مخططاً بيانيا لمراحل الحصول على الرخصة'
    ]
  },
  {
    id: 'civ_1as_theory_u3',
    code: 'CIV-1AS-TH-U3',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'الجزء النظري',
    unit: 'الرسم المدعم بالحاسوب',
    lessonTitle: 'أساسيات البرنامج وتمثيل المحاور والأعمدة',
    suggestedDuration: 2,
    targetCompetencies: [
      'يكتشف واجهة برنامج الرسم المدعم بالحاسوب',
      'يستغل البرنامج لتمثيل العناصر البسيطة'
    ],
    performanceIndicators: [
      'يشغل البرنامج ويفتح دورة عمل',
      'يميز أشرطة الأدوات',
      'يوظف أوامر الرسم والتغيير لتمثيل المحاور والأعمدة'
    ]
  },
  {
    id: 'civ_1as_theory_u4',
    code: 'CIV-1AS-TH-U4',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'الجزء النظري',
    unit: 'الرسم المدعم بالحاسوب',
    lessonTitle: 'تمثيل الجدران والفتحات (أبواب ونوافذ)',
    suggestedDuration: 2,
    targetCompetencies: [
      'يتعرف على الجدران وأنواعها',
      'يتعرف على الفتحات وأدوارها',
      'يستغل البرنامج لتمثيل الجدران والفتحات'
    ],
    performanceIndicators: [
      'يستخلص أدوار الجدران (الرئيسية والثانوية)',
      'يستخدم أوامر الرسم (Ligne, Arc) والتعديل لرسم الجدران والفتحات بدقة'
    ]
  },
  {
    id: 'civ_1as_prac_u1',
    code: 'CIV-1AS-PR-U1',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'الجزء التطبيقي',
    unit: 'مخطط التوزيع',
    lessonTitle: 'اقتراح مخطط توزيع واستغلال قطعة أرض',
    suggestedDuration: 2,
    targetCompetencies: [
      'يستغل قطعة أرض للبناء',
      'يقترح مخطط توزيع يحترم المعايير'
    ],
    performanceIndicators: [
      'يقرأ مخطط الكتلة',
      'يناقش مواصفات المشروع (الواجهات، المحيط)',
      'يشرح ويبرر المخطط المقترح'
    ]
  },
  {
    id: 'civ_1as_prac_u2',
    code: 'CIV-1AS-PR-U2',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'الجزء التطبيقي',
    unit: 'مخطط التوزيع',
    lessonTitle: 'رسم المحاور، الأعمدة والجدران (DAO)',
    suggestedDuration: 4,
    targetCompetencies: [
      'يرسم المحاور والأعمدة والجدران بدقة باستعمال الحاسوب'
    ],
    performanceIndicators: [
      'يستحدث منسوخات (Calques) بخصائص مختلفة (لون، سمك)',
      'يطبق أوامر (Ligne, Polyligne, Décaler, Ajuster, Copier)',
      'يستخدم تعليمة Accrochage للتدقيق'
    ]
  },
  {
    id: 'civ_1as_prac_u3',
    code: 'CIV-1AS-PR-U3',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'الجزء التطبيقي',
    unit: 'مخطط التوزيع',
    lessonTitle: 'رسم الأبواب والنوافذ والإنهاء (DAO)',
    suggestedDuration: 2,
    targetCompetencies: [
      'يكمل رسم المخطط بتمثيل الفتحات'
    ],
    performanceIndicators: [
      'يستحدث منسوخ الفتحات',
      'يرسم الرموز الاصطلاحية للأبواب والنوافذ',
      'يحفظ ملف الرسم النهائي'
    ]
  },

  // --- CIVIL ENGINEERING 2AS & 3AS (Placeholder for existing content if any) ---
  // ... (Existing CE content preserved) ...
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
