import React from 'react';
import { X, Check, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { Subscription } from '../../types';

interface ReceiptViewerModalProps {
  subscription: Subscription | null;
  onClose: () => void;
  onApprove?: (subId: string) => void;
  onReject?: (subId: string, reason: string) => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  subscription,
  onClose,
  onApprove,
  onReject,
}) => {
  const [rejectReason, setRejectReason] = React.useState('');
  const [showRejectInput, setShowRejectInput] = React.useState(false);

  if (!subscription) return null;

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    if (onReject) {
      onReject(subscription.id, rejectReason);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-emerald-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-700/50 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg">معاينة إيصال التحويل البنكي</h3>
              <p className="text-emerald-200 text-xs mt-0.5">
                الطالب: {subscription.studentName} | {subscription.packageName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-700/50 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
            <div>
              <span className="text-slate-500 text-xs block">اسم الطالب</span>
              <span className="font-semibold text-slate-800">{subscription.studentName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">رقم الجوال</span>
              <span className="font-semibold text-slate-800" dir="ltr">{subscription.studentPhone}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">المعلمة المختارة</span>
              <span className="font-semibold text-emerald-700">{subscription.teacherName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">الباقة</span>
              <span className="font-semibold text-slate-800">{subscription.packageName} ({subscription.totalSessions} حصة)</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">المبلغ المحول</span>
              <span className="font-bold text-amber-600">{subscription.amountPaid} {subscription.currency}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">تاريخ الطلب</span>
              <span className="font-medium text-slate-700">{subscription.createdAt}</span>
            </div>
          </div>

          {/* Receipt Image Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">صورة إيصال التحويل المرفقة:</span>
              <a
                href={subscription.paymentReceiptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-medium"
              >
                فتح الصورة في نافذة جديدة
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="relative border-2 border-dashed border-emerald-200 rounded-xl overflow-hidden bg-slate-900 flex justify-center items-center min-h-[260px] max-h-[380px]">
              <img
                src={subscription.paymentReceiptUrl}
                alt="إيصال التحويل البنكي"
                className="max-h-[360px] w-auto object-contain hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <p className="font-sans">إيصال التحويل محمل وجاهز للمراجعة</p>
              </div>
            </div>
          </div>

          {/* Rejection input field if toggled */}
          {showRejectInput && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3">
              <label className="block text-xs font-semibold text-rose-800">
                سبب رفض الإيصال (سيرسل للطالب للتعديل):
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="مثال: الصورة غير واضحة، أو المبلغ المحول لا يطابق قيمة الباقة المختارة."
                className="w-full text-xs p-3 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-1.5 text-xs bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 font-medium"
                >
                  تأكيد الرفض
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-xl transition-colors font-medium"
          >
            إغلاق
          </button>

          {subscription.paymentStatus === 'pending' && onApprove && (
            <div className="flex items-center gap-3">
              {!showRejectInput && (
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="px-4 py-2 text-sm bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors font-medium flex items-center gap-1.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  رفض الإيصال
                </button>
              )}
              <button
                onClick={() => {
                  onApprove(subscription.id);
                  onClose();
                }}
                className="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                تأكيد التحويل وتفعيل الباقة
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
