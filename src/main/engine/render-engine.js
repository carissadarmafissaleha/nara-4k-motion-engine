/**
 * Motion Studio Engine - Core Render Engine & Streaming Memory Pipeline
 * Zero-Temp-File Frame Streaming from Headless Chrome to FFmpeg
 */

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const dns = require('dns');
const https = require('https');
const http = require('http');
const puppeteer = require('puppeteer');

function safeExistsSync(targetPath) {
  if (typeof targetPath !== 'string' || !targetPath.trim()) {
    return false;
  }
  try {
    return fs.existsSync(targetPath);
  } catch (e) {
    return false;
  }
}

/**
 * Determine FFmpeg binary executable path
 * Prioritizes ffmpeg-static, falls back to common system locations
 */
function resolveFfmpegPath() {
  try {
    const staticFfmpeg = require('ffmpeg-static');
    const ffmpegPathStr = typeof staticFfmpeg === 'string' ? staticFfmpeg : (staticFfmpeg && typeof staticFfmpeg.default === 'string' ? staticFfmpeg.default : null);
    if (safeExistsSync(ffmpegPathStr)) {
      return ffmpegPathStr;
    }
  } catch (e) {
    // ignore
  }

  // Windows fallback paths
  const commonWinPaths = [
    'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe',
    'C:\\ffmpeg\\bin\\ffmpeg.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe')
  ];

  for (const p of commonWinPaths) {
    if (safeExistsSync(p)) return p;
  }

  return 'ffmpeg'; // system PATH fallback
}

/**
 * Locate Chrome/Chromium executable
 */
function resolveBrowserExecutable() {
  try {
    if (typeof puppeteer.executablePath === 'function') {
      const ep = puppeteer.executablePath();
      if (typeof ep === 'string' && safeExistsSync(ep)) {
        return ep;
      }
    }
  } catch (e) {
    // ignore
  }

  const systemBrowsers = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  for (const b of systemBrowsers) {
    if (safeExistsSync(b)) return b;
  }

  return undefined;
}

let cachedHardwareEncoder = undefined;

/**
 * Detect available hardware video encoders (AMD AMF, NVIDIA NVENC, Intel QSV)
 * Tests dynamically with a lightweight probe using FFmpeg
 */
function detectHardwareEncoder(ffmpegPath = resolveFfmpegPath()) {
  if (cachedHardwareEncoder !== undefined) {
    return cachedHardwareEncoder;
  }

  const candidates = [
    { type: 'amf', encoder: 'h264_amf', name: 'AMD AMF (Radeon GPU)' },
    { type: 'nvenc', encoder: 'h264_nvenc', name: 'NVIDIA NVENC (GeForce/RTX)' },
    { type: 'qsv', encoder: 'h264_qsv', name: 'Intel Quick Sync (QSV)' }
  ];

  for (const cand of candidates) {
    try {
      const probe = spawnSync(
        ffmpegPath,
        ['-f', 'lavfi', '-i', 'color=c=black:s=128x128:d=0.04', '-c:v', cand.encoder, '-f', 'null', '-'],
        { windowsHide: true, timeout: 3000 }
      );
      if (probe && probe.status === 0) {
        cachedHardwareEncoder = cand;
        return cachedHardwareEncoder;
      }
    } catch (e) {
      // ignore probe error and try next candidate
    }
  }

  cachedHardwareEncoder = null;
  return null;
}

/**
 * FFmpeg Preset Arguments Generator with GPU Acceleration & CPU Fallback
 */
function getFfmpegArgs(preset, fps, outputPath, metadata = {}, audioPath = null, audioOptions = {}) {
  const isProResPreset = (preset === 'prores4444' || preset === 'prores' || preset === 'mov');
  const useJpegInput = Boolean(audioOptions.useJpegInput || audioOptions.fastMode) && !isProResPreset;
  const commonInput = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', useJpegInput ? 'mjpeg' : 'png',
    '-r', String(fps),
    '-i', '-'
  ];

  const hasAudio = Boolean(audioPath && safeExistsSync(audioPath));

  if (hasAudio) {
    if (audioOptions.isSeamlessLoop) {
      commonInput.push('-stream_loop', '-1');
    }
    commonInput.push('-i', audioPath);
  }

  // Optimized chroma scaler: bicubic + full chroma (much faster than spline, visually crisp)
  commonInput.push('-sws_flags', audioOptions.fastMode ? 'fast_bilinear' : 'bicubic+full_chroma_int');

  let videoArgs = [];
  let audioArgs = [];
  const hw = audioOptions.hwEncoder;

  switch (preset) {
    case 'prores4444':
    case 'prores':
    case 'mov':
      // MOV ProRes 4444 Alpha (Studio Microstock Mastering Format)
      videoArgs = [
        '-c:v', 'prores_ks',
        '-profile:v', '4',
        '-qscale:v', '4',
        '-vendor', 'apl0',
        '-threads', '0',
        '-pix_fmt', 'yuva444p10le',
        '-color_primaries', 'bt709',
        '-color_trc', 'bt709',
        '-colorspace', 'bt709'
      ];
      if (hasAudio) {
        audioArgs = [
          '-c:a', 'pcm_s24le',
          '-ar', '48000',
          '-af', 'apad'
        ];
      }
      break;

    case 'mp4_4k':
      if (hw && hw.type === 'amf') {
        // AMD AMF Hardware Encoding
        videoArgs = [
          '-c:v', 'h264_amf',
          '-quality', audioOptions.fastMode ? 'speed' : 'balanced',
          '-rc', 'cqp',
          '-qp_i', audioOptions.fastMode ? '18' : '15',
          '-qp_p', audioOptions.fastMode ? '20' : '17',
          '-usage', 'transcoding',
          '-pix_fmt', 'yuv420p',
          '-color_primaries', 'bt709',
          '-color_trc', 'bt709',
          '-colorspace', 'bt709',
          '-color_range', 'tv',
          '-movflags', '+faststart'
        ];
      } else if (hw && hw.type === 'nvenc') {
        // NVIDIA NVENC Hardware Encoding
        videoArgs = [
          '-c:v', 'h264_nvenc',
          '-preset', audioOptions.fastMode ? 'p2' : 'p4',
          '-rc', 'constqp',
          '-qp', audioOptions.fastMode ? '18' : '14',
          '-pix_fmt', 'yuv420p',
          '-color_primaries', 'bt709',
          '-color_trc', 'bt709',
          '-colorspace', 'bt709',
          '-color_range', 'tv',
          '-movflags', '+faststart'
        ];
      } else if (hw && hw.type === 'qsv') {
        // Intel Quick Sync Video Encoding
        videoArgs = [
          '-c:v', 'h264_qsv',
          '-preset', audioOptions.fastMode ? 'veryfast' : 'medium',
          '-global_quality', audioOptions.fastMode ? '19' : '15',
          '-pix_fmt', 'nv12',
          '-color_primaries', 'bt709',
          '-color_trc', 'bt709',
          '-colorspace', 'bt709',
          '-color_range', 'tv',
          '-movflags', '+faststart'
        ];
      } else {
        // CPU Fallback (libx264 with Multithreading)
        videoArgs = [
          '-c:v', 'libx264',
          '-preset', audioOptions.fastMode ? 'veryfast' : 'fast',
          '-crf', audioOptions.fastMode ? '16' : '14',
          '-x264-params', audioOptions.fastMode ? 'aq-mode=3' : 'aq-mode=3:aq-strength=1.0',
          '-threads', '0',
          '-pix_fmt', 'yuv420p',
          '-color_primaries', 'bt709',
          '-color_trc', 'bt709',
          '-colorspace', 'bt709',
          '-color_range', 'tv',
          '-movflags', '+faststart'
        ];
      }
      if (hasAudio) {
        audioArgs = [
          '-c:a', 'aac',
          '-b:a', '320k',
          '-ar', '48000',
          '-af', 'apad'
        ];
      }
      break;

    case 'mp4_sosmed':
    default:
      if (hw && hw.type === 'amf') {
        videoArgs = [
          '-c:v', 'h264_amf',
          '-quality', audioOptions.fastMode ? 'speed' : 'balanced',
          '-rc', 'cqp',
          '-qp_i', audioOptions.fastMode ? '22' : '18',
          '-qp_p', audioOptions.fastMode ? '24' : '20',
          '-usage', 'transcoding',
          '-pix_fmt', 'yuv420p',
          '-color_primaries', 'bt709',
          '-color_trc', 'bt709',
          '-colorspace', 'bt709',
          '-color_range', 'tv',
          '-movflags', '+faststart'
        ];
      } else if (hw && hw.type === 'nvenc') {
        videoArgs = [
          '-c:v', 'h264_nvenc',
          '-preset', audioOptions.fastMode ? 'p2' : 'p4',
          '-rc', 'constqp',
          '-qp', audioOptions.fastMode ? '20' : '17',
          '-pix_fmt', 'yuv420p',
          '-color_primaries', 'bt709',
          '-color_trc', 'bt709',
          '-colorspace', 'bt709',
          '-color_range', 'tv',
          '-movflags', '+faststart'
        ];
      } else if (hw && hw.type === 'qsv') {
        videoArgs = [
          '-c:v', 'h264_qsv',
          '-preset', audioOptions.fastMode ? 'veryfast' : 'medium',
          '-global_quality', audioOptions.fastMode ? '22' : '18',
          '-pix_fmt', 'nv12',
          '-color_primaries', 'bt709',
          '-color_trc', 'bt709',
          '-colorspace', 'bt709',
          '-color_range', 'tv',
          '-movflags', '+faststart'
        ];
      } else {
        videoArgs = [
          '-c:v', 'libx264',
          '-preset', audioOptions.fastMode ? 'ultrafast' : 'fast',
          '-crf', '18',
          '-x264-params', 'aq-mode=3:aq-strength=0.9',
          '-threads', '0',
          '-pix_fmt', 'yuv420p',
          '-color_primaries', 'bt709',
          '-color_trc', 'bt709',
          '-colorspace', 'bt709',
          '-color_range', 'tv',
          '-movflags', '+faststart'
        ];
      }
      if (hasAudio) {
        audioArgs = [
          '-c:a', 'aac',
          '-b:a', '256k',
          '-ar', '48000',
          '-af', 'apad'
        ];
      }
      break;
  }

  // Stream mapping and strict duration control when audio is present
  const mapArgs = [];
  const durationArgs = [];

  if (hasAudio) {
    mapArgs.push('-map', '0:v:0', '-map', '1:a:0?');
    if (audioOptions.durationSec && audioOptions.durationSec > 0) {
      durationArgs.push('-t', String(audioOptions.durationSec.toFixed(4)));
    }
  }

  // =========================================================================
  // In-File Metadata Embedding (Directly in MP4/MOV container atoms)
  // Adobe Stock, Shutterstock, and QuickTime automatically read these tags
  // =========================================================================
  const metadataArgs = [];

  const title = (metadata.title || '').trim();
  if (title) {
    metadataArgs.push('-metadata', `title=${title}`);
  }

  const description = (metadata.description || '').trim();
  if (description) {
    metadataArgs.push('-metadata', `description=${description}`);
  }

  let keywordsStr = '';
  if (Array.isArray(metadata.keywords)) {
    keywordsStr = metadata.keywords.filter(Boolean).join(', ');
  } else if (typeof metadata.keywords === 'string') {
    keywordsStr = metadata.keywords.trim();
  }

  if (keywordsStr) {
    metadataArgs.push('-metadata', `keywords=${keywordsStr}`);
    metadataArgs.push('-metadata', `comment=${keywordsStr}`);
    metadataArgs.push('-metadata', `synopsis=${keywordsStr}`);
  } else if (description) {
    metadataArgs.push('-metadata', `comment=${description}`);
  }

  const category = (metadata.category || '').trim();
  if (category) {
    metadataArgs.push('-metadata', `genre=${category}`);
  }

  metadataArgs.push('-metadata', 'artist=NARA Motion Studio');
  metadataArgs.push('-metadata', 'copyright=Commercial Stock License');

  return [
    ...commonInput,
    ...mapArgs,
    ...videoArgs,
    ...audioArgs,
    ...durationArgs,
    ...metadataArgs,
    outputPath
  ];
}

// ============================================================================
// Hybrid CDN & Intelligent Offline Fallback Engine
// ============================================================================
const VENDOR_DIR = path.resolve(__dirname, '../../assets/vendor');
const CDN_CACHE_DIR = path.resolve(__dirname, '../../../generated_animations/.cdn_cache');

// Ensure persistent CDN cache directory exists
if (!safeExistsSync(CDN_CACHE_DIR)) {
  try { fs.mkdirSync(CDN_CACHE_DIR, { recursive: true }); } catch (e) {}
}

let cachedOnlineStatus = null;
let lastOnlineCheckTime = 0;

/**
 * Check if machine is connected to internet (cached for 5 seconds to prevent latency)
 */
function isInternetConnected(timeoutMs = 1200) {
  const now = Date.now();
  if (cachedOnlineStatus !== null && (now - lastOnlineCheckTime < 5000)) {
    return Promise.resolve(cachedOnlineStatus);
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      cachedOnlineStatus = false;
      lastOnlineCheckTime = Date.now();
      resolve(false);
    }, timeoutMs);

    dns.lookup('cloudflare.com', (err) => {
      clearTimeout(timer);
      cachedOnlineStatus = !err;
      lastOnlineCheckTime = Date.now();
      resolve(!err);
    });
  });
}

/**
 * Identify if target URL or filename corresponds to bundled vendor libraries
 */
function matchVendorLibrary(targetUrl) {
  const normalized = targetUrl.toLowerCase();

  // GSAP 3.x
  if (normalized.includes('gsap') || normalized.includes('tweenmax') || normalized.includes('tweenlite')) {
    const file = path.join(VENDOR_DIR, 'gsap.min.js');
    if (safeExistsSync(file)) return { name: 'GSAP', path: file, mime: 'application/javascript' };
  }
  // Three.js
  if (normalized.includes('three.') || normalized.includes('three.min') || normalized.includes('/three@') || normalized.includes('/three/')) {
    const file = path.join(VENDOR_DIR, 'three.min.js');
    if (safeExistsSync(file)) return { name: 'Three.js', path: file, mime: 'application/javascript' };
  }
  // PixiJS
  if (normalized.includes('pixi.') || normalized.includes('pixi.min') || normalized.includes('/pixi@') || normalized.includes('/pixi.js/')) {
    const file = path.join(VENDOR_DIR, 'pixi.min.js');
    if (safeExistsSync(file)) return { name: 'PixiJS', path: file, mime: 'application/javascript' };
  }
  // Anime.js
  if (normalized.includes('anime.') || normalized.includes('anime.min') || normalized.includes('/animejs/')) {
    const file = path.join(VENDOR_DIR, 'anime.min.js');
    if (safeExistsSync(file)) return { name: 'Anime.js', path: file, mime: 'application/javascript' };
  }
  // Canvas Confetti
  if (normalized.includes('canvas-confetti') || normalized.includes('confetti.browser') || normalized.includes('confetti.min')) {
    const file = path.join(VENDOR_DIR, 'canvas-confetti.min.js');
    if (safeExistsSync(file)) return { name: 'Canvas-Confetti', path: file, mime: 'application/javascript' };
  }

  return null;
}

/**
 * Hash URL for local caching
 */
function getCacheFilePath(targetUrl) {
  try {
    const hash = crypto.createHash('md5').update(targetUrl).digest('hex');
    const ext = path.extname(new URL(targetUrl).pathname) || '.js';
    return path.join(CDN_CACHE_DIR, `${hash}${ext}`);
  } catch (e) {
    return null;
  }
}

/**
 * Asynchronously cache an online resource to disk
 */
function cacheResourceAsync(targetUrl, cachePath) {
  if (!cachePath || safeExistsSync(cachePath)) return;
  try {
    const client = targetUrl.startsWith('https') ? https : http;
    client.get(targetUrl, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(cachePath);
        res.pipe(fileStream);
        fileStream.on('error', () => {});
      }
    }).on('error', () => {});
  } catch (e) {}
}

/**
 * Setup Puppeteer request interception for Hybrid Online CDN with Local Fallback
 */
async function setupHybridCdnInterception(page, htmlPath, onLog = () => {}) {
  await page.setRequestInterception(true);
  const isOnline = await isInternetConnected();

  onLog(`[Engine CDN] Jaringan terdeteksi: ${isOnline ? 'ONLINE (CDN Cloud Aktif & Auto-Cached)' : 'OFFLINE (Local Vendor Fallback Aktif)'}`);

  page.on('request', async (req) => {
    try {
      const reqUrl = req.url();
      const isHttp = reqUrl.startsWith('http://') || reqUrl.startsWith('https://');

      // 1. Tangani request file:// lokal yang meminta folder vendor tapi filenya tidak ada di folder HTML
      if (reqUrl.startsWith('file://')) {
        let decodedPath = '';
        try {
          decodedPath = url.fileURLToPath(reqUrl);
        } catch (_) {
          decodedPath = reqUrl.replace(/^file:\/\/\/?/, '');
        }

        if (!safeExistsSync(decodedPath) && (decodedPath.includes('vendor') || decodedPath.includes('node_modules'))) {
          const matched = matchVendorLibrary(decodedPath);
          if (matched && safeExistsSync(matched.path)) {
            onLog(`[Engine CDN] Menyajikan vendor lokal untuk file path: ${path.basename(decodedPath)}`);
            return req.respond({
              status: 200,
              contentType: matched.mime,
              body: fs.readFileSync(matched.path)
            });
          }
        }
        return req.continue();
      }

      // 2. Tangani request online HTTP / HTTPS
      if (isHttp) {
        const cachePath = getCacheFilePath(reqUrl);
        const matchedVendor = matchVendorLibrary(reqUrl);

        if (isOnline) {
          // ONLINE: Biarkan Chromium memuat langsung dari CDN Online
          // Sekaligus buat salinan cache ke disk secara asinkron untuk persiapan rendering offline
          if (cachePath) {
            cacheResourceAsync(reqUrl, cachePath);
          }
          return req.continue();
        } else {
          // OFFLINE: Jalankan Fallback Offline Otomatis!
          // a. Cek apakah ada di folder vendor bawaan (GSAP, Three, Pixi, Anime, Confetti)
          if (matchedVendor && safeExistsSync(matchedVendor.path)) {
            onLog(`[Engine CDN] Offline Fallback: Menyajikan ${matchedVendor.name} dari vendor internal`);
            return req.respond({
              status: 200,
              contentType: matchedVendor.mime,
              body: fs.readFileSync(matchedVendor.path)
            });
          }

          // b. Cek apakah ada di cache lokal dari sesi online sebelumnya
          if (cachePath && safeExistsSync(cachePath)) {
            onLog(`[Engine CDN] Offline Fallback: Menyajikan dari cache lokal: ${path.basename(reqUrl)}`);
            const ext = path.extname(cachePath).toLowerCase();
            const contentType = ext === '.css' ? 'text/css' : (ext === '.woff2' ? 'font/woff2' : 'application/javascript');
            return req.respond({
              status: 200,
              contentType,
              body: fs.readFileSync(cachePath)
            });
          }

          // c. Jika resource online tidak tersedia saat offline, respon stub aman agar page.goto tidak hang/timeout
          onLog(`[Engine CDN] Peringatan: Offline dan ${reqUrl} belum tercache. Merespons stub aman.`);
          return req.respond({
            status: 200,
            contentType: 'application/javascript',
            body: Buffer.from(`/* [NARA] Offline Fallback Stub for ${reqUrl} */`)
          });
        }
      }

      return req.continue();
    } catch (err) {
      try { req.continue(); } catch (_) {}
    }
  });
}

class RenderEngine {
  constructor() {
    this.browser = null;
    this.isCancelled = false;
    this.activeFfmpegProcess = null;
  }

  /**
   * Launch or reuse headless browser instance with deterministic settings
   */
  async initBrowser() {
    if (this.browser && this.browser.connected) {
      return this.browser;
    }

    const executablePath = resolveBrowserExecutable();
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--allow-file-access-from-files',
      '--allow-running-insecure-content',
      '--enable-gpu',
      '--use-gl=angle',
      '--enable-webgl',
      '--enable-accelerated-2d-canvas',
      '--enable-gpu-rasterization',
      '--force-color-profile=srgb',
      '--enable-zero-copy',
      '--disable-features=CalculateNativeWinOcclusion',
      '--font-rendering=subpixel-positioning',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ];

    const options = {
      headless: 'new',
      args: launchArgs
    };

    if (executablePath) {
      options.executablePath = executablePath;
    }

    this.browser = await puppeteer.launch(options);
    return this.browser;
  }

  /**
   * Cancel ongoing render
   */
  cancel() {
    this.isCancelled = true;
    if (this.activeFfmpegProcess) {
      try {
        this.activeFfmpegProcess.kill('SIGKILL');
      } catch (e) {
        // ignore
      }
      this.activeFfmpegProcess = null;
    }
  }

  /**
   * Render single HTML animation to video
   * @param {object} config
   * @param {string} config.htmlPath
   * @param {string} config.outputPath
   * @param {string} config.preset - 'prores4444' | 'mp4_4k' | 'mp4_sosmed'
   * @param {number} config.width
   * @param {number} config.height
   * @param {number} config.fps
   * @param {number} config.totalFrames
   * @param {boolean} config.isSeamlessLoop
   * @param {number} config.holdLastFrames
   * @param {function} [onProgress] - callback({ currentFrame, totalFrames, percent, fps, eta })
   * @param {function} [onLog] - callback(string)
   * @returns {Promise<{ success: boolean, outputPath: string, totalFramesRendered: number }>}
   */
  async renderAnimation(config, onProgress = () => {}, onLog = () => {}) {
    this.isCancelled = false;
    const {
      htmlPath,
      outputPath,
      preset = 'prores4444',
      width = 3840,
      height = 2160,
      fps = 60,
      totalFrames = 180,
      isSeamlessLoop = true,
      holdLastFrames = 0,
      bgMode = 'checkerboard',
      audioPath = null,
      copyAudioToOutput = false,
      fastMode = false,
      encoderEngine = 'auto'
    } = config;

    const ffmpegPath = resolveFfmpegPath();
    onLog(`[Engine] Initializing render for: ${path.basename(htmlPath)}`);
    onLog(`[Engine] Target resolution: ${width}x${height} @ ${fps}fps`);
    onLog(`[Engine] Preset: ${preset} | Loop: ${isSeamlessLoop} | Hold: ${holdLastFrames} | BG: ${bgMode}`);

    // Detect / Apply Hardware Encoder
    let chosenHw = null;
    if (encoderEngine === 'cpu') {
      onLog('[Engine] Mode Render: CPU Software (libx264) dipilih.');
    } else {
      const detected = detectHardwareEncoder(ffmpegPath);
      if (detected) {
        chosenHw = detected;
        onLog(`[Engine] Akselerasi Hardware GPU Aktif: ${detected.name} (${detected.encoder})`);
      } else {
        if (encoderEngine === 'gpu') {
          onLog('[Engine] Peringatan: GPU encoder tidak terdeteksi, fallback otomatis ke CPU.');
        } else {
          onLog('[Engine] GPU hardware encoder tidak ditemukan, menggunakan CPU fallback.');
        }
      }
    }
    if (audioPath && safeExistsSync(audioPath)) {
      onLog(`[Engine] Audio se-nama terdeteksi: ${path.basename(audioPath)} (Muxing ke video output)`);
    }
    onLog(`[Engine] Using FFmpeg binary: ${ffmpegPath}`);

    // Ensure output directory exists
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

    // 1. Calculate frame ranges
    // Seamless Loop: 0 to (totalFrames - 1)
    // One-Shot: 0 to (totalFrames - 1) + holdLastFrames
    const loopCycleFrames = Math.max(1, totalFrames);
    const holdCount = isSeamlessLoop ? 0 : Math.max(0, Number(holdLastFrames) || 0);
    const totalFramesToRender = loopCycleFrames + holdCount;

    onLog(`[Engine] Frames planned: ${totalFramesToRender} (${loopCycleFrames} cycle + ${holdCount} hold)`);

    // 2. Launch browser & create page
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    // 3. Configure viewport
    await page.setViewport({
      width: Number(width),
      height: Number(height),
      deviceScaleFactor: 1
    });

    // 4. Inject Deterministic Virtual Clock before any script execution
    await page.evaluateOnNewDocument(() => {
      let __virtualTime = 0;
      let __rafCallbacks = new Map();
      let __rafCounter = 0;

      // Deterministic freeze of temporal APIs
      Date.now = () => Math.round(__virtualTime);
      performance.now = () => __virtualTime;

      window.requestAnimationFrame = (callback) => {
        const id = ++__rafCounter;
        __rafCallbacks.set(id, callback);
        return id;
      };

      window.cancelAnimationFrame = (id) => {
        __rafCallbacks.delete(id);
      };

      // Step one deterministic frame tick
      window.__renderTick = (frameIndex, targetFps = 60) => {
        __virtualTime = (frameIndex / targetFps) * 1000;

        // Drain current rAF queue
        const currentCallbacks = Array.from(__rafCallbacks.values());
        __rafCallbacks.clear();

        for (const cb of currentCallbacks) {
          try {
            cb(__virtualTime);
          } catch (err) {
            console.error('Error in requestAnimationFrame callback:', err);
          }
        }

        // Custom hook support if canvas or webgl animation exposes it
        if (typeof window.__onFrameUpdate === 'function') {
          try {
            window.__onFrameUpdate(frameIndex, __virtualTime, targetFps);
          } catch (err) {
            console.error('Error in __onFrameUpdate hook:', err);
          }
        }
      };

      // Allow inspectable flags
      window.__IS_HEADLESS_RENDERER__ = true;
    });

    // 4.5. Initialize Hybrid CDN & Intelligent Offline Fallback Interceptor
    await setupHybridCdnInterception(page, htmlPath, onLog);

    // 5. Navigate to local HTML file with standard RFC 8089 file URL
    const fileUrl = path.isAbsolute(htmlPath) ? url.pathToFileURL(htmlPath).href : htmlPath;
    await page.goto(fileUrl, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 45000
    });

    // Ensure all images, styles, and web fonts in the HTML folder are completely loaded before capture
    await page.evaluate(async () => {
      const imgs = Array.from(document.images || []);
      if (imgs.length > 0) {
        await Promise.all(imgs.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          });
        }));
      }
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch (e) {}
      }
    });
    onLog(`[Engine] Successfully loaded local HTML and assets: ${path.basename(htmlPath)}`);

    // Handle background transparency & color strictly according to preset and user-selected bgMode
    const isProResAlpha = (preset === 'prores4444' || preset === 'prores' || preset === 'mov');
    let targetBgCss = null;
    let cdpBgColor = { r: 0, g: 0, b: 0, a: 0 };
    let isTransparentCapture = false;

    if (isProResAlpha) {
      if (bgMode === 'dark') {
        targetBgCss = '#000000';
        cdpBgColor = { r: 0, g: 0, b: 0, a: 255 };
        isTransparentCapture = false;
        onLog('[Engine] Background applied: Dark Solid (#000000)');
      } else if (bgMode === 'light') {
        targetBgCss = '#ffffff';
        cdpBgColor = { r: 255, g: 255, b: 255, a: 255 };
        isTransparentCapture = false;
        onLog('[Engine] Background applied: Light Solid (#ffffff)');
      } else if (bgMode === 'green') {
        targetBgCss = '#00b140';
        cdpBgColor = { r: 0, g: 177, b: 64, a: 255 };
        isTransparentCapture = false;
        onLog('[Engine] Background applied: Green Screen Chroma Key (#00b140)');
      } else {
        // Default 'checkerboard' / transparent: Pure Transparent Alpha Channel
        targetBgCss = 'transparent';
        cdpBgColor = { r: 0, g: 0, b: 0, a: 0 };
        isTransparentCapture = true;
        onLog('[Engine] Background applied: Pure Transparent Alpha Channel');
      }
    } else {
      // For MP4 or opaque exports
      if (bgMode === 'dark') {
        targetBgCss = '#000000';
        cdpBgColor = { r: 0, g: 0, b: 0, a: 255 };
        isTransparentCapture = false;
        onLog('[Engine] Background applied: Dark Solid (#000000)');
      } else if (bgMode === 'light') {
        targetBgCss = '#ffffff';
        cdpBgColor = { r: 255, g: 255, b: 255, a: 255 };
        isTransparentCapture = false;
        onLog('[Engine] Background applied: Light Solid (#ffffff)');
      } else if (bgMode === 'green') {
        targetBgCss = '#00b140';
        cdpBgColor = { r: 0, g: 177, b: 64, a: 255 };
        isTransparentCapture = false;
        onLog('[Engine] Background applied: Green Screen Chroma Key (#00b140)');
      } else {
        targetBgCss = null; // Retain native HTML gradients/colors
        cdpBgColor = { r: 0, g: 0, b: 0, a: 255 };
        isTransparentCapture = false;
      }
    }

    try {
      const client = await page.target().createCDPSession();
      await client.send('Emulation.setDefaultBackgroundColorOverride', {
        color: cdpBgColor
      });
    } catch (e) {
      onLog(`[Warning] Could not set CDP background color override: ${e.message}`);
    }

    await page.addStyleTag({
      content: `
        html, body {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          ${targetBgCss ? `background-color: ${targetBgCss} !important; background: ${targetBgCss} !important;` : ''}
        }
        canvas, svg, #stage, .stage, .canvas-container {
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain !important;
        }
      `
    });

    await page.evaluate(() => {
      const curW = window.innerWidth;
      const curH = window.innerHeight;
      const target = document.getElementById('stage') ||
                     document.querySelector('.stage') ||
                     document.querySelector('.canvas-container') ||
                     document.getElementById('container') ||
                     document.querySelector('canvas') ||
                     document.querySelector('svg');
      if (target) {
        const cs = window.getComputedStyle(target);
        const origW = parseFloat(target.dataset.width) || parseFloat(target.style.width) || (target.width ? target.width : null) || parseFloat(cs.width) || curW;
        const origH = parseFloat(target.dataset.height) || parseFloat(target.style.height) || (target.height ? target.height : null) || parseFloat(cs.height) || curH;
        if (origW > 0 && origH > 0) {
          const scale = Math.min(curW / origW, curH / origH);
          target.style.position = 'absolute';
          target.style.left = '50%';
          target.style.top = '50%';
          target.style.transformOrigin = 'center center';
          target.style.transform = `translate(-50%, -50%) scale(${scale})`;
          target.style.margin = '0';
        }
      }
    });

    // 6. Spawn FFmpeg Process
    const videoDurationSec = totalFramesToRender / fps;
    const isOpaque = !isTransparentCapture && !isProResAlpha;
    const useJpegCapture = isOpaque;
    const jpegQuality = fastMode ? 90 : 95;

    if (fastMode) {
      onLog(`[Engine] Mode Hemat Spek aktif: JPEG capture + encoder lebih cepat`);
    } else if (useJpegCapture) {
      onLog(`[Engine] Fast Pipeline aktif: High-Fidelity JPEG (${jpegQuality}%) capture stream`);
    }

    const ffmpegArgs = getFfmpegArgs(preset, fps, outputPath, config.metadata || {}, audioPath, {
      isSeamlessLoop,
      durationSec: videoDurationSec,
      fastMode: Boolean(fastMode),
      encoderEngine,
      hwEncoder: chosenHw,
      useJpegInput: useJpegCapture
    });
    onLog(`[FFmpeg] Spawning: ${ffmpegPath} ${ffmpegArgs.join(' ')}`);

    const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs, {
      windowsHide: true,
      stdio: ['pipe', 'ignore', 'pipe']
    });

    this.activeFfmpegProcess = ffmpegProcess;

    let ffmpegStderr = '';
    ffmpegProcess.stderr.on('data', (chunk) => {
      ffmpegStderr += chunk.toString();
    });

    // Error handling on stdin to prevent unhandled EPIPE crashes
    ffmpegProcess.stdin.on('error', (err) => {
      if (err.code !== 'EPIPE') {
        onLog(`[FFmpeg Stdin Error] ${err.message}`);
      }
    });

    // Setup FFmpeg completion promise
    const ffmpegExitPromise = new Promise((resolve, reject) => {
      ffmpegProcess.on('close', (code) => {
        this.activeFfmpegProcess = null;
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}. Stderr: ${ffmpegStderr.slice(-500)}`));
        }
      });

      ffmpegProcess.on('error', (err) => {
        this.activeFfmpegProcess = null;
        reject(err);
      });
    });

    // 7. Streaming Memory Pipeline Frame Capture Loop
    const startTime = Date.now();
    let renderedCount = 0;

    try {
      for (let i = 0; i < totalFramesToRender; i++) {
        if (this.isCancelled) {
          onLog('[Engine] Render cancelled by user.');
          ffmpegProcess.stdin.destroy();
          await page.close();
          throw new Error('Render cancelled');
        }

        // Determine which animation frame tick to invoke
        // For normal cycle: frame i (from 0 to totalFrames - 1)
        // For hold frames: clamp to the final frame (loopCycleFrames - 1)
        const tickFrame = i < loopCycleFrames ? i : loopCycleFrames - 1;

        // Step virtual clock
        await page.evaluate((f, rate) => {
          if (window.__renderTick) {
            window.__renderTick(f, rate);
          }
        }, tickFrame, fps);

        // Capture frame buffer (Zero Temp Files) - omitBackground only when transparent alpha requested
        const frameBuffer = await page.screenshot(useJpegCapture ? {
          type: 'jpeg',
          quality: jpegQuality,
          captureBeyondViewport: false
        } : {
          type: 'png',
          omitBackground: isTransparentCapture,
          captureBeyondViewport: false
        });

        // Write buffer directly to FFmpeg stdin with backpressure management
        const canContinue = ffmpegProcess.stdin.write(frameBuffer);
        if (!canContinue) {
          // Pause frame capture and wait for buffer drain
          await new Promise((resolve) => ffmpegProcess.stdin.once('drain', resolve));
        }

        renderedCount++;

        // Live progress calculations
        const elapsedSec = (Date.now() - startTime) / 1000;
        const currentFps = renderedCount / Math.max(0.1, elapsedSec);
        const percent = Math.round((renderedCount / totalFramesToRender) * 100);
        const remainingFrames = totalFramesToRender - renderedCount;
        const etaSec = currentFps > 0 ? Math.round(remainingFrames / currentFps) : 0;
        
        // Format ETA into hours, minutes, and seconds
        let etaFormatted = '0s';
        if (etaSec > 0 && isFinite(etaSec)) {
          const totalSec = Math.round(etaSec);
          const h = Math.floor(totalSec / 3600);
          const m = Math.floor((totalSec % 3600) / 60);
          const s = totalSec % 60;
          if (h > 0) {
            etaFormatted = `${h}h ${m}m ${s < 10 ? '0' : ''}${s}s`;
          } else if (m > 0) {
            etaFormatted = `${m}m ${s < 10 ? '0' : ''}${s}s`;
          } else {
            etaFormatted = `${s}s`;
          }
        }

        onProgress({
          currentFrame: renderedCount,
          totalFrames: totalFramesToRender,
          percent,
          renderFps: currentFps.toFixed(1),
          elapsedSec: Math.round(elapsedSec),
          etaSec,
          etaFormatted
        });
      }

      // Finalize FFmpeg stream
      onLog('[Engine] All frames piped. Closing FFmpeg stdin...');
      ffmpegProcess.stdin.end();

      // Wait for FFmpeg process to complete encoding
      await ffmpegExitPromise;

      // Optionally save a copy of the matching audio file with the same name in the output folder
      if (copyAudioToOutput && audioPath && safeExistsSync(audioPath)) {
        try {
          const ext = path.extname(audioPath);
          const outAudioName = `${path.basename(outputPath, path.extname(outputPath))}${ext}`;
          const outAudioPath = path.join(path.dirname(outputPath), outAudioName);
          await fs.promises.copyFile(audioPath, outAudioPath);
          onLog(`[Engine] File audio se-nama berhasil disalin ke: ${outAudioName}`);
        } catch (copyErr) {
          onLog(`[Warning] Gagal menyalin file audio ke output: ${copyErr.message}`);
        }
      }

      onLog(`[Engine] Render completed successfully: ${outputPath}`);
    } catch (err) {
      if (!this.isCancelled) {
        onLog(`[Engine Error] Render failed: ${err.message}`);
      }
      try {
        ffmpegProcess.stdin.destroy();
      } catch (e) {}
      throw err;
    } finally {
      try {
        await page.close();
      } catch (e) {}
    }

    return {
      success: true,
      outputPath,
      totalFramesRendered: renderedCount
    };
  }

  /**
   * Close browser when quitting app
   */
  async close() {
    this.cancel();
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (e) {}
      this.browser = null;
    }
  }
}

module.exports = {
  RenderEngine,
  resolveFfmpegPath,
  resolveBrowserExecutable,
  getFfmpegArgs,
  detectHardwareEncoder
};
