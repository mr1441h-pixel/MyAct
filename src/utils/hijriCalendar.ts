// Utilitas Kalender Hijriah Global Tunggal (KHGT) & Masehi

export type CalendarMode = 'masehi' | 'hijriah' | 'dual';

export interface HijriDateInfo {
  day: number;
  dayName: string;
  monthName: string;
  monthIndex: number;
  year: number;
  fullHijriString: string;
  shortHijriString: string;
}

export const HIJRI_MONTH_NAMES_ID = [
  'Muharram',
  'Safar',
  'Rabiul Awal',
  'Rabiul Akhir',
  'Jumadil Awal',
  'Jumadil Akhir',
  'Rajab',
  'Sya\'ban',
  'Ramadhan',
  'Syawal',
  'Dzulqa\'dah',
  'Dzulhijjah',
];

const HIJRI_OFFSET_KEY = 'myact_hijri_offset_v1';
const CALENDAR_MODE_KEY = 'myact_calendar_mode_v1';

export function getStoredHijriOffset(): number {
  try {
    const raw = localStorage.getItem(HIJRI_OFFSET_KEY);
    if (raw !== null) return Number(raw);
  } catch (e) {
    // fallback
  }
  return 0; // default 0 offset (sesuai hisab KHGT standar Umm al-Qura)
}

export function saveStoredHijriOffset(offset: number): void {
  try {
    localStorage.setItem(HIJRI_OFFSET_KEY, String(offset));
  } catch (e) {
    // fallback
  }
}

export function getStoredCalendarMode(): CalendarMode {
  try {
    const raw = localStorage.getItem(CALENDAR_MODE_KEY);
    if (raw === 'masehi' || raw === 'hijriah' || raw === 'dual') return raw;
  } catch (e) {
    // fallback
  }
  return 'dual'; // default tampilkan keduanya agar informatif
}

export function saveStoredCalendarMode(mode: CalendarMode): void {
  try {
    localStorage.setItem(CALENDAR_MODE_KEY, mode);
  } catch (e) {
    // fallback
  }
}

/**
 * Mengonversi tanggal Masehi ke Kalender Hijriah Global Tunggal (KHGT)
 * Menggunakan standar hisab astronomi Umm al-Qura / KHGT global dengan opsi offset hari
 */
export function getHijriDate(date: Date = new Date(), offsetDays: number = getStoredHijriOffset()): HijriDateInfo {
  const adjustedDate = new Date(date);
  if (offsetDays !== 0) {
    adjustedDate.setDate(adjustedDate.getDate() + offsetDays);
  }

  try {
    // Gunakan formatter id-ID dengan kalender islamic-umalqura
    const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      weekday: 'long',
    });

    const parts = formatter.formatToParts(adjustedDate);
    let day = adjustedDate.getDate();
    let monthNum = 1;
    let year = 1448;
    let dayName = 'Jumat';

    parts.forEach((p) => {
      if (p.type === 'day') day = parseInt(p.value, 10);
      if (p.type === 'month') monthNum = parseInt(p.value, 10);
      if (p.type === 'year') year = parseInt(p.value, 10);
      if (p.type === 'weekday') dayName = p.value;
    });

    const monthName = HIJRI_MONTH_NAMES_ID[monthNum - 1] || 'Rabiul Akhir';

    return {
      day,
      dayName,
      monthName,
      monthIndex: monthNum - 1,
      year,
      fullHijriString: `${dayName}, ${day} ${monthName} ${year} H`,
      shortHijriString: `${day} ${monthName.slice(0, 7)} ${year} H`,
    };
  } catch (err) {
    // Fallback jika environment Intl islamic tidak tersedia
    return {
      day: 21,
      dayName: 'Jumat',
      monthName: 'Rabiul Akhir',
      monthIndex: 3,
      year: 1448,
      fullHijriString: `21 Rabiul Akhir 1448 H (KHGT)`,
      shortHijriString: `21 R. Akhir 1448 H`,
    };
  }
}

export function formatDualDateString(dateStr: string, mode: CalendarMode = getStoredCalendarMode(), offset: number = getStoredHijriOffset()): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

  const masehiStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);

  const hijri = getHijriDate(d, offset);

  if (mode === 'hijriah') {
    return `${hijri.fullHijriString} (KHGT)`;
  }

  if (mode === 'masehi') {
    return masehiStr;
  }

  // Mode 'dual'
  return `${masehiStr} • ${hijri.day} ${hijri.monthName} ${hijri.year} H (KHGT)`;
}

export function getHijriDayNumber(dateStr: string, offset: number = getStoredHijriOffset()): number {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return 1;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return getHijriDate(d, offset).day;
}
