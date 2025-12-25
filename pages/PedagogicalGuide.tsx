
import React, { useState } from 'react';
import { BookOpen, Users, Brain, ClipboardCheck, PenTool, Layout, ChevronDown, ChevronUp, Search, GraduationCap } from 'lucide-react';

const GUIDE_CONTENT = [
  {
    id: 'D1',
    title: 'الأسس البيداغوجية والمهنية',
    icon: GraduationCap,
    items: [
      {
        title: 'السلوكات المهنية العامة',
        content: 'الأستاذ قدوة: الاستقامة، الصدق، الأمانة، والعدل هي السمات الرئيسية. الرقيب الحقيقي هو الضمير. تجنب العنف وانبذ العقاب البدني.'
      },
      {
        title: 'أسس الفكر البيداغوجي',
        content: 'التمييز بين الطرائق (الإلقائية، السلوكية، البنائية). البيداغوجيا البنائية الاجتماعية هي الأنجع حيث يبني المتعلم معارفه. التمييز بين الغاية (السياسة)، المرمى (البرنامج)، والهدف (الدرس).'
      },
      {
        title: 'الكفاءات العشر للتدريس',
        content: '1. التصرف كموظف دولة مسؤول. 2. التحكم في المادة. 3. التحكم في لغة التدريس (العربية). 4. التخطيط للتعليم. 5. تنظيم القسم. 6. التقويم. 7. استعمال التكنولوجيا. 8. العمل الفريقي. 9. التعامل باحترام. 10. تنمية الحس المدني.'
      }
    ]
  },
  {
    id: 'D2',
    title: 'تسيير القسم والتفاعل',
    icon: Users,
    items: [
      {
        title: 'بداية الدرس',
        content: 'الدقائق الأولى حاسمة. استجمع الانتباه قبل البدء. ابدأ بإشكالية (وضعية انطلاق). لا تصرخ، الصوت الهادئ أشد تأثيراً. ثق بنفسك.'
      },
      {
        title: 'تنظيم جلوس التلاميذ',
        content: 'ضع قصار القامة وضعاف البصر/السمع في الأمام. نبه الأولياء للحالات الصحية. جرب تنظيم الجلوس على شكل U للمناقشات.'
      },
      {
        title: 'تنظيم عمل الأفواج',
        content: 'وزع الأدوار: المشرف (يوجه)، الملاحظ (يسجل)، مسؤول اللوازم، المقرر (يعرض). اطرح تحدياً ولا تتدخل إلا للتوجيه.'
      },
      {
        title: 'انضباط القسم',
        content: 'عامل التلاميذ بالحسنى. العقاب البدني ممنوع تماماً. لا تعاقب جماعياً. لا تطرد تلميذاً إلا للضرورة القصوى (لأنك تحرمه من التعلم).'
      }
    ]
  },
  {
    id: 'D3',
    title: 'التحضير والتخطيط',
    icon: Layout,
    items: [
      {
        title: 'كيفية تنفيذ المناهج (التدرج)',
        content: 'التدرج ليس مجرد توزيع زمني بل خطة لتنمية الكفاءات. لا تتبع الكتاب المدرسي خطياً. خصم العطل والتقويمات من الحجم الساعي مسبقاً.'
      },
      {
        title: 'تحضير الدروس',
        content: 'أعد مذكرة وبطاقة تقنية. حدد الوسائل وجهز خطة بديلة (Plan B). توقع أسئلة التلاميذ وصعوبات التعلم.'
      },
      {
        title: 'الوضعية الإدماجية',
        content: 'تأتي بعد التعلمات لإدماج الموارد. مراحلها: الانطلاق (تصورات)، البناء (نشط)، ثم وضعية تقويمية بمعايير (الوجاهة، الاستعمال السليم، الانسجام، الإبداع).'
      }
    ]
  },
  {
    id: 'D4',
    title: 'التقويم والمعالجة',
    icon: ClipboardCheck,
    items: [
      {
        title: 'أنواع التقويم',
        content: 'تشخيصي (بداية الوحدة/العام)، تكويني (أثناء التعلم لإصلاح الخلل)، تحصيلي (نهاية الفترة للحكم على المستوى).'
      },
      {
        title: 'بناء الاختبارات',
        content: 'أسئلة متدرجة الصعوبة. تجنب أسئلة نعم/لا. أرفق الأسئلة بسلم تنقيط مفصل. لا تظلم التلاميذ بأسئلة لم يتعودوا عليها.'
      },
      {
        title: 'التقويم الذاتي (Self-Evaluation)',
        content: 'درب التلاميذ على تصحيح أخطائهم بأنفسهم. للأستاذ: قم بتقويم ذاتي بعد كل حصة (هل نشطت التلاميذ؟ هل حققت الأهداف؟).'
      }
    ]
  }
];

export default function PedagogicalGuide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('D1');

  const filteredContent = GUIDE_CONTENT.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.title.includes(searchTerm) || item.content.includes(searchTerm)
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6 animate-in fade-in duration-500">
      
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <BookOpen size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold">الدليل التربوي للأستاذ</h1>
                <p className="text-emerald-100 mt-1">إرشادات رسمية من وزارة التربية الوطنية (مديرية التعليم الثانوي)</p>
            </div>
        </div>
        
        <div className="relative max-w-xl">
            <input 
                type="text" 
                placeholder="بحث عن إرشاد، طريقة، أو نصيحة..." 
                className="w-full pl-4 pr-12 py-3 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredContent.map(section => (
            <div key={section.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <button 
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                            <section.icon size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white text-right">{section.title}</h2>
                    </div>
                    {expandedSection === section.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </button>
                
                {expandedSection === section.id && (
                    <div className="border-t border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                        {section.items.map((item, idx) => (
                            <div key={idx} className="p-5 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                                    <PenTool size={16} className="text-emerald-500" />
                                    {item.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm text-justify">
                                    {item.content}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ))}
      </div>

      <div className="text-center text-slate-400 text-sm mt-8">
        مرجع: النشرة الرسمية للتربية الوطنية - الدليل التربوي لأستاذ التعليم الثانوي (أوت 2014)
      </div>
    </div>
  );
}
