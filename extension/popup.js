/**
 * NARA Motion Studio Companion - Browser Extension Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const btnInspectTab = document.getElementById('btnInspectTab');
  const btnToggleEditor = document.getElementById('btnToggleEditor');
  const selectPreset = document.getElementById('selectPreset');
  const codeDrawer = document.getElementById('codeDrawer');
  const btnCloseDrawer = document.getElementById('btnCloseDrawer');
  const codeEditorInput = document.getElementById('codeEditorInput');
  const btnRenderCode = document.getElementById('btnRenderCode');

  const viewportBox = document.getElementById('viewportBox');
  const previewFrame = document.getElementById('previewFrame');
  const emptyNotice = document.getElementById('emptyNotice');
  const resBadgeText = document.getElementById('resBadgeText');

  const frameSlider = document.getElementById('frameSlider');
  const timecodeText = document.getElementById('timecodeText');
  const btnRestart = document.getElementById('btnRestart');
  const btnPlayPause = document.getElementById('btnPlayPause');
  const btnDownloadHtml = document.getElementById('btnDownloadHtml');
  const btnCopyCode = document.getElementById('btnCopyCode');
  const toastMessage = document.getElementById('toastMessage');
  const btnExtThemeToggle = document.getElementById('btnExtThemeToggle');

  // Theme Management (Soft UI Dark / Light Mode)
  let extTheme = localStorage.getItem('nara_ext_theme') || 'dark';
  function applyExtTheme(theme) {
    extTheme = theme;
    localStorage.setItem('nara_ext_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    if (btnExtThemeToggle) {
      if (theme === 'light') {
        btnExtThemeToggle.classList.add('is-light');
      } else {
        btnExtThemeToggle.classList.remove('is-light');
      }
    }
  }
  if (btnExtThemeToggle) {
    btnExtThemeToggle.addEventListener('click', () => {
      applyExtTheme(extTheme === 'dark' ? 'light' : 'dark');
    });
  }
  applyExtTheme(extTheme);

  // State
  let currentHtml = '';
  let currentTotalFrames = 180;
  let currentFrame = 0;
  let isPlaying = false;
  let playInterval = null;
  const fps = 60;

  // Preset Catalog
  const presets = {
    'kinetic-typography': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Kinetic Typography 4K</title>
  <!--METADATA {"title":"Kinetic Typography Neon 4K","category":"Typography","fps":60,"total_frames":180,"width":3840,"height":2160} METADATA-->
  <style>
    html, body { margin:0; padding:0; width:100%; height:100%; background:transparent; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,sans-serif; }
    .stage { width:100vw; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .word { font-size:6vw; font-weight:900; letter-spacing:0.04em; color:#fff; text-shadow:0 0 30px #38bdf8, 0 0 60px #6366f1; }
    .sub { font-size:2vw; font-weight:700; color:#38bdf8; margin-top:10px; letter-spacing:0.2em; }
  </style>
</head>
<body>
  <div class="stage">
    <div class="word" id="textWord">NARA MOTION</div>
    <div class="sub" id="textSub">KINETIC TYPOGRAPHY</div>
  </div>
  <script>
    window.__renderTick = function(frame) {
      const p = (frame % 180) / 180;
      const scale = 0.95 + 0.1 * Math.sin(p * Math.PI * 2);
      const rot = Math.sin(p * Math.PI * 2) * 2;
      document.getElementById('textWord').style.transform = 'scale(' + scale + ') rotate(' + rot + 'deg)';
    };
  <\/script>
</body>
</html>`,

    'particle-fx': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Particle FX 4K</title>
  <!--METADATA {"title":"Cosmic Particle Vortex","category":"VFX","fps":60,"total_frames":180,"width":3840,"height":2160} METADATA-->
  <style>
    html, body { margin:0; padding:0; width:100%; height:100%; background:transparent; overflow:hidden; }
    canvas { width:100vw; height:100vh; display:block; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    const cvs = document.getElementById('c');
    const ctx = cvs.getContext('2d');
    cvs.width = 1920; cvs.height = 1080;
    const parts = Array.from({length: 120}, (_, i) => ({
      r: 100 + (i * 12) % 450,
      a: (i * 0.1) % (Math.PI * 2),
      size: 2 + (i % 6)
    }));
    window.__renderTick = function(frame) {
      ctx.clearRect(0, 0, 1920, 1080);
      const t = (frame % 180) / 180;
      parts.forEach(p => {
        const curA = p.a + t * Math.PI * 2;
        const x = 960 + Math.cos(curA) * p.r;
        const y = 540 + Math.sin(curA) * p.r * 0.6;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };
  <\/script>
</body>
</html>`,

    'isometric-3d': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Isometric 3D 4K</title>
  <!--METADATA {"title":"Isometric 3D Ripple Matrix","category":"3D Graphics","fps":60,"total_frames":180,"width":3840,"height":2160} METADATA-->
  <style>
    html, body { margin:0; padding:0; width:100%; height:100%; background:transparent; overflow:hidden; }
    canvas { width:100vw; height:100vh; display:block; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    const cvs = document.getElementById('c');
    const ctx = cvs.getContext('2d');
    cvs.width = 1920; cvs.height = 1080;
    window.__renderTick = function(frame) {
      ctx.clearRect(0, 0, 1920, 1080);
      const p = (frame % 180) / 180;
      for (let x = -4; x <= 4; x++) {
        for (let y = -4; y <= 4; y++) {
          const dist = Math.hypot(x, y);
          const h = 40 + Math.sin(dist * 0.8 - p * Math.PI * 2) * 25;
          const isoX = 960 + (x - y) * 50;
          const isoY = 540 + (x + y) * 28 - h;
          ctx.fillStyle = '#6366f1';
          ctx.beginPath();
          ctx.moveTo(isoX, isoY);
          ctx.lineTo(isoX + 40, isoY + 20);
          ctx.lineTo(isoX, isoY + 40);
          ctx.lineTo(isoX - 40, isoY + 20);
          ctx.fill();
        }
      }
    };
  <\/script>
</body>
</html>`,

    'data-visualization': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Data Visualization 4K</title>
  <!--METADATA {"title":"FinTech Analytics HUD","category":"Infographics","fps":60,"total_frames":180,"width":3840,"height":2160} METADATA-->
  <style>
    html, body { margin:0; padding:0; width:100%; height:100%; background:transparent; overflow:hidden; font-family:monospace; }
    canvas { width:100vw; height:100vh; display:block; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    const cvs = document.getElementById('c');
    const ctx = cvs.getContext('2d');
    cvs.width = 1920; cvs.height = 1080;
    window.__renderTick = function(frame) {
      ctx.clearRect(0, 0, 1920, 1080);
      const p = (frame % 180) / 180;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(960, 540, 160, -Math.PI * 0.8, -Math.PI * 0.8 + p * Math.PI * 1.6);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(p * 100) + '% TELEMETRY', 960, 550);
    };
  <\/script>
</body>
</html>`,

    'abstract-motion': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Abstract Motion 4K</title>
  <!--METADATA {"title":"Iridescent Fluid Waves","category":"Backgrounds","fps":60,"total_frames":180,"width":3840,"height":2160} METADATA-->
  <style>
    html, body { margin:0; padding:0; width:100%; height:100%; background:transparent; overflow:hidden; }
    canvas { width:100vw; height:100vh; display:block; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    const cvs = document.getElementById('c');
    const ctx = cvs.getContext('2d');
    cvs.width = 1920; cvs.height = 1080;
    window.__renderTick = function(frame) {
      ctx.clearRect(0, 0, 1920, 1080);
      const p = (frame % 180) / 180;
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = i % 2 === 0 ? '#ec4899' : '#38bdf8';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, 540);
        for (let x = 0; x <= 1920; x += 40) {
          const y = 540 + Math.sin(x * 0.005 + p * Math.PI * 2 + i) * 120;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };
  <\/script>
</body>
</html>`,

    'flat-animation': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Flat Animation 4K</title>
  <!--METADATA {"title":"Verified Success Badge Burst","category":"Illustrations","fps":60,"total_frames":180,"width":3840,"height":2160} METADATA-->
  <style>
    html, body { margin:0; padding:0; width:100%; height:100%; background:transparent; overflow:hidden; font-family:-apple-system,sans-serif; }
    .stage { width:100vw; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .badge { width:120px; height:120px; border-radius:50%; background:#10b981; display:flex; align-items:center; justify-content:center; font-size:60px; color:#fff; box-shadow:0 12px 30px rgba(16,185,129,0.5); }
    .title { font-size:24px; font-weight:800; color:#fff; margin-top:16px; }
  </style>
</head>
<body>
  <div class="stage">
    <div class="badge" id="b">✔</div>
    <div class="title" id="t">TRANSACTION VERIFIED</div>
  </div>
  <script>
    window.__renderTick = function(frame) {
      const p = (frame % 180) / 180;
      const s = 0.9 + 0.15 * Math.sin(p * Math.PI * 2);
      document.getElementById('b').style.transform = 'scale(' + s + ')';
    };
  <\/script>
</body>
</html>`
  };

  function showToast(text) {
    toastMessage.textContent = text;
    toastMessage.classList.add('show');
    setTimeout(() => toastMessage.classList.remove('show'), 2200);
  }

  function loadCodeIntoPreview(html) {
    if (!html || !html.trim()) return;
    currentHtml = html;
    codeEditorInput.value = html;

    // Detect total frames from metadata or fallback
    const frameMatch = html.match(/"total_frames"\s*:\s*(\d+)/i) || html.match(/"frames"\s*:\s*(\d+)/i);
    currentTotalFrames = frameMatch ? parseInt(frameMatch[1], 10) : 180;

    frameSlider.max = Math.max(1, currentTotalFrames - 1);
    frameSlider.value = 0;
    frameSlider.disabled = false;
    btnRestart.disabled = false;
    btnPlayPause.disabled = false;
    currentFrame = 0;
    timecodeText.textContent = `0 / ${currentTotalFrames} F`;

    // Inject Virtual Clock & Transparent Style
    const virtualHarness = `
      <script>
        (function() {
          let __time = 0;
          let __rafs = new Map();
          let __c = 0;
          performance.now = () => __time;
          Date.now = () => Math.round(__time);
          window.requestAnimationFrame = (cb) => { const id = ++__c; __rafs.set(id, cb); return id; };
          window.cancelAnimationFrame = (id) => { __rafs.delete(id); };
          const origTick = window.__renderTick;
          window.__renderTick = (frame, fps = 60) => {
            __time = (frame / fps) * 1000;
            const cbs = Array.from(__rafs.values());
            __rafs.clear();
            for (const cb of cbs) { try { cb(__time); } catch(e){} }
            if (typeof origTick === 'function') { try { origTick(frame, fps); } catch(e){} }
          };
          const style = document.createElement('style');
          style.innerHTML = 'html, body { background: transparent !important; margin: 0; padding: 0; overflow: hidden; }';
          document.head.appendChild(style);
        })();
      <\/script>
    `;

    let injected = html;
    if (injected.includes('<head>')) {
      injected = injected.replace('<head>', `<head>${virtualHarness}`);
    } else {
      injected = `${virtualHarness}${injected}`;
    }

    emptyNotice.style.display = 'none';
    previewFrame.style.display = 'block';
    previewFrame.srcdoc = injected;

    previewFrame.onload = () => {
      seekToFrame(0);
    };
  }

  function seekToFrame(frameIndex) {
    currentFrame = Math.max(0, Math.min(frameIndex, currentTotalFrames - 1));
    frameSlider.value = currentFrame;
    timecodeText.textContent = `${currentFrame} / ${currentTotalFrames} F`;

    if (previewFrame.contentWindow && typeof previewFrame.contentWindow.__renderTick === 'function') {
      try {
        previewFrame.contentWindow.__renderTick(currentFrame, fps);
      } catch (err) {}
    }
  }

  function togglePlay() {
    if (isPlaying) {
      isPlaying = false;
      btnPlayPause.textContent = '▶';
      if (playInterval) clearInterval(playInterval);
      playInterval = null;
    } else {
      isPlaying = true;
      btnPlayPause.textContent = '⏸';
      playInterval = setInterval(() => {
        let next = currentFrame + 1;
        if (next >= currentTotalFrames) next = 0;
        seekToFrame(next);
      }, 1000 / fps);
    }
  }

  // Alpha Switcher
  document.querySelectorAll('.alpha-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.alpha-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      viewportBox.className = `viewport-box ${btn.dataset.bg}`;
    });
  });

  // Scrubber & Controls
  frameSlider.addEventListener('input', (e) => {
    if (isPlaying) togglePlay();
    seekToFrame(parseInt(e.target.value, 10));
  });

  btnRestart.addEventListener('click', () => {
    if (isPlaying) togglePlay();
    seekToFrame(0);
  });

  btnPlayPause.addEventListener('click', togglePlay);

  // Preset Selection
  selectPreset.addEventListener('change', () => {
    const val = selectPreset.value;
    if (val && presets[val]) {
      loadCodeIntoPreview(presets[val]);
      showToast(`Loaded ${val} preset!`);
    }
  });

  // Drawer Toggle
  btnToggleEditor.addEventListener('click', () => {
    codeDrawer.style.display = codeDrawer.style.display === 'none' ? 'flex' : 'none';
  });

  btnCloseDrawer.addEventListener('click', () => {
    codeDrawer.style.display = 'none';
  });

  btnRenderCode.addEventListener('click', () => {
    const val = codeEditorInput.value;
    if (val && val.trim()) {
      loadCodeIntoPreview(val);
      codeDrawer.style.display = 'none';
      showToast('Code successfully rendered!');
    }
  });

  // Inspect Active Tab
  btnInspectTab.addEventListener('click', async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) {
          showToast('No active tab found.');
          return;
        }

        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.documentElement.outerHTML
        });

        if (results && results[0] && results[0].result) {
          loadCodeIntoPreview(results[0].result);
          showToast('Inspected HTML from active tab!');
          return;
        }
      }
    } catch (err) {
      console.warn('Inspect tab failed:', err);
    }
    // Fallback if not inside extension context or restricted page:
    loadCodeIntoPreview(presets['kinetic-typography']);
    showToast('Loaded active demo preview!');
  });

  // Download .HTML File
  btnDownloadHtml.addEventListener('click', () => {
    if (!currentHtml) {
      showToast('Belum ada kode untuk didownload!');
      return;
    }
    const blob = new Blob([currentHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const filename = `nara_animation_${Date.now()}.html`;

    if (typeof chrome !== 'undefined' && chrome.downloads) {
      chrome.downloads.download({ url, filename, saveAs: true });
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    }
    showToast('File HTML berhasil didownload!');
  });

  // Copy Code to Clipboard
  btnCopyCode.addEventListener('click', () => {
    if (!currentHtml) {
      showToast('Belum ada kode untuk di-copy!');
      return;
    }
    navigator.clipboard.writeText(currentHtml).then(() => {
      showToast('Kode berhasil di-copy ke clipboard!');
    });
  });

  // Auto-load Kinetic Typography as default demo on launch
  loadCodeIntoPreview(presets['kinetic-typography']);
});
