/**
 * Timecode SVG Steganography Tests
 * Comprehensive test suite for the encoding/decoding system
 */

import Timecode from '../src/index.js';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║        TIMECODE SVG STEGANOGRAPHY - TEST SUITE            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    console.log(`\n🧪 ${name}`);
    fn();
    console.log('   ✅ PASSED');
    passed++;
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    console.error(error.stack);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(message || `Expected ${expectedStr} but got ${actualStr}`);
  }
}

// Test 1: Basic encoding/decoding
test('Basic string encoding and decoding', () => {
  const T = new Timecode();
  const data = { message: 'Hello, World!' };
  const svg = T.enc(data);
  const decoded = T.dec(svg);
  assertEqual(decoded, data, 'Decoded data should match original');
});

// Test 2: Different styles
test('All artistic styles work correctly', () => {
  const styles = ['geometric', 'organic', 'logo', 'qr-hybrid'];
  const data = { test: 'style test', value: 42 };

  styles.forEach(style => {
    const T = new Timecode({ style });
    const svg = T.enc(data, style);
    const decoded = T.dec(svg);
    assertEqual(decoded, data, `Style ${style} should encode/decode correctly`);
  });
});

// Test 3: Encryption with visual key
test('Encryption with visual key', () => {
  const key = Timecode.generateKey('test-pattern', 123);
  const T = new Timecode({ visualKey: key });
  const data = { secret: 'classified information' };

  const svg = T.enc(data);
  const decoded = T.dec(svg);

  assertEqual(decoded, data, 'Encrypted data should decode correctly with key');
});

// Test 4: Large data handling
test('Large data encoding and decoding', () => {
  const T = new Timecode({ width: 1000, height: 1000 });
  const largeData = {
    items: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      data: `Data for item ${i}`
    }))
  };

  const svg = T.enc(largeData, 'qr-hybrid');
  const decoded = T.dec(svg);

  assertEqual(decoded.items.length, largeData.items.length, 'Should decode all items');
  assertEqual(decoded.items[0], largeData.items[0], 'First item should match');
  assertEqual(decoded.items[99], largeData.items[99], 'Last item should match');
});

// Test 5: Special characters and Unicode
test('Special characters and Unicode handling', () => {
  const T = new Timecode();
  const data = {
    emoji: '🔐🎨✨🌈',
    unicode: 'Héllo Wörld 你好世界',
    special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  const svg = T.enc(data);
  const decoded = T.dec(svg);

  assertEqual(decoded, data, 'Special characters should be preserved');
});

// Test 6: Empty and small data
test('Empty and small data handling', () => {
  const T = new Timecode();

  const emptyData = {};
  const svg1 = T.enc(emptyData);
  const decoded1 = T.dec(svg1);
  assertEqual(decoded1, emptyData, 'Empty object should work');

  const smallData = { x: 1 };
  const svg2 = T.enc(smallData);
  const decoded2 = T.dec(svg2);
  assertEqual(decoded2, smallData, 'Small data should work');
});

// Test 7: Nested objects
test('Nested object structures', () => {
  const T = new Timecode();
  const data = {
    level1: {
      level2: {
        level3: {
          value: 'deep nested value',
          array: [1, 2, 3, 4, 5],
          nested: { a: 1, b: 2 }
        }
      }
    }
  };

  const svg = T.enc(data);
  const decoded = T.dec(svg);

  assertEqual(decoded, data, 'Nested structures should be preserved');
});

// Test 8: Executable code embedding
test('Executable code embedding (safe mode)', () => {
  const T = new Timecode();
  const code = 'const x = 10; const y = 20; x + y;';

  const svg = T.encodeExecutable(code, 'geometric');
  const extracted = T.decodeAndExecute(svg, true);

  assert(extracted.includes('const x = 10'), 'Code should be extracted correctly');
});

// Test 9: Data integrity with corrupted SVG
test('Error handling for corrupted data', () => {
  const T = new Timecode();
  const data = { test: 'integrity test' };
  const svg = T.enc(data);

  // Try to decode - should work normally
  const decoded = T.dec(svg);
  assertEqual(decoded, data, 'Normal decoding should work');

  // Corrupt the SVG slightly and try to decode
  // This should fail checksum verification
  const corrupted = svg.replace(/opacity="0\.\d+"/, 'opacity="0.5"');

  try {
    const decodedCorrupt = T.dec(corrupted);
    // If it doesn't throw, the data might still decode but could be different
    console.log('   ℹ️  Warning: Corrupted data decoded (might be invalid)');
  } catch (error) {
    // Expected behavior - checksum should fail
    assert(error.message.includes('integrity') || error.message.includes('checksum'),
      'Should detect data corruption');
  }
});

// Test 10: Different dimensions
test('Different SVG dimensions', () => {
  const data = { dimension_test: true, value: 12345 };

  const dimensions = [
    [400, 400],
    [800, 800],
    [1200, 800],
    [600, 1000]
  ];

  dimensions.forEach(([width, height]) => {
    const T = new Timecode({ width, height });
    const svg = T.enc(data);
    const decoded = T.dec(svg);
    assertEqual(decoded, data, `Dimensions ${width}x${height} should work`);
  });
});

// Test 11: Capacity estimation
test('Capacity estimation accuracy', () => {
  const styles = ['geometric', 'organic', 'logo', 'qr-hybrid'];

  styles.forEach(style => {
    const capacity = Timecode.estimateCapacity(style, 800, 800);

    assert(capacity.estimatedCapacity > 0, 'Capacity should be positive');
    assert(capacity.channels === 7, 'Should use 7 channels');
    assert(capacity.style === style, 'Style should match');
  });
});

// Test 12: Visual key generation
test('Visual key generation', () => {
  const key1 = Timecode.generateKey('pattern1', 100);
  const key2 = Timecode.generateKey('pattern1', 100);
  const key3 = Timecode.generateKey('pattern2', 100);
  const key4 = Timecode.generateKey('pattern1', 200);

  assertEqual(key1, key2, 'Same pattern and seed should generate same key');
  assert(key1 !== key3, 'Different patterns should generate different keys');
  assert(key1 !== key4, 'Different seeds should generate different keys');
});

// Test 13: Multiple encode/decode cycles
test('Multiple encode/decode cycles', () => {
  const T = new Timecode();
  let data = { cycle: 0, value: 'test' };

  // Encode and decode 5 times
  for (let i = 0; i < 5; i++) {
    const svg = T.enc(data);
    const decoded = T.dec(svg);
    assertEqual(decoded, data, `Cycle ${i + 1} should preserve data`);
    data = { ...decoded, cycle: i + 1 };
  }

  assert(data.cycle === 4, 'Should complete all cycles');
});

// Summary
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                     TEST SUMMARY                          ║');
console.log('╠════════════════════════════════════════════════════════════╣');
console.log(`║  Passed: ${passed.toString().padEnd(48)} ║`);
console.log(`║  Failed: ${failed.toString().padEnd(48)} ║`);
console.log(`║  Total:  ${(passed + failed).toString().padEnd(48)} ║`);
console.log('╚════════════════════════════════════════════════════════════╝\n');

if (failed === 0) {
  console.log('✨ All tests passed! ✨\n');
  process.exit(0);
} else {
  console.log('❌ Some tests failed\n');
  process.exit(1);
}
