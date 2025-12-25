
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DEFAULT_LESSONS, CLASSES, ALGERIAN_CURRICULUM } from '../constants';
import { Lesson, LessonStatus } from '../types';
import { useUser } from '../context/UserContext';
import { Plus, Search, BookOpen, Calendar, Edit, Printer, Trash2, X, AlertTriangle, ChevronDown, Filter } from 'lucide-react';

export default function Lessons() {
  const navigate = useNavigate();
  const { user, currentContext } = useUser(); // Access global context
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initialize filters with Context but allow User to change to their OTHER subjects
  const [filterSubject, setFilterSubject] = useState(currentContext.subject);
  const [filterLevel, setFilterLevel] = useState('all');
  
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Sync local filter when global context changes
  useEffect(() => {
      setFilterSubject(currentContext.subject);
  }, [currentContext.subject]);

  useEffect(() => {
    const stored = localStorage.getItem('minaedu_lessons');
    const allLessons: Lesson[] = stored ? JSON.parse(stored) : DEFAULT_LESSONS;
    
    setLessons(allLessons.sort((a, b) => {
        try {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        } catch (e) {
            return 0;
        }
    }));
  }, []);

  const saveLessons = (newLessons: Lesson[]) => {
    setLessons(newLessons);
    localStorage.setItem('minaedu_lessons', JSON.stringify(newLessons));
  };

  const handleDelete = () => {
    if (!showDeleteModal) return;
    saveLessons(lessons.filter(l => l.id !== showDeleteModal));
    setShowDeleteModal(null);
  };

  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const curriculumItem = ALGERIAN_CURRICULUM.find(c => c.id === lesson.curriculumId);
      // Priority: Lesson explicit subject -> Curriculum Subject -> Fallback
      const subject = lesson.subject || curriculumItem?.subject || 'غير محدد';
      
      const lessonClasses = lesson.classIds.map(id => CLASSES.find(c => c.id === id)).filter(Boolean);
      // If no specific class assigned, check if it matches a general level
      const lessonLevels = lessonClasses.length > 0 
          ? lessonClasses.map(c => c!.gradeLevel) 
          : []; // Todo: handle lessons without classes better

      // Subject Filter: Must match selected subject (which defaults to context)
      const subjectMatch = filterSubject === 'all' ? user.subjects.includes(subject) : subject === filterSubject;
      
      // Level Filter: Must match selected level, OR if 'all', match ANY of the user's levels
      const levelMatch = filterLevel === 'all' 
          ? (lessonLevels.length === 0 || lessonLevels.some(l => user.levels.includes(l))) // Show if no class or if class matches user levels
          : lessonLevels.includes(filterLevel);

      const searchMatch = searchTerm.trim() === '' || lesson.title.toLowerCase().includes(searchTerm.toLowerCase());

      return subjectMatch && levelMatch && searchMatch;
    });
  }, [lessons, searchTerm, filterSubject, filterLevel, user.subjects, user.levels]);
  
  // Only show levels available to this user
  const userLevels = useMemo(() => user.levels, [user.levels]);

  return (
    <div className="space-y-6 pb-20">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 p-6 text-center">
                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">تأكيد الحذف</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">هل أنت متأكد من حذف هذه المذكرة؟ لا يمكن التراجع عن هذا الإجراء.</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => setShowDeleteModal(null)} className="px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium">إلغاء</button>
                    <button onClick={handleDelete} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">نعم، احذف</button>
                </div>
           </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">دفتر التحضير</h1>
          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
             عرض المذكرات الخاصة بمادة: <span className="font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded">{currentContext.subject}</span>
          </p>
        </div>
        <button onClick={() => navigate('/lessons/new')} className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
          <Plus size={20} />
          <span>تحضير درس جديد</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="بحث عن مذكرة..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-10 pl-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-colors" />
        </div>
        
        {/* Subject Filter */}
        <div className="relative">
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"><Filter size={16} /></div>
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="w-full appearance-none pr-10 pl-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-colors">
            {user.subjects.map(s => <option key={s} value={s}>{s}</option>)}
            {/* Removed 'All' option to enforce subject separation unless user explicitly has multiple subjects selected */}
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="w-full appearance-none pr-10 pl-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-colors">
            <option value="all">كل المستويات المسندة</option>
            {userLevels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
           <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {filteredLessons.length > 0 ? filteredLessons.map(lesson => {
          const classNames = lesson.classIds.map(id => CLASSES.find(c => c.id === id)?.name).filter(Boolean).join('، ');
          const isCompleted = lesson.status === LessonStatus.COMPLETED;
          return (
            <div key={lesson.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${isCompleted ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300'}`}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isCompleted ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>{lesson.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={14} />{lesson.date}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>الأقسام: {classNames || 'عام'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 rounded">{lesson.subject}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button onClick={() => navigate(`/lessons/${lesson.id}/edit`)} className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="تعديل"><Edit size={18} /></button>
                <button onClick={() => navigate(`/lessons/${lesson.id}/print`)} className="p-2 text-slate-500 hover:text-green-600 dark:hover:text-green-400 bg-slate-100 dark:bg-slate-700 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="طباعة"><Printer size={18} /></button>
                <button onClick={() => setShowDeleteModal(lesson.id)} className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="حذف"><Trash2 size={18} /></button>
              </div>
            </div>
          )
        }) : (
            <div className="text-center py-16 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="font-bold">لا توجد مذكرات لمادة {filterSubject}</h3>
                <p className="text-sm">لم تقم بإضافة دروس لهذه المادة بعد. ابدأ الآن!</p>
            </div>
        )}
      </div>
    </div>
  );
}
