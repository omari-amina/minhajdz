
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
  GraduationCap
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
    <div className="relative group mb-1">
      <Link 
        to={disabled ? '#' : to}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 select-none font-medium text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
          disabled
            ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70'
            : active 
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Icon size={isSubItem ? 18 : 20} className={active ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'} />
        <span>{label}</span>
      </Link>
      {disabled && (
         <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
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
        
        // Class Reminders
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

        // Homework Reminders
        if (settings.homeworkReminder !== 'none') {
            lessons.forEach(lesson => {
                if (lesson.status !== LessonStatus.COMPLETED && lesson.homeworkDueDate && lesson.homework) {
                    const dueDate = new Date(lesson.homeworkDueDate);
                    let shouldNotify = false;
                    let messageStr = "";

                    // Minute/Hour based reminders (Assume deadline is 8:00 AM of due date for calculation)
                    if (settings.homeworkReminder === '15_min' || settings.homeworkReminder === '1_hour') {
                        // Create a deadline object at 8:00 AM on the due date
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
                    } 
                    // Day/Week based reminders
                    else {
                        const daysBuffer = settings.homeworkReminder === '1_day' ? 1 : settings.homeworkReminder === '2_days' ? 2 : settings.homeworkReminder === '3_days' ? 3 : 7;
                        
                        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const dueZero = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                        const diffTime = dueZero.getTime() - todayZero.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays === daysBuffer) {
                            // Check Time (Daily Reminder Time Preference)
                            const reminderTime = settings.dailyReminderTime || '08:00';
                            const [remH, remM] = reminderTime.split(':').map(Number);
                            const nowH = now.getHours();
                            const nowM = now.getMinutes();
                            
                            // Only notify if current time is past the reminder time
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

  if (!user) return null; // Wait for user

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
            { icon: PenTool, label: 'بناء الاختبارات', path: '/assessments/new' },
        ]
    },
    {
        title: 'الموارد والدعم',
        items: [
            { icon: GraduationCap, label: 'الدليل التربوي', path: '/pedagogy-guide' }, // New Page
            { icon: Library, label: 'المكتبة الرقمية', path: '/library' },
            { icon: FlaskConical, label: 'سجل المخبر', path: '/lab', requiredFeature: 'hasLab' },
        ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-200 font-sans flex-col lg:flex-row overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}
      
      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} shadow-xl lg:shadow-none`}>
        
        {/* Brand */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <img src="/logo.png" alt="Minhajiya" className="w-10 h-10 object-contain drop-shadow-sm" />
             <div>
               <h1 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">منهجية</h1>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">منصة الأستاذ</p>
             </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 py-4">
            <button 
                onClick={() => { navigate('/lessons/new'); handleMobileNavClick(); }}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-lg shadow-primary-500/30 rounded-xl py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
                <PlusCircle size={18} />
                <span>تحضير درس جديد</span>
            </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto scrollbar-thin space-y-6 pb-6">
          
          {/* Context Switcher (Embedded in Nav) */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
             <button 
                onClick={() => setContextMenuOpen(!contextMenuOpen)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
             >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-white dark:bg-slate-600 p-1.5 rounded-md shadow-sm text-primary-600 dark:text-primary-400">
                        <Book size={14} />
                    </div>
                    <div className="flex flex-col text-right overflow-hidden">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">المادة الحالية</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{currentContext.subject}</span>
                    </div>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${contextMenuOpen ? 'rotate-180' : ''}`} />
             </button>
             
             {contextMenuOpen && (
                <div className="mt-1 space-y-1 p-1 border-t border-slate-200 dark:border-slate-700">
                    {user.subjects.map(sub => (
                        <button 
                            key={sub}
                            onClick={() => { switchContext(sub); setContextMenuOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors ${currentContext.subject === sub ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600'}`}
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
                  <h3 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{group.title}</h3>
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

          {/* Support Section */}
          <div>
              <h3 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">الإعدادات</h3>
              <SidebarItem icon={Settings} label="الملف الشخصي" to="/settings" active={location.pathname === '/settings'} onClick={handleMobileNavClick} />
              <SidebarItem icon={HelpCircle} label="مساعدة التطبيق" to="/guide" active={location.pathname === '/guide'} onClick={handleMobileNavClick} />
          </div>

        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-bold">
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden relative">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-colors duration-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"><Menu size={24} /></button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white hidden sm:block">
                {/* Find current label safely */}
                {menuGroups.flatMap(g => g.items).find(i => location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path)))?.label || 
                 (location.pathname === '/settings' ? 'الإعدادات' : location.pathname === '/guide' ? 'دليل الاستخدام' : 'منهجية')}
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {isOffline && <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-slate-500 dark:text-slate-400 text-xs font-bold animate-pulse"><WifiOff size={14} /><span>غير متصل</span></div>}
            
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" title="المظهر">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-slate-100 dark:bg-slate-800 text-primary-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
                </button>
                {showNotifications && (
                   <div className="absolute top-full mt-3 w-[85vw] max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 left-0 sm:left-auto sm:right-0 transform translate-x-4 sm:translate-x-0">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                         <h3 className="font-bold text-slate-800 dark:text-white text-sm">الإشعارات</h3>
                         {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">تحديد الكل كمقروء</button>}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                         {notifications.length === 0 ? <div className="p-8 text-center text-slate-500 text-xs">لا توجد إشعارات جديدة</div> : notifications.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(notif => (
                             <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-4 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!notif.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                                <div className="flex items-start gap-3">
                                   <div className={`mt-1 p-1.5 rounded-full ${notif.type === 'HOMEWORK' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>{notif.type === 'HOMEWORK' ? <BookOpen size={14} /> : notif.type === 'CLASS' ? <Calendar size={14} /> : <Bell size={14} />}</div>
                                   <div className="flex-1">
                                      <div className="flex justify-between items-start mb-1"><h4 className={`text-xs font-bold ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{notif.title}</h4><span className="text-[10px] text-slate-400">{notif.date}</span></div>
                                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{notif.message}</p>
                                   </div>
                                   {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"></div>}
                                </div>
                             </div>
                           ))}
                      </div>
                   </div>
                )}
            </div>
            
            <div className="h-6 w-px bg-slate-200 dark:border-slate-800 mx-1 hidden sm:block"></div>
            
            <Link to="/settings" className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 pl-1 pr-2 py-1 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-600">
                {user.avatar ? <img src={user.avatar} alt="User" className="w-full h-full object-cover" /> : <span className="font-bold text-xs text-slate-500 dark:text-slate-400">{user.name.charAt(0)}</span>}
              </div>
              <div className="text-left hidden md:block leading-3">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{user.name.split(' ')[0]}</p>
              </div>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
