/**
 * Motion Studio Engine - Kinetic Typography Generator
 * Generates self-contained 4K deterministic kinetic typography animation
 * High-definition gradient title reveal, specular neon telemetry
 */

function generateKineticTypography(opts = {}) {
  const title = (opts.text || opts.title || 'FUTURE OF MOTION').toUpperCase();
  const subtitle = (opts.subtitle || 'NEXT GENERATION CREATIVE ENGINE').toUpperCase();
  const tag = (opts.tag || '4K COMMERCIAL ASSET • SEAMLESS LOOP').toUpperCase();
  
  // Map palette
  let themeKey = opts.palette || opts.theme || 'cyber-cyan';
  if (themeKey === 'neonCyan') themeKey = 'cyber-cyan';
  if (themeKey === 'magma') themeKey = 'gold-amber';
  if (themeKey === 'electricPurple') themeKey = 'neon-magenta';
  if (themeKey === 'matrixGreen') themeKey = 'matrix-lime';

  const fps = parseInt(opts.fps, 10) || 60;
  const totalFrames = parseInt(opts.totalFrames, 10) || 180;
  const isTransparent = Boolean(opts.isTransparent);
  const layout = opts.motif || opts.layout || 'center-bold';

  // Color schemes
  const themes = {
    'cyber-cyan': { primary: '#00F0FF', secondary: '#7000FF', accent: '#FFFFFF', bg: '#060814' },
    'neon-magenta': { primary: '#FF007F', secondary: '#00F0FF', accent: '#FFF0F5', bg: '#0D0414' },
    'gold-amber': { primary: '#FFB800', secondary: '#FF4800', accent: '#FFFDF0', bg: '#100B02' },
    'matrix-lime': { primary: '#00FF66', secondary: '#0066FF', accent: '#E8FFF0', bg: '#020F06' }
  };
  const colors = themes[themeKey] || themes['cyber-cyan'];
  const bgColor = isTransparent ? 'transparent' : colors.bg;

  return `<!--METADATA
{
  "title": "${opts.commercialTitle || 'Kinetic Typography ' + title}",
  "description": "Bold futuristic kinetic typography animation with glowing light trace and telemetry frame designed for commercial broadcast.",
  "keywords": ["kinetic typography","typography","animated text","title reveal","cyberpunk","neon","motion graphics","broadcast","commercial","4k","seamless loop","promo"],
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
    width: 3840px;
    height: 2160px;
    overflow: hidden;
    background-color: ${bgColor};
    font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
  }
  #stage {
    position: relative;
    width: 3840px;
    height: 2160px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    perspective: 2000px;
  }
  .hud-border {
    position: absolute;
    width: 3600px;
    height: 1960px;
    border: 3px solid rgba(255, 255, 255, 0.08);
    pointer-events: none;
  }
  .hud-corner {
    position: absolute;
    width: 60px;
    height: 60px;
    border: 6px solid ${colors.primary};
  }
  .top-left { top: -3px; left: -3px; border-right: none; border-bottom: none; }
  .top-right { top: -3px; right: -3px; border-left: none; border-bottom: none; }
  .bottom-left { bottom: -3px; left: -3px; border-right: none; border-top: none; }
  .bottom-right { bottom: -3px; right: -3px; border-left: none; border-top: none; }

  .telemetry-tag {
    font-size: 32px;
    letter-spacing: 12px;
    color: ${colors.primary};
    font-weight: 700;
    margin-bottom: 40px;
    opacity: 0.9;
    text-shadow: 0 0 16px ${colors.primary};
  }
  .hero-title {
    font-size: 190px;
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: 18px;
    text-align: center;
    color: #FFFFFF;
    background: linear-gradient(135deg, #FFFFFF 10%, ${colors.primary} 60%, ${colors.secondary} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 25px ${colors.primary}) drop-shadow(0 0 50px ${colors.secondary});
    will-change: transform, opacity;
  }
  .subtitle {
    font-size: 52px;
    font-weight: 600;
    letter-spacing: 24px;
    color: ${colors.secondary};
    margin-top: 50px;
    text-shadow: 0 0 20px ${colors.secondary};
  }
  .tech-line {
    width: 1400px;
    height: 6px;
    background: linear-gradient(90deg, rgba(0,0,0,0), ${colors.primary}, ${colors.secondary}, rgba(0,0,0,0));
    margin: 36px 0;
    box-shadow: 0 0 16px ${colors.primary};
  }
  .letter-span {
    display: inline-block;
    will-change: transform, opacity, filter;
  }
</style>
</head>
<body>
<div id="stage">
  <div class="hud-border">
    <div class="hud-corner top-left"></div>
    <div class="hud-corner top-right"></div>
    <div class="hud-corner bottom-left"></div>
    <div class="hud-corner bottom-right"></div>
  </div>

  <div class="telemetry-tag">${tag}</div>
  <div class="hero-title" id="heroTitle"></div>
  <div class="tech-line" id="techLine"></div>
  <div class="subtitle" id="subTitle">${subtitle}</div>
</div>

<script>
  const TOTAL_FRAMES = ${totalFrames};
  const FPS = ${fps};
  const titleText = "${title}";
  const heroTitleEl = document.getElementById('heroTitle');
  const techLineEl = document.getElementById('techLine');
  const subTitleEl = document.getElementById('subTitle');

  // Wrap each letter in a span for staggered kinetic reveal
  const letterSpans = [];
  titleText.split('').forEach((char, idx) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\\u00A0' : char;
    span.className = 'letter-span';
    heroTitleEl.appendChild(span);
    letterSpans.push(span);
  });

  function renderFrame(frameIndex) {
    const progress = (frameIndex % TOTAL_FRAMES) / TOTAL_FRAMES;
    const loopAngle = progress * Math.PI * 2;

    // Staggered letter animation (sine-modulated wave)
    letterSpans.forEach((span, i) => {
      const letterPhase = (i / letterSpans.length) * Math.PI * 2;
      const wave = Math.sin(loopAngle + letterPhase);
      const ty = wave * 22; // vertical float
      const rotX = Math.sin(loopAngle * 2 + letterPhase) * 12;
      const scale = 1.0 + Math.cos(loopAngle + letterPhase) * 0.05;
      const opacity = 0.85 + Math.sin(loopAngle + letterPhase) * 0.15;

      span.style.transform = 'translateY(' + ty + 'px) rotateX(' + rotX + 'deg) scale(' + scale + ')';
      span.style.opacity = opacity;
    });

    // Tech line dynamic scan pulse
    const lineWidth = 1200 + Math.sin(loopAngle * 2) * 300;
    const lineOpacity = 0.6 + Math.cos(loopAngle) * 0.35;
    techLineEl.style.width = lineWidth + 'px';
    techLineEl.style.opacity = lineOpacity;

    // Subtitle subtle breathing tracking
    const subScale = 1.0 + Math.sin(loopAngle) * 0.03;
    const subLetterSpacing = 24 + Math.sin(loopAngle) * 4;
    subTitleEl.style.transform = 'scale(' + subScale + ')';
    subTitleEl.style.letterSpacing = subLetterSpacing + 'px';
  }

  // Hook for deterministic renderer
  window.__renderTick = function(frameIndex) {
    renderFrame(frameIndex);
  };

  // Preview interactive loop
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
  window.generateKineticTypography = generateKineticTypography;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateKineticTypography };
}
