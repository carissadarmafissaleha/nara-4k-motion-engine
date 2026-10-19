# NARA 🎬✨

### Commercial 4K & Apple ProRes 4444 Motion Studio Engine

[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-zinc.svg?style=flat-square)](#-prasyarat-sistem-prerequisites)
[![Windows Portable](https://img.shields.io/badge/Windows-Portable%20EXE%20Ready-zinc.svg?style=flat-square)](#-langkah-4-opsional-cara-build-file-exe-portabel-untuk-windows-single-portable-executable)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%20%7C%2020%20%7C%2022%20LTS-zinc.svg?style=flat-square)](https://nodejs.org)
[![Electron](https://img.shields.io/badge/Electron-39.x-zinc.svg?style=flat-square)](https://www.electronjs.org/)
[![Microstock Ready](https://img.shields.io/badge/Microstock-Adobe%20Stock%20%7C%20Shutterstock-zinc.svg?style=flat-square)](#5-fitur-auto-metadata-csv--in-file-metadata-)
[![Audio Muxing](https://img.shields.io/badge/Audio-Auto--Detect%20%26%20Render-zinc.svg?style=flat-square)](#6-fitur-auto-deteksi--render-suara-folder--nama-sama-)
[![System Tray](https://img.shields.io/badge/System%20Tray-Background%20Render-zinc.svg?style=flat-square)](#7-fitur-system-tray--background-render-engine-hide-on-tray-)
[![AI Generator](https://img.shields.io/badge/AI%20Generator-Gemini%20%7C%20OpenAI-blueviolet.svg?style=flat-square)](#8-fitur-generate-with-ai-ai-motion-studio-)
[![Theme](https://img.shields.io/badge/Theme-Dark%20%7C%20Light%20Mode-zinc.svg?style=flat-square)](#2-live-preview--timeline-player)

> ⚡ **High-performance desktop offline engine to render HTML5/Canvas/WebGL animations into 4K MP4 & Apple ProRes 4444 Alpha MOV with zero temp files, auto-detect audio muxing, system tray background rendering, embedded stock metadata, safe-append CSV, and browser companion extension.**

<p align="center">
  <a href="https://github.com/carissadarmafissaleha/nara-4k-motion-engine/blob/main/screenshoot/Screenshot%201.png">
    <img src="screenshoot/Screenshot%201.png" alt="NARA Motion Studio - Live Preview & Batch Queue" width="100%" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/carissadarmafissaleha/nara-4k-motion-engine/blob/main/screenshoot/Screenshot%202.png">
    <img src="screenshoot/Screenshot%202.png" alt="NARA Motion Graphics Studio Generator" width="100%" />
  </a>
</p>

**NARA** adalah aplikasi desktop berarsitektur modern berbasis **Electron** dan **Node.js** yang dirancang khusus untuk kreator Microstock (_Adobe Stock, Shutterstock, Pond5, Envato Elements_). NARA mengonversi animasi web (HTML5, SVG, Canvas 2D, WebGL) menjadi video komersial 4K (MP4 Ultra Bitrate dan MOV Apple ProRes 4444 Alpha Channel transparan) secara offline, deterministik, dan bebas file temporer (_zero temp files_).

Aplikasi ini mengusung antarmuka visual modern, minimalis, dan berorientasi profesional dengan dukungan Dark & Light Mode, audio notifikasi Web Audio API, tipografi presisi Google **Plus Jakarta Sans**, serta tata letak responsif terhadap berbagai ukuran resolusi layar laptop maupun monitor 4K.

---

## 💻 Prasyarat Sistem (Prerequisites)

Sebelum memasang NARA, pastikan perangkat Anda telah memenuhi prasyarat berikut:

1. **Sistem Operasi**:
   - Windows 10 atau Windows 11 (64-bit) _(Direkomendasikan)_
   - macOS 12+ (Apple Silicon / Intel)
   - Linux (Ubuntu 20.04+, Debian 11+)
2. **Node.js**:
   - Node.js versi **v18.x**, **v20.x**, atau **v22.x LTS**
   - Periksa versi Node.js dengan perintah:
     ```bash
     node -v
     ```
3. **Package Manager**:
   - npm versi **9.x** atau **10.x** (otomatis terpasang bersama Node.js)
4. **Biner FFmpeg**:
   - Tidak memerlukan instalasi FFmpeg manual ke PATH sistem. Biner FFmpeg sudah dibundel otomatis melalui dependensi `ffmpeg-static`.

---

## 📥 Panduan Instalasi Lengkap (Installation Guide)

Ikuti langkah-langkah berikut untuk memasang dan menjalankan NARA:

### Langkah 1: Unduh / Buka Direktori Proyek

Buka terminal (PowerShell, Command Prompt, atau Terminal VS Code) dan arahkan ke direktori proyek:

### Langkah 2: Pasang Dependensi (Node.js Build & Install)

Jalankan perintah berikut untuk mengunduh dan membangun seluruh dependensi aplikasi (Electron runtime, Puppeteer Chromium headless, dan biner FFmpeg Static):

```bash
npm install
```

> 📦 **Informasi Ukuran Unduhan & Build Node (~450 MB):**
> Proses instalasi dependensi / build Node ini membutuhkan kuota unduhan dan ruang disk **kurang lebih ~450 MB**. Hal ini karena npm otomatis mengunduh biner browser Chromium headless resmi bawaan Puppeteer (~170 MB), runtime Electron (~150 MB), serta biner codec video FFmpeg Static (~80 MB) agar sistem NARA dapat merender animasi secara offline dan mandiri tanpa ketergantungan software luar. Pastikan koneksi internet stabil saat menjalankan `npm install` pertama kali.

### Langkah 3: Jalankan Aplikasi (Mode Development)

Setelah instalasi selesai, jalankan aplikasi NARA dengan perintah:

```bash
npm start
```

Jendela aplikasi NARA akan terbuka dan siap digunakan.

---

### 📦 Langkah 4 (Opsional): Cara Build File EXE Portabel untuk Windows (Single Portable Executable)

> 💡 **Langkah ini bersifat opsional.** Anda tidak perlu melakukan build jika hanya ingin menjalankan dan menggunakan aplikasi langsung dengan perintah `npm start`. Ikuti langkah ini hanya jika Anda ingin mengemas NARA menjadi **file executable mandiri (`.exe` portabel)** yang bisa dijalankan di komputer lain tanpa Node.js.

#### 1. Jalankan Perintah Build Portable

Buka terminal di folder proyek dan jalankan perintah:

```bash
npm run build:portable
```

_Atau jalankan langsung melalui npx:_

```bash
npx electron-builder --win portable
```

> **Catatan Saat Build Pertama Kali:**
> `electron-builder` akan mengunduh paket pembungkus Electron resmi untuk Windows jika belum ada di cache sistem. Pastikan koneksi internet aktif selama proses pengemasan pertama kali.

#### 2. Lokasi Berkas Output EXE

Setelah proses kompilasi selesai (sekitar 1–2 menit), file executable portabel siap pakai akan tersimpan di dalam direktori **`dist/`**:

```
motionjs/
└── dist/
    └── NARA-Portable-1.0.0.exe   <-- File aplikasi portabel siap pakai!
```

#### 3. Keunggulan & Cara Menggunakan File Portabel:

- 🚀 **Tanpa Perlu Instalasi (_Zero Installation_)**: Cukup _double-click_ file `NARA-Portable-1.0.0.exe`, aplikasi langsung terbuka dan siap merender video 4K.
- 💾 **Plug & Play (Bisa di Flashdisk / SSD Eksternal)**: Anda dapat memindahkan file `.exe` ini ke flashdisk dan menjalankannya di laptop atau PC workstation render lain tanpa perlu menginstal Node.js atau Git.
- 🎬 **Offline & Mandiri**: Seluruh UI, font Plus Jakarta Sans, audio Web Audio API, dan biner codec FFmpeg sudah terintegrasi rapi di dalam paket portable.
- 🌐 **Deteksi Headless Browser Otomatis**: Di komputer tujuan, NARA secara cerdas otomatis mendeteksi browser **Google Chrome** atau **Microsoft Edge** bawaan Windows untuk merender frame animasi.

---

## 🌟 Panduan Lengkap Fungsi & Fitur Aplikasi

### 1. Studio Generator 6 Kategori Komersial ✨

NARA dilengkapi generator bawaan untuk memproduksi animasi mandiri (_self-contained HTML_) yang dapat langsung di-preview dan dimasukkan ke antrean render:

1. **Kinetic Typography**
   - _Fungsi_: Membuat animasi teks dinamis dengan staggered letter reveal, glitch line horizontal, telemetry framing crosshair, dan neon glow pulse.
   - _Parameter_: Headline text, Subtitle/Tagline, Visual Style (_Cyberpunk HUD, Swiss Modernist, Digital Telemetry_), Palet Warna.
   - _Komersial_: Sangat ideal untuk video intro, promo teknologi, dan teaser komersial.

2. **Particle FX**
   - _Fungsi_: Simulasi partikel Canvas 2D deterministik dengan seeded PRNG dan dukungan transparansi penuh.
   - _Parameter_: Motion Motif (_Cosmic Swirl Galaxy, Quantum Sparks Stream, Cinematic Bokeh Flow_), Jumlah partikel (30–300), Kecepatan orbit, Palet warna.
   - _Komersial_: Latar belakang ambient dan overlay video ProRes 4444 Alpha Channel.

3. **Isometric 3D**
   - _Fungsi_: Matriks isometrik 2.5D dengan elevasi sinusoidal prosedural, bayangan kubus 3-sisi, dan ripple grid.
   - _Parameter_: Isometric Motif (_2.5D Ripple Matrix, Cyber Circuit Pillars, Equalizer Blocks_), Ukuran grid (5×5 s/d 13×13), Elevasi gelombang, Tema warna.
   - _Komersial_: Tema FinTech, data center, blockchain, dan cloud computing.

4. **Data Visualization**
   - _Fungsi_: HUD infografis FinTech dengan speedometer radial gauge berputar, animated bar chart race, dan live telemetry sinus.
   - _Parameter_: Dashboard Title, Nilai metrik angka, Widget type, Palet warna (_FinTech Emerald, Hi-Tech Cyan, Solar Gold, Deep Blue_).
   - _Komersial_: Presentasi bisnis, infografis saham, dan cryptocurrency.

5. **Abstract Motion**
   - _Fungsi_: Gelombang pita fluida multi-layer (_continuous Bézier waves_) dengan gradien warna iridescent dan specular highlight.
   - _Parameter_: Flow Motif (_Fluid Wave Ribbons, Hypnotic Neon Waves, Chromatic Drift_), Jumlah layer pita (3–8), Kecepatan alir, Palet warna.
   - _Komersial_: Motion wallpaper, screensaver ambient, dan visual panggung.

6. **Flat Animation**
   - _Fungsi_: Animasi vektor explainer dengan pop-in badge, path checkmark drawing, gelombang ripple, dan confetti particle burst.
   - _Parameter_: Badge headline, Sub-label, Motif (_Success Badge, Shield Security, Growth Rocket_), Tema warna.
   - _Komersial_: Video explainer UI/UX, konfirmasi transaksi e-commerce, dan aplikasi mobile.

---

### 2. Live Preview & Timeline Player

- **Deterministic Virtual Clock**: Animasi di-preview dengan clock virtual yang identik dengan mesin render headless Puppeteer. Animasi berjalan deterministik tanpa frame-drop.
- **Scrubber & Timeline Player**: Periksa setiap frame dengan slider scrubber presisi (`Frame: X` / `Total: Y F`).
- **Aspect Ratio & Frame Rate Real-Time Match**: Penggantian resolusi (3840×2160, 1920×1080, 1080×1920, 1080×1080) dan FPS (60, 30, 24) seketika memperbarui aspek rasio viewport preview, kecepatan interval putar (_playback speed_), overlay tag info, dan clock virtual animasi tanpa distorsi atau terpotong.
- **Hold Last Frame Zone**: Pada animasi _One-Shot_, preview memutar animasi lalu menahan frame terakhir sesuai durasi hold frame dengan indikator visual bergaris pada scrubber.
- **Opsi Background Alpha (Muncul Otomatis pada Preset ProRes 4444)**:
  - Tombol opsi Alpha (**Grid**, **Dark**, **Light**, **Green**) muncul secara dinamis khusus saat memilih preset **MOV ProRes 4444** (disembunyikan pada preset MP4 agar antarmuka tetap bersih dan relevan).
  - **Sinkronisasi Render 1:1 (Hasil Render Sesuai Pilihan)**:
    - `Grid`: Render transparan dengan *Alpha Channel* murni (ProRes 4444 transparan untuk overlay editing video).
    - `Dark`: Render dengan latar belakang hitam pekat solid (`#000000`).
    - `Light`: Render dengan latar belakang putih bersih solid (`#ffffff`).
    - `Green`: Render dengan latar belakang hijau *Green Screen Chroma Key* (`#00b140`).
    - *Memastikan warna latar belakang yang di-render 100% konsisten dengan yang dipilih pengguna, bukan latar belakang lain.*
- **Fullscreen Mode**: Mode layar penuh untuk memeriksa detail visual dalam resolusi maksimal.

---

### 3. Panduan & Petunjuk Penentuan Jumlah Frame (Total Frames & Duration Guide) 📐

Penentuan jumlah frame yang tepat sangat krusial dalam produksi animasi microstock agar video memiliki durasi standar komersial, perputaran (_looping_) mulus tanpa patahan, dan pembeli mudah menggunakannya di timeline video editor (Adobe Premiere Pro, After Effects, DaVinci Resolve, Final Cut).

#### 🧮 Rumus Dasar Perhitungan Frame

$$\mathbf{Total\ Frame} = \mathbf{Durasi\ (Detik)} \times \mathbf{FPS\ (Frame\ Per\ Second)}$$
$$\mathbf{Durasi\ (Detik)} = \frac{\mathbf{Total\ Frame}}{\mathbf{FPS}}$$

_Contoh Perhitungan:_

- Animasi **3 detik** pada **60 FPS** = $3 \times 60 = \mathbf{180\ Frame}$ _(Default Rekomendasi NARA)_
- Animasi **5 detik** pada **60 FPS** = $5 \times 60 = \mathbf{300\ Frame}$
- Animasi **5 detik** pada **30 FPS** = $5 \times 30 = \mathbf{150\ Frame}$
- Animasi **10 detik** pada **24 FPS** = $10 \times 24 = \mathbf{240\ Frame}$

---

#### 📊 Tabel Rekomendasi Standar Microstock & Broadcast

| Kategori Animasi                                          | Durasi Ideal                           | 60 FPS (Ultra Smooth)         | 30 FPS (Standard Web)         | 24 FPS (Cinematic)           | Rekomendasi Penggunaan Microstock                                             |
| --------------------------------------------------------- | -------------------------------------- | ----------------------------- | ----------------------------- | ---------------------------- | ----------------------------------------------------------------------------- |
| **Microstock Fast Loop** _(Partikel, HUD, Icon)_          | **3 Detik**                            | **180 Frame** _(Best)_        | **90 Frame**                  | **72 Frame**                 | Ukuran file ringan, loading cepat, ideal untuk looping background web/sosmed  |
| **Golden Standard Loop** _(Gelombang, Abstract, 3D)_      | **5 Detik**                            | **300 Frame** _(Best)_        | **150 Frame**                 | **120 Frame**                | Standar emas Adobe Stock & Shutterstock; durasi pas dan tempo gerakan nyaman  |
| **Complex Ambient Loop** _(Space, Nebula, Fluid Ribbons)_ | **10 Detik**                           | **600 Frame**                 | **300 Frame**                 | **240 Frame**                | Visual panggung, LED backdrop, screensaver, ambient motion graphics           |
| **Intro / Logo Reveal (One-Shot)**                        | **3 Detik** _(2s gerak + 1s hold)_     | **120 F + 60 F Hold = 180 F** | **60 F + 30 F Hold = 90 F**   | **48 F + 24 F Hold = 72 F**  | Animasi logo muncul, lalu pose akhir ditahan agar teks sempat terbaca pembeli |
| **Infografis & Chart Race (One-Shot)**                    | **5 Detik** _(3.5s gerak + 1.5s hold)_ | **210 F + 90 F Hold = 300 F** | **105 F + 45 F Hold = 150 F** | **84 F + 36 F Hold = 120 F** | Data visualization FinTech, presentasi angka statistik, dashboard reveal      |

---

#### 🔄 Aturan Animasi: Seamless Loop vs One-Shot Hold

1. **Seamless Loop (Pengulangan Sempurna Tanpa Patahan)**
   - **Logika Internal NARA**: Jika opsi Seamless Loop aktif, mesin merender frame **`0` sampai `Total Frames - 1`**.
   - **Alasan Teknis**: Pada matematika fungsi trigonometri periodik $\sin(2\pi \cdot t)$ atau rotasi $360^\circ$, pose visual pada frame terakhir $t = 1.0$ identik 100% dengan frame awal $t = 0.0$.
   - **Manfaat**: Dengan memotong frame duplikat terakhir, video loop yang diulang ribuan kali di timeline editing video editor akan menyambung mulus sempurna (_gapless / zero stutter_).

2. **One-Shot dengan Hold Frame (Intro, Explainer, & Logo Reveal)**
   - Animasi bergerak menyelesaikan siklusnya dari frame `0` sampai `Total Frames - 1`.
   - **Fitur Hold Last Frame**: Mesin otomatis membekukan (_freeze frame_) pose terakhir animasi sebanyak jumlah frame yang ditentukan pada kotak input **Hold Last Frame** (misal: 30–60 frame).
   - **Manfaat**: Penonton dan pembeli microstock memiliki waktu jeda untuk membaca judul, teks, atau logo sebelum video berganti.

---

#### 🛠️ 3 Cara Mengatur Jumlah Frame di NARA

1. **Melalui Tab Studio Generator**:
   - Sebelum menekan tombol _Generate & Masukkan ke Antrean_, atur angka pada kolom input **Total Frames** (misalnya `180` atau `300`).
2. **Melalui Kartu Editor Metadata (Antrean Render)**:
   - Klik salah satu item di daftar antrean render.
   - Pada panel samping kanan, ubah angka di kotak **Total Frame Siklus**.
   - Slider scrubber preview dan total timecode seketika menyesuaikan dengan angka baru.
3. **Melalui Tag Header File HTML Mandiri**:
   - Sisipkan blok metadata berikut di awal kode file `.html` Anda:
     ```html
     <!--METADATA
     {
       "title": "Cosmic Hologram 4K Loop",
       "fps": 60,
       "total_frames": 300,
       "loop": true,
       "width": 3840,
       "height": 2160
     }
     METADATA-->
     ```
   - Saat file di-drag ke jendela NARA, sistem akan otomatis membaca durasi **300 frame** dan **60 FPS** tanpa perlu input manual.

---

### 4. Pipeline Render Zero Temp Files (Streaming Memory Pipe)

- **Bebas File Sementara**: Tangkapan frame transparan dari headless Chromium langsung dialirkan via memory stream ke stdin FFmpeg tanpa menulis jutaan file PNG ke disk drive.
- **Crystal-Clear Gradients & Anti-Banding Engine**:
  - Konversi warna presisi tinggi dengan `-sws_flags spline+accurate_rnd+full_chroma_int+full_chroma_inp` mengeliminasi chroma blur dan undakan warna (_color banding_).
  - Mode adaptif `aq-mode=3` dan parameter `-x264-params deblock=-1,-1` pada profil MP4 4K menjaga gradasi warna halus, gelap, dan transisi spekular tetap tajam, jernih, dan bebas artefak macroblock.
  - Tag metadata warna industri broadcast (`-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv`) untuk akurasi visual gamut maksimal di semua layar.
- **Pilihan Preset Codec**:
  - `MOV ProRes 4444 (Alpha Transparan)`: Format industri untuk video transparan berlatar belakang tembus pandang dengan `-qscale:v 4 -vendor apl0` (overlay Premiere Pro, After Effects, DaVinci Resolve).
  - `MP4 High Bitrate 4K (CRF 12 / yuv420p)`: Format video komersial 4K ultra jernih, mastering gradasi tajam dan bebas banding.
  - `MP4 Social 1080p`: Format ringkas untuk kebutuhan media sosial.
- **Dukungan Resolusi**: 3840×2160 UHD (16:9), 1920×1080 FHD (16:9), 1080×1920 Vertikal (9:16), 1080×1080 Persegi (1:1).
- **Folder Output Default (Nara Motions)**: File hasil render secara otomatis disimpan ke folder `Nara Motions` (`C:\Nara Motions` di Windows atau folder Home pengguna), dapat diubah kapan saja dengan tombol *Ubah Folder*.
- **Posisi Kontrol Render Ergonomis**: Tombol *Start Batch Render* diposisikan di sebelah kanan kontrol antrean untuk navigasi eksekusi yang lebih cepat.
- **Suara Notifikasi Render Selesai (Audio Chime)**:
  - Sintesis audio harmonik C5-E5-G5-C6 berbasis Web Audio API (100% offline tanpa dependensi file eksternal) berbunyi otomatis saat antrean batch render selesai.
  - Tombol sakelar suara di header atas memungkinkan pengaktifan/pembisuan (_mute_) atau pengujian audio dengan satu klik.

---

### 5. Fitur Auto-Metadata CSV & In-File Metadata 🏷️

- **Auto-Metadata CSV (Safe Append Non-Destructive)**:
  - Sistem secara otomatis men-generate dan meng-append data ke file `metadata_export.csv` di folder hasil render.
  - **Tak perlu takut data lama tertimpa**: NARA memeriksa file CSV yang ada dan menyisipkan baris baru di akhir (_append safe_), mempertahankan header resmi microstock (_Filename, Title, Keywords, Category_) tanpa menghapus riwayat video batch sebelumnya.
  - Kompatibel langsung dengan portal pengunggahan massal CSV **Adobe Stock Contributor** dan **Shutterstock**.

- **Metadata In-File (Embedded Container Atoms)**:
  - Keyword, judul, deskripsi, dan kategori ter-embed secara permanen langsung di dalam atom kontainer video (`MP4` dan `MOV ProRes`).
  - Menggunakan flag `-metadata title="..."`, `-metadata description="..."`, `-metadata keywords="..."`, dan `-movflags +faststart` pada FFmpeg.
  - **Adobe Stock langsung membacanya**: Saat file di-upload ke Adobe Stock atau dibuka di Apple Finder / Windows Explorer / VLC / Adobe Bridge, seluruh tag, judul, dan copyright langsung terdeteksi otomatis tanpa perlu entri manual.

---

### 6. Fitur Auto-Deteksi & Render Suara (Folder & Nama Sama) 🎵

NARA mendukung integrasi audio otomatis untuk proyek animasi motion graphics komersial yang memiliki musik latar belakang (_background music_) atau efek suara (_sound effects/SFX_):

- **Auto-Detection Cerdas**:
  - Saat Anda menambahkan file animasi `.html` (misal `intro-promo.html`) ke antrean render, NARA secara otomatis memindai folder yang sama untuk mencari file audio dengan nama dasar yang sama (misal `intro-promo.wav` atau `intro-promo.mp3`).
  - **Format Audio yang Didukung**: `.wav`, `.mp3`, `.m4a`, `.aac`, `.ogg`, `.flac`, `.opus`, `.aiff`, `.wma`.
- **Indikator Visual di Antrean & Metadata Editor**:
  - Muncul badge hijau `🎵 nama_file.mp3` pada kartu antrean render batch.
  - Panel Metadata Editor menampilkan kotak status audio yang terdeteksi secara real-time saat file dipilih.
- **Audio Sinkron di Live Preview Player**:
  - Saat memutar (_Play/Pause_) atau melakukan _scrubbing_ timeline di player preview, audio otomatis berbunyi secara sinkron dengan frame animasi.
- **Mastering Audio Berkualitas Tinggi lewat FFmpeg**:
  - **MP4 (4K / 1080p)**: Audio di-muxing menggunakan codec **AAC 320 kbps, 48 kHz stereo**.
  - **MOV ProRes 4444 Alpha**: Audio di-encode menggunakan standar industri broadcast **Uncompressed PCM 24-bit 48 kHz stereo** (`pcm_s24le`), siap diterima tanpa re-encoding di Adobe Stock, Shutterstock, Pond5, DaVinci Resolve, dan Final Cut Pro.
- **Seamless Looping Audio**:
  - Jika opsi _Seamless Loop_ aktif, stream audio otomatis di-looping (`-stream_loop -1`) agar mengalun mulus sepanjang durasi video tanpa terputus di tengah jalan.
- **Sinkronisasi Durasi Presisi (Anti-Freeze & Anti-Desync)**:
  - Durasi audio dipotong persis pada frame terakhir video (`-t`), dan jika file audio lebih pendek dari durasi animasi, filter `-af apad` otomatis mengisi jeda akhir dengan silence agar video tidak berhenti mendadak atau _corrupt_.
- **Opsi Ekspor Fleksibel di Panel Konfigurasi**:
  - `Render Suara (Folder & Nama Sama)`: Sakelar utama untuk mengaktifkan/menonaktifkan penggabungan audio ke video (aktif secara default).
  - `Simpan Salinan Audio di Folder Hasil`: Opsi untuk menduplikasi/mengekspor file audio mandiri berdampingan dengan video hasil render di folder tujuan.

---

### 7. Fitur System Tray & Background Render Engine (Hide on Tray) 📥

Render batch puluhan hingga ratusan video 4K kini dapat berjalan tenang di latar belakang tanpa mengganggu alur kerja atau memenuhi taskbar Anda:

- **Ikon System Tray Interaktif**:
  - Ikon NARA hadir di area notifikasi Windows/OS tray dengan tooltip interaktif yang menampilkan status dan persentase render secara langsung (misal: `NARA [65%] (3/10): kinetic_promo`).
- **Menu Cepat Klik Kanan (Tray Context Menu)**:
  - **Header Info & Status**: Menampilkan status real-time (`Siap / Idle`, `Merender X/Y - File`, `Selesai`, `Dibatalkan`).
  - **Buka NARA Studio / Sembunyikan ke Tray**: Beralih tampilan jendela dengan 1 klik.
  - **Buka Folder Hasil**: Membuka folder output video langsung di Windows Explorer.
  - **Keluar dari NARA**: Menghentikan proses render dengan aman dan menutup aplikasi sepenuhnya.
- **Kontrol Klik Ikon Tray**:
  - **Klik Satu Kali**: Toggle instan menyembunyikan atau menampilkan jendela aplikasi.
  - **Klik Dua Kali**: Membuka dan memfokuskan jendela NARA ke depan layar.
  - **Klik Notifikasi Balon**: Membuka jendela aplikasi saat notifikasi selesai diklik.
- **Tombol "Hide to Tray" di Header UI**:
  - Tombol ikon tray minimalis di header bar berdampingan dengan tombol tema dan suara, memungkinkan Anda menyembunyikan aplikasi ke tray kapan saja dengan satu sentuhan.
- **Close to Tray (Jendela Aman Ditutup)**:
  - Mengklik tombol **"X"** (tutup) pada jendela aplikasi tidak akan mematikan proses render; aplikasi otomatis diminimalkan ke System Tray dengan notifikasi balon informatif. Untuk keluar sepenuhnya, klik kanan ikon tray lalu pilih _Keluar dari NARA_.
- **Anti-Throttling di Background**:
  - Dilengkapi konfigurasi biner `backgroundThrottling: false` dan `--disable-background-timer-throttling` sehingga Chromium headless dan biner FFmpeg tetap merender pada performa dan kecepatan penuh 100% tanpa throttled saat jendela diminimalkan.
- **Notifikasi Balon Otomatis Selesai**:
  - Saat antrean batch render selesai di latar belakang, sistem tray otomatis menampilkan notifikasi balon yang memberitahukan total file yang berhasil diproses.

---

### 8. Fitur Generate with AI (AI Motion Studio) 🤖✨

NARA kini terintegrasi dengan **AI Motion Synthesizer Engine** mutakhir yang memungkinkan kreator memproduksi motion graphics komersial kelas studio 4K hanya dengan menuliskan **tema visual** dan **durasi waktu**:

- **Koneksi Multi-Provider AI (Google Gemini & OpenAI)**:
  - **Google Gemini API** *(Rekomendasi)*: Menggunakan model `gemini-2.5-flash`, `gemini-1.5-flash`, atau `gemini-1.5-pro` dengan latensi ultra-cepat dan kemampuan sintesis Canvas 2D / WebGL yang sangat presisi. Link langsung disediakan di aplikasi untuk mendapatkan API Key Gemini gratis dari Google AI Studio.
  - **OpenAI API**: Mendukung `gpt-4o-mini` dan `gpt-4o` dengan pemahaman konsep motion design mendalam.
- **Penyimpanan API Key Aman di LocalStorage**:
  - API Key disimpan secara lokal di perangkat Anda (`localStorage`) dan **tidak pernah dikirim ke server pihak ketiga mana pun**. Aplikasi berkomunikasi langsung dari aplikasi desktop ke endpoint resmi Google / OpenAI.
- **100% Sesuai Arsitektur Standar NARA**:
  - **Hybrid CDN & Zero External Dependencies**: Mendukung grafis native murni maupun library kaya (GSAP, Three.js, PixiJS, Anime.js) dengan sistem Request Interception bawaan NARA yang otomatis memuat dari CDN Online saat terkoneksi internet, dan beralih ke vendor lokal saat offline tanpa error.
  - **Deterministic Virtual Clock**: Otomatis menyertakan hook `window.__renderTick(frameIndex, targetFps)` serta perhitungan trigonometri periodik sehingga animasi dapat di-scrub dan di-render frame demi frame tanpa patah (*seamless loop*).
  - **Embedded JSON Metadata**: Dokumen otomatis dilengkapi header komentar `<!--METADATA { ... } METADATA-->` yang berisi judul komersial, deskripsi, keywords microstock, FPS, total frames, dan kategori.
- **Inspirasi Cepat (Quick Inspiration Chips)**:
  - Tersedia tombol inspirasi sekali klik untuk ide-ide motion graphics populer:
    - ⚡ *Cyberpunk HUD* (Telemetry & Hologram)
    - 🌌 *Quantum Particles* (Particle vortex gravitasi)
    - 🌊 *Iridescent Waves* (Pita fluida 3D gradien)
    - 📈 *FinTech Hologram* (Chart pasar saham real-time)
    - 🧬 *DNA Nanotech* (Struktur molekul berputar)
    - 💎 *Luxury Gold Flow* (Pita emas obsidian)
    - 🧠 *Neural Network* (Jaringan sinaptik AI 3D)
- **Tiga Alur Kerja Fleksibel**:
  1. **Live Preview Sandbox**: Tinjau dan scrub animasi yang baru saja dibuat oleh AI seketika pada preview player NARA di sisi kiri layar.
  2. **Simpan File .HTML**: Simpan kode animasi ke komputer sebagai berkas HTML standalone untuk diedit lebih lanjut atau dibagikan.
  3. **Masukkan ke Antrean Render**: Simpan otomatis dan masukkan file langsung ke antrean batch render 4K ProRes 4444 Alpha atau MP4 Ultra HD!

---

### 9. Arsitektur Hybrid CDN & Intelligent Offline Fallback Engine ⚡🌐

NARA menghadirkan sistem **Hybrid CDN** revolusioner yang memecahkan keterbatasan antara fleksibilitas library modern dan keandalan rendering offline:

- **🟢 Mode Online (Cloud CDN Aktif & Auto-Cached)**:
  - Saat komputer terkoneksi ke internet, animasi web dapat memanggil link CDN resmi (seperti `cdnjs.cloudflare.com`, `cdn.jsdelivr.net`, `unpkg.com`, atau `fonts.googleapis.com`).
  - Seluruh pustaka eksternal yang diunduh secara otomatis dicache ke disk lokal (`generated_animations/.cdn_cache/`) untuk mempersiapkan rendering offline di masa mendatang.
- **🟡 Mode Offline (Local Vendor Fallback Otomatis)**:
  - Saat tidak ada koneksi internet (atau rendering pada workstation *air-gapped*), Puppeteer Render Engine NARA secara cerdas **mencegat (*intercept*)** permintaan CDN tersebut pada level jaringan.
  - NARA langsung menyajikan file vendor lokal (`src/assets/vendor/`) dengan **latensi 0 ms**:
    - **GSAP 3.12.5** (GreenSock Motion Library)
    - **Three.js r128** (WebGL 3D Engine)
    - **PixiJS 7.4.2** (High-Performance 2D WebGL)
    - **Anime.js 3.2.1** (Lightweight Animation Engine)
    - **Canvas-Confetti 1.9.3** (Procedural Particle Celebration)
  - Proses render 4K dijamin tidak akan pernah mengalami *timeout*, *network freeze*, atau layar kosong (*blank screen*) akibat putus koneksi internet!
- **Pola Fallback Ganda untuk File Mandiri (*Self-Contained*)**:
  Bagi kreator yang menjual file animasi HTML langsung ke pembeli microstock agar bisa dibuka langsung di browser tanpa NARA:
  ```html
  <!-- Coba CDN Online terlebih dahulu; jika offline, otomatis alihkan ke vendor lokal -->
  <script 
    src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" 
    onerror="this.onerror=null; this.src='vendor/gsap.min.js';">
  </script>
  ```
  atau menggunakan penjaga objek `window`:
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script>
    window.gsap || document.write('<script src="vendor/gsap.min.js"><\/script>');
  </script>
  ```

---

### 10. NARA Companion - Browser Extension 🌐

- **View hasil code seketika**: Tak perlu bolak-balik buka file atau menunggu render desktop. Langsung preview kode animasi dan download dari browser Anda (Google Chrome / Microsoft Edge / Brave).
- **Fitur Utama Extension**:
  - **Inspect Active Tab**: Mendeteksi kode animasi atau elemen canvas dari tab browser yang sedang aktif dengan 1 klik.
  - **Preset Generator Bawaan**: Langsung mencoba 6 preset generator NARA (_Kinetic Typography, Particle FX, Isometric 3D, Data Visualization, Abstract Motion, Flat Animation_) langsung di popup extension.
  - **Deterministic Timeline Scrubber**: Kontrol putar, jeda, dan scrub frame per frame (60 FPS) dengan virtual clock deterministik.
  - **Alpha Checkerboard & Background Toggles**: Uji transparansi dengan 4 mode instan: Grid, Dark, Light, dan Green Screen (Chroma Key).
  - **One-Click Download HTML**: Simpan kode animasi sebagai file `.html` mandiri yang siap diimpor ke antrean desktop NARA.
- **Cara Memasang Extension di Chrome / Edge**:
  1. Buka browser dan ketik alamat `chrome://extensions` (atau `edge://extensions`).
  2. Aktifkan sakelar **Developer mode** di sudut kanan atas.
  3. Klik tombol **Load unpacked** (Muat yang belum dibongkar).
  4. Pilih folder `motionjs/extension/` dari komputer Anda.
  5. Ikon **NARA** akan muncul di toolbar browser Anda dan siap digunakan!

---

### 10. Multi-Bahasa Global (10 Bahasa - Default EN) & Log Terminal Reaktif

Pilih bahasa antarmuka secara instan melalui dropdown kode ID bahasa ringkas di bar navigasi atas (Default: **`EN`**). **Seluruh baris log streaming di konsol terminal bawah otomatis terlokalisasi dan berubah secara real-time saat bahasa diganti:**

1. 🇺🇸 **`EN`** - English _(Default)_
2. 🇮🇩 **`ID`** - Bahasa Indonesia
3. 🇯🇵 **`JA`** - 日本語 (Japanese)
4. 🇨🇳 **`ZH`** - 简体中文 (Simplified Chinese)
5. 🇪🇸 **`ES`** - Español (Spanish)
6. 🇩🇪 **`DE`** - Deutsch (German)
7. 🇫🇷 **`FR`** - Français (French)
8. 🇧🇷 **`PT`** - Português (Portuguese)
9. 🇷🇺 **`RU`** - Русский (Russian)
10. 🇰🇷 **`KO`** - 한국어 (Korean)

---

## ⌨️ Pintasan Keyboard & Kontrol Cepat (Shortcuts & Controls)

| Tombol / Aksi              | Fungsi                                                       |
| -------------------------- | ------------------------------------------------------------ |
| **`Spasi` (Spacebar)**     | Play / Pause pemutaran animasi preview                       |
| **`F`**                    | Masuk / Keluar mode Fullscreen Preview                       |
| **`ESC`**                  | Keluar dari mode Fullscreen Preview                          |
| **Tombol `Tray` (Header)** | Sembunyikan aplikasi ke System Tray (Background)             |
| **Tombol `X` (Window)**    | Minimize to Tray (Rendering tetap berjalan di background)    |
| **Klik Ikon Tray**         | Toggle sembunyikan / tampilkan jendela NARA Studio           |
| **Klik 2× Ikon Tray**      | Buka dan fokuskan jendela NARA Studio                        |

---

## 📁 Struktur Berkas Proyek

```
motionjs/
├── package.json                              # Konfigurasi dependensi NARA
├── README.md                                 # Dokumentasi & panduan instalasi
├── extension/                                # NARA Companion - Browser Extension (Manifest V3)
│   ├── manifest.json                         # Ekstensi Chrome / Edge
│   ├── popup.html                            # Antarmuka popup shadcn/ui
│   ├── popup.css                             # Styling shadcn/ui Monochrome Zinc
│   ├── popup.js                              # Virtual clock scrubber, inspector & download
│   └── icons/                                # Ikon ekstensi (16x16, 48x48, 128x128)
├── generated_animations/                     # Folder penyimpanan file hasil Studio Generator
├── examples/                                 # Contoh file animasi HTML siap render
│   ├── cyberpunk-portal-loop.html
│   └── quantum-logo-reveal-oneshot.html
└── src/
    ├── assets/                               # Aset ikon aplikasi & system tray (16x16, 48x48, 128x128)
    ├── main/
    │   ├── main.js                           # Electron lifecycle, System Tray, & IPC handlers
    │   └── engine/
    │       ├── render-engine.js              # Streaming memory pipeline, Audio mixer & FFmpeg pipe
    │       └── metadata-parser.js            # Parser metadata HTML, deteksi audio, & CSV generator
    ├── preload/
    │   └── preload.js                        # ContextBridge secure IPC bridge (Tray & Window APIs)
    └── renderer/
        ├── index.html                        # Struktur HTML antarmuka NARA & kontrol audio/tray
        ├── style.css                         # Desain shadcn/ui Monochrome Zinc Architecture
        ├── app.js                            # Controller utama, live preview audio sync, & i18n
        └── generators/                       # Generator animasi komersial & AI Engine
            ├── ai-generator.js               # AI Motion Synthesizer (Gemini & OpenAI API)
            ├── kinetic-typography.js
            ├── particle-fx.js
            ├── isometric-3d.js
            ├── data-visualization.js
            ├── abstract-motion.js
            ├── flat-animation.js
            └── index.js                      # Registry katalog generator
```

---

## ❓ Troubleshooting & Tanya Jawab

1. **Mengapa jendela preview kosong saat file HTML dimuat?**
   - Pastikan file HTML Anda tidak memiliki sintaks error JavaScript. Anda dapat melihat konsol log di terminal log bawah untuk melihat status deteksi.
2. **Bagaimana cara menghasilkan video transparan?**
   - Pastikan preset dipilih **MOV ProRes 4444 (Alpha Transparan)** dan animasi tidak memiliki elemen `body` yang diwarnai solid.
3. **Apakah NARA memerlukan koneksi internet saat rendering?**
   - **Tidak sama sekali.** NARA beroperasi dengan arsitektur cerdas **Hybrid CDN & Offline Fallback**. Jika komputer sedang terhubung internet, NARA akan memuat link CDN online terbaru dan otomatis menyimpannya ke cache lokal. Namun jika koneksi internet terputus atau rendering dijalankan secara *air-gapped* offline, NARA secara otomatis mencegat pemanggilan CDN dan menyajikan pustaka vendor internal (GSAP, Three.js, PixiJS, Anime.js, Confetti) dengan latensi 0 ms tanpa error/timeout.

---

## 📄 Lisensi (License)

Proyek ini dilisensikan di bawah lisensi **MIT License** — Anda bebas menggunakan, memodifikasi, dan mendistribusikan kode ini untuk kebutuhan pribadi maupun komersial microstock.

---

**NARA Engine Team** • _Crafted for Microstock Motion Creators_
