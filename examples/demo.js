/**
 * Timecode SVG Steganography Demo
 * Demonstrates encoding and decoding data in beautiful SVG images
 */

import Timecode from '../src/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create output directory
const outputDir = path.join(__dirname, '../output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     TIMECODE SVG STEGANOGRAPHY SYSTEM - DEMO              ║');
console.log('║     Hide data in beautiful vector graphics                ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Demo 1: Simple text encoding
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 Demo 1: Simple Text Message');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const message = {
  title: 'Secret Message',
  content: 'This is hidden data embedded in a beautiful SVG!',
  timestamp: new Date().toISOString(),
  from: 'Timecode System'
};

console.log('Original data:', message);

const T1 = new Timecode({ style: 'geometric', width: 600, height: 600 });
const svg1 = T1.enc(message, 'geometric');

fs.writeFileSync(path.join(outputDir, 'demo1_geometric.svg'), svg1);
console.log('\n✅ Encoded SVG saved to: output/demo1_geometric.svg');

const decoded1 = T1.dec(svg1);
console.log('Decoded data:', decoded1);
console.log('✓ Match:', JSON.stringify(message) === JSON.stringify(decoded1));

// Demo 2: Different artistic styles
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎨 Demo 2: Different Artistic Styles');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const secretData = {
  api_key: 'sk-1234567890abcdef',
  endpoint: 'https://api.example.com',
  config: { timeout: 5000, retries: 3 }
};

const styles = ['geometric', 'organic', 'logo', 'qr-hybrid'];
const T2 = new Timecode({ width: 800, height: 800 });

styles.forEach((style, i) => {
  console.log(`\n${i + 1}. ${style.toUpperCase()} style:`);
  const svg = T2.enc(secretData, style);
  const filename = `demo2_${style}.svg`;
  fs.writeFileSync(path.join(outputDir, filename), svg);
  console.log(`   ✅ Saved: output/${filename}`);

  const decoded = T2.dec(svg);
  console.log(`   ✓ Decoded successfully:`, decoded.api_key.substring(0, 10) + '...');
});

// Demo 3: Encryption with visual key
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔐 Demo 3: Encrypted Encoding');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const sensitiveData = {
  username: 'admin',
  password: 'super_secret_password_123',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  permissions: ['read', 'write', 'delete']
};

const visualKey = Timecode.generateKey('secure-pattern', 42);
console.log('Visual Key:', visualKey.substring(0, 32) + '...');

const T3 = new Timecode({ visualKey });
const encryptedSVG = T3.enc(sensitiveData, 'organic');

fs.writeFileSync(path.join(outputDir, 'demo3_encrypted.svg'), encryptedSVG);
console.log('✅ Encrypted SVG saved: output/demo3_encrypted.svg');

// Try decoding without key (should fail)
try {
  const T3_nokey = new Timecode();
  const decoded_nokey = T3_nokey.dec(encryptedSVG);
  console.log('⚠️  Decoded without key (corrupted):', decoded_nokey);
} catch (error) {
  console.log('✓ Decoding without key failed (as expected)');
}

// Decode with correct key
const decoded3 = T3.dec(encryptedSVG);
console.log('✅ Decoded with correct key:', decoded3);

// Demo 4: Code embedding
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚡ Demo 4: Executable Code Embedding');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const hiddenCode = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = Array.from({ length: 10 }, (_, i) => fibonacci(i));
console.log('Fibonacci sequence:', result);
result;
`;

const T4 = new Timecode();
const codeSVG = T4.encodeExecutable(hiddenCode, 'logo');

fs.writeFileSync(path.join(outputDir, 'demo4_executable.svg'), codeSVG);
console.log('✅ Code embedded in SVG: output/demo4_executable.svg');

const extractedCode = T4.decodeAndExecute(codeSVG, true); // Safe mode
console.log('\nExtracted code:');
console.log(extractedCode);

// Demo 5: Large data encoding
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Demo 5: Large Dataset Encoding');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const largeData = {
  users: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    roles: ['viewer', 'editor'],
    metadata: { created: Date.now(), active: true }
  })),
  settings: {
    theme: 'dark',
    language: 'en',
    notifications: true,
    features: ['feature1', 'feature2', 'feature3']
  }
};

console.log(`Original data size: ${JSON.stringify(largeData).length} characters`);

const T5 = new Timecode({ width: 1200, height: 1200 });
const largeSVG = T5.enc(largeData, 'qr-hybrid');

fs.writeFileSync(path.join(outputDir, 'demo5_large.svg'), largeSVG);
console.log('✅ Large dataset encoded: output/demo5_large.svg');
console.log(`   SVG size: ${largeSVG.length} characters`);

const decoded5 = T5.dec(largeSVG);
console.log(`✅ Decoded ${decoded5.users.length} users successfully`);

// Demo 6: Capacity estimation
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📏 Demo 6: Capacity Estimation');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

['geometric', 'organic', 'logo', 'qr-hybrid'].forEach(style => {
  const capacity = Timecode.estimateCapacity(style, 800, 800);
  console.log(`\n${style.toUpperCase()}:`);
  console.log(`   Dimensions: ${capacity.dimensions}`);
  console.log(`   Estimated capacity: ${capacity.estimatedCapacityKB} KB`);
  console.log(`   Channels: ${capacity.channels}D encoding`);
  console.log(`   Compression: ${capacity.compression}`);
});

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                    DEMO COMPLETE                          ║');
console.log('║   Check the output/ directory for generated SVG files    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
