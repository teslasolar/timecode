/**
 * SVG Steganography Encoder
 * Embeds data into SVG using multi-channel 7D encoding
 */

import { CryptoLayer } from './crypto.js';
import { SteganographyChannels } from './channels.js';
import { SVGGenerator } from './svg-generator.js';

export class SVGEncoder {
  constructor(options = {}) {
    this.width = options.width || 800;
    this.height = options.height || 800;
    this.style = options.style || 'geometric';
    this.visualKey = options.visualKey || null;
    this.seed = options.seed || Date.now();
  }

  /**
   * Main encoding pipeline:
   * DATA → compress → encrypt → ECC → split → distribute across 7D channels → SVG
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

    // Step 4: Split into 7 chunks for 7D channels
    console.log('✂️  Splitting into 7 channels...');
    const chunks = CryptoLayer.splitChunks(withECC, 7);

    // Step 5: Generate SVG structure
    console.log(`🎨 Generating ${this.style} SVG...`);
    const generator = new SVGGenerator(this.width, this.height, this.style, this.seed);
    const svgStructure = generator.generate(withECC.length);

    // Step 6: Distribute data across 7D channels
    console.log('🌈 Distributing across 7D channels...');
    const encoded = this.distributeAcrossChannels(svgStructure, chunks);

    // Step 7: Build final SVG
    console.log('🏗️  Building final SVG...');
    const svg = this.buildSVG(encoded);

    console.log('✨ Encoding complete!');
    console.log(`   Total capacity used: ${withECC.length} bytes`);

    return svg;
  }

  /**
   * Distribute data chunks across 7 steganographic channels
   */
  distributeAcrossChannels(svgStructure, chunks) {
    const result = { ...svgStructure };

    // Store chunk lengths as metadata
    result.metadata = {
      chunkLengths: chunks.map(c => c.length)
    };

    // Channel 1: Path coordinates (X, Y)
    if (chunks[0] && chunks[0].length > 0) {
      const allPathData = svgStructure.paths.flatMap(p => p.pathData);
      const { result: newPathData } = SteganographyChannels.hideInCoords(
        allPathData,
        chunks[0]
      );

      // Redistribute back to paths
      let offset = 0;
      result.paths = svgStructure.paths.map(path => {
        const pathLen = path.pathData.length;
        const newData = newPathData.slice(offset, offset + pathLen);
        offset += pathLen;
        return { ...path, pathData: newData };
      });
    }

    // Channel 2: RGB colors (C)
    if (chunks[1] && chunks[1].length > 0) {
      const { result: newColors } = SteganographyChannels.hideInRGB(
        svgStructure.colors,
        chunks[1]
      );
      result.colors = newColors;

      // Update path colors
      result.paths = result.paths.map((path, i) => ({
        ...path,
        fill: path.fill !== 'none' ? newColors[i % newColors.length] : 'none',
        stroke: path.stroke ? newColors[i % newColors.length] : undefined
      }));
    }

    // Channel 3: Opacity/Alpha (A)
    if (chunks[2] && chunks[2].length > 0) {
      const opacities = SteganographyChannels.hideInAlpha(1.0, chunks[2]);
      result.paths = result.paths.map((path, i) => ({
        ...path,
        opacity: i < opacities.length ? opacities[i] : path.opacity
      }));
    }

    // Channel 4: Transform matrices (R - rotation/transform)
    if (chunks[3] && chunks[3].length > 0) {
      const baseTransforms = result.paths.map((_, i) => ({
        tx: 0,
        ty: 0,
        rotation: 0
      }));
      const { result: transforms } = SteganographyChannels.hideInTransform(
        baseTransforms,
        chunks[3]
      );
      result.transforms = transforms;
    }

    // Channel 5: Gradient stops (F - frequency via gradient positions)
    if (chunks[4] && chunks[4].length > 0 && result.gradients.length > 0) {
      result.gradients = result.gradients.map((grad, i) => {
        const chunkSlice = chunks[4].slice(i * 10, (i + 1) * 10);
        if (chunkSlice.length > 0) {
          const stops = SteganographyChannels.hideInGradient(
            Math.max(3, chunkSlice.length),
            chunkSlice
          );
          return { ...grad, stops };
        }
        return grad;
      });
    }

    // Channel 6: Stroke widths
    if (chunks[5] && chunks[5].length > 0) {
      const strokeWidths = SteganographyChannels.hideInStroke(2, chunks[5]);
      result.paths = result.paths.map((path, i) => ({
        ...path,
        strokeWidth: i < strokeWidths.length ? strokeWidths[i] : path.strokeWidth
      }));
    }

    // Channel 7: Animation timing (T)
    if (chunks[6] && chunks[6].length > 0) {
      result.animations = SteganographyChannels.hideInTiming(0, 2, chunks[6]);
    }

    return result;
  }

  /**
   * Build final SVG string from encoded structure
   */
  buildSVG(encoded) {
    const { paths, gradients, background, transforms, animations, metadata } = encoded;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}">
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

  <!-- Metadata (chunk lengths encoded in comment) -->
  <!-- DATA:${metadata.chunkLengths.join(',')} -->

  <!-- Paths with embedded data -->`;

    // Add paths
    paths.forEach((path, i) => {
      const d = this.pathDataToString(path.pathData);
      const transform = transforms && transforms[i]
        ? `transform="translate(${transforms[i].tx} ${transforms[i].ty})"`
        : '';

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

      svg += transform;

      svg += `>`;

      // Add animations if present
      if (animations && animations[i]) {
        const anim = animations[i];
        svg += `
    <animate attributeName="opacity"
             begin="${anim.begin}s"
             dur="${anim.dur}s"
             values="${path.opacity};${path.opacity * 0.5};${path.opacity}"
             repeatCount="indefinite" />`;
      }

      svg += `
  </path>`;
    });

    svg += `
</svg>`;

    return svg;
  }

  /**
   * Convert pathData array to SVG path string
   */
  pathDataToString(pathData) {
    return pathData.map(cmd => {
      if (cmd.type === 'M' || cmd.type === 'L') {
        return `${cmd.type} ${cmd.x} ${cmd.y}`;
      } else if (cmd.type === 'C') {
        return `C ${cmd.x1} ${cmd.y1}, ${cmd.x2} ${cmd.y2}, ${cmd.x} ${cmd.y}`;
      }
      return '';
    }).join(' ');
  }
}
