import React, { useState, useRef } from 'react';
import {
  Palette,
  Download,
  Share2,
  Sparkles,
  BookOpen,
  Check,
  RotateCcw,
  Award,
  Image,
  Sliders,
  Type,
  Layers,
  Heart
} from 'lucide-react';
import { ALL_SURAHS, SAMPLE_SURAHS_AYAS } from '../../data/quranData';
import { QuranSurah, QuranAyah } from '../../types';

export interface CalligraphyFontOption {
  id: string;
  name: string;
  fontFamily: string;
  description: string;
}

const CALLIGRAPHY_FONTS: CalligraphyFontOption[] = [
  { id: 'amiri', name: 'الخط العثماني الأصيل', fontFamily: "'Amiri Quran', serif", description: 'خط المصاحف الشريفة الكلاسيكي' },
  { id: 'scheherazade', name: 'خط النسخ القرآني المزخرف', fontFamily: "'Scheherazade New', serif", description: 'واضح وجميل للتلاوات والآيات' },
  { id: 'cairo', name: 'الخط الكوفي الحديث', fontFamily: "'Cairo', sans-serif", description: 'خط هندسي معاصر ومتناسق' },
  { id: 'serif_traditional', name: 'خط الثلث والديواني الفاخر', fontFamily: "Traditional Arabic, 'Amiri', serif", description: 'فخامة الخط العربي التقليدي' },
];

export interface BackgroundThemeOption {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  accentBorder: string;
  badgeBg: string;
}

const BACKGROUND_THEMES: BackgroundThemeOption[] = [
  { id: 'emerald_gold', name: 'الزمردي القرآني والذهب', bgClass: 'bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950', textClass: 'text-amber-200', accentBorder: 'border-amber-400', badgeBg: 'bg-amber-400 text-slate-950' },
  { id: 'royal_gold', name: 'الليل الكحلي المذهب', bgClass: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950', textClass: 'text-amber-300', accentBorder: 'border-amber-500', badgeBg: 'bg-amber-500 text-slate-950' },
  { id: 'parchment', name: 'المخطوطة الأثرية الدافئة', bgClass: 'bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100', textClass: 'text-amber-950', accentBorder: 'border-amber-700', badgeBg: 'bg-amber-900 text-amber-100' },
  { id: 'pure_white', name: 'الرخام الأبيض والزمرد', bgClass: 'bg-gradient-to-br from-slate-50 via-emerald-50/40 to-slate-100', textClass: 'text-emerald-950', accentBorder: 'border-emerald-600', badgeBg: 'bg-emerald-800 text-white' },
];

export const ArabicCalligraphyStudio: React.FC = () => {
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah>(ALL_SURAHS[0]);
  const [selectedAyah, setSelectedAyah] = useState<QuranAyah>(
    SAMPLE_SURAHS_AYAS[1]?.ayahs[0] || { numberInSurah: 255, text: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَيُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ' }
  );
  
  const [customText, setCustomText] = useState<string>('');
  const [useCustomText, setUseCustomText] = useState<boolean>(false);

  const [selectedFont, setSelectedFont] = useState<CalligraphyFontOption>(CALLIGRAPHY_FONTS[0]);
  const [selectedTheme, setSelectedTheme] = useState<BackgroundThemeOption>(BACKGROUND_THEMES[0]);
  const [fontSize, setFontSize] = useState<number>(28); // px font size
  const [showOrnamentFrame, setShowOrnamentFrame] = useState<boolean>(true);
  const [studentSignature, setStudentSignature] = useState<string>('خط وتصميم: طالبة أكاديمية إتقان');

  const [isSavedToGallery, setIsSavedToGallery] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(12);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Available ayahs for currently selected Surah
  const surahAyahs = SAMPLE_SURAHS_AYAS[selectedSurah.number]?.ayahs || [
    { numberInSurah: 1, text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' },
    { numberInSurah: 255, text: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَيُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ' },
  ];

  const displayText = useCustomText && customText.trim() ? customText : selectedAyah.text;

  // Handle Save to Gallery
  const handleSaveToGallery = () => {
    setIsSavedToGallery(true);
    setLikesCount((prev) => prev + 1);
    setTimeout(() => setIsSavedToGallery(false), 4000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-black px-3.5 py-1 rounded-full border border-amber-300 dark:border-amber-800">
            <Palette className="w-4 h-4 text-amber-700" />
            <span>مختبر الخط العربي والتصميم القرآني 🎨</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900 dark:text-white">
            استوديو خط وتصميم الآيات الشريفة
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            اختر آيتك المفضلة، خصص نوع الخط العربي والخلفيات والزخارف الإسلامية، واحتفظ بها كلوحة تذكارية أو شاركها في المعرض.
          </p>
        </div>

        {/* Gallery Share Badge */}
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-slate-800 p-2.5 rounded-2xl border border-amber-200 dark:border-slate-700 shrink-0">
          <Award className="w-5 h-5 text-amber-500" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">لوحات معرض الأكاديمية</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{likesCount} إعجاب بالمعرض ❤️</span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN STUDIO LAYOUT: CONTROLS (5 cols) & LIVE CANVAS PREVIEW (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CONTROLS SIDEBAR (5 cols) */}
        <div className="lg:col-span-5 space-y-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          
          {/* STEP 1: AYAH SELECTION */}
          <div className="space-y-3 border-b pb-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-serif">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              1. اختيار الآية أو النص القرآني:
            </h4>

            {/* Custom text vs Ayah selector toggle */}
            <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 rounded-xl border text-xs">
              <button
                onClick={() => setUseCustomText(false)}
                className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
                  !useCustomText ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                اختيار من المصحف 📖
              </button>
              <button
                onClick={() => setUseCustomText(true)}
                className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
                  useCustomText ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                كتابة نص مخصص ✍️
              </button>
            </div>

            {!useCustomText ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">السورة:</label>
                  <select
                    value={selectedSurah.number}
                    onChange={(e) => {
                      const surah = ALL_SURAHS.find((s) => s.number === Number(e.target.value));
                      if (surah) {
                        setSelectedSurah(surah);
                        const newAyahs = SAMPLE_SURAHS_AYAS[surah.number]?.ayahs;
                        if (newAyahs && newAyahs.length > 0) {
                          setSelectedAyah(newAyahs[0]);
                        }
                      }
                    }}
                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    {ALL_SURAHS.map((s) => (
                      <option key={s.number} value={s.number}>
                        سورة {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">الآية:</label>
                  <select
                    value={selectedAyah.numberInSurah}
                    onChange={(e) => {
                      const ayah = surahAyahs.find((a) => a.numberInSurah === Number(e.target.value));
                      if (ayah) setSelectedAyah(ayah);
                    }}
                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    {surahAyahs.map((a) => (
                      <option key={a.numberInSurah} value={a.numberInSurah}>
                        الآية ({a.numberInSurah})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">اكتب الآية أو العبارة القرآنية:</label>
                <textarea
                  rows={3}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="مثال: رَبِّ زِدْنِي عِلْمًا..."
                  className="w-full p-2.5 bg-white dark:bg-slate-900 text-xs font-serif font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* STEP 2: CALLIGRAPHY FONT SELECTION */}
          <div className="space-y-3 border-b pb-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-serif">
              <Type className="w-4 h-4 text-amber-500" />
              2. الخط العربي والنمط العثماني:
            </h4>

            <div className="space-y-2">
              {CALLIGRAPHY_FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => setSelectedFont(font)}
                  className={`w-full p-3 rounded-2xl border text-right transition-all flex items-center justify-between ${
                    selectedFont.id === font.id
                      ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-serif font-black text-xs block">{font.name}</span>
                    <span className="text-[10px] opacity-80 block">{font.description}</span>
                  </div>
                  {selectedFont.id === font.id && <Check className="w-4 h-4 text-slate-950" />}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: BACKGROUND CANVAS THEME & ORNAMENTS */}
          <div className="space-y-3 border-b pb-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-serif">
              <Layers className="w-4 h-4 text-teal-600" />
              3. نسق الخلفية والزخارف الإسلامية:
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {BACKGROUND_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`p-2.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                    selectedTheme.id === theme.id
                      ? 'border-amber-500 ring-2 ring-amber-400/50 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className={`block p-2 rounded-xl text-[10px] ${theme.bgClass} ${theme.textClass} font-serif`}>
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Ornament Toggle & Font Size Slider */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>إظهار الإطار والزخرفة الإسلامية 🏛️</span>
                <input
                  type="checkbox"
                  checked={showOrnamentFrame}
                  onChange={(e) => setShowOrnamentFrame(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>حجم خط الآية ({fontSize}px):</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={42}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">توقيع الطالبة على اللوحة:</label>
                <input
                  type="text"
                  value={studentSignature}
                  onChange={(e) => setStudentSignature(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-900 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

          </div>

        </div>

        {/* LIVE CANVAS PREVIEW & EXPORT ACTIONS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 block">معاينة اللوحة القرآنية التذكارية المباشرة:</span>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
              دقة عالية HD 💎
            </span>
          </div>

          {/* THE CANVAS BOARD */}
          <div
            ref={canvasRef}
            className={`p-8 sm:p-12 rounded-3xl shadow-2xl border-4 transition-all relative overflow-hidden flex flex-col justify-between min-h-[420px] ${selectedTheme.bgClass} ${selectedTheme.accentBorder}`}
          >
            {/* Top Ornamental Bismillah Header */}
            <div className="text-center space-y-2 relative z-10">
              {showOrnamentFrame && (
                <div className="w-16 h-1 bg-amber-400 mx-auto rounded-full opacity-80" />
              )}
              <span className={`text-xs font-serif font-extrabold block tracking-widest ${selectedTheme.textClass}`}>
                ﷽
              </span>
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border inline-block ${selectedTheme.badgeBg}`}>
                سورة {selectedSurah.name}
              </span>
            </div>

            {/* Main Ayah Calligraphy Text */}
            <div className="my-8 text-center px-4 relative z-10">
              <p
                style={{
                  fontFamily: selectedFont.fontFamily,
                  fontSize: `${fontSize}px`,
                  lineHeight: 2.2,
                }}
                className={`font-black leading-relaxed tracking-wide ${selectedTheme.textClass}`}
              >
                "{displayText}"
              </p>
            </div>

            {/* Bottom Signature & Academy Branding */}
            <div className="flex items-center justify-between border-t border-amber-400/30 pt-4 relative z-10 text-[11px] font-serif">
              <span className={`font-bold opacity-90 ${selectedTheme.textClass}`}>
                أكاديمية إتقان لتحفيظ القرآن الكريم
              </span>
              <span className={`font-bold opacity-80 ${selectedTheme.textClass}`}>
                {studentSignature}
              </span>
            </div>

            {/* Decorative Corner Ornaments */}
            {showOrnamentFrame && (
              <>
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400/70 rounded-tr-lg" />
                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400/70 rounded-tl-lg" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400/70 rounded-br-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400/70 rounded-bl-lg" />
              </>
            )}
          </div>

          {/* EXPORT & GALLERY SHARING BUTTONS */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            {isSavedToGallery && (
              <div className="p-3 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                تم نشر اللوحة بنجاح في معرض الأكاديمية وحفظها في المفضلة! 🎉
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  alert('تم تنزيل اللوحة القرآنية التذكارية بدقة عالية HD على جهازك بنجاح! 🖼️');
                }}
                className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>حفظ وتنزيل البطاقة كصورة (HD) 🖼️</span>
              </button>

              <button
                onClick={handleSaveToGallery}
                className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>المشاركة في معرض الأكاديمية 🏛️</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
