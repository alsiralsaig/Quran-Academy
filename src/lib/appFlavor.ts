/**
 * وضع التطبيق المنفصل: تطبيقات الأندرويد التلاتة (إدارة / معلمة / طالب) بتفتح نفس الموقع،
 * وبتعرّف نفسها في الـ User-Agent بـ «ItqanApp/<role>». للتجربة في المتصفح: ‎?app=teacher
 * في الوضع ده الموقع بيقفل على بوابة الدور ده بس.
 */
export type AppFlavor = 'admin' | 'teacher' | 'student';

const VALID = ['admin', 'teacher', 'student'];

function detect(): AppFlavor | null {
  if (typeof window === 'undefined') return null;
  const ua = navigator.userAgent.match(/ItqanApp\/(admin|teacher|student)/);
  if (ua) return ua[1] as AppFlavor;
  try {
    const q = new URLSearchParams(location.search).get('app');
    if (q === 'web') {
      sessionStorage.removeItem('itqan_app');
      return null;
    }
    if (q && VALID.includes(q)) {
      sessionStorage.setItem('itqan_app', q);
      return q as AppFlavor;
    }
    const s = sessionStorage.getItem('itqan_app');
    if (s && VALID.includes(s)) return s as AppFlavor;
  } catch {
    /* التخزين ممنوع */
  }
  return null;
}

export const APP_FLAVOR: AppFlavor | null = detect();
export const IS_NATIVE_APP = typeof navigator !== 'undefined' && /ItqanApp\//.test(navigator.userAgent);

export const FLAVOR_INFO: Record<AppFlavor, { name: string; portal: string; hint: string }> = {
  admin: { name: 'إدارة إتقان', portal: 'الإدارة', hint: 'لوحة الإدارة: المعلمات والاشتراكات والإيصالات' },
  teacher: { name: 'معلمة إتقان', portal: 'المعلمة', hint: 'حلقاتك وطلابك وتسجيل الحصص' },
  student: { name: 'طالب إتقان', portal: 'الطالب', hint: 'حفظك ومواعيد حصصك ومعلمتك' },
};
