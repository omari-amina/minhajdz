
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserContextType, UserRole, EducationStage, ContextState, SubjectFeatures } from '../types';
import { getInitialUser, DEMO_USER, DEMO_ADMIN, SUBJECT_FEATURES, DEFAULT_SUBJECT_FEATURES } from '../constants';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // UI Context State (Active Subject/Stage)
  const [currentContext, setCurrentContext] = useState<ContextState>({
      subject: '',
      stage: 'HIGH',
      features: DEFAULT_SUBJECT_FEATURES
  });

  useEffect(() => {
    // Check local storage for session
    const saved = getInitialUser();
    if (saved) {
      setUser(saved);
      // Initialize context logic:
      // If user has subjects, default to the first one.
      const initialSubject = saved.subjects.length > 0 ? saved.subjects[0] : 'معلوماتية';
      
      setCurrentContext({
          subject: initialSubject,
          stage: 'HIGH',
          features: SUBJECT_FEATURES[initialSubject] || DEFAULT_SUBJECT_FEATURES
      });
    }
    setLoading(false);
  }, []);

  const switchContext = (subject: string, stage?: EducationStage) => {
      // Stage is always HIGH now
      setCurrentContext({
          subject,
          stage: 'HIGH',
          features: SUBJECT_FEATURES[subject] || DEFAULT_SUBJECT_FEATURES
      });
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
    // If current subject is removed or invalid, reset context to first available
    if (newUser.subjects.length > 0 && !newUser.subjects.includes(currentContext.subject)) {
        const newSubject = newUser.subjects[0];
        switchContext(newSubject, newUser.educationStage);
    } 

    try {
        localStorage.setItem('minaedu_user', JSON.stringify(newUser));
    } catch (e) {
        console.error("Failed to save user to storage", e);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      // Simulate API Call delay
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Teacher Demo Login
      if (email === 'demo@minaedu.dz' || password === 'demo') {
          const u = DEMO_USER;
          updateUser(u);
          switchContext(u.subjects[0], u.educationStage);
          setLoading(false);
          return { success: true };
      }

      // Admin Demo Login
      if (email === 'admin@minaedu.dz' || password === 'admin') {
          const u = DEMO_ADMIN;
          updateUser(u);
          switchContext(u.subjects[0], u.educationStage);
          setLoading(false);
          return { success: true };
      }

      // Check local storage for existing user (Mock backend behavior)
      const storedUserStr = localStorage.getItem('minaedu_user');
      if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr);
          if (storedUser.email === email) {
               updateUser(storedUser);
               switchContext(storedUser.subjects[0] || '', storedUser.educationStage);
               setLoading(false);
               return { success: true };
          }
      }

      if (password === 'password' || password.length > 5) {
          const mockUser: User = {
              ...DEMO_USER,
              id: `u_${Date.now()}`,
              email,
              name: email.split('@')[0],
          };
          updateUser(mockUser);
          switchContext(mockUser.subjects[0], mockUser.educationStage);
          setLoading(false);
          return { success: true };
      }

      setLoading(false);
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
  };

  const signup = async (userData: Partial<User>, password: string): Promise<{ success: boolean; error?: string }> => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newUser: User = {
          ...DEMO_USER, // Fallback for missing fields
          ...userData,
          id: `u_${Date.now()}`,
          role: userData.role || UserRole.TEACHER,
          educationStage: 'HIGH', // Force HIGH
          subjects: userData.subjects || ['معلوماتية'],
          levels: userData.levels || ['1AS']
      } as User;

      updateUser(newUser);
      // Initialize context with first selected subject
      if (newUser.subjects.length > 0) {
          switchContext(newUser.subjects[0], newUser.educationStage);
      }
      
      setLoading(false);
      return { success: true };
  };

  const logout = () => {
      setUser(null);
      localStorage.removeItem('minaedu_user');
  };
  
  const value = { 
      user, 
      updateUser, 
      loading, 
      login, 
      signup, 
      logout,
      isAuthenticated: !!user,
      currentContext,
      switchContext
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
