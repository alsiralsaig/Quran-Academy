export type UserRole = 'admin' | 'teacher' | 'student';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface TeacherQualifications {
  ijazat: string[]; // e.g. "إجازة بقراءة عاصم عن حفص وشعبة", "إجازة في الجزرية"
  memorizationParts: number; // e.g. 30
  experienceYears: number; // e.g. 5
  specialization: string; // e.g. "حفظ وتجويد للكبار والأطفال"
  bio: string;
  recitationAudioUrl?: string; // audio sample link
}

export interface TeacherProfile extends User {
  role: 'teacher';
  status: ApplicationStatus;
  rejectionReason?: string;
  applicationSubmitted?: boolean; // قدّمت بيانات المؤهلات؟
  qualifications: TeacherQualifications;
  hourlyRate?: number;
  availableDays?: string[]; // e.g. ["الأحد", "الثلاثاء", "الخميس"]
  availableTimes?: string; // e.g. "4:00 م - 8:00 م"
  rating: number;
  studentCount: number;
  zoomLink?: string;
}

export interface Package {
  id: string;
  name: string; // e.g. "باقة التأسيس", "باقة المراجعة الإتقانية"
  sessionCount: number; // e.g. 8
  sessionDurationMinutes: number; // e.g. 45
  price: number; // e.g. 250 SAR
  currency: string; // e.g. "ريال سعودي"
  description: string;
  features: string[];
  popular?: boolean;
}

export interface Subscription {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  teacherId: string;
  teacherName: string;
  packageId: string;
  packageName: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  amountPaid: number;
  currency: string;
  paymentReceiptUrl: string; // receipt image
  paymentStatus: PaymentStatus;
  rejectionReason?: string;
  startDate?: string;
  expiryDate?: string;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  subscriptionId: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  date: string;
  time: string;
  surahName: string; // e.g. "سورة البقرة"
  fromAyah: number;
  toAyah: number;
  rating: number; // 1-5 stars
  tajweedNotes: string;
  homework: string; // e.g. "حفظ سورة آل عمران من آية 1 إلى 15"
  attendance: 'present' | 'absent_excused' | 'absent_unexcused';
}

export interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  logoColor: string;
}

export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  juzNumber: number;
}

export interface QuranAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  tafsirText?: string;
  audioUrl?: string;
}

export interface ZikrItem {
  id: string;
  category: 'morning' | 'evening' | 'after_prayer' | 'sleep' | 'quranic';
  categoryLabel: string;
  text: string;
  count: number;
  virtue?: string;
  reference?: string;
}

export interface NotificationItem {
  id: string;
  recipientRole: UserRole | 'all';
  recipientId?: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'reminder';
  createdAt: string;
  isRead: boolean;
  linkTab?: 'workspace' | 'quran' | 'azkar';
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  iconName: 'award' | 'star' | 'book' | 'flame' | 'sparkles' | 'mic';
  unlocked: boolean;
  unlockedAt?: string;
  pointsRequired: number;
}

export interface TeacherNotification {
  id: string;
  senderTeacherName: string;
  studentId: string;
  studentName: string;
  type: 'encouragement' | 'attendance' | 'homework';
  title: string;
  message: string;
  sentAt: string;
  read: boolean;
}

export interface ScheduledSession {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string | null; // null = لكل طلاب المعلم
  studentName: string | null;
  title: string;
  date: string;
  time: string;
  note: string;
  meetingUrl: string;
}

export interface LibraryItem {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  kind: 'pdf' | 'video' | 'audio' | 'link';
  url: string;
  description: string;
  createdAt: string;
}

export interface KhatmPart {
  userId: string;
  name: string;
  done: boolean;
  at?: string;
}

export interface KhatmCampaign {
  id: string;
  teacherId: string;
  teacherName: string;
  title: string;
  targetDate: string | null;
  parts: Record<string, KhatmPart>;
  createdAt: string;
}
