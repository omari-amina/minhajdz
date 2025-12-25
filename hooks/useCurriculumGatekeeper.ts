
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { CurriculumStandard, UserRole, CurriculumReport } from '../types';

/**
 * Security Middleware Hook
 * Enforces Admin access for write operations on Curriculum & Reports.
 * Logs all successful operations to Audit Log with Snapshots.
 */
export const useCurriculumGatekeeper = () => {
  const { user } = useUser();
  const { 
    curriculumItems, 
    updateCurriculumItems, 
    addAuditLog, 
    curriculumReports, 
    updateCurriculumReports 
  } = useData();

  // Helper to verify Admin privileges
  const _enforceAdmin = (action: string) => {
    if (!user || user.role !== UserRole.ADMIN) {
      console.warn(`ACCESS DENIED: User ${user?.id} attempted ${action}`);
      throw new Error("عذراً، هذا الإجراء متاح لمدير المنهاج (Admin) فقط.");
    }
  };

  // POST: Create new item
  const createItem = (item: CurriculumStandard) => {
    _enforceAdmin('CREATE_CURRICULUM');
    
    // Logic
    const newItem = { ...item, id: item.id || `curr_${Date.now()}` };
    const updatedList = [...curriculumItems, newItem];
    updateCurriculumItems(updatedList);
    
    // Audit Log
    addAuditLog({
      id: `log_${Date.now()}`,
      userId: user!.id,
      userName: user!.name,
      action: 'CREATE',
      entityType: 'CURRICULUM',
      entityId: newItem.id,
      details: `إضافة درس جديد: ${newItem.lessonTitle}`,
      timestamp: new Date().toISOString(),
      snapshot: {
        after: newItem
      }
    });
  };

  // PUT: Update existing item
  const updateItem = (id: string, updates: Partial<CurriculumStandard>) => {
    _enforceAdmin('UPDATE_CURRICULUM');

    const originalItem = curriculumItems.find(i => i.id === id);
    if (!originalItem) throw new Error("Item not found");

    const newItem = { ...originalItem, ...updates };
    const updatedList = curriculumItems.map(item => item.id === id ? newItem : item);
    updateCurriculumItems(updatedList);

    // Audit Log with Before/After Snapshot
    addAuditLog({
      id: `log_${Date.now()}`,
      userId: user!.id,
      userName: user!.name,
      action: 'UPDATE',
      entityType: 'CURRICULUM',
      entityId: id,
      details: `تعديل درس: ${updates.lessonTitle || originalItem.lessonTitle}`,
      timestamp: new Date().toISOString(),
      snapshot: {
        before: JSON.parse(JSON.stringify(originalItem)), // Deep copy
        after: JSON.parse(JSON.stringify(newItem))
      }
    });
  };

  // DELETE: Remove item
  const deleteItem = (id: string) => {
    _enforceAdmin('DELETE_CURRICULUM');

    const targetItem = curriculumItems.find(i => i.id === id);
    const updatedList = curriculumItems.filter(item => item.id !== id);
    updateCurriculumItems(updatedList);

    addAuditLog({
      id: `log_${Date.now()}`,
      userId: user!.id,
      userName: user!.name,
      action: 'DELETE',
      entityType: 'CURRICULUM',
      entityId: id,
      details: `حذف درس: ${targetItem?.lessonTitle || id}`,
      timestamp: new Date().toISOString(),
      snapshot: {
        before: targetItem
      }
    });
  };

  // IMPORT: Batch operation
  const importBatch = (items: CurriculumStandard[]) => {
    _enforceAdmin('IMPORT_CURRICULUM');
    updateCurriculumItems(items);
    addAuditLog({
      id: `log_${Date.now()}`,
      userId: user!.id,
      userName: user!.name,
      action: 'IMPORT',
      entityType: 'CURRICULUM',
      entityId: 'BATCH',
      details: `استيراد دفعة بيانات (${items.length} عنصر)`,
      timestamp: new Date().toISOString()
    });
  };

  // RESOLVE REPORT: Admin Action
  const resolveReport = (reportId: string) => {
    _enforceAdmin('RESOLVE_REPORT');

    const targetReport = curriculumReports.find(r => r.id === reportId);
    if (!targetReport) return;

    const updatedReports = curriculumReports.map(r => 
        r.id === reportId ? { ...r, status: 'RESOLVED' } as CurriculumReport : r
    );
    updateCurriculumReports(updatedReports);

    addAuditLog({
        id: `log_${Date.now()}`,
        userId: user!.id,
        userName: user!.name,
        action: 'RESOLVE_REPORT',
        entityType: 'CURRICULUM',
        entityId: reportId,
        details: `معالجة تبليغ من ${targetReport.reporterName}: ${targetReport.description.substring(0, 30)}...`,
        timestamp: new Date().toISOString()
    });
  };

  return { createItem, updateItem, deleteItem, importBatch, resolveReport };
};
