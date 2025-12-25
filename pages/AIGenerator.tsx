
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, ArrowLeft, Loader2, BookOpen, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { LessonType } from '../types';

export default function AIGenerator() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  if (!user) return null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedData, setGeneratedData] = useState<any>(null);

  const [formData, setFormData] = useState({
    subject: user.subjects[0] || '',
    level: user.levels[0] || '',
    topic: '',
    context: ''
  });

  const handleGenerate = async () => {
    if (!formData.topic || !formData.subject) return;
    
    // Check for API Key presence
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey.trim() === '') {
        setError('عذراً، مفتاح الربط (API Key) غير متوفر. يرجى التأكد من إضافته في إعدادات Vercel.');
        return;
    }

    setLoading(true);
    setError('');
    setGeneratedData(null);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const prompt = `
        Act as an expert pedagogical advisor for the Algerian education system.
        Create a detailed lesson plan structure for a "${formData.subject}" lesson for level "${formData.level}".
        Topic: "${formData.topic}".
        Additional Context: "${formData.context}".
        
        The output must be in Arabic (except for technical terms if Subject is English/French).
        Structure the content according to the Competency-Based Approach (CBA).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Official lesson title" },
              domain: { type: Type.STRING, description: "Educational Domain/Field" },
              unit: { type: Type.STRING, description: "Learning Unit" },
              objectives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of learning objectives" },
              prerequisites: { type: Type.STRING, description: "Prior knowledge required" },
              learningSituation: { type: Type.STRING, description: "The problem situation (Wadiyat Inطلاق)" },
              theoreticalContent: { type: Type.STRING, description: "Detailed phases of the lesson (Binaa Ta3alomat)" },
              practicalContent: { type: Type.STRING, description: "Activities and tasks" },
              homework: { type: Type.STRING, description: "Suggested homework" }
            },
            required: ["title", "objectives", "theoreticalContent", "practicalContent"]
          }
        }
      });

      if (response.text) {
        setGeneratedData(JSON.parse(response.text));
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('API key')) {
          setError('مفتاح API غير صالح أو غير مفعل. يرجى التحقق من Google AI Studio.');
      } else {
          setError('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseLesson = () => {
    if (!generatedData) return;
    
    navigate('/lessons/new', { 
      state: { 
        aiData: {
          ...generatedData,
          subject: formData.subject,
          type: LessonType.BUILD // Default to Build
        } 
      } 
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="text-purple-600" />
            المساعد الذكي
          </h1>
          <p className="text-slate-500 dark:text-slate-400">توليد مذكرات بيداغوجية متكاملة باستخدام الذكاء الاصطناعي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">بيانات الدرس</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المادة</label>
                <select 
                  value={formData.subject} 
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {user.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المستوى</label>
                <select 
                  value={formData.level} 
                  onChange={e => setFormData({...formData, level: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {user.levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">موضوع الدرس</label>
                <input 
                  type="text" 
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                  placeholder="مثال: الجملة الميكانيكية"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">توجيهات إضافية (اختياري)</label>
                <textarea 
                  rows={3}
                  value={formData.context}
                  onChange={e => setFormData({...formData, context: e.target.value})}
                  placeholder="مثال: التركيز على التجارب، أمثلة من الواقع..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !formData.topic}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                <span>توليد المذكرة</span>
              </button>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-4 text-xs text-purple-800 dark:text-purple-300">
            <p className="flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              المحتوى المولد هو مقترح أولي يعتمد على نماذج الذكاء الاصطناعي، يرجى مراجعته وتعديله ليتناسب مع القسم.
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="md:col-span-2">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-800 flex items-center gap-2 mb-4 animate-in shake">
              <Settings size={20} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {generatedData ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{generatedData.domain}</span>
                    <span>•</span>
                    <span>{generatedData.unit}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">{generatedData.title}</h2>
                </div>
                <button 
                  onClick={handleUseLesson}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20"
                >
                  <CheckCircle size={18} />
                  <span>اعتماد المذكرة</span>
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 border-b pb-1 inline-block">الأهداف التعلمية</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                    {generatedData.objectives?.map((obj: string, i: number) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <h3 className="font-bold text-slate-700 dark:text-slate-300 border-b pb-1 inline-block">المكتسبات القبلية</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{generatedData.prerequisites}</p>
                   </div>
                   <div className="space-y-2">
                      <h3 className="font-bold text-slate-700 dark:text-slate-300 border-b pb-1 inline-block">وضعية الانطلاق</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-750 p-3 rounded-lg border dark:border-slate-700 italic">
                        {generatedData.learningSituation}
                      </p>
                   </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 border-b pb-1 inline-block">سيرورة الدرس (المحتوى المعرفي)</h3>
                  <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {generatedData.theoreticalContent}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 border-b pb-1 inline-block">الأنشطة المقترحة</h3>
                  <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {generatedData.practicalContent}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
              <div className={`p-6 rounded-full bg-slate-100 dark:bg-slate-700 mb-4 ${loading ? 'animate-pulse' : ''}`}>
                <BookOpen size={48} className={loading ? 'text-purple-400' : 'text-slate-300'} />
              </div>
              <p>{loading ? 'جاري تحليل المنهاج وصياغة المذكرة...' : 'أدخل عنوان الدرس واضغط على "توليد" للبدء'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
