
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

// --- OFFICIAL ALGERIAN CURRICULUM DATA ---
export const ALGERIAN_CURRICULUM: CurriculumStandard[] = [
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
  // ... (Keep existing informatics items) ...
  
  // --- CIVIL ENGINEERING 1AS & 2AS (Existing) ---
  {
    id: 'civ_1as_d1_u1',
    code: 'CIV-1AS-D1-U1',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '1AS',
    stream: 'جذع مشترك علوم وتكنولوجيا',
    domain: 'الجزء النظري',
    unit: 'اإلطالع على ميدان الهندسة المدنية',
    lessonTitle: 'تعريف وتصنيف منشآت الهندسة المدنية',
    suggestedDuration: 1,
    targetCompetencies: [
      'يتعرف على الهندسة المدنية ومكانتها',
      'يصنف مختلف منشآت الهندسة المدنية',
      'يتعرف على العوامل المختلفة لاختيار قطعة أرض للبناء'
    ],
    performanceIndicators: [
      'يحدد مكانة الهندسة المدنية في الاقتصاد',
      'يصنف المنشآت انطلاقاً من صور (مباني، جسور، طرق...)',
      'يقرأ مخطط الموقع ويستخرج المعلومات الأساسية'
    ]
  },
  {
    id: 'civ_2as_d1_u1',
    code: 'CIV-2AS-D1-U1',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '2AS',
    stream: 'تقني رياضي',
    domain: 'البناء',
    unit: 'عموميات على الهندسة المدنية',
    lessonTitle: 'مدخل لميدان الهندسة المدنية والملف التقني',
    suggestedDuration: 12,
    targetCompetencies: [
      'يحلل هياكل المهنة والمتدخلون في البناء',
      'يدرس ملف تقني لمشروع',
      'يضبط المؤسسة ومحيطها'
    ],
    performanceIndicators: [
      'يصنف مختلف منشآت الهندسة المدنية',
      'يدرك أدوار مختلف المتدخلين (صاحب المشروع، المقاول...)',
      'يميز وثائق الملف التقني (المخططات، الكشوف)',
      'ينجز مخططاً حول كيفية تدخل مؤسسة البناء'
    ]
  },
  // ... (Keep other 1AS and 2AS items) ...

  // --- CIVIL ENGINEERING 3AS (Technical Math) ---
  
  // Domain 1: البناء (Construction)
  {
    id: 'civ_3as_d1_u1',
    code: 'CIV-3AS-D1-U1',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'البناء',
    unit: 'المنشأ العلوي',
    lessonTitle: 'عناصر المنشأ العلوي (أعمدة، روافد، أرضيات)',
    suggestedDuration: 14,
    targetCompetencies: [
      'يدرس مختلف عناصر المنشآت العلوية',
      'يميز أدوار عناصر المنشأ العلوي'
    ],
    performanceIndicators: [
      'يسمي عناصر المنشأ العلوي',
      'يصنف العناصر حسب مادة الصنع وشكل المقطع',
      'يحسب أبعاد مدرج مستقيم',
      'يصمم مدرج مستقيم'
    ]
  },
  {
    id: 'civ_3as_d1_u2',
    code: 'CIV-3AS-D1-U2',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'البناء',
    unit: 'عموميات حول الطبوغرافيا',
    lessonTitle: 'حساب المساحات (الإحداثيات القطبية والديكارتية)',
    suggestedDuration: 10,
    targetCompetencies: [
      'يقترح طريقة لحساب المساحات',
      'يتحكم في المبادئ الرياضية لحساب المثلثات'
    ],
    performanceIndicators: [
      'يحسب السمت الإحداثي',
      'يحسب مساحة مضلع بطريقة الإحداثيات الديكارتية',
      'يحسب مساحة مضلع بطريقة الإحداثيات القطبية',
      'يحل إشكالية تجزئة مساحة'
    ]
  },
  {
    id: 'civ_3as_d1_u3',
    code: 'CIV-3AS-D1-U3',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'البناء',
    unit: 'الطرق',
    lessonTitle: 'تخطيط مشروع طريق (المظاهر العرضية والطولية)',
    suggestedDuration: 16,
    targetCompetencies: [
      'يساهم في تخطيط مشروع طريق',
      'يتعرف على مختلف مكونات القارعة'
    ],
    performanceIndicators: [
      'يعدد ويبين أدوار العناصر المكونة للطريق',
      'يحسب ويمثل المظهر الطولي',
      'يحسب ويمثل المظهر العرضي النموذجي',
      'يقارن مختلف طبقات قارعة الطريق'
    ]
  },
  {
    id: 'civ_3as_d1_u4',
    code: 'CIV-3AS-D1-U4',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'البناء',
    unit: 'الجسور',
    lessonTitle: 'تعريف وتصنيف الجسور',
    suggestedDuration: 12,
    targetCompetencies: [
      'يميز بين مختلف العناصر المكونة للجسور',
      'يصنف الجسور حسب المادة والشكل'
    ],
    performanceIndicators: [
      'يسمي العناصر الأساسية والثانوية للجسر',
      'يكتشف دور كل عنصر',
      'يميز بين الجسور المعدنية والخرسانية'
    ]
  },

  // Domain 2: ميكانيك مطبقة (Applied Mechanics)
  {
    id: 'civ_3as_d2_u1',
    code: 'CIV-3AS-D2-U1',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'ميكانيك مطبقة',
    unit: 'مقاومة المواد',
    lessonTitle: 'التحريضات البسيطة (الشد، الانضغاط، القص)',
    suggestedDuration: 14,
    targetCompetencies: [
      'يتعرف على مجال تطبيق مقاومة المواد',
      'يتحقق من شرط المقاومة لعناصر معرضة لتحريضات بسيطة'
    ],
    performanceIndicators: [
      'يميز بين مختلف أنواع الإجهادات (ناظمية، مماسية)',
      'يستغل منحنى تجربة الشد لاستنتاج قانون هوك',
      'يحسب الجهود والإجهادات ويتحقق من شرط المقاومة'
    ]
  },
  {
    id: 'civ_3as_d2_u2',
    code: 'CIV-3AS-D2-U2',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'ميكانيك مطبقة',
    unit: 'الأنظمة المثلثية',
    lessonTitle: 'حساب الجهود الداخلية في الأنظمة المثلثية',
    suggestedDuration: 8,
    targetCompetencies: [
      'يحسب الجهود الداخلية في القضبان',
      'يحسب أبعاد المقطع العرضي للقضبان'
    ],
    performanceIndicators: [
      'يتأكد من أن النظام محدد سكونياً',
      'يحسب ردود الأفعال',
      'يحسب الجهود الداخلية بطريقة عزل العقد',
      'يوظف شرط المقاومة لتحديد أبعاد القضبان'
    ]
  },
  {
    id: 'civ_3as_d2_u3',
    code: 'CIV-3AS-D2-U3',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'ميكانيك مطبقة',
    unit: 'الانحناء البسيط المستوي',
    lessonTitle: 'دراسة رافدة معرضة للانحناء البسيط',
    suggestedDuration: 16,
    targetCompetencies: [
      'يدرس رافدة معرضة للانحناء البسيط المستوي',
      'يرسم المنحنيات البيانية للجهود الداخلية'
    ],
    performanceIndicators: [
      'يكتب معادلات الجهد القاطع (T) وعزم الانحناء (Mf)',
      'يرسم المنحنيات البيانية لـ T و Mf',
      'يتحكم في حساب الإجهادات الناظمية والمماسية',
      'يوظف شرط المقاومة'
    ]
  },
  {
    id: 'civ_3as_d2_u4',
    code: 'CIV-3AS-D2-U4',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'ميكانيك مطبقة',
    unit: 'الخرسانة المسلحة',
    lessonTitle: 'قوانين BAEL (الشد والانضغاط)',
    suggestedDuration: 18,
    targetCompetencies: [
      'يطبق قوانين BAEL على عناصر محددة سكونياً',
      'يبرر المقاطع المعرضة للتحريضات الناظمية'
    ],
    performanceIndicators: [
      'يميز الحاالت النهائية (ELU, ELS)',
      'يحسب تسليح شداد (Tirant) خاضع للشد البسيط',
      'يحسب تسليح عمود (Poteau) خاضع للانضغاط البسيط'
    ]
  },

  // Domain 3: أعمال مؤطرة (Guided Works / TP)
  {
    id: 'civ_3as_d3_u1',
    code: 'CIV-3AS-D3-U1',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'أعمال مؤطرة',
    unit: 'مراجعة',
    lessonTitle: 'مراجعة السكون والخصائص الهندسية',
    suggestedDuration: 8,
    targetCompetencies: [
      'يحل إشكالية في علم السكون',
      'يحسب الخصائص الهندسية للمقاطع'
    ],
    performanceIndicators: [
      'يحسب محصلة القوى وردود الأفعال',
      'يحسب مركز الثقل وعزم العطالة لمقاطع مركبة'
    ]
  },
  {
    id: 'civ_3as_d3_u2',
    code: 'CIV-3AS-D3-U2',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'أعمال مؤطرة',
    unit: 'التجارب الميكانيكية',
    lessonTitle: 'تجارب الشد، الانضغاط والقص',
    suggestedDuration: 8,
    targetCompetencies: [
      'يحلل نتائج عملية تجريبية',
      'يستنتج خصائص المواد'
    ],
    performanceIndicators: [
      'يرسم منحنى الشد ويحدد المجاالت',
      'يستنتج معامل المرونة الطولي'
    ]
  },
  {
    id: 'civ_3as_d3_u3',
    code: 'CIV-3AS-D3-U3',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'أعمال مؤطرة',
    unit: 'الأنظمة المثلثية',
    lessonTitle: 'تطبيقات حول الأنظمة المثلثية واستعمال البرمجيات',
    suggestedDuration: 6,
    targetCompetencies: [
      'يطبق طريقة عزل العقد',
      'يستعمل البرمجيات للتحقق من النتائج'
    ],
    performanceIndicators: [
      'يحسب الجهود الداخلية يدوياً',
      'يتحقق من صحة النتائج باستخدام MD Solid أو برمجية مشابهة'
    ]
  },
  {
    id: 'civ_3as_d3_u4',
    code: 'CIV-3AS-D3-U4',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'أعمال مؤطرة',
    unit: 'الرسم المدعم بالحاسوب',
    lessonTitle: 'رسم مخططات التوزيع والمنشأ العلوي (DAO)',
    suggestedDuration: 10,
    targetCompetencies: [
      'يستغل برمجية الرسم لتمثيل الغماء والمخططات',
      'يرسم مقاطع عمودية'
    ],
    performanceIndicators: [
      'يمثل الغماء (Toiture) بشكل دقيق',
      'يرسم مخطط توزيع لطابق أرضي'
    ]
  },
  {
    id: 'civ_3as_d3_u5',
    code: 'CIV-3AS-D3-U5',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'أعمال مؤطرة',
    unit: 'الانحناء البسيط',
    lessonTitle: 'تجربة الانحناء البسيط وتطبيقات',
    suggestedDuration: 6,
    targetCompetencies: [
      'يحلل ويستغل نتائج تجربة الانحناء',
      'يحسب أبعاد رافدة'
    ],
    performanceIndicators: [
      'يفسر منحنى الانحناء',
      'يستعمل البرمجيات لحساب T و Mf'
    ]
  },
  {
    id: 'civ_3as_d3_u6',
    code: 'CIV-3AS-D3-U6',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'أعمال مؤطرة',
    unit: 'تطبيقات في الطبوغرافيا',
    lessonTitle: 'مراقبة المنشآت وحساب المساحات',
    suggestedDuration: 12,
    targetCompetencies: [
      'يطبق طرق حساب المساحات',
      'ينفذ طرق مراقبة المنشآت'
    ],
    performanceIndicators: [
      'يحسب المساحات بالطرق التحليلية',
      'يراقب شاقولية وأفقية العناصر في الميدان'
    ]
  },
  {
    id: 'civ_3as_d3_u7',
    code: 'CIV-3AS-D3-U7',
    cycle: 'secondary',
    subject: 'هندسة مدنية',
    level: '3AS',
    stream: 'تقني رياضي',
    domain: 'أعمال مؤطرة',
    unit: 'الطرق',
    lessonTitle: 'رسم المظاهر الطولية والعرضية (DAO)',
    suggestedDuration: 6,
    targetCompetencies: [
      'يتحكم في التمثيل البياني للطرق باستعمال الحاسوب'
    ],
    performanceIndicators: [
      'يرسم المظهر الطولي',
      'يرسم المظاهر العرضية'
    ]
  },

  // --- INFORMATICS 1AS (ARTS/LITERATURE) ---
  // ... (Existing items kept) ...
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
  // ... (Rest of existing items) ...
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
  }
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
