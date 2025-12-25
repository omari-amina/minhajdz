
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
  PlayCircle
} from 'lucide-react';
import { CLASSES, HIGH_SCHOOL_LEVELS } from '../constants';
import { LessonStatus } from '../types';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

const StatCard = ({ title, value, icon: Icon, color, bg, subtext }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
      {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${bg} ${color}`}>
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">مرحباً، {user.name.split(' ')[0]} 👋</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 w-fit shadow-sm">
            <span>أنت الآن في فضاء:</span>
            <span className="font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded">{currentContext.subject}</span>
            {user.subjects.length > 1 && <span className="text-xs text-slate-400">(يمكنك التغيير من القائمة)</span>}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <Link to="/lessons/new" className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-bold transition-transform active:scale-95 shadow-lg shadow-primary-500/20">
            <Plus size={20} />
            <span className="hidden sm:inline">تحضير درس جديد</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي المذكرات" value={subjectLessons.length} subtext={`${completedLessonsCount} منجز • ${plannedLessonsCount} مخطط`} icon={FileText} color="text-primary-600 dark:text-primary-400" bg="bg-primary-100 dark:bg-primary-500/10" />
        <StatCard title="الأقسام المسندة" value={filteredClasses.length} subtext={`للتعليم الثانوي`} icon={Users} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-100 dark:bg-emerald-500/10" />
        <StatCard title="تقدم المنهاج" value={`${totalProgress}%`} subtext="متوسط جميع المستويات" icon={TrendingUp} color="text-violet-600 dark:text-violet-400" bg="bg-violet-100 dark:bg-violet-500/10" />
        <StatCard title="عناصر المنهاج" value={subjectCurriculum.length} subtext="وحدة تعليمية مبرمجة" icon={BookOpen} color="text-amber-600 dark:text-amber-400" bg="bg-amber-100 dark:bg-amber-500/10" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Recent Lessons */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">آخر الدروس ({currentContext.subject})</h3>
              <Link to="/lessons" className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"><MoreHorizontal size={20} /></Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {subjectLessons.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                      <p className="mb-2">لا توجد دروس مسجلة بعد</p>
                      <Link to="/lessons/new" className="text-primary-600 hover:underline text-sm">ابدأ بإضافة درس جديد</Link>
                  </div>
              ) : (
                  subjectLessons.slice(0, 3).map(lesson => {
                    const ids = lesson.classIds || ((lesson as any).classId ? [(lesson as any).classId] : []);
                    const classNames = ids.map(id => CLASSES.find(c => c.id === id)?.name).filter(Boolean).join('، ');
                    return (
                    <div key={lesson.id} onClick={() => navigate(`/lessons/${lesson.id}/edit`)} className="p-5 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                        <div className="p-3 bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-300 rounded-lg"><BookOpen size={20} /></div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{lesson.title}</h4>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${lesson.status === LessonStatus.COMPLETED ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>{lesson.status === 'COMPLETED' ? 'منجز' : 'مخطط'}</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                <span>{lesson.date}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span>{classNames}</span>
                            </p>
                        </div>
                    </div>);
                })
              )}
            </div>
          </div>

          {/* Curriculum Progress */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2"><TrendingUp size={20} className="text-primary-500" />تقدم تنفيذ المنهاج</h3>
                <Link to="/curriculum" className="text-sm font-medium text-primary-600 hover:underline">التفاصيل</Link>
            </div>
            <div className="space-y-6">
              {detailedProgress.length === 0 ? (
                <div className="text-center py-6 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-sm">لا توجد بيانات للمنهاج لهذه المادة حالياً.</p>
                    <p className="text-xs mt-1">يمكنك إضافة وحدات المنهاج من صفحة <Link to="/curriculum" className="text-primary-600 underline">المنهاج</Link>.</p>
                </div>
              ) : (
                detailedProgress.map(level => (
                  <div key={level.level} className="border border-slate-100 dark:border-slate-800 rounded-lg p-4">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 text-md flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                        المستوى: {level.level}
                    </h4>
                    <div className="space-y-4">
                        {level.domains.map(domain => {
                            const domainKey = `${level.level}-${domain.domainName}`;
                            const isExpanded = expandedDomains.includes(domainKey);
                            return (
                                <div key={domainKey}>
                                    <button onClick={() => toggleDomain(domainKey)} className="w-full text-right p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-2 items-center">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{domain.domainName}</span>
                                            <span className="text-slate-500 dark:text-slate-400 font-bold">{domain.domainPercentage}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                            <div className={`h-2.5 rounded-full transition-all duration-1000 ${domain.domainPercentage >= 100 ? 'bg-green-500' : domain.domainPercentage >= 50 ? 'bg-primary-500' : 'bg-amber-500'}`} style={{ width: `${domain.domainPercentage}%` }}></div>
                                        </div>
                                      </div>
                                      <div className="mr-4 text-slate-400">{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="mt-3 pr-6 pl-2 space-y-3 border-r-2 border-slate-200 dark:border-slate-700 animate-in fade-in duration-300">
                                            {domain.units.map(unit => (
                                                <div key={unit.unitName}>
                                                    <div className="flex justify-between text-xs mb-1.5">
                                                        <span className="font-medium text-slate-600 dark:text-slate-400">{unit.unitName}</span>
                                                        <span className="text-slate-500 dark:text-slate-400">{unit.completed} / {unit.total} درس</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-600 rounded-full h-1.5 overflow-hidden">
                                                        <div className={`h-1.5 rounded-full ${unit.unitPercentage >= 100 ? 'bg-green-400' : 'bg-primary-500'}`} style={{ width: `${unit.unitPercentage}%` }}></div>
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
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-900/50 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full translate-x-8 -translate-y-8"></div>
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <Clock size={16} />
                {nextClassStatus && nextClassStatus.status === 'current' ? 'الحصة الجارية الآن' : 'الحصة القادمة (اليوم)'}
            </h3>
            {nextClassStatus ? (
                <div className="animate-in fade-in duration-500">
                    <div className="text-3xl font-bold mb-1">{CLASSES.find(c => c.id === nextClassStatus.classId)?.name}</div>
                    <div className="text-lg text-slate-300 mb-4">{nextClassStatus.startTime} - {nextClassStatus.endTime}</div>
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-sm backdrop-blur-sm">
                            <div className={`w-2 h-2 rounded-full ${nextClassStatus.status === 'current' ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`}></div>
                            {nextClassStatus.room}
                        </div>
                        {/* Smart Prepare Button */}
                        <Link 
                            to={`/lessons/new?classId=${nextClassStatus.classId}`} 
                            className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1 shadow-md"
                        >
                            <PlayCircle size={14} /> تحضير الدرس
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="py-4">
                    <p className="text-lg font-bold">لا توجد حصص متبقية اليوم</p>
                    <p className="text-sm text-slate-400 mt-1">وقت ممتاز للتحضير أو الراحة!</p>
                </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
             <h3 className="font-bold text-slate-800 dark:text-white mb-4">تذكيرات</h3>
             <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                    <AlertCircle size={18} className="text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-400">تحقق من الدفتر اليومي</p>
                        <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">هل سجلت جميع حصص اليوم؟</p>
                    </div>
                </div>
                {currentContext.features.hasLab && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        <FlaskConical size={18} className="text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-blue-800 dark:text-blue-400">المخبر</p>
                            <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">تأكد من توفر المواد للحصة التطبيقية القادمة.</p>
                        </div>
                    </div>
                )}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <Link to="/library" className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center gap-2 group">
                  <Library size={24} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">المكتبة</span>
              </Link>
              {currentContext.features.hasLab && (
                  <Link to="/lab" className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center gap-2 group">
                      <FlaskConical size={24} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">المخبر</span>
                  </Link>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
