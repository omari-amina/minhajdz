
import React, { useState, useEffect, useRef } from 'react';
import { Save, User as UserIcon, School, Calendar, CheckCircle, Book, Layers, Bell, Shield, Key, Database, Download, Upload, AlertTriangle, RefreshCw, Camera, Info, X, Users, ChevronRight } from 'lucide-react';
import { HIGH_SCHOOL_SUBJECTS, HIGH_SCHOOL_LEVELS, CLASSES } from '../constants';
import { User, NotificationPreferences, EducationStage } from '../types';
import { useUser } from '../context/UserContext';

// Subject Categories for better UX
const SUBJECT_CATEGORIES = {
  SCIENCES: { 
    label: 'المواد العلمية والتقنية', 
    items: ['رياضيات', 'فيزياء', 'علوم طبيعية', 'معلوماتية', 'هندسة مدنية', 'هندسة ميكانيكية', 'هندسة كهربائية', 'هندسة الطرائق', 'تكنولوجيا'] 
  },
  LANGUAGES: {
    label: 'اللغات',
    items: ['لغة عربية', 'لغة إنجليزية', 'لغة فرنسية', 'لغة أسبانية', 'لغة ألمانية', 'لغة إيطالية']
  },
  HUMANITIES: {
    label: 'العلوم الإنسانية والاجتماعية',
    items: ['تاريخ وجغرافيا', 'علوم إسلامية', 'فلسفة']
  },
  ECONOMICS: {
    label: 'التسيير والاقتصاد',
    items: ['تسيير محاسبي ومالي', 'قانون', 'اقتصاد ومناجمنت']
  }
};

export default function ProfileSettings() {
  const { user, updateUser } = useUser();
  const [formData, setFormData] = useState<User>(user);
  const [saved, setSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState(''); // Generic Toast
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'data' | 'notifications'>('profile');
  
  // Security State
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  
  // Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(prev => ({
        ...user,
        assignedClassIds: user.assignedClassIds || [] // Ensure it exists
    }));
  }, [user]);

  const showToast = (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(''), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (field: keyof NotificationPreferences, value: any) => {
      setFormData(prev => ({
          ...prev,
          notificationSettings: {
              ...(prev.notificationSettings || { homeworkReminder: '1_day', classReminder: '15_min', enableSystemNotifications: true }),
              [field]: value
          }
      }));
  };

  const toggleSelection = (field: 'subjects' | 'levels', value: string) => {
    setFormData(prev => {
      const list = prev[field] || [];
      let newList = [...list];
      
      if (list.includes(value)) {
          // Remove
          newList = list.filter(item => item !== value);
      } else {
          // Add
          newList.push(value);
      }
      return { ...prev, [field]: newList };
    });
  };

  const toggleAssignedClass = (classId: string) => {
      setFormData(prev => {
          const list = prev.assignedClassIds || [];
          let newList = [...list];
          if (list.includes(classId)) {
              newList = list.filter(id => id !== classId);
          } else {
              newList.push(classId);
          }
          return { ...prev, assignedClassIds: newList };
      });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData(prev => ({ ...prev, avatar: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordData.new !== passwordData.confirm) {
          alert("كلمة المرور الجديدة غير متطابقة");
          return;
      }
      if (passwordData.new.length < 6) {
          alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
          return;
      }
      // Mock API call
      setSaved(true);
      setPasswordData({ current: '', new: '', confirm: '' });
      setTimeout(() => {
          setSaved(false);
          alert("تم تحديث كلمة المرور بنجاح (محاكاة)");
      }, 1000);
  };

  const handleExportData = () => {
      const data: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('minaedu_')) {
              try {
                  data[key] = JSON.parse(localStorage.getItem(key) || 'null');
              } catch (e) {
                  data[key] = localStorage.getItem(key);
              }
          }
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `minaedu_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (window.confirm('سيتم استبدال جميع البيانات الحالية بالبيانات المستوردة. هل أنت متأكد؟')) {
                  Object.keys(json).forEach(key => {
                      if (key.startsWith('minaedu_')) {
                          localStorage.setItem(key, JSON.stringify(json[key]));
                      }
                  });
                  alert('تم استعادة البيانات بنجاح. سيتم إعادة تحميل الصفحة.');
                  window.location.reload();
              }
          } catch (err) {
              alert('ملف النسخ الاحتياطي غير صالح');
          }
      };
      reader.readAsText(file);
  };

  // High School Only
  const currentStageSubjects = HIGH_SCHOOL_SUBJECTS;
  const currentStageLevels = HIGH_SCHOOL_LEVELS;

  // Filter Categories based on Stage
  const getStageCategories = () => {
      const cats: { label: string, items: string[] }[] = [];
      Object.values(SUBJECT_CATEGORIES).forEach(cat => {
          const relevantItems = cat.items.filter(item => currentStageSubjects.includes(item));
          if (relevantItems.length > 0) {
              cats.push({ label: cat.label, items: relevantItems });
          }
      });
      return cats;
  };

  const inputClasses = "w-full pr-10 pl-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-colors";
  const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 relative">
       
       {/* Toast Notification */}
       {toastMsg && (
           <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
               <Info size={18} className="text-primary-400" />
               <span className="text-sm font-medium">{toastMsg}</span>
               <button onClick={() => setToastMsg('')}><X size={14} className="opacity-50 hover:opacity-100" /></button>
           </div>
       )}

       {saved && (
         <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-bounce">
           <CheckCircle size={20} />
           <span>تم حفظ التغييرات بنجاح!</span>
         </div>
       )}

       {/* Header */}
       <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center gap-6">
           <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
               <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-700 shadow-inner bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                   {formData.avatar ? (
                       <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                       <UserIcon size={40} className="text-slate-400" />
                   )}
               </div>
               <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera size={24} className="text-white" />
               </div>
               <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
           </div>
           <div className="text-center md:text-right flex-1">
               <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{formData.name || 'مستخدم جديد'}</h1>
               <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-2 mt-1">
                   <School size={16} /> {formData.schoolName || 'لم يتم تحديد المؤسسة'}
               </p>
               <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                   <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold">
                       التعليم الثانوي
                   </span>
                   <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">
                       {formData.subjects.length} مواد
                   </span>
                   <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold">
                       {formData.assignedClassIds?.length || 0} أقسام مسندة
                   </span>
               </div>
           </div>
       </div>

       {/* Tabs Navigation */}
       <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-xl overflow-x-auto shadow-sm mt-6">
           {[
               { id: 'profile', icon: UserIcon, label: 'الملف الشخصي' },
               { id: 'notifications', icon: Bell, label: 'الإشعارات' },
               { id: 'security', icon: Shield, label: 'الأمان' },
               { id: 'data', icon: Database, label: 'البيانات' }
           ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-all min-w-fit whitespace-nowrap ${activeTab === tab.id ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
               >
                   <tab.icon size={18} /> {tab.label}
               </button>
           ))}
       </div>

       <div className="bg-white dark:bg-slate-800 rounded-b-xl shadow-sm border border-t-0 border-slate-200 dark:border-slate-700 p-6 min-h-[400px]">
          
          {/* --- TAB: PROFILE --- */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Basic Info & Assignments */}
                    <div className="lg:col-span-7 space-y-6">
                        <section>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">المعلومات الشخصية</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>الاسم الكامل</label>
                                    <div className="relative"><UserIcon size={18} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 z-10" /><input name="name" type="text" value={formData.name || ''} onChange={handleChange} className={inputClasses} required /></div>
                                </div>
                                <div>
                                    <label className={labelClasses}>البريد الإلكتروني</label>
                                    <div className="relative"><input name="email" type="email" value={formData.email || ''} onChange={handleChange} className={`${inputClasses} px-3 text-left dir-ltr opacity-70 cursor-not-allowed bg-slate-100 dark:bg-slate-800`} dir="ltr" disabled /></div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">المؤسسة والطور</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>اسم المؤسسة</label>
                                    <div className="relative"><School size={18} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 z-10" /><input name="schoolName" type="text" value={formData.schoolName || ''} onChange={handleChange} className={inputClasses} required /></div>
                                </div>
                                <div>
                                    <label className={labelClasses}>السنة الدراسية</label>
                                    <div className="relative"><Calendar size={18} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 z-10" /><input name="academicYear" type="text" value={formData.academicYear || ''} onChange={handleChange} className={inputClasses} required /></div>
                                </div>
                            </div>
                        </section>
                        
                        <section>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">التكليفات التربوية (Teacher Assignments)</h3>
                            
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 mb-2">1. حدد المستويات المسندة (عام)</label>
                                <div className="flex flex-wrap gap-2">
                                    {currentStageLevels.map(level => (
                                        <button key={level} type="button" onClick={() => toggleSelection('levels', level)} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${formData.levels?.includes(level) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-indigo-300'}`}>
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section Assignments (Detailed) */}
                            {formData.levels.length > 0 && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                    <h4 className="flex items-center gap-2 font-bold text-indigo-800 dark:text-indigo-300 text-sm mb-4">
                                        <Users size={16} />
                                        <span>2. تحديد الأفواج والأقسام المسندة بدقة</span>
                                    </h4>
                                    <div className="space-y-6">
                                        {formData.levels.map(level => {
                                            const levelClasses = CLASSES.filter(c => c.gradeLevel === level);
                                            // Group by Stream
                                            const groupedByStream = levelClasses.reduce((acc, curr) => {
                                                const stream = curr.stream || 'عام';
                                                if (!acc[stream]) acc[stream] = [];
                                                acc[stream].push(curr);
                                                return acc;
                                            }, {} as Record<string, typeof levelClasses>);

                                            if (levelClasses.length === 0) return null;

                                            return (
                                                <div key={level} className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                                                    <h5 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-3 border-b border-indigo-100 dark:border-indigo-700 pb-1 flex items-center gap-1">
                                                        <ChevronRight size={14} /> {level}
                                                    </h5>
                                                    
                                                    <div className="space-y-3">
                                                        {Object.entries(groupedByStream).map(([stream, classes]) => (
                                                            <div key={stream}>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">{stream}</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {classes.map(cls => (
                                                                        <button 
                                                                            key={cls.id}
                                                                            type="button"
                                                                            onClick={() => toggleAssignedClass(cls.id)}
                                                                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                                                                                formData.assignedClassIds?.includes(cls.id)
                                                                                ? 'bg-white text-indigo-700 border-indigo-400 shadow-sm ring-1 ring-indigo-300'
                                                                                : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-transparent hover:border-indigo-200'
                                                                            }`}
                                                                        >
                                                                            <div className={`w-3 h-3 rounded-full border ${formData.assignedClassIds?.includes(cls.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}></div>
                                                                            {cls.name}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400 mt-4 pt-2 border-t border-indigo-200 dark:border-indigo-800">
                                        * ستظهر هذه الأقسام فقط في جدول التوقيت والدفتر اليومي.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Subjects */}
                    <div className="lg:col-span-5 space-y-6">
                        <section className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-xl border border-slate-200 dark:border-slate-700 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Book size={18} className="text-primary-500"/> المواد المدرسة</h3>
                            </div>
                            
                            <div className="space-y-6">
                                {getStageCategories().map((cat, idx) => (
                                    <div key={idx}>
                                        <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">{cat.label}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {cat.items.map(subject => (
                                                <button 
                                                    key={subject} 
                                                    type="button" 
                                                    onClick={() => toggleSelection('subjects', subject)} 
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                                        formData.subjects?.includes(subject) 
                                                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm transform scale-105' 
                                                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary-400'
                                                    }`}
                                                >
                                                    {subject}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Sticky Footer for Save */}
                <div className="sticky bottom-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 p-4 -mx-6 -mb-6 flex justify-end items-center gap-4 rounded-b-xl">
                    <span className="text-xs text-slate-400 hidden sm:inline">تذكر حفظ التغييرات قبل المغادرة</span>
                    <button type="submit" disabled={saved} className={`flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${saved ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        <Save size={20} /> <span>{saved ? 'تم الحفظ' : 'حفظ المعلومات'}</span>
                    </button>
                </div>
            </form>
          )}

          {/* --- TAB: NOTIFICATIONS --- */}
          {activeTab === 'notifications' && (
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300 py-8">
                  <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-slate-600 shadow-md">
                          <Bell size={32} className="text-amber-500" />
                      </div>
                      <h3 className="text-xl font-bold dark:text-white">تفضيلات الإشعارات</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">تحكم في التنبيهات التي تصلك حول الدروس والواجبات.</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-6">
                      <div className="flex items-center justify-between">
                          <div>
                              <h4 className="font-bold text-slate-800 dark:text-white">تفعيل التنبيهات العامة</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">تشغيل/إيقاف جميع إشعارات النظام</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={formData.notificationSettings?.enableSystemNotifications ?? true}
                                  onChange={e => handleNotificationChange('enableSystemNotifications', e.target.checked)}
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">توقيت التذكير اليومي</label>
                          <div className="flex gap-4 items-end">
                              <div className="flex-1">
                                  <input 
                                      type="time"
                                      value={formData.notificationSettings?.dailyReminderTime || '08:00'}
                                      onChange={e => handleNotificationChange('dailyReminderTime', e.target.value)}
                                      className={inputClasses}
                                  />
                                  <p className="text-xs text-slate-500 mt-1">وقت ظهور التنبيهات للأيام (مثلاً: تذكير قبل يوم على الساعة 8:00).</p>
                              </div>
                          </div>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">تذكير الواجبات المنزلية</label>
                          <select 
                              value={formData.notificationSettings?.homeworkReminder || '1_day'}
                              onChange={e => handleNotificationChange('homeworkReminder', e.target.value)}
                              className={inputClasses}
                          >
                              <option value="none">بدون تذكير</option>
                              <option value="15_min">قبل 15 دقيقة من الموعد</option>
                              <option value="1_hour">قبل ساعة من الموعد</option>
                              <option value="1_day">قبل يوم واحد (24 ساعة)</option>
                              <option value="2_days">قبل يومين</option>
                              <option value="3_days">قبل 3 أيام</option>
                              <option value="1_week">قبل أسبوع</option>
                          </select>
                          <p className="text-xs text-slate-500 mt-1">يتم التذكير بتاريخ التسليم المحدد في المذكرة.</p>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">تذكير الحصص الدراسية</label>
                          <select 
                              value={formData.notificationSettings?.classReminder || '15_min'}
                              onChange={e => handleNotificationChange('classReminder', e.target.value)}
                              className={inputClasses}
                          >
                              <option value="none">بدون تذكير</option>
                              <option value="15_min">قبل 15 دقيقة من الحصة</option>
                              <option value="30_min">قبل 30 دقيقة</option>
                              <option value="1_hour">قبل ساعة</option>
                          </select>
                          <p className="text-xs text-slate-500 mt-1">بناءً على جدول التوقيت المسجل.</p>
                      </div>
                  </div>

                  <div className="flex justify-end">
                      <button type="submit" disabled={saved} className={`flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${saved ? 'opacity-70 cursor-not-allowed' : ''}`}>
                          <Save size={20} /> <span>{saved ? 'تم الحفظ' : 'حفظ الإعدادات'}</span>
                      </button>
                  </div>
              </form>
          )}

          {/* --- TAB: SECURITY --- */}
          {activeTab === 'security' && (
              <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-300 py-8">
                  <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-slate-600 shadow-md">
                          <Key size={32} className="text-slate-500" />
                      </div>
                      <h3 className="text-xl font-bold dark:text-white">تغيير كلمة المرور</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">يُنصح باستخدام كلمة مرور قوية وتحديثها دورياً.</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div>
                          <label className={labelClasses}>كلمة المرور الحالية</label>
                          <input type="password" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} className={inputClasses} placeholder="••••••••" required />
                      </div>
                      <div>
                          <label className={labelClasses}>كلمة المرور الجديدة</label>
                          <input type="password" value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} className={inputClasses} placeholder="••••••••" required minLength={6} />
                      </div>
                      <div>
                          <label className={labelClasses}>تأكيد كلمة المرور</label>
                          <input type="password" value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} className={inputClasses} placeholder="••••••••" required minLength={6} />
                      </div>
                      <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-lg font-bold transition-colors shadow-lg mt-4">
                          تحديث كلمة المرور
                      </button>
                  </form>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4 flex gap-3 text-sm text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="flex-shrink-0" size={20} />
                      <p>ملاحظة: في النسخة الحالية (التجريبية)، يتم حفظ كلمة المرور محلياً. عند تسجيل الخروج، تأكد من تذكر بيانات الدخول.</p>
                  </div>
              </div>
          )}

          {/* --- TAB: DATA --- */}
          {activeTab === 'data' && (
              <div className="space-y-8 animate-in fade-in duration-300 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Export Section */}
                      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 p-8 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-300 shadow-md">
                              <Download size={32} />
                          </div>
                          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">تصدير البيانات (Backup)</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mb-8 flex-1 leading-relaxed">
                              قم بتحميل نسخة احتياطية من جميع بياناتك (الدروس، التخطيط، النقاط...) كملف JSON. يمكنك استخدامه لاستعادة البيانات لاحقاً أو نقلها لجهاز آخر.
                          </p>
                          <button onClick={handleExportData} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                              <Download size={18} /> تحميل النسخة الاحتياطية
                          </button>
                      </div>

                      {/* Import Section */}
                      <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800 p-8 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-300 shadow-md">
                              <Upload size={32} />
                          </div>
                          <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">استعادة البيانات (Restore)</h3>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-8 flex-1 leading-relaxed">
                              استرجاع البيانات من ملف نسخة احتياطية سابق. <br/>
                              <span className="font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded mt-2 inline-block">تنبيه: سيتم استبدال جميع البيانات الحالية.</span>
                          </p>
                          <button onClick={() => importInputRef.current?.click()} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                              <Upload size={18} /> استيراد ملف النسخة
                          </button>
                          <input type="file" ref={importInputRef} onChange={handleImportData} className="hidden" accept=".json" />
                      </div>
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <RefreshCw size={20} />
                      <p>يتم حفظ البيانات تلقائياً في المتصفح (LocalStorage). استخدم خاصية التصدير للحفاظ على نسخة آمنة خارج المتصفح.</p>
                  </div>
              </div>
          )}
       </div>
    </div>
  );
}
