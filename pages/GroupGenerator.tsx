
import React, { useState } from 'react';
import { Users, Shuffle, RefreshCw, Save, CheckCircle2 } from 'lucide-react';
import { CLASSES, DEFAULT_STUDENTS } from '../constants';
import { useUser } from '../context/UserContext';

// Roles based on the Guide (Page 31-32)
const ROLES = [
    { id: 'leader', label: 'المشرف', desc: 'يوجه العمل ويضمن تنفيذ المهام' },
    { id: 'observer', label: 'الملاحظ', desc: 'يسجل الأفكار في محضر العمل' },
    { id: 'manager', label: 'مسؤول اللوازم', desc: 'يسير الوسائل والتجهيزات' },
    { id: 'reporter', label: 'المقرر', desc: 'يعرض عمل الفوج أمام القسم' }
];

export default function GroupGenerator() {
  const { user } = useUser();
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]?.id || '');
  const [groupCount, setGroupCount] = useState(4);
  const [groups, setGroups] = useState<any[]>([]);
  
  if (!user) return null;

  // In a real app, students would come from DB filtered by class
  // Mocking students for the selected class if not enough in constants
  const generateMockStudents = (classId: string) => {
      return Array.from({ length: 25 }, (_, i) => ({
          id: `st_${classId}_${i}`,
          name: `تلميذ ${i + 1} (${CLASSES.find(c => c.id === classId)?.name})`,
          level: Math.random() > 0.7 ? 'EXCELLENT' : Math.random() > 0.4 ? 'AVERAGE' : 'WEAK'
      }));
  };

  const handleGenerate = () => {
      const students = generateMockStudents(selectedClass);
      const shuffled = [...students].sort(() => 0.5 - Math.random());
      
      const newGroups = [];
      const studentsPerGroup = Math.ceil(students.length / groupCount);

      for (let i = 0; i < groupCount; i++) {
          const groupStudents = shuffled.slice(i * studentsPerGroup, (i + 1) * studentsPerGroup);
          // Assign roles
          const membersWithRoles = groupStudents.map((s, idx) => ({
              ...s,
              role: idx < ROLES.length ? ROLES[idx] : null
          }));
          
          newGroups.push({
              id: i + 1,
              name: `فوج ${i + 1}`,
              members: membersWithRoles
          });
      }
      setGroups(newGroups);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users className="text-primary-600" />
                        تسيير الأفواج (العمل التعاوني)
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">تطبيقاً للمحور 17 من الدليل التربوي: توزيع الأدوار والمهام</p>
                </div>
                <div className="flex gap-2">
                    <select 
                        value={selectedClass} 
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="p-2.5 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        {CLASSES.filter(c => user.levels.includes(c.gradeLevel)).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg px-3">
                        <span className="text-sm font-bold">عدد الأفواج:</span>
                        <input 
                            type="number" 
                            min="2" max="8" 
                            value={groupCount} 
                            onChange={(e) => setGroupCount(Number(e.target.value))}
                            className="w-12 bg-transparent text-center font-bold outline-none"
                        />
                    </div>
                    <button onClick={handleGenerate} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-700">
                        <Shuffle size={18} /> تشكيل
                    </button>
                </div>
            </div>

            {groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.map(group => (
                        <div key={group.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="font-bold text-primary-700 dark:text-primary-400">{group.name}</h3>
                                <span className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm">{group.members.length} تلاميذ</span>
                            </div>
                            <div className="p-3">
                                {group.members.map((member: any) => (
                                    <div key={member.id} className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 dark:border-slate-800 last:border-0">
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{member.name}</span>
                                        {member.role ? (
                                            <span 
                                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                    member.role.id === 'leader' ? 'bg-purple-100 text-purple-700' :
                                                    member.role.id === 'reporter' ? 'bg-blue-100 text-blue-700' :
                                                    member.role.id === 'observer' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`} 
                                                title={member.role.desc}
                                            >
                                                {member.role.label}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-slate-400">عضو</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>اختر القسم وعدد الأفواج ثم