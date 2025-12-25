
import React, { useState, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { Printer, Save, Calculator, Users, AlertTriangle, Stethoscope } from 'lucide-react';
import { MarkEntry, CurriculumStandard } from '../types';
import { CLASSES } from '../constants';

export default function MarkSheet() {
  const { user } = useUser();
  const { students, marks, updateMarks, annualPlans, updateAnnualPlans, curriculumItems, updateCurriculumItems } = useData();
  
  // Selection State
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]?.id || '');
  const [selectedTerm, setSelectedTerm] = useState<'TERM_1' | 'TERM_2' | 'TERM_3'>('TERM_1');
  const [selectedSubject, setSelectedSubject] = useState(user.subjects[0] || '');

  // Filter Students by Class
  const classStudents = useMemo(() => students.filter(s => s.classId === selectedClass), [students, selectedClass]);

  // Local state for editing marks to avoid constant re-renders/saves
  const [localMarks, setLocalMarks] = useState<Record<string, MarkEntry>>({});

  // Load existing marks into local state on selection change
  React.useEffect(() => {
    const currentMarks: Record<string, MarkEntry> = {};
    classStudents.forEach(student => {
        const found = marks.find(m => m.studentId === student.id && m.subject === selectedSubject && m.term === selectedTerm);
        if (found) {
            currentMarks[student.id] = found;
        } else {
            currentMarks[student.id] = { studentId: student.id, subject: selectedSubject, term: selectedTerm };
        }
    });
    setLocalMarks(currentMarks);
  }, [selectedClass, selectedTerm, selectedSubject, marks, classStudents]);

  const handleMarkChange = (studentId: string, field: keyof MarkEntry, value: string) => {
      const numValue = value === '' ? undefined : Number(value);
      if (numValue && (numValue < 0 || numValue > 20)) return; // Validation

      setLocalMarks(prev => ({
          ...prev,
          [studentId]: {
              ...prev[studentId],
              [field]: numValue
          }
      }));
  };

  const calculateAverage = (entry: MarkEntry) => {
      const evalMark = entry.evaluation || 0;
      const hwMark = entry.homework || 0;
      const examMark = entry.exam || 0;
      
      const cc = (evalMark + hwMark) / 2;
      const avg = (cc + (examMark * 2)) / 3;
      return avg;
  };

  const handleSave = () => {
      // 1. Save Marks
      const newMarks = [...marks.filter(m => !(m.subject === selectedSubject && m.term === selectedTerm && classStudents.some(s => s.id === m.studentId)))];
      Object.values(localMarks).forEach(m => newMarks.push(m));
      updateMarks(newMarks);

      // 2. ANALYZE FOR REMEDIATION (Pedagogical Logic)
      // Calculate failure rate based on Exam marks (assuming Exam is the main indicator)
      const scores = Object.values(localMarks).map((m: MarkEntry) => m.exam).filter(s => s !== undefined) as number[];
      
      if (scores.length > 0) {
          const underAverageCount = scores.filter(s => s < 10).length;
          const failureRate = underAverageCount / scores.length;

          // Threshold: If > 50% failed
          if (failureRate >= 0.5) {
              const confirmRemediation = window.confirm(
                  `⚠️ تنبيه بيداغوجي: نسبة التعثر في هذا القسم بلغت ${Math.round(failureRate * 100)}%.\n\n` +
                  `تطبيقاً لمبدأ "إصلاح الاعوجاج"، هل تريد إدراج حصة "معالجة بيداغوجية" آلياً في التدرج السنوي للأسبوع القادم؟`
              );

              if (confirmRemediation) {
                  injectRemediationSession();
              } else {
                  alert('تم حفظ النقاط بنجاح.');
              }
          } else {
              alert('تم حفظ النقاط بنجاح.');
          }
      } else {
          alert('تم حفظ النقاط بنجاح.');
      }
  };

  const injectRemediationSession = () => {
      const currentClassInfo = CLASSES.find(c => c.id === selectedClass);
      if (!currentClassInfo) return;

      // 1. Create a special Remediation Item
      const remediationId = `rem_${Date.now()}`;
      const remediationItem: CurriculumStandard = {
          id: remediationId,
          subject: selectedSubject,
          level: currentClassInfo.gradeLevel,
          stream: currentClassInfo.stream,
          domain: 'المعالجة البيداغوجية',
          unit: 'استدراك النقائص',
          lessonTitle: `حصة معالجة: تحليل نتائج ${selectedTerm === 'TERM_1' ? 'الفصل 1' : selectedTerm === 'TERM_2' ? 'الفصل 2' : 'الفصل 3'}`,
          targetCompetencies: ['معالجة الصعوبات المشخصة', 'تصحيح الأخطاء الشائعة'],
          suggestedDuration: 1
      };

      updateCurriculumItems([...curriculumItems, remediationItem]);

      // 2. Find the relevant Annual Plan and inject it into the next available week
      const targetPlan = annualPlans.find(p => 
          p.subject === selectedSubject && 
          p.level === currentClassInfo.gradeLevel && 
          (!p.stream || p.stream === currentClassInfo.stream)
      );

      if (targetPlan) {
          // Find first week that is not completed
          const weekIndex = targetPlan.weeks.findIndex(w => w.status !== 'COMPLETED');
          
          if (weekIndex !== -1) {
              const updatedWeeks = [...targetPlan.weeks];
              // Add to the beginning of the assigned list for priority
              updatedWeeks[weekIndex].assignedCurriculumIds = [remediationId, ...updatedWeeks[weekIndex].assignedCurriculumIds];
              updatedWeeks[weekIndex].notes = (updatedWeeks[weekIndex].notes || '') + ' [معالجة مبرمجة آلياً]';
              
              const updatedPlans = annualPlans.map(p => p.id === targetPlan.id ? { ...p, weeks: updatedWeeks } : p);
              updateAnnualPlans(updatedPlans);
              
              alert(`✅ تم إضافة حصة المعالجة بنجاح في الأسبوع ${updatedWeeks[weekIndex].weekNumber} من التدرج السنوي.`);
          } else {
              alert('لم يتم العثور على أسبوع متاح في التدرج لإضافة المعالجة.');
          }
      } else {
          alert('يرجى إنشاء تدرج سنوي لهذا المستوى أولاً ليتمكن النظام من إضافة المعالجة.');
      }
  };

  return (
    <div className="pb-20 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm no-print">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Calculator className="text-primary-600" />
                    كشف النقاط والمتابعة
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">رصد علامات التقويم المستمر والاختبارات</p>
            </div>
            <div className="flex gap-2">
                <button onClick={handleSave} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg">
                    <Save size={18} /> حفظ وتحليل
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors">
                    <Printer size={18} /> طباعة
                </button>
            </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white">
                {CLASSES.filter(c => user.levels.includes(c.gradeLevel)).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
            <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value as any)} className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white">
                <option value="TERM_1">الفصل الأول</option>
                <option value="TERM_2">الفصل الثاني</option>
                <option value="TERM_3">الفصل الثالث</option>
            </select>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white">
                {user.subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>

        {/* Sheet Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden print:border-black print:shadow-none">
            
            {/* Print Header */}
            <div className="hidden print:block p-8 border-b-2 border-black text-center">
                <h1 className="text-xl font-bold">قائمة النقاط - {selectedTerm === 'TERM_1' ? 'الفصل الأول' : selectedTerm === 'TERM_2' ? 'الفصل الثاني' : 'الفصل الثالث'}</h1>
                <div className="flex justify-between mt-4 font-bold">
                    <span>المادة: {selectedSubject}</span>
                    <span>القسم: {CLASSES.find(c => c.id === selectedClass)?.name}</span>
                    <span>السنة الدراسية: {user.academicYear}</span>
                </div>
            </div>

            <table className="w-full text-sm text-left rtl:text-right">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400 print:bg-gray-200 print:text-black border-b print:border-black">
                    <tr>
                        <th className="px-6 py-3 border-l print:border-black">الرقم</th>
                        <th className="px-6 py-3 border-l print:border-black">الاسم واللقب</th>
                        <th className="px-6 py-3 text-center border-l print:border-black w-24">التقويم (20)</th>
                        <th className="px-6 py-3 text-center border-l print:border-black w-24">الفروض (20)</th>
                        <th className="px-6 py-3 text-center border-l print:border-black w-24">الاختبار (20)</th>
                        <th className="px-6 py-3 text-center w-24 print:bg-gray-300">المعدل (20)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 print:divide-black">
                    {classStudents.map((student, idx) => {
                        const entry = localMarks[student.id] || {};
                        const average = calculateAverage(entry);
                        return (
                            <tr key={student.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 print:border-black">
                                <td className="px-6 py-4 font-bold border-l print:border-black">{idx + 1}</td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white border-l print:border-black print:text-black">{student.fullName}</td>
                                <td className="p-0 border-l print:border-black">
                                    <input 
                                        type="number" 
                                        className="w-full h-full p-4 text-center bg-transparent outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20 dark:text-white print:text-black"
                                        placeholder="-"
                                        value={entry.evaluation ?? ''}
                                        onChange={e => handleMarkChange(student.id, 'evaluation', e.target.value)}
                                        max={20} min={0}
                                    />
                                </td>
                                <td className="p-0 border-l print:border-black">
                                    <input 
                                        type="number" 
                                        className="w-full h-full p-4 text-center bg-transparent outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20 dark:text-white print:text-black"
                                        placeholder="-"
                                        value={entry.homework ?? ''}
                                        onChange={e => handleMarkChange(student.id, 'homework', e.target.value)}
                                        max={20} min={0}
                                    />
                                </td>
                                <td className="p-0 border-l print:border-black">
                                    <input 
                                        type="number" 
                                        className={`w-full h-full p-4 text-center bg-transparent outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20 dark:text-white print:text-black font-bold ${entry.exam !== undefined && entry.exam < 10 ? 'text-red-600' : ''}`}
                                        placeholder="-"
                                        value={entry.exam ?? ''}
                                        onChange={e => handleMarkChange(student.id, 'exam', e.target.value)}
                                        max={20} min={0}
                                    />
                                </td>
                                <td className={`px-6 py-4 text-center font-bold bg-slate-50 dark:bg-slate-900/50 print:bg-gray-100 print:text-black print:border-black ${average < 10 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                    {average.toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            
            {classStudents.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                    <Users size={48} className="mx-auto mb-2 opacity-50" />
                    <p>لا يوجد تلاميذ في هذا القسم</p>
                </div>
            )}
        </div>
        
        {/* Helper Note */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-start gap-3 no-print">
            <Stethoscope className="text-amber-600 dark:text-amber-500 flex-shrink-0" />
            <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">التدخل البيداغوجي الآلي</h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    إذا لاحظ النظام أن أكثر من 50% من التلاميذ حصلوا على علامة أقل من 10 في الاختبار، سيقترح عليك آلياً إضافة "حصة معالجة" في التدرج السنوي لتدارك النقائص.
                </p>
            </div>
        </div>
    </div>
  );
}
