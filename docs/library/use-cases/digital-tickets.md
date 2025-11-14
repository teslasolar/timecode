# Digital Ticket System with SVG Steganography

Complete implementation of a secure, fraud-proof ticket system using SVG steganography.

## 🎯 Overview

Build a ticketing system where:
- 🎫 Tickets are beautiful SVG graphics
- 📱 QR codes are scannable for quick entry
- 🔐 Hidden data prevents forgery
- ✅ Offline verification works
- 🎨 Customizable branding

## 🏗️ System Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Purchase  │─────→│   Generate   │─────→│   Deliver   │
│   Ticket    │      │   SVG+Data   │      │   to User   │
└─────────────┘      └──────────────┘      └─────────────┘
                                                   │
                                                   ↓
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Entry     │←─────│    Verify    │←─────│  Scan QR    │
│   Granted   │      │   Signature  │      │  + Extract  │
└─────────────┘      └──────────────┘      └─────────────┘
```

## 📋 Complete Implementation

### 1. Ticket Generator Service

```javascript
// ticket-generator.js
import Timecode from '../../../src/index.js';
import crypto from 'crypto';
import fs from 'fs';

class TicketGenerator {
  constructor(secretKey) {
    this.secretKey = secretKey;
    this.T = new Timecode({
      style: 'qr-hybrid',
      width: 1000,
      height: 1000,
      visualKey: secretKey
    });
  }

  /**
   * Generate a secure ticket
   */
  async generateTicket(ticketInfo) {
    console.log('🎫 Generating ticket...');

    // Create unique ticket ID
    const ticketId = this.generateTicketId();

    // Build ticket data
    const ticketData = {
      // Public QR layer
      qr_payload: `https://events.com/verify/${ticketId}`,

      // Hidden validation layer
      ticket_id: ticketId,
      event_name: ticketInfo.eventName,
      event_date: ticketInfo.eventDate,
      venue: ticketInfo.venue,

      // Purchaser info
      purchaser_name: ticketInfo.purchaserName,
      purchaser_email: ticketInfo.purchaserEmail,
      purchase_date: Date.now(),

      // Ticket details
      ticket_type: ticketInfo.ticketType,  // VIP, Regular, Student
      seat: ticketInfo.seat,
      price: ticketInfo.price,
      currency: ticketInfo.currency || 'USD',

      // Security
      special_access: ticketInfo.specialAccess || [],  // ['vip_lounge', 'backstage']
      valid_from: ticketInfo.validFrom || Date.now(),
      valid_until: ticketInfo.validUntil,
      max_scans: ticketInfo.maxScans || 1,
      scan_count: 0,

      // Anti-forgery
      signature: null,  // Will be added
      issued_by: 'EventPlatform',
      version: '1.0'
    };

    // Sign the data
    ticketData.signature = this.signTicket(ticketData);

    // Generate SVG with embedded data
    const svg = await this.T.enc(ticketData, 'qr-hybrid');

    // Add branding
    const branded = this.addBranding(svg, ticketInfo);

    console.log(`✅ Ticket generated: ${ticketId}`);
    return {
      ticketId,
      svg: branded,
      metadata: ticketData
    };
  }

  generateTicketId() {
    const prefix = 'TIX';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  signTicket(ticketData) {
    // Create a copy without signature field
    const dataToSign = { ...ticketData };
    delete dataToSign.signature;

    // Create HMAC signature
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(JSON.stringify(dataToSign));
    return hmac.digest('hex');
  }

  addBranding(svg, ticketInfo) {
    // Add event name, logo, colors, etc.
    let branded = svg;

    // Replace background color with event theme
    if (ticketInfo.themeColor) {
      branded = branded.replace(
        'fill="#FFFFFF"',
        `fill="${ticketInfo.themeColor}"`
      );
    }

    // Add event name text
    const eventText = `
  <text x="500" y="50" text-anchor="middle" font-size="32" font-weight="bold" fill="#000">
    ${ticketInfo.eventName}
  </text>
  <text x="500" y="90" text-anchor="middle" font-size="20" fill="#333">
    ${new Date(ticketInfo.eventDate).toLocaleDateString()}
  </text>`;

    branded = branded.replace('</svg>', eventText + '\n</svg>');

    return branded;
  }

  /**
   * Batch generate tickets
   */
  async generateBatch(ticketInfos) {
    console.log(`📦 Generating ${ticketInfos.length} tickets...`);

    const tickets = [];
    for (const info of ticketInfos) {
      const ticket = await this.generateTicket(info);
      tickets.push(ticket);

      // Save to file
      fs.writeFileSync(
        `./tickets/${ticket.ticketId}.svg`,
        ticket.svg
      );
    }

    console.log(`✅ Batch complete: ${tickets.length} tickets`);
    return tickets;
  }
}

// Example usage
const generator = new TicketGenerator(process.env.TICKET_SECRET);

const ticket = await generator.generateTicket({
  eventName: 'TIMECODE::CONFERENCE 2024',
  eventDate: new Date('2024-06-15').toISOString(),
  venue: 'Tech Arena, San Francisco',
  purchaserName: 'John Doe',
  purchaserEmail: 'john@example.com',
  ticketType: 'VIP',
  seat: 'A-42',
  price: 299.99,
  currency: 'USD',
  specialAccess: ['vip_lounge', 'backstage', 'meet_greet'],
  validUntil: new Date('2024-06-15T23:59:59').getTime(),
  themeColor: '#667EEA'
});

console.log('🎫 Ticket ready!');
console.log('   ID:', ticket.ticketId);
console.log('   File: ./tickets/' + ticket.ticketId + '.svg');
```

### 2. Ticket Verification Service

```javascript
// ticket-verifier.js
import Timecode from '../../../src/index.js';
import crypto from 'crypto';

class TicketVerifier {
  constructor(secretKey) {
    this.secretKey = secretKey;
    this.T = new Timecode({ visualKey: secretKey });
    this.scannedTickets = new Map();  // Track usage
  }

  /**
   * Verify a ticket at entrance
   */
  async verifyTicket(svgString) {
    console.log('🔍 Verifying ticket...');

    try {
      // Step 1: Extract hidden data
      const ticketData = await this.T.dec(svgString);

      // Step 2: Verify signature
      if (!this.verifySignature(ticketData)) {
        return {
          valid: false,
          reason: 'Invalid signature - ticket may be forged'
        };
      }

      // Step 3: Check validity period
      const now = Date.now();
      if (now < ticketData.valid_from) {
        return {
          valid: false,
          reason: 'Ticket not yet valid'
        };
      }
      if (now > ticketData.valid_until) {
        return {
          valid: false,
          reason: 'Ticket expired'
        };
      }

      // Step 4: Check scan count
      const scanCount = this.scannedTickets.get(ticketData.ticket_id) || 0;
      if (scanCount >= ticketData.max_scans) {
        return {
          valid: false,
          reason: 'Ticket already used (max scans exceeded)'
        };
      }

      // Step 5: Record scan
      this.scannedTickets.set(ticketData.ticket_id, scanCount + 1);

      // Success!
      console.log('✅ Ticket valid!');
      return {
        valid: true,
        ticket: ticketData,
        scanNumber: scanCount + 1
      };

    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      return {
        valid: false,
        reason: 'Failed to read ticket data'
      };
    }
  }

  verifySignature(ticketData) {
    const providedSig = ticketData.signature;

    // Recreate signature
    const dataToVerify = { ...ticketData };
    delete dataToVerify.signature;

    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(JSON.stringify(dataToVerify));
    const expectedSig = hmac.digest('hex');

    return providedSig === expectedSig;
  }

  /**
   * Get ticket info without marking as scanned
   */
  async previewTicket(svgString) {
    try {
      const ticketData = await this.T.dec(svgString);
      return {
        event: ticketData.event_name,
        date: new Date(ticketData.event_date).toLocaleDateString(),
        seat: ticketData.seat,
        type: ticketData.ticket_type,
        holder: ticketData.purchaser_name
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Admin: Force invalidate a ticket
   */
  invalidateTicket(ticketId) {
    this.scannedTickets.set(ticketId, 999);  // Mark as over-scanned
    console.log(`🚫 Ticket ${ticketId} invalidated`);
  }

  /**
   * Get usage statistics
   */
  getStats() {
    return {
      totalScanned: this.scannedTickets.size,
      tickets: Array.from(this.scannedTickets.entries()).map(([id, count]) => ({
        ticketId: id,
        scanCount: count
      }))
    };
  }
}

// Example usage
const verifier = new TicketVerifier(process.env.TICKET_SECRET);

// At entrance gate
const svgFromScanner = fs.readFileSync('scanned-ticket.svg', 'utf8');
const result = await verifier.verifyTicket(svgFromScanner);

if (result.valid) {
  console.log('✅ ADMIT');
  console.log('   Holder:', result.ticket.purchaser_name);
  console.log('   Seat:', result.ticket.seat);
  console.log('   Type:', result.ticket.ticket_type);

  if (result.ticket.special_access.length > 0) {
    console.log('   Special Access:', result.ticket.special_access.join(', '));
  }
} else {
  console.log('❌ DENY');
  console.log('   Reason:', result.reason);
}
```

### 3. Web Interface for Verification

```javascript
// public/verify.html + verify.js

class TicketVerificationUI {
  constructor() {
    this.verifier = new TicketVerifier(CONFIG.SECRET_KEY);
    this.setupUI();
  }

  setupUI() {
    // QR Scanner
    this.scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: 250
    });

    this.scanner.render(
      this.onScanSuccess.bind(this),
      this.onScanError.bind(this)
    );

    // File upload
    document.getElementById('ticket-upload').addEventListener('change',
      this.onFileUpload.bind(this)
    );
  }

  async onScanSuccess(decodedText, decodedResult) {
    console.log('📱 QR Scanned:', decodedText);

    // If it's a URL, fetch the SVG
    if (decodedText.startsWith('http')) {
      const svg = await this.fetchTicketSVG(decodedText);
      await this.verifyAndDisplay(svg);
    }
  }

  async onFileUpload(event) {
    const file = event.target.files[0];
    const svg = await file.text();
    await this.verifyAndDisplay(svg);
  }

  async verifyAndDisplay(svgString) {
    const result = await this.verifier.verifyTicket(svgString);

    const resultDiv = document.getElementById('verification-result');

    if (result.valid) {
      resultDiv.innerHTML = `
        <div class="success">
          <h2>✅ VALID TICKET</h2>
          <p><strong>Event:</strong> ${result.ticket.event_name}</p>
          <p><strong>Holder:</strong> ${result.ticket.purchaser_name}</p>
          <p><strong>Seat:</strong> ${result.ticket.seat}</p>
          <p><strong>Type:</strong> ${result.ticket.ticket_type}</p>
          <p><strong>Scan:</strong> ${result.scanNumber} of ${result.ticket.max_scans}</p>
          ${result.ticket.special_access.length > 0 ?
            `<p><strong>Access:</strong> ${result.ticket.special_access.join(', ')}</p>`
            : ''}
        </div>
      `;

      // Play success sound
      new Audio('/sounds/success.mp3').play();

      // Show green light
      document.body.style.backgroundColor = '#10B981';

    } else {
      resultDiv.innerHTML = `
        <div class="error">
          <h2>❌ INVALID TICKET</h2>
          <p><strong>Reason:</strong> ${result.reason}</p>
        </div>
      `;

      // Play error sound
      new Audio('/sounds/error.mp3').play();

      // Show red light
      document.body.style.backgroundColor = '#EF4444';
    }

    // Reset after 5 seconds
    setTimeout(() => {
      document.body.style.backgroundColor = '';
      resultDiv.innerHTML = '';
    }, 5000);
  }
}

// Initialize
const ui = new TicketVerificationUI();
```

### 4. Mobile App Integration (React Native)

```javascript
// TicketScanner.jsx
import React, { useState } from 'react';
import { Camera } from 'expo-camera';
import { Timecode } from './timecode-lib';

export function TicketScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [result, setResult] = useState(null);

  const verifier = new TicketVerifier(CONFIG.SECRET_KEY);

  const handleBarCodeScanned = async ({ data }) => {
    // Data is QR payload URL
    const svg = await fetch(data).then(r => r.text());
    const verification = await verifier.verifyTicket(svg);

    setResult(verification);

    // Show result for 3 seconds
    setTimeout(() => setResult(null), 3000);
  };

  return (
    <View style={styles.container}>
      <Camera
        onBarCodeScanned={handleBarCodeScanned}
        style={styles.camera}
      />

      {result && (
        <View style={[
          styles.result,
          { backgroundColor: result.valid ? '#10B981' : '#EF4444' }
        ]}>
          <Text style={styles.resultText}>
            {result.valid ? '✅ VALID' : '❌ INVALID'}
          </Text>
          {result.valid && (
            <>
              <Text>{result.ticket.purchaser_name}</Text>
              <Text>Seat: {result.ticket.seat}</Text>
            </>
          )}
          {!result.valid && (
            <Text>{result.reason}</Text>
          )}
        </View>
      )}
    </View>
  );
}
```

## 🚀 Deployment

### Backend API

```javascript
// api/tickets.js (Express.js)
import express from 'express';
import { TicketGenerator, TicketVerifier } from './ticket-system.js';

const app = express();
const generator = new TicketGenerator(process.env.TICKET_SECRET);
const verifier = new TicketVerifier(process.env.TICKET_SECRET);

// Generate ticket
app.post('/api/tickets/generate', async (req, res) => {
  const ticket = await generator.generateTicket(req.body);

  // Store metadata in database
  await db.tickets.create({
    ticketId: ticket.ticketId,
    purchaserEmail: req.body.purchaserEmail,
    eventName: req.body.eventName,
    generated: Date.now()
  });

  // Send email with ticket
  await sendTicketEmail(req.body.purchaserEmail, ticket.svg);

  res.json({
    success: true,
    ticketId: ticket.ticketId,
    downloadUrl: `/api/tickets/${ticket.ticketId}/download`
  });
});

// Verify ticket
app.post('/api/tickets/verify', async (req, res) => {
  const { svg } = req.body;
  const result = await verifier.verifyTicket(svg);

  // Log verification attempt
  await db.verifications.create({
    timestamp: Date.now(),
    valid: result.valid,
    ticketId: result.ticket?.ticket_id,
    reason: result.reason
  });

  res.json(result);
});

// Get ticket stats
app.get('/api/tickets/stats', async (req, res) => {
  const stats = verifier.getStats();
  res.json(stats);
});

app.listen(3000);
```

## 📊 Analytics Dashboard

```javascript
// analytics-dashboard.js

class TicketAnalytics {
  constructor() {
    this.db = new Database();
  }

  async getEventStats(eventId) {
    return {
      totalTickets: await this.db.count({ eventId }),
      scannedTickets: await this.db.count({ eventId, scanned: true }),
      revenue: await this.db.sum({ eventId }, 'price'),
      byType: await this.db.groupBy({ eventId }, 'ticket_type'),
      scansByHour: await this.getScansOverTime(eventId)
    };
  }

  async getScansOverTime(eventId) {
    // Group scans by hour
    const scans = await this.db.getScans({ eventId });
    const byHour = {};

    scans.forEach(scan => {
      const hour = new Date(scan.timestamp).getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;
    });

    return byHour;
  }

  async detectFraud(eventId) {
    // Look for suspicious patterns
    const duplicateScans = await this.db.query(`
      SELECT ticket_id, COUNT(*) as count
      FROM scans
      WHERE event_id = ?
      GROUP BY ticket_id
      HAVING count > max_scans
    `, [eventId]);

    return duplicateScans;
  }
}
```

## 🔒 Security Best Practices

```javascript
// 1. Rotate secrets regularly
function rotateSecrets() {
  const newSecret = crypto.randomBytes(32).toString('hex');
  process.env.TICKET_SECRET_NEW = newSecret;

  // Re-issue tickets with new secret after event
}

// 2. Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // limit each IP to 100 requests per windowMs
});

app.use('/api/tickets/verify', limiter);

// 3. Audit logging
function logVerification(result, ipAddress) {
  logger.info({
    timestamp: Date.now(),
    ip: ipAddress,
    valid: result.valid,
    ticketId: result.ticket?.ticket_id,
    reason: result.reason
  });
}
```

---

**Complete, production-ready ticket system with fraud prevention! 🎫✨**

**Next:** [License Verification System](./license-verification.md) | [Digital Certificates](./certificates.md)
