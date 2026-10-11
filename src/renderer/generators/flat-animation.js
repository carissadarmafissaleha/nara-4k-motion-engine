/**
 * Motion Studio Engine - Flat Animation Generator
 * Generates deterministic 4K clean corporate explainer vector motion graphics
 */

function generateFlatAnimation(opts = {}) {
  let motif = opts.motif || 'success-badge';
  if (motif === 'badge-check') motif = 'success-badge';
  
  let theme = opts.palette || opts.theme || 'tech-blue';
  if (theme === 'vibrant') theme = 'vibrant-green';
  if (theme === 'corporateBlue') theme = 'tech-blue';
  if (theme === 'freshMint') theme = 'vibrant-green';
  if (theme === 'coralWarm') theme = 'startup-orange';

  const fps = parseInt(opts.fps, 10) || 60;
  const totalFrames = parseInt(opts.totalFrames, 10) || 180;
  const isTransparent = Boolean(opts.isTransparent !== false);
  const label = opts.title || opts.label || (motif === 'success-badge' ? 'PAYMENT VERIFIED' : 'SEARCHING DATA...');

  const themes = {
    'tech-blue': { primary: '#2563EB', secondary: '#38BDF8', accent: '#FFFFFF', bg: '#0F172A' },
    'vibrant-green': { primary: '#10B981', secondary: '#34D399', accent: '#FFFFFF', bg: '#064E3B' },
    'startup-orange': { primary: '#F97316', secondary: '#FBBF24', accent: '#FFFFFF', bg: '#431407' }
  };
  const colors = themes[theme] || themes['tech-blue'];
  const bgColor = isTransparent ? 'transparent' : colors.bg;

  return `<!--METADATA
{
  "title": "${opts.commercialTitle || 'Flat Animation ' + motif.replace('-', ' ').toUpperCase()}",
  "description": "Clean flat design vector motion graphics animation for corporate video, explainer, and UI presentation.",
  "keywords": ["flat animation","vector","explainer","ui","icon animation","corporate","presentation","alpha","transparent","4k","seamless loop"],
  "category": "Illustrations",
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
  }
  svg {
    width: 800px;
    height: 800px;
    overflow: visible;
  }
  .label-text {
    font-size: 54px;
    font-weight: 800;
    letter-spacing: 12px;
    color: ${colors.accent};
    margin-top: 60px;
    text-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
</style>
</head>
<body>
<div id="stage">
  <svg viewBox="0 0 400 400" id="mainSvg">
    <!-- Outer Ripple Circle -->
    <circle id="ripple" cx="200" cy="200" r="140" fill="none" stroke="${colors.secondary}" stroke-width="8" opacity="0" />
    
    <!-- Main Disc -->
    <circle id="disc" cx="200" cy="200" r="120" fill="${colors.primary}" />
    
    <!-- Checkmark Icon -->
    <path id="check" d="M 140 205 L 180 245 L 265 160" fill="none" stroke="${colors.accent}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Exploding Confetti Particles -->
    <g id="confettiGroup"></g>
  </svg>
  <div class="label-text" id="labelEl">${label}</div>
</div>

<script>
  const TOTAL_FRAMES = ${totalFrames};
  const FPS = ${fps};
  const disc = document.getElementById('disc');
  const check = document.getElementById('check');
  const ripple = document.getElementById('ripple');
  const confettiGroup = document.getElementById('confettiGroup');

  // Generate 12 confetti dots
  const confetti = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '8');
    dot.setAttribute('fill', '${colors.secondary}');
    confettiGroup.appendChild(dot);
    confetti.push({ el: dot, angle: angle });
  }

  const checkLen = check.getTotalLength();
  check.style.strokeDasharray = checkLen;

  function renderFrame(frameIndex) {
    const progress = (frameIndex % TOTAL_FRAMES) / TOTAL_FRAMES; // 0.0 to 1.0

    // Cycle breakdown:
    // 0.0 - 0.25: Disc Pop & Scale In
    // 0.25 - 0.55: Checkmark Draw & Confetti Burst
    // 0.55 - 0.85: Rest / Hold
    // 0.85 - 1.00: Smooth Shrink / Transition

    let discScale = 1.0;
    let checkProgress = 1.0;
    let rippleRad = 120;
    let rippleOp = 0;
    let confettiDist = 0;
    let confettiOp = 0;

    if (progress < 0.25) {
      const p = progress / 0.25;
      discScale = Math.sin(p * Math.PI * 0.5) * 1.15;
      checkProgress = 0;
    } else if (progress < 0.60) {
      const p = (progress - 0.25) / 0.35;
      discScale = 1.0 + Math.sin(p * Math.PI) * 0.08;
      checkProgress = Math.min(1.0, p * 1.3);

      rippleRad = 120 + p * 80;
      rippleOp = Math.max(0, 1 - p);

      confettiDist = p * 90;
      confettiOp = Math.max(0, 1 - p * 1.2);
    } else if (progress < 0.85) {
      discScale = 1.0;
      checkProgress = 1.0;
      rippleOp = 0;
      confettiOp = 0;
    } else {
      const p = (progress - 0.85) / 0.15;
      discScale = 1.0 - Math.sin(p * Math.PI * 0.5);
      checkProgress = 1.0 - p;
      rippleOp = 0;
      confettiOp = 0;
    }

    disc.setAttribute('transform', 'translate(200, 200) scale(' + discScale + ') translate(-200, -200)');
    check.style.strokeDashoffset = checkLen * (1 - checkProgress);

    ripple.setAttribute('r', rippleRad);
    ripple.style.opacity = rippleOp;

    confetti.forEach(c => {
      const cx = 200 + Math.cos(c.angle) * (140 + confettiDist);
      const cy = 200 + Math.sin(c.angle) * (140 + confettiDist);
      c.el.setAttribute('cx', cx);
      c.el.setAttribute('cy', cy);
      c.el.style.opacity = confettiOp;
    });
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
  window.generateFlatAnimation = generateFlatAnimation;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateFlatAnimation };
}
