
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lesson, TimetableEntry, Resource, ResourceFolder, DailyLogEntry, LabRequest, AppNotification, CurriculumStandard, Assessment, AnnualPlan, Student, MarkEntry, CurriculumReport, AuditLogEntry, LabItem } from '../types';
import { 
    DEFAULT_LESSONS, 
    DEFAULT_TIMETABLE, 
    DEFAULT_RESOURCES, 
    DEFAULT_DAILY_LOGS, 
    DEFAULT_LAB_REQUESTS, 
    DEFAULT_NOTIFICATIONS, 
    DEFAULT_ASSESSMENTS,
    ALGERIAN_CURRICULUM,
    DEFAULT_STUDENTS,
    DEFAULT_LAB_INVENTORY
} from '../constants';

// Helper to load from storage or return default
const loadFromStorage = <T,>(key: string, defaultVal: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
  }
  return defaultVal;
};

interface DataContextType {
  lessons: Lesson[];
  updateLessons: (newLessons: Lesson[]) => void;
  timetable: TimetableEntry[];
  updateTimetable: (newTimetable: TimetableEntry[]) => void;
  resources: Resource[];
  updateResources: (newResources: Resource[]) => void;
  folders: ResourceFolder[]; // Added
  updateFolders: (newFolders: ResourceFolder[]) => void; // Added
  dailyLogs: DailyLogEntry[];
  updateDailyLogs: (newLogs: DailyLogEntry[]) => void;
  labRequests: LabRequest[];
  updateLabRequests: (newRequests: LabRequest[]) => void;
  labInventory: LabItem[];
  updateLabInventory: (newInventory: LabItem[]) => void;
  notifications: AppNotification[];
  updateNotifications: (newNotifications: AppNotification[]) => void;
  curriculumItems: CurriculumStandard[];
  updateCurriculumItems: (newItems: CurriculumStandard[]) => void;
  assessments: Assessment[];
  updateAssessments: (newAssessments: Assessment[]) => void;
  annualPlans: AnnualPlan[];
  updateAnnualPlans: (newPlans: AnnualPlan[]) => void;
  students: Student[];
  updateStudents: (newStudents: Student[]) => void;
  marks: MarkEntry[];
  updateMarks: (newMarks: MarkEntry[]) => void;
  curriculumReports: CurriculumReport[];
  addCurriculumReport: (report: CurriculumReport) => void;
  updateCurriculumReports: (reports: CurriculumReport[]) => void;
  auditLogs: AuditLogEntry[];
  addAuditLog: (log: AuditLogEntry) => void;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children?: ReactNode }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [folders, setFolders] = useState<ResourceFolder[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLogEntry[]>([]);
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [labInventory, setLabInventory] = useState<LabItem[]>([]); // New
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [curriculumItems, setCurriculumItems] = useState<CurriculumStandard[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [annualPlans, setAnnualPlans] = useState<AnnualPlan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [curriculumReports, setCurriculumReports] = useState<CurriculumReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLessons(loadFromStorage('minaedu_lessons', DEFAULT_LESSONS));
    setTimetable(loadFromStorage('minaedu_timetable', DEFAULT_TIMETABLE));
    
    const rawResources = loadFromStorage<any[]>('minaedu_resources', DEFAULT_RESOURCES);
    const migratedResources: Resource[] = rawResources.map(r => ({
        ...r,
        links: r.links || { subject: r.subject, level: r.level, unit: r.unit, stream: r.stream },
        folderId: r.folderId || null,
        usageCount: r.usageCount || 0
    }));
    setResources(migratedResources);

    setFolders(loadFromStorage('minaedu_folders', []));
    setDailyLogs(loadFromStorage('minaedu_daily_logs', DEFAULT_DAILY_LOGS));
    setLabRequests(loadFromStorage('minaedu_lab_requests', DEFAULT_LAB_REQUESTS));
    setLabInventory(loadFromStorage('minaedu_lab_inventory', DEFAULT_LAB_INVENTORY)); // New
    setNotifications(loadFromStorage('minaedu_notifications', DEFAULT_NOTIFICATIONS));
    setAssessments(loadFromStorage('minaedu_assessments', DEFAULT_ASSESSMENTS));
    setAnnualPlans(loadFromStorage('minaedu_annual_plans', []));
    setStudents(loadFromStorage('minaedu_students', DEFAULT_STUDENTS));
    setMarks(loadFromStorage('minaedu_marks', []));
    setCurriculumReports(loadFromStorage('minaedu_reports', []));
    setAuditLogs(loadFromStorage('minaedu_audit_logs', []));
    
    const initialCurriculum = loadFromStorage('minaedu_curriculum', ALGERIAN_CURRICULUM);
    const migratedCurriculum = initialCurriculum.map((item: any) => ({...item, subject: item.subject || 'معلوماتية'}));
    setCurriculumItems(migratedCurriculum);

    setLoading(false);
  }, []);

  const updateAndSave = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, key: string) => (newData: T[]) => {
    setter(newData);
    localStorage.setItem(key, JSON.stringify(newData));
  };

  const addCurriculumReport = (report: CurriculumReport) => {
      const updated = [report, ...curriculumReports];
      setCurriculumReports(updated);
      localStorage.setItem('minaedu_reports', JSON.stringify(updated));
  };

  const addAuditLog = (log: AuditLogEntry) => {
      const updated = [log, ...auditLogs];
      setAuditLogs(updated);
      localStorage.setItem('minaedu_audit_logs', JSON.stringify(updated));
  };

  const value = {
    lessons,
    updateLessons: updateAndSave(setLessons, 'minaedu_lessons'),
    timetable,
    updateTimetable: updateAndSave(setTimetable, 'minaedu_timetable'),
    resources,
    updateResources: updateAndSave(setResources, 'minaedu_resources'),
    folders,
    updateFolders: updateAndSave(setFolders, 'minaedu_folders'),
    dailyLogs,
    updateDailyLogs: updateAndSave(setDailyLogs, 'minaedu_daily_logs'),
    labRequests,
    updateLabRequests: updateAndSave(setLabRequests, 'minaedu_lab_requests'),
    labInventory,
    updateLabInventory: updateAndSave(setLabInventory, 'minaedu_lab_inventory'),
    notifications,
    updateNotifications: updateAndSave(setNotifications, 'minaedu_notifications'),
    curriculumItems,
    updateCurriculumItems: updateAndSave(setCurriculumItems, 'minaedu_curriculum'),
    assessments,
    updateAssessments: updateAndSave(setAssessments, 'minaedu_assessments'),
    annualPlans,
    updateAnnualPlans: updateAndSave(setAnnualPlans, 'minaedu_annual_plans'),
    students,
    updateStudents: updateAndSave(setStudents, 'minaedu_students'),
    marks,
    updateMarks: updateAndSave(setMarks, 'minaedu_marks'),
    curriculumReports,
    addCurriculumReport,
    updateCurriculumReports: updateAndSave(setCurriculumReports, 'minaedu_reports'),
    auditLogs,
    addAuditLog,
    loading,
  };

  return (
    <DataContext.Provider value={value}>
      {!loading && children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
