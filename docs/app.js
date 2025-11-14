/**
 * TIMECODE::STEGSVG Web Application
 * UI logic and event handlers
 */

// Wait for DOM and library to load
document.addEventListener('DOMContentLoaded', init);

let currentSVG = '';

function init() {
  setupTabs();
  setupEncode();
  setupDecode();
  setupExamples();
}

// ============================================================================
// TAB NAVIGATION
// ============================================================================

function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;

      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });
}

// ============================================================================
// ENCODE FUNCTIONALITY
// ============================================================================

function setupEncode() {
  const encodeBtn = document.getElementById('encode-btn');
  const dataInput = document.getElementById('encode-data');
  const styleSelect = document.getElementById('encode-style');
  const sizeSelect = document.getElementById('encode-size');
  const keyInput = document.getElementById('encode-key');
  const output = document.getElementById('encode-output');
  const svgPreview = document.getElementById('svg-preview');
  const svgSource = document.getElementById('svg-source');
  const stats = document.getElementById('encode-stats');
  const downloadBtn = document.getElementById('download-svg-btn');
  const copyBtn = document.getElementById('copy-svg-btn');

  // Set default example data
  dataInput.value = JSON.stringify({
    message: "Hello from TIMECODE::STEGSVG!",
    timestamp: Date.now(),
    secret: "This data is hidden in a beautiful SVG 🎨"
  }, null, 2);

  encodeBtn.addEventListener('click', async () => {
    try {
      encodeBtn.disabled = true;
      encodeBtn.textContent = '⏳ Generating...';
      encodeBtn.classList.add('loading');

      // Get inputs
      const dataStr = dataInput.value.trim();
      if (!dataStr) {
        throw new Error('Please enter some data to encode');
      }

      // Try to parse as JSON, otherwise use as plain text
      let data;
      try {
        data = JSON.parse(dataStr);
      } catch (e) {
        data = dataStr;
      }

      const style = styleSelect.value;
      const size = parseInt(sizeSelect.value);
      const key = keyInput.value.trim() || null;

      // Create Timecode instance
      const T = new window.Timecode({
        width: size,
        height: size,
        style: style,
        visualKey: key
      });

      // Encode
      const startTime = Date.now();
      currentSVG = await T.enc(data, style, key);
      const encodeTime = Date.now() - startTime;

      // Display results
      svgPreview.innerHTML = currentSVG;
      svgSource.textContent = currentSVG;

      // Show stats
      const dataSize = JSON.stringify(data).length;
      const svgSize = currentSVG.length;
      stats.innerHTML = `
        📊 <strong>Stats:</strong>
        Original data: ${dataSize} bytes •
        SVG size: ${(svgSize / 1024).toFixed(2)} KB •
        Encoded in: ${encodeTime}ms •
        Style: ${style} •
        ${key ? '🔐 Encrypted' : '🔓 Not encrypted'}
      `;

      output.classList.remove('hidden');

      // Scroll to output
      output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } finally {
      encodeBtn.disabled = false;
      encodeBtn.textContent = '✨ Generate SVG';
      encodeBtn.classList.remove('loading');
    }
  });

  // Download SVG
  downloadBtn.addEventListener('click', () => {
    if (!currentSVG) return;

    const blob = new Blob([currentSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timecode-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Copy SVG to clipboard
  copyBtn.addEventListener('click', async () => {
    if (!currentSVG) return;

    try {
      await navigator.clipboard.writeText(currentSVG);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    } catch (error) {
      alert('Failed to copy to clipboard');
    }
  });
}

// ============================================================================
// DECODE FUNCTIONALITY
// ============================================================================

function setupDecode() {
  const decodeBtn = document.getElementById('decode-btn');
  const svgInput = document.getElementById('decode-svg');
  const fileInput = document.getElementById('decode-file');
  const keyInput = document.getElementById('decode-key');
  const output = document.getElementById('decode-output');
  const preview = document.getElementById('decode-svg-preview');
  const result = document.getElementById('decode-result');
  const copyBtn = document.getElementById('copy-data-btn');

  // File upload
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      svgInput.value = text;
    } catch (error) {
      alert(`Error reading file: ${error.message}`);
    }
  });

  // Decode button
  decodeBtn.addEventListener('click', async () => {
    try {
      decodeBtn.disabled = true;
      decodeBtn.textContent = '⏳ Decoding...';
      decodeBtn.classList.add('loading');

      const svgString = svgInput.value.trim();
      if (!svgString) {
        throw new Error('Please paste SVG code or upload a file');
      }

      const key = keyInput.value.trim() || null;

      // Create Timecode instance
      const T = new window.Timecode({ visualKey: key });

      // Decode
      const startTime = Date.now();
      const data = await T.dec(svgString, key);
      const decodeTime = Date.now() - startTime;

      // Display results
      preview.innerHTML = svgString;

      const formattedData = typeof data === 'object'
        ? JSON.stringify(data, null, 2)
        : data;

      result.textContent = formattedData;

      console.log('✅ Decoded data:', data);
      console.log(`⏱️  Decode time: ${decodeTime}ms`);

      output.classList.remove('hidden');

      // Scroll to output
      output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (error) {
      alert(`Decoding failed: ${error.message}\n\nMake sure you're using the correct encryption key if the SVG is encrypted.`);
      console.error(error);
    } finally {
      decodeBtn.disabled = false;
      decodeBtn.textContent = '🔓 Extract Hidden Data';
      decodeBtn.classList.remove('loading');
    }
  });

  // Copy decoded data
  copyBtn.addEventListener('click', async () => {
    const text = result.textContent;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    } catch (error) {
      alert('Failed to copy to clipboard');
    }
  });
}

// ============================================================================
// EXAMPLES
// ============================================================================

function setupExamples() {
  // Examples are triggered by onclick in HTML
}

window.loadExample = function(exampleType) {
  const examples = {
    apikey: {
      data: {
        api_key: "sk-1234567890abcdefghijklmnopqrstuvwxyz",
        endpoint: "https://api.example.com/v1",
        timeout: 5000,
        retries: 3
      },
      style: 'logo'
    },
    message: {
      data: {
        from: "Alice",
        to: "Bob",
        message: "Meet me at the usual place at midnight. 🌙",
        encrypted: true,
        timestamp: Date.now()
      },
      style: 'organic'
    },
    config: {
      data: {
        app: "MyApp",
        version: "1.0.0",
        features: ["dark_mode", "notifications", "offline_mode"],
        settings: {
          theme: "dark",
          language: "en",
          autoSave: true
        }
      },
      style: 'geometric'
    },
    ticket: {
      data: {
        event: "TIMECODE::CONFERENCE 2024",
        ticketId: "TC-2024-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        holder: "John Doe",
        seat: "A-42",
        valid: true,
        timestamp: Date.now()
      },
      style: 'qr-hybrid'
    }
  };

  const example = examples[exampleType];
  if (!example) return;

  // Switch to encode tab
  document.querySelector('[data-tab="encode"]').click();

  // Populate fields
  document.getElementById('encode-data').value = JSON.stringify(example.data, null, 2);
  document.getElementById('encode-style').value = example.style;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
