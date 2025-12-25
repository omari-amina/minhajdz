
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CLASSES, DAYS_AR, HIGH_SCHOOL_LEVELS } from '../constants';
import { Save, ArrowLeft, Trash2, Plus, X, MoveHorizontal, AlertCircle } from 'lucide-react';
import { TimetableEntry } from '../types';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

export default function TimetableEdit() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { timetable, updateTimetable } = useData();
  const [entries, setEntries] = useState<TimetableEntry[]>(timetable);
  const [selectedCell, setSelectedCell] = useState<{day: number, slotIndex: number, start: string, end: string} | null>(null);
  
  // Modal State
  const [editClassId, setEditClassId] = useState('');
  const [editRoom, setEditRoom] = useState('');

  // 1. FILTER CLASSES BASED ON TEACHER ASSIGNMENTS (User Source of Truth)
  const allowedClasses = useMemo(() => {
      const assignedIds = user?.assignedClassIds || [];
      if (assignedIds.length > 0) {
          return CLASSES.filter(c => assignedIds.includes(c.id));
      }
      return []; // Return empty if no assignments configured
  }, [user]);

  // Define standard hourly slots
  const slots = [
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
  ];

  useEffect(() => {
    if (selectedCell) {
        const existing = getEntryForCell(selectedCell.day, selectedCell.start);
        if (existing) {
            setEditClassId(existing.classId);
            setEditRoom(existing.room);
        } else {
            setEditClassId('');
            setEditRoom('مخبر 1'); // Default suggestion
        }
    }
  }, [selectedCell, entries]);

  const handleSave = () => {
    updateTimetable(entries);
    navigate('/timetable');
  };

  const getEntryForCell = (dayIndex: number, startTime: string) => {
    // Fuzzy matching for times (parsing int to handle 08:00 vs 8:00)
    return entries.find(e => 
      e.dayOfWeek === dayIndex && 
      parseInt(e.startTime) === parseInt(startTime)
    );
  };

  // 2. SERVER-SIDE VALIDATION SIMULATION
  const validateAssignment = (classId: string): boolean => {
      // Logic: Ensure the classId exists in the user's assignedClassIds
      const assignedIds = user?.assignedClassIds || [];
      return assignedIds.includes(classId);
  };

  const updateEntry = () => {
    if (!selectedCell || !editClassId) return;

    // VALIDATION GUARD
    if (!validateAssignment(editClassId)) {
        alert("خطأ (403): هذا القسم غير مسند إليك في الإعدادات. لا يمكن إضافته للجدول.");
        return;
    }

    const newEntry: TimetableEntry = {
      id: `t_${Date.now()}`,
      dayOfWeek: selectedCell.day,
      startTime: selectedCell.start,
      endTime: selectedCell.end,
      classId: editClassId,
      room: editRoom
    };

    // Remove existing for this cell if any
    const filtered = entries.filter(e => 
        !(e.dayOfWeek === selectedCell.day && parseInt(e.startTime) === parseInt(selectedCell.start))
    );
    
    setEntries([...filtered, newEntry]);
    setSelectedCell(null);
  };

  const removeEntry = () => {
    if (!selectedCell) return;
    const filtered = entries.filter(e => 
        !(e.dayOfWeek === selectedCell.day && parseInt(e.startTime) === parseInt(selectedCell.start))
    );
    setEntries(filtered);
    setSelectedCell(null);
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={() => navigate('/timetable')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-2">
            <ArrowLeft size={18} />
            <span>رجوع</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">تعديل جدول التوقيت</h1>
          <p className="text-slate-500 dark:text-slate-400">نظام الحصة الواحدة (1 ساعة)</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setEntries([])}
             className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
           >
             تفريغ الجدول
           </button>
           <button 
             onClick={handleSave}
             className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg"
           >
             <Save size={18} />
             <span>حفظ التغييرات</span>
           </button>
        </div>
      </div>

      {allowedClasses.length === 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-center gap-4 animate-in fade-in">
              <AlertCircle className="text-amber-600 dark:text-amber-500" size={24} />
              <div className="flex-1">
                  <h3 className="font-bold text-amber-800 dark:text-amber-400">تنبيه: لم يتم تحديد الأقسام المسندة</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      يجب عليك تحديد الأقسام التي تدرسها في "الإعدادات" أولاً لتتمكن من إضافتها للجدول.
                  </p>
              </div>
              <Link to="/settings" className="bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-200">
                  الذهاب للإعدادات
              </Link>
          </div>
      )}

      {/* Editor Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 text-right font-semibold text-slate-600 dark:text-slate-400 w-32 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">اليوم</th>
                {slots.map((slot, i) => (
                  <th key={i} className={`py-4 px-2 text-center font-semibold text-xs text-slate-600 dark:text-slate-400 ${i === 3 ? 'border-l-4 border-slate-200 dark:border-slate-700' : ''}`}>
                    <div>{slot.start}</div>
                    <div className="text-[10px] text-slate-400">{slot.end}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {DAYS_AR.slice(0, 5).map((day, dayIndex) => (
                <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                  <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/30 dark:bg-slate-800/50 sticky left-0 z-10">
                    {day}
                  </td>
                  {slots.map((slot, slotIndex) => {
                    const entry = getEntryForCell(dayIndex, slot.start);
                    const group = entry ? CLASSES.find(c => c.id === entry.classId) : null;
                    
                    return (
                      <td key={slotIndex} className={`p-1 ${slotIndex === 3 ? 'border-l-4 border-slate-100 dark:border-slate-700' : ''}`}>
                        <div 
                          onClick={() => allowedClasses.length > 0 && setSelectedCell({ day: dayIndex, slotIndex, start: slot.start, end: slot.end })}
                          className={`
                            h-16 rounded-lg border-2 border-dashed p-1 cursor-pointer transition-all flex flex-col items-center justify-center text-center relative group
                            ${entry 
                              ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20' 
                              : allowedClasses.length === 0 ? 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-50' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
                            }
                          `}
                        >
                           {entry ? (
                             <>
                               <span className="font-bold text-xs text-primary-800 dark:text-primary-300 leading-tight">{group?.name}</span>
                               <span className="text-[10px] bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 mt-1">{entry.room}</span>
                             </>
                           ) : (
                             allowedClasses.length > 0 && <Plus size={16} className="text-slate-300 group-hover:text-primary-400" />
                           )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
       <div className="md:hidden text-center text-xs text-slate-400 pt-2 flex items-center justify-center gap-2">
         <MoveHorizontal size={14} />
         <span>اسحب أفقيًا لرؤية باقي الجدول</span>
       </div>

      {/* Edit Modal */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                   تعديل حصة {DAYS_AR[selectedCell.day]} ({selectedCell.start})
                </h3>
                <button onClick={() => setSelectedCell(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">القسم المسند</label>
                    <select 
                      value={editClassId}
                      onChange={(e) => setEditClassId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="" disabled>-- اختر القسم --</option>
                      {allowedClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {allowedClasses.length === 0 && <p className="text-xs text-red-500 mt-1">القائمة فارغة. تأكد من إسناد الأقسام في الإعدادات.</p>}
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">القاعة / المخبر</label>
                    <input 
                      type="text" 
                      value={editRoom}
                      onChange={(e) => setEditRoom(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="مثال: مخبر 1"
                    />
                 </div>

                 <div className="flex gap-3 mt-8">
                    {getEntryForCell(selectedCell.day, selectedCell.start) && (
                      <button 
                        onClick={removeEntry}
                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        حذف
                      </button>
                    )}
                    <button 
                      onClick={updateEntry}
                      disabled={!editClassId}
                      className="flex-[2] bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 rounded-lg font-medium transition-colors"
                    >
                      حفظ
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
