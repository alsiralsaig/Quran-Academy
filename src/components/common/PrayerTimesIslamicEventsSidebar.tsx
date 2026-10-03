import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Compass,
  Sparkles,
  ChevronLeft,
  Sun,
  Moon,
  Volume2,
  Heart,
  MapPin,
  BellRing,
  Timer
} from 'lucide-react';

export interface PrayerTimesIslamicEventsSidebarProps {
  className?: string;
}

export const PrayerTimesIslamicEventsSidebar: React.FC<PrayerTimesIslamicEventsSidebarProps> = ({
  className = '',
}) => {
  const [selectedCity, setSelectedCity] = useState('مكة المكرمة');

  // Prayer times database mock for popular cities
  const CITIES_PRAYER_DATA: Record<string, { fajr: string; sunrise: string; dhuhr: string; asr: string; maghrib: string; isha: string }> = {
    'مكة المكرمة': { fajr: '05:08 ص', sunrise: '06:22 ص', dhuhr: '12:18 م', asr: '03:38 م', maghrib: '06:12 م', isha: '07:42 م' },
    'المدينة المنورة': { fajr: '05:06 ص', sunrise: '06:22 ص', dhuhr: '12:18 م', asr: '03:39 م', maghrib: '06:11 م', isha: '07:41 م' },
    'الرياض': { fajr: '04:42 ص', sunrise: '05:58 ص', dhuhr: '11:53 ص', asr: '03:15 م', maghrib: '05:48 م', isha: '07:18 م' },
    'جدة': { fajr: '05:10 ص', sunrise: '06:24 ص', dhuhr: '12:20 م', asr: '03:40 م', maghrib: '06:14 م', isha: '07:44 م' },
    'دبي': { fajr: '04:55 ص', sunrise: '06:10 ص', dhuhr: '12:12 م', asr: '03:32 م', maghrib: '06:08 م', isha: '07:23 م' },
    'القاهرة': { fajr: '04:32 ص', sunrise: '05:56 ص', dhuhr: '11:46 ص', asr: '03:10 م', maghrib: '05:36 م', isha: '06:54 م' },
  };

  const currentPrayers = CITIES_PRAYER_DATA[selectedCity] || CITIES_PRAYER_DATA['مكة المكرمة'];

  // Countdown timer to Next Prayer (e.g. Fajr / Dhuhr)
  const [secondsToNextPrayer, setSecondsToNextPrayer] = useState(14500); // ~4 hours countdown

  // Countdown timers to Upcoming Islamic Events
  const [eventCountdowns, setEventCountdowns] = useState({
    ramadanDays: 148,
    ramadanHours: 12,
    ramadanMins: 34,
    ramadanSecs: 20,
    eidFitrDays: 178,
    ararafahDays: 245,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToNextPrayer((prev) => (prev > 0 ? prev - 1 : 14400));
      setEventCountdowns((prev) => ({
        ...prev,
        ramadanSecs: prev.ramadanSecs > 0 ? prev.ramadanSecs - 1 : 59,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6 ${className}`}>
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
            <Clock className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm font-serif">
              مواقيت الصلاة والمناسبات الإسلامية
            </h4>
            <span className="text-[10px] text-slate-500 font-bold block">
              19 ربيع الثاني 1448 هـ
            </span>
          </div>
        </div>

        {/* City Selector Dropdown */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-none text-[11px]"
          >
            {Object.keys(CITIES_PRAYER_DATA).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Next Prayer Countdown Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden border border-emerald-800">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-300 animate-bounce" />
            <span className="text-xs font-extrabold text-amber-300">
              الصلاة القادمة: صلاة الفجر ({currentPrayers.fajr})
            </span>
          </div>
          <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
            {selectedCity}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 relative z-10">
          <span className="text-xs text-emerald-100 font-bold">متبقي على رفع الأذان:</span>
          <span className="text-xl font-black font-mono text-amber-300 tracking-wider">
            {formatCountdown(secondsToNextPrayer)}
          </span>
        </div>
      </div>

      {/* Today's 6 Prayer Times Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs font-bold">
        {[
          { name: 'الفجر', time: currentPrayers.fajr, icon: Moon, active: true },
          { name: 'الشروق', time: currentPrayers.sunrise, icon: Sun, active: false },
          { name: 'الظهر', time: currentPrayers.dhuhr, icon: Sun, active: false },
          { name: 'العصر', time: currentPrayers.asr, icon: Sun, active: false },
          { name: 'المغرب', time: currentPrayers.maghrib, icon: Moon, active: false },
          { name: 'العشاء', time: currentPrayers.isha, icon: Moon, active: false },
        ].map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className={`p-2.5 rounded-2xl border transition-all ${
                item.active
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-400'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 mx-auto mb-1 ${item.active ? 'text-amber-300' : 'text-slate-400'}`} />
              <span className="block text-[10px] text-slate-500 font-semibold leading-tight">{item.name}</span>
              <span className={`block font-extrabold mt-0.5 ${item.active ? 'text-amber-300' : 'text-slate-900'}`}>
                {item.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Upcoming Religious Events & Countdowns */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-900 font-serif">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            المناسبات والأيام الفضيلة القادمة:
          </span>
          <span className="text-[10px] text-emerald-700 font-bold">العداد التنازلي ⏳</span>
        </div>

        <div className="space-y-2.5 text-xs">
          
          {/* Ramadan Event Card */}
          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-amber-950 block">🌙 شهر رمضان المبارك 1448 هـ</span>
              <span className="text-[10px] text-amber-800 font-medium">أفضل الشهور لاستغلال الأوقات والختمات</span>
            </div>
            <div className="text-left shrink-0 font-mono font-black text-amber-700 text-xs bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-300">
              متبقي {eventCountdowns.ramadanDays} يوم
            </div>
          </div>

          {/* Eid Al-Fitr Card */}
          <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-emerald-950 block">🕌 عيد الفطر المبارك</span>
              <span className="text-[10px] text-emerald-800 font-medium">جائزة الصائمين والقائمين</span>
            </div>
            <div className="text-left shrink-0 font-mono font-black text-emerald-800 text-xs bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-300">
              متبقي {eventCountdowns.eidFitrDays} يوم
            </div>
          </div>

          {/* Arafah & Eid Al-Adha */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-slate-900 block">🕋 يوم عرفة وعيد الأضحى المبارك</span>
              <span className="text-[10px] text-slate-500 font-medium">أعظم أيام الدنيا بالدعاء والذكر</span>
            </div>
            <div className="text-left shrink-0 font-mono font-bold text-slate-700 text-xs bg-slate-200 px-2.5 py-1 rounded-xl">
              متبقي {eventCountdowns.ararafahDays} يوم
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
