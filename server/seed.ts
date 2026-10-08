// البيانات الأولية اللي بتتزرع في قاعدة البيانات أول مرة بس (الإدارة تقدر تعدلها بعدين).
export interface SeedPackage {
  id: string; name: string; sessionCount: number; sessionDurationMinutes: number;
  price: number; currency: string; description: string; features: string[]; popular?: boolean;
}

export const DEFAULT_PACKAGES: SeedPackage[] = [
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

export const DEFAULT_BANK_ACCOUNTS = [
  {
    bankName: 'بنك الخرطوم (تطبيق بنكك Bankak)',
    accountName: 'أكاديمية القرآن الكريم',
    accountNumber: '0913009060',
    iban: 'BOK-0913009060',
    logoColor: 'from-amber-600 to-emerald-700',
  },
  {
    bankName: 'محفظة التحويل السريع وواتساب الدعم',
    accountName: 'أكاديمية القرآن الكريم',
    accountNumber: '+249 913 009 060',
    iban: 'WA-249913009060',
    logoColor: 'from-emerald-600 to-teal-700',
  },
];
