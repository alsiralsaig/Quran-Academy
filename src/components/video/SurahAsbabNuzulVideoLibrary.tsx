import React, { useState } from 'react';
import {
  Video,
  Play,
  Pause,
  BookOpen,
  Sparkles,
  Search,
  X,
  CheckCircle2,
  Share2,
  Clock,
  Award,
  Volume2,
  BookmarkCheck,
  GraduationCap,
  FileText
} from 'lucide-react';
import { getAyahAudioUrl } from '../../data/quranData';

export interface SurahLectureVideo {
  id: string;
  surahNumber: number;
  surahName: string;
  title: string;
  speakerName: string;
  durationText: string;
  audioSampleSurah: number;
  audioSampleAyah: number;
  description: string;
  virtueText: string;
  asbabNuzulDetail: string;
  keyLessons: string[];
}

const SAMPLE_LECTURES: SurahLectureVideo[] = [
  {
    id: 'vid_fatiha',
    surahNumber: 1,
    surahName: 'الفاتحة',
    title: 'أسرار وفضائل سورة الفاتحة أم الكتاب والسبع المثاني',
    speakerName: 'د. عثمان الخميس',
    durationText: '18 دقيقة',
    audioSampleSurah: 1,
    audioSampleAyah: 1,
    description: 'محاضرة شاملة توضح تسميات سورة الفاتحة وأسباب نزولها ومكانتها الشريفة في الصلاة وتفريج الهموم وعلاج الأمراض.',
    virtueText: 'قال النبي ﷺ: "هي أم القرآن وهي السبع المثاني وهي القرآن العظيم الذي أوتيته".',
    asbabNuzulDetail: 'نزلت سورة الفاتحة بمكة المكرمة في أوائل البعثة النبوية، وقيل إنها أول سورة نزلت كاملة. وكان النبي ﷺ إذا سمع منادياً يناديه: يا محمد، ينطلق هارباً، فقال له ورقة: إذا سمعته فاثبت حتى تسمع ما يقول لك، فلما سمع قال: "أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله"، ثم قرأ عليه الحمد لله رب العالمين.',
    keyLessons: [
      'افتتاح كتاب الله بالحمد والثناء والاعتراف بنعم الله الواسعة.',
      'إخلاص العبادة والاستعانة بالله وحده في كل الأمور (إياك نعبد وإياك نستعين).',
      'طلب الهداية إلى الصراط المستقيم والثبات عليه حتى الممات.',
      'التحذير من سبل المغضوب عليهم والضالين.'
    ]
  },
  {
    id: 'vid_baqarah',
    surahNumber: 2,
    surahName: 'البقرة',
    title: 'أسباب نزول سورة البقرة وفضل آية الكرسي وخواتيم السورة',
    speakerName: 'د. محمد راتب النابلسي',
    durationText: '35 دقيقة',
    audioSampleSurah: 2,
    audioSampleAyah: 255,
    description: 'شرح مفصل لأسباب نزول سورة البقرة، قصة البقرة مع بني إسرائيل، وفضل قراءتها في البيوت لطرد الشياطين وجلب البركة والسكينة.',
    virtueText: 'قال النبي ﷺ: "اقرءوا سورة البقرة، فإن أخذها بركة، وتركها حسرة، ولا تستطيعها البطلة (أي السحرة)".',
    asbabNuzulDetail: 'سورة البقرة سورة مدنية نزلت في فترات متفرقة بعد الهجرة النبوية المباركة، وتضمنت تشريعات المجتمع المسلم وتوجيهات الأمة في بناء الدولة الإسلامية وعقود المعاملات والتحذير من الربا وأحكام الصيام والقصاص.',
    keyLessons: [
      'بيان أصناف الناس الثلاثة: المؤمنون، الكافرون، والمنافقون.',
      'عظمة آية الكرسي وسعتها في إثبات الألوهية والربوبية والقيومية التامة.',
      'الاستجابة المطلقة لأوامر الله وترك التردد والتشديد كما فعل بنو إسرائيل.',
      'الدعاء الجامع في خواتيم السورة (ربنا لا تؤاخذنا إن نسينا أو أخطأنا).'
    ]
  },
  {
    id: 'vid_imran',
    surahNumber: 3,
    surahName: 'آل عمران',
    title: 'فضائل الزهراوين (البقرة وآل عمران) ومواقف النزول',
    speakerName: 'الشيخ صالح المغامسي',
    durationText: '25 دقيقة',
    audioSampleSurah: 3,
    audioSampleAyah: 18,
    description: 'تحليل دقيق لأسباب نزول أوائل سورة آل عمران في وفد نصارى نجران، وأحداث غزوة أحد، وتثبيت قلوب المؤمنين في الأزمات.',
    virtueText: 'قال النبي ﷺ: "اقرءوا الزهراوين: البقرة وسورة آل عمران، فإنهما تأتيان يوم القيامة كأنهما غمامتان تظللان صاحبهما".',
    asbabNuzulDetail: 'نزلت الآيات الثمانون الأولى من سورة آل عمران حين قدم وفد نجران إلى المدينة النبوية لمحاجة النبي ﷺ في شأن عيسى بن مريم عليه السلام، فأنزل الله الآيات البينات التي تبين حقيقة التوحيد وتنزه الله عن الولد والشريك.',
    keyLessons: [
      'الثبات على الحق والتمسك بالمحكم من كتاب الله والحذر من اتباع المتشابه.',
      'دروس وعبر غزوة أحد وأهمية طاعة القيادة النبوية والتوبة من الذنوب.',
      'علو منزلة الشهداء وفضل الصبر والرباط في سبيل الله.',
      'التفكر في خلق السماوات والأرض واختلاف الليل والنهار (أولو الألباب).'
    ]
  },
  {
    id: 'vid_kahf',
    surahNumber: 18,
    surahName: 'الكهف',
    title: 'قصص سورة الكهف الأربع وأسباب النزول في أسئلة قريش',
    speakerName: 'د. أيمن سويد (معاني وتجويد)',
    durationText: '40 دقيقة',
    audioSampleSurah: 18,
    audioSampleAyah: 1,
    description: 'قصة أصحاب الكهف، صاحب الجنتين، موسى والخضر، وذي القرنين، وسياق نزولها للرد على تساؤلات المشركين واليهود.',
    virtueText: 'قال النبي ﷺ: "من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين".',
    asbabNuzulDetail: 'نزلت سورة الكهف حين بعثت قريش النضر بن الحارث وعقبة بن أبي معيط إلى أحبار يهود بالمدينة ليسألوهم عن النبي ﷺ، فقالوا: سلوه عن ثلاث: فتية ذهبوا في الدهر الأول، وعن رجل طوّاف بلغ مشرق الأرض ومغربها، وعن الروح، فأنزل الله سورة الكهف تفصيلاً لقصصهم.',
    keyLessons: [
      'الاعتصام بالصحبة الصالحة للنجاة من فتنة الدين.',
      'شكر النعم وعدم الاغترار بالمال والجاه للنجاة من فتنة المال.',
      'التواضع في طلب العلم ومعرفة أن حكمة الله فوق علم البشر.',
      'استخدام القوة والتمكين في نشر العدل وخدمة الخلق للنجاة من فتنة السلطة.'
    ]
  },
  {
    id: 'vid_mulk',
    surahNumber: 67,
    surahName: 'الملك',
    title: 'سورة الملك المانعة والمنجية من عذاب القبر',
    speakerName: 'د. عمر عبد الكافي',
    durationText: '20 دقيقة',
    audioSampleSurah: 67,
    audioSampleAyah: 1,
    description: 'وقفات تدبرية عميقة في آيات سورة الملك ودلائل عظمة الخالق وإتقان الصنع، وفضل المداومة عليها قبل النوم.',
    virtueText: 'قال النبي ﷺ: "سورة من القرآن ثلاثون آية شفعت لرجل حتى غفر له: تبارك الذي بيده الملك".',
    asbabNuzulDetail: 'سورة الملك مكية بإجماع المفسرين، نزلت لترسيخ عقيدة البعث والنشور وتذكير الناس بملكوت الله وقدرته المطلقة على الإحياء والإماتة، وتحدي الخلق بالنظر في خلق الرحمن هل يرون فيه من نقص أو فطور.',
    keyLessons: [
      'الغاية من خلق الموت والحياة هي الابتلاء بالعمل الصالح الخالص لله.',
      'التفكر في إتقان السماوات السبع ودقة الخلق الكوني العظيم.',
      'الخشية من الله بالغيب ومجازاة المؤمنين بالمغفرة والأجر الكبير.'
    ]
  }
];

interface SurahAsbabNuzulVideoLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSurahNumber?: number;
}

export const SurahAsbabNuzulVideoLibrary: React.FC<SurahAsbabNuzulVideoLibraryProps> = ({
  isOpen,
  onClose,
  selectedSurahNumber = 1,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeVideo, setActiveVideo] = useState<SurahLectureVideo>(
    SAMPLE_LECTURES.find((v) => v.surahNumber === selectedSurahNumber) || SAMPLE_LECTURES[0]
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handlePlayAudio = () => {
    if (isPlayingAudio && audioObj) {
      audioObj.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (audioObj) {
      audioObj.pause();
    }

    const url = getAyahAudioUrl(activeVideo.audioSampleSurah, activeVideo.audioSampleAyah, 'afasy');
    const audio = new Audio(url);
    audio.onended = () => setIsPlayingAudio(false);
    audio.play().then(() => {
      setIsPlayingAudio(true);
      setAudioObj(audio);
    }).catch(e => console.warn(e));
  };

  const filteredLectures = SAMPLE_LECTURES.filter(
    (item) =>
      item.surahName.includes(searchQuery) ||
      item.title.includes(searchQuery) ||
      item.speakerName.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl max-w-4xl w-full p-5 sm:p-7 space-y-6 text-white shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800/80 text-amber-300 rounded-2xl border border-emerald-500/40 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-400 block uppercase tracking-wider">
                المكتبة المرئية والمسموعة للأكاديمية
              </span>
              <h3 className="text-lg sm:text-xl font-black font-serif text-white">
                دروس ومحاضرات تدبر القرآن الكريم وأسباب النزول
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              if (audioObj) audioObj.pause();
              onClose();
            }}
            className="p-2 bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 text-slate-300 rounded-xl transition-all border border-slate-700"
            title="إغلاق المكتبة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TWO-COLUMN LAYOUT: MAIN LESSON VIEWER (7 cols) & LECTURE LIST (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* MAIN LESSON VIEWER (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Visual Islamic Presentation Stage */}
            <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 rounded-3xl border-2 border-amber-400/40 p-6 shadow-inner space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-emerald-800/70 pb-3">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-serif">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  محاضرة تدبر: سورة {activeVideo.surahName}
                </span>
                <span className="text-[11px] bg-emerald-900/90 text-emerald-200 px-3 py-1 rounded-full border border-emerald-600 font-bold">
                  {activeVideo.speakerName}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-base sm:text-lg text-white font-serif leading-snug">
                  {activeVideo.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {activeVideo.description}
                </p>
              </div>

              {/* Audio Listen Quick Bar */}
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-300">استمع لافتتاحية السورة المباركة:</span>
                </div>
                <button
                  onClick={handlePlayAudio}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow ${
                    isPlayingAudio
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? 'إيقاف التلاوة' : 'تشغيل التلاوة 🎧'}</span>
                </button>
              </div>

              {/* VIRTUE HIGHLIGHT BOX */}
              <div className="p-3.5 bg-amber-400/10 rounded-2xl border border-amber-400/30 text-xs text-amber-200 space-y-1 font-serif">
                <span className="font-bold block text-[11px] text-amber-400">✨ فضل سورة {activeVideo.surahName}:</span>
                <p className="leading-relaxed">"{activeVideo.virtueText}"</p>
              </div>

              {/* ASBAB AN-NUZUL ACCORDION */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-emerald-700/40 text-xs space-y-2">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  سبب نزول السورة وسياقها التاريخي:
                </span>
                <p className="text-slate-300 leading-relaxed text-justify">
                  {activeVideo.asbabNuzulDetail}
                </p>
              </div>

              {/* KEY LESSONS BULLETS */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  أهم الهدايات والدروس المستفادة:
                </span>
                <ul className="space-y-1.5 text-slate-200">
                  {activeVideo.keyLessons.map((lesson, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* LECTURES LIST (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن سورة أو درس تدبر..."
                className="w-full pl-3 pr-10 py-2.5 bg-slate-950 text-white text-xs font-bold rounded-2xl border border-slate-700 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredLectures.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => {
                    if (audioObj) audioObj.pause();
                    setIsPlayingAudio(false);
                    setActiveVideo(vid);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeVideo.id === vid.id
                      ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-white border-amber-400 shadow-lg scale-[1.01]'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-emerald-500 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-amber-300 block">سورة {vid.surahName}</span>
                    <h5 className="font-bold text-xs line-clamp-1">{vid.title}</h5>
                    <span className="text-[10px] text-slate-400 block">{vid.durationText} • {vid.speakerName}</span>
                  </div>

                  <div className={`p-2 rounded-xl shrink-0 ${activeVideo.id === vid.id ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
