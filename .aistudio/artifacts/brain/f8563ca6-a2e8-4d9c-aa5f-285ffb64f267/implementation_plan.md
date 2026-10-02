# KegiatanKu — Aplikasi Pelacak Aktivitas Harian, Widget Android & Analitik Kolektif

Aplikasi manajemen aktivitas harian bergaya native Android PWA yang mendukung pencatatan checklist, rincian kegiatan, pelacakan target kuantitas (counter/target), simulasi widget beranda Android interaktif, visualisasi kurva rekam jejak progres harian kolektif, kustomisasi tema estetis, serta pencadangan cloud otomatis ke Google Drive pribadi pengguna.

> [!IMPORTANT] Keputusan Kunci & Konfigurasi Desain
> - **Arsitektur Offline-First & PWA**: Seluruh data tersimpan secara lokal dan instan menggunakan LocalStorage/IndexedDB, lengkap dengan Web App Manifest dan Service Worker sehingga dapat diinstal langsung di layar utama Android.
> - **Simulasi Widget Android Interaktif**: Menyediakan modul khusus simulasi widget Android (format 2x2 counter cepat, 4x2 checklist harian, dan 4x4 kurva progres) yang dapat disematkan dan dioperasikan langsung dengan sekali tap tanpa membuka layar penuh.
> - **Penyimpanan Cloud Pribadi Pengguna**: Menyediakan integrasi pencadangan otomatis ke Google Drive akun pengguna secara aman (OAuth client-side) serta ekspor-impor berkas cadangan JSON terenkripsi mandiri.
> - **Kustomisasi Tema**: Sistem palet dinamis (Minimal Clean, AMOLED Pure Black, Material You Dynamic, Emerald Forest, Rose Warmth) dengan font modern yang nyaman dipandang.

---

## 1. Overview & Core Concept

- **What It Does**: Membantu pengguna mencatat, memonitor, dan mengevaluasi aktivitas sehari-hari secara disiplin. Mendukung dua tipe pencatatan utama: **Checklist Tugas/Sub-kegiatan** dan **Target Kuantitatif** (misal: minum 2500 ml air, membaca 15 halaman, 30 menit jalan santai). Dilengkapi visualisasi grafik tren progres harian kolektif untuk memantau konsistensi hidup.
- **Target Audience / Persona**: Individu produktif, pelajar, pekerja mandiri, dan siapa saja yang menginginkan aplikasi pelacak kebiasaan dan kegiatan harian yang cepat, tanpa iklan, beroperasi secara luring (offline), serta memiliki tampilan widget ringkas.
- **Key Value**: Aksesibilitas instan melalui widget layar utama, privasi data 100% di tangan pengguna dengan penyimpanan lokal dan backup cloud pribadi, serta grafik progres yang memotivasi konsistensi harian.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Flow Checklist & Aktivitas Baru**:
   - Pengguna menekan tombol aksi cepat (+) di zona jempol bawah.
   - Memilih tipe kegiatan: *Checklist Standar*, *Rincian Multi-Langkah*, atau *Counter Kuantitatif* (dengan target angka dan satuan).
   - Mengatur jadwal berulang (Setiap Hari, Hari Kerja, Akhir Pekan, atau Kustom), kategori warna, dan rincian catatan.
   - Kegiatan langsung muncul di daftar hari ini dengan indikator progres real-time.
2. **Flow Widget Android Interaktif**:
   - Pengguna dapat beralih ke tab **Widget Studio** untuk menguji dan memvisualisasikan widget beranda Android.
   - Widget 2x2: Tombol counter cepat satu sentuhan (misal: tambah 1 gelas air).
   - Widget 4x2: Agenda ringkas dengan checklist langsung yang memperbarui status seketika.
   - Widget 4x4: Dashboard progres kolektif harian dengan kurva tren mingguan.
3. **Flow Evaluasi Rekam Jejak & Kurva**:
   - Pengguna membuka tab **Analitik & Kurva**.
   - Melihat skor progres harian kolektif (% penyelesaian seluruh target hari ini).
   - Memeriksa kurva tren performa harian (7 hari, 30 hari, 90 hari) dengan grafik kurva halus (smooth spline).
   - Matriks kalender konsistensi (activity heatmap streak) untuk memantau hari-hari paling produktif.
4. **Flow Kustomisasi Tema & Cloud Backup**:
   - Tab **Pengaturan & Cadangan** memungkinkan pemilihan tema visual, mode gelap/terang, dan warna aksen.
   - Mengaktifkan *Pencadangan Otomatis* ke Google Drive pribadi atau mengunduh cadangan instan berkas JSON.

### Visual Identity & Theme
- **Aesthetic Direction**: Minimalis modern terinspirasi oleh Android Material 3, mengutamakan kenyamanan membaca outdoor dan ergonomi satu tangan (*thumb-zone navigation*).
- **Color Palette & Mood**:
  - *Dominant Canvas (60%)*: Bersih netral (#F8FAFC untuk light, #0B0F17 untuk dark, #000000 untuk AMOLED).
  - *Structural Surfaces (30%)*: Kartu berkontur halus dengan sudut membulat modern (`rounded-2xl` 16px), tanpa garis tepi berlebihan.
  - *Accent Budget (10%)*: Aksen dinamis pilihan (Indigo Blue `#4F46E5`, Mint Emerald `#059669`, Amber Sunset `#D97706`, Coral Rose `#E11D48`).
- **Typography & Hierarchy**:
  - Judul & Metrik: Plus Jakarta Sans / Inter dengan bobot SemiBold 600.
  - Angka & Data Kurva: Tabular figures (`tabular-nums`) untuk konsistensi pembacaan statistik.
- **Micro-Interactions**: Haptic visual feedback saat menyelesaikan checklist, animasi counter yang membal lembut (*spring motion*), dan transisi sheet geser ke atas yang mulus.

---

## 3. Key Product Decisions & Trade-Offs

- **PWA Berstandar Android Native vs Web Biasa**:
  - *Pilihan*: Mengonfigurasi Web App Manifest, Service Worker offline, dan tombol instal PWA eksplisit di dalam aplikasi.
  - *Alasan*: Pengguna meminta aplikasi Android; PWA memberikan instalasi ke beranda ponsel tanpa unduhan toko aplikasi yang berat, tetap 100% offline, dan responsif layaknya aplikasi asli.
- **Penyimpanan Lokal Sebagai Sumber Utama (Local-First)**:
  - *Pilihan*: Data disimpan langsung di browser/perangkat pengguna via IndexedDB/LocalStorage reaktif dengan sinkronisasi otomatis ke Google Drive.
  - *Alasan*: Aplikasi tetap dapat digunakan 100% lancar meski tanpa koneksi internet (di pesawat, area minim sinyal), serta menjaga kerahasiaan catatan harian pengguna.
- **Grafik Kurva Kolektif Berbasis Rasio Bobot Kegiatan**:
  - *Pilihan*: Mengombinasikan persentase checklist tuntas dan persentase capaian target kuantitas ke dalam satu indeks harian terpadu (*Collective Daily Completion Index*).
  - *Alasan*: Memberikan gambaran akurat menyeluruh tanpa memisahkan checklist biasa dan target angka secara membingungkan.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KEGIATANKU PWA INTERFACE                        │
│                                                                        │
│   ┌─────────────────────┐   ┌───────────────────┐   ┌──────────────┐   │
│   │ Top Navigation Bar  │   │  Android Status   │   │ Install PWA  │   │
│   │ (Date / Day Picker) │   │  & Offline Badge  │   │ Action Pill  │   │
│   └──────────┬──────────┘   └─────────┬─────────┘   └──────┬───────┘   │
│              │                        │                    │           │
│   ┌──────────┴────────────────────────┴────────────────────┴───────┐   │
│   │                 VIEW ROUTER / ACTIVE TAB ENGINE                │   │
│   │                                                                │   │
│   │  [1. Checklist & Rincian] [2. Widget Hub] [3. Kurva & Progres] │   │
│   │                 [4. Cadangan Cloud & Tema]                     │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────┴────────────────────────────────┐   │
│   │                   REACT STATE & STORAGE LAYER                  │   │
│   │                                                                │   │
│   │  • useActivities (CRUD, Subtasks, Quantities, Target Counters) │   │
│   │  • useAnalytics (Daily Collective Progress, Trend Curves, Hist)│   │
│   │  • useTheme (Custom Palettes, Dark/Light/AMOLED Modes)         │   │
│   │  • useCloudBackup (Google Drive Sync & JSON Auto-Snapshot)     │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────┴────────────────────────────────┐   │
│   │             PERSISTENCE & SYSTEM INTEGRATION                   │   │
│   │                                                                │   │
│   │  • LocalStorage / IndexedDB (Instant Offline Cache)            │   │
│   │  • Service Worker Cache (Vite PWA Offline Fallback)            │   │
│   │  • Google Drive REST API / Client OAuth (Personal Cloud Sync)  │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State
- **Activity Item**:
  - `id`: string (UUID)
  - `title`: string
  - `description`?: string
  - `category`: 'rutinitas' | 'kesehatan' | 'pekerjaan' | 'belajar' | 'ibadah' | 'lainnya'
  - `type`: 'checklist' | 'counter' | 'duration'
  - `targetValue`: number (misal: 10 untuk 10 halaman buku, 2000 untuk ml air)
  - `currentValue`: number (progres kuantitas tercapai)
  - `unit`?: string ('kali', 'menit', 'ml', 'halaman', 'lembar')
  - `subtasks`: Array<{ id: string; text: string; completed: boolean }>
  - `schedule`: 'daily' | 'weekdays' | 'weekends' | 'custom'
  - `customDays`?: number[] (0-6)
  - `color`: string
  - `completed`: boolean
  - `history`: Record<string, { completed: boolean; value: number; subtasksCompleted: number }> (Perekam jejak per tanggal YYYY-MM-DD)
  - `createdAt`: string
  - `updatedAt`: string

- **Backup Configuration**:
  - `provider`: 'google_drive' | 'local_json'
  - `autoBackupEnabled`: boolean
  - `autoBackupInterval`: 'daily' | 'on_change'
  - `lastBackupTimestamp`: string | null
  - `lastBackupStatus`: 'idle' | 'syncing' | 'success' | 'error'

- **Theme Configuration**:
  - `mode`: 'light' | 'dark' | 'amoled' | 'system'
  - `accentColor`: 'indigo' | 'emerald' | 'amber' | 'rose' | 'ocean'
  - `widgetStyle`: 'standard' | 'glassmorphism' | 'material'
