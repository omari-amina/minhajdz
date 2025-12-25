
import React, { useState, useMemo } from 'react';
import { FlaskConical, CheckCircle2, Clock, Plus, X, AlertTriangle, Printer, Package, Edit, Trash2, Search } from 'lucide-react';
import { LabRequest, LabItem } from '../types';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function LabLog() {
  const { labRequests, updateLabRequests, labInventory, updateLabInventory } = useData();
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'INVENTORY'>('REQUESTS');

  // Request Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', priority: 'MEDIUM' });

  // Inventory Modal
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LabItem | null>(null);
  const [itemForm, setItemForm] = useState<Partial<LabItem>>({
      name: '', category: 'DEVICE', quantity: 1, status: 'GOOD', location: '', notes: ''
  });
  const [inventorySearch, setInventorySearch] = useState('');

  // --- REQUEST LOGIC ---
  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.title.trim()) return;

    const req: LabRequest = {
      id: `req_${Date.now()}`,
      title: newRequest.title,
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      priority: newRequest.priority as any
    };

    updateLabRequests([req, ...labRequests]);
    setIsRequestModalOpen(false);
    setNewRequest({ title: '', priority: 'MEDIUM' });
  };

  const toggleStatus = (id: string) => {
    const updated = labRequests.map(r => 
      r.id === id ? { ...r, status: r.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : r
    );
    updateLabRequests(updated as LabRequest[]);
  };

  const deleteRequest = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      updateLabRequests(labRequests.filter(r => r.id !== id));
    }
  };

  // --- INVENTORY LOGIC ---
  const handleSaveItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!itemForm.name) return;

      if (editingItem) {
          const updated = labInventory.map(i => i.id === editingItem.id ? { ...i, ...itemForm } as LabItem : i);
          updateLabInventory(updated);
      } else {
          const newItem: LabItem = {
              id: `inv_${Date.now()}`,
              ...(itemForm as LabItem)
          };
          updateLabInventory([...labInventory, newItem]);
      }
      setIsInventoryModalOpen(false);
      setEditingItem(null);
      setItemForm({ name: '', category: 'DEVICE', quantity: 1, status: 'GOOD', location: '', notes: '' });
  };

  const deleteItem = (id: string) => {
      if (window.confirm('حذف هذا العنصر من الجرد؟')) {
          updateLabInventory(labInventory.filter(i => i.id !== id));
      }
  };

  const openEditItem = (item: LabItem) => {
      setEditingItem(item);
      setItemForm(item);
      setIsInventoryModalOpen(true);
  };

  const openNewItem = () => {
      setEditingItem(null);
      setItemForm({ name: '', category: 'DEVICE', quantity: 1, status: 'GOOD', location: '', notes: '' });
      setIsInventoryModalOpen(true);
  };

  const filteredInventory = useMemo(() => {
      return labInventory.filter(i => i.name.toLowerCase().includes(inventorySearch.toLowerCase()));
  }, [labInventory, inventorySearch]);

  // Quick stats for sidebar
  const stats = useMemo(() => {
      return {
          devices: labInventory.filter(i => i.category === 'DEVICE').reduce((acc, c) => acc + c.quantity, 0),
          broken: labInventory.filter(i => i.status === 'BROKEN' || i.status === 'POOR').length,
          total: labInventory.length
      };
  }, [labInventory]);

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">سجل المخبر</h1>
          <p className="text-slate-500 dark:text-slate-400">تتبع التجارب، طلبات التجهيز، وجرد العتاد.</p>
        </div>
        <div className="flex gap-2">
            <Link 
              to="/lab/print"
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Printer size={20} />
              <span className="hidden sm:inline">طباعة التقرير</span>
            </Link>
            {activeTab === 'REQUESTS' ? (
                <button 
                onClick={() => setIsRequestModalOpen(true)}
                className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
                >
                <Plus size={20} />
                <span>طلب تجهيز جديد</span>
                </button>
            ) : (
                <button 
                onClick={openNewItem}
                className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
                >
                <Plus size={20} />
                <span>إضافة عتاد</span>
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button onClick={() => setActiveTab('REQUESTS')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'REQUESTS' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                  سجل الطلبات
              </button>
              <button onClick={() => setActiveTab('INVENTORY')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'INVENTORY' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                  جرد العتاد (Inventory)
              </button>
          </div>

          {activeTab === 'REQUESTS' ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-200 min-h-[400px]">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {labRequests.map(req => (
                    <div key={req.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors group">
                    <div className="flex items-center gap-4">
                        <button 
                        onClick={() => toggleStatus(req.id)}
                        className={`p-3 rounded-full transition-colors ${
                            req.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200' 
                            : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200'
                        }`}
                        title={req.status === 'COMPLETED' ? 'تحديد كغير مكتمل' : 'تحديد كمكتمل'}
                        >
                        {req.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                        </button>
                        <div>
                        <h4 className={`font-bold ${req.status === 'COMPLETED' ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-white'}`}>
                            {req.title}
                        </h4>
                        <div className="flex gap-2 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            <span>{req.date}</span>
                            <span>•</span>
                            <span className={`
                            ${req.priority === 'HIGH' ? 'text-red-500 font-bold' : ''}
                            ${req.priority === 'MEDIUM' ? 'text-amber-600' : ''}
                            ${req.priority === 'LOW' ? 'text-blue-500' : ''}
                            `}>
                            أولوية: {req.priority === 'HIGH' ? 'عالية' : req.priority === 'MEDIUM' ? 'متوسطة' : 'منخفضة'}
                            </span>
                        </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            req.status === 'COMPLETED' ? 
                            'text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 
                            'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
                        }`}>
                            {req.status === 'COMPLETED' ? 'تم التنفيذ' : 'قيد الانتظار'}
                        </span>
                        <button 
                            onClick={() => deleteRequest(req.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
                            title="حذف"
                        >
                        <X size={16} />
                        </button>
                    </div>
                    </div>
                ))}
                {labRequests.length === 0 && (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                    <CheckCircle2 size={40} className="text-slate-200 dark:text-slate-700" />
                    <p>لا يوجد طلبات حالية</p>
                    </div>
                )}
                </div>
            </div>
          ) : (
              <div className="space-y-4">
                  <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                          type="text" 
                          placeholder="بحث في الجرد..." 
                          value={inventorySearch}
                          onChange={e => setInventorySearch(e.target.value)}
                          className="w-full pr-10 pl-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[400px]">
                      <table className="w-full text-sm text-right">
                          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b dark:border-slate-700">
                              <tr>
                                  <th className="px-4 py-3 font-medium">العتاد</th>
                                  <th className="px-4 py-3 font-medium text-center">الكمية</th>
                                  <th className="px-4 py-3 font-medium">الموقع</th>
                                  <th className="px-4 py-3 font-medium">الحالة</th>
                                  <th className="px-4 py-3 font-medium w-24"></th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                              {filteredInventory.map(item => (
                                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 group">
                                      <td className="px-4 py-3">
                                          <div className="font-bold text-slate-800 dark:text-white">{item.name}</div>
                                          <div className="text-[10px] text-slate-500">{item.category}</div>
                                      </td>
                                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">{item.quantity}</td>
                                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{item.location || '-'}</td>
                                      <td className="px-4 py-3">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                              item.status === 'GOOD' ? 'bg-green-100 text-green-700' :
                                              item.status === 'BROKEN' ? 'bg-red-100 text-red-700' :
                                              item.status === 'CONSUMED' ? 'bg-slate-100 text-slate-600 line-through' :
                                              'bg-amber-100 text-amber-700'
                                          }`}>
                                              {item.status === 'GOOD' ? 'جيد' : item.status === 'FAIR' ? 'متوسط' : item.status === 'BROKEN' ? 'معطل' : item.status === 'CONSUMED' ? 'مستهلك' : 'سيء'}
                                          </span>
                                      </td>
                                      <td className="px-4 py-3 text-left">
                                          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button onClick={() => openEditItem(item)} className="p-1 text-slate-400 hover:text-blue-500"><Edit size={14} /></button>
                                              <button onClick={() => deleteItem(item.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                              {filteredInventory.length === 0 && (
                                  <tr>
                                      <td colSpan={5} className="p-12 text-center text-slate-500 dark:text-slate-400">
                                          <div className="flex flex-col items-center justify-center">
                                              <Package size={48} className="mb-3 opacity-20" />
                                              <p className="font-bold">المخزن فارغ</p>
                                              <p className="text-xs mt-1">ابدأ عملية الجرد بإضافة العتاد المتوفر، أو انتقل لسجل الطلبات.</p>
                                              <button onClick={openNewItem} className="mt-4 text-primary-600 hover:underline text-sm font-bold">إضافة أول عنصر</button>
                                          </div>
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Live Stats Widget */}
          <div className="bg-indigo-900 text-white rounded-xl p-6 shadow-xl relative overflow-hidden">
            <FlaskConical size={120} className="absolute -bottom-4 -left-4 text-white/10 rotate-12" />
            <h3 className="font-bold text-lg mb-2 relative z-10">إحصائيات الجرد</h3>
            <div className="space-y-3 relative z-10 mt-4">
              <div className="flex justify-between items-center bg-white/10 p-2 rounded hover:bg-white/20 transition-colors cursor-pointer">
                <span>إجمالي المواد</span>
                <span className="font-mono font-bold bg-white/20 px-2 rounded">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-2 rounded hover:bg-white/20 transition-colors cursor-pointer">
                <span>الأجهزة (Devices)</span>
                <span className="font-mono font-bold bg-white/20 px-2 rounded">{stats.devices}</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-2 rounded hover:bg-white/20 transition-colors cursor-pointer">
                <span className="text-red-200">معطل / سيء</span>
                <span className="font-mono font-bold bg-white/20 px-2 rounded text-red-200">{stats.broken}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex gap-3">
             <AlertTriangle className="text-amber-600 dark:text-amber-500 flex-shrink-0" />
             <div>
               <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">تذكير الصيانة</h4>
               <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                 تأكد من مراجعة حالة الأجهزة قبل طباعة تقرير نهاية الفصل.
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white">إضافة طلب جديد</h3>
                 <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddRequest} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">عنوان الطلب / التجهيز</label>
                   <input type="text" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="مثال: شراء كابلات HDMI" value={newRequest.title} onChange={e => setNewRequest({...newRequest, title: e.target.value})} autoFocus />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الأولوية</label>
                   <div className="grid grid-cols-3 gap-2">
                     {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                       <button key={p} type="button" onClick={() => setNewRequest({...newRequest, priority: p})} className={`py-2 rounded-lg text-sm font-medium border transition-colors ${newRequest.priority === p ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                         {p === 'HIGH' ? 'عالية' : p === 'MEDIUM' ? 'متوسطة' : 'منخفضة'}
                       </button>
                     ))}
                   </div>
                 </div>
                 <button type="submit" disabled={!newRequest.title.trim()} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg mt-2">إضافة للسجل</button>
              </form>
           </div>
        </div>
      )}

      {/* Inventory Modal */}
      {isInventoryModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><Package size={20} /> {editingItem ? 'تعديل عتاد' : 'إضافة عتاد جديد'}</h3>
                      <button onClick={() => setIsInventoryModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleSaveItem} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم العتاد</label>
                              <input type="text" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} autoFocus required />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">النوع</label>
                              <select className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none" value={itemForm.category} onChange={e => setItemForm({...itemForm, category: e.target.value as any})}>
                                  <option value="DEVICE">جهاز (Device)</option>
                                  <option value="GLASSWARE">زجاجيات</option>
                                  <option value="CHEMICAL">مواد كيميائية</option>
                                  <option value="TOOL">أدوات</option>
                                  <option value="OTHER">أخرى</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الكمية</label>
                              <input type="number" min="0" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" value={itemForm.quantity} onChange={e => setItemForm({...itemForm, quantity: Number(e.target.value)})} />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الحالة</label>
                              <select className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none" value={itemForm.status} onChange={e => setItemForm({...itemForm, status: e.target.value as any})}>
                                  <option value="GOOD">جيدة</option>
                                  <option value="FAIR">متوسطة (قابلة للاستعمال)</option>
                                  <option value="POOR">سيئة</option>
                                  <option value="BROKEN">معطلة</option>
                                  <option value="CONSUMED">مستهلكة</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المكان (الرف/الخزانة)</label>
                              <input type="text" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" value={itemForm.location} onChange={e => setItemForm({...itemForm, location: e.target.value})} />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ملاحظات</label>
                          <textarea rows={2} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2.5 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" value={itemForm.notes} onChange={e => setItemForm({...itemForm, notes: e.target.value})} placeholder="أعطال، تاريخ انتهاء الصلاحية..." />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                          <button type="button" onClick={() => setIsInventoryModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">إلغاء</button>
                          <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 shadow">{editingItem ? 'حفظ التعديلات' : 'إضافة للجرد'}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
