
import React, { useState, useEffect, useRef, FC } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Library, 
  FlaskConical, 
  Menu, 
  X, 
  LogOut,
  Bell,
  Moon,
  Sun,
  Settings,
  Map,
  ClipboardList,
  WifiOff,
  PenTool,
  Trello,
  Sparkles,
  ChevronDown,
  Book,
  HelpCircle,
  MessageCircle,
  ExternalLink,
  PlusCircle,
  Users,
  GraduationCap,
  Calculator,
  Search
} from 'lucide-react';
import { CLASSES } from '../constants';
import { AppNotification, LessonStatus, SubjectFeatures } from '../types';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

interface LayoutProps {
  children?: React.ReactNode;
}

interface SidebarItemProps {
  icon: any;
  label: string;
  to: string;
  active: boolean;
  onClick?: () => void;
  disabled?: boolean;
  isSubItem?: boolean;
}

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  onlineOnly?: boolean;
  requiredFeature?: keyof SubjectFeatures;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const SidebarItem: FC<SidebarItemProps> = ({ icon: Icon, label, to, active, onClick, disabled, isSubItem }) => {
  return (
    <div className="relative group mb-1.5 px-3">
      <Link 
        to={disabled ? '#' : to}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 select-none font-medium text-[0.92rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
          disabled
            ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70'
            : active 
              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 translate-x-1' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 hover:translate-x-1'
        }`}
      >
        <Icon size={isSubItem ? 18 : 20} className={`transition-colors ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-400'}`} />
        <span>{label}</span>
      </Link>
      {disabled && (
         <div className="absolute top-1/2 -translate-y-1/2 right-4 ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
           يتطلب اتصالاً بالإنترنت
         </div>
      )}
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { notifications, updateNotifications, timetable, lessons } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Context Management
  const { user, currentContext, switchContext, logout } = useUser();
  const [contextMenuOpen, setContextMenuOpen] = useState(false);

  const [sentNotificationIds, setSentNotificationIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
    
    const ids = new Set<string>();
    notifications.forEach((n: AppNotification) => ids.add(n.id));
    setSentNotificationIds(ids);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkNotifications = () => {
        if (!user) return;
        const settings = user.notificationSettings;
        if (!settings || !settings.enableSystemNotifications) return;

        const now = new Date();
        const newNotifications: AppNotification[] = [];
        
        // Class Reminders logic (kept same as before)
        if (settings.classReminder !== 'none') {
            const minutesBuffer = settings.classReminder === '15_min' ? 15 : settings.classReminder === '30_min' ? 30 : 60;
            const currentDay = now.getDay();
            timetable.forEach(entry => {
                if (entry.dayOfWeek === currentDay) {
                    const [h, m] = entry.startTime.split(':').map(Number);
                    const classTime = new Date(); classTime.setHours(h, m, 0, 0);
                    const diffMs = classTime.getTime() - now.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    if (diffMins === minutesBuffer) {
                        const classGroup = CLASSES.find(c => c.id === entry.classId);
                        const notifId = `notif_class_${entry.id}_${now.getDate()}`;
                        if (!sentNotificationIds.has(notifId) && !notifications.some((n: any) => n.id === notifId)) {
                            newNotifications.push({ id: notifId, type: 'CLASS', title: 'تذكير بحصة قادمة', message: `لديك حصة مع ${classGroup?.name} في ${entry.room} بعد ${minutesBuffer} دقيقة.`, date: now.toISOString().split('T')[0], read: false });
                            setSentNotificationIds(prev => new Set(prev).add(notifId));
                        }
                    }
                }
            });
        }

        // Homework Reminders logic (kept same as before)
        if (settings.homeworkReminder !== 'none') {
            lessons.forEach(lesson => {
                if (lesson.status !== LessonStatus.COMPLETED && lesson.homeworkDueDate && lesson.homework) {
                    const dueDate = new Date(lesson.homeworkDueDate);
                    let shouldNotify = false;
                    let messageStr = "";

                    if (settings.homeworkReminder === '15_min' || settings.homeworkReminder === '1_hour') {
                        const deadline = new Date(dueDate);
                        deadline.setHours(8, 0, 0, 0); 
                        
                        const diffMs = deadline.getTime() - now.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        
                        if (settings.homeworkReminder === '15_min' && diffMins === 15) {
                            shouldNotify = true;
                            messageStr = "موعد تسليم الواجب بعد 15 دقيقة (بداية الدوام).";
                        } else if (settings.homeworkReminder === '1_hour' && diffMins === 60) {
                            shouldNotify = true;
                            messageStr = "موعد تسليم الواجب بعد ساعة.";
                        }
                    } else {
                        const daysBuffer = settings.homeworkReminder === '1_day' ? 1 : settings.homeworkReminder === '2_days' ? 2 : settings.homeworkReminder === '3_days' ? 3 : 7;
                        
                        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const dueZero = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                        const diffTime = dueZero.getTime() - todayZero.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays === daysBuffer) {
                            const reminderTime = settings.dailyReminderTime || '08:00';
                            const [remH, remM] = reminderTime.split(':').map(Number);
                            const nowH = now.getHours();
                            const nowM = now.getMinutes();
                            
                            if (nowH > remH || (nowH === remH && nowM >= remM)) {
                                shouldNotify = true;
                                messageStr = `موعد تسليم الواجب لدرس "${lesson.title}" يستحق ${daysBuffer === 1 ? 'غداً' : `بعد ${daysBuffer} أيام`}.`;
                            }
                        }
                    }

                    if (shouldNotify) {
                        const notifId = `notif_hw_${lesson.id}_${settings.homeworkReminder}`;
                        if (!sentNotificationIds.has(notifId) && !notifications.some((n: any) => n.id === notifId)) {
                             newNotifications.push({ id: notifId, type: 'HOMEWORK', title: 'تذكير بواجب منزلي', message: messageStr, date: now.toISOString().split('T')[0], read: false, link: `/lessons/${lesson.id}/edit` });
                            setSentNotificationIds(prev => new Set(prev).add(notifId));
                        }
                    }
                }
            });
        }

        if (newNotifications.length > 0) {
            updateNotifications([...newNotifications, ...notifications]);
        }
    };

    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, [notifications, sentNotificationIds, user, timetable, lessons, updateNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => { 
    if (window.confirm("هل أنت متأكد من تسجيل الخروج؟")) {
      logout();
      navigate('/login');
    }
  };
  
  const markAsRead = (id: string) => updateNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => updateNotifications(notifications.map(n => ({ ...n, read: true })));
  const handleMobileNavClick = () => setSidebarOpen(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return null;

  // Grouped Menu Logic
  const menuGroups: MenuGroup[] = [
    {
        title: 'الرئيسية',
        items: [
            { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/' },
            { icon: Calendar, label: 'جدول التوقيت', path: '/timetable' },
        ]
    },
    {
        title: 'التحضير البيداغوجي',
        items: [
            { icon: BookOpen, label: 'دفتر التحضير', path: '/lessons' },
            { icon: Trello, label: 'التخطيط السنوي', path: '/planning' },
            { icon: Map, label: 'المنهاج', path: '/curriculum' },
            { icon: Sparkles, label: 'المساعد الذكي (AI)', path: '/ai-generator', onlineOnly: true },
        ]
    },
    {
        title: 'تسيير القسم والتقويم',
        items: [
            { icon: ClipboardList, label: 'الدفتر اليومي', path: '/daily-log' },
            { icon: Users, label: 'تسيير الأفواج', path: '/groups' },
            { icon: PenTool, label: 'بناء الاختبارات', path: '/assessments/new' },
            { icon: Calculator, label: 'كشف النقاط', path: '/marks' },
        ]
    },
    {
        title: 'الموارد والدعم',
        items: [
            { icon: GraduationCap, label: 'الدليل التربوي', path: '/pedagogy-guide' },
            { icon: Library, label: 'المكتبة الرقمية', path: '/library' },
            { icon: FlaskConical, label: 'سجل المخبر', path: '/lab', requiredFeature: 'hasLab' },
        ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 font-sans flex-col lg:flex-row overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />}
      
      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} shadow-2xl lg:shadow-none`}>
        
        {/* Brand */}
        <div className="px-6 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
             <div className="relative">
                <div className="absolute inset-0 bg-primary-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <img src="/logo.png" alt="Minhajiya" className="w-10 h-10 object-contain relative z-10" />
             </div>
             <div>
               <h1 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">منهجية</h1>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">منصة الأستاذ</p>
             </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={20} /></button>
        </div>

        {/* Quick Action Button */}
        <div className="px-5 mb-2">
            <button 
                onClick={() => { navigate('/lessons/new'); handleMobileNavClick(); }}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-lg shadow-primary-500/30 rounded-xl py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] group"
            >
                <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>تحضير درس جديد</span>
            </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 overflow-y-auto scrollbar-thin space-y-6 pb-6 pt-2">
          
          {/* Context Switcher */}
          <div className="mx-3 relative group">
             <button 
                onClick={() => setContextMenuOpen(!contextMenuOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all group-hover:shadow-md"
             >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm text-primary-600 dark:text-primary-400">
                        <Book size={16} />
                    </div>
                    <div className="flex flex-col text-right overflow-hidden">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">المادة الحالية</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{currentContext.subject}</span>
                    </div>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${contextMenuOpen ? 'rotate-180' : ''}`} />
             </button>
             
             {contextMenuOpen && (
                <div className="absolute top-full right-0 left-0 mt-2 p-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-[10px] text-slate-400 font-bold px-2 py-1 mb-1">اختر مادة للتبديل</p>
                    {user.subjects.map(sub => (
                        <button 
                            key={sub}
                            onClick={() => { switchContext(sub); setContextMenuOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-colors ${currentContext.subject === sub ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            {currentContext.subject === sub && <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>}
                            {sub}
                        </button>
                    ))}
                </div>
             )}
          </div>

          {/* Menu Groups */}
          {menuGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                  <h3 className="px-6 text-[11px] font-bold text-slate-400/80 uppercase tracking-widest mb-2 font-mono">{group.title}</h3>
                  <div className="space-y-0.5">
                      {group.items.map((item) => {
                          if (item.requiredFeature && !currentContext.features[item.requiredFeature]) return null;
                          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                          return (
                              <SidebarItem 
                                key={item.path} 
                                icon={item.icon} 
                                label={item.label} 
                                to={item.path} 
                                active={isActive} 
                                onClick={handleMobileNavClick} 
                                disabled={Boolean(item.onlineOnly && isOffline)} 
                              />
                          );
                      })}
                  </div>
              </div>
          ))}

          {/* Settings Group */}
          <div>
              <h3 className="px-6 text-[11px] font-bold text-slate-400/80 uppercase tracking-widest mb-2 font-mono">الإعدادات</h3>
              <SidebarItem icon={Settings} label="الملف الشخصي" to="/settings" active={location.pathname === '/settings'} onClick={handleMobileNavClick} />
              <SidebarItem icon={HelpCircle} label="مساعدة التطبيق" to="/guide" active={location.pathname === '/guide'} onClick={handleMobileNavClick} />
          </div>

        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm font-bold group">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden relative bg-slate-50 dark:bg-slate-950">
        <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-colors duration-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"><Menu size={24} /></button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white hidden sm:block tracking-tight">
                {menuGroups.flatMap(g => g.items).find(i => location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path)))?.label || 
                 (location.pathname === '/settings' ? 'الإعدادات' : location.pathname === '/guide' ? 'دليل الاستخدام' : 'منهجية')}
            </h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {isOffline && <div className="hidden sm:flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-full text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-100 dark:border-rose-800"><WifiOff size={14} /><span>نمط غير متصل</span></div>}
            
            <button onClick={toggleTheme} className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" title="تغيير المظهر">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2.5 rounded-full transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${showNotifications ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <Bell size={20} />
                  {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-slate-900"></span>
                      </span>
                  )}
                </button>
                {showNotifications && (
                   <div className="absolute top-full mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 left-0 sm:left-auto sm:right-0 transform -translate-x-4 sm:translate-x-0 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                         <h3 className="font-bold text-slate-800 dark:text-white text-sm">الإشعارات</h3>
                         {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-bold px-2 py-1 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded transition-colors">تحديد الكل كمقروء</button>}
                      </div>
                      <div className="max-h-[24rem] overflow-y-auto scrollbar-thin">
                         {notifications.length === 0 ? <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2"><Bell size={32} className="opacity-20" /><span>لا توجد إشعارات جديدة</span></div> : notifications.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(notif => (
                             <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-4 border-b border-slate-50 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group ${!notif.read ? 'bg-primary-50/40 dark:bg-primary-900/10' : ''}`}>
                                <div className="flex items-start gap-3">
                                   <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${notif.type === 'HOMEWORK' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : notif.type === 'CLASS' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{notif.type === 'HOMEWORK' ? <BookOpen size={16} /> : notif.type === 'CLASS' ? <Calendar size={16} /> : <Bell size={16} />}</div>
                                   <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start mb-1 gap-2"><h4 className={`text-sm font-bold truncate ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{notif.title}</h4><span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">{notif.date}</span></div>
                                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{notif.message}</p>
                                   </div>
                                   {!notif.read && <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0 shadow-sm shadow-primary-500/50"></div>}
                                </div>
                             </div>
                           ))}
                      </div>
                   </div>
                )}
            </div>
            
            <div className="h-8 w-px bg-slate-200 dark:border-slate-800 mx-1 hidden sm:block"></div>
            
            <Link to="/settings" className="flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 pl-1 pr-3 py-1.5 rounded-full transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform">
                {user.avatar ? <img src={user.avatar} alt="User" className="w-full h-full object-cover" /> : <span className="font-bold text-xs text-slate-600 dark:text-slate-300">{user.name.charAt(0)}</span>}
              </div>
              <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{user.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">أستاذ</p>
              </div>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
