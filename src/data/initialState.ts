import { TeacherProfile, Package, Subscription, BankAccount, SessionRecord, User, NotificationItem } from '../types';

// Safe SVG Data URI Badges for Islamic Profiles (No real human photos)
export const AVATAR_ADMIN = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="28" fill="%23064e3b"/><circle cx="50" cy="50" r="38" stroke="%23fbbf24" stroke-width="2" stroke-dasharray="4 2"/><path d="M50 24L65 30V48C65 60 58 70 50 75C42 70 35 60 35 48V30L50 24Z" fill="%2310b981" stroke="%23fbbf24" stroke-width="2"/><path d="M44 48L48 52L56 42" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const AVATAR_TEACHER_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="28" fill="%23047857"/><circle cx="50" cy="50" r="38" stroke="%23fef08a" stroke-width="2"/><path d="M50 26C42 26 36 32 36 40C36 46 40 51 46 53V58H54V53C60 51 64 46 64 40C64 32 58 26 50 26Z" fill="%23fef08a"/><path d="M30 76C30 66 38 62 50 62C62 62 70 66 70 76H30Z" fill="%23a7f3d0"/></svg>`;

export const AVATAR_TEACHER_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="28" fill="%230f766e"/><circle cx="50" cy="50" r="38" stroke="%23fde047" stroke-width="2"/><path d="M50 28L63 35V45L50 52L37 45V35L50 28Z" fill="%23fde047"/><path d="M32 75C32 64 40 60 50 60C60 60 68 64 68 75H32Z" fill="%2399f6e4"/></svg>`;

export const AVATAR_TEACHER_3 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="28" fill="%231e293b"/><circle cx="50" cy="50" r="38" stroke="%23e2e8f0" stroke-width="2"/><path d="M50 26C43 26 38 31 38 38C38 44 42 49 47 50V56H53V50C58 49 62 44 62 38C62 31 57 26 50 26Z" fill="%23cbd5e1"/><path d="M30 76C30 66 38 62 50 62C62 62 70 66 70 76H30Z" fill="%2394a3b8"/></svg>`;

export const AVATAR_STUDENT_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="28" fill="%230284c7"/><circle cx="50" cy="50" r="38" stroke="%23bae6fd" stroke-width="2"/><path d="M50 25L68 35L50 45L32 35L50 25Z" fill="%23facc15"/><path d="M40 45V58C40 63 50 67 50 67C50 67 60 63 60 58V45" stroke="%23facc15" stroke-width="2" fill="none"/><path d="M30 76C30 67 38 64 50 64C62 64 70 67 70 76H30Z" fill="%23e0f2fe"/></svg>`;

export const AVATAR_STUDENT_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="28" fill="%23d97706"/><circle cx="50" cy="50" r="38" stroke="%23fef3c7" stroke-width="2"/><path d="M50 25L68 35L50 45L32 35L50 25Z" fill="%23fef3c7"/><path d="M40 45V58C40 63 50 67 50 67C50 67 60 63 60 58V45" stroke="%23fef3c7" stroke-width="2" fill="none"/><path d="M30 76C30 67 38 64 50 64C62 64 70 67 70 76H30Z" fill="%23fed7aa"/></svg>`;

// Safe receipt mockup SVG
export const SAMPLE_RECEIPT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="%23f8fafc"><rect width="400" height="300" rx="16" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><rect x="20" y="20" width="360" height="50" rx="10" fill="%23047857"/><text x="200" y="52" fill="white" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">إيصال تحويل بنكي معتمد - أكاديمية القرآن</text><text x="40" y="110" fill="%23475569" font-family="sans-serif" font-size="13">رقم العملية: #TRX-9824102</text><text x="40" y="145" fill="%23475569" font-family="sans-serif" font-size="13">المبلغ المحول: 320.00 ر.س</text><text x="40" y="180" fill="%23475569" font-family="sans-serif" font-size="13">الحساب المحول إليه: مصرف الراجحي</text><text x="40" y="215" fill="%23047857" font-family="sans-serif" font-size="14" font-weight="bold">حالة التحويل: تم الدفع بنجاح ✅</text><rect x="40" y="245" width="320" height="2" fill="%23e2e8f0"/><text x="200" y="275" fill="%2394a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">وثيقة إلكترونية صادرة من التطبيق البنكي</text></svg>`;

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    recipientRole: 'student',
    recipientId: 'std_1',
    title: 'تأكيد تفعيل الباقة',
    message: 'تم اعتماد التحويل وتفعيل (باقة التأسيس والتلاوة) بنجاح! يمكنك الآن الانضمام للحلقات والقاعة المباشرة.',
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
    message: 'تم اعتماد حسابك في أكاديمية القرآن الكريم، ويمكنك الآن بدء الحلقات وتسجيل التقييمات.',
    type: 'success',
    createdAt: 'منذ يوم واحد',
    isRead: false,
    linkTab: 'workspace',
  },
  {
    id: 'notif_3',
    recipientRole: 'admin',
    title: 'طلب انضمام جديد',
    message: 'قُدم طلب انضمام جديد للكادر التعليمي وبانتظار مراجعة الإدارة والمجلس.',
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
    message: 'تم تسجيل تقييم 5 نجوم مع ملاحظات التجويد للحصة الأخيرة.',
    type: 'info',
    createdAt: 'منذ 4 ساعات',
    isRead: false,
    linkTab: 'workspace',
  },
];

export const INITIAL_ADMIN: User = {
  id: 'admin_1',
  name: 'الإدارة العامة والمجلس التعليمي',
  email: 'admin@quran-academy.com',
  phone: '+966 50 000 0000',
  role: 'admin',
  avatar: AVATAR_ADMIN,
  createdAt: '2025-01-01',
};

export const INITIAL_TEACHERS: TeacherProfile[] = [
  {
    id: 'teacher_1',
    name: 'المعلمة أمل محمد (إجازة برواية حفص)',
    email: 'teacher.amal@quran-academy.com',
    phone: '+966 55 000 0001',
    role: 'teacher',
    status: 'approved',
    avatar: AVATAR_TEACHER_1,
    createdAt: '2025-01-10',
    qualifications: {
      ijazat: ['إجازة بقراءة عاصم بروايتيه شعبة وحفص', 'شهادة معتمدة في تدريس القاعدة النورانية'],
      memorizationParts: 30,
      experienceYears: 7,
      specialization: 'حفظ ومراجعة وتصحيح تلاوة مع ضبط المتون',
      bio: 'خريجة كلية القرآن والدراسات الإسلامية، معلمة متخصصة في مسارات الإتقان وتوجيه الخاتمات.',
      recitationAudioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.minshawi/1.mp3'
    },
    hourlyRate: 120,
    availableDays: ['الأحد', 'الثلاثاء', 'الخميس'],
    availableTimes: '4:00 مساءً - 8:00 مساءً',
    rating: 4.9,
    studentCount: 8,
    zoomLink: 'in_app'
  },
  {
    id: 'teacher_2',
    name: 'المعلمة عائشة الغامدي (إجازة التجويد)',
    email: 'teacher.aisha@quran-academy.com',
    phone: '+966 55 000 0002',
    role: 'teacher',
    status: 'approved',
    avatar: AVATAR_TEACHER_2,
    createdAt: '2025-02-01',
    qualifications: {
      ijazat: ['إجازة في تحفيظ الأطفال والمبتدئين', 'دبلوم التجويد الميسر'],
      memorizationParts: 30,
      experienceYears: 4,
      specialization: 'تحفيظ الأطفال والناشئة وتأسيس النطق الصحيح',
      bio: 'شغوفة بتعليم القرآن الكريم للأطفال والناشئة بأساليب تفاعلية ممتعة ومحفزة.',
      recitationAudioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.husary/1.mp3'
    },
    hourlyRate: 100,
    availableDays: ['الإثنين', 'الأربعاء', 'السبت'],
    availableTimes: '3:00 مساءً - 7:00 مساءً',
    rating: 4.8,
    studentCount: 5,
    zoomLink: 'in_app'
  },
  {
    id: 'teacher_3',
    name: 'المعلمة نورة العتيبي (طلب جديد)',
    email: 'teacher.noura@quran-academy.com',
    phone: '+966 55 000 0003',
    role: 'teacher',
    status: 'pending',
    avatar: AVATAR_TEACHER_3,
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
    studentCount: 0,
    zoomLink: 'in_app'
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
      '8 حصص فردية بالقاعة المباشرة',
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
      '12 حصة فردية تفاعلية بالقاعة',
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
      'شهادة تقدير شهرية لأولياء الأمور'
    ],
    popular: false
  }
];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    bankName: 'مصرف الراجحي',
    accountName: 'أكاديمية القرآن الكريم',
    accountNumber: '4820000000000000',
    iban: 'SA0380000000000000000000',
    logoColor: 'from-blue-600 to-indigo-700'
  },
  {
    bankName: 'البنك الأهلي السعودي (SNB)',
    accountName: 'أكاديمية القرآن الكريم للتعليم والتحفيظ',
    accountNumber: '1015000000000000',
    iban: 'SA2110000000000000000000',
    logoColor: 'from-emerald-600 to-teal-700'
  },
  {
    bankName: 'محفظة STC Pay / Pay (سريع)',
    accountName: 'أكاديمية القرآن الكريم',
    accountNumber: '0500000000',
    iban: 'STC-PAY-0500000000',
    logoColor: 'from-purple-600 to-violet-700'
  }
];

export const INITIAL_STUDENTS: User[] = [
  {
    id: 'std_1',
    name: 'عبدالرحمن الشمري (طالب)',
    email: 'student.abdulrahman@quran-academy.com',
    phone: '+966 54 000 0001',
    role: 'student',
    avatar: AVATAR_STUDENT_1,
    createdAt: '2025-02-10'
  },
  {
    id: 'std_2',
    name: 'فاطمة أحمد (طالبة)',
    email: 'student.fatima@quran-academy.com',
    phone: '+966 54 000 0002',
    role: 'student',
    avatar: AVATAR_STUDENT_2,
    createdAt: '2025-03-25'
  }
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_101',
    studentId: 'std_1',
    studentName: 'عبدالرحمن الشمري',
    studentPhone: '+966 54 000 0001',
    teacherId: 'teacher_1',
    teacherName: 'المعلمة أمل محمد',
    packageId: 'pkg_1',
    packageName: 'باقة التأسيس والتلاوة',
    totalSessions: 8,
    usedSessions: 2,
    remainingSessions: 6,
    amountPaid: 320,
    currency: 'ريال سعودي',
    paymentReceiptUrl: SAMPLE_RECEIPT,
    paymentStatus: 'approved',
    startDate: '2025-03-01',
    expiryDate: '2025-04-01',
    createdAt: '2025-03-01'
  },
  {
    id: 'sub_102',
    studentId: 'std_2',
    studentName: 'فاطمة أحمد',
    studentPhone: '+966 54 000 0002',
    teacherId: 'teacher_2',
    teacherName: 'المعلمة عائشة الغامدي',
    packageId: 'pkg_2',
    packageName: 'باقة الإتقان والخاتمات',
    totalSessions: 12,
    usedSessions: 0,
    remainingSessions: 12,
    amountPaid: 480,
    currency: 'ريال سعودي',
    paymentReceiptUrl: SAMPLE_RECEIPT,
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
    teacherName: 'المعلمة أمل محمد',
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
    teacherName: 'المعلمة أمل محمد',
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
