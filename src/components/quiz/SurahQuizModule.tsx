import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  RotateCcw,
  Clock,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Brain,
  Star,
  Check,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ALL_SURAHS } from '../../data/quranData';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'tajweed' | 'sequence' | 'info';
}

interface SurahQuizModuleProps {
  studentName: string;
  onQuizComplete?: (surahName: string, scorePercent: number, pointsEarned: number) => void;
  onClose?: () => void;
}

export const SurahQuizModule: React.FC<SurahQuizModuleProps> = ({
  studentName,
  onQuizComplete,
  onClose,
}) => {
  const [selectedSurah, setSelectedSurah] = useState<string>('سورة البقرة');
  const [isQuizStarted, setIsQuizStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [questionTimer, setQuestionTimer] = useState<number>(30);

  // Question bank categorized by Surahs
  const QUIZ_BANK: Record<string, QuizQuestion[]> = {
    'سورة البقرة': [
      {
        id: 1,
        question: 'ما هو الحكم التجويدي في قوله تعالى: ﴿مِن بَعْدِ﴾؟',
        options: ['إظهار حلقي', 'إقلاب (قلب النون ميماً)', 'إدغام بغنة', 'إخفاء شفي'],
        correctIndex: 1,
        explanation: 'الحكم هو الإقلاب، لوقوع حرف الباء بعد النون الساكنة وتقلب النون ميماً مخفاة بغنة.',
        category: 'tajweed',
      },
      {
        id: 2,
        question: 'ما هي الآية الكريمة القادمة بعد قوله تعالى: ﴿وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً...﴾؟',
        options: [
          '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا...﴾',
          '﴿فَتَلَقَّىٰ آدَمُ مِن رَّبِّهِ كَلِمَاتٍ...﴾',
          '﴿وَقُلْنَا يَا آدَمُ اسْكُنْ أَنتَ وَزَوْجُكَ الْجَنَّةَ...﴾',
          '﴿وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ...﴾'
        ],
        correctIndex: 0,
        explanation: 'الآية التالية مباشرة في سورة البقرة هي: ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ثُمَّ عَرَضَهُمْ عَلَى الْمَلَائِكَةِ﴾.',
        category: 'sequence',
      },
      {
        id: 3,
        question: 'ما هو مقدار المد اللازم الكلمي المئقل في قوله تعالى: ﴿وَلَا الضَّالِّينَ﴾؟',
        options: ['حركتان (مد طبيعي)', '4 حركات', '6 حركات وجوباً', '8 حركات'],
        correctIndex: 2,
        explanation: 'المد اللازم الكلمي المسبق أو المثقل يمد بمقدار 6 حركات لزوماً لدى جميع القراء.',
        category: 'tajweed',
      },
      {
        id: 4,
        question: 'كم عدد آيات سورة البقرة وهل هي مكية أم مدنية؟',
        options: [
          '286 آية - مدنية (وهي أطول سور القرآن)',
          '200 آية - مكية',
          '114 آية - مدنية',
          '286 آية - مكية'
        ],
        correctIndex: 0,
        explanation: 'سورة البقرة مدنية وعدد آياتها 286 آية وهي أطول سورة في المصحف الشريف.',
        category: 'info',
      },
      {
        id: 5,
        question: 'ما الحكم التجويدي في قوله تعالى: ﴿عَلِيمٌ حَكِيمٌ﴾؟',
        options: ['إدغام بغير غنة', 'إظهار حلقي', 'إخفاء حقيقي', 'إقلاب'],
        correctIndex: 1,
        explanation: 'الحكم إظهار حلقي لوقوع حرف الحاء (وهو من حروف الحلق) بعد تنوين الضم.',
        category: 'tajweed',
      },
    ],
    'سورة الفاتحة': [
      {
        id: 1,
        question: 'ما نوع اللام في قوله تعالى: ﴿الْحَمْدُ لِلَّهِ﴾؟',
        options: ['لام شمسية', 'لام قمرية مظهرة', 'لام زائدة', 'لام مدغمة'],
        correctIndex: 1,
        explanation: 'اللام في (الحمد) لام قمرية حكمها الإظهار الحرفي.',
        category: 'tajweed',
      },
      {
        id: 2,
        question: 'ما معنى قوله تعالى: ﴿إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ﴾؟',
        options: [
          'نخصك وحدك بالعبادة وطلب العون',
          'نعبدك ونطلب العون من الناس',
          'نعظم جميع الخلق',
          'الدعاء بالشفاء'
        ],
        correctIndex: 0,
        explanation: 'تقديم المفعول به (إياك) يفيد الحصر والتوحيد الخالص لله سبحانه وتعالى.',
        category: 'info',
      },
      {
        id: 3,
        question: 'كم عدد آيات سورة الفاتحة؟',
        options: ['5 آيات', '6 آيات', '7 آيات (السبع المثاني)', '8 آيات'],
        correctIndex: 2,
        explanation: 'سورة الفاتحة سبع آيات وتسمى السبع المثاني.',
        category: 'info',
      },
    ],
    'سورة الملك': [
      {
        id: 1,
        question: 'ما هو حكم النون الساكنة في قوله تعالى: ﴿مِن فُطُورٍ﴾؟',
        options: ['إظهار', 'إخفاء حقيقي بغنة', 'إدغام بغنة', 'إقلاب'],
        correctIndex: 1,
        explanation: 'الحكم هو الإخفاء الحقيقي لوقوع حرف الفاء بعد النون الساكنة.',
        category: 'tajweed',
      },
      {
        id: 2,
        question: 'ما هو فضل سورة الملك كما ورد في الحديث النبوي؟',
        options: [
          'تستغفر لصاحبها وتنجيه من عذاب القبر',
          'تزيد في الرزق المالي',
          'تطرد الشياطين من البيت لثلاث ليالٍ',
          'تحمي من الفقر'
        ],
        correctIndex: 0,
        explanation: 'ورد في الحديث أنها سورة تبارك المانعة والمنجية من عذاب القبر.',
        category: 'info',
      },
    ],
  };

  const currentQuestions = QUIZ_BANK[selectedSurah] || QUIZ_BANK['سورة البقرة'];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Question Timer Effect
  useEffect(() => {
    let timer: any = null;
    if (isQuizStarted && !isAnswerSubmitted && !quizFinished && questionTimer > 0) {
      timer = setInterval(() => {
        setQuestionTimer((prev) => prev - 1);
      }, 1000);
    } else if (questionTimer === 0 && !isAnswerSubmitted && !quizFinished) {
      // Time up -> auto reveal answer
      setIsAnswerSubmitted(true);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isQuizStarted, isAnswerSubmitted, quizFinished, questionTimer]);

  const handleStartQuiz = () => {
    setIsQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizFinished(false);
    setQuestionTimer(30);
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);

    if (selectedOption === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setQuestionTimer(30);
    } else {
      // Quiz Finished!
      setQuizFinished(true);
      const scorePercent = Math.round(((score + (selectedOption === currentQuestion.correctIndex ? 1 : 0)) / currentQuestions.length) * 100);
      const pointsEarned = Math.round((scorePercent / 100) * 50);

      if (scorePercent >= 80) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#fbbf24', '#ffffff'],
        });
      }

      if (onQuizComplete) {
        onQuizComplete(selectedSurah, scorePercent, pointsEarned);
      }
    }
  };

  const finalScorePercent = Math.round((score / currentQuestions.length) * 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-900 rounded-2xl">
            <Brain className="w-6 h-6 text-purple-700" />
          </div>
          <div>
            <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-300">
              Interactive Quran Quiz
            </span>
            <h3 className="font-extrabold text-slate-900 text-lg font-serif mt-0.5">
              وحدة الاختبارات القصيرة الذكية (تجويد ومتشابهات)
            </h3>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
          >
            إغلاق الاختبار
          </button>
        )}
      </div>

      {/* BEFORE QUIZ START: SURAH SELECTOR */}
      {!isQuizStarted && !quizFinished && (
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 text-white p-8 rounded-3xl space-y-6 shadow-xl border border-emerald-800 text-center">
          <div className="w-16 h-16 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg border-2 border-amber-300">
            <BookOpen className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-2xl font-black font-serif text-amber-300">
              اختبار تثبيت وتجويد السورة
            </h3>
            <p className="text-emerald-100/80 text-xs leading-relaxed">
              اختر السورة المكتملة لبدء اختبار أسئلة التجويد الآلية ومواضع الآيات. تضاف النتيجة والدرجات المكتسبة تلقائياً لسجل أداء الطالب.
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-2 text-xs">
            <label className="block font-bold text-amber-200 text-right">حدد السورة المراد اختبارها:</label>
            <select
              value={selectedSurah}
              onChange={(e) => setSelectedSurah(e.target.value)}
              className="w-full p-3 border rounded-2xl font-bold bg-white text-slate-900 focus:outline-none"
            >
              {Object.keys(QUIZ_BANK).map((surah) => (
                <option key={surah} value={surah}>
                  {surah} ({QUIZ_BANK[surah].length} أسئلة تجويد ومواضع)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStartQuiz}
            className="px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            بدء الاختبار الآن (+50 نقطة)
          </button>
        </div>
      )}

      {/* ACTIVE QUIZ RUNNER */}
      {isQuizStarted && !quizFinished && currentQuestion && (
        <div className="space-y-6">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-4 rounded-2xl border">
            <span>
              السؤال {currentQuestionIndex + 1} من {currentQuestions.length} ({selectedSurah})
            </span>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className={`font-mono text-sm font-extrabold ${questionTimer <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                00:{questionTimer.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Question Box */}
          <div className="bg-emerald-950 text-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-700 space-y-6 shadow-lg">
            <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-3 py-1 rounded-full border border-amber-300 inline-block">
              {currentQuestion.category === 'tajweed' ? 'أحكام التجويد' : currentQuestion.category === 'sequence' ? 'مواضع الآيات والمتشابهات' : 'معلومات السورة'}
            </span>

            <h3 className="font-serif font-black text-xl sm:text-2xl text-amber-200 leading-relaxed">
              {currentQuestion.question}
            </h3>

            {/* MCQ Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                let btnStyle = 'bg-white/10 text-white border-white/20 hover:bg-white/20';
                if (isAnswerSubmitted) {
                  if (idx === currentQuestion.correctIndex) {
                    btnStyle = 'bg-emerald-600 text-white border-emerald-400 font-extrabold shadow-lg';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-rose-600 text-white border-rose-400 font-bold';
                  }
                } else if (selectedOption === idx) {
                  btnStyle = 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-md';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full p-4 rounded-2xl border-2 text-right transition-all font-semibold text-xs sm:text-sm flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswerSubmitted && idx === currentQuestion.correctIndex && (
                      <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
                    )}
                    {isAnswerSubmitted && idx === selectedOption && idx !== currentQuestion.correctIndex && (
                      <XCircle className="w-5 h-5 text-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Display */}
            {isAnswerSubmitted && (
              <div className="p-4 bg-emerald-900/90 rounded-2xl border border-emerald-600 space-y-1 text-xs text-amber-100 animate-in fade-in">
                <span className="font-extrabold block text-amber-300">💡 الشرح التجويدي والتوضيح:</span>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            {!isAnswerSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className={`px-8 py-3.5 font-extrabold text-xs rounded-2xl shadow-md transition-all ${
                  selectedOption !== null
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                تأكيد الإجابة
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 ml-auto"
              >
                <span>{currentQuestionIndex + 1 < currentQuestions.length ? 'السؤال التالي' : 'عرض نتيجة الاختبار'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}

      {/* QUIZ FINISHED RESULT CARD */}
      {quizFinished && (
        <div className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 rounded-3xl text-center space-y-6 shadow-2xl border-2 border-amber-400">
          <div className="w-20 h-20 bg-amber-400 text-slate-950 rounded-3xl flex items-center justify-center mx-auto shadow-xl border-4 border-amber-300 animate-bounce">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-4 py-1 rounded-full border border-amber-400/30">
              نتيجة اختبار {selectedSurah}
            </span>
            <h3 className="text-3xl font-black font-serif text-amber-300">
              {finalScorePercent >= 80 ? 'إتقان ممتاز وتفوق مبارك! 🌟' : 'نتيجة جيدة ومستمرة 👍'}
            </h3>
            <p className="text-emerald-100 text-xs">
              أحسنتِ يا <span className="font-bold text-white">{studentName}</span>! تم حفظ النتيجة وإضافتها لسجل الأداء الشهري.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-xs font-bold">
            <div className="bg-emerald-900/90 p-4 rounded-2xl border border-emerald-700">
              <span className="text-slate-300 block text-[10px]">نسبة الدرجة</span>
              <span className="text-2xl font-black text-amber-300 font-serif">{finalScorePercent}%</span>
            </div>

            <div className="bg-emerald-900/90 p-4 rounded-2xl border border-emerald-700">
              <span className="text-slate-300 block text-[10px]">النقاط الكسبانة</span>
              <span className="text-2xl font-black text-amber-300 font-serif">+{Math.round((finalScorePercent / 100) * 50)} نقطة</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartQuiz}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-2xl border border-white/30 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة الاختبار
            </button>

            <button
              onClick={() => {
                setQuizFinished(false);
                setIsQuizStarted(false);
                if (onClose) onClose();
              }}
              className="px-8 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl"
            >
              متابعة الحفظ
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
