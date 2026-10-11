/**
 * Motion Studio Engine - Master Generator Registry
 */

const { generateKineticTypography } = require('./kinetic-typography');
const { generateParticleFX } = require('./particle-fx');
const { generateIsometric3D } = require('./isometric-3d');
const { generateDataVisualization } = require('./data-visualization');
const { generateAbstractMotion } = require('./abstract-motion');
const { generateFlatAnimation } = require('./flat-animation');

const GeneratorCatalog = {
  'kinetic-typography': {
    id: 'kinetic-typography',
    name: 'Kinetic Typography',
    description: 'Dynamic commercial title reveals, staggered typographic motion, and futuristic glowing text.',
    category: 'Typography',
    icon: 'text',
    defaultOptions: {
      title: 'MOTION STUDIO ENGINE',
      subtitle: 'COMMERCIAL 4K VIDEO PIPELINE',
      tag: '4K MICROSTOCK • SEAMLESS LOOP',
      theme: 'cyber-cyan',
      fps: 60,
      totalFrames: 180,
      isTransparent: false
    },
    generate: generateKineticTypography
  },
  'particle-fx': {
    id: 'particle-fx',
    name: 'Particle FX',
    description: 'Glowing cosmic vortex, floating luxury bokeh, and procedural cyber spark fields with alpha support.',
    category: 'VFX',
    icon: 'sparkles',
    defaultOptions: {
      particleCount: 350,
      style: 'cosmic-vortex',
      theme: 'neon-aqua',
      fps: 60,
      totalFrames: 180,
      isTransparent: true
    },
    generate: generateParticleFX
  },
  'isometric-3d': {
    id: 'isometric-3d',
    name: 'Isometric 3D',
    description: 'Futuristic procedural isometric grid with extruding tech cubes, server racks, and data matrix loops.',
    category: '3D Graphics',
    icon: 'box',
    defaultOptions: {
      gridSize: 6,
      theme: 'cyber-matrix',
      fps: 60,
      totalFrames: 180,
      isTransparent: false
    },
    generate: generateIsometric3D
  },
  'data-visualization': {
    id: 'data-visualization',
    name: 'Data Visualization',
    description: 'FinTech dashboard telemetry, animated radial gauges, live bar charts, and real-time numeric counters.',
    category: 'Infographics',
    icon: 'bar-chart',
    defaultOptions: {
      chartType: 'fintech-hud',
      theme: 'cyber-cyan',
      metricLabel: 'GLOBAL NETWORK TRAFFIC',
      fps: 60,
      totalFrames: 180,
      isTransparent: false
    },
    generate: generateDataVisualization
  },
  'abstract-motion': {
    id: 'abstract-motion',
    name: 'Abstract Motion',
    description: 'Hypnotic iridescent fluid waves, morphing liquid ribbons, and seamless geometric color pulses.',
    category: 'Backgrounds',
    icon: 'activity',
    defaultOptions: {
      motif: 'fluid-ribbons',
      palette: 'iridescent',
      theme: 'iridescent',
      waveCount: 5,
      waveComplexity: 5,
      speed: 1.0,
      fps: 60,
      totalFrames: 180,
      isTransparent: false
    },
    generate: generateAbstractMotion
  },
  'flat-animation': {
    id: 'flat-animation',
    name: 'Flat Animation',
    description: 'Clean corporate explainer vector motion graphics: verified checkmark badges, search UI, and celebratory bursts.',
    category: 'Illustrations',
    icon: 'check-circle',
    defaultOptions: {
      motif: 'success-badge',
      theme: 'tech-blue',
      label: 'TRANSACTION COMPLETED',
      fps: 60,
      totalFrames: 180,
      isTransparent: true
    },
    generate: generateFlatAnimation
  }
};

// Convenience API methods
GeneratorCatalog.generate = function(id, options) {
  const item = GeneratorCatalog[id];
  if (!item || typeof item.generate !== 'function') {
    throw new Error(`Unknown generator category: "${id}"`);
  }
  return item.generate(options);
};

GeneratorCatalog.getDefaultParams = function(id) {
  const item = GeneratorCatalog[id];
  return item ? { ...item.defaultOptions } : {};
};

GeneratorCatalog.listCategories = function() {
  return Object.values(GeneratorCatalog).filter(item => typeof item === 'object' && item.id);
};

if (typeof window !== 'undefined') {
  window.GeneratorCatalog = GeneratorCatalog;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GeneratorCatalog;
  module.exports.GeneratorCatalog = GeneratorCatalog;
}

