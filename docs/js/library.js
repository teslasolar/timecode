/**
 * Library Page JavaScript
 * Handles interactions for the code library
 */

// Wait for init to be called after components load
function initLibrary() {
  setupLibraryCategories();
  setupLibraryExamples();
}

// Setup library category tabs
function setupLibraryCategories() {
  const categoryBtns = document.querySelectorAll('.library-cat-btn');
  const categories = document.querySelectorAll('.library-category');

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;

      // Update active states
      categoryBtns.forEach(b => b.classList.remove('active'));
      categories.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetCategory = document.querySelector(`.library-category[data-category="${category}"]`);
      if (targetCategory) {
        targetCategory.classList.add('active');
      }
    });
  });
}

// Setup library example interactions
function setupLibraryExamples() {
  // Examples will be handled by global functions
  console.log('📚 Library examples ready');
}

// Load library example (called from HTML onclick)
window.loadLibraryExample = async function(exampleType) {
  console.log('Loading example:', exampleType);

  // Switch to encode tab
  document.querySelector('[data-tab="encode"]').click();

  // Load example data based on type
  const examples = {
    'qr-hybrid': {
      data: {
        qr_payload: "https://example.com/verify/ABC123",
        admin_key: "sk-1234567890abcdef",
        permissions: ["read", "write", "admin"],
        timestamp: Date.now()
      },
      style: 'qr-hybrid',
      key: 'demo-key-2024'
    },
    'artistic-qr': {
      data: {
        url: "https://timecode.dev",
        brand: "TIMECODE",
        theme: "#667EEA"
      },
      style: 'qr-hybrid',
      key: ''
    },
    'multi-layer': {
      data: {
        public_layer: "https://example.com/public",
        private_layer: {
          secret: "classified-data",
          access_level: "top-secret"
        },
        metadata: {
          created: Date.now(),
          version: "1.0"
        }
      },
      style: 'qr-hybrid',
      key: 'multi-layer-key'
    }
  };

  const example = examples[exampleType];
  if (!example) return;

  // Populate encode form
  document.getElementById('encode-data').value = JSON.stringify(example.data, null, 2);
  document.getElementById('encode-style').value = example.style;
  if (example.key) {
    document.getElementById('encode-key').value = example.key;
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Load CV agent (called from HTML onclick)
window.loadCVAgent = async function(agentType) {
  console.log('Loading CV agent:', agentType);

  alert(`🤖 ${agentType} Agent\n\nThis would launch the ${agentType} in a production environment.\n\nFor demo purposes, upload an SVG file to the Decode tab to see pattern detection in action!`);

  // Switch to decode tab
  document.querySelector('[data-tab="decode"]').click();
};

// Load use case (called from HTML onclick)
window.loadUseCase = async function(useCaseType) {
  console.log('Loading use case:', useCaseType);

  const useCases = {
    'tickets': {
      data: {
        qr_payload: "https://events.com/verify/TIX-2024-ABC123",
        ticket_id: "TIX-2024-ABC123",
        event_name: "TIMECODE::CONFERENCE 2024",
        event_date: new Date('2024-06-15').toISOString(),
        venue: "Tech Arena, SF",
        purchaser_name: "John Doe",
        purchaser_email: "john@example.com",
        ticket_type: "VIP",
        seat: "A-42",
        price: 299.99,
        special_access: ["vip_lounge", "backstage"]
      },
      style: 'qr-hybrid'
    },
    'license': {
      data: {
        qr_payload: "https://software.com/license/verify",
        license_key: "XXXX-YYYY-ZZZZ-AAAA",
        product: "Enterprise Suite",
        licensed_to: "Acme Corp",
        features: ["analytics", "api_access", "custom_branding"],
        expires: new Date('2025-12-31').getTime()
      },
      style: 'logo'
    },
    'product': {
      data: {
        qr_payload: "https://brand.com/product/XYZ789",
        serial_number: "XYZ-2024-789",
        product_name: "Premium Widget",
        manufacture_date: "2024-01-15",
        batch_id: "BATCH-456",
        authentic: true
      },
      style: 'geometric'
    },
    'card': {
      data: {
        qr_payload: "https://linkedin.com/in/johndoe",
        name: "John Doe",
        title: "Senior Engineer",
        company: "Tech Corp",
        email: "john@techcorp.com",
        phone: "+1-555-0123",
        website: "johndoe.dev",
        skills: ["JavaScript", "Python", "Go"]
      },
      style: 'logo'
    },
    'cert': {
      data: {
        qr_payload: "https://verify-cert.com/ABC123",
        certificate_id: "CERT-2024-ABC123",
        recipient: "Jane Smith",
        course: "Advanced SVG Steganography",
        issued_by: "TIMECODE Academy",
        issued_date: Date.now(),
        signature: "digital-signature-hash"
      },
      style: 'organic'
    },
    'message': {
      data: {
        qr_payload: "https://innocent-looking-url.com",
        encrypted_message: "Meet me at the usual place at midnight 🌙",
        from: "Alice",
        to: "Bob",
        timestamp: Date.now()
      },
      style: 'organic'
    }
  };

  const useCase = useCases[useCaseType];
  if (!useCase) return;

  // Switch to encode tab
  document.querySelector('[data-tab="encode"]').click();

  // Populate form
  document.getElementById('encode-data').value = JSON.stringify(useCase.data, null, 2);
  document.getElementById('encode-style').value = useCase.style;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Export for use in main app.js
if (typeof window !== 'undefined') {
  window.initLibrary = initLibrary;
}
