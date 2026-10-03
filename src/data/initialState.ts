import { TeacherProfile, Package, Subscription, BankAccount, SessionRecord, User, NotificationItem } from '../types';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    recipientRole: 'student',
    recipientId: 'std_1',
    title: 'تأكيد تفعيل الباقة',
    message: 'تم اعتماد التحويل البنكي وتفعيل (باقة التأسيس والتلاوة) بنجاح! يمكنك الآن الانضمام للحلقات المباشرة.',
    type: 'success',
    createdAt: 'منذ ساعتين',
    isRead: false,
    linkTab: 'workspace',
  },
  {
    id: 'notif_2',
    recipientRole: 'teacher',
    recipientId: 'teacher_1',
    title: 'اعتماد حساب المعلمة',
    message: 'تهانينا أستاذة أمل! تم اعتماد طلب انضمامك لأكاديمية إتقان، ويمكنك الآن متابعة الطلاب وتسجيل الحصص.',
    type: 'success',
    createdAt: 'منذ يوم واحد',
    isRead: false,
    linkTab: 'workspace',
  },
  {
    id: 'notif_3',
    recipientRole: 'admin',
    title: 'طلب انضمام جديد',
    message: 'قدمت أستاذة نورة العتيبي طلب انضمام جديد للكادر التعليمي وبانتظار المراجعة والتدقيق.',
    type: 'warning',
    createdAt: 'منذ 3 ساعات',
    isRead: false,
    linkTab: 'workspace',
  },
  {
    id: 'notif_4',
    recipientRole: 'student',
    recipientId: 'std_1',
    title: 'تقييم جديد للحصة',
    message: 'قامت المعلمة أ. أمل الحمد بتسجيل تقييم 5 نجوم مع ملاحظات التجويد للحصة الأخيرة.',
    type: 'info',
    createdAt: 'منذ 4 ساعات',
    isRead: false,
    linkTab: 'workspace',
  },
];

export const INITIAL_ADMIN: User = {
  id: 'admin_1',
  name: 'الشيخة مريم الحارثي (المشرفة العامة)',
  email: 'admin@etqan-quran.com',
  phone: '+966501234567',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  createdAt: '2025-01-01',
};

export const INITIAL_TEACHERS: TeacherProfile[] = [
  {
    id: 'teacher_1',
    name: 'أستاذة أمل الحمد',
    email: 'amal.alhamad@etqan.com',
    phone: '+966551122334',
    role: 'teacher',
    status: 'approved',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-10',
    qualifications: {
      ijazat: ['إجازة بقراءة عاصم بروايتيه شعبة وحفص', 'شهادة معتمدة في تدريس القاعدة النورانية'],
      memorizationParts: 30,
      experienceYears: 7,
      specialization: 'حفظ ومراجعة وتصحيح تلاوة مع ضبط المتون',
      bio: 'خريجة كلية الشريعة والدراسات الإسلامية، معلمة متخصصة في توجيه الخاتمات ومسارات الإتقان.',
      recitationAudioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.minshawi/1.mp3'
    },
    hourlyRate: 120,
    availableDays: ['الأحد', 'الثلاثاء', 'الخميس'],
    availableTimes: '4:00 مساءً - 8:00 مساءً',
    rating: 4.9,
    studentCount: 8,
    zoomLink: 'https://zoom.us/j/9876543210'
  },
  {
    id: 'teacher_2',
    name: 'أستاذة عائشة الغامدي',
    email: 'aisha.ghamdi@etqan.com',
    phone: '+966559988776',
    role: 'teacher',
    status: 'approved',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-02-01',
    qualifications: {
      ijazat: ['إجازة في تحفيظ الأطفال والمبتدئين', 'دبلوم التجويد الميسر'],
      memorizationParts: 30,
      experienceYears: 4,
      specialization: 'تحفيظ الأطفال والناشئة وتأسيس النطق الصحيح',
      bio: 'شغوفة بتعليم القران الكريم للأطفال بأساليب تفاعلية ممتعة ومحفزة.',
      recitationAudioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.husary/1.mp3'
    },
    hourlyRate: 100,
    availableDays: ['الإثنين', 'الأربعاء', 'السبت'],
    availableTimes: '3:00 مساءً - 7:00 مساءً',
    rating: 4.8,
    studentCount: 5,
    zoomLink: 'https://meet.google.com/abc-defg-hij'
  },
  {
    id: 'teacher_3',
    name: 'أستاذة نورة العتيبي (طلب جديد)',
    email: 'noura.otaibi@gmail.com',
    phone: '+966508877665',
    role: 'teacher',
    status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-03-20',
    qualifications: {
      ijazat: ['إجازة برواية حفص عن عاصم من طريق الشاطبية'],
      memorizationParts: 30,
      experienceYears: 3,
      specialization: 'تصحيح المخارج ومراجعة الأجزاء الأخيرة',
      bio: 'قدّمت طلب انضمام للأكاديمية وتنتظر المراجعة والموافقة من الإدارة.',
      recitationAudioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3'
    },
    hourlyRate: 110,
    availableDays: ['الأحد', 'الإثنين', 'الأربعاء'],
    availableTimes: '5:00 مساءً - 9:00 مساءً',
    rating: 5.0,
    studentCount: 0
  }
];

export const INITIAL_PACKAGES: Package[] = [
  {
    id: 'pkg_1',
    name: 'باقة التأسيس والتلاوة',
    sessionCount: 8,
    sessionDurationMinutes: 45,
    price: 320,
    currency: 'ريال سعودي',
    description: 'مناسبة للمبتدئين ولتصحيح التلاوة والتأسيس الصحيح للحفظ.',
    features: [
      '8 حصص فردية مع المعلمة مباشرة',
      'مدة الحصة 45 دقيقة',
      'تقرير تقييم أسبوعي لمستوى التجويد',
      'متابعة الحفظ عبر تطبيق الأكاديمية'
    ],
    popular: false
  },
  {
    id: 'pkg_2',
    name: 'باقة الإتقان والخاتمات (الأكثر طلباً)',
    sessionCount: 12,
    sessionDurationMinutes: 60,
    price: 480,
    currency: 'ريال سعودي',
    description: 'باقة مكثفة لمراجعة أجزاء القرآن والتأهيل للإجازة مع ضبط التجويد.',
    features: [
      '12 حصة فردية تفاعلية',
      'مدة الحصة 60 دقيقة كاملة',
      'جدول مراجعة مخصص من المعلمة',
      'اختبارات مرحلية وشهادة إنجاز',
      'استشارات تجويدية مع المشرفة'
    ],
    popular: true
  },
  {
    id: 'pkg_3',
    name: 'باقة الأنجال للأطفال',
    sessionCount: 16,
    sessionDurationMinutes: 30,
    price: 400,
    currency: 'ريال سعودي',
    description: 'باقة مرنة مصممة خصيصاً للأطفال للتحفيظ بالتكرار والتحفيز.',
    features: [
      '16 حصة فردية قصيرة وممتعة',
      'مدة الحصة 30 دقيقة تتناسب مع تركيز الطفل',
      'تسميع أذكار وقصار السور',
      'شهادة تقدير شهري للأولياء الأمور'
    ],
    popular: false
  }
];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    bankName: 'مصرف الراجحي',
    accountName: 'أكاديمية إتقان لتحفيظ القرآن',
    accountNumber: '4820000123456789',
    iban: 'SA03800004820000123456789',
    logoColor: 'from-blue-600 to-indigo-700'
  },
  {
    bankName: 'البنك الأهلي السعودي (SNB)',
    accountName: 'أكاديمية إتقان للتعليم والتدريب',
    accountNumber: '1015000098765432',
    iban: 'SA211000001015000098765432',
    logoColor: 'from-emerald-600 to-teal-700'
  },
  {
    bankName: 'محفظة STC Pay / Pay (سريع)',
    accountName: 'أكاديمية إتقان',
    accountNumber: '0501234567',
    iban: 'STC-PAY-0501234567',
    logoColor: 'from-purple-600 to-violet-700'
  }
];

export const INITIAL_STUDENTS: User[] = [
  {
    id: 'std_1',
    name: 'عبدالرحمن الشمري',
    email: 'abdulrahman@gmail.com',
    phone: '+966540001122',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-02-10'
  },
  {
    id: 'std_2',
    name: 'فاطمة أحمد',
    email: 'fatima.ahmed@gmail.com',
    phone: '+966541112233',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-03-25'
  }
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_101',
    studentId: 'std_1',
    studentName: 'عبدالرحمن الشمري',
    studentPhone: '+966540001122',
    teacherId: 'teacher_1',
    teacherName: 'أستاذة أمل الحمد',
    packageId: 'pkg_1',
    packageName: 'باقة التأسيس والتلاوة',
    totalSessions: 8,
    usedSessions: 2,
    remainingSessions: 6,
    amountPaid: 320,
    currency: 'ريال سعودي',
    paymentReceiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    paymentStatus: 'approved',
    startDate: '2025-03-01',
    expiryDate: '2025-04-01',
    createdAt: '2025-03-01'
  },
  {
    id: 'sub_102',
    studentId: 'std_2',
    studentName: 'فاطمة أحمد',
    studentPhone: '+966541112233',
    teacherId: 'teacher_2',
    teacherName: 'أستاذة عائشة الغامدي',
    packageId: 'pkg_2',
    packageName: 'باقة الإتقان والخاتمات',
    totalSessions: 12,
    usedSessions: 0,
    remainingSessions: 12,
    amountPaid: 480,
    currency: 'ريال سعودي',
    paymentReceiptUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
    paymentStatus: 'pending',
    createdAt: '2025-03-28'
  }
];

export const INITIAL_SESSIONS: SessionRecord[] = [
  {
    id: 'ses_1',
    subscriptionId: 'sub_101',
    studentId: 'std_1',
    studentName: 'عبدالرحمن الشمري',
    teacherId: 'teacher_1',
    teacherName: 'أستاذة أمل الحمد',
    date: '2025-03-22',
    time: '05:00 م',
    surahName: 'سورة البقرة',
    fromAyah: 1,
    toAyah: 25,
    rating: 5,
    tajweedNotes: 'ممتاز جداً، ضبط إظهار النون الساكنة والتنوين والمد المنفصل بشكل رائع.',
    homework: 'حفظ سورة البقرة من الآية 26 إلى 40 مع مراجعة سورة الفاتحة.',
    attendance: 'present'
  },
  {
    id: 'ses_2',
    subscriptionId: 'sub_101',
    studentId: 'std_1',
    studentName: 'عبدالرحمن الشمري',
    teacherId: 'teacher_1',
    teacherName: 'أستاذة أمل الحمد',
    date: '2025-03-25',
    time: '05:00 م',
    surahName: 'سورة البقرة',
    fromAyah: 26,
    toAyah: 40,
    rating: 4,
    tajweedNotes: 'تلاوة طيبة، يرجى الانتباه لمقادير مد الصلة الصغرى ومخارج القلقلة.',
    homework: 'حفظ سورة البقرة من آية 41 إلى 55 مع المراجعة القريبة.',
    attendance: 'present'
  }
];
