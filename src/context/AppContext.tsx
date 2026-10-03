import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  TeacherProfile,
  Package,
  Subscription,
  SessionRecord,
  BankAccount,
  NotificationItem
} from '../types';
import {
  INITIAL_ADMIN,
  INITIAL_TEACHERS,
  INITIAL_PACKAGES,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_STUDENTS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_SESSIONS,
  INITIAL_NOTIFICATIONS
} from '../data/initialState';

import { Language, translations } from '../locales/translations';

export interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'urgent' | 'high';
  createdAt: string;
  targetRole: 'all' | 'teachers' | 'students';
  active: boolean;
}

export interface BackupSnapshot {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  type: 'auto' | 'manual';
  recordCount: number;
}

interface AppContextType {
  currentUser: User;
  activeRole: UserRole;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.ar;
  teachers: TeacherProfile[];
  packages: Package[];
  bankAccounts: BankAccount[];
  students: User[];
  subscriptions: Subscription[];
  sessions: SessionRecord[];
  notifications: NotificationItem[];
  broadcasts: BroadcastMessage[];
  backups: BackupSnapshot[];
  
  // Notification & Broadcast Actions
  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  sendBroadcast: (broadcast: Omit<BroadcastMessage, 'id' | 'createdAt' | 'active'>) => void;
  dismissBroadcast: (id: string) => void;
  
  // Actions
  switchRole: (role: UserRole, targetId?: string) => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
  
  // Teacher Management
  submitTeacherApplication: (data: {
    name: string;
    email: string;
    phone: string;
    qualifications: TeacherProfile['qualifications'];
    availableDays: string[];
    availableTimes: string;
    avatar?: string;
  }) => string;
  approveTeacher: (teacherId: string, hourlyRate?: number) => void;
  rejectTeacher: (teacherId: string, reason: string) => void;
  
  // Package Management
  addPackage: (pkg: Omit<Package, 'id'>) => void;
  updatePackage: (pkg: Package) => void;
  deletePackage: (id: string) => void;
  
  // Bank Account Management
  updateBankAccounts: (accounts: BankAccount[]) => void;
  
  // Student & Subscription Management
  registerStudent: (name: string, email: string, phone: string) => User;
  subscribeToPackage: (data: {
    studentId: string;
    studentName: string;
    studentPhone: string;
    teacherId: string;
    packageId: string;
    receiptUrl: string;
  }) => Subscription;
  approveSubscription: (subscriptionId: string) => void;
  rejectSubscription: (subscriptionId: string, reason: string) => void;
  addSessionsToSubscription: (subscriptionId: string, extraCount: number) => void;
  
  // Session Recording
  recordSession: (data: Omit<SessionRecord, 'id'>) => void;
  
  // Backup & Restore
  exportData: () => void;
  importData: (jsonString: string) => boolean;
  resetToDefaults: () => void;
  createCloudBackupSnapshot: (type?: 'manual' | 'auto') => BackupSnapshot;
  restoreFromSnapshot: (snapshotId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'etqan_quran_academy_v4';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial or stored state
  const [activeRole, setActiveRole] = useState<UserRole>('admin');
  const [language, setLanguageState] = useState<Language>('ar');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_ADMIN);

  const t = translations[language] || translations.ar;

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('etqan_language', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  };

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('etqan_language') as Language;
      if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
        setLanguageState(savedLang);
        document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = savedLang;
      } else {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      }
    } catch {}
  }, []);
  const [teachers, setTeachers] = useState<TeacherProfile[]>(INITIAL_TEACHERS);
  const [packages, setPackages] = useState<Package[]>(INITIAL_PACKAGES);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [students, setStudents] = useState<User[]>(INITIAL_STUDENTS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [sessions, setSessions] = useState<SessionRecord[]>(INITIAL_SESSIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([
    {
      id: 'bcast_1',
      title: 'تنبيه عاجل: تعديل مواعيد حلقات المغرب والتحفيظ الصباحي',
      content: 'تود إدارة الأكاديمية إحاطتكم بحلول جدول الاختبارات النصفية للطلاب بدءاً من الأحد القادم. يُرجى مراجعة الجدول.',
      priority: 'urgent',
      createdAt: 'اليوم، 10:00 ص',
      targetRole: 'all',
      active: true,
    },
  ]);
  const [backups, setBackups] = useState<BackupSnapshot[]>([
    {
      id: 'snap_1',
      name: 'النسخة الاحتياطية الدورية - الأسبوعية',
      size: '2.4 MB',
      createdAt: '2026-10-01 02:00',
      type: 'auto',
      recordCount: 142,
    },
    {
      id: 'snap_2',
      name: 'نسخة احتياطية قبل تعديل الباقات',
      size: '1.9 MB',
      createdAt: '2026-09-25 14:30',
      type: 'manual',
      recordCount: 128,
    },
  ]);

  // Initialize from LocalStorage or Fresh Clean Defaults
  useEffect(() => {
    try {
      // Purge old cached states from previous versions
      localStorage.removeItem('etqan_quran_academy_v1');
      localStorage.removeItem('etqan_quran_academy_v2');
      localStorage.removeItem('etqan_quran_academy_v3');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate if saved data contains old numbers
        const rawString = JSON.stringify(parsed);
        if (rawString.includes('1234567') || rawString.includes('501234') || rawString.includes('unsplash')) {
          localStorage.removeItem(STORAGE_KEY);
          setTeachers(INITIAL_TEACHERS);
          setPackages(INITIAL_PACKAGES);
          setBankAccounts(INITIAL_BANK_ACCOUNTS);
          setStudents(INITIAL_STUDENTS);
          setSubscriptions(INITIAL_SUBSCRIPTIONS);
          setSessions(INITIAL_SESSIONS);
          setNotifications(INITIAL_NOTIFICATIONS);
          return;
        }

        if (parsed.teachers) setTeachers(parsed.teachers);
        if (parsed.packages) setPackages(parsed.packages);
        if (parsed.bankAccounts) setBankAccounts(parsed.bankAccounts);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.subscriptions) setSubscriptions(parsed.subscriptions);
        if (parsed.sessions) setSessions(parsed.sessions);
        if (parsed.notifications) setNotifications(parsed.notifications);
      } else {
        setTeachers(INITIAL_TEACHERS);
        setPackages(INITIAL_PACKAGES);
        setBankAccounts(INITIAL_BANK_ACCOUNTS);
        setStudents(INITIAL_STUDENTS);
        setSubscriptions(INITIAL_SUBSCRIPTIONS);
        setSessions(INITIAL_SESSIONS);
        setNotifications(INITIAL_NOTIFICATIONS);
      }
    } catch (err) {
      console.error('Failed to load local storage state:', err);
    }
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      const stateToSave = {
        teachers,
        packages,
        bankAccounts,
        students,
        subscriptions,
        sessions,
        notifications,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.error('Failed to save to local storage:', err);
    }
  }, [teachers, packages, bankAccounts, students, subscriptions, sessions, notifications]);

  // Notification Helper Actions
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}`,
      createdAt: 'الآن',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Switch role helper
  const switchRole = (role: UserRole, targetId?: string) => {
    setActiveRole(role);
    if (role === 'admin') {
      setCurrentUser(INITIAL_ADMIN);
    } else if (role === 'teacher') {
      const teacher = teachers.find((t) => t.id === targetId) || teachers[0];
      if (teacher) {
        setCurrentUser({
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone,
          role: 'teacher',
          avatar: teacher.avatar,
          createdAt: teacher.createdAt,
        });
      }
    } else if (role === 'student') {
      const student = students.find((s) => s.id === targetId) || students[0];
      if (student) {
        setCurrentUser(student);
      }
    }
  };

  // Submit Teacher Join Application
  const submitTeacherApplication = (data: {
    name: string;
    email: string;
    phone: string;
    qualifications: TeacherProfile['qualifications'];
    availableDays: string[];
    availableTimes: string;
    avatar?: string;
  }): string => {
    const newId = `teacher_${Date.now()}`;
    const newTeacher: TeacherProfile = {
      id: newId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'teacher',
      status: 'pending',
      avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      createdAt: new Date().toISOString().split('T')[0],
      qualifications: data.qualifications,
      hourlyRate: 100,
      availableDays: data.availableDays,
      availableTimes: data.availableTimes,
      rating: 5.0,
      studentCount: 0,
    };

    setTeachers((prev) => [newTeacher, ...prev]);

    // Send notification to Admin
    addNotification({
      recipientRole: 'admin',
      title: 'طلب انضمام معلمة جديد',
      message: `قدمت الأستاذة (${data.name}) طلب انضمام جديد للكادر التعليمي وبانتظار المراجعة والتدقيق.`,
      type: 'warning',
      linkTab: 'workspace',
    });

    return newId;
  };

  // Approve Teacher by Admin
  const approveTeacher = (teacherId: string, hourlyRate?: number) => {
    const target = teachers.find((t) => t.id === teacherId);
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === teacherId
          ? {
              ...t,
              status: 'approved',
              hourlyRate: hourlyRate || t.hourlyRate || 100,
              rejectionReason: undefined,
            }
          : t
      )
    );

    if (target) {
      addNotification({
        recipientRole: 'teacher',
        recipientId: target.id,
        title: 'اعتماد حساب المعلمة',
        message: `مرحباً بكِ أستاذة (${target.name})! تمت الموافقة على طلب انضمامكِ لأكاديمية إتقان، ويمكنكِ الآن البدء بتدريس الطلاب وتسجيل التقييمات.`,
        type: 'success',
        linkTab: 'workspace',
      });
    }
  };

  // Reject Teacher by Admin
  const rejectTeacher = (teacherId: string, reason: string) => {
    const target = teachers.find((t) => t.id === teacherId);
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === teacherId
          ? {
              ...t,
              status: 'rejected',
              rejectionReason: reason,
            }
          : t
      )
    );

    if (target) {
      addNotification({
        recipientRole: 'teacher',
        recipientId: target.id,
        title: 'تحديث حالة طلب الانضمام',
        message: `تمت مراجعة طلب الانضمام. السبب: ${reason}`,
        type: 'warning',
        linkTab: 'workspace',
      });
    }
  };

  // Package Management
  const addPackage = (pkg: Omit<Package, 'id'>) => {
    const newPkg: Package = {
      ...pkg,
      id: `pkg_${Date.now()}`,
    };
    setPackages((prev) => [...prev, newPkg]);
  };

  const updatePackage = (updatedPkg: Package) => {
    setPackages((prev) => prev.map((p) => (p.id === updatedPkg.id ? updatedPkg : p)));
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const updateBankAccounts = (accounts: BankAccount[]) => {
    setBankAccounts(accounts);
  };

  // Register Student
  const registerStudent = (name: string, email: string, phone: string): User => {
    const existing = students.find((s) => s.email === email || s.phone === phone);
    if (existing) return existing;

    const newStudent: User = {
      id: `std_${Date.now()}`,
      name,
      email,
      phone,
      role: 'student',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setStudents((prev) => [...prev, newStudent]);
    return newStudent;
  };

  // Student Subscribes to Package with Bank Transfer Receipt
  const subscribeToPackage = (data: {
    studentId: string;
    studentName: string;
    studentPhone: string;
    teacherId: string;
    packageId: string;
    receiptUrl: string;
  }): Subscription => {
    const pkg = packages.find((p) => p.id === data.packageId) || packages[0];
    const teacher = teachers.find((t) => t.id === data.teacherId) || teachers[0];

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      studentId: data.studentId,
      studentName: data.studentName,
      studentPhone: data.studentPhone,
      teacherId: teacher.id,
      teacherName: teacher.name,
      packageId: pkg.id,
      packageName: pkg.name,
      totalSessions: pkg.sessionCount,
      usedSessions: 0,
      remainingSessions: pkg.sessionCount,
      amountPaid: pkg.price,
      currency: pkg.currency,
      paymentReceiptUrl: data.receiptUrl,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setSubscriptions((prev) => [newSub, ...prev]);

    // Send notification to Admin
    addNotification({
      recipientRole: 'admin',
      title: 'إيصال تحويل بنكي جديد',
      message: `قام الطالب (${data.studentName}) برفع إيصال تحويل بنكي لباقة (${pkg.name}) وبانتظار الفحص والاعتماد.`,
      type: 'warning',
      linkTab: 'workspace',
    });

    return newSub;
  };

  // Admin approves subscription bank transfer
  const approveSubscription = (subscriptionId: string) => {
    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(now.getMonth() + 2); // Valid for 2 months

    const subTarget = subscriptions.find((s) => s.id === subscriptionId);

    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === subscriptionId) {
          // Increment teacher student count
          setTeachers((tList) =>
            tList.map((t) =>
              t.id === sub.teacherId ? { ...t, studentCount: t.studentCount + 1 } : t
            )
          );

          return {
            ...sub,
            paymentStatus: 'approved',
            startDate: now.toISOString().split('T')[0],
            expiryDate: expiry.toISOString().split('T')[0],
            rejectionReason: undefined,
          };
        }
        return sub;
      })
    );

    if (subTarget) {
      addNotification({
        recipientRole: 'student',
        recipientId: subTarget.studentId,
        title: 'تأكيد تفعيل الباقة',
        message: `تمت مراجعة التحويل وتفعيل (${subTarget.packageName}) بنجاح! يمكنك الآن الالتحاق بحلقة المعلمة (${subTarget.teacherName}).`,
        type: 'success',
        linkTab: 'workspace',
      });
    }
  };

  // Admin rejects subscription receipt
  const rejectSubscription = (subscriptionId: string, reason: string) => {
    const subTarget = subscriptions.find((s) => s.id === subscriptionId);

    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === subscriptionId) {
          return {
            ...sub,
            paymentStatus: 'rejected',
            rejectionReason: reason,
          };
        }
        return sub;
      })
    );

    if (subTarget) {
      addNotification({
        recipientRole: 'student',
        recipientId: subTarget.studentId,
        title: 'تحديث حالة التحويل البنكي',
        message: `لم يتم اعتماد الإيصال. السبب: ${reason}`,
        type: 'warning',
        linkTab: 'workspace',
      });
    }
  };

  // Add bonus or manual sessions
  const addSessionsToSubscription = (subscriptionId: string, extraCount: number) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === subscriptionId
          ? {
              ...sub,
              totalSessions: sub.totalSessions + extraCount,
              remainingSessions: sub.remainingSessions + extraCount,
            }
          : sub
      )
    );
  };

  // Teacher Records a completed class (deducts 1 session from student remaining quota)
  const recordSession = (data: Omit<SessionRecord, 'id'>) => {
    const newSession: SessionRecord = {
      ...data,
      id: `ses_${Date.now()}`,
    };

    setSessions((prev) => [newSession, ...prev]);

    // Update Subscription remaining and used sessions
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === data.subscriptionId) {
          const newUsed = sub.usedSessions + 1;
          const newRemaining = Math.max(0, sub.totalSessions - newUsed);

          // Send notification to student
          addNotification({
            recipientRole: 'student',
            recipientId: sub.studentId,
            title: 'تقييم جديد وحصة منجزة',
            message: `قامت المعلمة (${data.teacherName}) بتسجيل تقييم (${data.rating} نجوم) لحصة اليوم (${data.surahName}). المتبقي من رصيدك: ${newRemaining} حصة.`,
            type: 'info',
            linkTab: 'workspace',
          });

          return {
            ...sub,
            usedSessions: newUsed,
            remainingSessions: newRemaining,
          };
        }
        return sub;
      })
    );
  };

  // Backup & Restore
  const exportData = () => {
    const backupData = {
      teachers,
      packages,
      bankAccounts,
      students,
      subscriptions,
      sessions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Etqan_Quran_Academy_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.teachers && Array.isArray(parsed.teachers)) setTeachers(parsed.teachers);
      if (parsed.packages && Array.isArray(parsed.packages)) setPackages(parsed.packages);
      if (parsed.bankAccounts && Array.isArray(parsed.bankAccounts)) setBankAccounts(parsed.bankAccounts);
      if (parsed.students && Array.isArray(parsed.students)) setStudents(parsed.students);
      if (parsed.subscriptions && Array.isArray(parsed.subscriptions)) setSubscriptions(parsed.subscriptions);
      if (parsed.sessions && Array.isArray(parsed.sessions)) setSessions(parsed.sessions);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  const sendBroadcast = (broadcast: Omit<BroadcastMessage, 'id' | 'createdAt' | 'active'>) => {
    const newBcast: BroadcastMessage = {
      ...broadcast,
      id: `bcast_${Date.now()}`,
      createdAt: 'الآن',
      active: true,
    };
    setBroadcasts((prev) => [newBcast, ...prev]);

    // Also send standard notification to all target recipients
    addNotification({
      recipientRole: broadcast.targetRole === 'all' ? undefined : (broadcast.targetRole as any),
      title: `📣 إعلان عاجل: ${broadcast.title}`,
      message: broadcast.content,
      type: broadcast.priority === 'urgent' ? 'warning' : 'info',
      linkTab: 'workspace',
    });
  };

  const dismissBroadcast = (id: string) => {
    setBroadcasts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: false } : b))
    );
  };

  const createCloudBackupSnapshot = (type: 'manual' | 'auto' = 'manual'): BackupSnapshot => {
    const totalRecords =
      teachers.length + students.length + subscriptions.length + sessions.length;
    const newSnap: BackupSnapshot = {
      id: `snap_${Date.now()}`,
      name: type === 'manual' ? `نسخة احتياطية يدوية - ${new Date().toLocaleDateString('ar-SA')}` : `نسخة سحابية تلقائية`,
      size: `${(totalRecords * 0.02 + 1.2).toFixed(1)} MB`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type,
      recordCount: totalRecords,
    };

    setBackups((prev) => [newSnap, ...prev]);
    return newSnap;
  };

  const restoreFromSnapshot = (snapshotId: string): boolean => {
    const target = backups.find((b) => b.id === snapshotId);
    if (!target) return false;

    // Simulate restore confirmation & state refresh
    addNotification({
      recipientRole: 'admin',
      title: 'تمت استعادة البيانات السحابية',
      message: `تمت استعادة قواعد البيانات بنجاح من النسخة الاحتياطية (${target.name}) المؤرخة في ${target.createdAt}.`,
      type: 'success',
      linkTab: 'workspace',
    });

    return true;
  };

  const resetToDefaults = () => {
    setTeachers(INITIAL_TEACHERS);
    setPackages(INITIAL_PACKAGES);
    setBankAccounts(INITIAL_BANK_ACCOUNTS);
    setStudents(INITIAL_STUDENTS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setSessions(INITIAL_SESSIONS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        language,
        setLanguage,
        t,
        teachers,
        packages,
        bankAccounts,
        students,
        subscriptions,
        sessions,
        notifications,
        broadcasts,
        backups,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        sendBroadcast,
        dismissBroadcast,
        switchRole,
        setCurrentUser,
        submitTeacherApplication,
        approveTeacher,
        rejectTeacher,
        addPackage,
        updatePackage,
        deletePackage,
        updateBankAccounts,
        registerStudent,
        subscribeToPackage,
        approveSubscription,
        rejectSubscription,
        addSessionsToSubscription,
        recordSession,
        exportData,
        importData,
        resetToDefaults,
        createCloudBackupSnapshot,
        restoreFromSnapshot,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
