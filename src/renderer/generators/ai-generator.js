/**
 * NARA Motion Studio - AI Motion Generator Engine
 * Connects to Google Gemini API & OpenAI API to generate 100% NARA-compliant
 * 4K UHD deterministic HTML5 motion graphics.
 */

(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    PROVIDER: 'nara_ai_provider',
    API_KEY: 'nara_ai_key',
    MODEL: 'nara_ai_model',
    CUSTOM_URL: 'nara_ai_custom_url'
  };

  const DEFAULT_MODELS = {
    gemini: 'gemini-2.5-flash',
    openai: 'gpt-4o-mini'
  };

  /**
   * Helper to get saved config from localStorage
   */
  function getAiConfig() {
    try {
      return {
        provider: localStorage.getItem(STORAGE_KEYS.PROVIDER) || 'gemini',
        apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
        model: localStorage.getItem(STORAGE_KEYS.MODEL) || DEFAULT_MODELS.gemini,
        customUrl: localStorage.getItem(STORAGE_KEYS.CUSTOM_URL) || ''
      };
    } catch (e) {
      return { provider: 'gemini', apiKey: '', model: DEFAULT_MODELS.gemini, customUrl: '' };
    }
  }

  /**
   * Helper to persist config in localStorage
   */
  function saveAiConfig(config) {
    try {
      if (config.provider) localStorage.setItem(STORAGE_KEYS.PROVIDER, config.provider);
      if (config.apiKey !== undefined) localStorage.setItem(STORAGE_KEYS.API_KEY, config.apiKey.trim());
      if (config.model) localStorage.setItem(STORAGE_KEYS.MODEL, config.model);
      if (config.customUrl !== undefined) localStorage.setItem(STORAGE_KEYS.CUSTOM_URL, config.customUrl.trim());
    } catch (e) {
      console.warn('[NARA AI] Failed to save config to localStorage:', e);
    }
  }

  /**
   * Strict system instruction ensuring generated animations match NARA 4K pipeline,
   * Hybrid Online/Offline CDN architecture, Local Folder Assets, and Anti-PPT broadcast aesthetics.
   */
  function buildSystemPrompt() {
    return `You are NARA AI - the Principal Motion Graphics Engineer and Creative Director for NARA 4K Motion Studio Engine (Offline 4K MP4 & Apple ProRes 4444 Alpha Renderer powered by Electron, Headless Chromium, and FFmpeg).
Your sole mission is to synthesize a single, standalone, commercial-grade HTML5 motion graphic file (Canvas 2D, WebGL/Three.js, PixiJS, GSAP, Anime.js, or procedural SVG/CSS) ready for Adobe Stock, Shutterstock, and Envato.

======================================================================
CRITICAL TECHNICAL SPECIFICATIONS (GOLDEN RULES NARA ENGINE)
======================================================================

1. NARA DETERMINISTIC METADATA HEADER (MANDATORY AT LINE 1):
   The document MUST start at line 1 (no leading whitespace) with a valid JSON metadata block:
   <!--METADATA
   {
     "title": "Commercial Asset Title",
     "description": "Detailed professional microstock motion graphic description for SEO",
     "keywords": ["tag1", "tag2", "4k", "motion graphics", "commercial", "broadcast", "loop", "prores"],
     "category": "Motion Graphics & Backgrounds",
     "fps": 60,
     "total_frames": 180,
     "loop": true,
     "width": 3840,
     "height": 2160,
     "hold_last_frames": 0
   }
   METADATA-->

2. HYBRID ONLINE CDN & OFFLINE LOCAL VENDOR FALLBACK (USE ALL WHEN APPROPRIATE):
   NARA's Render Engine features an intelligent Request Interceptor that automatically caches online CDN scripts and serves pre-bundled local vendor libraries (from src/assets/vendor/) with 0ms latency when offline.
   Always include dual-fallback <script> tags so the HTML works online, offline inside NARA, and standalone when double-clicked:
   - GSAP 3.x:
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" onerror="this.onerror=null;this.src='vendor/gsap.min.js';"></script>
   - Three.js (3D WebGL):
     <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" onerror="this.onerror=null;this.src='vendor/three.min.js';"></script>
   - PixiJS (2D WebGL):
     <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js" onerror="this.onerror=null;this.src='vendor/pixi.min.js';"></script>
   - Anime.js:
     <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js" onerror="this.onerror=null;this.src='vendor/anime.min.js';"></script>
   - Canvas-Confetti:
     <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js" onerror="this.onerror=null;this.src='vendor/canvas-confetti.min.js';"></script>

   MANDATORY LOCKSTEP FRAME-SYNC FOR EXTERNAL LIBRARIES:
   Never let GSAP, Anime.js, Three.js, or PixiJS run on free-running internal timers! Lock every library strictly to deterministic time t = frameIndex / FPS:
   - GSAP: Create a paused master timeline: const masterTl = window.gsap ? gsap.timeline({ paused: true }) : null; and inside renderFrame(frameIndex) call: if (masterTl) masterTl.time(frameIndex / FPS);
   - Anime.js: Set autoplay: false on timelines/animations, and inside renderFrame(frameIndex) call: tl.seek((frameIndex / FPS) * 1000);
   - Three.js / PixiJS: Update mesh/sprite transforms purely from t = frameIndex / FPS or loopAngle inside renderFrame(frameIndex), then explicitly call renderer.render(scene, camera).

3. LOCAL FOLDER ASSETS & MULTIMODAL ASSET INTEGRATION:
   NARA scans the HTML file's directory up to 2 subfolder levels (e.g., assets/, images/, fonts/, css/, js/) and waits for all document.images and document.fonts.ready before capturing frame 0.
   - Local Images / Logos / SVGs (e.g., assets/logo.png, assets/hero.webp, assets/icon.svg):
     * Preload local folder images inside a hidden DOM container (<div id="nara-local-assets" style="display:none">) OR via new Image() attached to DOM so NARA's preloader awaits them.
     * Always wrap image drawing with a safe helper (e.g. checking img && img.complete && img.naturalWidth > 0) AND provide a rich procedural Canvas/SVG fallback if a local file is missing during preview.
   - Local Fonts & Web Fonts:
     * Support local @font-face declarations (e.g. url('assets/fonts/CustomFont.woff2')) paired with high-character system/online font fallbacks.
   - Auto Audio Muxing:
     * An audio file with the same base filename (e.g. animation_name.wav or .mp3) in the same folder is automatically muxed by NARA.

4. NARA DETERMINISTIC VIRTUAL CLOCK (MANDATORY):
   NARA's headless rendering engine synchronously captures each frame by invoking:
   window.__renderTick(frameIndex, targetFps);

   You MUST implement:
   function renderFrame(frameIndex) {
     const t = frameIndex / FPS;
     const progress = (frameIndex % TOTAL_FRAMES) / TOTAL_FRAMES;
     const loopAngle = progress * Math.PI * 2;
     // Synchronize GSAP/Anime timelines if used:
     // if (masterTl) masterTl.time(t);
     // Clear canvas and render all layers deterministically from frameIndex / t / loopAngle
   }
   window.__renderTick = function(frameIndex, targetFps) {
     renderFrame(frameIndex);
   };

   Also provide an interactive fallback loop for standard browser preview:
   let previewFrame = 0;
   function animLoop() {
     if (!window.__isNaraHeadless && !window.__IS_HEADLESS_RENDERER__) {
       renderFrame(previewFrame);
       previewFrame = (previewFrame + 1) % TOTAL_FRAMES;
       requestAnimationFrame(animLoop);
     }
   }

5. DETERMINISTIC MATH & SEEDED PRNG (ZERO RANDOM STUTTER):
   - NEVER call unseeded Math.random(), Date.now(), or performance.now() inside renderFrame().
   - Use a deterministic seeded PRNG (such as mulberry32) for particles, stars, bokeh, grain, and procedural textures.
   - For loop: true, all motion MUST be periodic over loopAngle = (frameIndex / TOTAL_FRAMES) * Math.PI * 2 so frame (TOTAL_FRAMES - 1) transitions seamlessly into frame 0.
   - For loop: false (one-shot opener/explainer), animate from frame 0 to (TOTAL_FRAMES - HOLD_FRAMES) and hold the final resolved pose during hold_last_frames.

6. 4K STAGE, DESIGN UNITS & AUTO-FIT VIEWPORT:
   - Native resolution is 3840x2160 (or user-specified width x height) inside #stage-container.
   - Compute proportional design scale U = WIDTH / 1920 so layout coordinates scale cleanly across 4K, 1080p, vertical 9:16, or 1:1.
   - Include autoFitStage() using transform: translate(-50%, -50%) scale(...) on resize and DOMContentLoaded.

======================================================================
BROADCAST CREATIVE LAWS (ANTI-PPT & ANTI-OVERLAP)
======================================================================

1. CINEMATIC VIDEO, NOT A SLIDESHOW (ANTI-PPT):
   - Implement a unified 2.5D/3D camera rig (applyCamera(t): zoom, pan, tilt, push-through) so scenes transition through camera/world motion rather than fading static boxes.
   - Maximum 2 text hierarchy levels per scene (1 primary headline/metric + 1 concise sub-label).

2. MULTI-LAYER LIVING BACKGROUND (>= 3 LAYERS):
   - Layer 1: Dynamic gradient mesh or atmospheric base that shifts with t.
   - Layer 2: Volumetric light blobs, perspective grids, or 3D geometry with depth parallax.
   - Layer 3: Rising ambient dust particles + seeded film grain overlay + vignette + transitional light leaks.
   - When backgroundStyle === 'transparent' (ProRes 4444 Alpha), set body/#stage-container background: transparent and use ctx.clearRect(0, 0, WIDTH, HEIGHT).

3. LIVING TYPOGRAPHY & ANTI-OVERLAP GUARANTEE:
   - Enforce a strict 5% safe-area margin from all canvas edges (192px horizontal, 108px vertical on 4K).
   - Measure all text with ctx.measureText() (auto-fit font size or word-wrap) so text never clips or collides.
   - Sequential text transitions must never overlap in the same zone (outEnd <= inStart).
   - Render text entrance/exit with directional motion blur (ghost trails along velocity vector) and character/word stagger.

OUTPUT FORMAT:
Return ONLY raw, valid HTML code. Do NOT wrap in markdown code fences (\`\`\`html) or include commentary. Start at character 0 with <!--METADATA and end with </html>.`;
  }

  /**
   * User prompt template with specific user options, Hybrid CDN preferences, and Folder/Attached Assets
   */
  function buildUserPrompt(options) {
    const theme = options.theme || 'Futuristic Cyberpunk Holographic HUD with pulsing energy grid';
    const durationSeconds = parseFloat(options.durationSeconds) || 3.0;
    const fps = parseInt(options.fps, 10) || 60;
    const totalFrames = Math.max(30, Math.round(durationSeconds * fps));
    const width = parseInt(options.width, 10) || 3840;
    const height = parseInt(options.height, 10) || 2160;
    const isLoop = options.isLoop !== false;
    const holdLastFrames = isLoop ? 0 : (parseInt(options.holdLastFrames, 10) || Math.round(fps * 1.0));
    const backgroundStyle = options.backgroundStyle || 'dark'; // 'dark', 'transparent', 'light'
    const assets = Array.isArray(options.assets) ? options.assets : [];
    const folderAssets = Array.isArray(options.folderAssets) ? options.folderAssets : [];

    let assetInstructions = '';
    if (assets.length > 0) {
      assetInstructions += `\n\nATTACHED USER ASSETS TO ANIMATE & INTEGRATE (${assets.length} file(s)):
The user has attached the following visual asset(s). You MUST animate and integrate them prominently into the motion graphic:
${assets.map((a, idx) => {
  return `- Asset #${idx + 1}: "${a.name}" (${a.mimeType || 'image'})
    Data URL / Source: "${a.dataUrl ? (a.dataUrl.length > 100 ? a.dataUrl.substring(0, 80) + '...[embedded_data_url]...' : a.dataUrl) : (a.relativePath || a.name)}"
    Integration Instruction: Preload this image asset in a hidden <div id="nara-local-assets" style="display:none"><img id="user-asset-${idx}" src="${a.dataUrl || a.relativePath || a.name}" /></div> or via new Image(). In renderFrame(frameIndex), draw and animate this asset with camera parallax, smooth scale/rotation, and glowing accents. Always check (img.complete && img.naturalWidth > 0) before ctx.drawImage, and provide a procedural fallback if not yet loaded.`;
}).join('\n')}
CRITICAL: Embed the exact provided src/dataUrl string into the code so it renders offline with 100% self-containment!`;
    }

    if (folderAssets.length > 0) {
      assetInstructions += `\n\nLOCAL FOLDER ASSETS IN HTML DIRECTORY (${folderAssets.length} file(s)):
Integrate the following relative paths from the animation folder (with procedural Canvas fallback if missing):
${folderAssets.map((relPath, idx) => `- Local Asset #${idx + 1}: "${relPath}"`).join('\n')}`;
    }

    return `Synthesize a high-fidelity NARA 4K HTML5 motion graphic with the following specifications:
- Theme / Visual Concept: ${theme}
- Duration: ${durationSeconds} seconds (${totalFrames} total frames at ${fps} FPS, hold_last_frames: ${holdLastFrames})
- Canvas Dimensions: ${width}x${height} (use proportional design unit U = WIDTH / 1920)
- Looping Mode: ${isLoop ? 'Seamless 360° Periodic Loop (loop: true, hold_last_frames: 0)' : `One-Shot Cinematic Opener/Resolve (loop: false, hold_last_frames: ${holdLastFrames})`}
- Background Style: ${backgroundStyle === 'transparent' ? 'Transparent Alpha Channel (ctx.clearRect, transparent body/stage background for Apple ProRes 4444)' : backgroundStyle === 'light' ? 'Premium Editorial Light Studio (>= 2 moving background layers + subtle grain)' : 'Deep Cinematic Multi-Layer Dark (>= 3 moving background layers + volumetric glow + seeded grain)'}
- Hybrid CDN & Local Fallback: Include dual-fallback <script> tags (e.g., GSAP 3 / Three.js / Anime.js with onerror="this.onerror=null;this.src='vendor/...';") and lockstep-sync timelines to t = frameIndex / ${fps} inside renderFrame(frameIndex).
- Folder Asset Support: Include a hidden #nara-local-assets preload block and safe drawLocalImageOrFallback() helper so local folder assets (e.g., assets/logo.png) and procedural graphics work seamlessly.${assetInstructions}

Ensure the output is 100% standalone, follows Anti-PPT & Anti-Overlap laws, uses window.__renderTick(frameIndex, targetFps), and starts at line 1 with the <!--METADATA ... METADATA--> block.`;
  }

  /**
   * Strip markdown code blocks if the AI enclosed its response in them
   */
  function cleanGeneratedCode(rawText) {
    if (!rawText) return '';
    let cleaned = rawText.trim();

    // Remove markdown code fences like ```html ... ``` or ``` ... ```
    if (cleaned.startsWith('```')) {
      const firstNewline = cleaned.indexOf('\n');
      if (firstNewline !== -1) {
        cleaned = cleaned.substring(firstNewline + 1);
      }
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.lastIndexOf('```')).trim();
    }

    // Safety fallback: Ensure NARA Metadata block exists
    if (!cleaned.includes('<!--METADATA')) {
      const fallbackMeta = `<!--METADATA
{
  "title": "AI Motion Graphic",
  "description": "Procedural animation synthesized by NARA AI Engine",
  "keywords": ["ai motion", "procedural animation", "4k", "commercial", "loop"],
  "category": "Motion Graphics & Backgrounds",
  "fps": 60,
  "total_frames": 180,
  "loop": true,
  "width": 3840,
  "height": 2160
}
METADATA-->\n`;
      cleaned = fallbackMeta + cleaned;
    }

    // Safety fallback: Ensure __renderTick hook exists
    if (!cleaned.includes('window.__renderTick')) {
      const hookScript = `
<script>
  if (typeof window.__renderTick !== 'function') {
    window.__renderTick = function(frameIndex) {
      if (typeof renderFrame === 'function') renderFrame(frameIndex);
    };
  }
</script>
</body>`;
      cleaned = cleaned.replace(/<\/body>/i, hookScript);
    }

    return cleaned;
  }

  /**
   * Request generation from Google Gemini API
   */
  async function callGeminiApi({ apiKey, model, userPrompt, systemPrompt, assets = [], onProgress }) {
    if (!apiKey) {
      throw new Error('Google Gemini API Key belum diisi. Silakan masukkan API Key Anda di panel AI.');
    }

    const selectedModel = model || 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

    if (onProgress) onProgress('Menghubungi Google Gemini API (' + selectedModel + ')...');

    // Build content parts (text prompt + multimodal image parts if attached)
    const contentParts = [{ text: userPrompt }];

    if (Array.isArray(assets) && assets.length > 0) {
      for (const asset of assets) {
        if (asset.dataUrl && asset.isImage && !asset.dataUrl.includes('image/svg+xml')) {
          try {
            const matches = asset.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (matches && matches[1] && matches[2]) {
              contentParts.push({
                inlineData: {
                  mimeType: matches[1],
                  data: matches[2]
                }
              });
            }
          } catch (e) {
            console.warn('Could not attach image to Gemini vision prompt:', e);
          }
        }
      }
    }

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: contentParts
        }
      ],
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 8192
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errDetails = '';
      try {
        const errJson = await response.json();
        errDetails = errJson.error ? (errJson.error.message || JSON.stringify(errJson.error)) : '';
      } catch (e) {
        errDetails = response.statusText;
      }
      throw new Error(`Google Gemini API Error (${response.status}): ${errDetails || 'Gagal menghasilkan kode'}`);
    }

    if (onProgress) onProgress('Memproses sintesis kode animasi HTML5...');

    const data = await response.json();
    const candidate = data.candidates && data.candidates[0];
    if (!candidate || !candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
      throw new Error('Google Gemini tidak mengembalikan output kode yang valid.');
    }

    return candidate.content.parts[0].text;
  }

  /**
   * Request generation from OpenAI API
   */
  async function callOpenAiApi({ apiKey, model, userPrompt, systemPrompt, customUrl, onProgress }) {
    if (!apiKey) {
      throw new Error('OpenAI API Key belum diisi. Silakan masukkan API Key Anda di panel AI.');
    }

    const selectedModel = model || 'gpt-4o-mini';
    const baseUrl = customUrl || 'https://api.openai.com/v1';
    const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

    if (onProgress) onProgress('Menghubungi OpenAI API (' + selectedModel + ')...');

    const requestBody = {
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.65
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errDetails = '';
      try {
        const errJson = await response.json();
        errDetails = errJson.error ? (errJson.error.message || JSON.stringify(errJson.error)) : '';
      } catch (e) {
        errDetails = response.statusText;
      }
      throw new Error(`OpenAI API Error (${response.status}): ${errDetails || 'Gagal menghasilkan kode'}`);
    }

    if (onProgress) onProgress('Memproses sintesis kode animasi HTML5...');

    const data = await response.json();
    const message = data.choices && data.choices[0] && data.choices[0].message;
    if (!message || !message.content) {
      throw new Error('OpenAI tidak mengembalikan output kode yang valid.');
    }

    return message.content;
  }

  /**
   * Main generation entry point
   */
  async function generateAiMotion(options = {}, onProgress = null) {
    const config = getAiConfig();
    const provider = options.provider || config.provider || 'gemini';
    const apiKey = options.apiKey !== undefined ? options.apiKey : config.apiKey;
    const model = options.model || config.model || DEFAULT_MODELS[provider] || DEFAULT_MODELS.gemini;
    const customUrl = options.customUrl !== undefined ? options.customUrl : config.customUrl;

    if (!apiKey) {
      throw new Error('API Key belum diisi. Harap masukkan API Key (Google Gemini atau OpenAI) pada pengaturan AI.');
    }

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(options);

    let rawCode = '';
    const assets = Array.isArray(options.assets) ? options.assets : [];
    if (provider === 'gemini') {
      rawCode = await callGeminiApi({ apiKey, model, userPrompt, systemPrompt, assets, onProgress });
    } else if (provider === 'openai') {
      rawCode = await callOpenAiApi({ apiKey, model, userPrompt, systemPrompt, customUrl, onProgress });
    } else {
      throw new Error(`Provider AI "${provider}" belum didukung.`);
    }

    if (onProgress) onProgress('Memvalidasi kepatuhan Virtual Clock NARA...');
    const finalizedHtml = cleanGeneratedCode(rawCode);

    return {
      success: true,
      html: finalizedHtml,
      provider,
      model,
      durationSeconds: options.durationSeconds || 3,
      totalFrames: Math.round((options.durationSeconds || 3) * (options.fps || 60))
    };
  }

  // Pre-configured inspiration prompts
  const INSPIRATION_PROMPTS = [
    {
      id: 'cyber_hud',
      title: 'Cyberpunk HUD',
      icon: '⚡',
      prompt: 'Futuristic Cyberpunk Holographic HUD with glowing cyan telemetry rings, rotating circular gauges, numerical data tickers, and an active radar sweep across a dark grid matrix.',
      duration: 3
    },
    {
      id: 'particle_vortex',
      title: 'Quantum Particles',
      icon: '🌌',
      prompt: 'Hypnotic quantum particle vortex with thousands of glowing neon purple and turquoise embers spiraling into a central gravitational singularity with chromatic aberration.',
      duration: 3
    },
    {
      id: 'fluid_wave',
      title: 'Iridescent Waves',
      icon: '🌊',
      prompt: 'Fluid iridescent gradient ribbon waves undulating smoothly in 3D space with liquid glass sheen, specular reflections, and chromatic color dispersion.',
      duration: 4
    },
    {
      id: 'fintech_chart',
      title: 'FinTech Hologram',
      icon: '📈',
      prompt: 'Futuristic FinTech stock market chart visualization with glowing green and gold candlestick pulses, volume bars, floating holographic currency nodes, and real-time percentage indicators.',
      duration: 3
    },
    {
      id: 'dna_helix',
      title: 'DNA Nanotech',
      icon: '🧬',
      prompt: 'Sci-fi double-helix DNA strand rotating smoothly along vertical axis with glowing chemical bond particles, nanotech data nodes, and depth-of-field bokeh.',
      duration: 4
    },
    {
      id: 'gold_luxury',
      title: 'Luxury Gold Flow',
      icon: '💎',
      prompt: 'Opulent flowing golden liquid ribbon waves with shimmering metallic specular highlights, floating stardust particles, and deep royal obsidian background.',
      duration: 3
    },
    {
      id: 'ai_neural',
      title: 'Neural Network',
      icon: '🧠',
      prompt: 'Complex 3D artificial neural network visualization with pulsing synaptic signals traveling along glowing axon lines between cluster nodes, displaying floating AI tensor metrics.',
      duration: 3
    }
  ];

  /**
   * Fetch available models directly from the provider using the user's API Key.
   * Only models accessible by this specific API Key will be returned!
   */
  async function fetchAvailableModels(provider, apiKey, customUrl = '') {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, models: [], error: 'API Key belum diisi.' };
    }

    const key = apiKey.trim();

    try {
      if (provider === 'gemini') {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
        const res = await fetch(endpoint);
        if (!res.ok) {
          let errText = res.statusText;
          try {
            const errJson = await res.json();
            errText = errJson.error ? (errJson.error.message || JSON.stringify(errJson.error)) : res.statusText;
          } catch(e) {}
          throw new Error(`Google API (${res.status}): ${errText}`);
        }

        const data = await res.json();
        const rawModels = Array.isArray(data.models) ? data.models : [];

        // Models that Google AI Studio provides in the Free Tier (Flash & Lite tiers)
        // Flash models (like gemini-2.5-flash, 2.0-flash, 1.5-flash) and Lite/Flash-Lite models have free quota
        const isFreeTierGemini = (id) => {
          const lower = id.toLowerCase();
          return lower.includes('flash') || lower.includes('lite');
        };

        // Filter models that support content generation and are usable for code generation
        const geminiModels = rawModels
          .filter(m => {
            const methods = m.supportedGenerationMethods || [];
            const hasGenerateContent = methods.includes('generateContent');
            const name = (m.name || '').toLowerCase();
            const id = (m.name || '').replace(/^models\//, '').toLowerCase();

            if (!hasGenerateContent || !name.includes('gemini')) return false;

            // Filter out non-coding/non-text specialty models (tts, embedding, vision-only, robotics)
            if (id.includes('tts') || id.includes('audio') || id.includes('embedding') || id.includes('image') || id.includes('imagen')) {
              return false;
            }

            // Filter out legacy dated snapshot clutter like 001, 002 if main alias exists, unless explicitly useful
            // Keep clean model names (e.g., gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash, gemini-1.5-pro)
            return true;
          })
          .map(m => {
            const id = (m.name || '').replace(/^models\//, '');
            const displayName = m.displayName || id;
            const isFree = isFreeTierGemini(id);
            const badge = isFree ? '[FREE] ' : '[PAID] ';
            
            return {
              id: id,
              name: displayName,
              isFree: isFree,
              label: `${badge}${id} (${displayName})`
            };
          });

        if (geminiModels.length === 0) {
          throw new Error('Tidak ada model Gemini yang ditemukan untuk API Key ini.');
        }

        // Prioritize: FREE models first, then Lite/Flash, latest versions on top
        geminiModels.sort((a, b) => {
          // Free models on top
          if (a.isFree && !b.isFree) return -1;
          if (!a.isFree && b.isFree) return 1;

          // Prefer newer 2.5/2.0 over 1.5
          const getScore = (id) => {
            let score = 0;
            if (id.includes('lite') || id.includes('flash-lite')) score += 30;
            if (id.includes('flash')) score += 20;
            if (id.includes('2.5')) score += 15;
            if (id.includes('2.0')) score += 10;
            if (id.includes('1.5')) score += 5;
            if (id.includes('-preview') || id.includes('-exp')) score -= 5;
            if (/\d{3,}$/.test(id)) score -= 10; // dated snapshots lower
            return score;
          };

          return getScore(b.id) - getScore(a.id) || a.id.localeCompare(b.id);
        });

        return { success: true, models: geminiModels };
      } else if (provider === 'openai') {
        const baseUrl = customUrl || 'https://api.openai.com/v1';
        const endpoint = `${baseUrl.replace(/\/+$/, '')}/models`;
        const res = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${key}`
          }
        });

        if (!res.ok) {
          let errText = res.statusText;
          try {
            const errJson = await res.json();
            errText = errJson.error ? (errJson.error.message || JSON.stringify(errJson.error)) : res.statusText;
          } catch(e) {}
          throw new Error(`OpenAI API (${res.status}): ${errText}`);
        }

        const data = await res.json();
        const rawModels = Array.isArray(data.data) ? data.data : [];

        const openaiModels = rawModels
          .filter(m => {
            const id = (m.id || '').toLowerCase();
            return id.includes('gpt-4') || id.includes('gpt-3.5') || id.includes('o1') || id.includes('o3');
          })
          .map(m => ({
            id: m.id,
            name: m.id,
            label: m.id
          }));

        if (openaiModels.length === 0) {
          throw new Error('Tidak ada model OpenAI yang ditemukan untuk API Key ini.');
        }

        openaiModels.sort((a, b) => {
          if (a.id.includes('gpt-4o') && !b.id.includes('gpt-4o')) return -1;
          if (!a.id.includes('gpt-4o') && b.id.includes('gpt-4o')) return 1;
          return a.id.localeCompare(b.id);
        });

        return { success: true, models: openaiModels };
      }

      return { success: false, models: [], error: `Provider "${provider}" tidak dikenal.` };
    } catch (err) {
      return { success: false, models: [], error: err.message };
    }
  }

  // Expose API
  const AiMotionEngine = {
    getAiConfig,
    saveAiConfig,
    generateAiMotion,
    fetchAvailableModels,
    buildSystemPrompt,
    buildUserPrompt,
    INSPIRATION_PROMPTS,
    STORAGE_KEYS,
    DEFAULT_MODELS
  };

  if (typeof window !== 'undefined') {
    window.AiMotionEngine = AiMotionEngine;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AiMotionEngine;
  }
})(typeof window !== 'undefined' ? window : global);
