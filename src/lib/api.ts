// عميل الـ API — كل الطلبات بتمشي لنفس الموقع (‎/api) والجلسة في كوكي HttpOnly.

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        'x-qa-client': '1',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'ما في اتصال بالإنترنت — تأكد من الشبكة وجرّب تاني');
  }
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* ردود غير JSON */
  }
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `خطأ ${res.status}`);
  }
  return data as T;
}

/** يصغّر صورة الإيصال قبل الرفع (أقصى ضلع 1600px، JPEG) — عادة أقل من 400KB */
export async function compressImage(file: File, maxSide = 1600, quality = 0.75): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('الملف لازم يكون صورة');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('ما قدرنا نقرأ الصورة'));
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** «منذ 5 دقائق» من تاريخ ISO */
export function relativeTimeAr(iso?: string): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return iso;
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return 'الآن';
  const m = Math.floor(s / 60);
  if (m < 60) return m === 1 ? 'منذ دقيقة' : m === 2 ? 'منذ دقيقتين' : m <= 10 ? `منذ ${m} دقائق` : `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return h === 1 ? 'منذ ساعة' : h === 2 ? 'منذ ساعتين' : h <= 10 ? `منذ ${h} ساعات` : `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d < 7) return d === 1 ? 'أمس' : d === 2 ? 'منذ يومين' : `منذ ${d} أيام`;
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}
