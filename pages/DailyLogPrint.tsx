
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CLASSES } from '../constants';
import { Printer, ArrowLeft, Settings } from 'lucide-react';
import { DailyLogEntry } from '../types';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

export default function DailyLogPrint() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { dailyLogs } = useData();
  
  if (!user) return null;

  const logs = [...dailyLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Default Config
  const [config, setConfig] = useState({
    showHeader: true,
    showFooter: true,
    showSummary: true,
    showAbsentees: true,
    showObservations: true,
  });

  const handlePrint = () => window.print();
  
  // Group logs by date
  const groupedLogs = logs.reduce((groups, log) => {
      const date = log.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
      return groups;
  }, {} as Record<string, DailyLogEntry[]>);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col md:flex-row font-serif text-black" dir="rtl">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background: white; margin: 0; }
          .no-print { display: none !important; }
          .print-container { width: 100%; box-shadow: none; margin: 0; height: auto; border: none; padding: 0; }
          
          /* Force exact black for text and borders everywhere */
          p, h1, h2, h3, h4, h5, h6, span, div, td, th, li {
              color: #000000 !important;
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
          }
          
          /* Ensure table backgrounds are light gray or white */
          .bg-gray-100, .bg-gray-200 {
             background-color: #f3f4f6 !important;
             -webkit-print-color-adjust: exact !important; 
             print-color-adjust: exact !important; 
          }
        }
      `}</style>

      {/* Sidebar (No Print) */}
      <aside className="w-80 bg-white p-6 no-print hidden md:block border-l h-screen sticky top-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-slate-500 hover:text-black">
          <ArrowLeft size={18} /> رجوع
        </button>
        <h2 className="font-bold mb-4 flex items-center gap-2"><Settings size={18}/> إعدادات الطباعة</h2>
        <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={config.showHeader} onChange={e => setConfig({...config, showHeader: e.target.checked})} /> الترويسة الرسمية</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={config.showSummary} onChange={e => setConfig({...config, showSummary: e.target.checked})} /> ملخص الحصة</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={config.showAbsentees} onChange={e => setConfig({...config, showAbsentees: e.target.checked})} /> قائمة الغيابات</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={config.showObservations} onChange={e => setConfig({...config, showObservations: e.target.checked})} /> الملاحظات</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={config.showFooter} onChange={e => setConfig({...config, showFooter: e.target.checked})} /> التذييل (التوقيع)</label>
        </div>
        <button onClick={handlePrint} className="mt-8 w-full bg-black text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
            <Printer size={20} /> طباعة
        </button>
      </aside>

      {/* Sheet Content */}
      <div className="flex-1 p-8 print:p-0 flex justify-center bg-gray-100 print:bg-white">
        <div className="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-xl print:shadow-none print-container text-black text-sm leading-normal relative">
            
            {config.showHeader && (
                <div className="mb-6">
                    <div className="text-center font-bold text-xs mb-4">
                        <p>الجمهورية الجزائرية الديمقراطية الشعبية</p>
                        <p>وزارة التربية الوطنية</p>
                    </div>
                    <div className="border-2 border-black flex">
                        <div className="flex-1 p-2 border-l border-black text-right space-y-1">
                            <p><span className="font-bold">المؤسسة:</span> {user.schoolName}</p>
                            <p><span className="font-bold">الأستاذ:</span> {user.name}</p>
                        </div>
                        <div className="flex-1 p-2 flex items-center justify-center bg-gray-100">
                             <h1 className="font-extrabold text-xl uppercase border-b-2 border-black">تقرير المتابعة اليومية</h1>
                        </div>
                        <div className="flex-1 p-2 border-r border-black text-left space-y-1">
                            <p><span className="font-bold">المادة:</span> {user.subjects.join('، ')}</p>
                            <p><span className="font-bold">السنة الدراسية:</span> {user.academicYear}</p>
                        </div>
                    </div>
                </div>
            )}

            {Object.entries(groupedLogs).map(([date, entries]) => (
                <div key={date} className="mb-6 break-inside-avoid">
                    <h2 className="font-bold text-lg bg-gray-100 border-2 border-black p-2 text-center mb-2">
                        يوم: {new Date(date).toLocaleDateString('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h2>
                    <table className="w-full border-collapse border-2 border-black text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="border border-black p-2 w-24">التوقيت</th>
                                <th className="border border-black p-2 w-32">القسم</th>
                                <th className="border border-black p-2 text-right">موضوع الحصة والتفاصيل</th>
                            </tr>
                        </thead>
                        <tbody>
                        {(entries as DailyLogEntry[]).map(log => {
                            const classGroup = CLASSES.find(c => c.id === log.classId);
                            return (
                                <tr key={log.id}>
                                    <td className="border border-black p-2 text-center font-mono">{log.startTime} - {log.endTime}</td>
                                    <td className="border border-black p-2 text-center font-bold">{classGroup?.name}</td>
                                    <td className="border border-black p-2 text-right align-top">
                                        <p className="font-bold">{log.topic}</p>
                                        {/* FIX: Add 'print:text-black' class to ensure grayscale printing handles it as pure black */}
                                        {config.showSummary && log.contentSummary && <p className="text-xs mt-1 text-gray-700 print:text-black">{log.contentSummary}</p>}
                                        {config.showAbsentees && log.absentees && <p className="text-xs mt-1"><span className="font-bold text-red-700 print:text-black">غيابات:</span> {log.absentees}</p>}
                                        {config.showObservations && log.observations && <p className="text-xs mt-1"><span className="font-bold text-blue-700 print:text-black">ملاحظات:</span> {log.observations}</p>}
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            ))}
            
            {logs.length === 0 && <p className="text-center text-gray-500 py-10">لا توجد بيانات لعرضها.</p>}

            {config.showFooter && (
              <div className="flex justify-between mt-16 pt-8 text-xs font-bold px-8 absolute bottom-[15mm] w-[calc(100%-30mm)]">
                  <div>إمضاء الأستاذ</div>
                  <div>تأشيرة المدير</div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
