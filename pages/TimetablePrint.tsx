
import React from 'react';
import { CLASSES, DAYS_AR } from '../constants';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

export default function TimetablePrint() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { timetable } = useData();

  const handlePrint = () => {
    window.print();
  };

  const slots = [
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' }, // Lunch or Break
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-8 print:p-0 print:bg-white font-serif text-black">
      
      {/* Controls */}
      <div className="max-w-[297mm] mx-auto mb-8 flex justify-between items-center no-print text-slate-900 dark:text-white">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white">
             <ArrowLeft size={18} />
             رجوع
        </button>
        <div className="flex gap-2">
            <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-black dark:bg-primary-600 text-white px-6 py-2 rounded shadow hover:bg-gray-800 dark:hover:bg-primary-700 transition-colors font-sans"
            >
            <Printer size={18} />
            طباعة (Landscape)
            </button>
        </div>
      </div>

      <style>
        {`
          @media print {
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
             .paper-content, .paper-content * {
              color: black !important;
              border-color: black !important;
            }
            .bg-gray-200 { background-color: #e5e7eb !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
          }
           /* Force black text inside the paper container even on screen */
          .paper-content, .paper-content * {
             color: black !important;
             border-color: black;
          }
        `}
      </style>

      {/* A4 Landscape Container */}
      <div 
        className="mx-auto bg-white shadow-2xl print:shadow-none min-h-[210mm] w-[297mm] print:w-full print:max-w-none box-border !text-black p-[15mm] paper-content"
      >
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
             <div className="text-right">
                 <h1 className="font-bold text-lg">الجمهورية الجزائرية الديمقراطية الشعبية</h1>
                 <h2 className="font-bold text-base">وزارة التربية الوطنية</h2>
                 <p className="mt-2 text-sm">المؤسسة: {user.schoolName}</p>
             </div>
             <div className="text-center">
                 <h1 className="text-3xl font-extrabold border-2 border-black px-8 py-2 rounded">جدول التوقيت الأسبوعي</h1>
             </div>
             <div className="text-left">
                 <p className="font-bold">الأستاذ(ة): {user.name}</p>
                 <p className="mt-1">المادة: {user.subjects.join('، ')}</p>
                 <p className="mt-1">السنة الدراسية: {user.academicYear}</p>
             </div>
        </div>

        <table className="w-full border-collapse border-2 border-black text-sm text-center">
            <thead>
                <tr className="bg-gray-200">
                    <th className="border border-black p-2 w-24">اليوم / التوقيت</th>
                    {slots.map((slot, i) => (
                        <th key={i} className="border border-black p-2">
                            {slot.start} - {slot.end}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {DAYS_AR.slice(0, 5).map((day, dIdx) => (
                    <tr key={day}>
                        <td className="border border-black p-4 font-bold bg-gray-50">{day}</td>
                        {slots.map((slot, sIdx) => {
                            // Find session roughly matching time. In real app, verify logic logic.
                            const session = timetable.find(t => {
                                const tHour = parseInt(t.startTime.split(':')[0]);
                                const sHour = parseInt(slot.start.split(':')[0]);
                                return t.dayOfWeek === dIdx && tHour === sHour;
                            });
                            const group = session ? CLASSES.find(c => c.id === session.classId) : null;

                            return (
                                <td key={sIdx} className="border border-black p-1 h-20 align-middle">
                                    {session ? (
                                        <div className="flex flex-col items-center justify-center h-full w-full">
                                            <span className="font-bold text-base block">{group?.name}</span>
                                            <span className="text-xs mt-1 border border-black px-2 rounded">{session.room}</span>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-stripes opacity-10"></div>
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>

        <div className="mt-8 flex justify-between">
            <div className="w-1/3 text-center">
                <p className="font-bold underline mb-16">إمضاء الأستاذ:</p>
            </div>
             <div className="w-1/3 text-center">
                <p className="font-bold underline mb-16">إمضاء المدير:</p>
            </div>
        </div>

      </div>
    </div>
  );
}
