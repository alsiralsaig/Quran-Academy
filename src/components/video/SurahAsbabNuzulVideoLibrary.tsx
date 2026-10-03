import React, { useState } from 'react';
import {
  Video,
  Play,
  BookOpen,
  Sparkles,
  Search,
  X,
  CheckCircle2,
  Share2,
  Clock,
  Award
} from 'lucide-react';
import { ALL_SURAHS } from '../../data/quranData';

export interface SurahLectureVideo {
  id: string;
  surahNumber: number;
  surahName: string;
  title: string;
  speakerName: string;
  durationText: string;
  videoEmbedUrl: string;
  description: string;
  virtueText: string;
}

const SAMPLE_LECTURES: SurahLectureVideo[] = [
  {
    id: 'vid_fatiha',
    surahNumber: 1,
    surahName: 'الفاتحة',
    title: 'أسرار وفضائل سورة الفاتحة أم الكتاب والسبع المثاني',
    speakerName: 'د. بدر المطرود',
    durationText: '18 دقيقة',
    videoEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'محاضرة شاملة توضح تسميات سورة الفاتحة وأسباب نزولها ومكانتها الشريفة في الصلاة وتفريج الهموم.',
    virtueText: 'قال النبي ﷺ: "هي أم القرآن وهي السبع المثاني وهي القرآن العظيم الذي أوتيته".',
  },
  {
    id: 'vid_baqarah',
    surahNumber: 2,
    surahName: 'البقرة',
    title: 'أسباب نزول سورة البقرة وفضل آية الكرسي وخواتيم السورة',
    speakerName: 'الشيخ عثمان الخميس',
    durationText: '35 دقيقة',
    videoEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'شرح مفصل لأسباب نزول أواخر سورة البقرة وفضل قراءتها في البيوت لطرد الشياطين وجلب البركة.',
    virtueText: 'قال النبي ﷺ: "اقرءوا سورة البقرة، فإن أخذها بركة، وتركها حسرة، ولا تستطيعها البطلة".',
  },
  {
    id: 'vid_imran',
    surahNumber: 3,
    surahName: 'آل عمران',
    title: 'فضائل الزهراوين (البقرة وآل عمران) ومواقف النزول',
    speakerName: 'د. عمر عبد الكافي',
    durationText: '25 دقيقة',
    videoEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'تحليل دقيق للآيات الخمس عشرة الأولى وسياق نزولها في وفد نجران ودحض الشبهات.',
    virtueText: 'قال النبي ﷺ: "اقرءوا الزهراوين: البقرة وسورة آل عمران، فإنهما تأتيان يوم القيامة كأنهما غيابتان".',
  },
  {
    id: 'vid_kahf',
    surahNumber: 18,
    surahName: 'الكهف',
    title: 'قصص سورة الكهف الأربع وأسباب النزول في أسئلة قريش',
    speakerName: 'د. نبيل العوضي',
    durationText: '40 دقيقة',
    videoEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'قصة أصحاب الكهف، صاحب الجنتين، موسى والخضر، وذي القرنين وسياق نزولها للرد على المشركين.',
    virtueText: 'قال النبي ﷺ: "من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين".',
  },
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

  if (!isOpen) return null;

  const filteredLectures = SAMPLE_LECTURES.filter(
    (item) =>
      item.surahName.includes(searchQuery) ||
      item.title.includes(searchQuery) ||
      item.speakerName.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 border border-emerald-300 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl absolute top-6 left-6"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-xs font-black px-3.5 py-1 rounded-full border border-emerald-300">
            <Video className="w-4 h-4 text-emerald-600" />
            <span>مكتبة الفيديو لأسباب النزول وفضائل السور 🎥</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900 dark:text-white">
            دروس ومحاضرات تدبر القرآن الكريم وأسباب النزول
          </h3>
        </div>

        {/* TWO-COLUMN LAYOUT: PLAYER (7 cols) & LECTURE LIST (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* MAIN PLAYER (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-800 relative flex items-center justify-center">
              <iframe
                src={activeVideo.videoEmbedUrl}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full inline-block">
                سورة {activeVideo.surahName} • {activeVideo.speakerName}
              </span>
              <h4 className="font-extrabold text-sm font-serif text-slate-900 dark:text-white">
                {activeVideo.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                {activeVideo.description}
              </p>

              {/* VIRTUE HIGHLIGHT BOX */}
              <div className="p-3 bg-amber-50 dark:bg-slate-900 rounded-xl border border-amber-300/80 text-xs font-serif text-amber-950 dark:text-amber-200 space-y-1">
                <span className="font-black block text-[10px] text-amber-800">فضل سورة {activeVideo.surahName}:</span>
                <p>"{activeVideo.virtueText}"</p>
              </div>
            </div>
          </div>

          {/* LECTURES LIST (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن سورة أو محاضر..."
                className="w-full pl-3 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold rounded-xl border"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredLectures.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeVideo.id === vid.id
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold block">سورة {vid.surahName}</span>
                    <h5 className="font-bold text-xs line-clamp-1">{vid.title}</h5>
                    <span className="text-[10px] opacity-80 block">{vid.durationText} • {vid.speakerName}</span>
                  </div>

                  <Play className="w-4 h-4 shrink-0" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
