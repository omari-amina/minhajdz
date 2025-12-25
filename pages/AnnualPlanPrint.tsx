
import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { ArrowLeft, Printer, FileDown } from 'lucide-react';

export default function AnnualPlanPrint() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { annualPlans, curriculumItems } = useData();

  if (!user) return null;

  const subject = searchParams.get('subject') || '';
  const level = searchParams.get('level') || '';
  const stream = searchParams.get('stream') || '';

  const plan = useMemo(() => {
    return annualPlans.find(p => 
        p.subject === subject && 
        p.level === level && 
        ((!stream && !p.stream) || p.stream === stream)
    );
  }, [annualPlans, subject, level, stream]);

  if (!plan) return <div className="p-8 text-center">لم يتم العثور على تدرج سنوي لهذه المعطيات. يرجى حفظ التدرج أولاً.</div>;

  const handlePrint = () => window.print();

  const handleExportWord = () => {
    const content = document.querySelector('.print-container')?.innerHTML;
    if (!content) return;

    const styles = `
      <style>
        body { font-family: 'Times New Roman', serif; text-align: right; direction: rtl; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid black; }
        td, th { border: 1px solid black; padding: 5px; text-align: center; vertical-align: top; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .underline { text-decoration: underline; }
        .text-sm { font-size: 11pt; }
        .bg-gray-100 { background-color: #f3f4f6; }
      </style>
    `;

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'>${styles}</head>
      <body>${content}</body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planning_${subject}_${level}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-serif text-black" dir="rtl">
        <style>{`
            @media print {
                @page { size: A4 landscape; margin: 10mm; }
                body { background: white; margin: 0; }
                .no-print { display: none !important; }
                .print-container { width: 100%; box-shadow: none; margin: 0; height: auto; border: none; padding: 0; }
                p, h1, h2, h3, span, li, td, th { color: black !important; }
                *, *::before, *::after { border-color: black !important; }
                .bg-gray-100 { background-color: #f3f4f6 !important; }
                .bg-gray-50 { background-color: #f9fafb !important; }
            }
        `}</style>

        {/* Toolbar */}
        <div className="max-w-[297mm] mx-auto p-4 flex justify-between items-center no-print">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-black">
                <ArrowLeft size={18} /> رجوع
            </button>
            <div className="flex gap-2">
                <button onClick={handlePrint} className="bg-black text-white px-6 py-2 rounded flex items-center gap-2 font-sans hover:bg-slate-800">
                    <Printer size={18} /> طباعة / PDF
                </button>
                <button onClick={handleExportWord} className="bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2 font-sans hover:bg-blue-800">
                    <FileDown size={18} /> تصدير Word
                </button>
            </div>
        </div>

        {/* Print Sheet */}
        <div className="flex justify-center p-4 print:p-0">
            <div className="bg-white w-[297mm] min-h-[210mm] p-[10mm] shadow-xl print:shadow-none print-container">
                
                {/* Header */}
                <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-end text-sm">
                    <div className="text-right">
                        <p className="font-bold">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                        <p>وزارة التربية الوطنية</p>
                        <p>مديرية التربية لولاية: {user.schoolName}</p>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-extrabold uppercase border-2 border-black px-6 py-2 mb-1">التدرج السنوي لبناء التعلمات</h1>
                        <p className="font-bold">السنة الدراسية: {user.academicYear}</p>
                    </div>
                    <div className="text-left">
                        <p><span className="font-bold">المادة:</span> {subject}</p>
                        <p><span className="font-bold">المستوى:</span> {level} {stream ? `(${stream})` : ''}</p>
                        <p><span className="font-bold">الأستاذ:</span> {user.name}</p>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full border-collapse border-2 border-black text-xs">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 w-12">الأسبوع</th>
                            <th className="border border-black p-2 w-16">المجال</th>
                            <th className="border border-black p-2 w-24">الوحدة التعليمية</th>
                            <th className="border border-black p-2">عناوين الدروس / الأنشطة</th>
                            <th className="border border-black p-2 w-24">ملاحظات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plan.weeks.map((week) => {
                            const items = week.assignedCurriculumIds
                                .map(id => curriculumItems.find(c => c.id === id))
                                .filter(Boolean) as any[];

                            return (
                                <tr key={week.weekNumber} className={week.weekNumber % 2 === 0 ? 'bg-gray-50' : ''}>
                                    <td className="border border-black p-2 text-center font-bold">{week.weekNumber}</td>
                                    <td className="border border-black p-2 text-center">
                                        {Array.from(new Set(items.map(i => i.domain))).join(' / ')}
                                    </td>
                                    <td className="border border-black p-2 text-center">
                                        {Array.from(new Set(items.map(i => i.unit))).join(' / ')}
                                    </td>
                                    <td className="border border-black p-2">
                                        <ul className="list-disc list-inside">
                                            {items.length > 0 ? items.map(i => (
                                                <li key={i.id}>{i.lessonTitle}</li>
                                            )) : (
                                                <span className="text-gray-400 italic print:hidden">فراغ بيداغوجي / عطلة</span>
                                            )}
                                        </ul>
                                    </td>
                                    <td className="border border-black p-2 text-center">{week.notes}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Signatures */}
                <div className="mt-8 flex justify-around text-center text-sm">
                    <div>
                        <p className="font-bold underline mb-16">الأستاذ</p>
                    </div>
                    <div>
                        <p className="font-bold underline mb-16">المدير</p>
                    </div>
                    <div>
                        <p className="font-bold underline mb-16">المفتش</p>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}
