import { ActivityItem, ThemeConfig, CloudBackupConfig, CategoryItem } from '../types';

export const STORAGE_KEYS = {
  ACTIVITIES: 'kegiatanku_activities_v1',
  THEME: 'kegiatanku_theme_v1',
  BACKUP_CONFIG: 'kegiatanku_backup_config_v1',
  BACKUP_SNAPSHOTS: 'kegiatanku_backup_snapshots_v1',
  CATEGORIES: 'kegiatanku_categories_v1',
};

// Format date to YYYY-MM-DD
export function formatDateKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadableDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(d);
}

// Generate realistic mock history for the past N days to display nice curve charts immediately
function generateSeedHistory(completedProb: number, valueRatio: number) {
  const history: Record<string, any> = {};
  const today = new Date();
  
  for (let i = 14; i >= 1; i--) {
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - i);
    const dateKey = formatDateKey(pastDate);
    
    // Deterministic variation based on day
    const seed = (pastDate.getDate() * 17 + i * 23) % 100;
    const isCompleted = seed > (1 - completedProb) * 100;
    const calculatedValue = isCompleted ? valueRatio : Math.max(0, Math.round(valueRatio * (seed / 100)));

    history[dateKey] = {
      completed: isCompleted,
      value: calculatedValue,
      targetValue: valueRatio,
      subtasksCompleted: isCompleted ? 3 : 1,
      totalSubtasks: 3,
      timestamp: pastDate.toISOString(),
    };
  }
  return history;
}

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Sholat Subuh & Doa Pagi',
    description: 'Awali pagi dengan ketenangan spiritual dan bersyukur',
    category: 'ibadah',
    type: 'checklist',
    targetValue: 1,
    currentValue: 1,
    subtasks: [
      { id: 'sub-1', text: 'Sholat Subuh tepat waktu', completed: true },
      { id: 'sub-2', text: 'Dzikir pagi 5 menit', completed: true },
      { id: 'sub-3', text: 'Doa pembuka rezeki', completed: true },
    ],
    schedule: 'daily',
    scheduledTime: '05:00',
    color: '#059669', // Emerald
    completed: true,
    history: generateSeedHistory(0.9, 1),
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'act-2',
    title: 'Minum Air Mineral',
    description: 'Jaga hidrasi tubuh tetap optimal sepanjang hari',
    category: 'kesehatan',
    type: 'counter',
    targetValue: 2000,
    currentValue: 1500,
    unit: 'ml',
    stepSize: 250,
    subtasks: [],
    schedule: 'daily',
    scheduledTime: '08:00',
    color: '#0284C7', // Ocean Sky
    completed: false,
    history: generateSeedHistory(0.75, 2000),
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'act-3',
    title: 'Olahraga & Peregangan Tubuh',
    description: 'Lari santai, push-up, atau peregangan otot dinamis',
    category: 'olahraga',
    type: 'duration',
    targetValue: 30,
    currentValue: 30,
    unit: 'menit',
    stepSize: 10,
    subtasks: [
      { id: 'sub-31', text: 'Pemanasan 5 menit', completed: true },
      { id: 'sub-32', text: 'Kardio / Workout 20 menit', completed: true },
      { id: 'sub-33', text: 'Pendinginan & hidrasi', completed: true },
    ],
    schedule: 'daily',
    scheduledTime: '06:30',
    color: '#E11D48', // Rose
    completed: true,
    history: generateSeedHistory(0.7, 30),
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'act-4',
    title: 'Tuntaskan Prioritas Pekerjaan Utama',
    description: 'Fokus pengerjaan tugas high-impact tanpa distraksi ponsel',
    category: 'pekerjaan',
    type: 'checklist',
    targetValue: 1,
    currentValue: 0,
    subtasks: [
      { id: 'sub-41', text: 'Review to-do list & target sprint', completed: true },
      { id: 'sub-42', text: 'Selesaikan laporan analitik utama', completed: false },
      { id: 'sub-43', text: 'Balas email & koordinasi tim', completed: false },
    ],
    schedule: 'weekdays',
    scheduledTime: '09:00',
    color: '#4F46E5', // Indigo
    completed: false,
    history: generateSeedHistory(0.85, 1),
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'act-5',
    title: 'Membaca Buku Produktif',
    description: 'Membaca buku pengetahuan, psikologi, atau bisnis',
    category: 'belajar',
    type: 'counter',
    targetValue: 15,
    currentValue: 10,
    unit: 'halaman',
    stepSize: 5,
    subtasks: [],
    schedule: 'daily',
    scheduledTime: '20:30',
    color: '#D97706', // Amber
    completed: false,
    history: generateSeedHistory(0.65, 15),
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'act-6',
    title: 'Refleksi Harian & Catatan Esok Hari',
    description: 'Tulis 3 hal yang disyukuri dan rencanakan prioritas besok',
    category: 'rutinitas',
    type: 'checklist',
    targetValue: 1,
    currentValue: 0,
    subtasks: [
      { id: 'sub-61', text: 'Cek persentase checklist hari ini', completed: false },
      { id: 'sub-62', text: 'Tulis catatan jurnal pendek', completed: false },
    ],
    schedule: 'daily',
    scheduledTime: '21:30',
    color: '#7C3AED', // Violet
    completed: false,
    history: generateSeedHistory(0.6, 1),
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_THEME: ThemeConfig = {
  mode: 'dark',
  accent: 'indigo',
};

export const DEFAULT_BACKUP_CONFIG: CloudBackupConfig = {
  autoBackupEnabled: true,
  provider: 'google_drive',
  lastBackupTime: null,
  googleDriveLinked: false,
};

export function loadActivitiesFromStorage(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
      return INITIAL_ACTIVITIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ACTIVITIES;
  } catch (err) {
    console.error('Failed reading activities from storage:', err);
    return INITIAL_ACTIVITIES;
  }
}

export function saveActivitiesToStorage(activities: ActivityItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (err) {
    console.error('Failed saving activities to storage:', err);
  }
}

export function loadThemeFromStorage(): ThemeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading theme:', err);
  }
  return DEFAULT_THEME;
}

export function saveThemeToStorage(theme: ThemeConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
  } catch (err) {
    console.error('Error saving theme:', err);
  }
}

export function loadBackupConfigFromStorage(): CloudBackupConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BACKUP_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading backup config:', err);
  }
  return DEFAULT_BACKUP_CONFIG;
}

export function saveBackupConfigToStorage(config: CloudBackupConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BACKUP_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving backup config:', err);
  }
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'ibadah', label: 'Ibadah', color: '#059669', isDefault: true },
  { id: 'kesehatan', label: 'Kesehatan', color: '#0284C7', isDefault: true },
  { id: 'olahraga', label: 'Olahraga', color: '#E11D48', isDefault: true },
  { id: 'pekerjaan', label: 'Pekerjaan', color: '#4F46E5', isDefault: true },
  { id: 'belajar', label: 'Belajar', color: '#D97706', isDefault: true },
  { id: 'rutinitas', label: 'Rutinitas', color: '#7C3AED', isDefault: true },
  { id: 'lainnya', label: 'Lainnya', color: '#64748B', isDefault: true },
];

export function loadCategoriesFromStorage(): CategoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Error loading categories:', err);
  }
  return DEFAULT_CATEGORIES;
}

export function saveCategoriesToStorage(categories: CategoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Error saving categories:', err);
  }
}

