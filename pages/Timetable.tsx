
import React from 'react';
import { CLASSES, DAYS_AR } from '../constants';
import { Calendar, Clock, Printer, Edit, MoveHorizontal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function Timetable() {
  const navigate = useNavigate();
  const { timetable } = useData();
  
  // Standard Hourly Slots
  const slots = [
    { start: '08:00', end: '09:00', period: 'AM' },
    { start: '09:00', end: '10:00', period: 'AM' },
    { start: '10:00', end: '11:00', period: 'AM' },
    { start: '11:00', end: '12:00', period: 'AM' },
    { start: '13:00', end: '14:00', period: 'PM' },
    { start: '14:00', end: '15:00', period: 'PM' },
    { start: '15:00', end: '16:00', period: 'PM' },
    { start: '16:00', end: '17:00', period: 'PM' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">جدول التوقيت</h1>
          <p className="text-slate-500 dark:text-slate-400">العام الدراسي 2023 - 2024</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Link 
              to="/timetable/print" 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Printer size={18} />
              <span className="hidden sm:inline">طباعة</span>
            </Link>
            <button 
              onClick={() => navigate('/timetable/edit')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Edit size={18} />
              <span className="hidden sm:inline">تعديل</span>
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6 text-right font-semibold text-slate-600 dark:text-slate-400 w-32 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">اليوم</th>
                {slots.map((slot, i) => (
                  <th key={i} className={`py-4 px-4 text-center font-semibold text-xs text-slate-600 dark:text-slate-400 ${i === 3 ? 'border-l-4 border-slate-200 dark:border-slate-700' : ''}`}>
                    <div className="flex flex-col items-center">
                        <span>{slot.start}</span>
                        <span className="text-slate-400">-</span>
                        <span>{slot.end}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {DAYS_AR.slice(0, 5).map((day, dayIndex) => (
                <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-6 px-6 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/30 dark:bg-slate-800/50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-primary-500" />
                      {day}
                    </div>
                  </td>
                  {slots.map((slot, slotIndex) => {
                    const session = timetable.find(t => t.dayOfWeek === dayIndex && parseInt(t.startTime) === parseInt(slot.start));
                    const group = session ? CLASSES.find(c => c.id === session.classId) : null;
                    return (
                      <td key={slotIndex} className={`p-1 align-middle ${slotIndex === 3 ? 'border-l-4 border-slate-100 dark:border-slate-800' : ''}`}>
                        {session ? (
                          <div className="bg-primary-50 dark:bg-primary-500/10 border-l-4 border-primary-500 p-2 rounded hover:shadow-md transition-all group h-24 flex flex-col justify-center text-center">
                            <div className="font-bold text-sm text-primary-900 dark:text-primary-100 mb-1 leading-tight">{group?.name}</div>
                            <div className="text-[10px] text-primary-600 dark:text-primary-400 mb-1">{session.startTime} - {session.endTime}</div>
                            <div className="text-[10px] font-medium bg-white dark:bg-slate-800 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full inline-block shadow-sm border border-slate-100 dark:border-slate-700 mx-auto">{session.room}</div>
                          </div>
                        ) : (
                            <div className="h-24 w-full rounded flex items-center justify-center text-slate-200 dark:text-slate-800">
                                <span className="w-1 h-1 bg-current rounded-full"></span>
                            </div>
                        )}
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
    </div>
  );
}
