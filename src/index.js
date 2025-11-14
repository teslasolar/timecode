/**
 * Timecode SVG Steganography System
 * Main API for encoding and decoding data in SVG files
 *
 * TIMECODE::STEGSVG - Hide data in beautiful vector graphics
 * Uses 7D multi-channel encoding: X, Y, Z, T, C, A, F
 */

import { SVGEncoderRobust as SVGEncoder } from './encoder-robust.js';
import { SVGDecoderRobust as SVGDecoder } from './decoder-robust.js';
import { generateVisualKey } from './crypto.js';

/**
 * Timecode SVG Steganography Class
 */
export class Timecode {
  constructor(options = {}) {
    this.options = {
      width: options.width || 800,
      height: options.height || 800,
      style: options.style || 'geometric', // geometric, organic, logo, qr-hybrid
      visualKey: options.visualKey || null,
      seed: options.seed || Date.now()
    };
  }

  /**
   * Encode data into an SVG
   * @param {Object|String} data - Data to encode (will be JSON stringified if object)
   * @param {String} style - Visual style: 'geometric', 'organic', 'logo', 'qr-hybrid'
   * @param {String} visualKey - Optional encryption key
   * @returns {String} SVG string with embedded data
   */
  enc(data, style = null, visualKey = null) {
    const encoder = new SVGEncoder({
      width: this.options.width,
      height: this.options.height,
      style: style || this.options.style,
      visualKey: visualKey || this.options.visualKey,
      seed: this.options.seed
    });

    return encoder.encode(data);
  }

  /**
   * Decode data from an SVG
   * @param {String} svg - SVG string containing hidden data
   * @param {String} visualKey - Optional decryption key (must match encoding key)
   * @returns {Object|String} Decoded data
   */
  dec(svg, visualKey = null) {
    const decoder = new SVGDecoder(visualKey || this.options.visualKey);
    return decoder.decode(svg);
  }

  /**
   * Encode and execute code hidden in SVG
   * @param {String} code - JavaScript code to hide and execute
   * @param {String} style - Visual style
   * @returns {String} SVG with hidden executable code
   */
  encodeExecutable(code, style = 'geometric') {
    const data = {
      type: 'executable',
      code: code,
      timestamp: Date.now()
    };

    return this.enc(data, style);
  }

  /**
   * Decode and execute code from SVG
   * @param {String} svg - SVG containing hidden code
   * @param {Boolean} safeMode - If true, return code without executing
   * @returns {*} Result of code execution or code string if safeMode
   */
  decodeAndExecute(svg, safeMode = true) {
    const data = this.dec(svg);

    if (data.type === 'executable') {
      if (safeMode) {
        console.log('🔒 Safe mode: Returning code without execution');
        return data.code;
      } else {
        console.log('⚡ Executing hidden code...');
        // In a real implementation, use a sandboxed environment
        return eval(data.code);
      }
    }

    return data;
  }

  /**
   * Generate a visual key from pattern and seed
   * @param {String} pattern - Pattern name
   * @param {Number} seed - Random seed
   * @returns {String} Visual key hash
   */
  static generateKey(pattern = 'geometric', seed = Date.now()) {
    return generateVisualKey(pattern, seed);
  }

  /**
   * Get capacity estimate for given SVG parameters
   * @param {String} style - Visual style
   * @param {Number} width - SVG width
   * @param {Number} height - SVG height
   * @returns {Object} Capacity information
   */
  static estimateCapacity(style = 'geometric', width = 800, height = 800) {
    const baseCapacity = {
      geometric: 5000,  // bytes
      organic: 4000,
      logo: 2000,
      'qr-hybrid': 8000
    };

    const scaleFactor = (width * height) / (800 * 800);
    const estimated = Math.floor(baseCapacity[style] * scaleFactor);

    return {
      style,
      dimensions: `${width}x${height}`,
      estimatedCapacity: estimated,
      estimatedCapacityKB: (estimated / 1024).toFixed(2),
      channels: 7,
      compression: 'gzip',
      encryption: 'XOR + visual key'
    };
  }
}

// Export all components for advanced usage
export { SVGEncoder } from './encoder.js';
export { SVGDecoder } from './decoder.js';
export { SteganographyChannels } from './channels.js';
export { CryptoLayer, generateVisualKey } from './crypto.js';
export { SVGGenerator } from './svg-generator.js';

// Default export
export default Timecode;
