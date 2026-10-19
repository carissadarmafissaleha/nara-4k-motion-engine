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
   * Strict system instruction ensuring generated animations match NARA 4K pipeline.
   */
  function buildSystemPrompt() {
    return `You are NARA AI - the world-class motion graphics engineer and procedural animation synthesizer for NARA 4K Motion Studio.
Your sole mission is to generate a single, completely standalone, self-contained HTML5 file featuring cutting-edge, high-end commercial motion graphics (Canvas 2D, WebGL, or procedural SVG/CSS).

CRITICAL TECHNICAL SPECIFICATIONS THAT MUST BE SATISFIED:
1. HYBRID CDN ARCHITECTURE & STANDALONE EXECUTION:
   - Native HTML5 Canvas 2D, WebGL, procedural SVG, or CSS3 keyframes are first-class citizens.
   - When advanced animation or 3D graphics libraries are required (GSAP, Three.js, PixiJS, Anime.js), you MAY include standard CDN script tags (e.g. cdnjs.cloudflare.com or cdn.jsdelivr.net).
   - NARA's Core Render Engine automatically intercepts these CDN requests and serves pre-bundled local vendor copies (GSAP, Three.js, PixiJS, Anime.js, Confetti) when offline, ensuring 100% deterministic offline rendering.
   - For standalone dual-fallback, you can use:
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" onerror="this.onerror=null; this.src='vendor/gsap.min.js';"></script>
   - All code MUST run 100% deterministically in a Chromium headless browser whether online or offline.

2. NARA DETERMINISTIC METADATA HEADER:
   The document MUST start at line 1 with a NARA metadata comment block:
   <!--METADATA
   {
     "title": "Commercial Asset Title",
     "description": "Professional microstock motion graphic description",
     "keywords": ["tag1", "tag2", "4k", "motion graphics", "commercial", "broadcast", "loop"],
     "category": "Motion Graphics & Backgrounds",
     "fps": 60,
     "total_frames": 180,
     "loop": true,
     "width": 3840,
     "height": 2160
   }
   METADATA-->

3. NARA DETERMINISTIC VIRTUAL CLOCK (MANDATORY):
   NARA's headless rendering engine synchronously captures each frame by invoking:
   window.__renderTick(frameIndex, targetFps);
   
   You MUST implement this exact function:
   function renderFrame(frameIndex) {
     const progress = (frameIndex % TOTAL_FRAMES) / TOTAL_FRAMES;
     const loopAngle = progress * Math.PI * 2;
     // Clean canvas and render visuals deterministically using frameIndex / loopAngle
   }
   window.__renderTick = function(frameIndex, targetFps) {
     renderFrame(frameIndex);
   };

   Also provide an interactive fallback loop for previewing inside browser:
   let previewFrame = 0;
   function animLoop() {
     if (!window.__isNaraHeadless) {
       renderFrame(previewFrame);
       previewFrame = (previewFrame + 1) % TOTAL_FRAMES;
       requestAnimationFrame(animLoop);
     }
   }
   requestAnimationFrame(animLoop);

4. RESOLUTION & AUTO-FIT VIEWPORT:
   The native stage resolution is 3840x2160 (or user requested resolution).
   Include an autoFitStage function so the stage scales down cleanly to fit any preview window:
   function autoFitStage() {
     const stage = document.getElementById('stage');
     if (!stage) return;
     const scale = Math.min(window.innerWidth / 3840, window.innerHeight / 2160);
     stage.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
   }
   window.addEventListener('resize', autoFitStage);
   window.addEventListener('DOMContentLoaded', autoFitStage);
   autoFitStage();

5. SEAMLESS LOOPING MATH:
   For looping animations, every visual cycle MUST close smoothly back into frame 0.
   Use trigonometric circular harmonics (e.g., Math.sin(loopAngle), Math.cos(loopAngle), or modular phases).
   Never use random Math.random() inside renderFrame() without fixed seeds, because frame N must look identical every time it renders.

6. HIGH-END AESTHETIC QUALITY:
   Create visually breathtaking, sleek, commercial-grade motion graphics:
   - Vibrant cyber glows, bioluminescent gradients, smooth specular highlights.
   - Clean geometric telemetry, sci-fi HUDs, luxury gold particle vortexes, or fluid wave physics.
   - Proper compositing modes (ctx.globalCompositeOperation = 'lighter' or 'screen' where glowing energy is needed).

OUTPUT FORMAT:
Return ONLY the raw HTML code. Do NOT wrap with markdown fences (\`\`\`html) or conversational commentary. Start directly with <!--METADATA and end with </html>.`;
  }

  /**
   * User prompt template with specific user options
   */
  function buildUserPrompt(options) {
    const theme = options.theme || 'Futuristic Cyberpunk Holographic HUD with pulsing energy grid';
    const durationSeconds = parseFloat(options.durationSeconds) || 3.0;
    const fps = parseInt(options.fps, 10) || 60;
    const totalFrames = Math.max(30, Math.round(durationSeconds * fps));
    const width = parseInt(options.width, 10) || 3840;
    const height = parseInt(options.height, 10) || 2160;
    const isLoop = options.isLoop !== false;
    const backgroundStyle = options.backgroundStyle || 'dark'; // 'dark', 'transparent', 'light'
    const assets = Array.isArray(options.assets) ? options.assets : [];

    let assetInstructions = '';
    if (assets.length > 0) {
      assetInstructions = `\n\nATTACHED USER ASSETS TO ANIMATE & INTEGRATE (${assets.length} file(s)):
The user has attached the following visual asset(s). You MUST animate and integrate them prominently into the motion graphic:
${assets.map((a, idx) => {
  const isImg = a.isImage || (a.mimeType && a.mimeType.startsWith('image/'));
  return `- Asset #${idx + 1}: "${a.name}" (${a.mimeType || 'unknown'})
    Data URL: "${a.dataUrl ? (a.dataUrl.length > 100 ? a.dataUrl.substring(0, 80) + '...[embedded_data_url]...' : a.dataUrl) : ''}"
    Integration Instruction: Preload this image asset as a new Image() with src = "${a.dataUrl || ''}". In renderFrame(frameIndex), draw and animate this asset on canvas (e.g., animate position, rotation, scale, pulsing glow, or floating particle trails around it). Make sure to check image.complete before ctx.drawImage.`;
}).join('\n')}
CRITICAL: Embed the exact provided dataUrl string into the JavaScript code as the image src so it renders offline with 100% self-containment!`;
    }

    return `Synthesize a high-fidelity NARA 4K HTML5 motion graphic with the following specifications:
- Theme / Visual Concept: ${theme}
- Duration: ${durationSeconds} seconds (${totalFrames} total frames at ${fps} FPS)
- Canvas Dimensions: ${width}x${height}
- Looping: ${isLoop ? 'Seamless 360° Loop' : 'One-shot cinematic build and resolve'}
- Background Style: ${backgroundStyle === 'transparent' ? 'Transparent Alpha (ctx.clearRect, transparent body background for ProRes 4444)' : backgroundStyle === 'light' ? 'Premium Clean Light Studio (#F5F7FA)' : 'Deep Cinematic Dark Cyber (#04060E or #0B0E17)'}${assetInstructions}

Ensure the output is 100% standalone, uses window.__renderTick, and contains the embedded <!--METADATA ... METADATA--> block.`;
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
