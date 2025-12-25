
import React from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import TimetableEdit from './pages/TimetableEdit';
import CurriculumView from './pages/CurriculumView';
import Lessons from './pages/Lessons';
import LessonPlanner from './pages/LessonPlanner';
import DailyLog from './pages/DailyLog';
import Library from './pages/Library';
import LabLog from './pages/LabLog';
import PrintView from './pages/PrintView';
import TimetablePrint from './pages/TimetablePrint';
import LabPrint from './pages/LabPrint';
import ProfileSettings from './pages/ProfileSettings';
import DailyLogPrint from './pages/DailyLogPrint';
import AssessmentBuilder from './pages/AssessmentBuilder';
import AssessmentPrint from './pages/AssessmentPrint';
import AnnualPlanner from './pages/AnnualPlanner';
import AnnualPlanPrint from './pages/AnnualPlanPrint';
import AIGenerator from './pages/AIGenerator';
import UserGuide from './pages/UserGuide';
import PedagogicalGuide from './pages/PedagogicalGuide';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useUser } from './context/UserContext';

// Protected Route Component
const ProtectedRoute = () => {
  const { user } = useUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Layout><Outlet /></Layout>;
};

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes (Main App) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="timetable/edit" element={<TimetableEdit />} />
          <Route path="curriculum" element={<CurriculumView />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="lessons/new" element={<LessonPlanner />} />
          <Route path="lessons/:id/edit" element={<LessonPlanner />} />
          <Route path="daily-log" element={<DailyLog />} />
          <Route path="library" element={<Library />} />
          <Route path="lab" element={<LabLog />} />
          <Route path="settings" element={<ProfileSettings />} />
          <Route path="assessments/new" element={<AssessmentBuilder />} />
          <Route path="planning" element={<AnnualPlanner />} />
          <Route path="ai-generator" element={<AIGenerator />} />
          <Route path="guide" element={<UserGuide />} />
          <Route path="pedagogy-guide" element={<PedagogicalGuide />} />
        </Route>

        {/* Standalone Protected Routes (Print Views) */}
        <Route element={<ProtectedRoute />}>
            <Route path="lessons/:id/print" element={<PrintView />} />
            <Route path="timetable/print" element={<TimetablePrint />} />
            <Route path="lab/print" element={<LabPrint />} />
            <Route path="daily-log/print" element={<DailyLogPrint />} />
            <Route path="assessments/:id/print" element={<AssessmentPrint />} />
            <Route path="planning/print" element={<AnnualPlanPrint />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
