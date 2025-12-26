
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  FileText, 
  AlertCircle, 
  Plus,
  FlaskConical,
  Library,
  BookOpen,
  TrendingUp,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Calendar
} from 'lucide-react';
import { CLASSES, HIGH_SCHOOL_LEVELS } from '../constants';
import { LessonStatus } from '../types';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

const StatCard = ({ title, value, icon: Icon, color, bg, subtext, gradient }: any) => (
  <div className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden`}>
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
    <div className="relative z-10">
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">{title}</p>
      <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{subtext}</p>}
    </div>
    <div className={`p-3.5 rounded-xl ${bg} ${color} shadow-sm group-hover:scale-110 transition-transform relative z-10`}>
      <Icon size={24} />
    </div>
  </div>
);

export default function Dashboard() {
  const { user, currentContext } = useUser();
  const { lessons, timetable, curriculumItems } = useData();
  const navigate = useNavigate();
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  if (!user) return null;

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleDomain = (domainKey: string) => {
    setExpandedDomains(prev => 
      prev.includes(domainKey) 
        ? prev.filter(k => k !== domainKey)
        : [...prev, domainKey]
    );
  };

  const filteredClasses = useMemo(() => CLASSES.filter(c => 
    HIGH_SCHOOL_LEVELS.includes(c.gradeLevel)
  ), []);

  const subjectCurriculum = useMemo(() => 
    curriculumItems.filter(c => 
      c.subject === currentContext.subject && 
      user.levels.includes(c.level)
    ),
  [currentContext.subject, user.levels, curriculumItems]);

  const subjectLessons = useMemo(() => 
    lessons.filter(l => {
      const currItem = curriculumItems.find(c => c.id === l.curriculumId);
      const lessonSubject = l.subject || currItem?.subject;
      return lessonSubject === currentContext.subject;
    }),
  [currentContext.subject, lessons, curriculumItems]);

  const completedLessonsCount = subjectLessons.filter(l => l.status === LessonStatus.COMPLETED).length;
  const plannedLessonsCount = subjectLessons.filter(l => l.status === LessonStatus.PLANNED).length;
  
  // Progress Calculation Logic
  const detailedProgress = useMemo(() => {
    const levels = Array.from(new Set(subjectCurriculum.map(c => c.level)));
    return levels.map(level => {
        const levelItems = subjectCurriculum.filter(c => c.level === level);
        const domains = Array.from(new Set(levelItems.map(c => c.domain)));
        const domainData = domains.map(domainName => {
            const domainItems = levelItems.filter(c => c.domain === domainName);
            const units = Array.from(new Set(domainItems.map(c => c.unit)));
            const unitData = units.map(unitName => {
                const unitItems = domainItems.filter(c => c.unit === unitName);
                const total = unitItems.length;
                const completed = subjectLessons.filter(l => 
                    l.status === LessonStatus.COMPLETED &&
                    unitItems.some(item => item.id === l.curriculumId)
                ).length;
                const unitPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                return { unitName, unitPercentage, completed, total };
            });
            const domainCompleted = unitData.reduce((acc, curr) => acc + curr.completed, 0);
            const domainTotal = unitData.reduce((acc, curr) => acc + curr.total, 0);
            const domainPercentage = domainTotal > 0 ? Math.round((domainCompleted / domainTotal) * 100) : 0;
            return { domainName, domainPercentage, units: unitData };
        });
        return { level, domains: domainData };
    });
  }, [subjectCurriculum, subjectLessons]);

  const totalProgress = useMemo(() => {
      const allPercentages = detailedProgress.flatMap(level => level.domains.map(d => d.domainPercentage));
      return allPercentages.length > 0 
          ? Math.round(allPercentages.reduce((acc, curr) => acc + curr, 0) / allPercentages.length)
          : 0;
  }, [detailedProgress]);

  // Next Class Logic
  const getMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const nextClassStatus = useMemo(() => {
      const currentDay = currentTime.getDay();
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      const todayClasses = timetable
        .filter(t => t.dayOfWeek === currentDay)
        .sort((a,b) => getMinutes(a.startTime) - getMinutes(b.startTime));
      
      if (todayClasses.length === 0) return null;

      const currentClass = todayClasses.find(t => {
         const start = getMinutes(t.startTime);
         const end = getMinutes(t.endTime);
         return currentMinutes >= start && currentMinutes < end;
      });

      if (currentClass) return { ...currentClass, status: 'current' };
      const next = todayClasses.find(t => getMinutes(t.startTime) > currentMinutes);
      if (next) return { ...next, status: 'upcoming' };
      return null;
  }, [timetable, currentTime]);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* Header with Context Indicator */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">مرحباً، {user.name.split(' ')[0]} 👋</h1>
          <div className="flex items-center gap-2 text-sm bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm w-fit transition-colors hover:border-primary-200 dark:hover:border-primary-800">
            <span className="text-slate-500 dark:text-slate-400">الفضاء الحالي:</span>
            <span className="font-bold text-primary-600 dark:text-primary-400">{currentContext.subject}</span>
            {user.subjects.length > 1 && <ChevronDown size={14} className="text-slate-400" />}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <Link to="/lessons/new" className="flex items-center gap-2 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold transition-all shadow-xl shadow-slate-500/20 transform active:scale-95">
            <Plus size={20} />
            <span className="hidden sm:inline">تحضير درس جديد</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="إجمالي المذكرات" value={subjectLessons.length} subtext={`${completedLessonsCount} منجز • ${plannedLessonsCount} مخطط`} icon={FileText} color="text-primary-600 dark:text-primary-400" bg="bg-primary-50 dark:bg-primary-500/10" gradient="from-primary-500 to-blue-500" />
        <StatCard title="الأقسام المسندة" value={filteredClasses.length} subtext={`للتعليم الثانوي`} icon={Users} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-500/10" gradient="from-emerald-500 to-teal-500" />
        <StatCard title="تقدم المنهاج" value={`${totalProgress}%`} subtext="متوسط جميع المستويات" icon={TrendingUp} color="text-violet-600 dark:text-violet-400" bg="bg-violet-50 dark:bg-violet-500/10" gradient="from-violet-500 to-purple-500" />
        <StatCard title="عناصر المنهاج" value={subjectCurriculum.length} subtext="وحدة تعليمية مبرمجة" icon={BookOpen} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-500/10" gradient="from-amber-500 to-orange-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Recent Lessons */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                  <Clock size={20} className="text-slate-400" />
                  آخر الدروس ({currentContext.subject})
              </h3>
              <Link to="/lessons" className="text-sm font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors">عرض الكل</Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {subjectLessons.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                          <FileText size={32} />
                      </div>
                      <p className="font-medium mb-1">لا توجد دروس مسجلة بعد</p>
                      <Link to="/lessons/new" className="text-primary-600 hover:underline text-sm font-bold">ابدأ بإضافة درس جديد</Link>
                  </div>
              ) : (
                  subjectLessons.slice(0, 3).map(lesson => {
                    const ids = lesson.classIds || ((lesson as any).classId ? [(lesson as any).classId] : []);
                    const classNames = ids.map(id => CLASSES.find(c => c.id === id)?.name).filter(Boolean).join('، ');
                    return (
                    <div key={lesson.id} onClick={() => navigate(`/lessons/${lesson.id}/edit`)} className="p-5 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-105 transition-transform"><BookOpen size={20} /></div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">{lesson.title}</h4>
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold tracking-wide ${lesson.status === LessonStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>{lesson.status === 'COMPLETED' ? 'منجز' : 'مخطط'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {lesson.date}</span>
                                {classNames && (
                                    <>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span>{classNames}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>);
                })
              )}
            </div>
          </div>

          {/* Curriculum Progress */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2"><TrendingUp size={20} className="text-violet-500" /> تقدم تنفيذ المنهاج</h3>
                <Link to="/curriculum" className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">التفاصيل الكاملة</Link>
            </div>
            <div className="space-y-6">
              {detailedProgress.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium">لا توجد بيانات للمنهاج لهذه المادة حالياً.</p>
                    <p className="text-xs mt-2 text-slate-400">يمكنك إضافة وحدات المنهاج من صفحة <Link to="/curriculum" className="text-primary-600 underline hover:text-primary-700">المنهاج</Link>.</p>
                </div>
              ) : (
                detailedProgress.map(level => (
                  <div key={level.level} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-md flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></span>
                        المستوى: {level.level}
                    </h4>
                    <div className="space-y-3">
                        {level.domains.map(domain => {
                            const domainKey = `${level.level}-${domain.domainName}`;
                            const isExpanded = expandedDomains.includes(domainKey);
                            return (
                                <div key={domainKey} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <button onClick={() => toggleDomain(domainKey)} className="w-full text-right p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between group">
                                      <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-2 items-center">
                                            <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{domain.domainName}</span>
                                            <span className="text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-xs">{domain.domainPercentage}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                                            <div className={`h-2 rounded-full transition-all duration-1000 ${domain.domainPercentage >= 100 ? 'bg-emerald-500' : domain.domainPercentage >= 50 ? 'bg-primary-500' : 'bg-amber-500'}`} style={{ width: `${domain.domainPercentage}%` }}></div>
                                        </div>
                                      </div>
                                      <div className="mr-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                      </div>
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-t border-slate-100 dark:border-slate-700 space-y-3 animate-in slide-in-from-top-1">
                                            {domain.units.map(unit => (
                                                <div key={unit.unitName}>
                                                    <div className="flex justify-between text-xs mb-1.5">
                                                        <span className="font-medium text-slate-600 dark:text-slate-400">{unit.unitName}</span>
                                                        <span className="text-slate-400 dark:text-slate-500">{unit.completed} / {unit.total}</span>
                                                    </div>
                                                    <div className="w-full bg-white dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                        <div className={`h-1.5 rounded-full ${unit.unitPercentage >= 100 ? 'bg-emerald-400' : 'bg-primary-400'}`} style={{ width: `${unit.unitPercentage}%` }}></div>
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
                ))
              )}
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-indigo-950 dark:to-slate-900 rounded-2xl p-6 text-white shadow-2xl shadow-slate-500/20 relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 rounded-full -translate-x-8 translate-y-8 group-hover:scale-125 transition-transform duration-700"></div>
            
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                <Clock size={14} />
                {nextClassStatus && nextClassStatus.status === 'current' ? 'الحصة الجارية الآن' : 'الحصة القادمة (اليوم)'}
            </h3>
            
            {nextClassStatus ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 relative z-10">
                    <div className="text-3xl font-bold mb-1 tracking-tight">{CLASSES.find(c => c.id === nextClassStatus.classId)?.name}</div>
                    <div className="text-lg text-slate-300 mb-6 font-medium font-mono">{nextClassStatus.startTime} - {nextClassStatus.endTime}</div>
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-sm backdrop-blur-md border border-white/10">
                            <div className={`w-2 h-2 rounded-full ${nextClassStatus.status === 'current' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`}></div>
                            {nextClassStatus.room}
                        </div>
                        <Link 
                            to={`/lessons/new?classId=${nextClassStatus.classId}`} 
                            className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-50 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <PlayCircle size={16} className="text-primary-600" /> تحضير الدرس
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="py-6 relative z-10">
                    <p className="text-xl font-bold">لا توجد حصص متبقية اليوم</p>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">وقت ممتاز للتحضير للأسبوع القادم أو أخذ قسط من الراحة.</p>
                </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
             <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                 <AlertCircle size={18} className="text-amber-500" /> تذكيرات
             </h3>
             <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></div>
                    <div>
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">الدفتر اليومي</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">تأكد من تسجيل جميع حصص اليوم وتسجيل الغيابات.</p>
                        <Link to="/daily-log" className="text-[10px] font-bold text-amber-600 hover:text-amber-800 mt-2 inline-block underline">تسجيل الآن</Link>
                    </div>
                </div>
                {currentContext.features.hasLab && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                        <div>
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-200">المخبر</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">تفقد قائمة المواد الناقصة للأعمال التطبيقية القادمة.</p>
                        </div>
                    </div>
                )}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <Link to="/library" className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center gap-3 group">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                    <Library size={24} className="text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">المكتبة</span>
              </Link>
              {currentContext.features.hasLab && (
                  <Link to="/lab" className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center gap-3 group">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                        <FlaskConical size={24} className="text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">المخبر</span>
                  </Link>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
