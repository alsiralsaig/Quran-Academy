// تنزيل المصحف للاستعمال بدون إنترنت — تنزيل حقيقي:
//  • النص العثماني + التفسير الميسر لكل السور  → IndexedDB (حوالي 1 ميغا مضغوط)
//  • تلاوة كل آية بصوت القارئ المختار          → Cache Storage (ملفات mp3 من everyayah.com)
// التنزيل بيكمل من وين وقف (الملفات المحفوظة ما بتتنزّل تاني).

import { ALL_SURAHS, getAyahAudioUrl } from '../data/quranData';
import type { QuranAyah } from '../types';

const DB_NAME = 'etqan_quran_offline_db';
const DB_VERSION = 2;
const TEXT_STORE = 'surah_text_v2';
const AUDIO_CACHE = 'etqan-quran-audio-v1';

export const TOTAL_AYAHS = 6236;

/** الحجم التقريبي لتلاوة المصحف كامل لكل قارئ (ميغابايت) */
export const RECITER_SIZE_MB: Record<string, number> = {
  afasy: 1150,
  minshawi: 1300,
  husary: 1450,
  ghamadi: 380,
  abdulbasit: 2400,
};

export const formatMB = (mb: number): string =>
  mb >= 1000 ? `${(mb / 1024).toFixed(1)} غيغابايت` : `${Math.max(1, Math.round(mb))} ميغابايت`;

/* ------------------------------ IndexedDB ------------------------------ */

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      // المخازن القديمة كانت بتحفظ أسماء السور بس (ما فيها آيات) — نشيلها
      for (const old of ['surahs_store', 'tafsir_store']) {
        if (db.objectStoreNames.contains(old)) db.deleteObjectStore(old);
      }
      if (!db.objectStoreNames.contains(TEXT_STORE)) db.createObjectStore(TEXT_STORE, { keyPath: 'number' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

interface StoredSurah {
  number: number;
  ayahs: QuranAyah[];
  savedAt: string;
}

export async function saveSurahText(number: number, ayahs: QuranAyah[]): Promise<void> {
  if (!ayahs.length) return;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(TEXT_STORE, 'readwrite');
      tx.objectStore(TEXT_STORE).put({ number, ayahs, savedAt: new Date().toISOString() } as StoredSurah);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    /* التخزين غير متاح — عادي */
  }
}

export async function getOfflineSurahAyahs(number: number): Promise<QuranAyah[] | null> {
  try {
    const db = await openDatabase();
    return await new Promise((resolve) => {
      const req = db.transaction(TEXT_STORE, 'readonly').objectStore(TEXT_STORE).get(number);
      req.onsuccess = () => resolve((req.result as StoredSurah | undefined)?.ayahs || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function countOfflineTextSurahs(): Promise<number> {
  try {
    const db = await openDatabase();
    return await new Promise((resolve) => {
      const req = db.transaction(TEXT_STORE, 'readonly').objectStore(TEXT_STORE).count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

/** للتوافق مع الكود القديم */
export async function isQuranCachedOffline(): Promise<boolean> {
  return (await countOfflineTextSurahs()) >= ALL_SURAHS.length;
}

/** تنزيل نص المصحف كامل + التفسير الميسر (طلبين فقط) */
export async function downloadQuranText(onProgress?: (msg: string) => void): Promise<boolean> {
  try {
    onProgress?.('جاري تنزيل نص المصحف...');
    const [textRes, tafsirRes] = await Promise.all([
      fetch('https://api.alquran.cloud/v1/quran/quran-uthmani'),
      fetch('https://api.alquran.cloud/v1/quran/ar.muyassar'),
    ]);
    if (!textRes.ok) throw new Error('text');
    const text = await textRes.json();
    onProgress?.('جاري تنزيل التفسير الميسر...');
    const tafsir = tafsirRes.ok ? await tafsirRes.json().catch(() => null) : null;
    const surahs: any[] = text?.data?.surahs || [];
    const tSurahs: any[] = tafsir?.data?.surahs || [];
    if (surahs.length !== 114) throw new Error('incomplete');

    onProgress?.('جاري الحفظ في الجهاز...');
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(TEXT_STORE, 'readwrite');
      const store = tx.objectStore(TEXT_STORE);
      surahs.forEach((s, si) => {
        const tAyahs: any[] = tSurahs[si]?.ayahs || [];
        const ayahs: QuranAyah[] = (s.ayahs || []).map((a: any, idx: number) => ({
          number: a.number,
          text: a.text,
          numberInSurah: a.numberInSurah,
          juz: a.juz,
          page: a.page,
          tafsirText: tAyahs[idx]?.text || a.text,
        }));
        store.put({ number: s.number, ayahs, savedAt: new Date().toISOString() } as StoredSurah);
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    requestPersistentStorage();
    return true;
  } catch (e) {
    console.warn('downloadQuranText failed', e);
    return false;
  }
}

/* ------------------------------ الصوت ------------------------------ */

const hasCacheApi = () => typeof caches !== 'undefined';

export function requestPersistentStorage(): void {
  try {
    navigator.storage?.persist?.();
  } catch {
    /* */
  }
}

export async function storageEstimate(): Promise<{ usedMB: number; freeMB: number } | null> {
  try {
    const e = await navigator.storage?.estimate?.();
    if (!e || !e.quota) return null;
    return { usedMB: (e.usage || 0) / 1048576, freeMB: (e.quota - (e.usage || 0)) / 1048576 };
  } catch {
    return null;
  }
}

function surahAudioUrls(reciterId: string, surahNumber: number): string[] {
  const s = ALL_SURAHS.find((x) => x.number === surahNumber);
  if (!s) return [];
  return Array.from({ length: s.numberOfAyahs }, (_, i) => getAyahAudioUrl(surahNumber, i + 1, reciterId));
}

/** مجموعة روابط الآيات المحفوظة لقارئ معيّن */
async function cachedUrlSet(): Promise<Set<string>> {
  if (!hasCacheApi()) return new Set();
  const cache = await caches.open(AUDIO_CACHE);
  const keys = await cache.keys();
  return new Set(keys.map((r) => r.url));
}

export interface AudioStatus {
  total: number;
  cached: number;
}

export async function audioStatus(reciterId: string, surahNumber?: number): Promise<AudioStatus> {
  const set = await cachedUrlSet();
  const surahs = surahNumber ? [surahNumber] : ALL_SURAHS.map((s) => s.number);
  let total = 0;
  let cached = 0;
  for (const n of surahs) {
    for (const u of surahAudioUrls(reciterId, n)) {
      total++;
      if (set.has(u)) cached++;
    }
  }
  return { total, cached };
}

/**
 * تنزيل تلاوة سورة أو المصحف كامل. بيتخطّى المحفوظ، و4 تنزيلات في نفس الوقت.
 * signal لإيقاف التنزيل (بيكمل بعدين من نفس المكان).
 */
export async function downloadAudio(
  reciterId: string,
  surahNumbers: number[],
  onProgress: (done: number, total: number, failed: number) => void,
  signal?: AbortSignal,
): Promise<{ done: number; total: number; failed: number }> {
  if (!hasCacheApi()) throw new Error('جهازك ما بيدعم التخزين بدون إنترنت');
  requestPersistentStorage();
  const cache = await caches.open(AUDIO_CACHE);
  const have = await cachedUrlSet();
  const all = surahNumbers.flatMap((n) => surahAudioUrls(reciterId, n));
  const todo = all.filter((u) => !have.has(u));
  const total = all.length;
  let done = total - todo.length;
  let failed = 0;
  onProgress(done, total, failed);

  let i = 0;
  const worker = async () => {
    while (i < todo.length) {
      if (signal?.aborted) return;
      const url = todo[i++];
      let ok = false;
      for (let attempt = 0; attempt < 3 && !ok && !signal?.aborted; attempt++) {
        try {
          const res = await fetch(url, { signal, mode: 'cors' });
          if (res.ok) {
            await cache.put(url, res);
            ok = true;
          }
        } catch (e) {
          if ((e as Error).name === 'QuotaExceededError') throw new Error('مساحة التخزين في الجهاز امتلأت');
          if (signal?.aborted) return;
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        }
      }
      if (ok) done++;
      else if (!signal?.aborted) failed++;
      onProgress(done, total, failed);
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  return { done, total, failed };
}

export async function deleteReciterAudio(reciterId: string): Promise<number> {
  if (!hasCacheApi()) return 0;
  const cache = await caches.open(AUDIO_CACHE);
  const sample = getAyahAudioUrl(1, 1, reciterId).replace(/001001\.mp3$/, '');
  const keys = await cache.keys();
  let n = 0;
  for (const k of keys) {
    if (k.url.startsWith(sample)) {
      await cache.delete(k);
      n++;
    }
  }
  return n;
}

/** رابط تشغيل الآية: من الذاكرة لو محفوظة، غير كدا من الإنترنت */
const blobUrls = new Map<string, string>();
export async function getPlayableAyahUrl(surahNumber: number, ayahInSurah: number, reciterId: string): Promise<string> {
  const url = getAyahAudioUrl(surahNumber, ayahInSurah, reciterId);
  if (!hasCacheApi()) return url;
  try {
    if (blobUrls.has(url)) return blobUrls.get(url)!;
    const cache = await caches.open(AUDIO_CACHE);
    const res = await cache.match(url);
    if (!res) return url;
    const blob = await res.blob();
    const obj = URL.createObjectURL(blob);
    blobUrls.set(url, obj);
    // نحتفظ بآخر 30 بس عشان الذاكرة
    if (blobUrls.size > 30) {
      const [k, v] = blobUrls.entries().next().value as [string, string];
      URL.revokeObjectURL(v);
      blobUrls.delete(k);
    }
    return obj;
  } catch {
    return url;
  }
}
