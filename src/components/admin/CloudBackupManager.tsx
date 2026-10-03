import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cloud, Database, Download, RefreshCw, Calendar, Clock, CheckCircle2, AlertCircle, HardDrive, ShieldCheck } from 'lucide-react';

export const CloudBackupManager: React.FC = () => {
  const { backups, createCloudBackupSnapshot, restoreFromSnapshot, exportData } = useApp();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [scheduleFreq, setScheduleFreq] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

  const handleManualBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      createCloudBackupSnapshot('manual');
      setIsBackingUp(false);
    }, 1200);
  };

  const handleConfirmRestore = () => {
    if (!selectedSnapshotId) return;
    const ok = restoreFromSnapshot(selectedSnapshotId);
    if (ok) {
      const snap = backups.find((b) => b.id === selectedSnapshotId);
      setRestoreSuccessMsg(`تمت استعادة البيانات بنجاح من النسخة (${snap?.name})!`);
      setShowRestoreModal(false);
      setTimeout(() => setRestoreSuccessMsg(null), 5000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5 border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-2xl">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif">
              أداة النسخ الاحتياطي والاستعادة السحابية ☁️
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              جدولة النسخ التلقائي لقواعد بيانات الحلقات والطلاب مع استعادة البيانات من أي تاريخ محدد.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportData}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors min-h-[42px]"
            title="تصدير ملف JSON محلي"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>تصدير ملف</span>
          </button>

          <button
            onClick={handleManualBackup}
            disabled={isBackingUp}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all min-h-[42px] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
            <span>{isBackingUp ? 'جاري النسخ...' : 'إنشاء نسخة احتياطية الآن'}</span>
          </button>
        </div>
      </div>

      {restoreSuccessMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{restoreSuccessMsg}</span>
        </div>
      )}

      {/* Auto Backup Scheduler Controls */}
      <div className="p-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">جدولة النسخ الاحتياطي التلقائي</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">حدد تكرار أخذ لقطات سحابية لبيانات الأكاديمية.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
            <button
              key={freq}
              onClick={() => setScheduleFreq(freq)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                scheduleFreq === freq
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              {freq === 'daily' ? 'يومياً' : freq === 'weekly' ? 'أسبوعياً' : 'شهرياً'}
            </button>
          ))}
        </div>
      </div>

      {/* Snapshots Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            سجل النسخ الاحتياطية المتاحة للرخص والاستعادة ({backups.length})
          </h4>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold">
              <tr>
                <th className="p-3.5">اسم النسخة الاحتياطية</th>
                <th className="p-3.5">التاريخ والوقت</th>
                <th className="p-3.5">الحجم</th>
                <th className="p-3.5">عدد السجلات</th>
                <th className="p-3.5 text-center">النوع</th>
                <th className="p-3.5 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {backups.map((snap) => (
                <tr key={snap.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-500 shrink-0" />
                    {snap.name}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {snap.createdAt}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono">{snap.size}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400 font-bold">{snap.recordCount} سجل</td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      snap.type === 'auto'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {snap.type === 'auto' ? 'تلقائي' : 'يدوي'}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => {
                        setSelectedSnapshotId(snap.id);
                        setShowRestoreModal(true);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] rounded-lg shadow-sm transition-all"
                    >
                      استعادة البيانات
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTORE CONFIRMATION MODAL */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-7 h-7 shrink-0" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-serif">
                تأكيد استعادة البيانات من النسخة
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هل أنت أكتأكد من إرجاع قواعد بيانات الأكاديمية والحلقات والطلاب إلى الحالة المؤرخة في{' '}
              <strong className="text-emerald-700 dark:text-emerald-400">
                {backups.find((b) => b.id === selectedSnapshotId)?.createdAt}
              </strong>
              ؟ سيعيد هذا كل الإحصائيات لمواضعها السابقة.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmRestore}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
              >
                نعم، ابدأ الاستعادة الآن
              </button>
              <button
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
