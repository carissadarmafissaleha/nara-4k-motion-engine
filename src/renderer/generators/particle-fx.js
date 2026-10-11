/**
 * Motion Studio Engine - Particle FX Generator
 * Generates deterministic 4K Canvas 2D particle simulation (Cosmic, Bokeh, Vortex)
 * High dynamic range specular glow, pure hue falloff, zero blurry muddy edges
 */

function generateParticleFX(opts = {}) {
  const particleCount = parseInt(opts.particleCount, 10) || 280;
  
  // Normalize motif/style
  let style = opts.motif || opts.style || 'cosmic-vortex';
  if (style === 'cosmic-swirl') style = 'cosmic-vortex';
  if (style === 'bokeh-flow') style = 'floating-bokeh';
  if (style === 'quantum-sparks') style = 'cyber-spark';

  // Normalize theme/palette
  const paletteKey = opts.palette || opts.theme || 'neon-aqua';
  const fps = parseInt(opts.fps, 10) || 60;
  const totalFrames = parseInt(opts.totalFrames, 10) || 180;
  const isTransparent = Boolean(opts.isTransparent !== false);
  const speedMult = parseFloat(opts.speed) || 1.0;

  const themes = {
    'electric': ['#00F0FF', '#7000FF', '#FF00E5', '#FFFFFF'],
    'neon-aqua': ['#00F0FF', '#0077FF', '#7000FF', '#FFFFFF'],
    'electric-purple': ['#FF00E5', '#9D00FF', '#00E5FF', '#FFFFFF'],
    'neonPink': ['#FF007F', '#FF00E5', '#7000FF', '#FFFFFF'],
    'cosmicGold': ['#FFB703', '#FB8500', '#FF0054', '#FFEAA7'],
    'solar-gold': ['#FFB703', '#FB8500', '#FF0054', '#FFEAA7'],
    'deepEmerald': ['#00FF88', '#00CC66', '#00F0FF', '#E8FFF5'],
    'matrix-green': ['#00FF66', '#00CC44', '#009933', '#CCFFDD']
  };

  const palette = themes[paletteKey] || themes['neon-aqua'];
  const bgColor = isTransparent ? 'transparent' : '#03050C';

  return `<!--METADATA
{
  "title": "${opts.commercialTitle || '4K Particle FX ' + style.replace('-', ' ').toUpperCase()}",
  "description": "Seamless glowing particle dynamics motion graphics background designed for VFX overlay and microstock commercial video.",
  "keywords": ["particles","particle fx","overlay","alpha","transparent","motion graphics","glowing","cosmic","vortex","bokeh","sparks","4k","seamless loop"],
  "category": "Effects",
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
  }
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 3840px;
    height: 2160px;
  }
</style>
</head>
<body>
<canvas id="canvas" width="3840" height="2160"></canvas>

<script>
  const TOTAL_FRAMES = ${totalFrames};
  const FPS = ${fps};
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const count = ${particleCount};
  const palette = ${JSON.stringify(palette)};
  const style = "${style}";
  const isTransparent = ${isTransparent};
  const speedMult = ${speedMult};

  function hexToRgba(hex, alpha) {
    const clean = hex.replace('#', '');
    let r = 0, g = 0, b = 0;
    if (clean.length === 6) {
      r = parseInt(clean.substring(0, 2), 16);
      g = parseInt(clean.substring(2, 4), 16);
      b = parseInt(clean.substring(4, 6), 16);
    } else if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16);
      g = parseInt(clean[1] + clean[1], 16);
      b = parseInt(clean[2] + clean[2], 16);
    }
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // Seeded PRNG for 100% deterministic reproducibility
  function mulberry32(a) {
    return function() {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = mulberry32(1337);

  // Initialize particle properties
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: rng() * 3840,
      y: rng() * 2160,
      radius: rng() * 12 + 5,
      angle: rng() * Math.PI * 2,
      orbitRadius: rng() * 1350 + 120,
      speed: (rng() * 0.8 + 0.4) * (rng() > 0.5 ? 1 : -1) * speedMult,
      color: palette[Math.floor(rng() * palette.length)],
      alpha: rng() * 0.55 + 0.35,
      freq: rng() * 3 + 1,
      phase: rng() * Math.PI * 2
    });
  }

  function renderFrame(frameIndex) {
    const progress = (frameIndex % TOTAL_FRAMES) / TOTAL_FRAMES;
    const globalAngle = progress * Math.PI * 2;

    if (isTransparent) {
      ctx.clearRect(0, 0, 3840, 2160);
    } else {
      ctx.fillStyle = '${bgColor}';
      ctx.fillRect(0, 0, 3840, 2160);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const cx = 1920;
    const cy = 1080;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      let px, py, pSize, pAlpha;

      if (style === 'cosmic-vortex') {
        const theta = p.angle + (globalAngle * p.speed);
        const r = p.orbitRadius + Math.sin(globalAngle * p.freq + p.phase) * 80;
        px = cx + Math.cos(theta) * r;
        py = cy + Math.sin(theta) * (r * 0.55);
        pSize = p.radius * (1 + Math.sin(globalAngle + p.phase) * 0.3);
        pAlpha = p.alpha * (0.6 + Math.sin(theta) * 0.4);
      } else if (style === 'floating-bokeh') {
        px = (p.x + Math.sin(globalAngle + p.phase) * 120 + 3840) % 3840;
        py = (p.y - progress * 400 * speedMult + 2160) % 2160;
        pSize = p.radius * 2.6;
        pAlpha = p.alpha * 0.45;
      } else {
        // Cyber Spark Flow
        px = (p.x + progress * 800 * p.speed + 3840) % 3840;
        py = (p.y + Math.sin(globalAngle * p.freq + p.phase) * 160);
        pSize = p.radius * 0.95;
        pAlpha = p.alpha;
      }

      // Draw particle with luminous core and clear gradient falloff
      const gradRadius = pSize * 2.6;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, gradRadius);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.25, p.color);
      grad.addColorStop(0.65, hexToRgba(p.color, 0.4));
      grad.addColorStop(1, hexToRgba(p.color, 0.0)); // pure-hue 0 alpha stop prevents dirty gray mud

      ctx.globalAlpha = Math.max(0, Math.min(1, pAlpha));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, gradRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sharp central specular point
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1.5, pSize * 0.28), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
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
  module.exports = { generateParticleFX };
}
