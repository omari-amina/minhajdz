
import React, { useState, useMemo, useEffect } from 'react';
import { ALGERIAN_CURRICULUM, AVAILABLE_LEVELS } from '../constants';
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Plus, Edit, Trash2, Save, X, Book, GitBranch, FileText, LayoutList, Link as LinkIcon, Unlink, Search, UploadCloud, FileJson, AlertCircle, Lock, Flag, ShieldCheck, History, CheckSquare, Eye, AlertTriangle, Code, Sparkles, Loader2, ScanLine, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LessonStatus, CurriculumStandard, Lesson, UserRole, CurriculumReport, AuditLogEntry } from '../types';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { useCurriculumGatekeeper } from '../hooks/useCurriculumGatekeeper';
import { processCurriculumImport, ImportResult } from '../utils/curriculumPipeline';
import { GoogleGenAI, Type } from "@google/genai";

export default function CurriculumView() {
  const { user, currentContext } = useUser();
  const { curriculumItems, lessons, updateLessons, addCurriculumReport, curriculumReports, auditLogs } = useData();
  
  if (!user) return null;

  // Security Hook (Middleware simulation)
  const gatekeeper = useCurriculumGatekeeper();

  // State for Filters - Initialize with Current Context
  const [selectedSubject, setSelectedSubject] = useState<string>(currentContext.subject);
  const [selectedLevel, setSelectedLevel] = useState<string>(user.levels[0] || '1AS');
  const [selectedStream, setSelectedStream] = useState<string>('all');
  
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  
  // ROLE CHECK
  const isAdmin = user.role === UserRole.ADMIN;

  // View Mode (For Admin: 'view' | 'admin_panel')
  const [viewMode, setViewMode] = useState<'view' | 'admin_panel'>('view');

  // Log Viewer State
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Enforce View Mode for Non-Admins
  useEffect(() => {
      if (!isAdmin && viewMode === 'admin_panel') {
          setViewMode('view');
      }
  }, [isAdmin, viewMode]);

  // Sync with Global Context changes
  useEffect(() => {
      setSelectedSubject(currentContext.subject);
  }, [currentContext.subject]);

  // Modal State for CRUD Curriculum
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CurriculumStandard | null>(null);
  const [formData, setFormData] = useState<Partial<CurriculumStandard>>({
      subject: currentContext.subject,
      level: user.levels[0],
      stream: '',
      domain: '',
      unit: '',
      lessonTitle: '',
      suggestedDuration: 1,
      targetCompetencies: []
  });
  const [objectivesText, setObjectivesText] = useState('');

  // --- IMPORT PIPELINE STATE ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeImportTab, setActiveImportTab] = useState<'JSON' | 'OCR'>('JSON'); // Tab State
  const [importJsonText, setImportJsonText] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  
  // OCR State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<any[]>([]);

  // Modal State for Linking Lessons
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkTargetStandard, setLinkTargetStandard] = useState<CurriculumStandard | null>(null);
  const [linkSearchTerm, setLinkSearchTerm] = useState('');

  // --- REPORTING STATE ---
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<CurriculumStandard | null>(null);
  const [reportData, setReportData] = useState({ type: 'ERROR', description: '' });

  // Derived: Available Streams for current selection
  const availableStreams = useMemo(() => {
    const streams = new Set<string>();
    curriculumItems.forEach(item => {
        if (item.subject === selectedSubject && item.level === selectedLevel && item.stream) {
            streams.add(item.stream);
        }
    });
    return Array.from(streams);
  }, [selectedSubject, selectedLevel, curriculumItems]);

  // Auto-select stream if only one exists or reset if changed
  useEffect(() => {
      if (availableStreams.length > 0 && selectedStream === 'all') {
          if (!availableStreams.includes(selectedStream) && selectedStream !== 'all') {
             setSelectedStream(availableStreams[0]);
          }
      }
      if (selectedStream !== 'all' && !availableStreams.includes(selectedStream)) {
          setSelectedStream(availableStreams.length > 0 ? availableStreams[0] : 'all');
      }
  }, [availableStreams, selectedLevel]);


  // Structure Data: Domain -> Unit -> Lessons
  const groupedData = useMemo(() => {
    // Filter by Subject, Level AND Stream
    const filtered = curriculumItems.filter(c => 
        c.level === selectedLevel && 
        c.subject === selectedSubject &&
        (selectedStream === 'all' || !c.stream || c.stream === selectedStream)
    );

    const structure: Record<string, Record<string, CurriculumStandard[]>> = {};

    filtered.forEach(item => {
      if (!structure[item.domain]) {
        structure[item.domain] = {};
      }
      if (!structure[item.domain][item.unit]) {
        structure[item.domain][item.unit] = [];
      }
      structure[item.domain][item.unit].push(item);
    });

    return structure;
  }, [selectedLevel, selectedSubject, selectedStream, curriculumItems]);

  // Initial expansion
  useEffect(() => {
    setExpandedDomains(Object.keys(groupedData));
  }, [groupedData]);

  const toggleDomain = (domain: string) => {
    setExpandedDomains(prev => 
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  // --- IMPORT PIPELINE HANDLERS ---
  const handlePreviewImport = () => {
      if (!isAdmin) { alert("المنهاج للقراءة فقط، التعديل متاح للإدارة فقط."); return; }
      try {
          const parsed = JSON.parse(importJsonText);
          const result = processCurriculumImport(parsed, curriculumItems);
          setImportResult(result);
      } catch (e) {
          alert("خطأ في قراءة ملف JSON. تأكد من صحة التنسيق.");
      }
  };

  // --- OCR HANDLER ---
  const handleOCRProcess = async () => {
      if (!selectedImage) return;
      setIsProcessingOCR(true);
      
      try {
          const apiKey = process.env.API_KEY;
          if (!apiKey) {
              alert('API Key is missing');
              setIsProcessingOCR(false);
              return;
          }
          const ai = new GoogleGenAI({ apiKey });
          
          // Convert image to Base64
          const reader = new FileReader();
          reader.readAsDataURL(selectedImage);
          
          reader.onloadend = async () => {
              const base64Data = (reader.result as string).split(',')[1];
              
              const prompt = `
                Extract the curriculum table data from this image into a JSON array.
                Target Subject: ${selectedSubject}
                Target Level: ${selectedLevel}
                
                The image contains a list of lessons/units. 
                For each row, extract:
                - domain (المجال / الميدان)
                - unit (الوحدة)
                - lessonTitle (عنوان الدرس / الموضوع)
                - suggestedDuration (الحجم الساعي / المدة - convert to number)
                - targetCompetencies (الأهداف / الكفاءات - as array of strings)
                
                Output JSON Array format:
                [
                  {
                    "subject": "${selectedSubject}",
                    "level": "${selectedLevel}",
                    "domain": "string",
                    "unit": "string",
                    "lessonTitle": "string",
                    "suggestedDuration": number,
                    "targetCompetencies": ["string"]
                  }
                ]
                Ensure the output is valid JSON. Translate content to Arabic if it's not.
              `;

              const response = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: {
                      parts: [
                          { inlineData: { mimeType: selectedImage.type, data: base64Data } },
                          { text: prompt }
                      ]
                  },
                  config: {
                      responseMimeType: "application/json",
                      responseSchema: {
                          type: Type.ARRAY,
                          items: {
                              type: Type.OBJECT,
                              properties: {
                                  subject: { type: Type.STRING },
                                  level: { type: Type.STRING },
                                  domain: { type: Type.STRING },
                                  unit: { type: Type.STRING },
                                  lessonTitle: { type: Type.STRING },
                                  suggestedDuration: { type: Type.NUMBER },
                                  targetCompetencies: { type: Type.ARRAY, items: { type: Type.STRING } }
                              }
                          }
                      }
                  }
              });

              if (response.text) {
                  const data = JSON.parse(response.text);
                  setOcrPreview(data);
                  
                  // Auto-process to import result
                  const result = processCurriculumImport(data, curriculumItems);
                  setImportResult(result);
              }
              setIsProcessingOCR(false);
          };

      } catch (e) {
          console.error(e);
          alert('فشل استخراج البيانات من الصورة. يرجى المحاولة بصورة أوضح.');
          setIsProcessingOCR(false);
      }
  };

  const handleCommitImport = () => {
      // Use Gatekeeper for protection
      if (!importResult) return;
      
      try {
          const newItems = importResult.preview.newItems;
          const updatedItemsMap = new Map(importResult.preview.updatedItems.map(i => [i.id, i]));
          
          const mergedCurriculum = curriculumItems.map(item => 
              updatedItemsMap.has(item.id) ? updatedItemsMap.get(item.id)! : item
          ).concat(newItems);

          gatekeeper.importBatch(mergedCurriculum);
          
          alert(`تم استيراد ${importResult.added} عنصر وتحديث ${importResult.updated} عنصر بنجاح.`);
          setIsImportModalOpen(false);
          setImportResult(null);
          setImportJsonText('');
          setOcrPreview([]);
          setSelectedImage(null);
      } catch (e: any) {
          alert(e.message);
      }
  };

  // --- REPORTING HANDLERS ---
  const handleOpenReport = (item: CurriculumStandard) => {
      setReportTarget(item);
      setReportData({ type: 'ERROR', description: '' });
      setIsReportModalOpen(true);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
      e.preventDefault();
      if (!reportTarget) return;
      
      const report: CurriculumReport = {
          id: `rep_${Date.now()}`,
          reporterId: user.id,
          reporterName: user.name,
          curriculumId: reportTarget.id,
          type: reportData.type as any,
          description: reportData.description,
          date: new Date().toISOString(),
          status: 'PENDING'
      };
      
      addCurriculumReport(report);
      alert('تم إرسال التبليغ بنجاح للإدارة. شكراً لمساهمتكم.');
      setIsReportModalOpen(false);
  };

  const handleResolveReport = (reportId: string) => {
      try {
          // Use Gatekeeper to resolve report (Logs the action and checks permissions)
          gatekeeper.resolveReport(reportId);
      } catch (e: any) {
          alert(e.message);
      }
  };

  // --- LESSON LINKING LOGIC (Teacher Allowed) ---
  const availableLessonsForLink = useMemo(() => {
      return lessons.filter(l => 
          (l.subject === selectedSubject) && // Must match subject
          (!l.curriculumId || l.curriculumId === 'unaffiliated') && // Must be unlinked
          (l.title.toLowerCase().includes(linkSearchTerm.toLowerCase())) // Search filter
      );
  }, [lessons, selectedSubject, linkSearchTerm]);

  const handleOpenLinkModal = (standard: CurriculumStandard) => {
      setLinkTargetStandard(standard);
      setLinkSearchTerm('');
      setIsLinkModalOpen(true);
  };

  const handleLinkLesson = (lessonId: string) => {
      if (!linkTargetStandard) return;
      // Linking is a LESSON update, not a Curriculum update, so Teachers CAN do this.
      const updatedLessons = lessons.map(l => 
          l.id === lessonId ? { ...l, curriculumId: linkTargetStandard.id } : l
      );
      updateLessons(updatedLessons);
      setIsLinkModalOpen(false);
      setLinkTargetStandard(null);
  };

  const handleUnlinkLesson = (lessonId: string) => {
      if (window.confirm("هل تريد فك ارتباط هذا الدرس بالمنهاج؟ (لن يتم حذف الدرس)")) {
          const updatedLessons = lessons.map(l => 
              l.id === lessonId ? { ...l, curriculumId: 'unaffiliated' } : l
          );
          updateLessons(updatedLessons);
      }
  };

  // --- CRUD OPERATIONS (GUARDED BY GATEKEEPER) ---

  const handleOpenAdd = () => {
    // UI Guard
    if (!isAdmin) { alert("المنهاج للقراءة فقط، التعديل متاح للإدارة فقط."); return; }
    
    setEditingItem(null);
    setFormData({
        subject: selectedSubject,
        level: selectedLevel,
        stream: selectedStream !== 'all' ? selectedStream : '',
        domain: '',
        unit: '',
        lessonTitle: '',
        suggestedDuration: 1,
        targetCompetencies: []
    });
    setObjectivesText('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CurriculumStandard) => {
    if (!isAdmin) { alert("المنهاج للقراءة فقط، التعديل متاح للإدارة فقط."); return; }
    setEditingItem(item);
    setFormData({ ...item });
    setObjectivesText(item.targetCompetencies.join('\n'));
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) { alert("المنهاج للقراءة فقط، التعديل متاح للإدارة فقط."); return; }
    if (window.confirm('هل أنت متأكد من حذف هذا العنصر من المنهاج؟')) {
        try {
            gatekeeper.deleteItem(id);
        } catch (e: any) {
            alert(e.message);
        }
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    // UI Validation
    if (!formData.lessonTitle || !formData.domain || !formData.unit) {
        alert('يرجى ملء جميع الحقول الأساسية');
        return;
    }

    const objectives = objectivesText.split('\n').filter(line => line.trim() !== '');

    try {
        if (editingItem) {
            // EDIT Mode - Protected by Gatekeeper
            const updatedData = { ...formData, targetCompetencies: objectives } as CurriculumStandard;
            gatekeeper.updateItem(editingItem.id, updatedData);
        } else {
            // CREATE Mode - Protected by Gatekeeper
            const newItem: CurriculumStandard = {
                id: `curr_${Date.now()}`,
                cycle: 'secondary',
                subject: formData.subject || selectedSubject,
                level: formData.level || selectedLevel,
                stream: formData.stream,
                domain: formData.domain!,
                unit: formData.unit!,
                lessonTitle: formData.lessonTitle!,
                suggestedDuration: Number(formData.suggestedDuration) || 1,
                targetCompetencies: objectives
            };
            gatekeeper.createItem(newItem);
        }
        setIsModalOpen(false);
    } catch (e: any) {
        alert(e.message); // Show permission error if occurs
    }
  };

  // --- PROGRESS LOGIC ---
  const getLinkedLessons = (curriculumId: string) => {
      return lessons.filter(l => l.curriculumId === curriculumId).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getCompletionStatus = (curriculumItem: CurriculumStandard) => {
    const linkedLessons = getLinkedLessons(curriculumItem.id);
    const count = linkedLessons.length;
    const required = curriculumItem.suggestedDuration;
    
    return {
        count,
        required,
        isFullyPlanned: count >= required,
        linkedLessons
    };
  };

  const calculateDomainProgress = (domain: string) => {
    const units = groupedData[domain];
    let totalHours = 0;
    let completedHours = 0;

    Object.values(units).forEach((standards) => {
      (standards as CurriculumStandard[]).forEach(s => {
        totalHours += s.suggestedDuration;
        const linked = getLinkedLessons(s.id);
        const completed = linked.filter(l => l.status === LessonStatus.COMPLETED).length;
        completedHours += Math.min(completed, s.suggestedDuration);
      });
    });

    return totalHours === 0 ? 0 : Math.round((completedHours / totalHours) * 100);
  };

  const inputClass = "w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-colors";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  // --- ADMIN PANEL RENDER ---
  if (isAdmin && viewMode === 'admin_panel') {
      return (
          <div className="space-y-6 pb-20">
              <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="text-primary-600" />
                      لوحة إدارة المنهاج
                  </h1>
                  <button onClick={() => setViewMode('view')} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                      العودة للمنهاج
                  </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Reports Panel */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Flag className="text-amber-500" /> تبليغات الأساتذة ({curriculumReports.filter(r => r.status === 'PENDING').length})</h2>
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                          {curriculumReports.length === 0 && <p className="text-slate-500 text-center py-4">لا توجد تبليغات.</p>}
                          {curriculumReports.map(report => {
                              // Find the related curriculum item for clearer context
                              const targetItem = curriculumItems.find(i => i.id === report.curriculumId);
                              
                              return (
                              <div key={report.id} className={`p-4 rounded-lg border ${report.status === 'PENDING' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 opacity-70'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${report.type === 'ERROR' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{report.type}</span>
                                      <span className="text-xs text-slate-500">{new Date(report.date).toLocaleDateString()}</span>
                                  </div>
                                  
                                  <div className="mb-2">
                                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">العنصر المُبلغ عنه:</div>
                                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                                          {targetItem ? targetItem.lessonTitle : 'عنصر محذوف أو غير موجود'}
                                      </div>
                                      {targetItem && <div className="text-[10px] text-slate-400">{targetItem.subject} - {targetItem.level}</div>}
                                  </div>

                                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">تفاصيل التبليغ ({report.reporterName}):</div>
                                  <p className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 mb-3">{report.description}</p>
                                  
                                  {report.status === 'PENDING' ? (
                                      <button onClick={() => handleResolveReport(report.id)} className="text-xs flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">
                                          <CheckSquare size={12} /> تم الحل / المراجعة
                                      </button>
                                  ) : (
                                      <span className="text-xs flex items-center gap-1 text-green-600"><CheckCircle2 size={12} /> تمت المعالجة</span>
                                  )}
                              </div>
                          )})}
                      </div>
                  </div>

                  {/* Audit Log Panel */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><History className="text-blue-500" /> سجل التغييرات (Audit Log)</h2>
                      <div className="space-y-0 max-h-[500px] overflow-y-auto">
                          {auditLogs.length === 0 && <p className="text-slate-500 text-center py-4">السجل فارغ.</p>}
                          {auditLogs.map((log, idx) => (
                              <div key={log.id} className="flex gap-3 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 group">
                                  <div className="flex flex-col items-center">
                                      <div className={`w-2 h-2 rounded-full mt-1.5 ${log.action === 'DELETE' ? 'bg-red-500' : log.action === 'CREATE' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                      {idx < auditLogs.length - 1 && <div className="w-px h-full bg-slate-200 dark:bg-slate-700 mt-1"></div>}
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex justify-between items-start">
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{new Date(log.timestamp).toLocaleString()} • {log.userName}</p>
                                          {log.snapshot && (
                                              <button onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)} className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <Code size={12} /> {expandedLogId === log.id ? 'إخفاء JSON' : 'عرض التغييرات'}
                                              </button>
                                          )}
                                      </div>
                                      <p className="text-sm font-bold text-slate-800 dark:text-white">{log.action}</p>
                                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{log.details}</p>
                                      
                                      {/* Snapshot Viewer */}
                                      {expandedLogId === log.id && log.snapshot && (
                                          <div className="mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2 text-[10px] font-mono overflow-x-auto">
                                              {log.snapshot.before && (
                                                  <div className="mb-2">
                                                      <span className="text-red-500 font-bold block mb-1">BEFORE:</span>
                                                      <pre className="text-slate-600 dark:text-slate-400">{JSON.stringify(log.snapshot.before, null, 2)}</pre>
                                                  </div>
                                              )}
                                              {log.snapshot.after && (
                                                  <div>
                                                      <span className="text-green-500 font-bold block mb-1">AFTER:</span>
                                                      <pre className="text-slate-600 dark:text-slate-400">{JSON.stringify(log.snapshot.after, null, 2)}</pre>
                                                  </div>
                                              )}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- STANDARD VIEW RENDER ---
  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              المنهاج الدراسي
              {!isAdmin && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-600 flex items-center gap-1"><Eye size={12} /> للقراءة فقط</span>}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
             عرض المنهاج الخاص بـ: <span className="font-bold text-primary-600">{selectedSubject}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full lg:w-auto">
            {/* Filters */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {user.subjects.map(sub => (
                  <button key={sub} onClick={() => setSelectedSubject(sub)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${selectedSubject === sub ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
                    <Book size={14} /> {sub}
                  </button>
                ))}
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto">
            {user.levels.map(level => (
                <button key={level} onClick={() => setSelectedLevel(level)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${selectedLevel === level ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
                {level}
                </button>
            ))}
            </div>

            {availableStreams.length > 0 && (
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto">
                    {availableStreams.map(stream => (
                        <button key={stream} onClick={() => setSelectedStream(stream)} className={`px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1 ${selectedStream === stream ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
                            <GitBranch size={14} /> {stream}
                        </button>
                    ))}
                </div>
            )}

            {/* Admin Only Actions - Hidden for Teachers */}
            {isAdmin && (
                <>
                    <button onClick={() => setViewMode('admin_panel')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap text-sm">
                        <ShieldCheck size={16} /> <span>الإدارة</span>
                    </button>
                    <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 bg-slate-800 dark:bg-slate-700 text-white px-3 py-2 rounded-lg font-medium hover:bg-slate-900 transition-colors shadow-sm whitespace-nowrap text-sm" title="استيراد منهاج من ملف JSON">
                        <UploadCloud size={16} /> <span>استيراد</span>
                    </button>
                    <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm whitespace-nowrap">
                        <Plus size={18} /> <span className="hidden sm:inline">إضافة</span>
                    </button>
                </>
            )}
        </div>
      </div>

      <div className="grid gap-6">
        {Object.keys(groupedData).length === 0 ? (
           <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <p className="mb-4">لا يوجد بيانات منهجية لمادة <b>{selectedSubject}</b> - مستوى <b>{selectedLevel}</b>.</p>
              {isAdmin ? (
                  <button onClick={() => setIsImportModalOpen(true)} className="text-primary-600 font-bold hover:underline">استيراد البيانات</button>
              ) : (
                  <p className="text-xs text-slate-400">يرجى الاتصال بمسؤول المنهاج (Admin) لإضافة المحتوى.</p>
              )}
           </div>
        ) : (
          Object.entries(groupedData).map(([domain, units]) => {
            const progress = calculateDomainProgress(domain);
            const isExpanded = expandedDomains.includes(domain);

            return (
              <div key={domain} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-300">
                <div className="p-5 cursor-pointer bg-slate-50/50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center justify-between" onClick={() => toggleDomain(domain)}>
                  <div className="flex-1">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{domain}</h3>
                     <div className="w-full max-w-md bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                     </div>
                     <p className="text-xs text-slate-500 mt-1">{progress}% من الحجم الساعي مكتمل</p>
                  </div>
                  <div className="ml-4 text-slate-400">{isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-700 p-6 space-y-8 animate-in slide-in-from-top-2 duration-300">
                    {Object.entries(units).map(([unit, standards]) => (
                      <div key={unit} className="relative">
                        <div className="absolute top-8 bottom-4 right-2.5 w-px bg-slate-200 dark:bg-slate-700 -z-10"></div>
                        <h4 className="font-bold text-primary-700 dark:text-primary-400 mb-4 bg-white dark:bg-slate-800 inline-block pr-2">{unit}</h4>

                        <div className="space-y-4 mr-6">
                          {standards.map(standard => {
                            const { count, required, isFullyPlanned, linkedLessons } = getCompletionStatus(standard);
                            
                            // Check if this specific item has a pending report from the current user
                            const hasPendingReport = curriculumReports.some(r => r.curriculumId === standard.id && r.reporterId === user.id && r.status === 'PENDING');

                            return (
                              <div key={standard.id} className="group p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {isFullyPlanned ? <CheckCircle2 className="text-green-500" size={20} /> : <Circle className="text-slate-300" size={20} />}
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                {standard.lessonTitle}
                                                {standard.code && <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded">{standard.code}</span>}
                                                {hasPendingReport && <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 rounded flex items-center gap-1" title="تم التبليغ - قيد المعالجة"><AlertTriangle size={10} /> تبليغ معلق</span>}
                                            </h5>
                                            <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                                    <Clock size={12} /> {standard.suggestedDuration} ساعة (حصص)
                                                </span>
                                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded ${count >= required ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                    <LayoutList size={12} /> {count} / {required} مذكرة
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mr-auto sm:mr-0">
                                        {count < required && (
                                            <>
                                                <Link to={`/lessons/new?curriculumId=${standard.id}`} className="flex items-center gap-1 text-xs bg-primary-600 text-white px-3 py-1.5 rounded-md hover:bg-primary-700 transition-all shadow-sm" title="إنشاء مذكرة جديدة">
                                                    <Plus size={14} /> جديد
                                                </Link>
                                                <button onClick={() => handleOpenLinkModal(standard)} className="flex items-center gap-1 text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm" title="ربط مذكرة موجودة">
                                                    <LinkIcon size={14} /> ربط
                                                </button>
                                            </>
                                        )}
                                        
                                        {/* Action Buttons */}
                                        <div className={`flex items-center border-r border-slate-200 dark:border-slate-600 pr-2 mr-2 transition-opacity ${isAdmin ? 'opacity-0 group-hover:opacity-100' : ''}`}>
                                            {isAdmin ? (
                                                <>
                                                    <button onClick={() => handleOpenEdit(standard)} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(standard.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                </>
                                            ) : (
                                                <button 
                                                    onClick={() => !hasPendingReport && handleOpenReport(standard)} 
                                                    className={`p-1.5 transition-colors ${hasPendingReport ? 'text-amber-300 cursor-default' : 'text-slate-400 hover:text-amber-500'}`}
                                                    title={hasPendingReport ? "تم التبليغ مسبقاً" : "تبليغ عن خطأ"}
                                                    disabled={hasPendingReport}
                                                >
                                                    <Flag size={16} className={hasPendingReport ? 'fill-current' : ''} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* List of Linked Lessons */}
                                {linkedLessons.length > 0 && (
                                    <div className="mt-3 mr-8 border-t border-dashed border-slate-200 dark:border-slate-700 pt-2 space-y-1">
                                        {linkedLessons.map((lesson, idx) => (
                                            <div key={lesson.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs transition-colors group/item">
                                                <Link to={`/lessons/${lesson.id}/edit`} className="flex items-center gap-2 flex-1">
                                                    <FileText size={12} className="text-slate-400" />
                                                    <span className="text-slate-700 dark:text-slate-300 font-medium">مذكرة {idx + 1}: {lesson.title}</span>
                                                </Link>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${lesson.status === LessonStatus.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {lesson.status === LessonStatus.COMPLETED ? 'منجزة' : 'مخطط'}
                                                    </span>
                                                    <button onClick={() => handleUnlinkLesson(lesson.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity" title="فك الارتباط"><Unlink size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* IMPORT MODAL (ADMIN ONLY) */}
      {isAdmin && isImportModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                      <div><h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><UploadCloud size={20} /> استيراد منهاج</h3></div>
                      <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex border-b border-slate-200 dark:border-slate-700">
                      <button 
                        onClick={() => setActiveImportTab('JSON')}
                        className={`flex-1 py-3 font-medium text-sm ${activeImportTab === 'JSON' ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/10' : 'text-slate-500'}`}
                      >
                          <FileJson size={16} className="inline mr-2" />
                          ملف JSON
                      </button>
                      <button 
                        onClick={() => setActiveImportTab('OCR')}
                        className={`flex-1 py-3 font-medium text-sm ${activeImportTab === 'OCR' ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50 dark:bg-purple-900/10' : 'text-slate-500'}`}
                      >
                          <ScanLine size={16} className="inline mr-2" />
                          صورة / OCR (Gemini)
                      </button>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1 space-y-4">
                      {activeImportTab === 'JSON' ? (
                          <>
                            <textarea className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-900 border rounded-lg font-mono text-xs focus:ring-2 focus:ring-primary-500" placeholder='[ { "subject": "Math", "level": "1AS", ... } ]' value={importJsonText} onChange={(e) => setImportJsonText(e.target.value)} />
                            <div className="flex justify-end gap-2">
                                <button onClick={handlePreviewImport} disabled={!importJsonText.trim()} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold">معالجة JSON</button>
                            </div>
                          </>
                      ) : (
                          <div className="space-y-4">
                              <div className="border-2 border-dashed border-purple-300 dark:border-purple-800 rounded-xl p-8 text-center bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 transition-colors cursor-pointer" onClick={() => document.getElementById('ocr-upload')?.click()}>
                                  <input id="ocr-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
                                  <ImageIcon size={40} className="mx-auto text-purple-400 mb-2" />
                                  <p className="text-purple-800 dark:text-purple-300 font-bold">اضغط لرفع صورة الجدول</p>
                                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">يدعم JPG, PNG. تأكد من وضوح النص.</p>
                              </div>
                              
                              {selectedImage && (
                                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-lg border">
                                      <span className="text-sm truncate">{selectedImage.name}</span>
                                      <button 
                                        onClick={handleOCRProcess} 
                                        disabled={isProcessingOCR}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50"
                                      >
                                          {isProcessingOCR ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                          استخراج البيانات
                                      </button>
                                  </div>
                              )}
                          </div>
                      )}

                      {/* Unified Result Preview */}
                      {importResult && (
                          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg animate-in slide-in-from-bottom-2">
                              <p className="font-bold flex items-center gap-2"><CheckCircle2 size={18} /> التحليل ناجح!</p>
                              <p className="text-sm mt-1">تم العثور على {importResult.added} عنصر جديد و {importResult.updated} تحديث.</p>
                              
                              {/* Preview List for OCR */}
                              {activeImportTab === 'OCR' && importResult.preview.newItems.length > 0 && (
                                  <div className="mt-2 max-h-32 overflow-y-auto bg-white/50 p-2 rounded text-xs">
                                      {importResult.preview.newItems.map((item, i) => (
                                          <div key={i} className="border-b last:border-0 py-1">{item.lessonTitle} ({item.unit})</div>
                                      ))}
                                  </div>
                              )}

                              <div className="mt-3 flex justify-end">
                                  <button onClick={handleCommitImport} className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-green-700">تأكيد وإضافة للمنهاج</button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* EDIT/ADD MODAL (ADMIN ONLY) */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border dark:border-slate-700 p-6">
              {/* ... (Existing Form Logic) ... */}
              <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">{editingItem ? 'تعديل' : 'إضافة'} عنصر منهاج</h3>
              <form onSubmit={handleSaveForm} className="space-y-4">
                  <div><label className={labelClass}>عنوان الدرس</label><input type="text" className={inputClass} value={formData.lessonTitle} onChange={e => setFormData({...formData, lessonTitle: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelClass}>المجال</label><input type="text" className={inputClass} value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} /></div>
                      <div><label className={labelClass}>الوحدة</label><input type="text" className={inputClass} value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} /></div>
                  </div>
                  <div><label className={labelClass}>المدة (حصص)</label><input type="number" className={inputClass} value={formData.suggestedDuration} onChange={e => setFormData({...formData, suggestedDuration: Number(e.target.value)})} /></div>
                  <div className="flex justify-end gap-3 mt-6">
                      <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded text-slate-600 hover:bg-slate-100">إلغاء</button>
                      <button className="bg-primary-600 text-white px-6 py-2 rounded font-bold hover:bg-primary-700">حفظ</button>
                  </div>
              </form>
           </div>
        </div>
      )}

      {/* REPORTING MODAL (TEACHER ONLY) */}
      {!isAdmin && isReportModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border dark:border-slate-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2"><Flag size={20} className="text-amber-500" /> تبليغ عن خطأ في المنهاج</h3>
                      <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-xs text-slate-600 dark:text-slate-400 mb-4">
                      <p><strong>العنصر:</strong> {reportTarget?.lessonTitle}</p>
                      <p><strong>الوحدة:</strong> {reportTarget?.unit}</p>
                  </div>

                  <form onSubmit={handleSubmitReport} className="space-y-4">
                      <div>
                          <label className={labelClass}>نوع المشكلة</label>
                          <select className={inputClass} value={reportData.type} onChange={e => setReportData({...reportData, type: e.target.value})}>
                              <option value="ERROR">خطأ في المعلومات (العنوان، الترتيب...)</option>
                              <option value="MISSING_INFO">معلومات ناقصة (مؤشرات، كفاءات...)</option>
                              <option value="SUGGESTION">اقتراح تعديل بيداغوجي</option>
                          </select>
                      </div>
                      <div>
                          <label className={labelClass}>وصف التفاصيل</label>
                          <textarea 
                              rows={4} 
                              className={inputClass} 
                              placeholder="يرجى توضيح الخطأ والصواب المقترح..." 
                              value={reportData.description}
                              onChange={e => setReportData({...reportData, description: e.target.value})}
                              required
                          />
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                          <button type="button" onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 rounded text-slate-600 hover:bg-slate-100">إلغاء</button>
                          <button type="submit" className="bg-amber-600 text-white px-6 py-2 rounded font-bold hover:bg-amber-700">إرسال التبليغ</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Link Lesson Modal (Shared) */}
      {isLinkModalOpen && linkTargetStandard && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border dark:border-slate-700 flex flex-col max-h-[80vh]">
                  {/* ... (Existing Linking UI) ... */}
                  <div className="p-5 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                      <div><h3 className="font-bold text-lg dark:text-white">ربط مذكرة موجودة</h3></div>
                      <button onClick={() => setIsLinkModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                  </div>
                  <div className="p-4"><input type="text" placeholder="بحث..." value={linkSearchTerm} onChange={(e) => setLinkSearchTerm(e.target.value)} className={inputClass} /></div>
                  <div className="p-2 overflow-y-auto flex-1 space-y-1">
                      {availableLessonsForLink.map(l => (
                          <button key={l.id} onClick={() => handleLinkLesson(l.id)} className="w-full text-right p-3 rounded hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-sm text-slate-700 dark:text-white">{l.title}</button>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
