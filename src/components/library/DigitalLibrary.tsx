import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Video,
  Volume2,
  Download,
  Plus,
  Search,
  CheckCircle2,
  FolderOpen,
  Eye,
  Trash2,
  Sparkles,
  ExternalLink,
  Award,
  Filter
} from 'lucide-react';
import { UserRole } from '../../types';

export interface DigitalResource {
  id: string;
  title: string;
  category: 'tajweed_pdf' | 'video_tutorial' | 'audio_lesson' | 'worksheet';
  categoryTitle: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'video' | 'audio';
  teacherName: string;
  targetStudents: 'all' | string;
  assignedDate: string;
  downloadCount: number;
  isCompletedByStudent?: boolean;
}

interface DigitalLibraryProps {
  userRole: UserRole;
  userName: string;
}

export const DigitalLibrary: React.FC<DigitalLibraryProps> = ({ userRole, userName }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewResource, setPreviewResource] = useState<DigitalResource | null>(null);

  // Initial Digital Resources database
  const [resources, setResources] = useState<DigitalResource[]>([
    {
      id: 'res_1',
      title: 'ملخص أحكام النون الساكنة والتنوين (مخطط ميسر PDF)',
      category: 'tajweed_pdf',
      categoryTitle: 'ملفات PDF وشروحات',
      description: 'جدول توضيحي شامل يجمع حالات الإظهار والإدغام والإقلاب والإخفاء بالألوان للطلاب.',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      teacherName: 'أ. عائشة محمود العلي',
      targetStudents: 'all',
      assignedDate: '2026-10-01',
      downloadCount: 42,
      isCompletedByStudent: true,
    },
    {
      id: 'res_2',
      title: 'فيديو تطبيقي: ضبط مخرج حرف القاف والقلقلة الكبرى',
      category: 'video_tutorial',
      categoryTitle: 'مقاطع فيديو تعليمية',
      description: 'شرح مرئي قصير مدته 3 دقائق يوضح كيفية نطق القلقلة دون إشمام الضمة.',
      fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      fileType: 'video',
      teacherName: 'أ. فاطمة الزهراء',
      targetStudents: 'all',
      assignedDate: '2026-09-28',
      downloadCount: 68,
      isCompletedByStudent: false,
    },
    {
      id: 'res_3',
      title: 'تسجيل صبياتي: نماذج المد المتصل والمنفصل بمقدار 4 حركات',
      category: 'audio_lesson',
      categoryTitle: 'تسجيلات صوتية إثرائية',
      description: 'نموذج صبياتي نقي بصوت المعلمة للربط بين مقادير أزمنة المدود أثناء الحفظ.',
      fileUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2_4.mp3',
      fileType: 'audio',
      teacherName: 'أ. عائشة محمود العلي',
      targetStudents: 'all',
      assignedDate: '2026-09-25',
      downloadCount: 35,
      isCompletedByStudent: false,
    },
    {
      id: 'res_4',
      title: 'ورقة عمل وتدريبات تثبيت سورة البقرة (أجزاء 1 - 3)',
      category: 'worksheet',
      categoryTitle: 'أوراق عمل وواجبات',
      description: 'مجموعة أسئلة واختبارات ذاتية واختبار المتشابهات لتثبيت التسميع قبل الاختبار.',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      teacherName: 'أ. مريم يوسف',
      targetStudents: 'all',
      assignedDate: '2026-09-20',
      downloadCount: 51,
      isCompletedByStudent: true,
    },
  ]);

  // Modal to add new resource (for teachers)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'tajweed_pdf' | 'video_tutorial' | 'audio_lesson' | 'worksheet'>('tajweed_pdf');
  const [newType, setNewType] = useState<'pdf' | 'video' | 'audio'>('pdf');
  const [newDescription, setNewDescription] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [newTarget, setNewTarget] = useState('all');

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();

    const categoryMap = {
      tajweed_pdf: 'ملفات PDF وشروحات',
      video_tutorial: 'مقاطع فيديو تعليمية',
      audio_lesson: 'تسجيلات صوتية إثرائية',
      worksheet: 'أوراق عمل وواجبات',
    };

    const newRes: DigitalResource = {
      id: `res_${Date.now()}`,
      title: newTitle,
      category: newCategory,
      categoryTitle: categoryMap[newCategory],
      description: newDescription,
      fileUrl: newFileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: newType,
      teacherName: userName,
      targetStudents: newTarget,
      assignedDate: new Date().toISOString().split('T')[0],
      downloadCount: 0,
      isCompletedByStudent: false,
    };

    setResources([newRes, ...resources]);
    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
    alert('تم رفع المادة التعليمية وإضافتها للمكتبة الرقمية وتوجيهها للطلاب بنجاح!');
  };

  const handleDeleteResource = (id: string) => {
    if (confirm('هل أنتِ متأكدة من حذف هذه المادة من المكتبة الرقمية؟')) {
      setResources(resources.filter((r) => r.id !== id));
    }
  };

  const handleToggleComplete = (id: string) => {
    setResources(
      resources.map((r) =>
        r.id === id ? { ...r, isCompletedByStudent: !r.isCompletedByStudent } : r
      )
    );
  };

  const filteredResources = resources.filter((res) => {
    const matchesCat = selectedCategory === 'all' || res.category === selectedCategory;
    const matchesSearch =
      res.title.includes(searchQuery) ||
      res.description.includes(searchQuery) ||
      res.teacherName.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
            <BookOpen className="w-4 h-4 text-amber-300" />
            المكتبة الرقمية والمواد الإثرائية
          </div>
          <h3 className="font-extrabold text-2xl font-serif">المكتبة القرأنية والملفات التعليمية</h3>
          <p className="text-emerald-100/80 text-xs">
            تصفّح ملفات PDF، فيديوهات التجويد القصيرة، وأوراق العمل المخصصة من المعلمات.
          </p>
        </div>

        {userRole === 'teacher' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-lg flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            رفع مادة تعليمية جديدة
          </button>
        )}
      </div>

      {/* Search & Category Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المادة أو الدرس..."
            className="w-full pr-9 pl-3 py-2.5 border rounded-xl font-bold bg-slate-50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto text-[11px] font-bold">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'all' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            جميع المواد ({resources.length})
          </button>
          <button
            onClick={() => setSelectedCategory('tajweed_pdf')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'tajweed_pdf' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            ملفات PDF
          </button>
          <button
            onClick={() => setSelectedCategory('video_tutorial')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'video_tutorial' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            فيديوهات تجويد
          </button>
          <button
            onClick={() => setSelectedCategory('audio_lesson')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'audio_lesson' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            تسجيلات صوتية
          </button>
          <button
            onClick={() => setSelectedCategory('worksheet')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'worksheet' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            أوراق عمل
          </button>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
                    {resource.fileType === 'pdf' ? (
                      <FileText className="w-5 h-5" />
                    ) : resource.fileType === 'video' ? (
                      <Video className="w-5 h-5 text-purple-700" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-amber-700" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 inline-block mb-1">
                      {resource.categoryTitle}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm font-serif">{resource.title}</h4>
                  </div>
                </div>

                {userRole === 'teacher' && (
                  <button
                    onClick={() => handleDeleteResource(resource.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="حذف المادة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{resource.description}</p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>إعداد: {resource.teacherName}</span>
                <span>تاريخ النشر: {resource.assignedDate}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewResource(resource)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  معاينة ومشاهدة
                </button>

                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  تنزيل
                </a>
              </div>

              {userRole === 'student' && (
                <button
                  onClick={() => handleToggleComplete(resource.id)}
                  className={`px-3 py-1.5 font-bold rounded-xl flex items-center gap-1 border transition-all ${
                    resource.isCompletedByStudent
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${resource.isCompletedByStudent ? 'text-emerald-700' : ''}`} />
                  {resource.isCompletedByStudent ? 'تمت الدراسة' : 'تحديد كمنجز'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PREVIEW RESOURCE MODAL */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                معاينة المادة التعليمية: {previewResource.title}
              </h3>
              <button onClick={() => setPreviewResource(null)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            {previewResource.fileType === 'video' ? (
              <div className="space-y-2">
                <video controls className="w-full rounded-2xl max-h-80 bg-black">
                  <source src={previewResource.fileUrl} type="video/mp4" />
                  متصفحك لا يدعم مشغل الفيديو.
                </video>
              </div>
            ) : previewResource.fileType === 'audio' ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <Volume2 className="w-12 h-12 text-emerald-700 mx-auto animate-bounce" />
                <p className="font-bold text-emerald-950">{previewResource.title}</p>
                <audio controls className="w-full">
                  <source src={previewResource.fileUrl} type="audio/mp3" />
                  متصفحك لا يدعم مشغل الصوت.
                </audio>
              </div>
            ) : (
              <div className="p-8 bg-slate-100 rounded-2xl text-center space-y-4">
                <FileText className="w-12 h-12 text-emerald-700 mx-auto" />
                <h4 className="font-bold text-slate-900">{previewResource.title}</h4>
                <p className="text-xs text-slate-600">{previewResource.description}</p>
                <a
                  href={previewResource.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  فتح ملف PDF في نافذة جديدة
                </a>
              </div>
            )}

            <button
              onClick={() => setPreviewResource(null)}
              className="w-full py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>
      )}

      {/* CREATE NEW RESOURCE MODAL (TEACHER) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-emerald-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-700" />
                رفع مادة تعليمية جديدة للمكتبة
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان المادة التعليمية</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: ملخص أحكام النون الساكنة PDF"
                  className="w-full p-2.5 border rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التصنيف</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  >
                    <option value="tajweed_pdf">ملف PDF / شروحات</option>
                    <option value="video_tutorial">فيديو تجويد</option>
                    <option value="audio_lesson">تسجيل صبياتي</option>
                    <option value="worksheet">ورقة عمل</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع الملف</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  >
                    <option value="pdf">مستند PDF</option>
                    <option value="video">مقطع فيديو</option>
                    <option value="audio">ملف صوتي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الوصف والإرشادات للطلاب</label>
                <textarea
                  rows={2}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="اكتبي إرشادات دراسة المادة..."
                  className="w-full p-2.5 border rounded-xl font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رابط الملف / الفيديو المباشر</label>
                <input
                  type="text"
                  required
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-mono text-[10px]"
                  dir="ltr"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 text-white font-bold rounded-xl"
                >
                  رفع المادة للمكتبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
