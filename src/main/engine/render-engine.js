/**
 * Motion Studio Engine - Core Render Engine & Streaming Memory Pipeline
 * Zero-Temp-File Frame Streaming from Headless Chrome to FFmpeg
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const url = require('url');
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

/**
 * FFmpeg Preset Arguments Generator
 */
function getFfmpegArgs(preset, fps, outputPath, metadata = {}, audioPath = null, audioOptions = {}) {
  // Fast mode (non-alpha only): frames arrive as JPEG, which is far cheaper to encode than PNG
  const isProResPreset = (preset === 'prores4444' || preset === 'prores' || preset === 'mov');
  const useJpegInput = Boolean(audioOptions.fastMode) && !isProResPreset;
  const commonInput = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', useJpegInput ? 'mjpeg' : 'png',
    '-r', String(fps),
    '-i', '-'
  ];

  const hasAudio = Boolean(audioPath && safeExistsSync(audioPath));

  if (hasAudio) {
    // If seamless loop is active, loop the audio input stream to match full animation length
    if (audioOptions.isSeamlessLoop) {
      commonInput.push('-stream_loop', '-1');
    }
    commonInput.push('-i', audioPath);
  }

  commonInput.push('-sws_flags', 'spline+accurate_rnd+full_chroma_int+full_chroma_inp');

  let videoArgs = [];
  let audioArgs = [];

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
        '-pix_fmt', 'yuva444p10le',
        '-color_primaries', 'bt709',
        '-color_trc', 'bt709',
        '-colorspace', 'bt709'
      ];
      if (hasAudio) {
        // Broadcast standard uncompressed PCM 24-bit 48kHz stereo
        audioArgs = [
          '-c:a', 'pcm_s24le',
          '-ar', '48000',
          '-af', 'apad'
        ];
      }
      break;

    case 'mp4_4k':
      // MP4 High Bitrate 4K with AQ Mode 3 Anti-Banding & BT.709 mastering
      videoArgs = [
        '-c:v', 'libx264',
        '-preset', audioOptions.fastMode ? 'veryfast' : 'slow',
        '-crf', audioOptions.fastMode ? '16' : '12',
        '-x264-params', audioOptions.fastMode ? 'aq-mode=3' : 'aq-mode=3:aq-strength=1.1:deblock=-1,-1',
        '-pix_fmt', 'yuv420p',
        '-color_primaries', 'bt709',
        '-color_trc', 'bt709',
        '-colorspace', 'bt709',
        '-color_range', 'tv',
        '-movflags', '+faststart'
      ];
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
      // MP4 Sosmed 1080p with Anti-Banding
      videoArgs = [
        '-c:v', 'libx264',
        '-preset', audioOptions.fastMode ? 'ultrafast' : 'medium',
        '-crf', '18',
        '-x264-params', 'aq-mode=3:aq-strength=0.9',
        '-pix_fmt', 'yuv420p',
        '-color_primaries', 'bt709',
        '-color_trc', 'bt709',
        '-colorspace', 'bt709',
        '-color_range', 'tv',
        '-movflags', '+faststart'
      ];
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
      fastMode = false
    } = config;

    const ffmpegPath = resolveFfmpegPath();
    onLog(`[Engine] Initializing render for: ${path.basename(htmlPath)}`);
    onLog(`[Engine] Target resolution: ${width}x${height} @ ${fps}fps`);
    onLog(`[Engine] Preset: ${preset} | Loop: ${isSeamlessLoop} | Hold: ${holdLastFrames} | BG: ${bgMode}`);
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
    const useJpegCapture = Boolean(fastMode) && !isTransparentCapture && !isProResAlpha;
    if (fastMode) {
      onLog(`[Engine] Mode Hemat Spek aktif: ${useJpegCapture ? 'JPEG capture + ' : ''}encoder lebih cepat`);
    }
    const ffmpegArgs = getFfmpegArgs(preset, fps, outputPath, config.metadata || {}, audioPath, {
      isSeamlessLoop,
      durationSec: videoDurationSec,
      fastMode: Boolean(fastMode)
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
          quality: 92,
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

        onProgress({
          currentFrame: renderedCount,
          totalFrames: totalFramesToRender,
          percent,
          renderFps: currentFps.toFixed(1),
          elapsedSec: Math.round(elapsedSec),
          etaSec
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
  getFfmpegArgs
};
