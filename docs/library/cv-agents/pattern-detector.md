# Pattern Detection Agent

Computer vision agent for detecting steganographic patterns in SVG files.

## 🎯 Overview

This agent analyzes SVG files to:
- 🔍 Detect hidden data patterns
- 📊 Analyze encoding density
- 🎨 Identify artistic style used
- ✅ Verify data integrity
- 🔐 Check encryption status

## 🤖 Agent Architecture

```
Input SVG → Parser → Analyzer → Pattern Detector → Classifier → Output
```

## 📋 Basic Implementation

### Node.js Agent

```javascript
import { SVGDecoder } from '../../../src/decoder-robust.js';
import { DOMParser } from 'xmldom';

class PatternDetectionAgent {
  constructor() {
    this.patterns = {
      hasData: false,
      encrypted: false,
      style: null,
      capacity: 0,
      metadata: {}
    };
  }

  /**
   * Analyze SVG for steganographic patterns
   */
  async analyze(svgString) {
    console.log('🤖 Pattern Detection Agent starting...');

    // Step 1: Parse SVG
    const parsed = this.parseSVG(svgString);

    // Step 2: Detect data attribute
    this.detectDataAttribute(svgString);

    // Step 3: Analyze visual patterns
    this.analyzeVisualPatterns(parsed);

    // Step 4: Estimate capacity
    this.estimateCapacity(parsed);

    // Step 5: Classify style
    this.classifyStyle(parsed);

    console.log('✅ Analysis complete');
    return this.patterns;
  }

  parseSVG(svgString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');

    return {
      paths: Array.from(doc.getElementsByTagName('path')),
      gradients: Array.from(doc.getElementsByTagName('linearGradient'))
        .concat(Array.from(doc.getElementsByTagName('radialGradient'))),
      svg: doc.getElementsByTagName('svg')[0]
    };
  }

  detectDataAttribute(svgString) {
    const dataMatch = svgString.match(/data-tc="([^"]+)"/);

    if (dataMatch) {
      this.patterns.hasData = true;
      const b64Data = dataMatch[1];
      this.patterns.metadata.dataLength = b64Data.length;

      // Try to detect encryption by entropy analysis
      const entropy = this.calculateEntropy(b64Data);
      this.patterns.encrypted = entropy > 0.9;  // High entropy suggests encryption

      console.log(`   ✓ Data detected: ${b64Data.length} bytes`);
      console.log(`   ${this.patterns.encrypted ? '🔐' : '🔓'} ${this.patterns.encrypted ? 'Encrypted' : 'Not encrypted'}`);
    } else {
      console.log('   ✗ No embedded data found');
    }
  }

  analyzeVisualPatterns(parsed) {
    const pathCount = parsed.paths.length;
    const gradientCount = parsed.gradients.length;

    // Analyze path complexity
    const avgPathComplexity = this.getAveragePathComplexity(parsed.paths);

    this.patterns.metadata = {
      ...this.patterns.metadata,
      pathCount,
      gradientCount,
      avgPathComplexity
    };

    console.log(`   📊 Paths: ${pathCount}, Gradients: ${gradientCount}`);
    console.log(`   📈 Avg complexity: ${avgPathComplexity.toFixed(2)}`);
  }

  getAveragePathComplexity(paths) {
    if (paths.length === 0) return 0;

    const complexities = Array.from(paths).map(path => {
      const d = path.getAttribute('d');
      return d ? d.length : 0;
    });

    return complexities.reduce((sum, c) => sum + c, 0) / complexities.length;
  }

  estimateCapacity(parsed) {
    const svg = parsed.svg;
    const width = parseInt(svg?.getAttribute('width') || 800);
    const height = parseInt(svg?.getAttribute('height') || 800);
    const area = width * height;

    // Rough capacity estimation
    this.patterns.capacity = Math.floor(area / 100);

    console.log(`   💾 Estimated capacity: ${(this.patterns.capacity / 1024).toFixed(2)} KB`);
  }

  classifyStyle(parsed) {
    const pathCount = parsed.paths.length;
    const gradientCount = parsed.gradients.length;

    // Pattern-based classification
    if (pathCount > 40 && pathCount < 60) {
      this.patterns.style = 'geometric';
    } else if (gradientCount === 0 && pathCount > 15) {
      this.patterns.style = 'organic';
    } else if (pathCount <= 15) {
      this.patterns.style = 'logo';
    } else if (pathCount > 60) {
      this.patterns.style = 'qr-hybrid';
    } else {
      this.patterns.style = 'unknown';
    }

    console.log(`   🎨 Style: ${this.patterns.style}`);
  }

  calculateEntropy(str) {
    const len = str.length;
    const frequencies = {};

    for (let i = 0; i < len; i++) {
      const char = str[i];
      frequencies[char] = (frequencies[char] || 0) + 1;
    }

    let entropy = 0;
    for (const char in frequencies) {
      const p = frequencies[char] / len;
      entropy -= p * Math.log2(p);
    }

    return entropy / Math.log2(256);  // Normalize to 0-1
  }

  getReport() {
    return `
╔════════════════════════════════════════════════════╗
║         PATTERN DETECTION REPORT                  ║
╚════════════════════════════════════════════════════╝

Status: ${this.patterns.hasData ? '✅ Data Detected' : '❌ No Data Found'}
Style: ${this.patterns.style || 'N/A'}
Encrypted: ${this.patterns.encrypted ? '🔐 Yes' : '🔓 No'}
Capacity: ${(this.patterns.capacity / 1024).toFixed(2)} KB

Metadata:
  - Paths: ${this.patterns.metadata.pathCount || 0}
  - Gradients: ${this.patterns.metadata.gradientCount || 0}
  - Complexity: ${this.patterns.metadata.avgPathComplexity?.toFixed(2) || 'N/A'}
  - Data Length: ${this.patterns.metadata.dataLength || 0} bytes
    `;
  }
}

// Usage Example
import fs from 'fs';

const svg = fs.readFileSync('sample.svg', 'utf8');
const agent = new PatternDetectionAgent();
const results = await agent.analyze(svg);

console.log(agent.getReport());
```

## 🌐 Browser Version

```javascript
class PatternDetectionAgent {
  constructor() {
    this.patterns = {
      hasData: false,
      encrypted: false,
      style: null,
      capacity: 0,
      metadata: {}
    };
  }

  async analyze(svgString) {
    // Parse using DOMParser (native browser API)
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');

    const parsed = {
      paths: doc.querySelectorAll('path'),
      gradients: doc.querySelectorAll('linearGradient, radialGradient'),
      svg: doc.querySelector('svg')
    };

    // Detect data
    const dataMatch = svgString.match(/data-tc="([^"]+)"/);
    this.patterns.hasData = !!dataMatch;

    if (dataMatch) {
      const b64Data = dataMatch[1];
      const entropy = this.calculateEntropy(b64Data);
      this.patterns.encrypted = entropy > 0.9;
      this.patterns.metadata.dataLength = b64Data.length;
    }

    // Analyze patterns
    this.patterns.metadata.pathCount = parsed.paths.length;
    this.patterns.metadata.gradientCount = parsed.gradients.length;

    // Classify style
    const pathCount = parsed.paths.length;
    if (pathCount > 40 && pathCount < 60) {
      this.patterns.style = 'geometric';
    } else if (pathCount > 60) {
      this.patterns.style = 'qr-hybrid';
    } else if (pathCount <= 15) {
      this.patterns.style = 'logo';
    } else {
      this.patterns.style = 'organic';
    }

    return this.patterns;
  }

  calculateEntropy(str) {
    const len = str.length;
    const frequencies = {};

    for (let i = 0; i < len; i++) {
      frequencies[str[i]] = (frequencies[str[i]] || 0) + 1;
    }

    let entropy = 0;
    for (const char in frequencies) {
      const p = frequencies[char] / len;
      entropy -= p * Math.log2(p);
    }

    return entropy / Math.log2(256);
  }
}

// Usage in web app
const fileInput = document.getElementById('svg-upload');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const svgString = await file.text();

  const agent = new PatternDetectionAgent();
  const results = await agent.analyze(svgString);

  console.log('🔍 Detection Results:', results);

  if (results.hasData) {
    alert(`✅ Data detected!\nStyle: ${results.style}\nEncrypted: ${results.encrypted}`);
  } else {
    alert('❌ No hidden data found');
  }
});
```

## 🎯 Advanced Features

### Multi-Agent System

```javascript
class StegAnalysisSystem {
  constructor() {
    this.agents = {
      patternDetector: new PatternDetectionAgent(),
      styleClassifier: new StyleClassificationAgent(),
      capacityAnalyzer: new CapacityAnalysisAgent(),
      securityAuditor: new SecurityAuditAgent()
    };
  }

  async runFullAnalysis(svgString) {
    console.log('🚀 Running full analysis with multiple agents...\n');

    const results = {};

    // Run agents in parallel
    const [patterns, style, capacity, security] = await Promise.all([
      this.agents.patternDetector.analyze(svgString),
      this.agents.styleClassifier.classify(svgString),
      this.agents.capacityAnalyzer.estimate(svgString),
      this.agents.securityAuditor.audit(svgString)
    ]);

    return {
      patterns,
      style,
      capacity,
      security,
      timestamp: Date.now()
    };
  }

  generateReport(results) {
    return `
╔════════════════════════════════════════════════════╗
║         COMPREHENSIVE ANALYSIS REPORT             ║
╚════════════════════════════════════════════════════╝

🔍 Pattern Detection:
   ${results.patterns.hasData ? '✅' : '❌'} Data Found
   ${results.patterns.encrypted ? '🔐' : '🔓'} Encryption

🎨 Style Classification:
   Primary: ${results.style.primary}
   Confidence: ${(results.style.confidence * 100).toFixed(1)}%

💾 Capacity Analysis:
   Used: ${results.capacity.used} bytes
   Available: ${results.capacity.available} bytes
   Efficiency: ${(results.capacity.efficiency * 100).toFixed(1)}%

🔒 Security Audit:
   Integrity: ${results.security.integrity ? '✅' : '❌'}
   Tampering: ${results.security.tampered ? '⚠️  Detected' : '✅ None'}
   Risk Level: ${results.security.riskLevel}

Generated: ${new Date(results.timestamp).toISOString()}
    `;
  }
}

// Usage
const system = new StegAnalysisSystem();
const results = await system.runFullAnalysis(svgString);
console.log(system.generateReport(results));
```

### Real-Time Monitoring Agent

```javascript
class RealTimeMonitorAgent {
  constructor() {
    this.watchedFiles = new Map();
    this.alerts = [];
  }

  watch(filePath, callback) {
    const watcher = fs.watch(filePath, async (eventType) => {
      if (eventType === 'change') {
        const svg = fs.readFileSync(filePath, 'utf8');
        const agent = new PatternDetectionAgent();
        const results = await agent.analyze(svg);

        callback(results);

        // Alert on suspicious changes
        if (this.detectSuspiciousPattern(results)) {
          this.triggerAlert(filePath, results);
        }
      }
    });

    this.watchedFiles.set(filePath, watcher);
    console.log(`👁️  Watching: ${filePath}`);
  }

  detectSuspiciousPattern(results) {
    // Alert if encryption status changed
    const previous = this.watchedFiles.get('previous');
    if (previous && previous.encrypted !== results.encrypted) {
      return true;
    }

    // Alert if data removed
    if (previous && previous.hasData && !results.hasData) {
      return true;
    }

    return false;
  }

  triggerAlert(filePath, results) {
    const alert = {
      timestamp: Date.now(),
      file: filePath,
      issue: 'Suspicious modification detected',
      results
    };

    this.alerts.push(alert);
    console.warn('⚠️  ALERT:', alert.issue);
  }

  stopWatching(filePath) {
    const watcher = this.watchedFiles.get(filePath);
    if (watcher) {
      watcher.close();
      this.watchedFiles.delete(filePath);
      console.log(`🛑 Stopped watching: ${filePath}`);
    }
  }
}

// Usage
const monitor = new RealTimeMonitorAgent();

monitor.watch('./uploads/*.svg', (results) => {
  console.log('📊 File changed:', results);
});
```

## 🧪 Testing

```javascript
import { describe, it, expect } from 'vitest';

describe('PatternDetectionAgent', () => {
  it('should detect embedded data', async () => {
    const svg = `<svg data-tc="abc123">...</svg>`;
    const agent = new PatternDetectionAgent();
    const results = await agent.analyze(svg);

    expect(results.hasData).toBe(true);
  });

  it('should classify geometric style', async () => {
    // SVG with 50 paths
    const svg = generateMockSVG({ paths: 50, gradients: 5 });
    const agent = new PatternDetectionAgent();
    const results = await agent.analyze(svg);

    expect(results.style).toBe('geometric');
  });

  it('should detect encryption by entropy', async () => {
    // Encrypted data has high entropy
    const encrypted = 'Wx4t9KLmP...';  // Random-looking
    const svg = `<svg data-tc="${encrypted}">...</svg>`;

    const agent = new PatternDetectionAgent();
    const results = await agent.analyze(svg);

    expect(results.encrypted).toBe(true);
  });
});
```

## 📊 Metrics & Logging

```javascript
class MetricsCollector {
  constructor() {
    this.metrics = [];
  }

  record(svgPath, analysis) {
    this.metrics.push({
      timestamp: Date.now(),
      file: svgPath,
      hasData: analysis.hasData,
      style: analysis.style,
      encrypted: analysis.encrypted,
      capacity: analysis.capacity
    });
  }

  getStats() {
    const total = this.metrics.length;
    const withData = this.metrics.filter(m => m.hasData).length;
    const encrypted = this.metrics.filter(m => m.encrypted).length;

    return {
      total,
      withData,
      encrypted,
      percentage: (withData / total * 100).toFixed(1) + '%'
    };
  }

  exportCSV() {
    const headers = 'Timestamp,File,HasData,Style,Encrypted,Capacity\n';
    const rows = this.metrics.map(m =>
      `${m.timestamp},${m.file},${m.hasData},${m.style},${m.encrypted},${m.capacity}`
    ).join('\n');

    return headers + rows;
  }
}

// Usage
const metrics = new MetricsCollector();

for (const file of svgFiles) {
  const agent = new PatternDetectionAgent();
  const results = await agent.analyze(fs.readFileSync(file, 'utf8'));
  metrics.record(file, results);
}

console.log('📊 Statistics:', metrics.getStats());
fs.writeFileSync('metrics.csv', metrics.exportCSV());
```

## 🔐 Security Applications

### Malware Detection

```javascript
class MalwareDetectionAgent extends PatternDetectionAgent {
  async scanForMalicious(svgString) {
    const results = await this.analyze(svgString);

    // Check for suspicious patterns
    const threats = [];

    // 1. Unexpected data in image
    if (results.hasData) {
      threats.push({
        level: 'warning',
        type: 'hidden_data',
        message: 'SVG contains hidden data'
      });
    }

    // 2. Unusually high entropy (encrypted payload)
    if (results.encrypted) {
      threats.push({
        level: 'high',
        type: 'encryption',
        message: 'Encrypted data detected - possible payload'
      });
    }

    // 3. Excessive complexity (evasion technique)
    if (results.metadata.avgPathComplexity > 1000) {
      threats.push({
        level: 'medium',
        type: 'complexity',
        message: 'Unusually complex paths - possible obfuscation'
      });
    }

    return {
      safe: threats.length === 0,
      threats,
      risk: this.calculateRiskScore(threats)
    };
  }

  calculateRiskScore(threats) {
    const scores = { warning: 1, medium: 5, high: 10 };
    const total = threats.reduce((sum, t) => sum + scores[t.level], 0);

    if (total === 0) return 'safe';
    if (total < 5) return 'low';
    if (total < 10) return 'medium';
    return 'high';
  }
}

// Usage
const scanner = new MalwareDetectionAgent();
const result = await scanner.scanForMalicious(suspiciousSVG);

if (!result.safe) {
  console.warn('⚠️  Security threats detected:');
  result.threats.forEach(t => console.warn(`   ${t.level}: ${t.message}`));
}
```

---

**Next:** [Data Extraction Agent](./data-extractor.md) | [Verification Agent](./verifier.md)
