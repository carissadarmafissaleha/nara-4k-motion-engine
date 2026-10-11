/**
 * Motion Studio Engine - Master Generator Registry
 */

function resolveGenerator(id) {
  const map = {
    'kinetic-typography': (typeof window !== 'undefined' && window.generateKineticTypography) || (typeof generateKineticTypography === 'function' ? generateKineticTypography : null) || (typeof require === 'function' ? require('./kinetic-typography').generateKineticTypography : null),
    'particle-fx': (typeof window !== 'undefined' && window.generateParticleFX) || (typeof generateParticleFX === 'function' ? generateParticleFX : null) || (typeof require === 'function' ? require('./particle-fx').generateParticleFX : null),
    'isometric-3d': (typeof window !== 'undefined' && window.generateIsometric3D) || (typeof generateIsometric3D === 'function' ? generateIsometric3D : null) || (typeof require === 'function' ? require('./isometric-3d').generateIsometric3D : null),
    'data-visualization': (typeof window !== 'undefined' && window.generateDataVisualization) || (typeof generateDataVisualization === 'function' ? generateDataVisualization : null) || (typeof require === 'function' ? require('./data-visualization').generateDataVisualization : null),
    'abstract-motion': (typeof window !== 'undefined' && window.generateAbstractMotion) || (typeof generateAbstractMotion === 'function' ? generateAbstractMotion : null) || (typeof require === 'function' ? require('./abstract-motion').generateAbstractMotion : null),
    'flat-animation': (typeof window !== 'undefined' && window.generateFlatAnimation) || (typeof generateFlatAnimation === 'function' ? generateFlatAnimation : null) || (typeof require === 'function' ? require('./flat-animation').generateFlatAnimation : null)
  };
  return map[id] || null;
}

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
    generate: (opts) => GeneratorCatalog.generate('kinetic-typography', opts)
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
    generate: (opts) => GeneratorCatalog.generate('particle-fx', opts)
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
    generate: (opts) => GeneratorCatalog.generate('isometric-3d', opts)
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
    generate: (opts) => GeneratorCatalog.generate('data-visualization', opts)
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
    generate: (opts) => GeneratorCatalog.generate('abstract-motion', opts)
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
    generate: (opts) => GeneratorCatalog.generate('flat-animation', opts)
  }
};

// Convenience API methods
GeneratorCatalog.generate = function(id, options) {
  const genFunc = resolveGenerator(id);
  if (typeof genFunc !== 'function') {
    throw new Error(`Generator function for category "${id}" is not available`);
  }
  return genFunc(options);
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

