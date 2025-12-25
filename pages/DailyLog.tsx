
import React, { useState, useEffect } from 'react';
import { CLASSES, HIGH_SCHOOL_LEVELS } from '../constants';
import { DailyLogEntry } from '../types';
import { Plus, Calendar, Clock, BookOpen, AlertCircle, CheckCircle, Search, X, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

export default function DailyLog() {
  const { user } = useUser();
  const { dailyLogs, updateDailyLogs, lessons, timetable } = useData();
  const [logs, setLogs] = useState<DailyLogEntry[]>(dailyLogs);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  
  // Form State
  const initialForm = {
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00',
    classId: '',
    lessonId: '',
    topic: '',
    contentSummary: '',
    absentees: '',
    observations: ''
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    setLogs(dailyLogs);
  }, [dailyLogs]);

  const filteredClasses = CLASSES.filter(c => 
    HIGH_SCHOOL_LEVELS.includes(c.gradeLevel)
  );

  const groupedLogs = [...logs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reduce((groups, log) => {
      const date = log.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
      return groups;
    }, {} as Record<string, DailyLogEntry[]>);

  const handleCreate = () => {
    if (!formData.classId || !formData.topic) {
        alert("يرجى اختيار القسم وتحديد موضوع الدرس");
        return;
    }

    const newLog: DailyLogEntry = {
        id: `dl_${Date.now()}`,
        ...formData
    };

    updateDailyLogs([newLog, ...logs]);
    setIsModalOpen(false);
    setFormData(initialForm);
  };

  useEffect(() => {
    if (isModalOpen) {
        const now = new Date();
        const currentDayIndex = now.getDay();
        const currentHour = now.getHours();
        
        const entry = timetable.find(t => 
            t.dayOfWeek === currentDayIndex && 
            parseInt(t.startTime.split(':')[0]) <= currentHour && 
            parseInt(t.endTime.split(':')[0]) > currentHour
        );

        if (entry) {
            setFormData(prev => ({
                ...prev,
                classId: entry.classId,
                startTime: entry.startTime,
                endTime: entry.endTime
            }));
        } else if (filteredClasses.length > 0 && !formData.classId) {
             setFormData(prev => ({ ...prev, classId: filteredClasses[0].id }));
        }
    }
  }, [isModalOpen, filteredClasses, timetable]);

  const handleLessonChange = (lessonId: string) => {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
          setFormData(prev => ({
              ...prev,
              lessonId: lessonId,
              topic: lesson.title,
              contentSummary: lesson.theoreticalContent.substring(0, 150) + (lesson.theoreticalContent.length > 150 ? '...' : '')
          }));
      } else {
        setFormData(prev => ({ ...prev, lessonId: '', topic: '' }));
      }
  };

  const availableLessons = lessons.filter(l => 
    !formData.classId || l.classIds.includes(formData.classId)
  );
  
  const dateInputClass = "w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-slate-50 dark:bg-slate-700 dark:text-white dark:[color-scheme:dark]";

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">الدفتر اليومي</h1>
          <p className="text-slate-500 dark:text-slate-400">تسجيل متابعة الدروس اليومية والغيابات</p>
        </div>
        <div className="flex items-center gap-2">
            <Link 
              to="/daily-log/print"
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Printer size={20} />
              <span className="hidden sm:inline">طباعة التقرير</span>
            </Link>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
            >
              <Plus size={20} />
              <span>تسجيل حصة جديدة</span>
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <Calendar className="text-slate-400" />
          <input 
            type="date"
            className="bg-transparent outline-none text-slate-700 dark:text-white dark:[color-scheme:dark]"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder="تصفية حسب التاريخ"
          />
          {filterDate && (
              <button onClick={() => setFilterDate('')} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
              </button>
          )}
      </div>

      <div className="space-y-8">
         {Object.entries(groupedLogs)
            .filter(([date]) => !filterDate || date === filterDate)
            .map(([date, entries]) => (
            <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-bold font-mono">
                        {date}
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(entries as DailyLogEntry[]).map(log => {
                        const classGroup = CLASSES.find(c => c.id === log.classId);
                        return (
                            <div key={log.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-slate-800 dark:text-white">{classGroup?.name || 'قسم غير معروف'}</h3>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                        <Clock size={12} />
                                        <span>{log.startTime} - {log.endTime}</span>
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <h4 className="font-bold text-primary-600 dark:text-primary-400 text-sm mb-1">{log.topic}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{log.contentSummary}</p>
                                </div>

                                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                                    {log.absentees && (
                                        <div className="flex gap-2 text-xs">
                                            <span className="font-bold text-red-500 flex-shrink-0">غيابات:</span>
                                            <span className="text-slate-600 dark:text-slate-300 truncate">{log.absentees}</span>
                                        </div>
                                    )}
                                    {log.observations && (
                                        <div className="flex gap-2 text-xs">
                                            <span className="font-bold text-amber-500 flex-shrink-0">ملاحظة:</span>
                                            <span className="text-slate-600 dark:text-slate-300 truncate">{log.observations}</span>
                                        </div>
                                    )}
                                </div>

                                {log.lessonId && (
                                    <Link to={`/lessons/${log.lessonId}/edit`} className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:text-primary-600" title="عرض الدرس المخطط">
                                        <BookOpen size={16} />
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
         ))}
         
         {Object.keys(groupedLogs).length === 0 && (
            <div className="text-center py-12 text-slate-500">
                لا توجد حصص مسجلة
            </div>
         )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white">تسجيل حصة يومية</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                   <X size={20} />
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">التاريخ</label>
                      <input type="date" className={dateInputClass} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="flex gap-2">
                     <div className="flex-1">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">من</label>
                        <input type="time" className={dateInputClass} value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                     </div>
                     <div className="flex-1">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">إلى</label>
                        <input type="time" className={dateInputClass} value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                     </div>
                  </div>
              </div>

              <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">القسم</label>
                  <div className="flex flex-wrap gap-2">
                      {filteredClasses.map(cls => (
                          <button
                            key={cls.id}
                            type="button"
                            onClick={() => setFormData({...formData, classId: cls.id})}
                            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                                formData.classId === cls.id 
                                ? 'bg-primary-600 text-white border-primary-600' 
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                            }`}
                          >
                              {cls.name}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-750 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">موضوع الدرس</label>
                      <select 
                        className="text-xs p-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white"
                        onChange={(e) => handleLessonChange(e.target.value)}
                        value={formData.lessonId || ''}
                      >
                          <option value="">-- ربط بمذكرة موجودة --</option>
                          {availableLessons.map(l => (
                              <option key={l.id} value={l.id}>{l.title}</option>
                          ))}
                      </select>
                  </div>
                  <input 
                     type="text"
                     className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 mb-2 font-bold"
                     placeholder="عنوان النشاط المنجز..."
                     value={formData.topic}
                     onChange={e => setFormData({...formData, topic: e.target.value})}
                  />
                  <textarea 
                     rows={3}
                     className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                     placeholder="ملخص ما تم إنجازه فعلياً (عناصر الدرس، التمارين...)"
                     value={formData.contentSummary}
                     onChange={e => setFormData({...formData, contentSummary: e.target.value})}
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">قائمة الغيابات</label>
                      <textarea 
                        rows={2}
                        className="w-full rounded-lg border border-red-200 dark:border-red-900 p-2.5 bg-red-50 dark:bg-red-900/10 dark:text-white outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        placeholder="أسماء التلاميذ الغائبين..."
                        value={formData.absentees}
                        onChange={e => setFormData({...formData, absentees: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظات</label>
                      <textarea 
                        rows={2}
                        className="w-full rounded-lg border border-amber-200 dark:border-amber-900 p-2.5 bg-amber-50 dark:bg-amber-900/10 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                        placeholder="سلوك، أعطال، ملاحظات بيداغوجية..."
                        value={formData.observations}
                        onChange={e => setFormData({...formData, observations: e.target.value})}
                      />
                  </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium">
                      إلغاء
                  </button>
                  <button onClick={handleCreate} className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 shadow-lg">
                      حفظ في السجل
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
