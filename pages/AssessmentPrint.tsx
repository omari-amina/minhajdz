
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Settings, FileDown } from 'lucide-react';
import { Assessment, QuestionType } from '../types';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

export default function AssessmentPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assessments } = useData();
  const { user } = useUser();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  
  // Print Settings
  const [showGrid, setShowGrid] = useState(false);
  const [columns, setColumns] = useState(1);

  if (!user) return null;

  useEffect(() => {
    if (id) {
        const found = assessments.find(a => a.id === id);
        if (found) setAssessment(found);
    }
  }, [id, assessments]);

  const handleExportWord = () => {
    const content = document.querySelector('.print-container')?.innerHTML;
    if (!content) return;

    const styles = `
      <style>
        body { font-family: 'Times New Roman', serif; text-align: right; direction: rtl; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .underline { text-decoration: underline; }
        .text-sm { font-size: 12pt; }
        .border-2 { border: 2px solid black; }
        .border-b-2 { border-bottom: 2px solid black; }
        .grid { display: block; } /* Fallback for Word */
        .flex { display: flex; }
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
    link.download = `${assessment?.title || 'exam'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!assessment) return <div>جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col md:flex-row font-serif text-black" dir="rtl">
        <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 15mm; }
            body { background: white; margin: 0; }
            .no-print { display: none !important; }
            .print-container { width: 100%; box-shadow: none; margin: 0; height: auto; border: none; padding: 0; }
            p, h1, h2, h3, span, li, td, th { color: black !important; }
            *, *::before, *::after { border-color: black !important; }
          }
        `}
        </style>

        {/* Sidebar Settings */}
        <aside className="w-80 bg-white p-6 no-print hidden md:block border-l h-screen sticky top-0 overflow-y-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-slate-500 hover:text-black">
                <ArrowLeft size={18} /> رجوع
            </button>
            <h2 className="font-bold mb-4 flex items-center gap-2"><Settings size={18}/> إعدادات الطباعة</h2>
            <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} /> 
                    إظهار شبكة الإجابة (للمسودة)
                </label>
                <div>
                    <label className="block text-sm font-medium mb-1">عدد الأعمدة (للاقتصاد في الورق)</label>
                    <div className="flex gap-2">
                        <button onClick={() => setColumns(1)} className={`flex-1 py-2 border rounded ${columns === 1 ? 'bg-black text-white' : ''}`}>1</button>
                        <button onClick={() => setColumns(2)} className={`flex-1 py-2 border rounded ${columns === 2 ? 'bg-black text-white' : ''}`}>2</button>
                    </div>
                </div>
            </div>
            <button onClick={() => window.print()} className="mt-8 w-full bg-black text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                <Printer size={20} /> طباعة / PDF
            </button>
            <button onClick={handleExportWord} className="mt-3 w-full bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors">
                <FileDown size={20} /> تصدير Word
            </button>
        </aside>

        {/* Exam Paper */}
        <div className="flex-1 p-8 print:p-0 flex justify-center bg-gray-100 print:bg-white">
            <div className="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-xl print:shadow-none print-container text-black text-sm leading-relaxed relative flex flex-col">
                
                {/* Header */}
                <div className="border-b-2 border-black pb-4 mb-6">
                    <div className="flex justify-between items-start text-sm">
                        <div className="text-right">
                            <p className="font-bold">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                            <p>وزارة التربية الوطنية</p>
                            <p className="mt-1">المؤسسة: {user.schoolName}</p>
                        </div>
                        <div className="text-left">
                            <p>الأستاذ: {user.name}</p>
                            <p>السنة الدراسية: {user.academicYear}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-6 border-2 border-black p-2 bg-gray-50 print:bg-transparent">
                        <div className="flex-1 text-center border-l border-black">
                            <span className="block text-xs font-bold text-gray-500">المستوى</span>
                            <span className="font-bold text-lg">{assessment.level}</span>
                        </div>
                        <div className="flex-[2] text-center">
                            <h1 className="text-xl font-extrabold uppercase">{assessment.title}</h1>
                            <p className="text-sm mt-1">مادة: {assessment.subject}</p>
                        </div>
                        <div className="flex-1 text-center border-r border-black">
                            <span className="block text-xs font-bold text-gray-500">المدة</span>
                            <span className="font-bold text-lg">{assessment.duration} د</span>
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className={`grid ${columns === 2 ? 'grid-cols-2 gap-8' : 'grid-cols-1 gap-6'}`}>
                    {assessment.questions.map((q, idx) => (
                        <div key={q.id} className="relative break-inside-avoid">
                            <div className="flex justify-between items-baseline mb-2">
                                <h3 className="font-bold text-base underline decoration-2 decoration-gray-400">السؤال {idx + 1}:</h3>
                                <span className="text-xs font-bold border border-black rounded-full w-6 h-6 flex items-center justify-center">{q.points}</span>
                            </div>
                            <p className="mb-3 text-justify font-medium">{q.text}</p>
                            
                            {/* Competency Tag in Print (Optional but helpful for grading) */}
                            {q.linkedCompetency && (
                                <p className="text-[10px] text-gray-500 italic mb-2">({q.linkedCompetency})</p>
                            )}

                            {q.type === QuestionType.MCQ && (
                                <ul className="list-decimal list-inside space-y-1 mr-4">
                                    {q.options?.map((opt, i) => (
                                        <li key={i}>{opt}</li>
                                    ))}
                                </ul>
                            )}

                            {q.type === QuestionType.TRUE_FALSE && (
                                <div className="mr-4 space-y-2">
                                    <div className="flex gap-8 border-b border-black pb-1 w-fit">
                                        <span className="font-bold flex items-center gap-2"><span className="inline-block w-4 h-4 border border-black"></span> صواب</span>
                                        <span className="font-bold flex items-center gap-2"><span className="inline-block w-4 h-4 border border-black"></span> خطأ</span>
                                    </div>
                                    {q.justificationRequired && (
                                        <div>
                                            <span className="text-xs font-bold underline">التعليل:</span>
                                            <div className="border-b border-black border-dashed h-6 w-full mt-1"></div>
                                            <div className="border-b border-black border-dashed h-6 w-full"></div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Wayground QR Code Block */}
                            {q.type === QuestionType.WAYGROUND_LINK && q.waygroundUrl && (
                                <div className="border border-black p-4 flex items-center gap-4 bg-gray-50 print:bg-white">
                                    {/* Using a public API for QR generation. In real prod, use a library like qrcode.react */}
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(q.waygroundUrl)}`} 
                                        alt="Scan to access"
                                        className="w-20 h-20 border border-black" 
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-sm mb-1">نشاط رقمي تفاعلي</p>
                                        <p className="text-xs mb-2">امسح الرمز المقابل باستخدام هاتفك للوصول إلى النشاط.</p>
                                        <p className="text-[10px] font-mono border-t border-black pt-1 truncate dir-ltr text-left">{q.waygroundUrl}</p>
                                    </div>
                                </div>
                            )}

                            {showGrid && q.type !== QuestionType.TRUE_FALSE && q.type !== QuestionType.WAYGROUND_LINK && (
                                <div className="w-full h-24 border border-gray-300 mt-2" style={{ backgroundImage: 'linear-gradient(white 2px, transparent 2px), linear-gradient(90deg, white 2px, transparent 2px), linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-auto pt-8 text-center border-t border-black">
                    <p className="font-bold text-lg italic">بالتوفيق والنجاح</p>
                </div>

            </div>
        </div>
    </div>
  );
}
