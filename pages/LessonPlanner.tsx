
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CLASSES, ALGERIAN_CURRICULUM, LESSON_TEMPLATES, LESSON_TYPE_LABELS, SUBJECT_FEATURES, RESOURCE_CATEGORY_LABELS } from '../constants';
import { Save, Printer, CheckCircle, Calendar, BookOpen, Sparkles, X, Plus, Clock, Target, Layers, FileText, Settings, PenTool, ExternalLink, Link as LinkIcon, ToggleLeft, ToggleRight, CheckSquare, Paperclip, Search, File as FileIcon, ArrowRightLeft, HelpCircle, BarChart3, Lightbulb, Check } from 'lucide-react';
import { LessonStatus, Lesson, LessonType, SubjectDetails, WaygroundConfig, TeacherReflection, Resource, DailyLogEntry, Question, QuestionType, DifficultyLevel } from '../types';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { getResourceSuggestions } from '../utils/resourceUtils';

export default function LessonPlanner() {
  const { id: editId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation(); 
  const curriculumIdFromUrl = searchParams.get('curriculumId');
  const classIdFromUrl = searchParams.get('classId'); 
  const navigate = useNavigate();
  const { user, currentContext } = useUser();
  const { lessons, updateLessons, curriculumItems, resources, dailyLogs, updateDailyLogs } = useData();
  
  const [showSavedAlert, setShowSavedAlert] = useState(false);
  const [saveMessage, setSaveMessage] = useState('تم حفظ الدرس بنجاح!');
  const [activeTab, setActiveTab] = useState<'content' | 'pedagogy' | 'homework' | 'reflection'>('pedagogy');

  // Resource Picker State
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [pickerTargetField, setPickerTargetField] = useState<keyof Lesson | null>(null);
  const [resourceSearch, setResourceSearch] = useState('');

  // Suggestions State
  const [suggestions, setSuggestions] = useState<Resource[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const filteredClasses = CLASSES.filter(c => 
    user.educationStage === 'HIGH' 
    ? user.levels.includes(c.gradeLevel)
    : user.levels.includes(c.gradeLevel)
  );

  const initialReflection: TeacherReflection = {
      studentActivation: 3,
      instructionsClarity: 3, 
      participationRate: 'AVERAGE',
      objectivesMet: false,
      contentAccuracy: true,
      planFollowed: true,
      timeManagement: true,
      activityBalance: true, 
      activityPacing: 'GOOD',
      unexpectedDifficulties: '',
      improvementPlan: ''
  };

  const initialData: Lesson = {
    id: `l_${Date.now()}`,
    title: '', 
    classIds: classIdFromUrl ? [classIdFromUrl] : [],
    curriculumId: 'unaffiliated',
    subject: currentContext.subject, 
    domain: '', 
    unit: '',
    type: LessonType.BUILD,
    date: new Date().toISOString().split('T')[0], 
    startTime: '08:00', 
    endTime: '09:00',
    duration: currentContext.features.defaultDuration || 60, 
    objectives: [], 
    prerequisites: '', 
    performanceIndicators: '',
    materials: '',
    learningSituation: '',
    theoreticalContent: LESSON_TEMPLATES[LessonType.BUILD].flow, 
    practicalContent: LESSON_TEMPLATES[LessonType.BUILD].activities, 
    homework: '', 
    homeworkDueDate: '',
    notes: '', 
    status: LessonStatus.PLANNED, 
    resourceIds: [],
    wayground: { isEnabled: false },
    reflection: initialReflection,
    subjectDetails: {
        civEngCriteria: []
    }
  };

  const [formData, setFormData] = useState<Lesson>(initialData);
  const [newObjective, setNewObjective] = useState('');

  // Update suggestions when form data changes significantly
  useEffect(() => {
      const sugs = getResourceSuggestions(formData, resources, curriculumItems);
      setSuggestions(sugs);
  }, [formData.title, formData.unit, formData.curriculumId, resources, curriculumItems]);

  // Update subject if creating new and context changes
  useEffect(() => {
      if (!editId && !location.state?.aiData && !curriculumIdFromUrl && !classIdFromUrl) {
          const defaultDuration = SUBJECT_FEATURES[currentContext.subject]?.defaultDuration || 60;
          setFormData(prev => ({
              ...prev, 
              subject: currentContext.subject,
              duration: defaultDuration
          }));
      }
  }, [currentContext.subject, editId, location.state, curriculumIdFromUrl, classIdFromUrl]);

  // Load Data logic
  useEffect(() => {
    if (editId) {
      const lessonToEdit = lessons.find(l => l.id === editId);
      if (lessonToEdit) {
        setFormData({
            ...initialData,
            ...lessonToEdit,
            subject: lessonToEdit.subject || currentContext.subject || '',
            type: lessonToEdit.type || LessonType.BUILD,
            duration: lessonToEdit.duration || (SUBJECT_FEATURES[lessonToEdit.subject || '']?.defaultDuration || 60),
            subjectDetails: { ...initialData.subjectDetails, ...lessonToEdit.subjectDetails },
            wayground: lessonToEdit.wayground || { isEnabled: false },
            reflection: { ...initialReflection, ...lessonToEdit.reflection }
        });
      }
    } else if (location.state?.aiData) {
      // Logic for AI Generated Data
      const ai = location.state.aiData;
      setFormData(prev => ({
        ...prev,
        title: ai.title || '',
        subject: ai.subject || prev.subject,
        domain: ai.domain || '',
        unit: ai.unit || '',
        objectives: ai.objectives || [],
        prerequisites: ai.prerequisites || '',
        learningSituation: ai.learningSituation || '',
        theoreticalContent: ai.theoreticalContent || '',
        practicalContent: ai.practicalContent || '',
        homework: ai.homework || ''
      }));
      window.history.replaceState({}, document.title);
    } else if (curriculumIdFromUrl) {
      // Pre-fill from specific Curriculum ID
      const standard = curriculumItems.find(c => c.id === curriculumIdFromUrl);
      if (standard) {
        const existingCount = lessons.filter(l => l.curriculumId === standard.id).length;
        const titleSuffix = existingCount > 0 ? ` (${existingCount + 1})` : '';
        const standardDuration = SUBJECT_FEATURES[standard.subject]?.defaultDuration || 60;

        setFormData(prev => ({
            ...prev,
            curriculumId: standard.id,
            subject: standard.subject,
            title: `${standard.lessonTitle}${titleSuffix}`, 
            objectives: standard.targetCompetencies || [], 
            performanceIndicators: (standard.performanceIndicators || []).join('\n'),
            domain: standard.domain, 
            unit: standard.unit, 
            duration: standardDuration,
            learningSituation: existingCount === 0 ? 'وضعية انطلاق مقترحة: ...' : 'مراجعة الحصة السابقة...',
        }));
      }
    } else if (classIdFromUrl) {
        const cls = CLASSES.find(c => c.id === classIdFromUrl);
        if (cls) {
            const lastLesson = lessons
                .filter(l => l.classIds.includes(classIdFromUrl) && l.subject === currentContext.subject)
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            
            let nextStandard = null;

            if (lastLesson && lastLesson.curriculumId !== 'unaffiliated') {
                const currIndex = curriculumItems.findIndex(c => c.id === lastLesson.curriculumId);
                if (currIndex !== -1 && currIndex < curriculumItems.length - 1) {
                    nextStandard = curriculumItems[currIndex + 1];
                }
            } else {
                // Find the first item in curriculum that matches Grade Level AND Stream
                nextStandard = curriculumItems.find(c => 
                    c.level === cls.gradeLevel && 
                    c.subject === currentContext.subject && 
                    (!c.stream || c.stream === cls.stream)
                );
            }

            if (nextStandard) {
                 const standardDuration = SUBJECT_FEATURES[nextStandard.subject]?.defaultDuration || 60;
                 setFormData(prev => ({
                    ...prev,
                    curriculumId: nextStandard!.id,
                    subject: nextStandard!.subject,
                    title: nextStandard!.lessonTitle,
                    objectives: nextStandard!.targetCompetencies || [],
                    performanceIndicators: (nextStandard!.performanceIndicators || []).join('\n'),
                    domain: nextStandard!.domain,
                    unit: nextStandard!.unit,
                    duration: standardDuration,
                    learningSituation: 'وضعية انطلاق مقترحة: ...'
                 }));
            }
        }
    }
  }, [editId, curriculumIdFromUrl, classIdFromUrl, lessons, navigate, location.state, curriculumItems]);

  const handleChange = (field: keyof Lesson, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReflectionChange = (field: keyof TeacherReflection, value: any) => {
      setFormData(prev => ({
          ...prev,
          reflection: {
              ...(prev.reflection || initialReflection),
              [field]: value
          }
      }));
  };

  const handleWaygroundChange = (field: keyof WaygroundConfig, value: any) => {
      setFormData(prev => ({
          ...prev,
          wayground: {
              ...(prev.wayground || { isEnabled: false }),
              [field]: value
          }
      }));
  };

  const handleTypeChange = (newType: LessonType) => {
      const template = LESSON_TEMPLATES[newType];
      // Type casting to avoid "unknown" error, assuming LESSON_TEMPLATES values have consistent structure
      const isContentEmpty = !formData.theoreticalContent || formData.theoreticalContent.trim() === '' || Object.values(LESSON_TEMPLATES).some((t: any) => t.flow === formData.theoreticalContent);
      const isPracticalEmpty = !formData.practicalContent || formData.practicalContent.trim() === '' || Object.values(LESSON_TEMPLATES).some((t: any) => t.activities === formData.practicalContent);

      setFormData(prev => ({
          ...prev,
          type: newType,
          theoreticalContent: isContentEmpty ? template.flow : prev.theoreticalContent,
          practicalContent: isPracticalEmpty ? template.activities : prev.practicalContent
      }));
  };

  const toggleClass = (classId: string) => {
    setFormData(prev => {
      const current = prev.classIds || [];
      const updated = current.includes(classId)
        ? current.filter(id => id !== classId)
        : [...current, classId];
      return { ...prev, classIds: updated };
    });
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  // --- Resource Linking Logic ---
  const filteredResources = useMemo(() => {
      return resources.filter(r => 
          (r.subject === formData.subject || !r.subject) &&
          (r.title.toLowerCase().includes(resourceSearch.toLowerCase()) || r.tags.some(t => t.includes(resourceSearch)))
      );
  }, [resources, formData.subject, resourceSearch]);

  const handleAttachResource = (res: Resource) => {
      if (!pickerTargetField) return;

      const currentIds = formData.resourceIds || [];
      const newIds = currentIds.includes(res.id) ? currentIds : [...currentIds, res.id];

      const refText = `\n[📎 ${RESOURCE_CATEGORY_LABELS[res.category]}: ${res.title}]`;
      const newText = (formData[pickerTargetField] as string || '') + refText;

      setFormData(prev => ({
          ...prev,
          resourceIds: newIds,
          [pickerTargetField]: newText
      }));

      setShowResourcePicker(false);
      setPickerTargetField(null);
  };

  const handleAddSuggestion = (res: Resource) => {
      // Intelligent Insertion based on Active Tab
      const currentIds = formData.resourceIds || [];
      if (currentIds.includes(res.id)) return; // Already added

      const newIds = [...currentIds, res.id];
      const refText = `\n[📎 ${RESOURCE_CATEGORY_LABELS[res.category]}: ${res.title}]`;
      
      let targetField: keyof Lesson = 'notes';
      let message = 'الملاحظات';

      if (activeTab === 'content') {
          targetField = 'theoreticalContent';
          message = 'محتوى الدرس';
      } else if (activeTab === 'homework') {
          targetField = 'homework';
          message = 'الواجبات';
      }

      setFormData(prev => ({
          ...prev,
          resourceIds: newIds,
          [targetField]: (prev[targetField] as string || '') + refText
      }));

      setSaveMessage(`تم إضافة "${res.title}" إلى ${message}`);
      setShowSavedAlert(true);
      setTimeout(() => setShowSavedAlert(false), 2000);
  };

  const openResourcePicker = (field: keyof Lesson) => {
      setPickerTargetField(field);
      setShowResourcePicker(true);
  };

  const handleGenerateAssessment = () => {
      if (!formData.performanceIndicators) {
          alert('يرجى تعبئة مؤشرات الأداء أولاً لتوليد الأسئلة.');
          return;
      }
      const lines = formData.performanceIndicators.split('\n').filter(l => l.trim().length > 3);
      if (lines.length === 0) {
          alert('لا توجد مؤشرات صالحة.');
          return;
      }
      const generatedQuestions: Question[] = lines.map((indicator, idx) => {
          let cleanText = indicator.replace(/^[-\u2022*]\s*/, '').trim();
          cleanText = cleanText.replace(/^أن\s/, ''); 
          return {
              id: `q_gen_${Date.now()}_${idx}`,
              text: `وضح / اشرح: ${cleanText}`, 
              type: QuestionType.TEXT,
              points: 2,
              difficulty: DifficultyLevel.MEDIUM,
              modelAnswer: '',
              gradingRubric: 'تقييم مدى تحقيق المؤشر: ' + cleanText
          };
      });
      if (confirm(`تم استخراج ${generatedQuestions.length} سؤال مقترح بناءً على المؤشرات. الانتقال لبناء الاختبار؟`)) {
          navigate('/assessments/new', { 
              state: { 
                  generatedQuestions,
                  sourceLesson: {
                      title: formData.title,
                      subject: formData.subject,
                      level: formData.classIds.length > 0 ? CLASSES.find(c => c.id === formData.classIds[0])?.gradeLevel : '1AS'
                  }
              } 
          });
      }
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert("يرجى إدخال عنوان الدرس");
      return;
    }
    if (formData.classIds.length === 0) {
      alert("يرجى اختيار قسم واحد على الأقل");
      return;
    }

    let updatedLessons;
    if (editId) {
       updatedLessons = lessons.map(l => l.id === editId ? formData : l);
    } else {
       updatedLessons = [...lessons, formData];
    }
    updateLessons(updatedLessons);

    let logSyncMsg = '';
    if (formData.status === LessonStatus.COMPLETED) {
        let currentLogs = [...dailyLogs];
        let logsUpdated = false;
        formData.classIds.forEach(classId => {
            const existingLogIndex = currentLogs.findIndex(l => l.lessonId === formData.id && l.classId === classId);
            const logContent = `إنجاز درس: ${formData.title}.\n${formData.objectives.length > 0 ? 'الأهداف: ' + formData.objectives.slice(0,3).join(' - ') : ''}`;
            const logObservation = formData.homework ? `الواجب: ${formData.homework}` : '';

            if (existingLogIndex > -1) {
                currentLogs[existingLogIndex] = {
                    ...currentLogs[existingLogIndex],
                    topic: formData.title,
                    date: formData.date,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    contentSummary: logContent,
                    observations: logObservation || currentLogs[existingLogIndex].observations
                };
                logsUpdated = true;
            } else {
                const newLog: DailyLogEntry = {
                    id: `dl_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    date: formData.date,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    classId: classId,
                    lessonId: formData.id,
                    topic: formData.title,
                    contentSummary: logContent,
                    absentees: '',
                    observations: logObservation
                };
                currentLogs = [newLog, ...currentLogs];
                logsUpdated = true;
            }
        });
        if (logsUpdated) {
            updateDailyLogs(currentLogs);
            logSyncMsg = ' + تم الترحيل للدفتر اليومي';
        }
    }

    setSaveMessage(`تم حفظ الدرس بنجاح${logSyncMsg}!`);
    setShowSavedAlert(true);
    setTimeout(() => {
      setShowSavedAlert(false);
      if (!editId) {
        navigate(`/lessons/${formData.id}/edit`, { replace: true });
      }
    }, 2000);
  };
  
  const handlePrint = () => editId && navigate(`/lessons/${editId}/print`);

  return (
    <div className="space-y-6 pb-20">
      {/* ... (Existing JSX Render - Buttons, Headers etc. No changes needed in UI structure) */}
      {/* ... The rest of the file content matches existing file ... */}
      {showSavedAlert && (<div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-[60] flex items-center gap-2 animate-bounce"><CheckCircle size={20} /><span>{saveMessage}</span></div>)}
      
      {/* Sticky Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-md z-40 py-4 border-b border-slate-200 dark:border-slate-800 -mx-4 lg:-mx-8 px-4 lg:px-8 -mt-4 lg:-mt-8 pt-4 lg:pt-8 gap-4 transition-all shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{editId ? 'تعديل المذكرة' : 'تحضير درس جديد'}</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className={`px-2 py-0.5 rounded text-xs font-bold ${formData.curriculumId === 'unaffiliated' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'}`}>
                {formData.curriculumId === 'unaffiliated' ? 'نشاط إضافي' : 'منهاج رسمي'}
             </span>
             {formData.subject && <span className="text-sm text-slate-500 dark:text-slate-400 font-bold">• {formData.subject}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1 mr-2">
              <button onClick={() => handleChange('status', LessonStatus.PLANNED)} className={`px-3 py-1 text-xs font-bold rounded ${formData.status === LessonStatus.PLANNED ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}>مخطط</button>
              <button onClick={() => handleChange('status', LessonStatus.COMPLETED)} className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 ${formData.status === LessonStatus.COMPLETED ? 'bg-green-500 text-white shadow' : 'text-slate-500'}`}>
                  {formData.status === LessonStatus.COMPLETED && <ArrowRightLeft size={12} />}
                  منجز
              </button>
          </div>
          
          <button onClick={handleGenerateAssessment} className="hidden lg:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-3 py-2.5 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-xs">
            <PenTool size={16} /> <span>توليد تقويم</span>
          </button>

          <button onClick={handlePrint} disabled={!editId} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Printer size={20} /> <span className="hidden sm:inline">طباعة</span>
          </button>
          <button onClick={handleSave} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-bold transition-transform active:scale-95 shadow-lg shadow-primary-500/20">
            <Save size={20} /> <span>{editId ? 'حفظ التعديلات' : 'حفظ الدرس'}</span>
          </button>
        </div>
      </div>

       {/* Main Content Layout */}
       <div className="flex flex-col lg:flex-row-reverse gap-6 items-start mt-4">
            
            {/* Sidebar (Metadata) */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-32 space-y-6">
                 
                 {/* Basic Info */}
                 <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                    {/* ... (Existing Basic Info Code) ... */}
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Calendar size={18} /> التوقيت والأقسام</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">المادة</label>
                            <select value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500">
                                {user.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">تاريخ الدرس</label>
                            <input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 dark:[color-scheme:dark]" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">من</label>
                                <input type="time" value={formData.startTime} onChange={(e) => handleChange('startTime', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 dark:[color-scheme:dark]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">إلى</label>
                                <input type="time" value={formData.endTime} onChange={(e) => handleChange('endTime', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 dark:[color-scheme:dark]" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الأقسام المعنية</label>
                            <div className="flex flex-wrap gap-2">
                                {filteredClasses.map(cls => (
                                    <button key={cls.id} onClick={() => toggleClass(cls.id)} className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${formData.classIds.includes(cls.id) ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400'}`}>{cls.name}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Suggestions Widget (Rules Based) */}
                 {showSuggestions && suggestions.length > 0 && (
                     <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 p-4 shadow-sm animate-in slide-in-from-right-2">
                         <div className="flex justify-between items-center mb-3">
                             <h3 className="font-bold text-indigo-800 dark:text-indigo-300 text-sm flex items-center gap-2">
                                 <Lightbulb size={16} /> موارد مقترحة ({suggestions.length})
                             </h3>
                             <button onClick={() => setShowSuggestions(false)} className="text-indigo-400 hover:text-indigo-600"><X size={14} /></button>
                         </div>
                         <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                             {suggestions.map(res => {
                                 const isAdded = formData.resourceIds?.includes(res.id);
                                 return (
                                 <div key={res.id} className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-indigo-50 dark:border-slate-700 text-xs hover:shadow-md transition-all group">
                                     <div className="flex justify-between items-start">
                                         <span className={`font-bold line-clamp-1 ${isAdded ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'}`}>{res.title}</span>
                                         <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-1.5 rounded">{RESOURCE_CATEGORY_LABELS[res.category]}</span>
                                     </div>
                                     <p className="text-slate-500 mt-1 line-clamp-1">{res.url}</p>
                                     <div className="mt-2 flex justify-end">
                                         {isAdded ? (
                                             <span className="flex items-center gap-1 text-green-600 font-bold text-[10px]">
                                                 <Check size={12} /> تمت الإضافة
                                             </span>
                                         ) : (
                                             <button onClick={() => handleAddSuggestion(res)} className="text-indigo-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">إضافة</button>
                                         )}
                                     </div>
                                 </div>
                             )})}
                         </div>
                     </div>
                 )}

                 {/* Configuration */}
                 <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                    {/* ... (Existing Configuration Code) ... */}
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Target size={18} /> طبيعة الحصة</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">نوع المذكرة</label>
                            <select value={formData.type} onChange={(e) => handleTypeChange(e.target.value as LessonType)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500">
                                {Object.values(LessonType).map(t => <option key={t} value={t}>{LESSON_TYPE_LABELS[t]}</option>)}
                            </select>
                        </div>
                    </div>
                 </div>

            </div>

            {/* Main Content Area */}
            <div className="w-full lg:w-2/3 space-y-6">
                
                {/* Title Input */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">المجال المفاهيمي</label>
                            <input type="text" value={formData.domain} onChange={e => handleChange('domain', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-3 py-2 text-sm" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">الوحدة التعليمية</label>
                            <input type="text" value={formData.unit} onChange={e => handleChange('unit', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-3 py-2 text-sm" />
                        </div>
                    </div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">عنوان الدرس / الموضوع</label>
                    <input type="text" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} className="w-full text-xl font-bold rounded-lg border border-slate-300 dark:border-slate-600 p-4 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400" placeholder="أدخل عنوان الدرس هنا..." />
                </div>

                {/* Main Tabs */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap">
                        <button onClick={() => setActiveTab('pedagogy')} className={`flex-1 px-4 py-3 font-medium text-sm transition-colors border-b-2 flex justify-center items-center gap-2 ${activeTab === 'pedagogy' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                            <BookOpen size={16} /> الإطار البيداغوجي
                        </button>
                        <button onClick={() => setActiveTab('content')} className={`flex-1 px-4 py-3 font-medium text-sm transition-colors border-b-2 flex justify-center items-center gap-2 ${activeTab === 'content' ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                            <Layers size={16} /> سيرورة الدرس
                        </button>
                        <button onClick={() => setActiveTab('homework')} className={`flex-1 px-4 py-3 font-medium text-sm transition-colors border-b-2 flex justify-center items-center gap-2 ${activeTab === 'homework' ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                            <FileText size={16} /> الواجبات & Wayground
                        </button>
                        {formData.status === LessonStatus.COMPLETED && (
                            <button onClick={() => setActiveTab('reflection')} className={`flex-1 px-4 py-3 font-medium text-sm transition-colors border-b-2 flex justify-center items-center gap-2 ${activeTab === 'reflection' ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                                <BarChart3 size={16} /> تقويم الأداء
                            </button>
                        )}
                    </div>

                    <div className="p-6">
                        {/* TAB 1: PEDAGOGY */}
                        {activeTab === 'pedagogy' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {/* Objectives */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">مركبات الكفاءة (الأهداف التعلمية)</label>
                                    <div className="space-y-2 mb-3">
                                        {formData.objectives.map((obj, idx) => (
                                            <div key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-700/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                                                <CheckCircle size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                                <span className="flex-1 text-sm text-slate-800 dark:text-slate-200">{obj}</span>
                                                <button onClick={() => removeObjective(idx)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="text" value={newObjective} onChange={(e) => setNewObjective(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addObjective()} className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 p-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="أضف هدفاً جديداً..." />
                                        <button onClick={addObjective} className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"><Plus size={20} /></button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">المكتسبات القبلية</label>
                                        <textarea rows={4} value={formData.prerequisites} onChange={(e) => handleChange('prerequisites', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-3 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="ما يجب أن يعرفه التلميذ قبل هذا الدرس..." />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">مؤشرات الأداء (المعايير)</label>
                                            {formData.performanceIndicators && (
                                                <button onClick={handleGenerateAssessment} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 transition-colors flex items-center gap-1">
                                                    <Sparkles size={10} /> توليد تقويم
                                                </button>
                                            )}
                                        </div>
                                        <textarea rows={4} value={formData.performanceIndicators} onChange={(e) => handleChange('performanceIndicators', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-3 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="- أن يكون التلميذ قادراً على... &#10;- ينجز..." />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: CONTENT */}
                        {activeTab === 'content' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                {/* Situation */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">وضعية الانطلاق / الوضعية المشكلة</label>
                                    <textarea rows={3} value={formData.learningSituation} onChange={(e) => handleChange('learningSituation', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-3 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="نص الوضعية المشكلة التي تثير فضول المتعلم..." />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">سيرورة الحصة (المراحل والزمن)</label>
                                                <button onClick={() => openResourcePicker('theoreticalContent')} className="text-primary-600 hover:text-primary-700" title="إرفاق مورد"><Paperclip size={14} /></button>
                                            </div>
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Phases / Timing</span>
                                        </div>
                                        <textarea rows={12} value={formData.theoreticalContent} onChange={(e) => handleChange('theoreticalContent', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-4 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm leading-relaxed text-right" dir="rtl" placeholder="1. مرحلة الانطلاق (5د)..." />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">الأنشطة والتقويم</label>
                                                <button onClick={() => openResourcePicker('practicalContent')} className="text-primary-600 hover:text-primary-700" title="إرفاق مورد"><Paperclip size={14} /></button>
                                            </div>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Activities / Tasks</span>
                                        </div>
                                        <textarea rows={12} value={formData.practicalContent} onChange={(e) => handleChange('practicalContent', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-4 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm leading-relaxed text-right" dir="rtl" placeholder="أنشطة المتعلم..." />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: HOMEWORK & WAYGROUND */}
                        {activeTab === 'homework' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                
                                {/* Standard Homework */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800 dark:text-white border-b pb-2 flex justify-between">
                                        <span>العمل المنزلي (التقليدي)</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                نص الواجب 
                                                <button onClick={() => openResourcePicker('homework')} className="mr-2 text-primary-600 hover:text-primary-700 inline-block align-middle" title="إرفاق مورد"><Paperclip size={14} /></button>
                                            </label>
                                            <textarea rows={2} value={formData.homework} onChange={(e) => handleChange('homework', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="حل التمرين رقم..." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">تاريخ التسليم</label>
                                            <input type="date" value={formData.homeworkDueDate} onChange={(e) => handleChange('homeworkDueDate', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 dark:[color-scheme:dark]" />
                                        </div>
                                    </div>
                                    <button onClick={() => navigate('/assessments/new')} className="text-primary-600 hover:underline text-sm flex items-center gap-1">
                                        <PenTool size={14} /> إنشاء ورقة عمل مخصصة لهذا الواجب (Assessment Builder)
                                    </button>
                                </div>

                                {/* Wayground Integration */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-600 text-white rounded-lg"><LinkIcon size={20} /></div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-white">Wayground Integration</h3>
                                                <p className="text-xs text-slate-500">ربط الواجبات بمنصة Wayground</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleWaygroundChange('isEnabled', !formData.wayground?.isEnabled)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.wayground?.isEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.wayground?.isEnabled ? 'translate-x-1' : 'translate-x-6'}`} />
                                        </button>
                                    </div>

                                    {formData.wayground?.isEnabled ? (
                                        <div className="space-y-4 animate-in fade-in">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">رابط الواجب (Assignment Link)</label>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="url" 
                                                        value={formData.wayground?.assignmentLink || ''} 
                                                        onChange={(e) => handleWaygroundChange('assignmentLink', e.target.value)}
                                                        className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-800 text-sm"
                                                        placeholder="https://wayground.com/assign/..." 
                                                    />
                                                    {formData.wayground?.assignmentLink && (
                                                        <a href={formData.wayground.assignmentLink} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 hover:text-blue-600">
                                                            <ExternalLink size={20} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الحالة</label>
                                                <select 
                                                    value={formData.wayground?.status || 'OPEN'}
                                                    onChange={(e) => handleWaygroundChange('status', e.target.value)}
                                                    className="w-full md:w-1/3 rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-800 text-sm"
                                                >
                                                    <option value="OPEN">مفتوح (Open)</option>
                                                    <option value="ASSIGNED">تم التعيين (Assigned)</option>
                                                    <option value="COLLECTED">تم الجمع (Collected)</option>
                                                </select>
                                            </div>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                                * سيتمكن التلاميذ من الوصول للرابط عبر التطبيق الخاص بهم إذا تمت مزامنة البيانات.
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">قم بتفعيل الخيار لربط واجب إلكتروني.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 4: REFLECTION (POST-LESSON) */}
                        {activeTab === 'reflection' && formData.status === LessonStatus.COMPLETED && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {/* ... (Reflection Tab Logic from previous code) ... */}
                                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800 mb-4 flex items-start gap-3">
                                    <HelpCircle className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-bold text-purple-800 dark:text-purple-300 text-sm">استبيان التقييم الذاتي الدوري</h4>
                                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">تطبيقاً للمحور 45 من الدليل التربوي: يساعدك هذا السجل على تشخيص نقاط القوة والضعف بعد كل حصة.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Communication & Management */}
                                    <div className="space-y-5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border dark:border-slate-700">
                                        <h5 className="font-bold text-slate-700 dark:text-slate-300 border-b dark:border-slate-600 pb-2 mb-2">التواصل والتسيير</h5>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">هل نشطت التلاميذ؟</label>
                                            <input type="range" min="1" max="5" value={formData.reflection?.studentActivation || 3} onChange={e => handleReflectionChange('studentActivation', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600 accent-primary-600" />
                                            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>سلبي</span><span>تفاعلي جداً</span></div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">هل كانت التعليمات واضحة؟</label>
                                            <input type="range" min="1" max="5" value={formData.reflection?.instructionsClarity || 3} onChange={e => handleReflectionChange('instructionsClarity', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600 accent-primary-600" />
                                            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>غامضة</span><span>واضحة ودقيقة</span></div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">مشاركة القسم</label>
                                            <select value={formData.reflection?.participationRate || 'AVERAGE'} onChange={e => handleReflectionChange('participationRate', e.target.value)} className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 text-sm">
                                                <option value="LOW">ضعيفة (قلة محتكرة للكلام)</option>
                                                <option value="AVERAGE">متوسطة</option>
                                                <option value="HIGH">عالية (أغلبية القسم)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Objectives & Balance */}
                                    <div className="space-y-5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border dark:border-slate-700">
                                        <h5 className="font-bold text-slate-700 dark:text-slate-300 border-b dark:border-slate-600 pb-2 mb-2">التخطيط والأهداف</h5>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.reflection?.objectivesMet ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                                                    {formData.reflection?.objectivesMet && <CheckSquare size={14} />}
                                                </div>
                                                <input type="checkbox" checked={formData.reflection?.objectivesMet || false} onChange={e => handleReflectionChange('objectivesMet', e.target.checked)} className="hidden" />
                                                <span className="text-sm">هل تحققت الأهداف المسطرة؟</span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.reflection?.activityBalance ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300'}`}>
                                                    {formData.reflection?.activityBalance && <CheckSquare size={14} />}
                                                </div>
                                                <input type="checkbox" checked={formData.reflection?.activityBalance || false} onChange={e => handleReflectionChange('activityBalance', e.target.checked)} className="hidden" />
                                                <span className="text-sm">هل احترمت توازن النشاطات والوقت؟</span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.reflection?.timeManagement ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300'}`}>
                                                    {formData.reflection?.timeManagement && <CheckSquare size={14} />}
                                                </div>
                                                <input type="checkbox" checked={formData.reflection?.timeManagement || false} onChange={e => handleReflectionChange('timeManagement', e.target.checked)} className="hidden" />
                                                <span className="text-sm">هل تحكمت في الوقت (تفادي الهدر)؟</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Difficulties */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">صعوبات غير متوقعة / ملاحظات للتحسين</label>
                                    <textarea 
                                        rows={3} 
                                        value={formData.reflection?.unexpectedDifficulties || ''} 
                                        onChange={e => handleReflectionChange('unexpectedDifficulties', e.target.value)} 
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-3 bg-white dark:bg-slate-700 outline-none text-sm"
                                        placeholder="مثال: صعوبة في فهم مصطلح...، عطل في جهاز العرض..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Evaluation & Notes */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Sparkles size={18} className="text-amber-500" /> ملاحظات تقويمية</h3>
                    <textarea rows={2} value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-3 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="ملاحظات حول سير الدرس..." />
                </div>

            </div>
       </div>

       {/* Resource Picker Modal */}
       {showResourcePicker && (
           <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 flex flex-col max-h-[80vh]">
                   <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-xl">
                       <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                           <Paperclip size={18} /> إرفاق مورد من المكتبة
                       </h3>
                       <button onClick={() => setShowResourcePicker(false)} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
                   </div>
                   
                   <div className="p-4 border-b dark:border-slate-700">
                       <div className="relative">
                           <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           <input 
                               type="text" 
                               placeholder="بحث عن مورد..." 
                               value={resourceSearch}
                               onChange={(e) => setResourceSearch(e.target.value)}
                               className="w-full pr-9 pl-3 py-2 rounded-lg border dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                           />
                       </div>
                   </div>

                   <div className="p-2 overflow-y-auto flex-1">
                       {filteredResources.length === 0 ? (
                           <div className="text-center py-8 text-slate-500 text-sm">
                               <FileIcon size={32} className="mx-auto mb-2 opacity-50" />
                               <p>لا توجد موارد مطابقة.</p>
                               <button onClick={() => navigate('/library')} className="text-primary-600 hover:underline mt-1">انتقل للمكتبة لإضافة موارد</button>
                           </div>
                       ) : (
                           <div className="space-y-1">
                               {filteredResources.map(res => (
                                   <button 
                                       key={res.id} 
                                       onClick={() => handleAttachResource(res)}
                                       className="w-full text-right p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all flex items-center justify-between group"
                                   >
                                       <div className="flex items-center gap-3">
                                           <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500`}>
                                               <FileIcon size={16} />
                                           </div>
                                           <div>
                                               <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{res.title}</p>
                                               <p className="text-xs text-slate-500">{RESOURCE_CATEGORY_LABELS[res.category]}</p>
                                           </div>
                                       </div>
                                       <Plus size={16} className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                   </button>
                               ))}
                           </div>
                       )}
                   </div>
               </div>
           </div>
       )}

    </div>
  );
}
