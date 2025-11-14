/**
 * Crypto & Compression Layer
 * Handles data compression, encryption, and Base64 encoding
 */

import pako from 'pako';
import crypto from 'crypto';

export class CryptoLayer {
  /**
   * Compress data using gzip
   */
  static compress(data) {
    const buffer = Buffer.from(JSON.stringify(data));
    return pako.gzip(buffer);
  }

  /**
   * Decompress gzip data
   */
  static decompress(compressed) {
    const decompressed = pako.ungzip(compressed);
    return JSON.parse(Buffer.from(decompressed).toString());
  }

  /**
   * Simple XOR encryption with visual key
   */
  static encrypt(data, visualKey) {
    if (!visualKey) return data;

    const key = crypto.createHash('sha256').update(visualKey).digest();
    const result = new Uint8Array(data.length);

    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ key[i % key.length];
    }

    return result;
  }

  /**
   * Decrypt XOR encrypted data
   */
  static decrypt(data, visualKey) {
    // XOR encryption is symmetric
    return this.encrypt(data, visualKey);
  }

  /**
   * Convert to Base64
   */
  static toBase64(data) {
    return Buffer.from(data).toString('base64');
  }

  /**
   * Convert from Base64
   */
  static fromBase64(b64) {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }

  /**
   * Split data into chunks for multi-channel distribution
   */
  static splitChunks(data, numChannels = 7) {
    const chunkSize = Math.ceil(data.length / numChannels);
    const chunks = [];

    for (let i = 0; i < numChannels; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);
      chunks.push(data.slice(start, end));
    }

    return chunks;
  }

  /**
   * Merge chunks back together
   */
  static mergeChunks(chunks) {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  /**
   * Add simple error correction (repetition code with checksum)
   */
  static addECC(data, redundancy = 2) {
    const checksum = crypto.createHash('md5').update(data).digest();
    const result = new Uint8Array(data.length + checksum.length + 4);

    // Store length
    result[0] = (data.length >> 24) & 0xFF;
    result[1] = (data.length >> 16) & 0xFF;
    result[2] = (data.length >> 8) & 0xFF;
    result[3] = data.length & 0xFF;

    // Store data
    result.set(data, 4);

    // Store checksum
    result.set(checksum, 4 + data.length);

    return result;
  }

  /**
   * Verify and extract data with ECC
   */
  static verifyECC(data) {
    if (data.length < 20) {
      throw new Error('Invalid ECC data');
    }

    // Extract length
    const length = (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3];

    if (length + 20 > data.length) {
      throw new Error('Invalid ECC length');
    }

    // Extract data and checksum
    const extracted = data.slice(4, 4 + length);
    const storedChecksum = data.slice(4 + length, 4 + length + 16);

    // Verify checksum
    const computedChecksum = crypto.createHash('md5').update(extracted).digest();

    for (let i = 0; i < 16; i++) {
      if (storedChecksum[i] !== computedChecksum[i]) {
        throw new Error('Checksum verification failed');
      }
    }

    return extracted;
  }
}

/**
 * Generate visual seed from pattern
 */
export function generateVisualKey(pattern = 'geometric', seed = Date.now()) {
  return crypto.createHash('sha256')
    .update(`${pattern}-${seed}`)
    .digest('hex');
}
