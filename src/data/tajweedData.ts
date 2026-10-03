export interface TajweedRule {
  id: string;
  category: 'nun_sakinah' | 'meem_sakinah' | 'madd' | 'qalqalah';
  categoryTitle: string;
  ruleName: string;
  letters: string;
  definition: string;
  quranExampleText: string;
  quranExampleSurah: string;
  audioSampleUrl: string;
  tipForStudent: string;
  badgeColor: string;
}

export const TAJWEED_RULES: TajweedRule[] = [
  {
    id: 'tajweed_1',
    category: 'nun_sakinah',
    categoryTitle: 'أحكام النون الساكنة والتنوين',
    ruleName: 'الإظهار الحلقي',
    letters: 'ء - هـ - ع - ح - غ - خ',
    definition: 'إخراج النون الساكنة أو التنوين من مخرجها بغير غنة ظاهرية إذا جاء بعدها أحد حروف الحلق الستة.',
    quranExampleText: 'مَنْ آَمَنَ - مِنْ هَادٍ - أَنْعَمْتَ',
    quranExampleSurah: 'سورة الفاتحة / سورة البقرة',
    audioSampleUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1_7.mp3',
    tipForStudent: 'نصيحة المعلمة: احرص على نطق النون بوضوح تام دون تمطيط أو زيادة غنة.',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    id: 'tajweed_2',
    category: 'nun_sakinah',
    categoryTitle: 'أحكام النون الساكنة والتنوين',
    ruleName: 'الإدغام بغنة وبغير غنة',
    letters: 'يرملون (بغنة: ينمو / بغير غنة: ر، ل)',
    definition: 'دمج النون الساكنة أو التنوين بالحرف الذي بعدها بحيث يصيران حرفاً واحداً مشدداً.',
    quranExampleText: 'مَنْ يَقُولُ (بغنة) - مِنْ رَبِّهِمْ (بغير غنة)',
    quranExampleSurah: 'سورة البقرة',
    audioSampleUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2_8.mp3',
    tipForStudent: 'نصيحة المعلمة: أخرج الصوت من الخيشوم بمقدار حركتين عند الإدغام بغنة.',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    id: 'tajweed_3',
    category: 'nun_sakinah',
    categoryTitle: 'أحكام النون الساكنة والتنوين',
    ruleName: 'الإقلاب',
    letters: 'حرف الباء (ب)',
    definition: 'قلب النون الساكنة أو التنوين ميماً مخفاة بغنة إذا جاء بعدها حرف الباء.',
    quranExampleText: 'مِنْ بَعْدِ - أَنْبِئْهُمْ',
    quranExampleSurah: 'سورة البقرة / آية 33',
    audioSampleUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2_33.mp3',
    tipForStudent: 'نصيحة المعلمة: تظهر علامة الميم الصغيرة (مـ) المصحفية فوق النون للدلالة على الإقلاب.',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
  },
  {
    id: 'tajweed_4',
    category: 'nun_sakinah',
    categoryTitle: 'أحكام النون الساكنة والتنوين',
    ruleName: 'الإخفاء الحقيقي',
    letters: 'الحروف الـ15 الباقية (ص، ذ، ث، ك، ج، ش، ق، س، د، ط، ز، ف، ت، ض، ظ)',
    definition: 'نطق النون الساكنة بحالة بين الإظهار والإدغام مع بقاء الغنة.',
    quranExampleText: 'مِنْ دُونِ - كَأْسًا دِهَاقًا',
    quranExampleSurah: 'سورة النبأ',
    audioSampleUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/78_34.mp3',
    tipForStudent: 'نصيحة المعلمة: جافِ بين اللسان والغار عند نطق غنة الإخفاء ليخرج الصوت رقِيقاً أو مفخماً حسب الحرف التالي.',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  {
    id: 'tajweed_5',
    category: 'madd',
    categoryTitle: 'أحكام المدود',
    ruleName: 'المد المتصل والمد المنفصل',
    letters: 'حروف المد (أ، و، ي) المتبوعة بهمزة',
    definition: 'المد المتصل: أن يأتي حرف المد والهمزة في كلمة واحدة (4-5 حركات واجب). المنفصل: حرف المد بآخر كلمة والهمزة بأول التالية.',
    quranExampleText: 'جَاءَ (متصل) - بِمَا أُنْزِلَ (منفصل)',
    quranExampleSurah: 'سورة البقرة / آية 4',
    audioSampleUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2_4.mp3',
    tipForStudent: 'نصيحة المعلمة: حافظ على مقياس الحركات المتوازن (4 حركات تعادل إغلاق الأصبع وبسطه مرتين).',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
  },
  {
    id: 'tajweed_6',
    category: 'qalqalah',
    categoryTitle: 'أحكام القلقلة',
    ruleName: 'القلقلة (الصغرى والكبرى)',
    letters: 'قُطْبُ جَدٍّ (ق، ط، ب، ج، د)',
    definition: 'اضطراب الصوت عند النطق بالحرف الساكن حتى يُسمع له نبرة قوية.',
    quranExampleText: 'قُلْ هُوَ اللَّهُ أَحَدٌ (كبرى عند الوقف) - يَجْعَلُونَ (صغرى وسط الكلمة)',
    quranExampleSurah: 'سورة الإخلاص',
    audioSampleUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/112_1.mp3',
    tipForStudent: 'نصيحة المعلمة: القلقلة تكون أقوى وأوضح عند الوقف على الحرف المشدد أو الساكن متطرفاً.',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  },
];
