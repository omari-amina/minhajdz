
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { AnnualPlan, PlanWeek, CurriculumStandard, LessonStatus } from '../types';
import { Calendar, Save, Plus, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Clock, Trash2, FileText, Edit, RefreshCw, Printer, ArrowLeft, Stethoscope } from 'lucide-react';

const TERMS = [
  { id: 'TERM_1', label: 'الفصل الأول (الخريف)', weeks: 13, color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
  { id: 'TERM_2', label: 'الفصل الثاني (الشتاء)', weeks: 11, color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  { id: 'TERM_3', label: 'الفصل الثالث (الربيع)', weeks: 8, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
];

export default function AnnualPlanner() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { annualPlans, updateAnnualPlans, curriculumItems, lessons } = useData();
  
  if (!user) return null;

  // Selection State
  const [selectedSubject, setSelectedSubject] = useState(user.subjects[0] || '');
  const [selectedLevel, setSelectedLevel] = useState(user.levels[0] || '');
  const [selectedStream, setSelectedStream] = useState('all');

  // Plan State
  const [currentPlan, setCurrentPlan] = useState<AnnualPlan | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Modal for adding curriculum
  const [activeWeekIndex, setActiveWeekIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Helper: Get Lesson status if exists
  const getLessonInfo = (curriculumId: string) => {
      const lesson = lessons.find(l => l.curriculumId === curriculumId);
      return lesson ? { id: lesson.id, status: lesson.status } : null;
  };

  // Generate initial weeks if new plan
  const generateInitialWeeks = (): PlanWeek[] => {
    let weeks: PlanWeek[] = [];
    let weekCounter = 1;
    
    TERMS.forEach(term => {
      for (let i = 0; i < term.weeks; i++) {
        weeks.push({
          weekNumber: weekCounter++,
          startDate: '', // User can fill dates later
          term: term.id as any,
          assignedCurriculumIds: [],
          status: 'PENDING'
        });
      }
    });
    return weeks;
  };

  // Filtered curriculum for assignment (Items not yet assigned?)
  const availableCurriculum = useMemo(() => {
    return curriculumItems.filter(c => 
      c.subject === selectedSubject && 
      c.level === selectedLevel &&
      (selectedStream === 'all' || !c.stream || c.stream === selectedStream)
    );
  }, [selectedSubject, selectedLevel, selectedStream, curriculumItems]);

  const availableStreams = useMemo(() => {
      const streams = new Set(curriculumItems
        .filter(c => c.subject === selectedSubject && c.level === selectedLevel && c.stream)
        .map(c => c.stream));
      return Array.from(streams);
  }, [selectedSubject, selectedLevel, curriculumItems]);

  // Load or Create Plan
  useEffect(() => {
    const existingPlan = annualPlans.find(p => 
      p.subject === selectedSubject && 
      p.level === selectedLevel && 
      (selectedStream === 'all' || p.stream === selectedStream)
    );

    if (existingPlan) {
      setCurrentPlan(existingPlan);
    } else {
      setCurrentPlan({
        id: `plan_${Date.now()}`,
        subject: selectedSubject,
        level: selectedLevel,
        stream: selectedStream === 'all' ? undefined : selectedStream,
        academicYear: user.academicYear,
        weeks: generateInitialWeeks(),
        lastUpdated: new Date().toISOString()
      });
    }
    setIsDirty(false);
  }, [selectedSubject, selectedLevel, selectedStream, annualPlans]);

  const handleSave = () => {
    if (!currentPlan) return;
    
    const updatedPlan = { ...currentPlan, lastUpdated: new Date().toISOString() };
    
    // Remove old version if exists and add new
    const otherPlans = annualPlans.filter(p => p.id !== currentPlan.id);
    updateAnnualPlans([...otherPlans, updatedPlan]);
    
    // Update local state to avoid jumpiness
    setCurrentPlan(updatedPlan);
    setIsDirty(false);
    alert('تم حفظ التدرج السنوي بنجاح');
  };

  const handleResetPlan = () => {
      if(window.confirm('هل أنت متأكد من إعادة تعيين المخطط؟ سيتم حذف جميع التوزيعات.')) {
        setCurrentPlan({
            ...currentPlan!,
            weeks: generateInitialWeeks()
        });
        setIsDirty(true);
      }
  };

  const handlePrint = () => {
      const streamParam = selectedStream === 'all' ? '' : `&stream=${encodeURIComponent(selectedStream)}`;
      navigate(`/planning/print?subject=${encodeURIComponent(selectedSubject)}&level=${encodeURIComponent(selectedLevel)}${streamParam}`);
  };

  const handleAssignUnit = (curriculumId: string) => {
    if (activeWeekIndex === null || !currentPlan) return;

    const newWeeks = [...currentPlan.weeks];
    if (!newWeeks[activeWeekIndex].assignedCurriculumIds.includes(curriculumId)) {
        newWeeks[activeWeekIndex].assignedCurriculumIds.push(curriculumId);
        setCurrentPlan({ ...currentPlan, weeks: newWeeks });
        setIsDirty(true);
    }
    setShowModal(false);
  };

  const handleRemoveUnit = (weekIndex: number, curriculumId: string) => {
    if (!currentPlan) return;
    const newWeeks = [...currentPlan.weeks];
    newWeeks[weekIndex].assignedCurriculumIds = newWeeks[weekIndex].assignedCurriculumIds.filter(id => id !== curriculumId);
    setCurrentPlan({ ...currentPlan, weeks: newWeeks });
    setIsDirty(true);
  };

  const updateWeekStatus = (weekIndex: number, status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'DELAYED') => {
    if (!currentPlan) return;
    const newWeeks = [...currentPlan.weeks];
    newWeeks[weekIndex].status = status;
    setCurrentPlan({ ...currentPlan, weeks: newWeeks });
    setIsDirty(true);
  };

  const updateWeekDate = (weekIndex: number, date: string) => {
    if (!currentPlan) return;
    const newWeeks = [...currentPlan.weeks];
    newWeeks[weekIndex].startDate = date;
    setCurrentPlan({ ...currentPlan, weeks: newWeeks });
    setIsDirty(true);
  };

  const updateWeekNotes = (weekIndex: number, notes: string) => {
    if (!currentPlan) return;
    const newWeeks = [...currentPlan.weeks];
    newWeeks[weekIndex].notes = notes;
    setCurrentPlan({ ...currentPlan, weeks: newWeeks });
    setIsDirty(true);
  };

  if (!currentPlan) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="pb-20 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="text-primary-600" />
            التدرج السنوي
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">تخطيط توزيع الدروس على أسابيع السنة الدراسية.</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
           <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="px-3 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-primary-500">
              {user.subjects.map(s => <option key={s} value={s}>{s}</option>)}
           </select>
           
           <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)} className="px-3 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-primary-500">
              {user.levels.map(l => <option key={l} value={l}>{l}</option>)}
           </select>

           {availableStreams.length > 0 && (
             <select value={selectedStream} onChange={e => setSelectedStream(e.target.value)} className="px-3 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-primary-500">
                <option value="all">كل الشعب</option>
                {availableStreams.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
           )}

           <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

           <button 
             onClick={handleResetPlan}
             className="p-2 text-slate-500 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
             title="إعادة تعيين المخطط"
           >
             <RefreshCw size={20} />
           </button>
           
           <button 
             onClick={handlePrint}
             className="p-2 text-slate-500 hover:text-primary-600 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
             title="طباعة التدرج"
           >
             <Printer size={20} />
           </button>

           <button 
             onClick={handleSave} 
             disabled={!isDirty}
             className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-all shadow-md ${isDirty ? 'bg-primary-600 hover:bg-primary-700' : 'bg-slate-400 cursor-not-allowed'}`}
           >
             <Save size={18} />
             {isDirty ? 'حفظ التغييرات' : 'تم الحفظ'}
           </button>
        </div>
      </div>

      {/* Planner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {TERMS.map(term => (
            <div key={term.id} className={`rounded-xl border shadow-sm overflow-hidden flex flex-col h-full ${term.color}`}>
                <div className="p-4 border-b border-black/5 dark:border-white/5 font-bold text-lg text-center flex justify-between items-center">
                    <span>{term.label}</span>
                    <span className="text-xs bg-white/50 px-2 py-1 rounded">{currentPlan.weeks.filter(w => w.term === term.id).length} أسبوع</span>
                </div>
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[800px] scrollbar-thin">
                    {currentPlan.weeks.filter(w => w.term === term.id).map((week, indexInTerm) => {
                        const globalIndex = currentPlan.weeks.findIndex(w => w.weekNumber === week.weekNumber);
                        
                        return (
                            <div key={week.weekNumber} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-3 relative group transition-all hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700">
                                {/* Week Header */}
                                <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 min-w-[60px] text-center">
                                            أسبوع {week.weekNumber}
                                        </span>
                                        <input 
                                            type="date" 
                                            className="text-[10px] bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-500 w-24 focus:outline-none focus:border-primary-500 transition-colors"
                                            value={week.startDate || ''}
                                            onChange={(e) => updateWeekDate(globalIndex, e.target.value)}
                                            title="تاريخ بداية الأسبوع"
                                        />
                                        {week.status === 'DELAYED' && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10} /> متأخر</span>}
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => updateWeekStatus(globalIndex, week.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')}
                                            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${week.status === 'COMPLETED' ? 'text-green-500' : 'text-slate-300'}`}
                                            title={week.status === 'COMPLETED' ? "تراجع" : "تحديد كمنجز"}
                                        >
                                            <CheckCircle2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => updateWeekStatus(globalIndex, week.status === 'DELAYED' ? 'PENDING' : 'DELAYED')}
                                            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${week.status === 'DELAYED' ? 'text-red-500' : 'text-slate-300'}`}
                                            title="تحديد كمتأخر"
                                        >
                                            <Clock size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Assigned Content */}
                                <div className="space-y-2 mb-3 min-h-[40px]">
                                    {week.assignedCurriculumIds.length === 0 ? (
                                        <button 
                                            onClick={() => { setActiveWeekIndex(globalIndex); setShowModal(true); }}
                                            className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-xs flex flex-col items-center gap-1 hover:border-primary-400 hover:text-primary-500 transition-colors"
                                        >
                                            <Plus size={16} />
                                            <span>إضافة درس من المنهاج</span>
                                        </button>
                                    ) : (
                                        week.assignedCurriculumIds.map(cId => {
                                            const item = curriculumItems.find(c => c.id === cId);
                                            const lessonInfo = getLessonInfo(cId);
                                            
                                            if (!item) return null;

                                            // Special styling for remediation
                                            const isRemediation = item.id.startsWith('rem_');

                                            return (
                                                <div key={cId} className={`${isRemediation ? 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700'} border p-2 rounded flex flex-col gap-2`}>
                                                    <div className="flex justify-between items-start">
                                                        <span className={`text-xs font-bold ${isRemediation ? 'text-red-700 dark:text-red-300' : 'text-slate-700 dark:text-slate-200'} line-clamp-2 leading-tight`}>
                                                            {isRemediation && <Stethoscope size={14} className="inline-block ml-1" />}
                                                            {item.lessonTitle}
                                                        </span>
                                                        <button onClick={() => handleRemoveUnit(globalIndex, cId)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                                                    </div>
                                                    
                                                    {!isRemediation && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            <span className="text-[10px] text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border dark:border-slate-700">{item.domain}</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="mt-2">
                                                        {lessonInfo ? (
                                                            <Link 
                                                                to={`/lessons/${lessonInfo.id}/edit`} 
                                                                className={`w-full text-center text-[10px] flex items-center justify-center gap-1 px-2 py-1.5 rounded font-bold ${
                                                                    lessonInfo.status === LessonStatus.COMPLETED 
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                }`}
                                                            >
                                                                <FileText size={12} />
                                                                {lessonInfo.status === 'COMPLETED' ? 'مذكرة جاهزة' : 'تعديل المذكرة'}
                                                            </Link>
                                                        ) : (
                                                            <Link 
                                                                to={`/lessons/new?curriculumId=${cId}`} 
                                                                className="w-full text-center text-[10px] flex items-center justify-center gap-1 bg-white border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-2 py-1.5 rounded hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-600 hover:border-primary-300 transition-colors shadow-sm"
                                                            >
                                                                <ArrowLeft size={12} />
                                                                تحضير المذكرة
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    {week.assignedCurriculumIds.length > 0 && (
                                        <button 
                                            onClick={() => { setActiveWeekIndex(globalIndex); setShowModal(true); }}
                                            className="w-full py-1 text-xs text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded flex items-center justify-center gap-1"
                                        >
                                            <Plus size={12} /> إضافة المزيد
                                        </button>
                                    )}
                                </div>

                                {/* Notes Footer */}
                                <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
                                    <input 
                                        type="text" 
                                        placeholder="ملاحظات (عطلة، فروض...)" 
                                        className="w-full text-xs bg-transparent border-none focus:ring-0 text-slate-500 placeholder-slate-300 dark:placeholder-slate-600"
                                        value={week.notes || ''}
                                        onChange={(e) => updateWeekNotes(globalIndex, e.target.value)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
         ))}
      </div>

      {/* Add Content Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh]">
                <div className="p-5 border-b dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg dark:text-white">إضافة محتوى للأسبوع {activeWeekIndex !== null ? currentPlan.weeks[activeWeekIndex].weekNumber : ''}</h3>
                        <p className="text-xs text-slate-500">اختر من وحدات المنهاج أدناه</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><div className="sr-only">Close</div><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                
                <div className="p-4 overflow-y-auto flex-1 space-y-2">
                    {availableCurriculum.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-500">لا توجد وحدات متوفرة في المنهاج لهذا المستوى/المادة.</p>
                            <Link to="/curriculum" className="text-primary-600 text-sm hover:underline mt-2 inline-block">انتقل للمنهاج لإضافة وحدات</Link>
                        </div>
                    ) : (
                        availableCurriculum.map(item => {
                            const isAssignedToThisWeek = activeWeekIndex !== null && currentPlan.weeks[activeWeekIndex].assignedCurriculumIds.includes(item.id);
                            
                            // Check if assigned elsewhere in the plan
                            const assignedWeek = currentPlan.weeks.find(w => w.assignedCurriculumIds.includes(item.id));
                            const isAssignedElsewhere = assignedWeek && assignedWeek.weekNumber !== (activeWeekIndex !== null ? currentPlan.weeks[activeWeekIndex].weekNumber : -1);
                            
                            // Visual distinction in list
                            const isRemediation = item.id.startsWith('rem_');

                            return (
                                <button 
                                    key={item.id}
                                    onClick={() => !isAssignedToThisWeek && handleAssignUnit(item.id)}
                                    disabled={isAssignedToThisWeek}
                                    className={`w-full text-right p-3 rounded-lg border transition-all group flex justify-between items-center ${
                                        isAssignedToThisWeek 
                                        ? 'bg-primary-50 border-primary-200 opacity-50 cursor-default'
                                        : isRemediation
                                            ? 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10'
                                    }`}
                                >
                                    <div className="flex-1">
                                        {!isRemediation && <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">{item.domain} - {item.unit}</div>}
                                        <div className={`font-bold text-sm ${isRemediation ? 'text-red-700' : 'text-slate-800 dark:text-white'} group-hover:text-primary-700 dark:group-hover:text-primary-400`}>
                                            {isRemediation && <Stethoscope size={14} className="inline-block ml-1" />}
                                            {item.lessonTitle}
                                        </div>
                                        {isAssignedElsewhere && <div className="text-[10px] text-amber-600 mt-1 flex items-center gap-1"><AlertCircle size={10} /> مبرمج في الأسبوع {assignedWeek?.weekNumber}</div>}
                                    </div>
                                    {isAssignedToThisWeek && <CheckCircle2 className="text-primary-600" size={18} />}
                                </button>
                            );
                        })
                    )}
                </div>
                <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
                    <button onClick={() => setShowModal(false)} className="w-full py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">إغلاق</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
