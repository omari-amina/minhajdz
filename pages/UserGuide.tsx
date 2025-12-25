
import React, { useState } from 'react';
import { 
  Book, 
  Calendar, 
  FileText, 
  Settings, 
  MessageCircle, 
  PenTool, 
  Sparkles, 
  LayoutDashboard, 
  ChevronDown, 
  ChevronUp, 
  FlaskConical,
  HelpCircle
} from 'lucide-react';

const GuideSection = ({ title, icon: Icon, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 mb-4 transition-all shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 text-primary-600 rounded-lg">
            <Icon size={20} />
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default function UserGuide() {
  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-full shadow-lg mb-4">
            <HelpCircle size={48} className="text-primary-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">دليل استخدام منصة MinaEdu</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          مرجعك الكامل لاحتراف استخدام المنصة الرقمية، من التخطيط السنوي إلى طباعة المذكرات.
        </p>
        
        <div className="flex justify-center gap-4 mt-6">
            <a href="https://t.me/MinaEduSupport" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-1">
                <MessageCircle size={20} />
                <span>انضم لقناة الدعم على تلغرام</span>
            </a>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        
        <GuideSection title="البداية وإعداد الحساب" icon={Settings} defaultOpen={true}>
            <p>قبل البدء في استخدام المنصة، يجب ضبط إعداداتك الشخصية لضمان تجربة مخصصة:</p>
            <ul className="list-disc list-inside space-y-2 marker:text-primary-500">
                <li>انتقل إلى صفحة <b>الإعدادات</b> من القائمة الجانبية.</li>
                <li>تأكد من اختيار <b>الطور التعليمي</b> (متوسط/ثانوي) بشكل صحيح، لأن هذا يحدد قائمة المواد المتاحة.</li>
                <li>حدد <b>المواد</b> التي تدرسها. إذا كنت تدرس مادة مكملة (مثل التاريخ والجغرافيا)، سيقوم النظام بإضافة المادة المرتبطة (التربية المدنية) تلقائياً.</li>
                <li>حدد <b>المستويات</b> (الأقسام) المسندة إليك لهذا العام.</li>
            </ul>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300 mt-2">
                تنبيه: يمكنك استخدام خاصية "النسخ الاحتياطي" في تبويب "البيانات" لحفظ جميع أعمالك في ملف واسترجاعه لاحقاً أو نقله لجهاز آخر.
            </div>
        </GuideSection>

        <GuideSection title="إدارة المذكرات والدروس" icon={FileText}>
            <p>تعتبر المذكرات قلب المنصة، وتتيح لك تحضير الدروس بطريقة احترافية:</p>
            <ol className="list-decimal list-inside space-y-2 marker:font-bold">
                <li>اضغط على <b>"درس جديد"</b> من القائمة أو لوحة القيادة.</li>
                <li>يمكنك البدء من الصفر، أو استخدام <b>"المولد الذكي"</b> لإنشاء هيكل الدرس باستخدام الذكاء الاصطناعي.</li>
                <li>املأ البيانات الأساسية (المجال، الوحدة، الكفاءات).</li>
                <li>في خانة المحتوى، يمكنك الاختيار بين عدة قوالب (بناء تعلمات، إدماج، تقويم...).</li>
                <li>بعد الحفظ، يمكنك <b>طباعة المذكرة</b> بتنسيق وزاري رسمي أو تصديرها كملف Word للتعديل عليها.</li>
            </ol>
        </GuideSection>

        <GuideSection title="التخطيط السنوي (Planning)" icon={LayoutDashboard}>
            <p>أداة لتوزيع وحدات المنهاج على أسابيع السنة الدراسية:</p>
            <ul className="list-disc list-inside space-y-2">
                <li>اختر المادة والمستوى والشعبة.</li>
                <li>ستظهر لك قائمة الأسابيع مقسمة حسب الفصول الثلاثة.</li>
                <li>اضغط على <b>"إضافة محتوى"</b> في أي أسبوع لاختيار الدروس من المنهاج الرسمي.</li>
                <li>يمكنك تحديد حالة الأسبوع (منجز، متأخر، عطلة) لتلوين الجدول وتسهيل المتابعة.</li>
                <li>اضغط على زر <b>الطباعة</b> للحصول على وثيقة التدرج السنوي جاهزة للتوقيع.</li>
            </ul>
        </GuideSection>

        <GuideSection title="جدول التوقيت" icon={Calendar}>
            <p>تنظيم حصصك الأسبوعية:</p>
            <ul className="list-disc list-inside space-y-2">
                <li>انتقل إلى صفحة جدول التوقيت واضغط على <b>"تعديل"</b>.</li>
                <li>انقر على أي خلية فارغة لإضافة حصة، أو انقر على حصة موجودة لتعديلها أو حذفها.</li>
                <li>سيقوم النظام تلقائياً بتذكيرك بالحصة القادمة في لوحة القيادة وإرسال إشعارات (إذا تم تفعيلها).</li>
            </ul>
        </GuideSection>

        <GuideSection title="الدفتر اليومي والسجل" icon={PenTool}>
            <p>بديل رقمي لدفتر النصوص:</p>
            <ul className="list-disc list-inside space-y-2">
                <li>سجّل ما تم إنجازه في كل حصة (عنوان الدرس، ملخص النشاط).</li>
                <li>سجّل غيابات التلاميذ والملاحظات السلوكية.</li>
                <li>يمكنك ربط التسجيل بمذكرة موجودة مسبقاً لتعبئة البيانات تلقائياً.</li>
                <li>في نهاية الشهر أو الفصل، يمكنك طباعة <b>تقرير المتابعة اليومية</b> بضغطة زر.</li>
            </ul>
        </GuideSection>

        <GuideSection title="المساعد الذكي (AI)" icon={Sparkles}>
            <p>ميزة حصرية لتوفير الوقت:</p>
            <ul className="list-disc list-inside space-y-2">
                <li><b>توليد المذكرات:</b> أدخل عنوان الدرس وسيقوم الذكاء الاصطناعي باقتراح الأهداف، وضعية الانطلاق، والأنشطة.</li>
                <li><b>بناء الاختبارات:</b> في صفحة "بناء الاختبارات"، استخدم المولد لإنشاء أسئلة متعددة الخيارات أو تمارين حسب الموضوع والصعوبة.</li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 mt-2">
                ملاحظة: المحتوى المولد هو مقترح أولي، ننصح دائماً بمراجعته وتعديله ليتناسب مع مستوى تلاميذك.
            </div>
        </GuideSection>

        <GuideSection title="إدارة المخبر (للمواد العلمية)" icon={FlaskConical}>
            <p>خاص بأساتذة العلوم، الفيزياء، والتكنولوجيا:</p>
            <ul className="list-disc list-inside space-y-2">
                <li>سجل قائمة الأدوات المتوفرة (الجرد السريع).</li>
                <li>أنشئ طلبات تحضير للتجارب القادمة لتذكير المخبري أو الإدارة.</li>
                <li>اطبع تقارير حالة المخبر واحتياجات الصيانة.</li>
            </ul>
        </GuideSection>

      </div>

      {/* Contact Footer */}
      <div className="mt-12 bg-slate-800 rounded-2xl p-8 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">هل واجهت مشكلة تقنية؟</h2>
              <p className="text-slate-300 mb-6 max-w-lg mx-auto">فريق التطوير والمجتمع التعليمي جاهزون للمساعدة. لا تتردد في طرح أسئلتك أو اقتراح ميزات جديدة.</p>
              <a href="https://t.me/MinaEduSupport" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-bold transition-colors">
                  <MessageCircle size={20} />
                  تواصل معنا عبر تلغرام
              </a>
          </div>
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>

    </div>
  );
}
