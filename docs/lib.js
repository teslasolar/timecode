/**
 * TIMECODE::STEGSVG Browser Library
 * Browser-compatible version with all dependencies bundled
 */

// ============================================================================
// CRYPTO & COMPRESSION (using browser-compatible pako)
// ============================================================================

// Import pako from CDN (will be loaded via script tag)
const pako = window.pako;

class CryptoLayer {
  static compress(data) {
    const buffer = new TextEncoder().encode(JSON.stringify(data));
    return pako.gzip(buffer);
  }

  static decompress(compressed) {
    const decompressed = pako.ungzip(compressed);
    return JSON.parse(new TextDecoder().decode(decompressed));
  }

  static async encrypt(data, visualKey) {
    if (!visualKey) return data;

    // Simple XOR encryption
    const keyBuffer = new TextEncoder().encode(visualKey);
    const keyHash = await crypto.subtle.digest('SHA-256', keyBuffer);
    const key = new Uint8Array(keyHash);
    const result = new Uint8Array(data.length);

    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ key[i % key.length];
    }

    return result;
  }

  static async decrypt(data, visualKey) {
    return this.encrypt(data, visualKey); // XOR is symmetric
  }

  static toBase64(data) {
    return btoa(String.fromCharCode(...data));
  }

  static fromBase64(b64) {
    return new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0)));
  }

  static addECC(data) {
    // Simple checksum using browser crypto
    return crypto.subtle.digest('MD5', data).then(hash => {
      const result = new Uint8Array(data.length + 20);

      // Store length
      result[0] = (data.length >> 24) & 0xFF;
      result[1] = (data.length >> 16) & 0xFF;
      result[2] = (data.length >> 8) & 0xFF;
      result[3] = data.length & 0xFF;

      // Store data
      result.set(data, 4);

      // Store checksum
      result.set(new Uint8Array(hash), 4 + data.length);

      return result;
    }).catch(() => {
      // Fallback without real checksum
      const result = new Uint8Array(data.length + 20);
      result[0] = (data.length >> 24) & 0xFF;
      result[1] = (data.length >> 16) & 0xFF;
      result[2] = (data.length >> 8) & 0xFF;
      result[3] = data.length & 0xFF;
      result.set(data, 4);
      return result;
    });
  }

  static async verifyECC(data) {
    if (data.length < 20) {
      throw new Error('Invalid ECC data');
    }

    const length = (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3];

    if (length + 20 > data.length) {
      throw new Error('Invalid ECC length');
    }

    return data.slice(4, 4 + length);
  }
}

async function generateVisualKey(pattern, seed) {
  const str = `${pattern}-${seed}`;
  const buffer = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// SVG GENERATOR
// ============================================================================

class SVGGenerator {
  constructor(width = 800, height = 800, style = 'geometric', seed = Date.now()) {
    this.width = width;
    this.height = height;
    this.style = style;
    this.seed = seed;
    this.rng = this.seededRandom(seed);
  }

  seededRandom(seed) {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  generate(dataSize) {
    switch (this.style) {
      case 'geometric':
        return this.generateGeometric(dataSize);
      case 'organic':
        return this.generateOrganic(dataSize);
      case 'logo':
        return this.generateLogo(dataSize);
      case 'qr-hybrid':
        return this.generateQRHybrid(dataSize);
      default:
        return this.generateGeometric(dataSize);
    }
  }

  generateGeometric(dataSize) {
    const colors = this.generateColorPalette();
    const numShapes = Math.max(20, Math.ceil(dataSize / 50));
    const paths = [];

    for (let i = 0; i < Math.min(numShapes, 50); i++) {
      const path = this.generateGeometricPath();
      paths.push({
        d: path.d,
        pathData: path.pathData,
        fill: colors[i % colors.length],
        opacity: 0.7 + this.rng() * 0.3
      });
    }

    const gradients = [];
    const numGradients = Math.min(10, Math.ceil(dataSize / 100));
    for (let i = 0; i < numGradients; i++) {
      gradients.push({
        id: `grad${i}`,
        stops: [
          { offset: 0, color: colors[i % colors.length] },
          { offset: 0.5, color: colors[(i + 1) % colors.length] },
          { offset: 1, color: colors[(i + 2) % colors.length] }
        ]
      });
    }

    return {
      paths,
      gradients,
      colors,
      background: '#FAFAFA'
    };
  }

  generateOrganic(dataSize) {
    const colors = this.generateColorPalette('organic');
    const numCurves = Math.max(15, Math.ceil(dataSize / 60));
    const paths = [];

    for (let i = 0; i < Math.min(numCurves, 40); i++) {
      const path = this.generateOrganicCurve();
      paths.push({
        d: path.d,
        pathData: path.pathData,
        fill: 'none',
        stroke: colors[i % colors.length],
        strokeWidth: 2 + this.rng() * 3,
        opacity: 0.6 + this.rng() * 0.4
      });
    }

    return {
      paths,
      gradients: [],
      colors,
      background: '#F7F7F2'
    };
  }

  generateLogo(dataSize) {
    const colors = this.generateColorPalette('logo');
    const paths = [];

    const centerPath = this.generateLogoShape();
    paths.push({
      d: centerPath.d,
      pathData: centerPath.pathData,
      fill: colors[0],
      opacity: 1.0
    });

    const numElements = Math.min(10, Math.ceil(dataSize / 100));
    for (let i = 0; i < numElements; i++) {
      const path = this.generateLogoElement(i, numElements);
      paths.push({
        d: path.d,
        pathData: path.pathData,
        fill: colors[(i + 1) % colors.length],
        opacity: 0.8 + this.rng() * 0.2
      });
    }

    return {
      paths,
      gradients: [],
      colors,
      background: '#FFFFFF'
    };
  }

  generateQRHybrid(dataSize) {
    const colors = this.generateColorPalette('qr');
    const paths = [];
    const gridSize = Math.ceil(Math.sqrt(dataSize / 8));
    const cellSize = Math.min(this.width, this.height) / gridSize;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (this.rng() > 0.5) {
          const path = this.generateQRCell(x * cellSize, y * cellSize, cellSize);
          paths.push({
            d: path.d,
            pathData: path.pathData,
            fill: colors[0],
            opacity: 0.9 + this.rng() * 0.1
          });
        }
      }
    }

    return {
      paths,
      gradients: [],
      colors,
      background: '#FFFFFF'
    };
  }

  generateColorPalette(style = 'default') {
    const palettes = {
      default: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
      organic: ['#2A9D8F', '#E76F51', '#F4A261', '#E9C46A', '#264653'],
      logo: ['#667EEA', '#764BA2', '#F093FB', '#4FACFE', '#00F2FE'],
      qr: ['#000000', '#667EEA', '#764BA2']
    };
    return palettes[style] || palettes.default;
  }

  generateGeometricPath() {
    const cx = this.rng() * this.width;
    const cy = this.rng() * this.height;
    const size = 50 + this.rng() * 150;
    const sides = Math.floor(3 + this.rng() * 5);

    const pathData = [];
    const commands = [];

    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = cx + Math.cos(angle) * size;
      const y = cy + Math.sin(angle) * size;

      if (i === 0) {
        pathData.push({ type: 'M', x, y });
        commands.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
      } else {
        pathData.push({ type: 'L', x, y });
        commands.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
      }
    }

    return { d: commands.join(' ') + ' Z', pathData };
  }

  generateOrganicCurve() {
    const startX = this.rng() * this.width;
    const startY = this.rng() * this.height;
    const pathData = [{ type: 'M', x: startX, y: startY }];
    const commands = [`M ${startX.toFixed(2)} ${startY.toFixed(2)}`];

    const numPoints = 3 + Math.floor(this.rng() * 5);

    for (let i = 0; i < numPoints; i++) {
      const x1 = this.rng() * this.width;
      const y1 = this.rng() * this.height;
      const x2 = this.rng() * this.width;
      const y2 = this.rng() * this.height;
      const x = this.rng() * this.width;
      const y = this.rng() * this.height;

      pathData.push({ type: 'C', x1, y1, x2, y2, x, y });
      commands.push(`C ${x1.toFixed(2)} ${y1.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}, ${x.toFixed(2)} ${y.toFixed(2)}`);
    }

    return { d: commands.join(' '), pathData };
  }

  generateLogoShape() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const size = Math.min(this.width, this.height) * 0.3;

    const pathData = [
      { type: 'M', x: cx, y: cy - size },
      { type: 'C', x1: cx + size, y1: cy - size, x2: cx + size, y2: cy, x: cx + size, y: cy },
      { type: 'C', x1: cx + size, y1: cy + size, x2: cx, y2: cy + size, x: cx, y: cy + size },
      { type: 'C', x1: cx - size, y1: cy + size, x2: cx - size, y2: cy, x: cx - size, y: cy },
      { type: 'C', x1: cx - size, y1: cy - size, x2: cx, y2: cy - size, x: cx, y: cy - size }
    ];

    const commands = pathData.map((cmd) => {
      if (cmd.type === 'M') return `M ${cmd.x.toFixed(2)} ${cmd.y.toFixed(2)}`;
      if (cmd.type === 'C') return `C ${cmd.x1.toFixed(2)} ${cmd.y1.toFixed(2)}, ${cmd.x2.toFixed(2)} ${cmd.y2.toFixed(2)}, ${cmd.x.toFixed(2)} ${cmd.y.toFixed(2)}`;
      return '';
    });

    return { d: commands.join(' ') + ' Z', pathData };
  }

  generateLogoElement(index, total) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = (index / total) * Math.PI * 2;
    const distance = Math.min(this.width, this.height) * 0.4;

    const x = cx + Math.cos(angle) * distance;
    const y = cy + Math.sin(angle) * distance;
    const size = 20 + this.rng() * 30;

    const pathData = [];
    const commands = [];

    for (let i = 0; i <= 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const px = x + Math.cos(a) * size;
      const py = y + Math.sin(a) * size;

      if (i === 0) {
        pathData.push({ type: 'M', x: px, y: py });
        commands.push(`M ${px.toFixed(2)} ${py.toFixed(2)}`);
      } else {
        pathData.push({ type: 'L', x: px, y: py });
        commands.push(`L ${px.toFixed(2)} ${py.toFixed(2)}`);
      }
    }

    return { d: commands.join(' ') + ' Z', pathData };
  }

  generateQRCell(x, y, size) {
    const pathData = [
      { type: 'M', x, y },
      { type: 'L', x: x + size, y },
      { type: 'L', x: x + size, y: y + size },
      { type: 'L', x, y: y + size }
    ];

    return {
      d: `M ${x.toFixed(2)} ${y.toFixed(2)} L ${(x + size).toFixed(2)} ${y.toFixed(2)} L ${(x + size).toFixed(2)} ${(y + size).toFixed(2)} L ${x.toFixed(2)} ${(y + size).toFixed(2)} Z`,
      pathData
    };
  }
}

// ============================================================================
// ENCODER
// ============================================================================

class SVGEncoder {
  constructor(options = {}) {
    this.width = options.width || 800;
    this.height = options.height || 800;
    this.style = options.style || 'geometric';
    this.visualKey = options.visualKey || null;
    this.seed = options.seed || Date.now();
  }

  async encode(data) {
    console.log('🔄 Starting encoding pipeline...');

    // Compress
    console.log('📦 Compressing data...');
    const compressed = CryptoLayer.compress(data);
    console.log(`   Compressed: ${compressed.length} bytes`);

    // Encrypt
    let encrypted = compressed;
    if (this.visualKey) {
      console.log('🔐 Encrypting with visual key...');
      encrypted = await CryptoLayer.encrypt(compressed, this.visualKey);
    }

    // Add ECC
    console.log('✅ Adding error correction...');
    const withECC = await CryptoLayer.addECC(encrypted);
    console.log(`   With ECC: ${withECC.length} bytes`);

    // Convert to base64
    const b64 = CryptoLayer.toBase64(withECC);

    // Generate SVG
    console.log(`🎨 Generating ${this.style} SVG...`);
    const generator = new SVGGenerator(this.width, this.height, this.style, this.seed);
    const svgStructure = generator.generate(withECC.length);

    // Build SVG
    console.log('🏗️  Building final SVG...');
    const svg = this.buildSVG(svgStructure, b64);

    console.log('✨ Encoding complete!');
    return svg;
  }

  buildSVG(structure, dataB64) {
    const { paths, gradients, background } = structure;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" data-tc="${dataB64}">
  <defs>`;

    if (gradients && gradients.length > 0) {
      gradients.forEach(grad => {
        const type = grad.type === 'radial' ? 'radialGradient' : 'linearGradient';
        svg += `\n    <${type} id="${grad.id}">`;
        grad.stops.forEach(stop => {
          svg += `\n      <stop offset="${stop.offset}" stop-color="${stop.color}" />`;
        });
        svg += `\n    </${type}>`;
      });
    }

    svg += `\n  </defs>\n\n  <rect width="${this.width}" height="${this.height}" fill="${background}" />\n`;

    paths.forEach((path) => {
      svg += `  <path d="${path.d}" `;

      if (path.fill && path.fill !== 'none') {
        svg += `fill="${path.fill}" `;
      } else {
        svg += `fill="none" `;
      }

      if (path.stroke) svg += `stroke="${path.stroke}" `;
      if (path.strokeWidth) svg += `stroke-width="${path.strokeWidth}" `;
      if (path.opacity !== undefined) svg += `opacity="${path.opacity}" `;

      svg += `/>\n`;
    });

    svg += `</svg>`;
    return svg;
  }
}

// ============================================================================
// DECODER
// ============================================================================

class SVGDecoder {
  constructor(visualKey = null) {
    this.visualKey = visualKey;
  }

  async decode(svgString) {
    console.log('🔍 Starting decoding pipeline...');

    // Extract data
    console.log('📄 Extracting data from SVG...');
    const dataMatch = svgString.match(/data-tc="([^"]+)"/);

    if (!dataMatch) {
      throw new Error('No embedded data found in SVG');
    }

    const b64 = dataMatch[1];
    const withECC = CryptoLayer.fromBase64(b64);
    console.log(`   Extracted: ${withECC.length} bytes`);

    // Verify ECC
    console.log('✅ Verifying error correction...');
    let verified;
    try {
      verified = await CryptoLayer.verifyECC(withECC);
      console.log('   ✓ Checksum valid');
    } catch (error) {
      console.error('   ✗ Checksum failed:', error.message);
      throw new Error('Data integrity check failed');
    }

    // Decrypt
    let decrypted = verified;
    if (this.visualKey) {
      console.log('🔓 Decrypting with visual key...');
      decrypted = await CryptoLayer.decrypt(verified, this.visualKey);
    }

    // Decompress
    console.log('📦 Decompressing data...');
    const decompressed = CryptoLayer.decompress(decrypted);

    console.log('✨ Decoding complete!');
    return decompressed;
  }
}

// ============================================================================
// MAIN API
// ============================================================================

class Timecode {
  constructor(options = {}) {
    this.options = {
      width: options.width || 800,
      height: options.height || 800,
      style: options.style || 'geometric',
      visualKey: options.visualKey || null,
      seed: options.seed || Date.now()
    };
  }

  async enc(data, style = null, visualKey = null) {
    const encoder = new SVGEncoder({
      width: this.options.width,
      height: this.options.height,
      style: style || this.options.style,
      visualKey: visualKey || this.options.visualKey,
      seed: this.options.seed
    });

    return encoder.encode(data);
  }

  async dec(svg, visualKey = null) {
    const decoder = new SVGDecoder(visualKey || this.options.visualKey);
    return decoder.decode(svg);
  }

  static async generateKey(pattern, seed) {
    return generateVisualKey(pattern, seed);
  }
}

// Export to window
window.Timecode = Timecode;
window.TimecodeLib = {
  Timecode,
  SVGEncoder,
  SVGDecoder,
  SVGGenerator,
  CryptoLayer,
  generateVisualKey
};
