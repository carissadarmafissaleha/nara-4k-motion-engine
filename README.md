# NARA 🎬✨

### Commercial 4K & Apple ProRes 4444 Motion Studio Engine

[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-zinc.svg?style=flat-square)](#-instalasi--menjalankan-aplikasi)
[![Windows Portable](https://img.shields.io/badge/Windows-Portable%20EXE%20Ready-zinc.svg?style=flat-square)](#-build-file-exe-portable-windows)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%20%7C%2020%20%7C%2022%20LTS-zinc.svg?style=flat-square)](https://nodejs.org)
[![Microstock Ready](https://img.shields.io/badge/Microstock-Adobe%20Stock%20%7C%20Shutterstock-zinc.svg?style=flat-square)](#-metadata--csv-otomatis)
[![UI Design](https://img.shields.io/badge/UI-shadcn%2Fui%20Monochrome%20Zinc-zinc.svg?style=flat-square)](https://ui.shadcn.com)

> ⚡ **Aplikasi desktop offline untuk merender animasi HTML5/Canvas/WebGL menjadi video 4K MP4 & Apple ProRes 4444 Alpha MOV tanpa file temporer (zero temp files), dilengkapi auto-metadata CSV dan ekstensi browser companion.**

<p align="center">
  <img src="screenshoot/Screenshot%201.png" alt="NARA Motion Studio - Live Preview & Batch Queue" width="100%" />
</p>

---

## ⚡ Fitur Utama

- **Zero Temp Files Rendering**: Frame dialirkan langsung dari headless Chromium ke stdin FFmpeg via RAM streaming memory pipe tanpa menulis ribuan file gambar PNG ke disk.
- **Apple ProRes 4444 Alpha**: Output `.mov` transparan siap pakai untuk overlay di Adobe Premiere Pro, After Effects, dan DaVinci Resolve.
- **Mastering 4K Bebas Banding**: Presisi tinggi `-sws_flags spline`, adaptif `aq-mode=3`, dan parameter warna BT.709 untuk gradasi warna halus dan jernih.
- **Auto Metadata CSV (Safe Append)**: Ekspor metadata otomatis ke `metadata_export.csv` yang langsung kompatibel dengan portal upload **Adobe Stock** dan **Shutterstock**.
- **Embedded In-File Tags**: Judul, deskripsi, dan keywords tertanam langsung pada kontainer MP4/MOV.
- **Studio Generator 6 Kategori**: Template siap render untuk *Kinetic Typography, Particle FX, Isometric 3D, Data Visualization, Abstract Motion,* dan *Flat Animation*.
- **Desain shadcn/ui Monochrome Zinc**: Tampilan modern, minimalis, mendukung Dark & Light Mode, serta audio notifikasi selesai (Web Audio API).
- **Multi-Bahasa (10 Bahasa)**: Mendukung EN *(Default)*, ID, JA, ZH, ES, DE, FR, PT, RU, dan KO termasuk penerjemahan dinamis pada log terminal.

---

## 🚀 Panduan Memulai

### Prasyarat
- **Node.js** v18, v20, atau v22 LTS ([Download](https://nodejs.org/))
- Biner FFmpeg otomatis tersedia via dependensi (tanpa perlu setting PATH manual).

### Instalasi & Menjalankan Aplikasi
```bash
# 1. Pasang dependensi (~450 MB untuk Chromium headless & FFmpeg)
npm install

# 2. Jalankan aplikasi
npm start
```

### 📦 Build File EXE Portable (Windows)
Untuk membuat file `.exe` portabel mandiri tanpa perlu instalasi Node.js di komputer lain:
```bash
npm run build:portable
```
File output akan tersedia di folder `dist/NARA-Portable-1.0.0.exe`.

---

## 🎬 Pengaturan Render & Preset

| Preset | Format | Keterangan |
| :--- | :--- | :--- |
| **MOV ProRes 4444** | `.mov` | Transparan (Alpha Channel), profil industri microstock |
| **MP4 High Bitrate 4K** | `.mp4` | UHD 3840×2160, CRF 12 / yuv420p ultra jernih |
| **MP4 Social 1080p** | `.mp4` | FHD 1920×1080, ringan untuk media sosial |

- **Resolusi yang Didukung**: 3840×2160 (16:9), 1920×1080 (16:9), 1080×1920 (9:16 Vertikal), 1080×1080 (1:1 Persegi).
- **Pilihan FPS**: 60 FPS (Ultra Smooth), 30 FPS (Standard), 24 FPS (Cinematic).

---

## 🏷️ Metadata & In-File Tagging

Anda dapat menyisipkan blok metadata langsung di header file `.html`:

```html
<!--METADATA
{
  "title": "Abstract Neon Wave 4K Loop",
  "category": "Abstract",
  "fps": 60,
  "total_frames": 300,
  "loop": true,
  "keywords": "abstract, neon, 4k, loop, background, motion graphics"
}
METADATA-->
```

Saat file dimasukkan ke antrean NARA, durasi frame, status seamless loop, dan metadata microstock akan terisi otomatis.

---

## 🌐 NARA Companion - Browser Extension

Preview dan unduh kode animasi langsung dari browser Google Chrome / Microsoft Edge / Brave:

1. Buka browser dan arahkan ke `chrome://extensions` (atau `edge://extensions`).
2. Aktifkan **Developer mode** di pojok kanan atas.
3. Klik **Load unpacked** dan pilih folder `motionjs/extension/`.

---

## ⌨️ Pintasan Keyboard

| Tombol | Aksi |
| :--- | :--- |
| **`Spasi`** | Play / Pause pemutaran preview |
| **`F`** | Masuk / Keluar layar penuh (Fullscreen Preview) |
| **`ESC`** | Keluar dari mode layar penuh |

---

## 📄 Lisensi

Didistribusikan di bawah lisensi **MIT License**. Bebas digunakan untuk keperluan pribadi maupun produksi komersial microstock.
