/**
 * Robust SVG Steganography Decoder
 * Extracts data from custom attributes
 */

import { CryptoLayer } from './crypto.js';

export class SVGDecoderRobust {
  constructor(visualKey = null) {
    this.visualKey = visualKey;
  }

  /**
   * Decode data from SVG
   */
  decode(svgString) {
    console.log('🔍 Starting decoding pipeline...');

    // Step 1: Extract data from custom attribute
    console.log('📄 Extracting data from SVG...');
    const dataMatch = svgString.match(/data-tc="([^"]+)"/);

    if (!dataMatch) {
      throw new Error('No embedded data found in SVG');
    }

    const b64 = dataMatch[1];

    // Step 2: Decode from base64
    const withECC = CryptoLayer.fromBase64(b64);
    console.log(`   Extracted: ${withECC.length} bytes`);

    // Step 3: Verify ECC
    console.log('✅ Verifying error correction...');
    let verified;
    try {
      verified = CryptoLayer.verifyECC(withECC);
      console.log('   ✓ Checksum valid');
    } catch (error) {
      console.error('   ✗ Checksum failed:', error.message);
      throw new Error('Data integrity check failed');
    }

    // Step 4: Decrypt (if visual key provided)
    let decrypted = verified;
    if (this.visualKey) {
      console.log('🔓 Decrypting with visual key...');
      decrypted = CryptoLayer.decrypt(verified, this.visualKey);
    }

    // Step 5: Decompress
    console.log('📦 Decompressing data...');
    const decompressed = CryptoLayer.decompress(decrypted);

    console.log('✨ Decoding complete!');
    return decompressed;
  }
}
