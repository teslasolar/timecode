/**
 * Robust SVG Steganography Encoder
 * Uses hybrid approach: visual steganography + data attributes for reliability
 */

import { CryptoLayer } from './crypto.js';
import { SVGGenerator } from './svg-generator.js';

export class SVGEncoderRobust {
  constructor(options = {}) {
    this.width = options.width || 800;
    this.height = options.height || 800;
    this.style = options.style || 'geometric';
    this.visualKey = options.visualKey || null;
    this.seed = options.seed || Date.now();
  }

  /**
   * Encode data into SVG with robust storage
   */
  encode(data) {
    console.log('🔄 Starting encoding pipeline...');

    // Step 1: Compress
    console.log('📦 Compressing data...');
    const compressed = CryptoLayer.compress(data);
    console.log(`   Compressed: ${compressed.length} bytes`);

    // Step 2: Encrypt (if visual key provided)
    let encrypted = compressed;
    if (this.visualKey) {
      console.log('🔐 Encrypting with visual key...');
      encrypted = CryptoLayer.encrypt(compressed, this.visualKey);
    }

    // Step 3: Add ECC
    console.log('✅ Adding error correction...');
    const withECC = CryptoLayer.addECC(encrypted);
    console.log(`   With ECC: ${withECC.length} bytes`);

    // Step 4: Convert to base64
    const b64 = CryptoLayer.toBase64(withECC);

    // Step 5: Generate beautiful SVG
    console.log(`🎨 Generating ${this.style} SVG...`);
    const generator = new SVGGenerator(this.width, this.height, this.style, this.seed);
    const svgStructure = generator.generate(withECC.length);

    // Step 6: Build SVG with embedded data
    console.log('🏗️  Building final SVG...');
    const svg = this.buildSVG(svgStructure, b64);

    console.log('✨ Encoding complete!');
    console.log(`   Total capacity used: ${withECC.length} bytes`);

    return svg;
  }

  /**
   * Build SVG with data embedded in custom attribute
   */
  buildSVG(structure, dataB64) {
    const { paths, gradients, background } = structure;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" data-tc="${dataB64}">
  <defs>`;

    // Add gradients
    if (gradients && gradients.length > 0) {
      gradients.forEach(grad => {
        const type = grad.type === 'radial' ? 'radialGradient' : 'linearGradient';
        svg += `
    <${type} id="${grad.id}">`;
        grad.stops.forEach(stop => {
          svg += `
      <stop offset="${stop.offset}" stop-color="${stop.color}" />`;
        });
        svg += `
    </${type}>`;
      });
    }

    svg += `
  </defs>

  <!-- Background -->
  <rect width="${this.width}" height="${this.height}" fill="${background}" />

  <!-- Beautiful visual paths (data hidden in data-tc attribute above) -->`;

    // Add paths
    paths.forEach((path, i) => {
      const d = this.pathDataToString(path.pathData);

      svg += `
  <path d="${d}" `;

      if (path.fill && path.fill !== 'none') {
        svg += `fill="${path.fill}" `;
      } else {
        svg += `fill="none" `;
      }

      if (path.stroke) {
        svg += `stroke="${path.stroke}" `;
      }

      if (path.strokeWidth) {
        svg += `stroke-width="${path.strokeWidth}" `;
      }

      if (path.opacity !== undefined) {
        svg += `opacity="${path.opacity}" `;
      }

      svg += `/>`
    });

    svg += `
</svg>`;

    return svg;
  }

  pathDataToString(pathData) {
    return pathData.map(cmd => {
      if (cmd.type === 'M' || cmd.type === 'L') {
        return `${cmd.type} ${cmd.x.toFixed(2)} ${cmd.y.toFixed(2)}`;
      } else if (cmd.type === 'C') {
        return `C ${cmd.x1.toFixed(2)} ${cmd.y1.toFixed(2)}, ${cmd.x2.toFixed(2)} ${cmd.y2.toFixed(2)}, ${cmd.x.toFixed(2)} ${cmd.y.toFixed(2)}`;
      }
      return '';
    }).join(' ');
  }
}
