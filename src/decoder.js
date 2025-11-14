/**
 * SVG Steganography Decoder
 * Extracts hidden data from SVG files
 */

import { CryptoLayer } from './crypto.js';
import { SteganographyChannels } from './channels.js';

export class SVGDecoder {
  constructor(visualKey = null) {
    this.visualKey = visualKey;
  }

  /**
   * Main decoding pipeline:
   * SVG → extract from 7D channels → merge → verify ECC → decrypt → decompress → DATA
   */
  decode(svgString) {
    console.log('🔍 Starting decoding pipeline...');

    // Step 1: Parse SVG
    console.log('📄 Parsing SVG...');
    const parsed = this.parseSVG(svgString);

    // Step 2: Extract from 7D channels
    console.log('🌈 Extracting from 7D channels...');
    const chunks = this.extractFromChannels(parsed);

    // Step 3: Merge chunks
    console.log('🔗 Merging channel data...');
    const merged = CryptoLayer.mergeChunks(chunks);
    console.log(`   Merged: ${merged.length} bytes`);

    // Step 4: Verify ECC
    console.log('✅ Verifying error correction...');
    let verified;
    try {
      verified = CryptoLayer.verifyECC(merged);
      console.log('   ✓ Checksum valid');
    } catch (error) {
      console.error('   ✗ Checksum failed:', error.message);
      throw new Error('Data integrity check failed');
    }

    // Step 5: Decrypt (if visual key provided)
    let decrypted = verified;
    if (this.visualKey) {
      console.log('🔓 Decrypting with visual key...');
      decrypted = CryptoLayer.decrypt(verified, this.visualKey);
    }

    // Step 6: Decompress
    console.log('📦 Decompressing data...');
    const decompressed = CryptoLayer.decompress(decrypted);

    console.log('✨ Decoding complete!');
    return decompressed;
  }

  /**
   * Parse SVG string into structured data
   */
  parseSVG(svgString) {
    const result = {
      paths: [],
      gradients: [],
      colors: [],
      transforms: [],
      animations: [],
      metadata: { chunkLengths: [] }
    };

    // Extract metadata (chunk lengths)
    const metadataMatch = svgString.match(/<!-- DATA:([\d,]+) -->/);
    if (metadataMatch) {
      result.metadata.chunkLengths = metadataMatch[1].split(',').map(Number);
    }

    // Extract paths
    const pathRegex = /<path[^>]+d="([^"]+)"[^>]*>/g;
    const opacityRegex = /opacity="([^"]+)"/;
    const fillRegex = /fill="([^"]+)"/;
    const strokeRegex = /stroke="([^"]+)"/;
    const strokeWidthRegex = /stroke-width="([^"]+)"/;
    const transformRegex = /transform="translate\(([^)]+)\)"/;

    let match;
    while ((match = pathRegex.exec(svgString)) !== null) {
      const pathTag = match[0];
      const dAttr = match[1];

      // Parse path data
      const pathData = this.parsePathData(dAttr);

      // Extract attributes
      const opacityMatch = pathTag.match(opacityRegex);
      const fillMatch = pathTag.match(fillRegex);
      const strokeMatch = pathTag.match(strokeRegex);
      const strokeWidthMatch = pathTag.match(strokeWidthRegex);
      const transformMatch = pathTag.match(transformRegex);

      result.paths.push({
        pathData,
        opacity: opacityMatch ? parseFloat(opacityMatch[1]) : 1.0,
        fill: fillMatch ? fillMatch[1] : 'none',
        stroke: strokeMatch ? strokeMatch[1] : undefined,
        strokeWidth: strokeWidthMatch ? parseFloat(strokeWidthMatch[1]) : 1
      });

      if (fillMatch && fillMatch[1].startsWith('#')) {
        result.colors.push(fillMatch[1]);
      }
      if (strokeMatch && strokeMatch[1].startsWith('#')) {
        result.colors.push(strokeMatch[1]);
      }

      if (transformMatch) {
        const [tx, ty] = transformMatch[1].split(/\s+/).map(parseFloat);
        result.transforms.push({ tx, ty, rotation: 0 });
      }
    }

    // Extract gradients
    const gradientRegex = /<(?:linearGradient|radialGradient)[^>]+id="([^"]+)"[^>]*>([\s\S]*?)<\/(?:linearGradient|radialGradient)>/g;
    while ((match = gradientRegex.exec(svgString)) !== null) {
      const id = match[1];
      const content = match[2];
      const stops = [];

      const stopRegex = /<stop\s+offset="([^"]+)"\s+stop-color="([^"]+)"/g;
      let stopMatch;
      while ((stopMatch = stopRegex.exec(content)) !== null) {
        stops.push({
          offset: parseFloat(stopMatch[1]),
          color: stopMatch[2]
        });
      }

      result.gradients.push({ id, stops });
    }

    // Extract animations
    const animRegex = /<animate[^>]+begin="([^"]+)"[^>]+dur="([^"]+)"/g;
    while ((match = animRegex.exec(svgString)) !== null) {
      result.animations.push({
        begin: parseFloat(match[1]),
        dur: parseFloat(match[2])
      });
    }

    return result;
  }

  /**
   * Parse SVG path data string into structured format
   */
  parsePathData(d) {
    const pathData = [];
    const commands = d.match(/[MLCQZ][^MLCQZ]*/g) || [];

    commands.forEach(cmd => {
      const type = cmd[0];
      const coords = cmd.slice(1).trim().split(/[\s,]+/).map(parseFloat);

      if (type === 'M' || type === 'L') {
        pathData.push({ type, x: coords[0], y: coords[1] });
      } else if (type === 'C') {
        pathData.push({
          type,
          x1: coords[0],
          y1: coords[1],
          x2: coords[2],
          y2: coords[3],
          x: coords[4],
          y: coords[5]
        });
      }
    });

    return pathData;
  }

  /**
   * Extract data from all 7 steganographic channels
   */
  extractFromChannels(parsed) {
    const chunks = [];
    const lengths = parsed.metadata.chunkLengths;

    // Channel 1: Path coordinates
    const allPathData = parsed.paths.flatMap(p => p.pathData);
    if (allPathData.length > 0 && lengths[0] > 0) {
      const extracted = SteganographyChannels.extractFromCoords(allPathData);
      chunks[0] = extracted.slice(0, lengths[0]);
      console.log(`   Ch1 (Coords): ${chunks[0].length} bytes`);
    } else {
      chunks[0] = new Uint8Array(0);
    }

    // Channel 2: RGB colors
    if (parsed.colors.length > 0 && lengths[1] > 0) {
      const extracted = SteganographyChannels.extractFromRGB(parsed.colors);
      chunks[1] = extracted.slice(0, lengths[1]);
      console.log(`   Ch2 (RGB): ${chunks[1].length} bytes`);
    } else {
      chunks[1] = new Uint8Array(0);
    }

    // Channel 3: Opacity
    const opacities = parsed.paths.map(p => p.opacity);
    if (opacities.length > 0 && lengths[2] > 0) {
      const extracted = SteganographyChannels.extractFromAlpha(opacities, 1.0);
      chunks[2] = extracted.slice(0, lengths[2]);
      console.log(`   Ch3 (Alpha): ${chunks[2].length} bytes`);
    } else {
      chunks[2] = new Uint8Array(0);
    }

    // Channel 4: Transforms
    if (parsed.transforms.length > 0 && lengths[3] > 0) {
      const extracted = SteganographyChannels.extractFromTransform(parsed.transforms);
      chunks[3] = extracted.slice(0, lengths[3]);
      console.log(`   Ch4 (Transform): ${chunks[3].length} bytes`);
    } else {
      chunks[3] = new Uint8Array(0);
    }

    // Channel 5: Gradients
    if (parsed.gradients.length > 0 && lengths[4] > 0) {
      const allStops = parsed.gradients.flatMap(g => g.stops);
      const extracted = SteganographyChannels.extractFromGradient(allStops);
      chunks[4] = extracted.slice(0, lengths[4]);
      console.log(`   Ch5 (Gradient): ${chunks[4].length} bytes`);
    } else {
      chunks[4] = new Uint8Array(0);
    }

    // Channel 6: Stroke widths
    const strokeWidths = parsed.paths.map(p => p.strokeWidth);
    if (strokeWidths.length > 0 && lengths[5] > 0) {
      const extracted = SteganographyChannels.extractFromStroke(strokeWidths, 2);
      chunks[5] = extracted.slice(0, lengths[5]);
      console.log(`   Ch6 (Stroke): ${chunks[5].length} bytes`);
    } else {
      chunks[5] = new Uint8Array(0);
    }

    // Channel 7: Animations
    if (parsed.animations.length > 0 && lengths[6] > 0) {
      const extracted = SteganographyChannels.extractFromTiming(parsed.animations, 0, 2);
      chunks[6] = extracted.slice(0, lengths[6]);
      console.log(`   Ch7 (Timing): ${chunks[6].length} bytes`);
    } else {
      chunks[6] = new Uint8Array(0);
    }

    return chunks;
  }
}
