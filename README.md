# KenFlow

**Kendali Alur Keuanganmu**

KenFlow adalah aplikasi pencatatan pengeluaran harian yang dirancang untuk membantu kamu merasa lebih memegang kendali atas keuangan. Cepat, simpel, dan selalu siap digunakan — bahkan tanpa koneksi internet.

## Fitur Utama

- **Input cepat** — catat transaksi dalam hitungan detik. Cukup ketik nama dan nominal, contoh: `coffee 15k`.
- **Navigasi harian** — Geser antar hari dengan tombol prev/next untuk melihat pengeluaran kapan saja.
- **Total pengeluaran harian** — Langsung lihat berapa yang sudah kamu belanjakan hari ini.
- **Insight harian** — Kenali kebiasaan belanjamu. Apakah kamu lebih boros atau lebih hemat dibanding kemarin?
- **Evaluasi bulanan** — Rangkuman lengkap per bulan: total, rata-rata per hari, hari paling boros, dan hari paling hemat.
- **Offline support** — Berjalan tanpa internet. Semua data tersimpan secara lokal di perangkatmu.

## Tech Stack

- React + TypeScript (Vite)
- Tailwind CSS
- Zustand
- IndexedDB (idb)
- Progressive Web App (PWA)

## Cara Menjalankan

```bash
npm install
npm run dev
npm run build
```

`npm run dev` memulai server development di http://localhost:5173. `npm run build` menghasilkan output production ke folder `dist/`.

## Struktur Folder

```
src/
  components/    # Komponen UI kecil (Header, SummaryCard, InputBar, dll)
  pages/         # Halaman utama (HomePage, MonthlyEvaluationPage)
  store/        # State management dengan Zustand
  db/            # Konfigurasi dan operasi IndexedDB
public/
  icons/         # Ikon PWA (192x192, 512x512)
  manifest.webmanifest
```

## Catatan

- Semua data disimpan secara lokal di IndexedDB pada perangkat ini, tanpa backend maupun cloud sync.
- Disarankan untuk melakukan backup data secara berkala (misalnya melalui DevTools browser) agar data tetap aman.
