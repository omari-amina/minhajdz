
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { UserRole, EducationStage } from '../types';
import { UserPlus, Mail, Lock, User, School, Loader2, AlertCircle, GraduationCap, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { HIGH_SCHOOL_SUBJECTS, HIGH_SCHOOL_LEVELS } from '../constants';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useUser();
  
  // Form Steps: 1=Account, 2=Professional Profile
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      schoolName: '',
      role: UserRole.TEACHER,
      educationStage: 'HIGH' as EducationStage,
      subjects: [] as string[],
      levels: [] as string[]
  });

  const availableSubjects = HIGH_SCHOOL_SUBJECTS;
  const availableLevels = HIGH_SCHOOL_LEVELS;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSelection = (field: 'subjects' | 'levels', value: string) => {
      setFormData(prev => {
          const list = prev[field];
          let newList = [...list];
          
          if (list.includes(value)) {
              // Remove
              newList = list.filter(i => i !== value);
          } else {
              // Add
              newList.push(value);
          }
          
          return { ...prev, [field]: newList };
      });
  };

  const handleNextStep = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.password.length < 6) {
          setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          return;
      }
      setStep(2);
      setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.subjects.length === 0) {
        setError('يرجى اختيار مادة واحدة على الأقل');
        return;
    }
    if (formData.levels.length === 0) {
        setError('يرجى اختيار مستوى واحد على الأقل');
        return;
    }

    setLoading(true);

    const result = await signup({
        name: formData.name,
        email: formData.email,
        schoolName: formData.schoolName,
        role: UserRole.TEACHER,
        educationStage: 'HIGH',
        subjects: formData.subjects,
        levels: formData.levels
    }, formData.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'حدث خطأ أثناء إنشاء الحساب');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-8">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="Minhajiya" className="h-20 mx-auto mb-4 object-contain drop-shadow-md" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">حساب أستاذ جديد</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">خطوة {step} من 2: {step === 1 ? 'بيانات الحساب' : 'الإعدادات البيداغوجية'}</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-in fade-in">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
              <form onSubmit={handleNextStep} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">الاسم واللقب</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="name" type="text" value={formData.name} onChange={handleChange}
                      className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="أ. محمد أحمد" required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">البريد الإلكتروني المهني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="email" type="email" value={formData.email} onChange={handleChange}
                      className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="prof@education.dz" required dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">المؤسسة التربوية</label>
                  <div className="relative">
                    <School className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="schoolName" type="text" value={formData.schoolName} onChange={handleChange}
                      className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="ثانوية ..." required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="password" type="password" value={formData.password} onChange={handleChange}
                      className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="••••••••" required dir="ltr"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 mt-6">
                  <span>التالي: التخصص</span>
                  <ArrowLeft size={18} />
                </button>
              </form>
          ) : (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  {/* Subjects Selection */}
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">المادة / المواد المسندة</label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                          {availableSubjects.map(sub => (
                              <button
                                key={sub}
                                type="button"
                                onClick={() => toggleSelection('subjects', sub)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${formData.subjects.includes(sub) ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}
                              >
                                  {formData.subjects.includes(sub) && <Check size={12} />}
                                  {sub}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Levels Selection */}
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">المستويات (الأقسام)</label>
                      <div className="flex flex-wrap gap-2">
                          {availableLevels.map(lvl => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => toggleSelection('levels', lvl)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${formData.levels.includes(lvl) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}
                              >
                                  {lvl}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button type="button" onClick={() => setStep(1)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-lg transition-colors">
                          رجوع
                      </button>
                      <button type="submit" disabled={loading} className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 disabled:opacity-70">
                          {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                          إنشاء الحساب
                      </button>
                  </div>
              </form>
          )}

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold">تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
