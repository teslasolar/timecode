# TIMECODE::STEGSVG

> **Hide data in beautiful vector graphics using 7D multi-channel steganography**

A sophisticated SVG steganography system that embeds data (including executable code) into visually appealing SVG images using multi-dimensional encoding across 7 steganographic channels.

```
DATA → compress → encrypt → distribute[7D] → SVG
SVG  → extract[7D] → merge → decrypt → decompress → DATA
```

## 🌈 Features

- **7D Multi-Channel Encoding**: Distribute data across 7 dimensions:
  - **X, Y**: Position coordinates with micro-precision LSB
  - **Z**: Layer information via transform matrices
  - **T**: Time domain via animation timing
  - **C**: Color channels with RGB LSB manipulation
  - **A**: Alpha/opacity variations
  - **F**: Frequency patterns in gradients
  - **R**: Rotation and transform parameters

- **Artistic Styles**:
  - `geometric` - Abstract shapes and patterns
  - `organic` - Flowing curves and natural forms
  - `logo` - Clean, modern iconic designs
  - `qr-hybrid` - QR code aesthetics with artistic flair

- **Security**:
  - Gzip compression for efficiency
  - XOR encryption with visual key
  - Error correction codes (ECC)
  - Checksum verification

- **Capacity**: 1KB - 10MB+ depending on SVG complexity and dimensions

## 📦 Installation

```bash
npm install
```

## 🚀 Quick Start

### Basic Usage

```javascript
import Timecode from './src/index.js';

// Create instance
const T = new Timecode({
  style: 'geometric',  // or 'organic', 'logo', 'qr-hybrid'
  width: 800,
  height: 800
});

// Encode data
const data = { secret: 'Hidden message!', timestamp: Date.now() };
const svg = T.enc(data, 'geometric');

// Decode data
const decoded = T.dec(svg);
console.log(decoded); // { secret: 'Hidden message!', timestamp: ... }
```

### With Encryption

```javascript
import Timecode from './src/index.js';

// Generate visual key
const visualKey = Timecode.generateKey('my-pattern', 42);

// Encode with encryption
const T = new Timecode({ visualKey });
const encryptedSVG = T.enc({ password: 'super_secret' }, 'organic');

// Decode with key
const decoded = T.dec(encryptedSVG);
```

### Executable Code

```javascript
import Timecode from './src/index.js';

const T = new Timecode();

// Hide executable code in SVG
const code = `
  function greet(name) {
    return \`Hello, \${name}!\`;
  }
  greet('World');
`;

const svg = T.encodeExecutable(code, 'logo');

// Extract code (safe mode - doesn't execute)
const extracted = T.decodeAndExecute(svg, true);
console.log(extracted); // The code as string
```

## 🎨 Artistic Styles

### Geometric
Abstract geometric shapes and polygons with vibrant colors.
- **Capacity**: ~5KB (800x800)
- **Best for**: Technical data, configurations

### Organic
Flowing Bezier curves mimicking natural patterns.
- **Capacity**: ~4KB (800x800)
- **Best for**: Artistic applications, logos

### Logo
Clean, minimal iconic designs.
- **Capacity**: ~2KB (800x800)
- **Best for**: Branding, compact data

### QR-Hybrid
Grid-based design with QR code aesthetics.
- **Capacity**: ~8KB (800x800)
- **Best for**: Maximum data density

## 📊 API Reference

### `new Timecode(options)`

Create a new Timecode instance.

**Options:**
- `width` (number): SVG width (default: 800)
- `height` (number): SVG height (default: 800)
- `style` (string): Default style (default: 'geometric')
- `visualKey` (string): Encryption key (default: null)
- `seed` (number): Random seed (default: Date.now())

### `T.enc(data, style, visualKey)`

Encode data into SVG.

**Parameters:**
- `data` (any): Data to encode (will be JSON serialized)
- `style` (string): Visual style (optional)
- `visualKey` (string): Encryption key (optional)

**Returns:** SVG string

### `T.dec(svg, visualKey)`

Decode data from SVG.

**Parameters:**
- `svg` (string): SVG string
- `visualKey` (string): Decryption key (must match encoding key)

**Returns:** Decoded data

### `T.encodeExecutable(code, style)`

Encode executable JavaScript code.

**Parameters:**
- `code` (string): JavaScript code
- `style` (string): Visual style

**Returns:** SVG string

### `T.decodeAndExecute(svg, safeMode)`

Decode and optionally execute code.

**Parameters:**
- `svg` (string): SVG containing code
- `safeMode` (boolean): If true, return code without executing (default: true)

**Returns:** Extracted code or execution result

### `Timecode.generateKey(pattern, seed)`

Generate visual key for encryption.

**Parameters:**
- `pattern` (string): Pattern name
- `seed` (number): Random seed

**Returns:** SHA-256 hash string

### `Timecode.estimateCapacity(style, width, height)`

Estimate encoding capacity.

**Parameters:**
- `style` (string): Visual style
- `width` (number): SVG width
- `height` (number): SVG height

**Returns:** Capacity information object

## 🧪 Running Examples

### Demo
```bash
npm run demo
```

Generates example SVGs in the `output/` directory demonstrating:
1. Simple text encoding
2. All artistic styles
3. Encrypted encoding
4. Executable code
5. Large datasets
6. Capacity estimation

### Tests
```bash
npm test
```

Runs comprehensive test suite covering:
- Basic encoding/decoding
- All artistic styles
- Encryption
- Large data handling
- Unicode and special characters
- Error handling
- Data integrity

## 🔧 Technical Details

### Encoding Pipeline

```
DATA
  ↓
[Compress: gzip]
  ↓
[Encrypt: XOR with visual key (optional)]
  ↓
[Add ECC: MD5 checksum + length header]
  ↓
[Split: Distribute into 7 chunks]
  ↓
[Hide: Embed across 7D channels]
  ↓
SVG
```

### 7D Channel Distribution

1. **Path Coordinates (X, Y)**: LSB encoding in SVG path data with micro-precision (±0.001)
2. **RGB Colors (C)**: 2 bits per channel in least significant bits of hex colors
3. **Opacity (A)**: Variations between 0.95-1.0 encode byte values
4. **Transforms (R, Z)**: Translation parameters in transform matrices
5. **Gradients (F)**: Stop positions encode frequency patterns
6. **Stroke Width**: Micro-variations in stroke widths
7. **Animation Timing (T)**: Duration and begin times encode temporal data

### Steganographic Techniques

- **LSB (Least Significant Bit)**: Modify least significant bits in coordinates and colors
- **Micro-precision**: Add imperceptible deltas to numeric values
- **Spatial encoding**: Distribute data across visual space
- **Temporal encoding**: Hide data in animation parameters
- **Transform encoding**: Use matrix parameters for data storage

### Security Considerations

- Visual key required for decryption
- Checksum verification prevents tampering
- Below human perception threshold (Δ < 0.001)
- No visual artifacts in normal viewing
- Extraction requires knowledge of encoding scheme

## 📈 Capacity Scaling

| Dimensions | Geometric | Organic | Logo | QR-Hybrid |
|-----------|-----------|---------|------|-----------|
| 400x400   | ~1.2 KB   | ~1.0 KB | ~0.5 KB | ~2.0 KB |
| 800x800   | ~5.0 KB   | ~4.0 KB | ~2.0 KB | ~8.0 KB |
| 1200x1200 | ~11 KB    | ~9.0 KB | ~4.5 KB | ~18 KB  |
| 1600x1600 | ~20 KB    | ~16 KB  | ~8.0 KB | ~32 KB  |

*Actual capacity varies based on data compressibility and ECC overhead*

## 🎯 Use Cases

- **Secure Data Transfer**: Hide sensitive data in images
- **Digital Watermarking**: Embed ownership information
- **Covert Communication**: Send hidden messages
- **Code Distribution**: Embed executable code in artwork
- **License Keys**: Hide activation codes in logos
- **Metadata Storage**: Attach data to vector graphics
- **Art + Data**: Create beautiful data visualizations

## ⚠️ Limitations

- SVG must remain unmodified for successful decoding
- Compression/optimization tools may corrupt hidden data
- Rasterization (SVG → PNG) loses all hidden data
- Maximum practical capacity ~10MB per SVG
- Requires exact visual key for encrypted data

## 🔒 Security Notes

- XOR encryption is lightweight, not military-grade
- Visual key acts as symmetric encryption key
- System provides obfuscation, not strong cryptography
- For high-security needs, pre-encrypt data with AES before encoding
- Checksum prevents undetected modifications

## 🌟 Advanced Usage

### Custom SVG Generation

```javascript
import { SVGGenerator } from './src/svg-generator.js';

const gen = new SVGGenerator(1000, 1000, 'geometric', 12345);
const structure = gen.generate(5000); // 5KB capacity
```

### Direct Channel Access

```javascript
import { SteganographyChannels } from './src/channels.js';

// Hide in RGB
const colors = ['#FF0000', '#00FF00', '#0000FF'];
const data = new Uint8Array([65, 66, 67]);
const { result } = SteganographyChannels.hideInRGB(colors, data);
```

### Custom Compression

```javascript
import { CryptoLayer } from './src/crypto.js';

const data = { custom: 'data' };
const compressed = CryptoLayer.compress(data);
const encrypted = CryptoLayer.encrypt(compressed, 'my-key');
```

## 📜 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional artistic styles
- More robust error correction
- Stronger encryption options
- CLI tool for encoding/decoding
- Browser-based demo
- Additional steganographic channels

## 🔮 Future Enhancements

- [ ] AES-256 encryption option
- [ ] Reed-Solomon error correction
- [ ] Animated SVG support (more data in keyframes)
- [ ] Multi-file splitting for large datasets
- [ ] Stealth mode (even harder to detect)
- [ ] Custom pattern injection
- [ ] Metadata preservation during re-encoding

---

**TIMECODE::STEGSVG** - Where art meets encryption 🎨🔐
