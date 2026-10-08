import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Volume2,
  Play,
  Pause,
  X,
  Sparkles,
  CheckCircle2,
  Award,
  Video,
  Image as ImageIcon,
  HelpCircle,
  ChevronRight,
  Eye
} from 'lucide-react';
import { TAJWEED_RULES, TajweedRule } from '../../data/tajweedData';
import { getAyahAudioUrl } from '../../data/quranData';

interface TajweedGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNightMode?: boolean;
}

export const TajweedGuideModal: React.FC<TajweedGuideModalProps> = ({ isOpen, onClose, isNightMode = false }) => {
  const [activeMainTab, setActiveMainTab] = useState<'rules' | 'diagrams' | 'videos'>('rules');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingRuleId, setPlayingRuleId] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlayAudioSample = (rule: TajweedRule) => {
    if (playingRuleId === rule.id) {
      if (audioObj) {
        audioObj.pause();
        setPlayingRuleId(null);
      }
      return;
    }

    if (audioObj) {
      audioObj.pause();
    }

    const newAudio = new Audio(rule.audioSampleUrl);
    newAudio.play().catch(() => {
      alert(`جاري الاستماع لنموذج ${rule.ruleName}`);
    });

    setAudioObj(newAudio);
    setPlayingRuleId(rule.id);

    newAudio.onended = () => {
      setPlayingRuleId(null);
    };
  };

  const filteredRules = TAJWEED_RULES.filter((rule) => {
    const matchesCat = selectedCategory === 'all' || rule.category === selectedCategory;
    const matchesSearch =
      rule.ruleName.includes(searchQuery) ||
      rule.letters.includes(searchQuery) ||
      rule.definition.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  // Visual Diagrams for Makharij Al Huroof (مخارج الحروف والرسم التوضيحي)
  const MAKHARJ_DIAGRAMS = [
    {
      id: 'm1',
      title: 'مخرج الخيشوم (صوت الغنة)',
      sub: 'النون والميم المشددتان والمخفاتان',
      desc: 'الخيشوم هو التجويف الأنفى الداخلي، ويخرج منه صوت الغنة الرخيم بمقدار حركتين في حالات الإدغام والإخفاء والإقلاب.',
      svgBg: 'from-amber-500/20 to-emerald-500/20',
      colorBadge: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      id: 'm2',
      title: 'مخرج أقصى الحلق (حروف الإظهار)',
      sub: 'الهمزة، الهـاء، العين، الحاء، الغين، الخاء',
      desc: 'تخرج حروف الإظهار الحلقي الستة من أدنى وأوسط وأقصى الحلق دون زيادة في الغنة.',
      svgBg: 'from-emerald-500/20 to-teal-500/20',
      colorBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    {
      id: 'm3',
      title: 'مخرج الشفتان (الميم والباء والواو والفاء)',
      sub: 'الإخفاء الشفوي والإظهار الشفوي',
      desc: 'تخرج الميم والباء بانطباق الشفتين، والفاء بلامسة أطراف الثنايا العليا لبطن الشفة السفلى.',
      svgBg: 'from-blue-500/20 to-indigo-500/20',
      colorBadge: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    {
      id: 'm4',
      title: 'مخرج اللسان وحروف القلقلة',
      sub: 'قطب جد (ق، ط، ب، ج، د)',
      desc: 'تحدث القلقلة نتيجة اضطراب وانفكاك المخرج الساكن بقوة ليصدر صوتاً جهورياً متميزاً.',
      svgBg: 'from-rose-500/20 to-purple-500/20',
      colorBadge: 'bg-rose-100 text-rose-900 border-rose-300',
    },
  ];

  // Short Audio/Visual Lesson Modules
  const VIDEO_LESSONS = [
    {
      id: 'v1',
      title: 'شرح مبسط لأحكام النون الساكنة والتنوين 🎙️',
      duration: '04:15 دقيقة',
      instructor: 'الشيخ د. أيمن سويد',
      summary: 'درس توضيحي يسير يشرح الفرق بين الإظهار والإدغام والإقلاب والإخفاء بالأمثلة التفاعلية وطريقة التطبيق العملي عند التلاوة.',
      audioSurah: 112,
      audioAyah: 1,
    },
    {
      id: 'v2',
      title: 'كيفية نطق صفة القلقلة وتطبيقها العملي 🎙️',
      duration: '03:30 دقيقة',
      instructor: 'الشيخ محمود خليل الحصري',
      summary: 'درس استعراضي يوضح مراتب القلقلة الصغرى والكبرى (قطب جد) وكيفية تجنب تحريك الحرف الساكن أو مطّه.',
      audioSurah: 113,
      audioAyah: 1,
    },
    {
      id: 'v3',
      title: 'مقياس أزمنة المدود وحركاتها (2 و4 و6 حركات) 🎙️',
      duration: '05:10 دقيقة',
      instructor: 'المعلمة المشرفة بالأكاديمية',
      summary: 'توضيح مقادير المدود المتصلة والمنفصلة واللازمة مع بيان مقدار الحركة الواحدة وضبط النفس والترتيل.',
      audioSurah: 1,
      audioAyah: 7,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div
        className={`rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between overflow-y-auto ${
          isNightMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-emerald-100 text-slate-900'
        }`}
      >
        <div className="space-y-6">
          
          {/* Top Header Bar */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-700 text-white rounded-2xl shadow-md">
                <BookOpen className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
                    دليل التجويد الميسر والرسوم التوضيحية 📖
                  </span>
                </div>
                <h3 className="font-extrabold text-xl font-serif mt-0.5">
                  دليل أحكام التجويد المبسط بالشروحات المرئية والصوتية
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Tabs Navigation (Rules, Diagrams, Video Tutorials) */}
          <div className="flex items-center gap-2 border-b pb-3">
            <button
              onClick={() => setActiveMainTab('rules')}
              className={`px-4 py-2 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 ${
                activeMainTab === 'rules'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>الأحكام التجويدية والأمثلة ({TAJWEED_RULES.length})</span>
            </button>

            <button
              onClick={() => setActiveMainTab('diagrams')}
              className={`px-4 py-2 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 ${
                activeMainTab === 'diagrams'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-amber-300" />
              <span>الرسوم التوضيحية لمخارج الحروف 🎨</span>
            </button>

            <button
              onClick={() => setActiveMainTab('videos')}
              className={`px-4 py-2 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 ${
                activeMainTab === 'videos'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Video className="w-4 h-4 text-amber-300" />
              <span>الفيديوهات والدروس القصيرة ({VIDEO_LESSONS.length}) 🎬</span>
            </button>
          </div>

          {/* TAB 1: TAJWEED RULES & AUDIO SAMPLES */}
          {activeMainTab === 'rules' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم الحكم أو الحروف..."
                    className={`w-full pr-9 pl-3 py-2.5 border rounded-xl font-bold focus:outline-none ${
                      isNightMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto overflow-x-auto text-[11px] font-bold">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    جميع الأحكام
                  </button>
                  <button
                    onClick={() => setSelectedCategory('nun_sakinah')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === 'nun_sakinah'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    النون الساكنة
                  </button>
                  <button
                    onClick={() => setSelectedCategory('madd')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === 'madd'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    المدود
                  </button>
                  <button
                    onClick={() => setSelectedCategory('qalqalah')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === 'qalqalah'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    القلقلة
                  </button>
                </div>
              </div>

              {/* Rules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1 text-xs">
                {filteredRules.map((rule) => {
                  const isPlaying = playingRuleId === rule.id;

                  return (
                    <div
                      key={rule.id}
                      className={`p-5 rounded-2xl border space-y-3 transition-all ${
                        isNightMode
                          ? 'bg-slate-900 border-slate-800'
                          : 'bg-slate-50/80 border-slate-200/90 hover:bg-white hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${rule.badgeColor}`}
                          >
                            {rule.categoryTitle}
                          </span>
                          <h4 className="font-extrabold text-sm font-serif text-emerald-800 dark:text-emerald-400">
                            {rule.ruleName}
                          </h4>
                        </div>

                        <button
                          onClick={() => handlePlayAudioSample(rule)}
                          className={`px-3 py-1 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all shrink-0 ${
                            isPlaying
                              ? 'bg-amber-500 text-slate-950 shadow-md'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          }`}
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                          {isPlaying ? 'إيقاف الاستماع' : 'استماع للنموذج'}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="font-bold text-slate-500 dark:text-slate-400 text-[10px] block">
                            حروف الحكم:
                          </span>
                          <span className="font-bold text-amber-700 dark:text-amber-400 text-xs font-mono">
                            {rule.letters}
                          </span>
                        </div>

                        <div>
                          <span className="font-bold text-slate-500 dark:text-slate-400 text-[10px] block">
                            الشرح والتعريف:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                            {rule.definition}
                          </p>
                        </div>

                        <div className="bg-emerald-50/60 dark:bg-slate-950 p-3 rounded-xl border border-emerald-200/60 dark:border-slate-800 space-y-1">
                          <span className="font-bold text-emerald-900 dark:text-emerald-300 block text-[10px]">
                            مثال تطبيقي من القرآن الكريم ({rule.quranExampleSurah}):
                          </span>
                          <p className="font-serif font-bold text-base text-emerald-950 dark:text-amber-200">
                            "{rule.quranExampleText}"
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL DIAGRAMS FOR MAKHARJ AL HUROOF */}
          {activeMainTab === 'diagrams' && (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              <div className="p-4 bg-amber-50 dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-amber-900 dark:text-amber-300 text-xs font-serif">
                    الرسوم التوضيحية لمخارج الحروف وتصفية الصوت 🎨
                  </h4>
                  <p className="text-[11px] text-amber-800/80 dark:text-slate-300">
                    رسومات توضيحية لضبط خروج الحرف من الجوف، الحلق، اللسان، الشفتين، والخيشوم.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MAKHARJ_DIAGRAMS.map((diag) => (
                  <div
                    key={diag.id}
                    className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${diag.colorBadge}`}>
                        {diag.sub}
                      </span>
                    </div>

                    {/* Graphic Box */}
                    <div className={`h-28 rounded-2xl bg-gradient-to-r ${diag.svgBg} flex items-center justify-center p-4 border text-center`}>
                      <div className="space-y-1">
                        <ImageIcon className="w-8 h-8 text-emerald-700 dark:text-amber-400 mx-auto" />
                        <span className="font-serif font-extrabold text-sm text-slate-900 dark:text-white block">
                          {diag.title}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {diag.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LESSONS WITH AUDIO EXAMPLES */}
          {activeMainTab === 'videos' && (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              <div className="p-4 bg-emerald-50 dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-slate-800">
                <h4 className="font-extrabold text-emerald-900 dark:text-emerald-300 text-xs font-serif">
                  شروحات تجويدية مسموعة وتطبيقات عملية 🎙️
                </h4>
                <p className="text-[11px] text-emerald-800/80 dark:text-slate-300">
                  دروس صوتية تطبيقية لكبار علماء التجويد لضبط النطق الصحيح وتطبيق الأحكام.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {VIDEO_LESSONS.map((vid) => {
                  const isPlayingThis = playingRuleId === vid.id;

                  return (
                    <div
                      key={vid.id}
                      className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            {vid.duration}
                          </span>
                          <span className="text-slate-500 font-bold">{vid.instructor}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white font-serif">
                          {vid.title}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                          {vid.summary}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (isPlayingThis && audioObj) {
                            audioObj.pause();
                            setPlayingRuleId(null);
                            return;
                          }
                          if (audioObj) audioObj.pause();
                          const url = getAyahAudioUrl(vid.audioSurah, vid.audioAyah, 'husary');
                          const audio = new Audio(url);
                          audio.onended = () => setPlayingRuleId(null);
                          audio.play().catch(e => console.warn(e));
                          setAudioObj(audio);
                          setPlayingRuleId(vid.id);
                        }}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-md shrink-0 flex items-center gap-1.5 transition-all ${
                          isPlayingThis
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        {isPlayingThis ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                        <span>{isPlayingThis ? 'إيقاف الاستماع' : 'استماع للتطبيق العملي 🎧'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t pt-3 flex justify-between items-center text-xs">
          <span className="text-slate-400">إشراف أكاديمية إتقان لتحفيظ القرآن الكريم</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md"
          >
            إغلاق الدليل
          </button>
        </div>

      </div>
    </div>
  );
};
