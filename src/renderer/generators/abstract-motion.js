/**
 * Motion Studio Engine - Abstract Motion Generator
 * Generates deterministic 4K Hypnotic fluid iridescent wave motion graphics
 * Ultra-high clarity, crystal-clear gradient ramps, zero murky banding
 */

function generateAbstractMotion(opts = {}) {
  const motif = opts.motif || 'fluid-ribbons'; // fluid-ribbons, neon-waves, chromatic-drift
  const paletteKey = opts.palette || opts.theme || 'iridescent';
  const fps = parseInt(opts.fps, 10) || 60;
  const totalFrames = parseInt(opts.totalFrames, 10) || 180;
  const isTransparent = Boolean(opts.isTransparent);
  const layers = Math.min(8, Math.max(3, parseInt(opts.waveCount || opts.waveComplexity, 10) || 5));
  const speedMult = parseFloat(opts.speed) || 1.0;

  const themes = {
    'iridescent': {
      name: 'Iridescent Holographic',
      colors: ['#00F0FF', '#7928CA', '#FF0080', '#00DFD8', '#4338CA'],
      bg: '#04030A'
    },
    'iridescent-aurora': {
      name: 'Iridescent Aurora',
      colors: ['#00F0FF', '#7928CA', '#FF0080', '#00DFD8', '#4338CA'],
      bg: '#04030A'
    },
    'sunsetVapor': {
      name: 'Sunset Vaporwave',
      colors: ['#FF1361', '#FFF800', '#FF007A', '#7928CA', '#FF5E3A'],
      bg: '#0A030C'
    },
    'sunset-blaze': {
      name: 'Sunset Blaze',
      colors: ['#FF0055', '#FF5500', '#FFAA00', '#FF00AA', '#FF2A6D'],
      bg: '#0D0407'
    },
    'darkNebula': {
      name: 'Dark Space Nebula',
      colors: ['#00D2FF', '#3A7BD5', '#8E2DE2', '#4A00E0', '#FF007F'],
      bg: '#03020A'
    },
    'oceanBreeze': {
      name: 'Ocean Breeze Turquoise',
      colors: ['#00F2FE', '#4FACFE', '#00C6FF', '#0072FF', '#00E5FF'],
      bg: '#010814'
    },
    'velvetViolet': {
      name: 'Velvet Ultraviolet',
      colors: ['#9D00FF', '#4900E6', '#FF0099', '#00E5FF', '#7928CA'],
      bg: '#06020E'
    },
    'velvet-violet': {
      name: 'Velvet Violet',
      colors: ['#9D00FF', '#4900E6', '#FF0099', '#00E5FF', '#7928CA'],
      bg: '#06020E'
    }
  };

  const selectedTheme = themes[paletteKey] || themes['iridescent'];
  const palette = selectedTheme.colors;
  const bgColor = isTransparent ? 'transparent' : selectedTheme.bg;

  return `<!--METADATA
{
  "title": "${opts.commercialTitle || 'Abstract Motion ' + selectedTheme.name}",
  "description": "Ultra HD 4K crystalline iridescent fluid wave motion graphics background with razor-sharp specular contour edges.",
  "keywords": ["abstract","abstract motion","fluid","waves","iridescent","gradient","organic","hypnotic","flowing","motion graphics","4k","seamless loop"],
  "category": "Motion Graphics & Backgrounds",
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
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: ${bgColor};
    display: flex;
    justify-content: center;
    align-items: center;
  }
  canvas {
    display: block;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    margin: auto;
    image-rendering: auto;
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
  const colors = ${JSON.stringify(palette)};
  const isTransparent = ${isTransparent};
  const layers = ${layers};
  const motif = "${motif}";
  const speedMult = ${speedMult};

  // Convert hex color to rgba string for pure-hue transparency transitions (avoids dirty gray banding)
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

  function renderFrame(frameIndex) {
    const progress = (frameIndex % TOTAL_FRAMES) / TOTAL_FRAMES;
    const angle = progress * Math.PI * 2 * speedMult;

    if (isTransparent) {
      ctx.clearRect(0, 0, 3840, 2160);
    } else {
      ctx.fillStyle = '${bgColor}';
      ctx.fillRect(0, 0, 3840, 2160);

      // Subtle ambient background radiance for non-transparent backgrounds
      const ambientGrad = ctx.createRadialGradient(1920, 1080, 200, 1920, 1080, 2400);
      ambientGrad.addColorStop(0, hexToRgba(colors[0], 0.14));
      ambientGrad.addColorStop(0.5, hexToRgba(colors[1 % colors.length], 0.08));
      ambientGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, 3840, 2160);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Step resolution for ultra-high-definition smooth curves across 3840 pixels
    const step = 8;
    const pointsCount = Math.ceil(4040 / step);

    for (let layer = 0; layer < layers; layer++) {
      const col = colors[layer % colors.length];
      const nextCol = colors[(layer + 1) % colors.length];
      const thirdCol = colors[(layer + 2) % colors.length];
      const phaseOffset = layer * (Math.PI * 2 / layers);
      
      let baseY;
      if (motif === 'neon-waves') {
        baseY = 1080 + Math.sin(angle + layer) * 220;
      } else if (motif === 'chromatic-drift') {
        baseY = 960 + Math.sin(angle * 0.8 + layer * 1.2) * 280;
      } else {
        // fluid-ribbons
        baseY = 1120 + Math.sin(angle + layer * 0.9) * 240;
      }

      // 1. Calculate wave points with harmonic oscillation
      const pts = [];
      for (let x = -100; x <= 3940; x += step) {
        const nx = x * 0.0016;
        let waveY;

        if (motif === 'neon-waves') {
          const w1 = Math.sin(nx * 2.4 + angle + phaseOffset) * 200;
          const w2 = Math.cos(nx * 4.2 - angle * 1.5 + layer) * 120;
          const w3 = Math.sin(nx * 7.0 + angle * 2.0) * 50;
          waveY = baseY + w1 + w2 + w3;
        } else if (motif === 'chromatic-drift') {
          const w1 = Math.sin(nx * 1.8 + angle + phaseOffset) * 260;
          const w2 = Math.cos(nx * 3.2 - angle + layer * 0.8) * 150;
          const w3 = Math.sin(nx * 5.5 + angle * 1.2 + layer) * 70;
          waveY = baseY + w1 + w2 + w3;
        } else {
          // fluid-ribbons
          const w1 = Math.sin(nx * 2.0 + angle + phaseOffset) * 240;
          const w2 = Math.cos(nx * 3.6 - angle * 1.3 + layer) * 140;
          const w3 = Math.sin(nx * 6.0 + angle * 2.2) * 60;
          waveY = baseY + w1 + w2 + w3;
        }

        pts.push({ x, y: waveY });
      }

      // 2. Fill wave with multi-stop crystal-clear gradient
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.lineTo(3940, 2260);
      ctx.lineTo(-100, 2260);
      ctx.closePath();

      // Rich multi-stop gradient without muddy black dropoff
      const grad = ctx.createLinearGradient(0, baseY - 350, 3840, baseY + 750);
      grad.addColorStop(0, hexToRgba(col, 0.75));
      grad.addColorStop(0.35, hexToRgba(nextCol, 0.60));
      grad.addColorStop(0.70, hexToRgba(thirdCol, 0.35));
      grad.addColorStop(1, hexToRgba(col, 0.0)); // fades to its own hue at alpha 0, avoiding gray mud

      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.85;
      ctx.fill();

      // 3. Draw Crystalline Specular Crest Highlight (Razor-sharp clarity, zero blurry smear)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }

      // Luminous chromatic glow line
      ctx.strokeStyle = hexToRgba(col, 0.95);
      ctx.lineWidth = 3.5;
      ctx.shadowColor = col;
      ctx.shadowBlur = 14;
      ctx.stroke();

      // Ultra-crisp specular apex core (pure white high-frequency highlight)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 0;
      ctx.stroke();
      ctx.restore();
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

if (typeof window !== 'undefined') {
  window.generateAbstractMotion = generateAbstractMotion;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateAbstractMotion };
}
