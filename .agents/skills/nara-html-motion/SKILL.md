---
name: nara-html-motion
description: >-
  Panduan dan instruksi pembuatan file animasi HTML5/Canvas/WebGL yang 100% kompatibel dengan render engine NARA 4K Motion Studio. Gunakan skill ini setiap kali membuat animasi HTML mandiri, kinetic typography, HUD sci-fi, particle simulation, visualisasi data, atau template video komersial microstock untuk NARA.
---

# NARA HTML Motion Animation Skill

Skill ini memandu pembuatan file animasi HTML5 standalone yang sepenuhnya kompatibel dengan **NARA 4K Motion Studio Engine** (aplikasi render desktop 4K ProRes 4444 Alpha & MP4 berbasis Electron, Headless Chromium, dan FFmpeg).

Animasi yang dihasilkan harus siap dirender offline secara deterministik (_zero temp files_, frame-by-frame lockstep) tanpa lag, tanpa patahan loop, dan langsung terbaca metadata komersialnya oleh Adobe Stock & Shutterstock.

---

## 0. Alur Kerja Wajib (Sebelum Menulis Kode)

### A. Jangan Membaca File yang Sudah Ada
- DILARANG membaca, membuka, me-list, atau meniru isi file/folder animasi yang sudah ada (mis. `.html`, aset, atau output di folder tujuan/workspace) sebagai referensi.
- Jangan menjalankan `list_dir`, `view_file`, `grep_search`, atau perintah sejenis pada folder animasi existing untuk "mencari inspirasi" atau "mengecek gaya yang sudah ada".
- Setiap animasi dibuat **dari nol** hanya berdasarkan skill ini dan jawaban brief dari user. Pengecualian: user secara eksplisit menyebut file tertentu untuk diedit/dijadikan acuan.
- **Selalu buat file BARU** dengan nama sesuai permintaan (request) user, mis. user minta "logo reveal" → `logo_reveal.html`. Jika user menyebut nama file, pakai persis nama itu (ekstensi `.html`).
- Jika user tidak menyebut nama, tanyakan (lihat pertanyaan nama file) atau turunkan dari konsep request dalam format `snake_case`. Jangan pernah menimpa/mengedit file existing; jika nama sudah dipakai, tambahkan akhiran `_v2`, `_v3`, dst. tanpa membaca file tersebut (cukup cek dengan nama saat menulis; `write_to_file` tanpa Overwrite akan gagal bila sudah ada).

### B. Ajukan Pertanyaan Brief Dulu (Wajib Sebelum Eksekusi)
Sebelum menulis kode, WAJIB bertanya kepada user (gunakan tool `ask_question` bila tersedia, dengan pilihan jawaban, atau daftar pertanyaan bernomor). Jangan menulis kode sebelum user menjawab. Lewati hanya pertanyaan yang sudah dijawab jelas oleh user di prompt.

Pertanyaan minimal:
1. **Konsep/Tema & Tujuan**: Apa yang dibuat (HUD, kinetic typography, logo reveal, background loop, infografis, partikel, dll) dan untuk apa (microstock, intro, overlay, wallpaper)?
2. **Teks/Konten**: Teks/judul/angka/data apa yang ditampilkan (jika ada)? Bahasa?
3. **Style Visual**: Cyberpunk neon, minimalis, glassmorphism, flat/corporate, retro, organik, dll?
4. **Palet Warna**: Warna dominan/aksen, atau serahkan ke saya? Background gelap, terang, atau transparan (alpha)?
5. **Font**: Sans-serif modern, monospace/tech, serif, bold display, atau font lokal tertentu (nama file)? Ingat: tanpa Google Fonts CDN.
6. **Gaya Animasi**: Smooth/easing halus, glitch, bounce, slide, fade, typewriter, morph, partikel? Tempo lambat/sedang/cepat?
7. **Ukuran/Resolusi**: 3840x2160 (16:9), 1920x1080, 1080x1920 (vertikal), atau 1080x1080 (kotak)?
8. **Durasi, FPS & Loop**: Seamless loop atau one-shot dengan hold? Durasi (3/5/10 detik), FPS (30/60), dan `hold_last_frames`?
9. **Transparansi/Alpha**: Perlu background transparan (ProRes 4444 Alpha)?
10. **Audio**: Ada file audio yang ingin di-mux (nama file sama dengan HTML)?
11. **Metadata Microstock**: Judul, deskripsi, keywords, dan kategori — tulis otomatis atau ada preferensi?
12. **Nama File Output**: Nama file `.html` baru yang diinginkan (default: sesuai nama request, `snake_case`). File selalu dibuat baru, bukan menimpa.

### C. Konfirmasi Singkat
Setelah jawaban diterima, ringkas spesifikasi dalam 3-5 baris (konsep, style, font, ukuran, durasi/loop) lalu langsung eksekusi. Jika jawaban ambigu, tanyakan ulang hanya bagian yang kurang.

---

## 1. Aturan Wajib (Golden Rules)

1. **Zero Online CDN (100% Offline Standalone & Local Folder Assets)**:
   - DILARANG menggunakan CDN online yang memerlukan koneksi internet (tanpa CDN luar seperti cdnjs, unpkg, jsdelivr, atau Google Fonts CDN).
   - Animasi dapat berupa **satu file `.html` mandiri** ATAU memanggil aset lokal di dalam folder HTML (seperti gambar `.png`/`.jpg`/`.svg`/`.webp`, skrip modul `.js`, dan stylesheet `.css`).
   - Mesin render NARA secara otomatis memetakan base URL folder lokal, memuat seluruh gambar/script/CSS, dan menunggu decoding aset selesai sebelum frame direkam.
   - Gunakan **Native Canvas 2D API**, **WebGL**, **SVG prosedural**, atau **CSS3 Keyframes/Transitions**.
   - Gunakan font sistem bawaan (`system-ui`, `-apple-system`, `sans-serif`, `monospace`, `'Trebuchet MS'`, `'Plus Jakarta Sans'`) atau font lokal yang dipanggil lewat `@font-face`.

2. **Wajib Memiliki Header Metadata JSON (Line 1)**:
   - Harus dimulai tepat di baris pertama file dengan blok komentar:
     ```html
     <!--METADATA
     {
       "title": "Judul Komersial Video",
       "description": "Deskripsi profesional untuk microstock",
       "keywords": ["tag1", "tag2", "4k", "motion graphics", "loop", "prores"],
       "category": "Motion Graphics & Backgrounds",
       "fps": 60,
       "total_frames": 180,
       "loop": true,
       "width": 3840,
       "height": 2160,
       "hold_last_frames": 0
     }
     METADATA-->
     ```
   - Metadata ini otomatis diekstrak NARA untuk konfigurasi render, embedding tag video in-file, dan ekspor `metadata_export.csv`.

3. **Deterministic Virtual Clock (Mekanisme Render Frame-by-Frame)**:
   - Mesin render Puppeteer NARA mengunci waktu dan memanggil fungsi render per frame:
     ```javascript
     window.__renderTick = function(frameIndex, targetFps) {
       renderFrame(frameIndex);
     };
     ```
   - Animasi **TIDAK BOLEH** bergantung pada `performance.now()`, `Date.now()`, atau `setInterval()` untuk posisi visualnya. Seluruh state visual harus merupakan fungsi murni dari `frameIndex`.

4. **Matematika Deterministic (No Random Stutter)**:
   - DILARANG memanggil `Math.random()` di dalam loop `renderFrame()`. Jika dipanggil setiap frame, partikel akan bergetar acak dan gagal dirender konsisten.
   - Hasilkan partikel/posisi acak pada array saat inisialisasi di luar fungsi render, atau gunakan PRNG seeded:
     ```javascript
     function seededRandom(seed) {
       const x = Math.sin(seed) * 10000;
       return x - Math.floor(x);
     }
     ```

5. **Seamless Looping vs One-Shot Hold**:
   - **Seamless Loop** (`loop: true`):
     - Putaran trigonometri penuh: `const progress = (frameIndex % TOTAL_FRAMES) / TOTAL_FRAMES;`
     - Sudut rotasi / siklus: `const loopAngle = progress * Math.PI * 2;`
     - Gunakan `Math.sin(loopAngle)` dan `Math.cos(loopAngle)` agar frame terakhir menyatu sempurna kembali ke frame 0 tanpa jeda/patahan.
   - **One-Shot dengan Hold** (`loop: false`):
     - Gerakan terjadi dari frame `0` sampai `(TOTAL_FRAMES - HOLD_FRAMES)`.
     - Pose frame terakhir ditahan statis selama sisa frame `hold_last_frames` (misal 60 frame = 1 detik jeda untuk logo reveal / badge explainer).

6. **Canvas Stage 4K & Auto-Fit Scaling**:
   - Resolusi kanvas master: `3840` x `2160` (atau `1920x1080`, `1080x1920`, `1080x1080`).
   - Gunakan wrapper `#stage-container` dengan CSS `transform: translate(-50%, -50%) scale(...)` agar kanvas pas di jendela preview tanpa terdistorsi.

7. **Dukungan Alpha Channel (Transparansi ProRes 4444)**:
   - Untuk aset overlay (misal partikel, hud, lower-thirds):
     - Berikan `background: transparent;` pada CSS `body` dan `#stage-container`.
     - Bersihkan frame menggunakan `ctx.clearRect(0, 0, WIDTH, HEIGHT)` (bukan `ctx.fillRect()` warna solid).
     - NARA otomatis merender transparansi murni pada preset **MOV ProRes 4444 Alpha**.

---

## 2. Template Boilerplate Standar NARA

Gunakan struktur berikut sebagai fondasi setiap animasi HTML baru:

```html
<!--METADATA
{
  "title": "Quantum Cyberpunk Grid 4K Loop",
  "description": "Futuristic cyberpunk holographic energy grid with pulsing telemetry data and floating particle vortex.",
  "keywords": ["cyberpunk", "grid", "hologram", "hud", "quantum", "futuristic", "4k", "loop", "motion graphics", "technology"],
  "category": "Motion Graphics & Backgrounds",
  "fps": 60,
  "total_frames": 180,
  "loop": true,
  "width": 3840,
  "height": 2160,
  "hold_last_frames": 0
}
METADATA-->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quantum Cyberpunk Grid 4K Loop</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: #04060E; /* Atau 'transparent' untuk alpha overlay */
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #stage-container {
      width: 3840px;
      height: 2160px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform-origin: center center;
    }
    canvas {
      display: block;
      width: 3840px;
      height: 2160px;
    }
  </style>
</head>
<body>
  <div id="stage-container">
    <canvas id="stage" width="3840" height="2160"></canvas>
  </div>

  <script>
    const canvas = document.getElementById('stage');
    const ctx = canvas.getContext('2d');
    const WIDTH = 3840;
    const HEIGHT = 2160;
    const TOTAL_FRAMES = 180;
    const IS_TRANSPARENT = false; // Set true jika template overlay

    // --- 1. INISIALISASI DATA DETERMINISTIK ---
    const PARTICLE_COUNT = 120;
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        baseX: (i / PARTICLE_COUNT) * WIDTH,
        baseY: HEIGHT * 0.5 + Math.sin(i * 1.5) * 400,
        radius: 4 + (i % 6) * 3,
        phase: (i / PARTICLE_COUNT) * Math.PI * 2,
        speed: 1 + (i % 3) * 0.5,
        color: i % 2 === 0 ? '#00FFCC' : '#7928CA'
      });
    }

    // --- 2. LOGIKA RENDER FRAME UTAMA ---
    function renderFrame(frameIndex) {
      const progress = (frameIndex % TOTAL_FRAMES) / TOTAL_FRAMES;
      const loopAngle = progress * Math.PI * 2;

      // Bersihkan kanvas
      if (IS_TRANSPARENT) {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
      } else {
        ctx.fillStyle = '#04060E';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }

      // Render Visual Animasi
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      particles.forEach((p, idx) => {
        const currentAngle = loopAngle * p.speed + p.phase;
        const x = p.baseX + Math.cos(currentAngle) * 80;
        const y = p.baseY + Math.sin(currentAngle) * 120;

        ctx.shadowBlur = 25;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    // --- 3. NARA RENDER HOOK (MANDATORY) ---
    window.__renderTick = function(frameIndex, targetFps) {
      renderFrame(frameIndex);
    };

    // --- 4. PREVIEW LOOP DALAM BROWSER STANDAR ---
    let previewFrame = 0;
    function animLoop() {
      if (!window.__isNaraHeadless && !window.__IS_HEADLESS_RENDERER__) {
        renderFrame(previewFrame);
        previewFrame = (previewFrame + 1) % TOTAL_FRAMES;
        requestAnimationFrame(animLoop);
      }
    }

    // --- 5. AUTO-FIT SCALING KE VIEWPORT ---
    function autoFitStage() {
      const container = document.getElementById('stage-container');
      if (!container) return;
      const scale = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
      container.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    window.addEventListener('resize', autoFitStage);
    window.addEventListener('DOMContentLoaded', () => {
      autoFitStage();
      requestAnimationFrame(animLoop);
    });
    autoFitStage();
  </script>
</body>
</html>
```

---

## 3. Standar Durasi & Frame NARA

| Kebutuhan Video | Durasi Rekomendasi | FPS | Total Frames | Hold Frames | Formula Loop |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fast Loop (HUD, Partikel, Icon)** | 3.0 detik | 60 | 180 | 0 | `loopAngle = (f / 180) * 2π` |
| **Golden Microstock Loop (3D, Waves, Abstract)** | 5.0 detik | 60 | 300 | 0 | `loopAngle = (f / 300) * 2π` |
| **Ambient LED Screen / Wallpaper** | 10.0 detik | 60 | 600 | 0 | `loopAngle = (f / 600) * 2π` |
| **Logo Reveal / Intro (One-Shot)** | 3.0 detik (2s aksi + 1s hold) | 60 | 180 | 60 | `t = min(1, f / 120)` |
| **Infografis & Chart Race (One-Shot)** | 5.0 detik (3.5s aksi + 1.5s hold) | 60 | 300 | 90 | `t = min(1, f / 210)` |

---

## 4. Efek Visual Populer & Teknik Khusus

### A. Neon Glow & Cyberpunk Bloom
Gunakan `ctx.shadowBlur`, `ctx.shadowColor`, dan `ctx.globalCompositeOperation = 'lighter'` atau `'screen'`:
```javascript
ctx.save();
ctx.globalCompositeOperation = 'lighter';
ctx.shadowBlur = 30;
ctx.shadowColor = '#00FFCC';
ctx.strokeStyle = '#00FFCC';
ctx.lineWidth = 6;
// Gambar path atau bentuk bercahaya
ctx.stroke();
ctx.restore();
```

### B. Smooth Easing Function (Khusus One-Shot)
Untuk animasi intro atau transisi, gunakan formula cubic bezier deterministik:
```javascript
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
```

### C. Auto Audio Muxing
Jika ingin menyertakan musik atau sound effects:
- Simpan file audio dengan nama file yang persis sama dengan file `.html` di folder yang sama.
- Contoh: `cyber_hud_4k.html` berdampingan dengan `cyber_hud_4k.wav` atau `cyber_hud_4k.mp3`.
- NARA akan mendeteksi audio secara otomatis dan melakukan muxing stereo 320 kbps (MP4) atau uncompressed PCM 24-bit (MOV ProRes 4444).

---

## 5. Aturan Anti-Overlap (Layout Bersih, Tanpa Teks Bertabrakan)

Hasil render TIDAK BOLEH memiliki teks/elemen yang saling tumpang tindih, terpotong, atau keluar frame, kecuali overlap disengaja sebagai efek layer (glow, bayangan, background).

1. **Layout Grid & Zona Terdefinisi**:
   - Bagi kanvas ke zona tetap (mis. title, subtitle, konten, footer) dengan konstanta `LAYOUT = { title:{x,y,w,h}, ... }`. Jangan menaruh posisi teks secara acak/ad-hoc.
   - Safe area: margin minimal **5%** dari semua sisi (3840x2160 → ±192px horizontal, ±108px vertikal). Semua teks harus berada di dalam safe area.

2. **Ukur Teks Sebelum Menggambar**:
   - Gunakan `ctx.measureText(text).width` untuk memastikan teks muat di lebar zona. Jika melebihi, kecilkan font (loop turun per langkah) atau pecah baris (word-wrap).
   ```javascript
   function fitText(ctx, text, maxW, startSize, fontFamily, weight = 700) {
     let size = startSize;
     do {
       ctx.font = `${weight} ${size}px ${fontFamily}`;
       if (ctx.measureText(text).width <= maxW) break;
       size -= 2;
     } while (size > 12);
     return size;
   }
   function wrapText(ctx, text, maxW) {
     const words = text.split(' '), lines = [];
     let line = '';
     for (const w of words) {
       const test = line ? line + ' ' + w : w;
       if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
       else line = test;
     }
     if (line) lines.push(line);
     return lines;
   }
   ```

3. **Line-Height & Jarak Vertikal Eksplisit**:
   - Hitung tinggi blok = `jumlahBaris * fontSize * 1.2`. Posisi blok berikutnya = `y blok sebelumnya + tinggi blok + gap (≥ 0.5 × fontSize)`.
   - Set `ctx.textBaseline = 'top'` atau `'middle'` secara konsisten agar kalkulasi posisi akurat.

4. **Cegah Tabrakan Antar Elemen Dinamis**:
   - Untuk elemen bergerak (label, node, partikel berteks), hitung bounding box `{x,y,w,h}` dan cek tabrakan (AABB) saat inisialisasi (di luar `renderFrame`). Geser/relokasi posisi hingga tidak overlap.
   - Gunakan jalur gerak yang amplitudonya lebih kecil dari jarak antar elemen (amplitudo < gap/2).
   - Hindari 2 teks berbeda berada di posisi yang sama pada frame yang sama; jika bergantian, gunakan timeline (fade-out selesai sebelum fade-in dimulai, tanpa jeda tumpang tindih).

5. **Animasi Teks Tidak Boleh Menabrak**:
   - Animasi slide/scale/typewriter harus dihitung dari ukuran akhir (final bounding box), bukan ukuran saat ini; pastikan scale maksimum tetap berada dalam zona dan safe area.
   - Transisi antar teks berurutan: `outEnd <= inStart` (dalam frame).

6. **Kontras & Keterbacaan**:
   - Teks di atas visual ramai wajib punya panel/scrim semi-transparan atau `shadowBlur` gelap di belakangnya, dan diletakkan pada lapisan paling atas (digambar terakhir).
   - Urutan gambar: background → elemen dekoratif → konten → teks.

7. **Mode HTML/CSS**: Jika memakai DOM, gunakan `display:flex`/`grid` dengan `gap`, `overflow:hidden`, `white-space`/`text-wrap` eksplisit, dan hindari `position:absolute` tanpa koordinat zona. Jangan bergantung pada font yang belum dimuat (tunggu `document.fonts.ready`).

8. **Verifikasi Resolusi Lain**: Jika mendukung 1080x1920 / 1080x1080, hitung `LAYOUT` secara proporsional dari `WIDTH`/`HEIGHT`, bukan angka piksel tetap.

---

## 6. Checklist Verifikasi Sebelum Menyerahkan Kode HTML

- [ ] Tidak ada teks/elemen yang overlap, terpotong, atau keluar safe area (5%) pada frame mana pun.
- [ ] Semua teks diukur dengan `measureText` (fit/wrap) dan memiliki zona layout terdefinisi.
- [ ] Teks yang bergantian memakai timeline tanpa tumpang tindih (`outEnd <= inStart`).

- [ ] Baris pertama adalah `<!--METADATA { ... } METADATA-->` yang valid JSON.
- [ ] Tidak ada referensi URL eksternal atau tag `<script src="...">`.
- [ ] Resolusi kanvas diset ke 3840x2160 (atau resolusi target).
- [ ] Fungsi `window.__renderTick(frameIndex, targetFps)` terdefinisi.
- [ ] Preview loop dilindungi oleh pengecekan `!window.__isNaraHeadless`.
- [ ] Tidak ada pemanggilan `Math.random()` tanpa seed di dalam `renderFrame()`.
- [ ] Desain visual memiliki estetika komersial premium (gradasi warna modern, pencahayaan, kontras tajam).
