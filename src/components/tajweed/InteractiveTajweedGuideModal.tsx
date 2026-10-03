import React, { useState } from 'react';
import {
  Volume2,
  X,
  BookOpen,
  Sparkles,
  Info,
  CheckCircle2,
  Play,
  Award,
  Layers,
  Search
} from 'lucide-react';

export interface TajweedRuleTopic {
  id: string;
  category: 'makharij' | 'sifat' | 'rules';
  titleName: string; // e.g. "مخرج الجوف واللسان"
  letters: string[]; // e.g. ["أ", "و", "ي"]
  explanation: string;
  exampleAyah: string;
  audioSampleUrl: string;
  diagramColor: string;
}

const TAJWEED_TOPICS: TajweedRuleTopic[] = [
  {
    id: 't_1',
    category: 'makharij',
    titleName: 'مخرج الجوف (حروف المد الثلاثة)',
    letters: ['ا', 'و', 'ي'],
    explanation: 'الجوف هو الخلاء الممتد داخل الحلق والفم، وتخرج منه حروف المد الثلاثة بشرط أن تكون ساكنة ومفتوحاً ما قبل الألف ومضموم ما قبل الواو ومكسور ما قبل الياء.',
    exampleAyah: 'قَالُوا يَا مُوسَىٰ إِ نَّا لَن نَّدْخُلَهَا أَبَدًا',
    audioSampleUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
    diagramColor: 'bg-amber-500',
  },
  {
    id: 't_2',
    category: 'makharij',
    titleName: 'مخرج الحلق (الحروف الحلقية الستة)',
    letters: ['ء', 'هـ', 'ع', 'ح', 'غ', 'خ'],
    explanation: 'ينقسم الحلق إلى ثلاثة أجزاء: أقصى الحلق (الهمزة والهاء)، وسط الحلق (العين والحاء)، وأدنى الحلق (الغين والخاء).',
    exampleAyah: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ',
    audioSampleUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3',
    diagramColor: 'bg-emerald-600',
  },
  {
    id: 't_3',
    category: 'rules',
    titleName: 'حكم الإخفاء الحقيقي والغنة',
    letters: ['ص', 'ذ', 'ث', 'ك', 'ج', 'ش', 'ق', 'س', 'د', 'ط', 'ز', 'ف', 'ت', 'ض', 'ظ'],
    explanation: 'الإخفاء هو نطق بالحرف بين الإظهار والإدغام عارياً عن التشديد مع بقاء الغنة في الحرف الأول عند التقائه بحروف الإخفاء الـ 15.',
    exampleAyah: 'مِن شَرِّ مَا خَلَقَ • وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
    audioSampleUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6232.mp3',
    diagramColor: 'bg-teal-600',
  },
  {
    id: 't_4',
    category: 'rules',
    titleName: 'حروف القلقلة والاضطراب (قطب جد)',
    letters: ['ق', 'ط', 'ب', 'ج', 'د'],
    explanation: 'القلقلة هي اضطراب المخرج عند النطق بالحرف الساكن حتى يُسمع له نبرة قوية. ومراتبها: قلقلة كبرى عند الوقف وقلقلة صغرى في وسط الكلام.',
    exampleAyah: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ • مِن شَرِّ مَا خَلَقَ',
    audioSampleUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6226.mp3',
    diagramColor: 'bg-rose-600',
  },
];

interface InteractiveTajweedGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveTajweedGuideModal: React.FC<InteractiveTajweedGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTopic, setActiveTopic] = useState<TajweedRuleTopic>(TAJWEED_TOPICS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePlaySample = () => {
    setIsPlayingAudio(true);
    const audio = new Audio(activeTopic.audioSampleUrl);
    audio.play();
    audio.onended = () => setIsPlayingAudio(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-amber-300 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl absolute top-6 left-6"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-black px-3.5 py-1 rounded-full border border-amber-300">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>دليل التجويد المباشر ومخارج الحروف 📖</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900 dark:text-white">
            شرح مخارج الحروف وأحكام التلاوة التفاعلي
          </h3>
        </div>

        {/* TOPICS TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-3">
          {TAJWEED_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(topic)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all border ${
                activeTopic.id === topic.id
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {topic.titleName}
            </button>
          ))}
        </div>

        {/* TOPIC DETAIL CARD */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-lg font-serif text-slate-900 dark:text-amber-200">
              {activeTopic.titleName}
            </h4>
            
            <button
              onClick={handlePlaySample}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all ${
                isPlayingAudio ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingAudio ? 'جاري استماع النموذج الصوتية...' : 'استماع للنموذج الصوتي 🎙️'}</span>
            </button>
          </div>

          {/* LETTERS BADGES */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500">حروف المخرج:</span>
            {activeTopic.letters.map((letter, idx) => (
              <span
                key={idx}
                className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center font-serif shadow-xs"
              >
                {letter}
              </span>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-medium">
            {activeTopic.explanation}
          </p>

          {/* EXAMPLE AYAH BOX */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-amber-300/80 text-center space-y-1">
            <span className="text-[10px] text-amber-800 font-bold block">مثال من القرآن الكريم:</span>
            <p className="text-lg font-black font-serif text-slate-900 dark:text-amber-100">
              "{activeTopic.exampleAyah}"
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
