/**
 * Motion Studio Engine - Data Visualization Generator
 * Generates deterministic 4K HUD & FinTech Dashboard motion graphics
 * Ultra-sharp gradient telemetry, crisp gauge displays
 */

function generateDataVisualization(opts = {}) {
  const chartType = opts.motif || opts.chartType || 'fintech-hud';
  let themeKey = opts.palette || opts.theme || 'cyber-cyan';
  if (themeKey === 'emerald') themeKey = 'emerald-fintech';
  if (themeKey === 'cyan') themeKey = 'cyber-cyan';
  if (themeKey === 'neonOrange') themeKey = 'solar-amber';
  if (themeKey === 'deepBlue') themeKey = 'deep-royal';

  const fps = parseInt(opts.fps, 10) || 60;
  const totalFrames = parseInt(opts.totalFrames, 10) || 180;
  const isTransparent = Boolean(opts.isTransparent);
  const metricLabel = (opts.headline || opts.metricLabel || 'GLOBAL TRANSACTIONS').toUpperCase();
  const metricValueText = opts.value || '+98.4%';

  const themes = {
    'cyber-cyan': { primary: '#00F0FF', secondary: '#7000FF', accent: '#FFFFFF', grid: 'rgba(0,240,255,0.15)', bg: '#040714' },
    'emerald-fintech': { primary: '#00FF88', secondary: '#0099FF', accent: '#E8FFF5', grid: 'rgba(0,255,136,0.15)', bg: '#02120A' },
    'solar-amber': { primary: '#FFB800', secondary: '#FF3366', accent: '#FFFDF0', grid: 'rgba(255,184,0,0.15)', bg: '#120A02' },
    'deep-royal': { primary: '#38BDF8', secondary: '#818CF8', accent: '#F8FAFC', grid: 'rgba(56,189,248,0.15)', bg: '#0B0F19' }
  };
  const colors = themes[themeKey] || themes['cyber-cyan'];
  const bgColor = isTransparent ? 'transparent' : colors.bg;

  return `<!--METADATA
{
  "title": "${opts.commercialTitle || 'FinTech Data Visualization ' + chartType.toUpperCase()}",
  "description": "Futuristic HUD telemetry and FinTech animated data analytics dashboard for microstock video.",
  "keywords": ["data visualization","hud","infographic","analytics","finance","fintech","dashboard","charts","graphs","futuristic","technology","4k","seamless loop"],
  "category": "Technology",
  "fps": ${fps},
  "total_frames": ${totalFrames},
  "loop": true,
  "width": 3840,
  "height": 2160
}
METADATA-->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body, html {
    width: 3840px;
    height: 2160px;
    overflow: hidden;
    background-color: ${bgColor};
    font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
  }
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 3840px;
    height: 2160px;
  }
  #overlay {
    position: absolute;
    top: 180px;
    left: 200px;
    color: ${colors.accent};
    z-index: 10;
  }
  .tag {
    font-size: 32px;
    letter-spacing: 12px;
    color: ${colors.primary};
    font-weight: 700;
  }
  .main-val {
    font-size: 130px;
    font-weight: 900;
    letter-spacing: 8px;
    text-shadow: 0 0 25px ${colors.primary};
  }
</style>
</head>
<body>
<div id="overlay">
  <div class="tag">${metricLabel}</div>
  <div class="main-val" id="metricVal">${metricValueText}</div>
</div>
<canvas id="canvas" width="3840" height="2160"></canvas>

<script>
  const TOTAL_FRAMES = ${totalFrames};
  const FPS = ${fps};
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const colors = ${JSON.stringify(colors)};
  const isTransparent = ${isTransparent};
  const metricValEl = document.getElementById('metricVal');
  const chartType = "${chartType}";
  const baseValueText = "${metricValueText}";

  const barCount = 18;
  const bars = [];
  for (let i = 0; i < barCount; i++) {
    bars.push({
      heightBase: 240 + ((i * 19) % 360),
      phase: i * 0.35,
      speed: 1.0 + (i % 3) * 0.3
    });
  }

  function renderFrame(frameIndex) {
    const progress = (frameIndex % TOTAL_FRAMES) / TOTAL_FRAMES;
    const angle = progress * Math.PI * 2;

    if (isTransparent) {
      ctx.clearRect(0, 0, 3840, 2160);
    } else {
      ctx.fillStyle = '${bgColor}';
      ctx.fillRect(0, 0, 3840, 2160);
    }

    // Dynamic numeric counter if percentage, otherwise breathing pulse
    if (baseValueText.includes('%')) {
      const pct = (85.2 + Math.sin(angle) * 14.6).toFixed(1);
      metricValEl.textContent = '+' + pct + '%';
    }

    // 1. Draw Radial Gauge
    if (chartType === 'fintech-hud' || chartType === 'radial-gauge') {
      const rcx = 2800;
      const rcy = 1080;
      const rad = 500;

      ctx.save();
      ctx.lineWidth = 36;
      ctx.lineCap = 'round';

      // Background track
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      ctx.arc(rcx, rcy, rad, 0, Math.PI * 2);
      ctx.stroke();

      // Active illuminated arc with crystal gradient
      const startA = -Math.PI / 2;
      const endA = startA + (Math.PI * 1.5) * (0.55 + Math.sin(angle) * 0.35);
      const gradArc = ctx.createLinearGradient(rcx - rad, rcy, rcx + rad, rcy);
      gradArc.addColorStop(0, colors.secondary);
      gradArc.addColorStop(1, colors.primary);

      ctx.strokeStyle = gradArc;
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(rcx, rcy, rad, startA, endA);
      ctx.stroke();

      // Inner Concentric Pulse
      ctx.lineWidth = 6;
      ctx.strokeStyle = colors.primary;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(rcx, rcy, rad - 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Bar Chart Race / Analytics
    if (chartType === 'fintech-hud' || chartType === 'telemetry-bars') {
      const bx = 300;
      const by = 1800;
      const barW = 75;
      const gap = 35;

      ctx.save();
      for (let i = 0; i < barCount; i++) {
        const b = bars[i];
        const h = b.heightBase + Math.sin(angle * b.speed + b.phase) * 220;
        const x = bx + i * (barW + gap);
        const y = by - h;

        const gradBar = ctx.createLinearGradient(x, by, x, y);
        gradBar.addColorStop(0, colors.secondary);
        gradBar.addColorStop(1, colors.primary);

        ctx.fillStyle = gradBar;
        ctx.fillRect(x, y, barW, h);

        // Top glowing cap highlight
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 14;
        ctx.fillRect(x, y - 4, barW, 6);
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }
  }

  window.__renderTick = function(frameIndex) {
    renderFrame(frameIndex);
  };

  let currentFrame = 0;
  function animate() {
    renderFrame(currentFrame);
    currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
</script>
</body>
</html>`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateDataVisualization };
}
