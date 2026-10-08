import React, { useState } from 'react';
import { Library, FileText, Video, Headphones, Link2, Trash2, Plus, ExternalLink, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { LibraryItem } from '../../types';

interface DigitalLibraryProps {
  userRole: 'teacher' | 'student' | 'admin';
  userName: string;
}

const KINDS: { id: LibraryItem['kind']; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'pdf', label: 'كتاب / PDF', icon: FileText, color: 'bg-rose-50 text-rose-700' },
  { id: 'video', label: 'فيديو', icon: Video, color: 'bg-sky-50 text-sky-700' },
  { id: 'audio', label: 'صوتي', icon: Headphones, color: 'bg-violet-50 text-violet-700' },
  { id: 'link', label: 'رابط', icon: Link2, color: 'bg-emerald-50 text-emerald-700' },
];
const kindOf = (k: LibraryItem['kind']) => KINDS.find((x) => x.id === k) || KINDS[3];

/** المكتبة الرقمية — مواد حقيقية مشتركة بيضيفها المعلمين والإدارة كروابط (درايف، يوتيوب، ساوند كلاود...). */
export const DigitalLibrary: React.FC<DigitalLibraryProps> = ({ userRole }) => {
  const { library, currentUser, addLibraryItem, deleteLibraryItem } = useApp();
  const canAdd = userRole === 'teacher' || userRole === 'admin';

  const [filter, setFilter] = useState<'all' | LibraryItem['kind']>('all');
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<LibraryItem['kind']>('pdf');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  const shown = library
    .filter((i) => filter === 'all' || i.kind === filter)
    .filter((i) => !q.trim() || (i.title + ' ' + i.description).includes(q.trim()))
    .slice()
    .reverse();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addLibraryItem({ title: title.trim(), kind, url: url.trim(), description: description.trim() });
      setTitle('');
      setUrl('');
      setDescription('');
      setShowForm(false);
    } catch {
      /* الخطأ بيظهر من النظام */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">المكتبة الرقمية</h3>
            <p className="text-xs text-slate-500">كتب ومتون وتلاوات ودروس مختارة من معلمي الأكاديمية</p>
          </div>
        </div>
        {canAdd && (
          <button onClick={() => setShowForm((v) => !v)} className="px-3 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-1">
            <Plus className="w-4 h-4" /> إضافة مادة
          </button>
        )}
      </div>

      {canAdd && showForm && (
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="العنوان: مثلاً متن تحفة الأطفال" className="p-2.5 border rounded-xl font-bold" required />
          <select value={kind} onChange={(e) => setKind(e.target.value as LibraryItem['kind'])} className="p-2.5 border rounded-xl font-bold bg-white">
            {KINDS.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." dir="ltr" type="url" className="p-2.5 border rounded-xl sm:col-span-2" required />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف قصير (اختياري)" className="p-2.5 border rounded-xl sm:col-span-2" />
          <p className="sm:col-span-2 text-[11px] text-slate-500">ارفع الملف على Google Drive أو YouTube وانسخ رابط المشاركة هنا (لازم يبدأ بـ https).</p>
          <button type="submit" disabled={busy} className="sm:col-span-2 py-2.5 rounded-xl bg-amber-600 disabled:opacity-50 text-white font-black">
            {busy ? 'جاري الحفظ...' : 'حفظ في المكتبة'}
          </button>
        </form>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث..." className="w-full pr-9 p-2 border rounded-xl text-xs" />
        </div>
        {(['all', ...KINDS.map((k) => k.id)] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${filter === k ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
          >
            {k === 'all' ? 'الكل' : kindOf(k).label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm border border-dashed rounded-2xl">
          {library.length === 0 ? (canAdd ? 'المكتبة فاضية — أضف أول مادة' : 'المكتبة فاضية حالياً، المعلمين حيضيفوا مواد قريب') : 'ما في نتائج'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shown.map((i) => {
            const k = kindOf(i.kind);
            const Icon = k.icon;
            const canDelete = userRole === 'admin' || i.ownerId === currentUser.id;
            return (
              <div key={i.id} className="p-4 rounded-2xl border bg-white flex gap-3">
                <div className={`p-2.5 rounded-xl h-fit ${k.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-slate-900 text-sm">{i.title}</div>
                  {i.description && <div className="text-xs text-slate-600 mt-0.5">{i.description}</div>}
                  <div className="text-[10px] text-slate-400 mt-1">أضافه {i.ownerName}</div>
                  <div className="flex gap-2 mt-2">
                    <a href={i.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> فتح
                    </a>
                    {canDelete && (
                      <button onClick={() => confirm('مسح المادة دي؟') && deleteLibraryItem(i.id)} className="px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
