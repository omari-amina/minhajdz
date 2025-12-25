
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserProvider, useUser } from '../context/UserContext';
import { DataProvider, useData } from '../context/DataContext';
import { useCurriculumGatekeeper } from '../hooks/useCurriculumGatekeeper';
import { UserRole, CurriculumStandard, User } from '../types';

// --- MOCK DATA ---
const MOCK_TEACHER: User = {
  id: 'teacher_1',
  name: 'Teacher Test',
  email: 'teacher@test.com',
  role: UserRole.TEACHER,
  schoolName: 'Test School',
  academicYear: '2023/2024',
  educationStage: 'HIGH',
  subjects: ['Math'],
  levels: ['1AS'],
  assignedClassIds: []
};

const MOCK_ADMIN: User = {
  id: 'admin_1',
  name: 'Admin Test',
  email: 'admin@test.com',
  role: UserRole.ADMIN,
  schoolName: 'Directorate',
  academicYear: '2023/2024',
  educationStage: 'HIGH',
  subjects: ['Math'],
  levels: ['1AS'],
  assignedClassIds: []
};

const NEW_ITEM: CurriculumStandard = {
  id: 'new_item_1',
  subject: 'Math',
  level: '1AS',
  domain: 'Algebra',
  unit: 'Equations',
  lessonTitle: 'Linear Equations',
  targetCompetencies: ['Solve equations'],
  suggestedDuration: 2,
  cycle: 'secondary'
};

// Wrapper for Contexts
const ContextWrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProvider>
    <DataProvider>
      {children}
    </DataProvider>
  </UserProvider>
);

describe('Curriculum Security & RBAC System', () => {
  
  // Setup Hook Helper
  const setup = () => renderHook(() => {
    const userCtx = useUser();
    const dataCtx = useData();
    const gatekeeper = useCurriculumGatekeeper();
    return { ...userCtx, ...dataCtx, gatekeeper };
  }, { wrapper: ContextWrapper });

  it('1) Teacher can GET curriculum (Read Access)', async () => {
    const { result } = setup();

    // Login as Teacher
    await act(async () => {
      result.current.updateUser(MOCK_TEACHER);
    });

    // Check Read Access
    expect(result.current.user?.role).toBe(UserRole.TEACHER);
    expect(Array.isArray(result.current.curriculumItems)).toBe(true);
    // DataProvider loads defaults, so it shouldn't be empty typically, or at least accessible
    expect(result.current.curriculumItems).toBeDefined();
  });

  it('2) Teacher cannot POST/PUT/DELETE curriculum (403)', async () => {
    const { result } = setup();

    // Login as Teacher
    await act(async () => {
      result.current.updateUser(MOCK_TEACHER);
    });

    // Attempt Create
    expect(() => {
      result.current.gatekeeper.createItem(NEW_ITEM);
    }).toThrow("المنهاج للقراءة فقط، التعديل متاح للإدارة فقط.");

    // Attempt Update
    expect(() => {
      result.current.gatekeeper.updateItem('some_id', { lessonTitle: 'Hacked' });
    }).toThrow("المنهاج للقراءة فقط، التعديل متاح للإدارة فقط.");

    // Attempt Delete
    expect(() => {
      result.current.gatekeeper.deleteItem('some_id');
    }).toThrow("المنهاج للقراءة فقط، التعديل متاح للإدارة فقط.");
  });

  it('3) Admin can CRUD (Create, Read, Update, Delete)', async () => {
    const { result } = setup();

    // Login as Admin
    await act(async () => {
      result.current.updateUser(MOCK_ADMIN);
    });

    // --- CREATE ---
    let createdId = '';
    act(() => {
      result.current.gatekeeper.createItem(NEW_ITEM);
    });
    
    // Verify creation in store
    const createdItem = result.current.curriculumItems.find(i => i.lessonTitle === 'Linear Equations');
    expect(createdItem).toBeDefined();
    createdId = createdItem!.id;

    // --- UPDATE ---
    act(() => {
      result.current.gatekeeper.updateItem(createdId, { suggestedDuration: 10 });
    });
    const updatedItem = result.current.curriculumItems.find(i => i.id === createdId);
    expect(updatedItem?.suggestedDuration).toBe(10);

    // --- DELETE ---
    act(() => {
      result.current.gatekeeper.deleteItem(createdId);
    });
    const deletedItem = result.current.curriculumItems.find(i => i.id === createdId);
    expect(deletedItem).toBeUndefined();
  });

  it('4) Reporting System: Teacher submits, Admin views', async () => {
    const { result } = setup();

    // Teacher Submits
    await act(async () => {
      result.current.updateUser(MOCK_TEACHER);
    });

    const reportPayload = {
      id: 'rep_test',
      reporterId: MOCK_TEACHER.id,
      reporterName: MOCK_TEACHER.name,
      curriculumId: 'any_id',
      type: 'ERROR' as any,
      description: 'Typo in title',
      date: new Date().toISOString(),
      status: 'PENDING' as any
    };

    act(() => {
      result.current.addCurriculumReport(reportPayload);
    });

    // Switch to Admin
    await act(async () => {
      result.current.updateUser(MOCK_ADMIN);
    });

    // Admin Views
    const reports = result.current.curriculumReports;
    const foundReport = reports.find(r => r.id === 'rep_test');
    expect(foundReport).toBeDefined();
    expect(foundReport?.description).toBe('Typo in title');
  });

  it('5) Audit Log: Admin actions are logged with Snapshots', async () => {
    const { result } = setup();

    // Login Admin
    await act(async () => {
      result.current.updateUser(MOCK_ADMIN);
    });

    // Ensure we have an item to update
    const itemToUpdate = result.current.curriculumItems[0]; 
    if (!itemToUpdate) {
        // If empty, create one first
        act(() => result.current.gatekeeper.createItem(NEW_ITEM));
    }
    const target = result.current.curriculumItems[0];
    const originalTitle = target.lessonTitle;

    // Perform Update
    act(() => {
      result.current.gatekeeper.updateItem(target.id, { lessonTitle: 'Audit Check Title' });
    });

    // Check Logs
    const logs = result.current.auditLogs;
    const latestLog = logs[0]; // Assuming prepend

    expect(latestLog).toBeDefined();
    expect(latestLog.action).toBe('UPDATE');
    expect(latestLog.userId).toBe(MOCK_ADMIN.id);
    
    // Verify Snapshot
    expect(latestLog.snapshot).toBeDefined();
    expect(latestLog.snapshot?.before.lessonTitle).toBe(originalTitle);
    expect(latestLog.snapshot?.after.lessonTitle).toBe('Audit Check Title');
  });

});
