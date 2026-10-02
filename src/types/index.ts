export interface CategoryItem {
  id: string;
  label: string;
  color: string;
  isDefault?: boolean;
}

export type ActivityCategory = string;

export type ActivityType = 'checklist' | 'counter' | 'duration';

export type ScheduleFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface ActivityHistoryEntry {
  completed: boolean;
  value: number; // for counter/duration
  targetValue: number;
  subtasksCompleted: number;
  totalSubtasks: number;
  notes?: string;
  timestamp: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  type: ActivityType;
  targetValue: number;
  currentValue: number;
  unit?: string; // e.g., 'gelas', 'halaman', 'menit', 'ml', 'rakaat', 'kali'
  stepSize?: number; // e.g., 250 for water 250ml per tap
  subtasks: SubTask[];
  schedule: ScheduleFrequency;
  customDays?: number[]; // 0: Sun, 1: Mon, ... 6: Sat
  scheduledTime?: string; // e.g. "07:00"
  color: string;
  completed: boolean;
  history: Record<string, ActivityHistoryEntry>; // key: 'YYYY-MM-DD'
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = 'light' | 'dark' | 'amoled';

export type AccentColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'ocean' | 'violet';

export interface ThemeConfig {
  mode: ThemeMode;
  accent: AccentColor;
}

export interface CloudBackupConfig {
  autoBackupEnabled: boolean;
  provider: 'google_drive' | 'local_json';
  lastBackupTime: string | null;
  lastBackupFileName?: string;
  lastBackupSize?: number;
  googleDriveLinked: boolean;
  googleDriveUserEmail?: string;
}

export interface DailyCollectiveScore {
  date: string;
  dateLabel: string;
  dayName: string;
  totalActivities: number;
  completedActivities: number;
  completionRate: number; // 0 - 100
  totalCounterProgress: number; // 0 - 100
  collectiveScore: number; // weighted 0 - 100
}
