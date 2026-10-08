import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  User,
  UserRole,
  TeacherProfile,
  Package,
  Subscription,
  SessionRecord,
  BankAccount,
  NotificationItem,
  ScheduledSession,
  LibraryItem,
  KhatmCampaign,
} from '../types';
import { AVATAR_ADMIN, AVATAR_STUDENT_1, AVATAR_TEACHER_1 } from '../data/initialState';
import { Language, translations } from '../locales/translations';
import { api, ApiError, relativeTimeAr } from '../lib/api';

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

export type AuthMode = 'login' | 'student' | 'teacher';

export interface RegisterInput {
  role: 'student' | 'teacher';
  name: string;
  phone: string;
  password: string;
  email?: string;
}

interface AppContextType {
  // ── الحساب والجلسة
  currentUser: User;
  activeRole: UserRole;
  isGuest: boolean;
  authReady: boolean;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refresh: () => Promise<void>;
  authRequest: AuthMode | null;
  requestAuth: (mode: AuthMode | null) => void;
  toast: { text: string; type: 'error' | 'success' | 'info' } | null;
  showToast: (text: string, type?: 'error' | 'success' | 'info') => void;

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
  deactivateBroadcast: (id: string) => Promise<void>;

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
  }) => Promise<string>;
  approveTeacher: (teacherId: string, hourlyRate?: number) => void;
  rejectTeacher: (teacherId: string, reason: string) => void;
  updateMyZoomLink: (link: string) => Promise<void>;
  sendDirectNotification: (data: {
    recipientIds?: string[];
    all?: boolean;
    kind: 'encouragement' | 'attendance' | 'homework';
    title: string;
    message: string;
  }) => Promise<number>;
  /** بيانات المستخدم الشخصية المحفوظة في قاعدة البيانات (تتزامن بين الأجهزة) */
  userData: Partial<Record<UserDataKey, any>>;
  scheduled: ScheduledSession[];
  library: LibraryItem[];
  khatms: KhatmCampaign[];
  scheduleSession: (d: { title: string; date: string; time: string; note?: string; studentId?: string }) => Promise<void>;
  deleteScheduled: (id: string) => Promise<void>;
  addLibraryItem: (d: { title: string; kind: LibraryItem['kind']; url: string; description?: string }) => Promise<void>;
  deleteLibraryItem: (id: string) => Promise<void>;
  createKhatm: (d: { title: string; targetDate?: string }) => Promise<void>;
  khatmAction: (id: string, action: 'claim' | 'done' | 'undone' | 'release', juz: number) => Promise<void>;
  deleteKhatm: (id: string) => Promise<void>;
  saveUserData: (key: UserDataKey, value: any) => void;

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
  }) => Promise<Subscription>;
  approveSubscription: (subscriptionId: string) => void;
  rejectSubscription: (subscriptionId: string, reason: string) => void;
  addSessionsToSubscription: (subscriptionId: string, extraCount: number) => void;

  // Session Recording
  recordSession: (data: Omit<SessionRecord, 'id'>) => Promise<void>;
  addSessionRecord: (data: Omit<SessionRecord, 'id'>) => Promise<void>;

  // Users (admin)
  resetUserPassword: (userId: string) => Promise<{ tempPassword: string; name: string; phone: string }>;
  setUserActive: (userId: string, active: boolean) => Promise<void>;

  // Backup & Restore
  exportData: () => void;
  importData: (jsonString: string) => boolean;
  resetToDefaults: () => void;
  createCloudBackupSnapshot: (type?: 'manual' | 'auto') => BackupSnapshot;
  restoreFromSnapshot: (snapshotId: string) => boolean;
}

export type UserDataKey =
  | 'weekly_goals'
  | 'quick_reviews'
  | 'ayah_notes'
  | 'archived_circles'
  | 'memorized_surahs'
  | 'memorization_days';

/** مفاتيح التخزين المحلي القديمة — تُنقل لقاعدة البيانات مرة واحدة ثم تُمسح */
const LEGACY_KEYS: Partial<Record<UserDataKey, string>> = {
  weekly_goals: 'etqan_weekly_quran_goals',
  quick_reviews: 'etqan_student_quick_reviews',
  archived_circles: 'etqan_archived_circles_db',
};
const LEGACY_NOTE_PREFIX = 'quran_note_';

const AppContext = createContext<AppContextType | undefined>(undefined);

const GUEST: User = { id: '', name: 'زائر', email: '', phone: '', role: 'student', createdAt: '' };
const DISMISSED_KEY = 'etqan_dismissed_broadcasts';
const CACHE_KEY = 'etqan_public_cache_v1';

function defaultAvatar(role: UserRole) {
  return role === 'admin' ? AVATAR_ADMIN : role === 'teacher' ? AVATAR_TEACHER_1 : AVATAR_STUDENT_1;
}

function withAvatar<T extends { role: UserRole; avatar?: string }>(u: T): T {
  return { ...u, avatar: u.avatar || defaultAvatar(u.role) };
}

function loadDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  } catch {
    return [];
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');
  const [currentUser, setCurrentUser] = useState<User>(GUEST);
  const [isGuest, setIsGuest] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authRequest, requestAuth] = useState<AuthMode | null>(null);
  const [toast, setToast] = useState<AppContextType['toast']>(null);
  const toastTimer = useRef<number | undefined>(undefined);

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
      // تنظيف البيانات التجريبية القديمة المحفوظة في المتصفح (قبل الربط بقاعدة البيانات)
      ['etqan_quran_academy_v1', 'etqan_quran_academy_v2', 'etqan_quran_academy_v3'].forEach((k) =>
        localStorage.removeItem(k)
      );
    } catch {}
  }, []);

  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [backups, setBackups] = useState<BackupSnapshot[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledSession[]>([]);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [khatms, setKhatms] = useState<KhatmCampaign[]>([]);
  const [userData, setUserData] = useState<Partial<Record<UserDataKey, any>>>({});
  const pendingSaves = useRef<Map<UserDataKey, number>>(new Map());

  const showToast = useCallback((text: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ text, type });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), type === 'error' ? 6000 : 3500);
  }, []);

  const applyBootstrap = useCallback((b: any) => {
    const user: User | null = b.user ? withAvatar(b.user) : null;
    setCurrentUser(user || GUEST);
    setIsGuest(!user);
    setTeachers((b.teachers || []).map(withAvatar));
    setPackages(b.packages || []);
    setBankAccounts(b.bankAccounts || []);
    setStudents((b.students || []).map(withAvatar));
    setSubscriptions(b.subscriptions || []);
    setSessions(b.sessions || []);
    setScheduled(b.scheduled || []);
    setLibrary(b.library || []);
    setKhatms(b.khatms || []);
    // لا نكتب فوق مفتاح عنده حفظ معلّق (تعديل لسه ما وصل السيرفر)
    const serverData = (b.userData || {}) as Partial<Record<UserDataKey, any>>;
    setUserData((prev) => {
      if (!user) return {};
      const next: Partial<Record<UserDataKey, any>> = { ...serverData };
      pendingSaves.current.forEach((_t, k) => {
        if (k in prev) next[k] = prev[k];
      });
      return next;
    });
    if (user) migrateLegacy(serverData);
    setNotifications(
      (b.notifications || []).map((n: any) => ({ ...n, createdAt: relativeTimeAr(n.createdAt) }))
    );
    const dismissed = loadDismissed();
    setBroadcasts(
      (b.broadcasts || []).map((x: any) => ({
        ...x,
        createdAt: relativeTimeAr(x.createdAt),
        active: x.active && !dismissed.includes(x.id),
      }))
    );
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ packages: b.packages, bankAccounts: b.bankAccounts }));
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      applyBootstrap(await api('GET', '/bootstrap'));
    } catch (e) {
      if (e instanceof ApiError && e.status !== 0) showToast(e.message);
      else if (e instanceof ApiError) showToast(e.message, 'info');
    } finally {
      setLoading(false);
      setAuthReady(true);
    }
  }, [applyBootstrap, showToast]);

  // أول تحميل: نعرض الباقات المحفوظة فوراً ثم نجيب البيانات الحقيقية
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached?.packages) setPackages(cached.packages);
      if (cached?.bankAccounts) setBankAccounts(cached.bankAccounts);
    } catch {}
    refresh();
  }, [refresh]);

  // تحديث تلقائي لما المستخدم يرجع للتطبيق
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && !isGuest) refresh();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [isGuest, refresh]);

  /** ينفّذ عملية على السيرفر ثم يحدّث البيانات؛ الأخطاء بتظهر كرسالة */
  const run = useCallback(
    async <T,>(fn: () => Promise<T>, opts: { refresh?: boolean; rethrow?: boolean } = {}): Promise<T | undefined> => {
      try {
        const r = await fn();
        if (opts.refresh !== false) await refresh();
        return r;
      } catch (e: any) {
        showToast(e?.message || 'حصل خطأ');
        if (opts.rethrow) throw e;
        return undefined;
      }
    },
    [refresh, showToast]
  );

  // ── بيانات المستخدم الشخصية
  const flushUserData = useCallback(
    async (key: UserDataKey, value: any) => {
      try {
        await api('PUT', `/me/data/${key}`, { value });
      } catch (e: any) {
        showToast(e?.message ? `ما اتحفظ في السحابة: ${e.message}` : 'ما اتحفظ في السحابة — اتأكد من الاتصال');
      } finally {
        pendingSaves.current.delete(key);
      }
    },
    [showToast]
  );

  const saveUserData = useCallback(
    (key: UserDataKey, value: any) => {
      setUserData((prev) => ({ ...prev, [key]: value }));
      const old = pendingSaves.current.get(key);
      if (old) window.clearTimeout(old);
      const t = window.setTimeout(() => void flushUserData(key, value), 700);
      pendingSaves.current.set(key, t);
    },
    [flushUserData]
  );

  /** نقل البيانات المحفوظة في المتصفح قديماً إلى قاعدة البيانات (مرة واحدة) */
  function migrateLegacy(serverData: Partial<Record<UserDataKey, any>>) {
    try {
      (Object.keys(LEGACY_KEYS) as UserDataKey[]).forEach((key) => {
        const legacy = LEGACY_KEYS[key] as string;
        const raw = localStorage.getItem(legacy);
        if (raw == null) return;
        if (serverData[key] === undefined) {
          const parsed = JSON.parse(raw);
          if (parsed != null) saveUserData(key, parsed);
        }
        localStorage.removeItem(legacy);
      });
      const noteKeys = Object.keys(localStorage).filter((k) => k.startsWith(LEGACY_NOTE_PREFIX));
      if (noteKeys.length) {
        const notes: Record<string, unknown> = { ...(serverData.ayah_notes || {}) };
        noteKeys.forEach((k) => {
          const id = k.slice(LEGACY_NOTE_PREFIX.length);
          if (notes[id] === undefined) {
            try {
              notes[id] = JSON.parse(localStorage.getItem(k) || 'null');
            } catch {}
          }
          localStorage.removeItem(k);
        });
        saveUserData('ayah_notes', notes);
      }
      localStorage.removeItem('teacher_direct_notifications');
    } catch {}
  }

  const sendDirectNotification: AppContextType['sendDirectNotification'] = async (data) => {
    const r = await run(() => api<{ sent: number }>('POST', '/notifications/send', data), { refresh: false, rethrow: true });
    return r?.sent ?? 0;
  };

  // ── المواعيد، المكتبة، الختمات
  const scheduleSession: AppContextType['scheduleSession'] = async (d) => {
    await run(() => api('POST', '/schedule', d), { rethrow: true });
  };
  const deleteScheduled = async (id: string) => {
    await run(() => api('DELETE', `/schedule/${id}`));
  };
  const addLibraryItem: AppContextType['addLibraryItem'] = async (d) => {
    await run(() => api('POST', '/library', d), { rethrow: true });
  };
  const deleteLibraryItem = async (id: string) => {
    await run(() => api('DELETE', `/library/${id}`));
  };
  const createKhatm: AppContextType['createKhatm'] = async (d) => {
    await run(() => api('POST', '/khatm', d), { rethrow: true });
  };
  const khatmAction: AppContextType['khatmAction'] = async (id, action, juz) => {
    const path = action === 'undone' ? 'done' : action;
    const body = action === 'undone' ? { juz, done: false } : { juz };
    const r = await run(() => api<{ khatm: KhatmCampaign }>('POST', `/khatm/${id}/${path}`, body), { refresh: false });
    if (r?.khatm) setKhatms((prev) => prev.map((k) => (k.id === id ? r.khatm : k)));
    else await refresh();
  };
  const deleteKhatm = async (id: string) => {
    await run(() => api('DELETE', `/khatm/${id}`));
  };

  // ── الحساب
  const login = async (phone: string, password: string) => {
    await api('POST', '/auth/login', { phone, password });
    requestAuth(null);
    await refresh();
  };

  const register = async (data: RegisterInput) => {
    await api('POST', '/auth/register', data);
    requestAuth(null);
    await refresh();
  };

  const logout = async () => {
    try {
      await api('POST', '/auth/logout');
    } catch {}
    setCurrentUser(GUEST);
    setIsGuest(true);
    setStudents([]);
    setSubscriptions([]);
    setSessions([]);
    setNotifications([]);
    await refresh();
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api('POST', '/auth/password', { currentPassword, newPassword });
  };

  const activeRole: UserRole = currentUser.role;

  // Notification Helper Actions
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    // الإشعارات الحقيقية بينشئها السيرفر؛ دي للعرض المحلي فقط
    setNotifications((prev) => [
      { ...notif, id: `local_${Date.now()}`, createdAt: 'الآن', isRead: false },
      ...prev,
    ]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    if (!id.startsWith('local_')) run(() => api('POST', `/notifications/${id}/read`), { refresh: false });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    run(() => api('POST', '/notifications/read-all'), { refresh: false });
  };

  const clearNotifications = () => {
    setNotifications([]);
    run(() => api('DELETE', '/notifications'), { refresh: false });
  };

  // الأدوار ما بتتبدّل يدوياً بعد الآن — كل مستخدم بيشوف بوابته حسب حسابه
  const switchRole = (role: UserRole) => {
    if (isGuest) requestAuth(role === 'student' ? 'student' : role === 'teacher' ? 'teacher' : 'login');
  };

  const submitTeacherApplication: AppContextType['submitTeacherApplication'] = async (data) => {
    await run(
      () =>
        api('POST', '/teachers/application', {
          name: data.name || undefined,
          email: data.email,
          qualifications: data.qualifications,
          availableDays: data.availableDays,
          availableTimes: data.availableTimes,
        }),
      { rethrow: true }
    );
    return currentUser.id;
  };

  const approveTeacher = (teacherId: string, hourlyRate?: number) => {
    run(() => api('POST', `/teachers/${teacherId}/approve`, { hourlyRate }));
  };

  const rejectTeacher = (teacherId: string, reason: string) => {
    run(() => api('POST', `/teachers/${teacherId}/reject`, { reason }));
  };

  const updateMyZoomLink = async (link: string) => {
    await run(() => api('PATCH', '/teachers/me', { zoomLink: link }), { rethrow: true });
  };

  // Package Management
  const addPackage = (pkg: Omit<Package, 'id'>) => {
    run(() => api('POST', '/packages', pkg));
  };

  const updatePackage = (updatedPkg: Package) => {
    setPackages((prev) => prev.map((p) => (p.id === updatedPkg.id ? updatedPkg : p)));
    run(() => api('PUT', `/packages/${updatedPkg.id}`, updatedPkg));
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    run(() => api('DELETE', `/packages/${id}`));
  };

  const updateBankAccounts = (accounts: BankAccount[]) => {
    setBankAccounts(accounts);
    run(() => api('PUT', '/settings/bank-accounts', { accounts }));
  };

  // التسجيل بقى من شاشة الدخول — دي بترجّع الحساب الحالي بس
  const registerStudent = (): User => currentUser;

  const subscribeToPackage: AppContextType['subscribeToPackage'] = async (data) => {
    const res = await run(
      () =>
        api<{ subscription: Subscription }>('POST', '/subscriptions', {
          teacherId: data.teacherId,
          packageId: data.packageId,
          receipt: data.receiptUrl,
        }),
      { rethrow: true }
    );
    return res!.subscription;
  };

  const approveSubscription = (subscriptionId: string) => {
    run(() => api('POST', `/subscriptions/${subscriptionId}/approve`));
  };

  const rejectSubscription = (subscriptionId: string, reason: string) => {
    run(() => api('POST', `/subscriptions/${subscriptionId}/reject`, { reason }));
  };

  const addSessionsToSubscription = (subscriptionId: string, extraCount: number) => {
    run(() => api('POST', `/subscriptions/${subscriptionId}/add-sessions`, { count: extraCount }));
  };

  const recordSession = async (data: Omit<SessionRecord, 'id'>) => {
    await run(() => api('POST', '/sessions', data), { rethrow: true });
  };

  const resetUserPassword = async (userId: string) => {
    return (await run(() => api('POST', `/admin/users/${userId}/reset-password`), { refresh: false, rethrow: true }))!;
  };

  const setUserActive = async (userId: string, active: boolean) => {
    await run(() => api('POST', `/admin/users/${userId}/active`, { active }), { rethrow: true });
  };

  // Backup & Restore — التصدير من قاعدة البيانات مباشرة
  const exportData = () => {
    run(
      async () => {
        const data = await api('GET', '/admin/export');
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Etqan_Quran_Academy_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        const count = ['users', 'subscriptions', 'sessions'].reduce((n, k) => n + ((data as any)[k]?.length || 0), 0);
        setBackups((prev) => [
          {
            id: `dl_${Date.now()}`,
            name: 'نسخة تم تنزيلها لجهازك',
            size: `${(blob.size / 1024).toFixed(0)} KB`,
            createdAt: new Date().toLocaleString('ar-EG'),
            type: 'manual',
            recordCount: count,
          },
          ...prev,
        ]);
        showToast('تم تنزيل النسخة الاحتياطية لجهازك', 'success');
      },
      { refresh: false }
    );
  };

  const importData = (): boolean => {
    showToast('الاستعادة من ملف غير متاحة بعد الربط بقاعدة البيانات — قاعدة Neon بتحتفظ بسجل تلقائي للاستعادة', 'info');
    return false;
  };

  const sendBroadcast = (broadcast: Omit<BroadcastMessage, 'id' | 'createdAt' | 'active'>) => {
    run(() => api('POST', '/broadcasts', broadcast));
  };

  const dismissBroadcast = (id: string) => {
    setBroadcasts((prev) => prev.map((b) => (b.id === id ? { ...b, active: false } : b)));
    try {
      const d = loadDismissed();
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...d, id].slice(-100)));
    } catch {}
  };

  const deactivateBroadcast = async (id: string) => {
    await run(() => api('DELETE', `/broadcasts/${id}`));
  };

  const createCloudBackupSnapshot = (): BackupSnapshot => {
    exportData();
    return {
      id: `dl_${Date.now()}`,
      name: 'نسخة تم تنزيلها لجهازك',
      size: '',
      createdAt: new Date().toLocaleString('ar-EG'),
      type: 'manual',
      recordCount: 0,
    };
  };

  const restoreFromSnapshot = (): boolean => {
    showToast('الاستعادة بتتم من لوحة Neon (Restore) لحماية البيانات من الحذف بالغلط', 'info');
    return false;
  };

  const resetToDefaults = () => {
    showToast('إعادة التعيين معطّلة لحماية البيانات الحقيقية', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        isGuest,
        authReady,
        loading,
        login,
        register,
        logout,
        changePassword,
        refresh,
        authRequest,
        requestAuth,
        toast,
        showToast,
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
        deactivateBroadcast,
        switchRole,
        setCurrentUser,
        submitTeacherApplication,
        approveTeacher,
        rejectTeacher,
        updateMyZoomLink,
        sendDirectNotification,
        userData,
        saveUserData,
        scheduled,
        library,
        khatms,
        scheduleSession,
        deleteScheduled,
        addLibraryItem,
        deleteLibraryItem,
        createKhatm,
        khatmAction,
        deleteKhatm,
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
        addSessionRecord: recordSession,
        resetUserPassword,
        setUserActive,
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

/** المعلم الحقيقي للمستخدم الحالي: للطالب = معلم اشتراكه المعتمد، وللمعلم = نفسه */
export const useMyTeacher = (): { name: string; zoomLink: string } => {
  const { currentUser, subscriptions, teachers } = useApp();
  if (currentUser.role === 'teacher') {
    const me = teachers.find((t) => t.id === currentUser.id);
    return { name: currentUser.name, zoomLink: me?.zoomLink || '' };
  }
  const sub = subscriptions.find((s) => s.studentId === currentUser.id && s.paymentStatus === 'approved');
  const t = sub ? teachers.find((x) => x.id === sub.teacherId) : undefined;
  return { name: sub?.teacherName || t?.name || 'معلم/ة الحلقة', zoomLink: t?.zoomLink || '' };
};
