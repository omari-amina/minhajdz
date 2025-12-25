
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckSquare, Square } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

export default function LabPrint() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { labRequests, labInventory } = useData();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-8 print:p-0 print:bg-white font-serif text-black" dir="rtl">
      
      {/* Controls */}
      <div className="max-w-[210mm] mx-auto mb-8 flex justify-between items-center no-print text-slate-900 dark:text-white">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white">
             <ArrowLeft size={18} />
             رجوع
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-black dark:bg-primary-600 text-white px-6 py-2 rounded shadow hover:bg-gray-800 dark:hover:bg-primary-700 transition-colors font-sans"
        >
          <Printer size={18} />
          طباعة التقرير
        </button>
      </div>

      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 20mm;
            }
            .paper-content, .paper-content * {
              color: black !important;
              border-color: black !important;
            }
          }
           /* Force black text inside the paper container even on screen */
          .paper-content, .paper-content * {
             color: black !important;
             border-color: black;
          }
          .paper-content .text-gray-600 {
             color: #4b5563 !important; /* Allow specifically gray text */
          }
        `}
      </style>

      {/* A4 Container */}
      <div 
        className="mx-auto bg-white shadow-2xl print:shadow-none min-h-[297mm] w-[210mm] print:w-full print:max-w-none box-border !text-black p-[10mm] paper-content"
      >
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-base font-bold mb-1">الجمهورية الجزائرية الديمقراطية الشعبية</h1>
            <h2 className="text-base font-bold mb-4">وزارة التربية الوطنية</h2>
            
            <div className="flex justify-between items-stretch mt-6 border border-black p-1">
                <div className="flex-1 text-right p-2 border-l border-black">
                <p><span className="font-bold">المؤسسة:</span> {user.schoolName}</p>
                <p className="mt-1"><span className="font-bold">مسؤول المخبر:</span> {user.name}</p>
                </div>
                <div className="flex-[0.8] flex items-center justify-center bg-gray-50 print:bg-transparent">
                <h1 className="text-xl font-extrabold tracking-wider uppercase border-2 border-black px-4 py-1">تقرير وضعية المخبر</h1>
                </div>
                <div className="flex-1 text-left p-2 border-r border-black">
                <p><span className="font-bold">السنة الدراسية:</span> {user.academicYear}</p>
                <p className="mt-1"><span className="font-bold">التاريخ:</span> {new Date().toLocaleDateString('ar-DZ')}</p>
                </div>
            </div>
        </div>

        {/* Inventory Section */}
        <div className="mb-8">
            <h3 className="font-bold text-lg mb-2 underline decoration-2">أولاً: جرد العتاد الأساسي</h3>
            <table className="w-full border-collapse border border-black text-sm">
                <thead>
                    <tr className="bg-gray-100 print:bg-gray-200">
                        <th className="border border-black p-2 text-right">التجهيزات</th>
                        <th className="border border-black p-2 text-center w-20">الكمية</th>
                        <th className="border border-black p-2 text-center w-24">الحالة</th>
                        <th className="border border-black p-2 text-center w-24">الموقع</th>
                        <th className="border border-black p-2 text-right">ملاحظات</th>
                    </tr>
                </thead>
                <tbody>
                    {labInventory.length > 0 ? labInventory.map((item) => (
                        <tr key={item.id}>
                            <td className="border border-black p-2 font-bold">{item.name}</td>
                            <td className="border border-black p-2 text-center font-mono">{item.quantity}</td>
                            <td className="border border-black p-2 text-center">
                                {item.status === 'GOOD' ? 'جيد' : item.status === 'FAIR' ? 'متوسط' : item.status === 'BROKEN' ? 'معطل' : item.status === 'CONSUMED' ? 'مستهلك' : 'سيء'}
                            </td>
                            <td className="border border-black p-2 text-center text-xs">{item.location || '-'}</td>
                            <td className="border border-black p-2 text-gray-600 text-xs">{item.notes}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan={5} className="border border-black p-4 text-center">لا يوجد عتاد مسجل</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Maintenance Requests Section */}
        <div className="mb-8">
            <h3 className="font-bold text-lg mb-2 underline decoration-2">ثانياً: سجل الصيانة والطلبات</h3>
            <table className="w-full border-collapse border border-black text-sm">
                <thead>
                    <tr className="bg-gray-100 print:bg-gray-200">
                        <th className="border border-black p-2 text-right">طبيعة الطلب / العطل</th>
                        <th className="border border-black p-2 text-center w-24">التاريخ</th>
                        <th className="border border-black p-2 text-center w-20">الأولوية</th>
                        <th className="border border-black p-2 text-center w-24">الوضعية</th>
                    </tr>
                </thead>
                <tbody>
                    {labRequests.length > 0 ? labRequests.map((req) => (
                        <tr key={req.id}>
                            <td className="border border-black p-2">{req.title}</td>
                            <td className="border border-black p-2 text-center text-xs">{req.date}</td>
                            <td className="border border-black p-2 text-center text-xs">
                                {req.priority === 'HIGH' ? 'عالية' : req.priority === 'MEDIUM' ? 'متوسطة' : 'منخفضة'}
                            </td>
                            <td className="border border-black p-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    {req.status === 'COMPLETED' ? <CheckSquare size={14} /> : <Square size={14} />}
                                    <span>{req.status === 'COMPLETED' ? 'منجز' : 'قيد الانتظار'}</span>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="border border-black p-4 text-center text-gray-500">لا توجد طلبات مسجلة</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Observations */}
        <div className="mb-12">
            <h3 className="font-bold text-lg mb-2 underline decoration-2">ثالثاً: ملاحظات عامة واقتراحات</h3>
            <div className="border border-black min-h-[4cm] p-4 relative">
                <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'linear-gradient(transparent 95%, #000 95%)', backgroundSize: '100% 10mm' }}></div>
            </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end mt-auto">
            <div className="text-center w-1/3">
                <p className="font-bold mb-16">مسؤول المخبر</p>
                <p>....................................</p>
            </div>
            <div className="text-center w-1/3">
                <p className="font-bold mb-16">تأشيرة المقتصد</p>
                <p>....................................</p>
            </div>
            <div className="text-center w-1/3">
                <p className="font-bold mb-16">تأشيرة المدير</p>
                <p>....................................</p>
            </div>
        </div>

      </div>
    </div>
  );
}
