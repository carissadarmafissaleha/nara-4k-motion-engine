/**
 * Motion Studio Engine - Metadata Parser & Exporter
 * Extracts microstock metadata from HTML files and exports to metadata_export.csv
 */

const fs = require('fs');
const path = require('path');

/**
 * Clean and format filename into a human-readable title
 * @param {string} filename 
 * @returns {string}
 */
function filenameToTitle(filename) {
  const base = path.basename(filename, path.extname(filename));
  return base
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Parse key="value" pairs from a string (e.g., from comment metadata)
 * @param {string} text 
 * @returns {Record<string, string>}
 */
function parseKeyValueAttributes(text) {
  const attributes = {};
  const regex = /([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const key = match[1].toLowerCase();
    const val = match[2] ?? match[3] ?? match[4] ?? '';
    attributes[key] = val.trim();
  }
  return attributes;
}

/**
 * Parse HTML content for metadata tags, comments, and configuration
 * @param {string} filePath 
 * @param {string} [content]
 * @returns {Promise<object>}
 */
async function parseHtmlMetadata(filePath, content = null) {
  try {
    const html = content !== null ? content : await fs.promises.readFile(filePath, 'utf-8');

    const result = {
      filePath,
      filename: path.basename(filePath),
      title: '',
      description: '',
      keywords: [],
      category: 'Motion Graphics & Backgrounds',
      totalFrames: null,
      fps: null,
      width: null,
      height: null,
      loop: null,
      holdLastFrames: 0
    };

    // 1. Check title tag
    const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleTagMatch && titleTagMatch[1].trim()) {
      result.title = titleTagMatch[1].trim();
    }

    // 2. Check <meta> tags
    const metaTagRegex = /<meta\s+([^>]*?)\/?>/gi;
    let metaMatch;
    while ((metaMatch = metaTagRegex.exec(html)) !== null) {
      const attrs = parseKeyValueAttributes(metaMatch[1]);
      const name = (attrs.name || attrs.property || '').toLowerCase();
      const contentVal = attrs.content || '';

      if (!contentVal) continue;

      if (name === 'title') {
        result.title = contentVal;
      } else if (name === 'description') {
        result.description = contentVal;
      } else if (name === 'keywords') {
        result.keywords = contentVal.split(',').map(k => k.trim()).filter(Boolean);
      } else if (name === 'category') {
        result.category = contentVal;
      } else if (name === 'duration') {
        const parsed = parseFloat(contentVal);
        if (!isNaN(parsed) && parsed > 0) result.duration = parsed;
      } else if (name === 'total-frames' || name === 'totalframes' || name === 'frames') {
        const parsed = parseInt(contentVal, 10);
        if (!isNaN(parsed) && parsed > 0) result.totalFrames = parsed;
      } else if (name === 'fps') {
        const parsed = parseInt(contentVal, 10);
        if (!isNaN(parsed) && parsed > 0) result.fps = parsed;
      } else if (name === 'width') {
        const parsed = parseInt(contentVal, 10);
        if (!isNaN(parsed) && parsed > 0) result.width = parsed;
      } else if (name === 'height') {
        const parsed = parseInt(contentVal, 10);
        if (!isNaN(parsed) && parsed > 0) result.height = parsed;
      } else if (name === 'resolution') {
        const parts = contentVal.toLowerCase().split('x');
        if (parts.length === 2) {
          const w = parseInt(parts[0], 10);
          const h = parseInt(parts[1], 10);
          if (!isNaN(w) && w > 0) result.width = w;
          if (!isNaN(h) && h > 0) result.height = h;
        }
      } else if (name === 'loop') {
        result.loop = contentVal.toLowerCase() === 'true' || contentVal === '1';
      } else if (name === 'hold-frames' || name === 'holdlastframes') {
        const parsed = parseInt(contentVal, 10);
        if (!isNaN(parsed) && parsed >= 0) result.holdLastFrames = parsed;
      }
    }

    // 3. Check HTML comment metadata:
    // Supports JSON format: <!--METADATA\n{ ... }\nMETADATA--> or <!--METADATA { ... } -->
    // Also supports attribute format: <!-- METADATA: title="..." keywords="..." -->
    const commentRegex = /<!--\s*METADATA(?::)?\s*([\s\S]*?)\s*(?:METADATA\s*)?-->/gi;
    let commentMatch;
    while ((commentMatch = commentRegex.exec(html)) !== null) {
      const rawText = commentMatch[1].trim();

      // Check for JSON object inside comment
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          const jsonStr = rawText.substring(firstBrace, lastBrace + 1);
          const metaJson = JSON.parse(jsonStr);
          if (metaJson.title) result.title = metaJson.title;
          if (metaJson.description) result.description = metaJson.description;
          if (Array.isArray(metaJson.keywords)) {
            result.keywords = metaJson.keywords.map(k => String(k).trim()).filter(Boolean);
          } else if (typeof metaJson.keywords === 'string') {
            result.keywords = metaJson.keywords.split(',').map(k => k.trim()).filter(Boolean);
          }
          if (metaJson.category) result.category = metaJson.category;
          if (metaJson.fps) {
            const parsedFps = parseInt(metaJson.fps, 10);
            if (!isNaN(parsedFps) && parsedFps > 0) result.fps = parsedFps;
          }
          if (metaJson.duration_seconds !== undefined || metaJson.duration !== undefined) {
            const parsedDur = parseFloat(metaJson.duration_seconds !== undefined ? metaJson.duration_seconds : metaJson.duration);
            if (!isNaN(parsedDur) && parsedDur > 0) result.duration = parsedDur;
          }
          if (metaJson.total_frames || metaJson.totalFrames || metaJson.frames) {
            const parsedFrames = parseInt(metaJson.total_frames || metaJson.totalFrames || metaJson.frames, 10);
            if (!isNaN(parsedFrames) && parsedFrames > 0) result.totalFrames = parsedFrames;
          }
          if (metaJson.width && metaJson.height) {
            result.width = parseInt(metaJson.width, 10);
            result.height = parseInt(metaJson.height, 10);
          } else if (metaJson.aspect_ratio === '16:9') {
            result.width = 3840;
            result.height = 2160;
          } else if (metaJson.aspect_ratio === '9:16') {
            result.width = 1080;
            result.height = 1920;
          } else if (metaJson.aspect_ratio === '1:1') {
            result.width = 1080;
            result.height = 1080;
          }
          if (metaJson.loop !== undefined) {
            result.loop = Boolean(metaJson.loop);
          }
          if (metaJson.hold_frames !== undefined || metaJson.holdLastFrames !== undefined) {
            const parsedHold = parseInt(metaJson.hold_frames !== undefined ? metaJson.hold_frames : metaJson.holdLastFrames, 10);
            if (!isNaN(parsedHold) && parsedHold >= 0) result.holdLastFrames = parsedHold;
          }
        } catch (e) {
          // If JSON parse fails, fall through to key-value parser below
        }
      }

      // Also parse key-value attributes like title="..." keywords="..."
      const attrs = parseKeyValueAttributes(rawText);
      if (attrs.title && !result.title) result.title = attrs.title;
      if (attrs.description && !result.description) result.description = attrs.description;
      if (attrs.keywords && result.keywords.length === 0) {
        result.keywords = attrs.keywords.split(',').map(k => k.trim()).filter(Boolean);
      }
      if (attrs.category && !result.category) result.category = attrs.category;
      if (attrs.duration && !result.duration) {
        const parsed = parseFloat(attrs.duration);
        if (!isNaN(parsed) && parsed > 0) result.duration = parsed;
      }
      if ((attrs.totalframes || attrs.frames) && !result.totalFrames) {
        const parsed = parseInt(attrs.totalframes || attrs.frames, 10);
        if (!isNaN(parsed) && parsed > 0) result.totalFrames = parsed;
      }
      if (attrs.fps && !result.fps) {
        const parsed = parseInt(attrs.fps, 10);
        if (!isNaN(parsed) && parsed > 0) result.fps = parsed;
      }
      if (attrs.width && !result.width) {
        const parsed = parseInt(attrs.width, 10);
        if (!isNaN(parsed) && parsed > 0) result.width = parsed;
      }
      if (attrs.height && !result.height) {
        const parsed = parseInt(attrs.height, 10);
        if (!isNaN(parsed) && parsed > 0) result.height = parsed;
      }
      if (attrs.resolution && (!result.width || !result.height)) {
        const parts = attrs.resolution.toLowerCase().split('x');
        if (parts.length === 2) {
          const w = parseInt(parts[0], 10);
          const h = parseInt(parts[1], 10);
          if (!isNaN(w) && w > 0) result.width = w;
          if (!isNaN(h) && h > 0) result.height = h;
        }
      }
      if (attrs.loop !== undefined && result.loop === null) {
        result.loop = attrs.loop.toLowerCase() === 'true' || attrs.loop === '1';
      }
      if ((attrs.holdframes || attrs.holdlastframes) && result.holdLastFrames === 0) {
        const parsed = parseInt(attrs.holdframes || attrs.holdlastframes, 10);
        if (!isNaN(parsed) && parsed >= 0) result.holdLastFrames = parsed;
      }
    }

    // 4. Auto-detect <canvas> or <svg> viewBox dimensions if width/height not in meta
    if (!result.width || !result.height) {
      const canvasMatch = html.match(/<canvas[^>]*width=["']?(\d+)["']?[^>]*height=["']?(\d+)["']?/i) ||
                          html.match(/<canvas[^>]*height=["']?(\d+)["']?[^>]*width=["']?(\d+)["']?/i);
      if (canvasMatch) {
        const val1 = parseInt(canvasMatch[1], 10);
        const val2 = parseInt(canvasMatch[2], 10);
        if (canvasMatch[0].indexOf('width=') < canvasMatch[0].indexOf('height=')) {
          if (!result.width && val1 > 0) result.width = val1;
          if (!result.height && val2 > 0) result.height = val2;
        } else {
          if (!result.height && val1 > 0) result.height = val1;
          if (!result.width && val2 > 0) result.width = val2;
        }
      }

      // Check SVG viewBox e.g. viewBox="0 0 3840 2160"
      if (!result.width || !result.height) {
        const svgVbMatch = html.match(/viewBox=["']?0\s+0\s+(\d+)\s+(\d+)["']?/i);
        if (svgVbMatch) {
          const w = parseInt(svgVbMatch[1], 10);
          const h = parseInt(svgVbMatch[2], 10);
          if (w > 0 && h > 0) {
            result.width = w;
            result.height = h;
          }
        }
      }
    }

    // 5. Auto-detect script variables for frames, duration, and FPS if missing
    if (result.totalFrames === null) {
      // Check variable declarations: TOTAL_FRAMES, totalFrames, FRAME_COUNT, maxFrames, loopFrames, etc.
      const frameVarMatch = html.match(/(?:const|let|var|window\.)\s*(?:TOTAL_FRAMES|totalFrames|TOTALFRAMES|ANIMATION_FRAMES|FRAME_COUNT|frameCount|MAX_FRAMES|maxFrames|NUM_FRAMES|numFrames|LOOP_FRAMES|loopFrames|END_FRAME|endFrame|STOP_FRAME|stopFrame|FRAMES|frames)\s*[:=]\s*(\d+)/i);
      if (frameVarMatch) {
        const val = parseInt(frameVarMatch[1], 10);
        if (!isNaN(val) && val > 0) result.totalFrames = val;
      }
    }

    if (result.totalFrames === null) {
      // Check object property patterns: totalFrames: 180, frames: 180, etc.
      const propMatch = html.match(/(?:['"]?(?:totalFrames|total_frames|frameCount|frame_count|maxFrames|max_frames|numFrames|num_frames|frames)['"]?\s*[:=]\s*(\d+))/i);
      if (propMatch) {
        const val = parseInt(propMatch[1], 10);
        if (!isNaN(val) && val > 0) result.totalFrames = val;
      }
    }

    if (result.totalFrames === null) {
      // Check loop conditions like frame >= 180, count > 120, frame % 180
      const loopCondMatch = html.match(/(?:frame|currentFrame|f|count|step)\s*(?:>=|>|===|==|%)\s*(\d+)/i);
      if (loopCondMatch) {
        const val = parseInt(loopCondMatch[1], 10);
        if (!isNaN(val) && val >= 10 && val <= 7200) result.totalFrames = val;
      }
    }

    // Auto-detect duration from script / CSS if totalFrames still null
    if (result.totalFrames === null) {
      const durVarMatch = html.match(/(?:const|let|var|window\.)\s*(?:DURATION|duration|ANIMATION_DURATION|CYCLE_DURATION)\s*[:=]\s*([0-9.]+)/i) ||
                          html.match(/animation(?:-duration)?\s*:\s*([0-9.]+)s/i);
      if (durVarMatch) {
        let durVal = parseFloat(durVarMatch[1]);
        if (!isNaN(durVal) && durVal > 0) {
          // If duration >= 500, it is in milliseconds (e.g. 10000ms = 10s, 5000ms = 5s)!
          if (durVal >= 500) {
            durVal = durVal / 1000;
          }
          result.duration = durVal;
          const targetFps = result.fps || 60;
          result.totalFrames = Math.max(1, Math.round(durVal * targetFps));
        }
      }
    }

    if (result.fps === null) {
      const fpsMatch = html.match(/(?:const|let|var)\s+(?:FPS|targetFps|frameRate)\s*=\s*(\d+)/i);
      if (fpsMatch) {
        const val = parseInt(fpsMatch[1], 10);
        if (!isNaN(val) && val > 0) result.fps = val;
      }
    }

    // 6. Auto-detect loop from filename or script if loop is null
    if (result.loop === null) {
      const loopScriptMatch = html.match(/(?:const|let|var)\s+(?:IS_LOOP|isLoop|LOOP)\s*=\s*(true|false)/i);
      if (loopScriptMatch) {
        result.loop = loopScriptMatch[1].toLowerCase() === 'true';
      } else {
        const lowerName = path.basename(filePath).toLowerCase();
        if (lowerName.includes('loop')) {
          result.loop = true;
        } else if (lowerName.includes('oneshot') || lowerName.includes('one-shot')) {
          result.loop = false;
        }
      }
    }

    // 7. Calculate duration <-> frames if one is provided
    if (result.duration && !result.totalFrames) {
      if (result.duration >= 500) {
        result.duration = result.duration / 1000;
      }
      const targetFps = result.fps || 60;
      result.totalFrames = Math.max(1, Math.round(result.duration * targetFps));
    } else if (result.totalFrames && !result.duration && result.fps) {
      result.duration = parseFloat((result.totalFrames / result.fps).toFixed(2));
    }

    // Fallback: If totalFrames could not be found anywhere in the file, default to 180
    if (!result.totalFrames) {
      result.totalFrames = 180;
    }

    // Fallbacks
    if (!result.title) {
      result.title = filenameToTitle(filePath);
    }

    return result;
  } catch (error) {
    console.error(`Failed to parse metadata from ${filePath}:`, error);
    return {
      filePath,
      filename: path.basename(filePath),
      title: filenameToTitle(filePath),
      description: 'Web animation render',
      keywords: ['motion', 'animation', 'render'],
      category: 'Motion Graphics & Backgrounds',
      totalFrames: null,
      fps: null,
      width: null,
      height: null,
      loop: null,
      holdLastFrames: 0
    };
  }
}

/**
 * Enrich keywords and metadata according to Loop vs One-Shot specifications
 * @param {object} params
 * @param {object} params.meta
 * @param {boolean} params.isSeamlessLoop
 * @param {number} params.holdLastFrames
 * @param {string} params.outputFilename
 * @returns {object}
 */
function enrichMetadata({ meta, isSeamlessLoop, holdLastFrames, outputFilename }) {
  const keywordSet = new Set(
    (meta.keywords || []).map(k => k.trim().toLowerCase()).filter(Boolean)
  );

  // Default core keywords if empty
  if (keywordSet.size === 0) {
    const titleWords = (meta.title || '').toLowerCase().split(/\s+/).filter(w => w.length > 2);
    titleWords.forEach(w => keywordSet.add(w));
    keywordSet.add('animation');
    keywordSet.add('motion graphics');
    keywordSet.add('4k');
  }

  if (isSeamlessLoop) {
    // Requirements: Add "loop, seamless, background"
    keywordSet.add('loop');
    keywordSet.add('seamless');
    keywordSet.add('background');
    keywordSet.add('seamless loop');
    keywordSet.add('endless');
    keywordSet.add('vfx');

    // Remove one-shot specific terms
    keywordSet.delete('one-shot');
    keywordSet.delete('oneshot');
    keywordSet.delete('transition');
    keywordSet.delete('freeze');
  } else {
    // Requirements: One-Shot: Remove loop tags, add "one-shot, transition, motion graphic"
    keywordSet.delete('loop');
    keywordSet.delete('seamless');
    keywordSet.delete('seamless loop');
    keywordSet.delete('endless');

    keywordSet.add('one-shot');
    keywordSet.add('transition');
    keywordSet.add('motion graphic');
    keywordSet.add('graphic');
    keywordSet.add('intro');
  }

  const keywordsString = Array.from(keywordSet).join(', ');

  return {
    filename: outputFilename || meta.filename || 'render_output',
    title: meta.title || filenameToTitle(outputFilename || 'render_output'),
    keywords: keywordsString,
    category: meta.category || (isSeamlessLoop ? 'Abstract / Backgrounds' : 'Motion Graphics / Transitions'),
    isLoop: Boolean(isSeamlessLoop),
    holdLastFrames: isSeamlessLoop ? 0 : Number(holdLastFrames || 0)
  };
}

/**
 * Escape a string for RFC 4180 CSV compliance
 * @param {string} field 
 * @returns {string}
 */
function escapeCsvField(field) {
  if (field === null || field === undefined) return '""';
  let str = '';
  if (Array.isArray(field)) {
    str = field.filter(Boolean).join(', ');
  } else {
    str = String(field);
  }
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Append or create metadata in metadata_export.csv
 * Columns: Filename, Title, Keywords, Category
 * @param {string} exportDir 
 * @param {Array<object>} records 
 * @returns {Promise<string>} Path to the written CSV file
 */
async function exportMetadataToCsv(exportDir, records) {
  await fs.promises.mkdir(exportDir, { recursive: true });
  const csvPath = path.join(exportDir, 'metadata_export.csv');

  const fileExists = typeof csvPath === 'string' && fs.existsSync(csvPath);
  let existingContent = '';
  let previousRowCount = 0;

  if (fileExists) {
    try {
      existingContent = await fs.promises.readFile(csvPath, 'utf-8');
      const lines = existingContent.split(/\r?\n/).filter(line => line.trim().length > 0);
      previousRowCount = Math.max(0, lines.length - 1); // Exclude header line
    } catch (err) {
      existingContent = '';
    }
  }

  let csvContent = '';

  if (!fileExists || !existingContent.trim()) {
    // Write official Microstock CSV header (Adobe Stock & Shutterstock compatible)
    csvContent += 'Filename,Title,Keywords,Category\r\n';
  } else if (!existingContent.endsWith('\n') && !existingContent.endsWith('\r')) {
    // Ensure clean row separation so previous row is never mangled
    csvContent += '\r\n';
  }

  for (const record of records) {
    const row = [
      escapeCsvField(record.filename),
      escapeCsvField(record.title),
      escapeCsvField(record.keywords),
      escapeCsvField(record.category)
    ].join(',');
    csvContent += `${row}\r\n`;
  }

  await fs.promises.appendFile(csvPath, csvContent, 'utf-8');

  const totalRows = previousRowCount + records.length;
  return {
    csvPath,
    appendedCount: records.length,
    previousRowCount,
    totalRows
  };
}

module.exports = {
  parseHtmlMetadata,
  enrichMetadata,
  exportMetadataToCsv,
  filenameToTitle
};
