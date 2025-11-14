# Hybrid QR-SVG Steganography

Combine scannable QR codes with hidden steganographic data.

## 🎯 Concept

Create SVG images that:
1. **Look like** artistic QR codes (scannable with phones)
2. **Contain** additional hidden data beyond the QR payload
3. **Maintain** both functionalities independently

## 📋 Basic Example

### Node.js Implementation

```javascript
import Timecode from '../../../src/index.js';

// Data to hide beyond QR code
const hiddenData = {
  qr_payload: "https://example.com/verify/12345",
  admin_key: "sk-admin-abc123def456",
  permissions: ["read", "write", "admin"],
  timestamp: Date.now(),
  signature: "crypto-signature-here"
};

// Create hybrid QR-SVG
const T = new Timecode({
  style: 'qr-hybrid',
  width: 1000,
  height: 1000,
  visualKey: 'my-secret-pattern-2024'
});

const svg = await T.enc(hiddenData, 'qr-hybrid');

// Save to file
import fs from 'fs';
fs.writeFileSync('hybrid-qr.svg', svg);

console.log('✅ Created hybrid QR-SVG!');
console.log('   📱 Scannable URL: https://example.com/verify/12345');
console.log('   🔐 Hidden data: Admin credentials + permissions');
```

### Browser Implementation

```javascript
// Using the web library
const hiddenData = {
  qr_payload: "https://example.com/verify/12345",
  admin_key: "sk-admin-abc123def456",
  permissions: ["read", "write", "admin"],
  timestamp: Date.now(),
  signature: "crypto-signature-here"
};

const T = new Timecode({
  style: 'qr-hybrid',
  width: 1000,
  height: 1000,
  visualKey: 'my-secret-pattern-2024'
});

const svg = await T.enc(hiddenData, 'qr-hybrid');

// Display in page
document.getElementById('qr-container').innerHTML = svg;

// Download
const blob = new Blob([svg], { type: 'image/svg+xml' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'hybrid-qr.svg';
a.click();
```

## 🔍 Extracting Data

### Scan QR Code (Public Layer)

```javascript
// Use any QR scanner library or phone camera
// Result: "https://example.com/verify/12345"
```

### Extract Hidden Data (Private Layer)

```javascript
import Timecode from '../../../src/index.js';
import fs from 'fs';

const svg = fs.readFileSync('hybrid-qr.svg', 'utf8');

const T = new Timecode({
  visualKey: 'my-secret-pattern-2024'
});

const hiddenData = await T.dec(svg);

console.log('🔓 Extracted hidden data:');
console.log(hiddenData);
/*
{
  qr_payload: "https://example.com/verify/12345",
  admin_key: "sk-admin-abc123def456",
  permissions: ["read", "write", "admin"],
  timestamp: 1699999999999,
  signature: "crypto-signature-here"
}
*/
```

## 🎨 Visual Example

```
┌─────────────────────────────────┐
│  ██████  ██  ████    ██  ██████ │  ← Scannable QR Code
│  ██  ██  ████  ██  ████  ██  ██ │     (Public Layer)
│  ██████  ██  ██████  ██  ██████ │
│  ██████  ████  ████████  ████   │     +
│  ████  ██  ████  ██  ██████  ██ │
│    ██████████  ██  ██████  ████ │  Hidden Admin Data
│  ██████  ██  ████    ██  ██████ │     (Private Layer)
└─────────────────────────────────┘
     Hybrid QR-SVG
```

## 🎯 Use Cases

### 1. Secure Event Tickets

```javascript
const ticketData = {
  // Public QR: Basic ticket info for entry
  qr_payload: "https://events.com/ticket/ABC123",

  // Hidden: Full validation data
  ticket_id: "ABC123-XYZ789",
  seat: "A-42",
  price: 150.00,
  purchaser_email: "user@example.com",
  security_hash: "sha256-hash-here",
  special_access: ["vip_lounge", "backstage"]
};

const svg = await T.enc(ticketData, 'qr-hybrid');
```

**Benefits:**
- 📱 Phone-scannable for quick entry
- 🔐 Hidden validation data prevents forgery
- ✅ Offline verification possible

### 2. Product Authentication

```javascript
const productData = {
  // Public QR: Product page
  qr_payload: "https://brand.com/product/XYZ",

  // Hidden: Anti-counterfeit data
  serial_number: "XYZ-2024-001234",
  manufacture_date: "2024-01-15",
  batch_id: "BATCH-456",
  factory_location: "Factory-A",
  crypto_signature: "authentic-signature"
};

const svg = await T.enc(productData, 'qr-hybrid');
```

**Benefits:**
- 🏷️ Customers scan to see product info
- 🔒 Retailers verify authenticity with hidden data
- 🚫 Impossible to counterfeit without secret key

### 3. Business Cards with Metadata

```javascript
const cardData = {
  // Public QR: vCard/contact info
  qr_payload: "https://linkedin.com/in/username",

  // Hidden: Extended professional data
  full_name: "John Doe",
  title: "Senior Engineer",
  company: "Tech Corp",
  email: "john@techcorp.com",
  phone: "+1-555-0123",
  projects: ["ProjectA", "ProjectB"],
  skills: ["JavaScript", "Python", "Go"],
  availability: "Available for consulting"
};

const svg = await T.enc(cardData, 'qr-hybrid');
```

## 🔧 Advanced Configuration

### Custom Grid Size

```javascript
const T = new Timecode({
  style: 'qr-hybrid',
  width: 1500,
  height: 1500,
  seed: 42  // Consistent pattern
});
```

### Multi-Layer Encoding

```javascript
// Layer 1: QR scannable data
// Layer 2: Steganographic data
// Layer 3: Visual pattern (artistic overlay)

const multiLayerData = {
  layer1_qr: "https://example.com",
  layer2_hidden: {
    secret: "admin-key-123",
    roles: ["admin", "superuser"]
  },
  layer3_metadata: {
    created: Date.now(),
    version: "1.0"
  }
};
```

### Error Correction Strategy

```javascript
// QR codes have built-in error correction
// Add extra redundancy for hidden data

const redundantData = {
  qr_payload: "https://example.com",
  hidden_data: "secret-info",
  checksum: calculateChecksum("secret-info"),
  backup_copy: "secret-info"  // Redundancy
};
```

## 📊 Capacity Comparison

| Size | QR Capacity | Hidden Capacity | Total |
|------|-------------|-----------------|-------|
| 500×500 | ~2KB | ~4KB | ~6KB |
| 1000×1000 | ~2KB | ~8KB | ~10KB |
| 1500×1500 | ~2KB | ~18KB | ~20KB |

## 🛡️ Security Considerations

### Encryption Best Practices

```javascript
// Always use strong visual keys
const key = await Timecode.generateKey('random-pattern', Date.now());

// Include timestamps for expiration
const data = {
  qr_payload: "https://example.com",
  hidden: "secret",
  expires: Date.now() + (24 * 60 * 60 * 1000)  // 24 hours
};

// Verify expiration on decode
const decoded = await T.dec(svg, key);
if (Date.now() > decoded.expires) {
  throw new Error('Data expired');
}
```

### Anti-Tampering

```javascript
// Add cryptographic signature
import crypto from 'crypto';

const data = {
  qr_payload: "https://example.com",
  payload: { secret: "data" }
};

// Sign the payload
const signature = crypto
  .createHmac('sha256', 'secret-key')
  .update(JSON.stringify(data.payload))
  .digest('hex');

data.signature = signature;

// Verify on decode
const decoded = await T.dec(svg);
const expectedSig = crypto
  .createHmac('sha256', 'secret-key')
  .update(JSON.stringify(decoded.payload))
  .digest('hex');

if (decoded.signature !== expectedSig) {
  throw new Error('Data has been tampered with!');
}
```

## 🎨 Styling QR Codes

### Add Colors

```javascript
// Modify generated SVG to add brand colors
let svg = await T.enc(data, 'qr-hybrid');

// Replace default black with brand color
svg = svg.replace(/fill="#000000"/g, 'fill="#667EEA"');

// Add gradient background
svg = svg.replace(
  '<rect width=',
  '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
  '<stop offset="0%" style="stop-color:#667EEA"/>' +
  '<stop offset="100%" style="stop-color:#764BA2"/>' +
  '</linearGradient></defs><rect fill="url(#bg)" width='
);
```

### Add Logo Overlay

```javascript
// Center logo in QR code (quiet zone)
const logoSVG = `
  <circle cx="500" cy="500" r="100" fill="white"/>
  <image href="logo.png" x="450" y="450" width="100" height="100"/>
`;

svg = svg.replace('</svg>', logoSVG + '</svg>');
```

## 📱 Mobile Integration

### iOS Swift

```swift
import AVFoundation

// Scan QR code
func scanQR() {
    let scanner = AVCaptureMetadataOutput()
    // ... setup camera
    // Result: QR payload
}

// Extract hidden data via WebView
func extractHidden(svgString: String) {
    let webView = WKWebView()
    webView.evaluateJavaScript("""
        const T = new Timecode({ visualKey: 'key' });
        T.dec('\(svgString)').then(data => {
            webkit.messageHandlers.handler.postMessage(data);
        });
    """)
}
```

### Android Kotlin

```kotlin
import com.google.zxing.BarcodeFormat
import android.webkit.WebView

// Scan QR
fun scanQR() {
    val scanner = BarcodeScanner()
    // ... setup
    // Result: QR payload
}

// Extract hidden
fun extractHidden(svgString: String) {
    val webView = WebView(context)
    webView.evaluateJavascript("""
        const T = new Timecode({ visualKey: 'key' });
        T.dec('$svgString').then(data => {
            Android.receiveData(JSON.stringify(data));
        });
    """, null)
}
```

## 🧪 Testing

```javascript
// Test QR scannability
import QRCode from 'qrcode-reader';

const qr = new QRCode();
qr.callback = (err, value) => {
  if (err) {
    console.error('QR not scannable:', err);
  } else {
    console.log('✅ QR payload:', value.result);
  }
};

// Test hidden data extraction
const T = new Timecode({ visualKey: 'test-key' });
const decoded = await T.dec(svg);
console.log('✅ Hidden data:', decoded);
```

## 🌟 Real-World Example

Complete ticket system:

```javascript
// Generate tickets
async function generateTicket(ticketInfo) {
  const data = {
    qr_payload: `https://events.com/verify/${ticketInfo.id}`,
    ticket_id: ticketInfo.id,
    event: ticketInfo.event,
    seat: ticketInfo.seat,
    purchaser: ticketInfo.email,
    price: ticketInfo.price,
    timestamp: Date.now(),
    signature: await signData(ticketInfo)
  };

  const T = new Timecode({
    style: 'qr-hybrid',
    width: 1000,
    height: 1000,
    visualKey: process.env.TICKET_SECRET
  });

  return await T.enc(data, 'qr-hybrid');
}

// Verify at entrance
async function verifyTicket(svgString) {
  const T = new Timecode({
    visualKey: process.env.TICKET_SECRET
  });

  const data = await T.dec(svgString);

  // Check signature
  const valid = await verifySignature(data);
  if (!valid) {
    throw new Error('Invalid ticket signature');
  }

  // Check timestamp
  if (Date.now() > data.timestamp + (30 * 24 * 60 * 60 * 1000)) {
    throw new Error('Ticket expired');
  }

  return {
    valid: true,
    ticket: data
  };
}
```

---

**Next:** [Advanced QR Patterns](./advanced-qr-patterns.md) | [CV Detection Agents](../cv-agents/qr-detector.md)
