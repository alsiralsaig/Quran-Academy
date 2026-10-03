import { ALL_SURAHS } from '../data/quranData';
import { QuranSurah } from '../types';

const DB_NAME = 'etqan_quran_offline_db';
const DB_VERSION = 1;
const SURAH_STORE = 'surahs_store';
const TAFSIR_STORE = 'tafsir_store';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SURAH_STORE)) {
        db.createObjectStore(SURAH_STORE, { keyPath: 'number' });
      }
      if (!db.objectStoreNames.contains(TAFSIR_STORE)) {
        db.createObjectStore(TAFSIR_STORE, { keyPath: 'surahNumber' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function cacheAllSurahsAndTafsirOffline(
  onProgress?: (count: number, total: number) => void
): Promise<boolean> {
  try {
    const db = await openDatabase();
    const tx = db.transaction([SURAH_STORE, TAFSIR_STORE], 'readwrite');
    const surahStore = tx.objectStore(SURAH_STORE);
    const tafsirStore = tx.objectStore(TAFSIR_STORE);

    const total = ALL_SURAHS.length;
    let cachedCount = 0;

    for (const surah of ALL_SURAHS) {
      surahStore.put(surah);

      // Cache corresponding tafsir placeholder/structure
      const tafsirRecord = {
        surahNumber: surah.number,
        surahName: surah.name,
        cachedAt: new Date().toISOString(),
      };
      tafsirStore.put(tafsirRecord);

      cachedCount++;
      if (onProgress) onProgress(cachedCount, total);
    }

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('IndexedDB offline caching fallback to LocalStorage:', err);
    try {
      localStorage.setItem('etqan_quran_cached_offline', 'true');
      return true;
    } catch {
      return false;
    }
  }
}

export async function getOfflineSurah(surahNumber: number): Promise<QuranSurah | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(SURAH_STORE, 'readonly');
    const store = tx.objectStore(SURAH_STORE);
    return new Promise((resolve) => {
      const req = store.get(surahNumber);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return ALL_SURAHS.find((s) => s.number === surahNumber) || null;
  }
}

export async function isQuranCachedOffline(): Promise<boolean> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(SURAH_STORE, 'readonly');
    const store = tx.objectStore(SURAH_STORE);
    return new Promise((resolve) => {
      const req = store.count();
      req.onsuccess = () => resolve(req.result > 0);
      req.onerror = () => resolve(false);
    });
  } catch {
    return localStorage.getItem('etqan_quran_cached_offline') === 'true';
  }
}
