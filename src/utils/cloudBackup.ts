import { ActivityItem, ThemeConfig, CloudBackupConfig } from '../types';
import {
  STORAGE_KEYS,
  loadActivitiesFromStorage,
  loadThemeFromStorage,
  loadBackupConfigFromStorage,
  saveBackupConfigToStorage,
  saveActivitiesToStorage,
} from './storage';

export interface BackupDataPayload {
  app: string;
  version: string;
  exportedAt: string;
  activitiesCount: number;
  activities: ActivityItem[];
  theme: ThemeConfig;
}

// Generate JSON export payload
export function generateBackupPayload(): BackupDataPayload {
  const activities = loadActivitiesFromStorage();
  const theme = loadThemeFromStorage();

  return {
    app: 'MyAct',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    activitiesCount: activities.length,
    activities,
    theme,
  };
}

// Trigger browser download of JSON backup file
export function exportBackupToFile(): { success: boolean; fileName: string; sizeKb: number } {
  try {
    const payload = generateBackupPayload();
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10);
    const timeStamp = now.toTimeString().slice(0, 5).replace(':', '-');
    const fileName = `MyAct_Backup_${dateStamp}_${timeStamp}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Update backup config
    const currentConfig = loadBackupConfigFromStorage();
    const updatedConfig: CloudBackupConfig = {
      ...currentConfig,
      lastBackupTime: new Date().toISOString(),
      lastBackupFileName: fileName,
      lastBackupSize: Math.round(blob.size / 1024),
    };
    saveBackupConfigToStorage(updatedConfig);

    return {
      success: true,
      fileName,
      sizeKb: Math.round(blob.size / 1024),
    };
  } catch (err) {
    console.error('Export failed:', err);
    return { success: false, fileName: '', sizeKb: 0 };
  }
}

// Validate and parse an imported JSON file
export async function parseBackupFile(file: File): Promise<{
  valid: boolean;
  message: string;
  payload?: BackupDataPayload;
}> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, message: 'Format berkas tidak valid.' };
    }

    if (!Array.isArray(parsed.activities)) {
      return { valid: false, message: 'Berkas tidak memuat daftar kegiatan yang valid.' };
    }

    // Check basic integrity of items
    const validActivities = parsed.activities.filter(
      (a: any) => a && typeof a.id === 'string' && typeof a.title === 'string'
    );

    if (validActivities.length === 0) {
      return { valid: false, message: 'Tidak ditemukan kegiatan valid dalam berkas.' };
    }

    return {
      valid: true,
      message: `Ditemukan ${validActivities.length} kegiatan valid (Cadangan: ${parsed.exportedAt || 'Tidak diketahui'}).`,
      payload: {
        app: parsed.app || 'KegiatanKu',
        version: parsed.version || '1.0.0',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        activitiesCount: validActivities.length,
        activities: validActivities,
        theme: parsed.theme || loadThemeFromStorage(),
      },
    };
  } catch (err) {
    console.error('Parse backup error:', err);
    return { valid: false, message: 'Gagal membaca berkas JSON. Pastikan berkas tidak rusak.' };
  }
}

// Restore data from payload
export function restoreBackupData(payload: BackupDataPayload): boolean {
  try {
    if (!payload.activities || !Array.isArray(payload.activities)) return false;
    saveActivitiesToStorage(payload.activities);
    if (payload.theme) {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(payload.theme));
    }
    return true;
  } catch (err) {
    console.error('Restore error:', err);
    return false;
  }
}

// Client-side Google Drive Sync Engine
// Handles Google Drive Personal Cloud Backup via Web API / Drive File Picker
export class GoogleDriveSyncService {
  private static ACCESS_TOKEN_KEY = 'kegiatanku_gdrive_token';

  static getStoredToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static storeToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static clearToken(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  // Backup to Google Drive
  static async backupToDrive(accessToken?: string): Promise<{ success: boolean; message: string; fileId?: string }> {
    const token = accessToken || this.getStoredToken();
    if (!token) {
      return {
        success: false,
        message: 'Google Drive belum terhubung. Silakan login atau hubungkan akun Google Anda terlebih dahulu.',
      };
    }

    try {
      const payload = generateBackupPayload();
      const fileContent = JSON.stringify(payload, null, 2);
      const fileName = 'MyAct_AutoBackup.json';

      const metadata = {
        name: fileName,
        mimeType: 'application/json',
        description: 'Pencadangan Otomatis Data MyAct Pengguna',
      };

      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        closeDelim;

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Drive API error: ${response.status} ${errorText}`);
      }

      const resData = await response.json();
      
      const config = loadBackupConfigFromStorage();
      saveBackupConfigToStorage({
        ...config,
        lastBackupTime: new Date().toISOString(),
        lastBackupFileName: fileName,
        googleDriveLinked: true,
      });

      return {
        success: true,
        message: 'Berhasil dicadangkan ke Google Drive pribadi!',
        fileId: resData.id,
      };
    } catch (err: any) {
      console.error('Google Drive backup error:', err);
      return {
        success: false,
        message: err.message || 'Gagal menyinkronkan ke Google Drive.',
      };
    }
  }
}
