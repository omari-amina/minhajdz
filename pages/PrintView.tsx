
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CLASSES, ALGERIAN_CURRICULUM, LESSON_TYPE_LABELS } from '../constants';
import { Printer, Settings, ArrowLeft, FileDown } from 'lucide-react';
import { Lesson } from '../types';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

export default function PrintView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lessons } = useData();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const [config, setConfig] = useState({
    showHeader: true,
    showFooter: true,
    showCompetencies: true,
    showSituation: true,
    showPrerequisites: true,
    showContent: true,
    showMaterials: true,
    showIndicators: true
  });

  useEffect(() => {
    try {
      if (id) {
        const found = lessons.find(l => l.id === id);
        if (found) {
           if (!found.classIds && (found as any).classId) found.classIds = [(found as any).classId];
           setLesson(found);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, lessons]);

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
          .text-left { text-align: left; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .underline { text-decoration: underline; }
          .text-xs { font-size: 10pt; }
          .text-sm { font-size: 11pt; }
          .text-lg { font-size: 14pt; }
          .text-xl { font-size: 16pt; }
          .border-2 { border-width: 2px; }
          .bg-gray-100, .bg-gray-200 { background-color: #f3f4f6; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
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
      link.download = `${lesson?.title || 'lesson'}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (!lesson) return <div>لم يتم العثور على الدرس</div>;

  const curriculumStandard = ALGERIAN_CURRICULUM.find(c => c.id === lesson.curriculumId);
  const classNames = (lesson.classIds || []).map(id => CLASSES.find(c => c.id === id)?.name).join('، ');

  // Subject Modules Logic
  const isEnglish = lesson.subject?.toLowerCase().includes('english') || lesson.subject?.includes('إنجليزية');
  const isMath = lesson.subject?.includes('رياضيات');
  const isCS = lesson.subject?.includes('معلوماتية') || lesson.subject?.includes('تكنولوجيا');
  const isArabic = lesson.subject?.includes('عربية');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col md:flex-row font-serif text-black" dir={isEnglish ? "ltr" : "rtl"}>
       <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body { background: white; margin: 0; }
            .no-print { display: none !important; }
            .print-container {
               width: 100%; box-shadow: none; margin: 0; height: auto;
               border: none;
            }
            
            /* Force exact black for all text */
            p, h1, h2, h3, h4, h5, h6, span, div, td, th, li {
                color: #000000 !important;
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
            }

            /* Ensure borders print black */
            *, *::before, *::after {
                border-color: #000000 !important;
            }
            
            /* Explicitly set backgrounds for table headers to light gray */
            .bg-gray-100, .bg-gray-200, .bg-gray-50 {
                background-color: #f3f4f6 !important;
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
            }
          }
        `}
      </style>

      <aside className="w-80 bg-white p-6 no-print hidden md:block border-l h-screen sticky top-0 overflow-y-auto" dir="rtl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-slate-500 hover:text-black">
            <ArrowLeft size={18} /> رجوع
        </button>
        <h2 className="font-bold mb-4 flex items-center gap-2"><Settings size={18}/> إعدادات الطباعة</h2>
        
        <div className="space-y-2 text-sm">
            <h3 className="font-bold mt-4 text-xs uppercase text-slate-400">العناصر العامة</h3>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={config.showHeader} onChange={e => setConfig({...config, showHeader: e.target.checked})} /> الترويسة الرسمية</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={config.showFooter} onChange={e => setConfig({...config, showFooter: e.target.checked})} /> التذييل (التوقيعات)</label>
            <h3 className="font-bold mt-4 text-xs uppercase text-slate-400">التفاصيل</h3>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={config.showCompetencies} onChange={e => setConfig({...config, showCompetencies: e.target.checked})} /> الأهداف والكفاءات</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={config.showPrerequisites} onChange={e => setConfig({...config, showPrerequisites: e.target.checked})} /> المكتسبات القبلية</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={config.showMaterials} onChange={e => setConfig({...config, showMaterials: e.target.checked})} /> الوسائل</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={config.showIndicators} onChange={e => setConfig({...config, showIndicators: e.target.checked})} /> مؤشرات الأداء</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={config.showSituation} onChange={e => setConfig({...config, showSituation: e.target.checked})} /> وضعية الانطلاق</label>
        </div>

        <button onClick={handlePrint} className="mt-8 w-full bg-black text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
            <Printer size={20} /> طباعة / PDF
        </button>
        <button onClick={handleExportWord} className="mt-3 w-full bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors">
            <FileDown size={20} /> تصدير Word
        </button>
      </aside>

      <div className="flex-1 p-8 print:p-0 flex justify-center bg-gray-100 print:bg-white">
        <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-xl print:shadow-none print-container text-black text-sm leading-normal relative flex flex-col" dir={isEnglish ? "ltr" : "rtl"}>
            
            {config.showHeader && (
                <div className="mb-4" dir="rtl">
                    <div className="text-center font-bold text-xs mb-2">
                        <p>الجمهورية الجزائرية الديمقراطية الشعبية</p>
                        <p>وزارة التربية الوطنية</p>
                    </div>
                    <div className="border-2 border-black flex text-xs">
                        <div className="flex-1 p-2 border-l border-black text-right space-y-1">
                            <p><span className="font-bold">المؤسسة:</span> {user.schoolName}</p>
                            <p><span className="font-bold">الأستاذ:</span> {user.name}</p>
                        </div>
                        <div className="flex-1 p-2 flex flex-col items-center justify-center bg-gray-100">
                             <h1 className="font-extrabold text-xl uppercase border-b-2 border-black mb-1">مذكرة بيداغوجية</h1>
                             <span className="font-bold">{LESSON_TYPE_LABELS[lesson.type] || 'درس نظري'}</span>
                             {isCS && lesson.subjectDetails?.csPractical && <span className="text-xs font-bold border border-black px-2 mt-1">(حصة تطبيقية TP)</span>}
                        </div>
                        <div className="flex-1 p-2 border-r border-black text-left space-y-1">
                            <p><span className="font-bold">المادة:</span> {curriculumStandard?.subject}</p>
                            <p><span className="font-bold">السنة الدراسية:</span> {user.academicYear}</p>
                        </div>
                    </div>
                </div>
            )}

            <table className="w-full border-2 border-black mb-3 text-center text-xs" dir="rtl">
                <thead className="bg-gray-100 font-bold">
                    <tr>
                        <td className="border border-black p-1 w-1/4">المستوى / الشعبة</td>
                        <td className="border border-black p-1 w-1/4">المجال / {isEnglish ? 'Domain' : 'الميدان'}</td>
                        <td className="border border-black p-1 w-1/4">الوحدة / {isEnglish ? 'Unit' : 'الوحدة'}</td>
                        <td className="border border-black p-1 w-1/4">الحجم الساعي</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black p-1 font-bold">{classNames}</td>
                        <td className="border border-black p-1">{lesson.domain}</td>
                        <td className="border border-black p-1">{lesson.unit}</td>
                        <td className="border border-black p-1 font-mono text-base font-bold">{lesson.duration || 60} min</td>
                    </tr>
                </tbody>
            </table>

            {/* Subject Specific Top Modules */}
            {isEnglish && lesson.subjectDetails?.englishSkills && (
                 <div className="border-2 border-black mb-3 p-1 flex gap-4 text-xs">
                    <span className="font-bold underline">Target Skills:</span>
                    {['Listening', 'Speaking', 'Reading', 'Writing'].map(skill => (
                        <span key={skill} className="flex items-center gap-1">
                            <span className={`inline-block w-3 h-3 border border-black ${lesson.subjectDetails?.englishSkills?.includes(skill as any) ? 'bg-black' : 'bg-white'}`}></span>
                            {skill}
                        </span>
                    ))}
                 </div>
            )}

            {isArabic && lesson.subjectDetails?.arabicDomain && (
                <div className="border-2 border-black mb-3 p-1.5 bg-gray-50 text-center font-bold text-sm" dir="rtl">
                    النشاط: {lesson.subjectDetails.arabicDomain}
                </div>
            )}

            {/* Pedagogical Frame */}
            <div className="border-2 border-black mb-3">
                 <div className="bg-gray-100 font-bold p-1 text-center text-xs border-b border-black">
                     {isEnglish ? 'Pedagogical Framework (Competency Based Approach)' : 'الإطار البيداغوجي (المقاربة بالكفاءات)'}
                 </div>
                 
                 <div className="p-1.5 border-b border-black flex">
                    <span className="font-bold underline w-32 shrink-0">{isEnglish ? 'Lesson Topic:' : 'الموضوع (المورد):'}</span> 
                    <span className="font-bold text-base">{lesson.title}</span>
                 </div>

                 {config.showCompetencies && (
                    <div className="p-1.5 border-b border-black">
                        <p className="font-bold underline mb-1">{isEnglish ? 'Learning Objectives / Competencies:' : 'مركبات الكفاءة (الأهداف التعلمية):'}</p>
                        <ul className={`list-disc list-inside text-xs space-y-0.5 ${isEnglish ? 'pl-2' : 'pr-2'}`}>
                            {lesson.objectives.map((o,i) => <li key={i}>{o}</li>)}
                        </ul>
                    </div>
                 )}

                 {isEnglish && lesson.subjectDetails?.englishTask && (
                    <div className="p-1.5 border-b border-black bg-gray-50">
                        <p className="font-bold underline mb-1">Communicative Task:</p>
                        <p className="text-xs italic">{lesson.subjectDetails.englishTask}</p>
                    </div>
                 )}

                 <div className="grid grid-cols-2">
                     {config.showPrerequisites && (
                        <div className={`p-1.5 ${isEnglish ? 'border-r' : 'border-l'} border-black`}>
                            <p className="font-bold underline mb-1">{isEnglish ? 'Prerequisites:' : 'المكتسبات القبلية:'}</p>
                            <p className="text-xs whitespace-pre-wrap">{lesson.prerequisites || '-'}</p>
                        </div>
                     )}
                     {config.showIndicators && (
                        <div className="p-1.5">
                            <p className="font-bold underline mb-1">{isEnglish ? 'Performance Indicators:' : 'مؤشرات الأداء:'}</p>
                            <p className="text-xs whitespace-pre-wrap">{lesson.performanceIndicators || '-'}</p>
                        </div>
                     )}
                 </div>
                 
                 {config.showMaterials && (
                    <div className="p-1.5 border-t border-black">
                        <span className="font-bold underline">{isEnglish ? 'Materials / Aids:' : 'الوسائل والدعائم:'}</span> {lesson.materials || (isEnglish ? 'Whiteboard, Textbook, Data show.' : 'السبورة، الكتاب المدرسي، جهاز العرض.')}
                    </div>
                 )}
            </div>

            {config.showSituation && (
                <div className="border-2 border-black mb-3 p-1.5 bg-gray-50 break-inside-avoid">
                    <span className="font-bold underline">{isEnglish ? 'Warm up / Situation:' : 'وضعية الانطلاق / الوضعية المشكلة:'}</span>
                    <p className="mt-1 text-sm italic leading-relaxed text-justify px-2">
                        {lesson.learningSituation || '...................................................'}
                    </p>
                </div>
            )}

            {config.showContent && (
                <>
                    <h3 className="font-bold border-b-2 border-black inline-block mb-1 text-xs">{isEnglish ? 'Lesson Procedure:' : 'سيرورة التعلم:'}</h3>
                    <table className="w-full border-2 border-black mb-4 table-fixed">
                        <thead className="bg-gray-200 font-bold text-center text-xs">
                            <tr>
                                <td className="border border-black p-1 w-[40%]">{isEnglish ? 'Steps / Phases' : 'المراحل وسيرورة الحصة'}</td>
                                <td className="border border-black p-1 w-[40%]">{isEnglish ? 'Activities' : 'الأنشطة (تعليم / تعلم)'}</td>
                                <td className="border border-black p-1 w-[20%]">{isEnglish ? 'Assessment' : 'الوسائل والتقويم'}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black p-2 align-top text-xs min-h-[300px]">
                                    <div className="whitespace-pre-wrap leading-relaxed text-justify font-serif" dir={isEnglish ? "ltr" : "rtl"}>
                                        {lesson.theoreticalContent || '...................'}
                                    </div>
                                </td>
                                <td className="border border-black p-2 align-top text-xs border-l border-r">
                                    <div className="whitespace-pre-wrap leading-relaxed" dir={isEnglish ? "ltr" : "rtl"}>
                                        {lesson.practicalContent || '...................'}
                                    </div>
                                </td>
                                <td className="border border-black p-2 text-center align-top text-xs">
                                    <div className="mb-4">
                                        <p className="font-bold underline">{isEnglish ? 'Materials:' : 'الوسائل:'}</p>
                                        <p>{isEnglish ? 'Board' : 'السبورة'}</p>
                                    </div>
                                    <div className="border-t border-black pt-2">
                                        <p className="font-bold underline">{isEnglish ? 'Assessment:' : 'التقويم:'}</p>
                                        <p className="mt-1">{lesson.notes || (isEnglish ? 'Observation' : 'ملاحظة ومتابعة')}</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>
            )}

            {isMath && (lesson.subjectDetails?.mathMistakes || lesson.subjectDetails?.mathRemediation) && (
                <div className="border-2 border-black mb-3 grid grid-cols-2 text-xs break-inside-avoid" dir="rtl">
                    <div className="p-1 border-l border-black">
                        <span className="font-bold text-red-700 underline">الأخطاء الشائعة المتوقعة:</span>
                        <p>{lesson.subjectDetails.mathMistakes}</p>
                    </div>
                    <div className="p-1">
                        <span className="font-bold text-green-700 underline">العلاج البيداغوجي:</span>
                        <p>{lesson.subjectDetails.mathRemediation}</p>
                    </div>
                </div>
            )}

            <div className="mt-auto border border-black p-2 mb-4 break-inside-avoid">
                <span className="font-bold underline text-xs">{isEnglish ? 'Homework:' : 'العمل المنزلي:'}</span>
                <p className="text-xs mt-1 inline-block mr-2">{lesson.homework || '...................'}</p>
            </div>

            {config.showFooter && (
              <div className="flex justify-between mt-2 text-xs font-bold px-8 break-inside-avoid" dir="rtl">
                  <div>إمضاء الأستاذ</div>
                  <div>تأشيرة المفتش</div>
                  <div>تأشيرة المدير</div>
              </div>
            )}

        </div>
      </div>
    </div>
  );
}
