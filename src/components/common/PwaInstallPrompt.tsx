import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone (PWA) mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt (Android / Chrome)
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowIosModal(true);
    }
  };

  if (isInstalled || dismissed) return null;

  return (
    <>
      {/* Top Mobile App Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white px-4 py-2.5 shadow-md border-b border-amber-400/30 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm bg-white p-0.5 object-contain" />
          <div>
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <span>تثبيت تطبيق أكاديمية القرآن</span>
              <span className="text-[10px] bg-emerald-800 text-emerald-200 px-1.5 py-0.2 rounded">Android & iOS</span>
            </div>
            <p className="text-[11px] text-slate-300">يعمل بدون إنترنت وبسرعة فائقة على هاتفك</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95 text-[11px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت الآن</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Installation Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-900 shadow-2xl border border-emerald-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <Smartphone className="w-5 h-5 text-amber-500" />
                <span>تثبيت التطبيق على الآيفون والأندرويد</span>
              </div>
              <button onClick={() => setShowIosModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="p-2 bg-emerald-700 text-white rounded-xl font-bold">1</div>
                <div>
                  <div className="font-bold text-emerald-900">اضغط على زر المشاركة (Share)</div>
                  <p className="text-[11px] text-slate-600">في شريط المتصفح (سفاري أو كروم) بالأسفل ⎋</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">2</div>
                <div>
                  <div className="font-bold text-amber-950">اختر "إضافة إلى الشاشة الرئيسية"</div>
                  <p className="text-[11px] text-slate-600">Add to Home Screen ➕</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-2xl border border-teal-100">
                <div className="p-2 bg-teal-700 text-white rounded-xl font-bold">3</div>
                <div>
                  <div className="font-bold text-teal-900">اضغط "إضافة" (Add)</div>
                  <p className="text-[11px] text-slate-600">سيظهر تطبيق الأكاديمية على شاشة هاتفك بأيقونته الرسمية!</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="mt-5 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl text-xs transition-colors"
            >
              فهمت ذلك، تم ✅
            </button>
          </div>
        </div>
      )}
    </>
  );
};
