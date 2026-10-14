import React from 'react';

interface Props { children: React.ReactNode }
interface State { err: Error | null }

/**
 * شبكة الأمان: أي انهيار في واجهة المعلمة/الطالب/الإدارة يعرض رسالة واضحة
 * مع زر «إصلاح» — بدل الشاشة البيضاء الصامتة.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    // للتشخيص عن بُعد: كلمة العطل ومكانها في الكونسول
    console.error('[itqan] انهيار واجهة:', err.message, info.componentStack);
  }

  /** مسح الكاش القديم + إلغاء Service Worker + إعادة فتح — يعالج تعارض نسخة مخزنة */
  fixAndReload = () => {
    const done = () => {
      try {
        (window as any).location.replace((window as any).location.pathname + '?r=' + Date.now());
      } catch {
        (window as any).location.reload();
      }
    };
    try {
      if ('caches' in window) {
        caches.keys()
          .then((ks) => Promise.all(ks.map((k) => caches.delete(k))))
          .catch(() => {})
          .then(() => {
            const sw = (navigator as any).serviceWorker;
            if (sw?.getRegistrations) {
              sw.getRegistrations().then((rs: any[]) => rs.forEach((r) => r.unregister())).catch(() => {}).then(done);
            } else done();
          });
      } else done();
    } catch {
      done();
    }
  };

  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
        <div className="w-full max-w-md bg-white rounded-3xl border-2 border-amber-200 shadow-xl p-6 text-center space-y-3">
          <div className="text-5xl">🛠️</div>
          <h2 className="font-extrabold text-slate-900 text-lg">صادينّا عطل بسيط في الشاشة دي</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            دوس «إصلاح» — بنمسح النسخة القديمة المخزنة وبنعيد فتح التطبيق. لو عاد تاني، صور الشاشة دي وابعتها للدعم.
          </p>
          <div className="bg-slate-950 rounded-2xl p-3 text-right" dir="ltr">
            <p className="font-mono text-[11px] text-rose-300 break-words max-h-24 overflow-auto">{this.state.err.message}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={this.fixAndReload} className="flex-1 py-3 rounded-2xl bg-emerald-700 text-white font-black text-sm">
              🔧 إصلاح وإعادة فتح
            </button>
            <button onClick={() => (window as any).location.reload()} className="px-5 py-3 rounded-2xl bg-slate-200 text-slate-700 font-black text-sm">
              تحديث
            </button>
          </div>
        </div>
      </div>
    );
  }
}
