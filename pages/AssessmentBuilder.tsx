
import React, { useState, useMemo, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { Assessment, Question, QuestionType, DifficultyLevel } from '../types';
import { DEFAULT_QUESTION_BANK, ASSESSMENT_TEMPLATES } from '../constants';
import { Plus, Save, Trash2, CheckSquare, AlignLeft, Image as ImageIcon, Eye, Archive, Layout, Search, ExternalLink, PenTool, Sparkles, Loader2, Bot, FileText, Printer, FileInput, Copy, ArrowUp, ArrowDown, Target, HelpCircle, CheckCircle2, Globe, Link as LinkIcon, QrCode, History, FolderOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";

// Mock Wayground Activities
const MOCK_WAYGROUND_ACTIVITIES = [
    { id: 'wg_1', title: 'تمرين تفاعلي: الدوال الأسية', url: 'https://wayground.com/act/exp_func', topic: 'رياضيات' },
    { id: 'wg_2', title: 'محاكاة: الدارة الكهربائية RC', url: 'https://wayground.com/act/sim_rc', topic: 'فيزياء' },
    { id: 'wg_3', title: 'Quiz: Past Perfect Tense', url: 'https://wayground.com/act/en_quiz_1', topic: 'لغة إنجليزية' },
    { id: 'wg_4', title: 'مشروع: تصميم مخطط منزل', url: 'https://wayground.com/act/civ_plan', topic: 'هندسة مدنية' },
];

export default function AssessmentBuilder() {
  const { user, currentContext } = useUser();
  const { assessments, updateAssessments, curriculumItems } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  // Active Tab
  const [activeTab, setActiveTab] = useState<'create' | 'bank' | 'templates' | 'ai' | 'history'>('create');

  // Wayground Picker State
  const [showWaygroundPicker, setShowWaygroundPicker] = useState(false);

  // Question Bank Filters
  const [bankFilters, setBankFilters] = useState({
      search: '',
      difficulty: 'all',
      unit: 'all'
  });

  const [metadata, setMetadata] = useState<Partial<Assessment>>({
    title: 'فرض محروس رقم 1',
    subject: currentContext.subject, // Init from Context
    level: user.levels[0] || '1AS',
    term: 'TERM_1',
    type: 'TEST',
    duration: 60,
    totalPoints: 20,
    questions: []
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Sync Metadata subject when Context changes
  useEffect(() => {
      setMetadata(prev => ({ ...prev, subject: currentContext.subject }));
  }, [currentContext.subject]);

  // Load generated data from state (Lesson Planner redirect)
  useEffect(() => {
      if (location.state?.generatedQuestions) {
          const { generatedQuestions, sourceLesson } = location.state;
          setQuestions(generatedQuestions);
          if (sourceLesson) {
              setMetadata(prev => ({
                  ...prev,
                  title: `تقويم: ${sourceLesson.title}`,
                  subject: sourceLesson.subject || prev.subject,
                  level: sourceLesson.level || prev.level
              }));
          }
          // Clear state so reload doesn't duplicates or mess up
          window.history.replaceState({}, document.title);
      }
  }, [location.state]);

  // --- AI Generation State ---
  const [aiContext, setAiContext] = useState({
      topic: '',
      count: 3,
      type: 'MIXED' as 'MIXED' | QuestionType,
      difficulty: 'MEDIUM' as DifficultyLevel,
      target: 'EXAM' as 'EXAM' | 'WORKSHEET' | 'HOMEWORK'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Available Competencies for Linking ---
  const availableCompetencies = useMemo(() => {
      return curriculumItems
        .filter(c => c.subject === metadata.subject && c.level === metadata.level)
        .flatMap(c => c.targetCompetencies)
        .filter((v, i, a) => a.indexOf(v) === i); // Unique
  }, [metadata.subject, metadata.level, curriculumItems]);

  // --- CRUD Logic ---

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: `q_${Date.now()}`,
      text: type === QuestionType.WAYGROUND_LINK ? 'نشاط تفاعلي على منصة Wayground' : '',
      type,
      points: 2,
      options: type === QuestionType.MCQ ? ['خيار 1', 'خيار 2'] : undefined,
      difficulty: DifficultyLevel.MEDIUM,
      gradingRubric: '',
      modelAnswer: '',
      justificationRequired: type === QuestionType.TRUE_FALSE
    };
    setQuestions([...questions, newQ]);
    setEditingQuestionId(newQ.id);
  };

  const handleSelectWaygroundActivity = (activity: any) => {
      const newQ: Question = {
          id: `q_wg_${Date.now()}`,
          text: `نشاط: ${activity.title}`,
          type: QuestionType.WAYGROUND_LINK,
          points: 5,
          difficulty: DifficultyLevel.MEDIUM,
          gradingRubric: 'يتم التصحيح آلياً عبر المنصة',
          modelAnswer: '',
          waygroundId: activity.id,
          waygroundUrl: activity.url
      };
      setQuestions([...questions, newQ]);
      setShowWaygroundPicker(false);
  };

  const duplicateQuestion = (q: Question, e: React.MouseEvent) => {
      e.stopPropagation();
      const newQ = { 
          ...q, 
          id: `q_${Date.now()}_dup`,
          text: q.text + ' (نسخة)',
          options: q.options ? [...q.options] : undefined
      };
      // Insert after current
      const idx = questions.findIndex(item => item.id === q.id);
      const newQuestions = [...questions];
      newQuestions.splice(idx + 1, 0, newQ);
      setQuestions(newQuestions);
      setEditingQuestionId(newQ.id);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
      e.stopPropagation();
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === questions.length - 1) return;

      const newQuestions = [...questions];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
      setQuestions(newQuestions);
  };

  const addFromBank = (q: Question) => {
      const newQ = { ...q, id: `q_${Date.now()}_copy` };
      setQuestions([...questions, newQ]);
  };

  const loadAssessment = (a: Assessment) => {
      if (questions.length > 0 && !window.confirm('سيتم استبدال العمل الحالي بالاختبار المختار. هل أنت متأكد؟')) return;
      
      setMetadata({
          title: a.title,
          subject: a.subject,
          level: a.level,
          term: a.term,
          type: a.type,
          duration: a.duration,
          totalPoints: a.totalPoints
      });
      // Deep copy questions to generate new IDs and avoid referencing stored object
      setQuestions(a.questions.map(q => ({...q, id: `q_${Date.now()}_${Math.random().toString(36).substr(2,5)}` })));
      setActiveTab('create');
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  // Helper to insert Standard Integration Criteria
  const insertIntegrationRubric = (qId: string) => {
      const standardCriteria = 
`1. الوجاهة (الملائمة): فهم المشكلة واستعمال الأدوات المناسبة.
2. الاستعمال السليم لأدوات المادة: تطبيق النظريات والقوانين بشكل صحيح.
3. الانسجام: تسلسل منطقي للإجابة.
4. الإتقان والإبداع: نظافة الورقة وتميز العرض.`;
      
      const q = questions.find(item => item.id === qId);
      if (q) {
          updateQuestion(qId, 'gradingRubric', (q.gradingRubric ? q.gradingRubric + '\n\n' : '') + standardCriteria);
      }
  };

  const handleSave = () => {
    if (!metadata.title || !metadata.subject) return alert("يرجى ملء البيانات الأساسية");
    
    // Check if updating existing (based on title + date? simplified here to always create new version for safety)
    const newAssessment: Assessment = {
      id: `a_${Date.now()}`,
      ...metadata,
      questions,
      dateCreated: new Date().toISOString().split('T')[0],
      isGenerated: activeTab === 'ai' // Flag if primarily made by AI
    } as Assessment;

    updateAssessments([newAssessment, ...assessments]);
    alert("تم حفظ المحتوى بنجاح في الأرشيف (Offline)");
  };

  const handlePrintPreview = () => {
      const tempId = `temp_${Date.now()}`;
      const newAssessment: Assessment = {
        id: tempId,
        ...metadata,
        questions,
        dateCreated: new Date().toISOString().split('T')[0],
      } as Assessment;
      // Temporary save to context so Print page can find it
      updateAssessments([newAssessment, ...assessments]);
      navigate(`/assessments/${tempId}/print`);
  };

  const currentTotal = questions.reduce((sum, q) => sum + Number(q.points), 0);

  // Bank Filtering
  const filteredBank = useMemo(() => {
      return (DEFAULT_QUESTION_BANK as Question[]).filter(q => {
          const matchSearch = q.text.toLowerCase().includes(bankFilters.search.toLowerCase()) || q.tags?.some(t => t.includes(bankFilters.search));
          const matchDiff = bankFilters.difficulty === 'all' || q.difficulty === bankFilters.difficulty;
          const matchUnit = bankFilters.unit === 'all' || q.unit === bankFilters.unit;
          return matchSearch && matchDiff && matchUnit;
      });
  }, [bankFilters]);

  // Saved Assessments Filtering
  const savedAssessments = useMemo(() => {
      return assessments.filter(a => a.subject === metadata.subject);
  }, [assessments, metadata.subject]);

  // --- AI Generator Function ---
  const generateAIContent = async () => {
    if (!aiContext.topic) return;
    
    // Check for API Key presence
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey.trim() === '') {
        alert('عذراً، مفتاح الربط (API Key) غير متوفر.');
        return;
    }

    setIsGenerating(true);

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        let promptContext = "";
        if (aiContext.target === 'WORKSHEET') {
            promptContext = "Generate a practice worksheet with applied exercises. Focus on drill and practice.";
        } else if (aiContext.target === 'HOMEWORK') {
            promptContext = "Generate homework questions that encourage research or application at home. Scaffolding difficulty.";
        } else {
            promptContext = "Generate formal exam questions (Assessment). Strict and clear.";
        }

        const systemPrompt = `
            Act as an Algerian curriculum expert teacher for subject "${metadata.subject}" level "${metadata.level}".
            Task: ${promptContext}
            Topic: "${aiContext.topic}".
            Question Count: ${aiContext.count}.
            Difficulty: ${aiContext.difficulty}.
            Language: Arabic (unless subject requires English/French).
            
            Return a JSON array of questions. Each object must have:
            - text (string)
            - type (MCQ or TEXT or TRUE_FALSE)
            - points (number)
            - options (array of strings, only if MCQ)
            - modelAnswer (string)
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: systemPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING, description: "Question stem" },
                            type: { type: Type.STRING, enum: ["MCQ", "TEXT", "TRUE_FALSE"] },
                            points: { type: Type.NUMBER },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            modelAnswer: { type: Type.STRING }
                        },
                        required: ["text", "points", "modelAnswer"]
                    }
                }
            }
        });

        if (response.text) {
            const rawQuestions = JSON.parse(response.text);
            const formattedQuestions: Question[] = rawQuestions.map((q: any) => ({
                id: `q_ai_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                type: q.type === 'MCQ' ? QuestionType.MCQ : q.type === 'TRUE_FALSE' ? QuestionType.TRUE_FALSE : QuestionType.TEXT,
                text: q.text,
                points: q.points || (aiContext.target === 'HOMEWORK' ? 5 : 2),
                options: q.options || [],
                modelAnswer: q.modelAnswer,
                difficulty: aiContext.difficulty,
                gradingRubric: '',
                justificationRequired: q.type === 'TRUE_FALSE'
            }));
            
            setQuestions(prev => [...prev, ...formattedQuestions]);
            
            // Auto-update title if empty
            if (metadata.title?.includes('رقم 1')) {
                setMetadata(prev => ({ 
                    ...prev, 
                    title: aiContext.target === 'WORKSHEET' ? `ورقة عمل: ${aiContext.topic}` : 
                           aiContext.target === 'HOMEWORK' ? `واجب منزلي: ${aiContext.topic}` : 
                           `اختبار: ${aiContext.topic}`,
                    type: aiContext.target === 'WORKSHEET' ? 'WORKSHEET' : 
                          aiContext.target === 'HOMEWORK' ? 'HOMEWORK' : 'TEST'
                }));
            }

            alert(`تم توليد المحتوى بنجاح!`);
            setActiveTab('create'); // Switch to editor to review
        }

    } catch (error) {
        console.error("AI Generation Error:", error);
        alert("فشل الاتصال بخدمة الذكاء الاصطناعي. تحقق من الإنترنت.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 relative">
      {/* Left: Editor & Preview */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
        {/* Paper Header Preview */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white text-black font-serif">
           <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end text-sm">
             <div className="text-right">
                 <p className="font-bold">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                 <p>وزارة التربية الوطنية</p>
                 <p className="mt-1">المؤسسة: {user.schoolName}</p>
             </div>
             <div className="text-center">
                 <h1 className="text-xl font-extrabold border-2 border-black px-4 py-1 rounded inline-block mb-1">{metadata.title}</h1>
                 <p>{metadata.term === 'TERM_1' ? 'الفصل الأول' : metadata.term === 'TERM_2' ? 'الفصل الثاني' : 'الفصل الثالث'}</p>
             </div>
             <div className="text-left">
                 <p>المادة: {metadata.subject}</p>
                 <p>المستوى: {metadata.level}</p>
                 <p>المدة: {metadata.duration} دقيقة</p>
             </div>
           </div>

           {/* Questions Area */}
           <div className="space-y-6">
              {questions.length === 0 && (
                <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-lg bg-slate-50 font-sans">
                  <p>المحتوى فارغ حالياً.</p>
                  <p className="text-sm mt-2">استخدم "المولد الذكي" لإنشاء أسئلة أو أوراق عمل بسرعة، أو أضف أسئلة يدوياً.</p>
                </div>
              )}
              {questions.map((q, idx) => (
                <div key={q.id} onClick={() => setEditingQuestionId(q.id)} className={`group relative pl-4 pr-2 py-3 rounded border transition-all cursor-pointer ${editingQuestionId === q.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'hover:bg-slate-50 border-transparent hover:border-slate-200'}`}>
                   {/* Question Header */}
                   <div className="flex justify-between items-start mb-2 gap-4">
                      <div className="flex gap-2 flex-1">
                        <span className="font-bold whitespace-nowrap pt-1">س {idx + 1}:</span>
                        <div className="flex-1">
                            {q.type === QuestionType.WAYGROUND_LINK ? (
                                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-3">
                                    <Globe className="text-indigo-600" size={24} />
                                    <div className="flex-1">
                                        <input 
                                            value={q.text} 
                                            onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                            className="w-full bg-transparent font-bold text-indigo-900 outline-none placeholder-indigo-300"
                                            placeholder="عنوان النشاط الرقمي"
                                        />
                                        <div className="flex items-center gap-2 mt-1 text-xs text-indigo-600">
                                            <LinkIcon size={12} />
                                            <input 
                                                value={q.waygroundUrl || ''}
                                                onChange={(e) => updateQuestion(q.id, 'waygroundUrl', e.target.value)}
                                                className="w-full bg-transparent outline-none underline"
                                                placeholder="https://wayground.com/..."
                                            />
                                        </div>
                                    </div>
                                    <span className="text-[10px] bg-white px-2 py-1 rounded border border-indigo-100 text-indigo-500">Wayground Activity</span>
                                </div>
                            ) : (
                                <textarea 
                                value={q.text} 
                                onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                className="w-full bg-transparent resize-none outline-none font-medium border-b border-dashed border-transparent hover:border-slate-400 focus:border-blue-500 min-h-[3rem]"
                                placeholder="نص السؤال..."
                                />
                            )}
                            
                            {/* Competency Tag */}
                            {q.linkedCompetency && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded mt-1">
                                    <Target size={10} /> {q.linkedCompetency}
                                </span>
                            )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                         <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            <input 
                            type="number" 
                            value={q.points} 
                            onChange={(e) => updateQuestion(q.id, 'points', Number(e.target.value))}
                            className="w-8 bg-transparent text-center font-bold outline-none text-sm"
                            />
                            <span className="text-xs text-slate-500">ن</span>
                         </div>
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e) => moveQuestion(idx, 'up', e)} disabled={idx === 0} className="text-slate-400 hover:text-blue-600 p-1 disabled:opacity-30"><ArrowUp size={14} /></button>
                             <button onClick={(e) => moveQuestion(idx, 'down', e)} disabled={idx === questions.length - 1} className="text-slate-400 hover:text-blue-600 p-1 disabled:opacity-30"><ArrowDown size={14} /></button>
                             <button onClick={(e) => duplicateQuestion(q, e)} className="text-slate-400 hover:text-green-600 p-1" title="تكرار"><Copy size={14} /></button>
                             <button onClick={(e) => { e.stopPropagation(); setQuestions(questions.filter(qi => qi.id !== q.id)); }} className="text-red-400 hover:text-red-600 p-1" title="حذف"><Trash2 size={14} /></button>
                         </div>
                      </div>
                   </div>

                   {/* Options for MCQ */}
                   {q.type === QuestionType.MCQ && (
                     <div className="mr-8 mb-2 space-y-1">
                        {q.options?.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full border border-black"></div>
                              <input 
                                type="text" 
                                value={opt}
                                onChange={(e) => {
                                    const newOpts = [...(q.options || [])];
                                    newOpts[i] = e.target.value;
                                    updateQuestion(q.id, 'options', newOpts);
                                }}
                                className="bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-sm w-full"
                              />
                          </div>
                        ))}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                updateQuestion(q.id, 'options', [...(q.options || []), `خيار ${q.options?.length ? q.options.length + 1 : 1}`]);
                            }}
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                        >
                            <Plus size={12} /> إضافة خيار
                        </button>
                     </div>
                   )}

                   {/* True/False Specifics */}
                   {q.type === QuestionType.TRUE_FALSE && (
                       <div className="mr-8 mb-2">
                           <div className="flex gap-4 text-sm mb-2">
                               <label className="flex items-center gap-2"><input type="checkbox" disabled /> صواب</label>
                               <label className="flex items-center gap-2"><input type="checkbox" disabled /> خطأ</label>
                           </div>
                           <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                               <input 
                                type="checkbox" 
                                checked={q.justificationRequired}
                                onChange={(e) => updateQuestion(q.id, 'justificationRequired', e.target.checked)}
                               />
                               طلب التعليل (Justification)
                           </label>
                       </div>
                   )}
                   
                   {/* Advanced Fields (Correction & Competency) - Show only when editing */}
                   {editingQuestionId === q.id && (
                       <div className="mt-4 pt-3 border-t border-blue-100 animate-in fade-in">
                           <div className="mb-3">
                               <label className="block text-xs font-bold text-slate-500 mb-1">الكفاءة المستهدفة</label>
                               <select 
                                value={q.linkedCompetency || ''}
                                onChange={(e) => updateQuestion(q.id, 'linkedCompetency', e.target.value)}
                                className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 outline-none font-sans"
                               >
                                   <option value="">-- اختر الكفاءة --</option>
                                   {availableCompetencies.map((c, i) => <option key={i} value={c}>{c}</option>)}
                               </select>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">نموذج الإجابة / الحل المختصر</label>
                                    <textarea 
                                        value={q.modelAnswer || ''}
                                        onChange={(e) => updateQuestion(q.id, 'modelAnswer', e.target.value)}
                                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 outline-none resize-none h-16 font-sans"
                                        placeholder="الإجابة الصحيحة..."
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="block text-xs font-bold text-slate-500">سلم التنقيط المفصل</label>
                                        <button onClick={() => insertIntegrationRubric(q.id)} className="text-[10px] text-blue-600 hover:underline">إدراج معايير الوضعية</button>
                                    </div>
                                    <textarea 
                                        value={q.gradingRubric || ''}
                                        onChange={(e) => updateQuestion(q.id, 'gradingRubric', e.target.value)}
                                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 outline-none resize-none h-16 font-sans"
                                        placeholder="0.5 على القانون، 0.5 على النتيجة..."
                                    />
                                </div>
                           </div>
                       </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Right: Controls & Toolbox */}
      <div className="w-full md:w-96 flex flex-col gap-4">
         
         {/* Metadata Card */}
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">إعدادات الورقة</h3>
                <select 
                    value={metadata.type} 
                    onChange={e => setMetadata({...metadata, type: e.target.value as any})}
                    className="text-xs bg-slate-100 dark:bg-slate-700 rounded p-1 border-none outline-none"
                >
                    <option value="TEST">اختبار / فرض</option>
                    <option value="WORKSHEET">ورقة عمل (تطبيقية)</option>
                    <option value="HOMEWORK">واجب منزلي</option>
                </select>
            </div>
            <div className="space-y-2">
               <input type="text" value={metadata.title} onChange={e => setMetadata({...metadata, title: e.target.value})} className="w-full p-2 rounded border text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="العنوان" />
               <div className="bg-slate-100 dark:bg-slate-700 rounded p-2 flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-300">مجموع النقاط:</span>
                    <span className={`font-bold text-base ${currentTotal > metadata.totalPoints! ? 'text-red-500' : 'text-green-600'}`}>{currentTotal} / {metadata.totalPoints}</span>
               </div>
            </div>
         </div>

         {/* Toolbox Tabs */}
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                <button onClick={() => setActiveTab('create')} className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center gap-1 min-w-fit ${activeTab === 'create' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    <PenTool size={16} /> تحرير
                </button>
                <button onClick={() => setActiveTab('ai')} className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center gap-1 min-w-fit ${activeTab === 'ai' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    <Sparkles size={16} /> AI
                </button>
                <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center gap-1 min-w-fit ${activeTab === 'history' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    <History size={16} /> الأرشيف
                </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                {activeTab === 'create' && (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-500 mb-2">أنواع الأسئلة:</p>
                        <button onClick={() => addQuestion(QuestionType.TEXT)} className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors text-left">
                            <div className="bg-blue-100 p-2 rounded text-blue-600"><AlignLeft size={18} /></div>
                            <div><span className="block text-sm font-bold dark:text-white">سؤال كتابي</span><span className="text-xs text-slate-400">نص مفتوح أو مسألة</span></div>
                        </button>
                        <button onClick={() => addQuestion(QuestionType.MCQ)} className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors text-left">
                            <div className="bg-green-100 p-2 rounded text-green-600"><CheckSquare size={18} /></div>
                            <div><span className="block text-sm font-bold dark:text-white">متعدد الخيارات</span><span className="text-xs text-slate-400">QCM خيارات متعددة</span></div>
                        </button>
                        <button onClick={() => addQuestion(QuestionType.TRUE_FALSE)} className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors text-left">
                            <div className="bg-amber-100 p-2 rounded text-amber-600"><CheckCircle2 size={18} /></div>
                            <div><span className="block text-sm font-bold dark:text-white">صواب / خطأ</span><span className="text-xs text-slate-400">مع خيار التعليل</span></div>
                        </button>
                        <button onClick={() => setShowWaygroundPicker(true)} className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors text-left group">
                            <div className="bg-indigo-100 p-2 rounded text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Globe size={18} /></div>
                            <div><span className="block text-sm font-bold dark:text-white">نشاط Wayground</span><span className="text-xs text-slate-400">دمج تمرين تفاعلي / محاكاة</span></div>
                        </button>
                        
                        <div className="mt-6 pt-4 border-t dark:border-slate-700">
                            <a href="https://wayground.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 text-sm font-medium">
                                <Search size={16} /> Wayground (خارجي) <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-3 text-purple-700 dark:text-purple-300 font-bold text-sm">
                                <Bot size={18} /> <span>توليد محتوى (Gemini)</span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">نوع المحتوى</label>
                                    <select 
                                        value={aiContext.target} 
                                        onChange={e => setAiContext({...aiContext, target: e.target.value as any})}
                                        className="w-full p-2 text-xs rounded border border-purple-200 focus:ring-purple-500"
                                    >
                                        <option value="EXAM">اختبار رسمي (Assessment)</option>
                                        <option value="WORKSHEET">ورقة عمل تطبيقية (Worksheet)</option>
                                        <option value="HOMEWORK">واجب منزلي (Homework)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">الموضوع (الدرس)</label>
                                    <input 
                                        type="text"
                                        value={aiContext.topic}
                                        onChange={(e) => setAiContext({...aiContext, topic: e.target.value})}
                                        className="w-full p-2 text-xs rounded border border-purple-200 focus:ring-purple-500"
                                        placeholder="مثال: الدوال الأسية"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">الصعوبة</label>
                                        <select value={aiContext.difficulty} onChange={(e) => setAiContext({...aiContext, difficulty: e.target.value as any})} className="w-full p-2 text-xs rounded border border-purple-200">
                                            <option value={DifficultyLevel.EASY}>مبتدئ</option>
                                            <option value={DifficultyLevel.MEDIUM}>متوسط</option>
                                            <option value={DifficultyLevel.HARD}>متقدم</option>
                                        </select>
                                    </div>
                                    <div className="w-20">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">العدد</label>
                                        <input type="number" value={aiContext.count} onChange={(e) => setAiContext({...aiContext, count: Number(e.target.value)})} className="w-full p-2 text-xs rounded border border-purple-200" min={1} max={10} />
                                    </div>
                                </div>
                                <button 
                                    onClick={generateAIContent}
                                    disabled={isGenerating || !aiContext.topic}
                                    className="w-full py-2 bg-purple-600 text-white rounded font-bold text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    {isGenerating ? 'جاري التوليد...' : 'توليد الأسئلة'}
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center">يتم حفظ المحتوى تلقائياً في الجهاز (Offline) بعد التوليد.</p>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4 animate-in fade-in">
                        <h3 className="text-xs font-bold text-slate-500 flex items-center gap-2">
                            <Archive size={14} /> المحفوظات ({savedAssessments.length})
                        </h3>
                        {savedAssessments.length === 0 ? (
                            <p className="text-center text-xs text-slate-400 py-8">لا توجد اختبارات محفوظة</p>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {savedAssessments.map(a => (
                                    <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-400 transition-colors group">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-800 dark:text-white text-xs line-clamp-1">{a.title}</h4>
                                            <span className="text-[10px] bg-white dark:bg-slate-800 px-1.5 rounded text-slate-500">{a.dateCreated}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mb-2">{a.questions.length} أسئلة • {a.totalPoints} نقطة</p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => loadAssessment(a)}
                                                className="flex-1 py-1 bg-white dark:bg-slate-800 border text-slate-600 dark:text-slate-300 text-[10px] rounded hover:text-emerald-600 flex items-center justify-center gap-1"
                                            >
                                                <FolderOpen size={12} /> فتح
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/assessments/${a.id}/print`)}
                                                className="flex-1 py-1 bg-white dark:bg-slate-800 border text-slate-600 dark:text-slate-300 text-[10px] rounded hover:text-blue-600 flex items-center justify-center gap-1"
                                            >
                                                <Printer size={12} /> طباعة
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'bank' && (
                    <div className="space-y-4">
                        {/* Search and Filters */}
                        <div className="space-y-2">
                            <input type="text" placeholder="بحث في البنك..." value={bankFilters.search} onChange={e => setBankFilters({...bankFilters, search: e.target.value})} className="w-full p-2 text-xs border rounded bg-slate-50" />
                        </div>
                        
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {filteredBank.length === 0 ? <p className="text-center text-xs text-slate-400 py-4">لا توجد نتائج</p> : filteredBank.map(q => (
                                <div key={q.id} className="p-3 border rounded bg-slate-50 hover:bg-white hover:shadow-sm transition-all group relative">
                                    <p className="text-xs font-medium line-clamp-2 mb-1 text-slate-800">{q.text}</p>
                                    <div className="flex gap-2 text-[10px] text-slate-500">
                                        <span className={`px-1 border rounded ${q.difficulty === 'HARD' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{q.difficulty}</span>
                                    </div>
                                    <button onClick={() => addFromBank(q)} className="absolute top-2 left-2 bg-primary-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="إضافة"><Plus size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex gap-2">
                <button onClick={handleSave} className="flex-1 bg-primary-600 text-white py-2 rounded font-bold hover:bg-primary-700 text-sm flex items-center justify-center gap-2"><Save size={16} /> حفظ</button>
                <button onClick={handlePrintPreview} className="bg-white border border-slate-300 text-slate-700 py-2 px-3 rounded hover:bg-slate-100 text-sm" title="طباعة"><Printer size={18} /></button>
            </div>
         </div>
      </div>

      {/* Wayground Picker Modal */}
      {showWaygroundPicker && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <Globe size={20} />
                          <h3 className="font-bold">مكتبة أنشطة Wayground</h3>
                      </div>
                      <button onClick={() => setShowWaygroundPicker(false)} className="hover:bg-white/20 p-1 rounded"><Trash2 size={18} /></button>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                      <input type="text" placeholder="بحث عن نشاط أو محاكاة..." className="w-full p-2 rounded border outline-none text-sm" />
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {MOCK_WAYGROUND_ACTIVITIES.map(act => (
                          <div key={act.id} onClick={() => handleSelectWaygroundActivity(act)} className="p-3 border rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-colors group">
                              <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{act.title}</h4>
                                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">{act.topic}</span>
                              </div>
                              <p className="text-xs text-indigo-500 mt-1 truncate">{act.url}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
