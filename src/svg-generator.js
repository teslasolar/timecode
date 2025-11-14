/**
 * SVG Generator with Artistic Styles
 * Creates beautiful SVG images in various styles: geometric, organic, logo, qr-hybrid
 */

export class SVGGenerator {
  constructor(width = 800, height = 800, style = 'geometric', seed = Date.now()) {
    this.width = width;
    this.height = height;
    this.style = style;
    this.seed = seed;
    this.rng = this.seededRandom(seed);
  }

  /**
   * Seeded random number generator
   */
  seededRandom(seed) {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  /**
   * Generate SVG based on selected style
   */
  generate(dataSize) {
    switch (this.style) {
      case 'geometric':
        return this.generateGeometric(dataSize);
      case 'organic':
        return this.generateOrganic(dataSize);
      case 'logo':
        return this.generateLogo(dataSize);
      case 'qr-hybrid':
        return this.generateQRHybrid(dataSize);
      default:
        return this.generateGeometric(dataSize);
    }
  }

  /**
   * Geometric style - abstract shapes and patterns
   */
  generateGeometric(dataSize) {
    const elements = [];
    const colors = this.generateColorPalette();
    const numShapes = Math.max(20, Math.ceil(dataSize / 50));

    // Create paths for coordinate hiding
    const paths = [];
    for (let i = 0; i < Math.min(numShapes, 50); i++) {
      const path = this.generateGeometricPath();
      paths.push({
        d: path.d,
        pathData: path.pathData,
        fill: colors[i % colors.length],
        opacity: 0.7 + this.rng() * 0.3
      });
    }

    // Create gradient definitions
    const gradients = [];
    const numGradients = Math.min(10, Math.ceil(dataSize / 100));
    for (let i = 0; i < numGradients; i++) {
      gradients.push({
        id: `grad${i}`,
        stops: [
          { offset: 0, color: colors[i % colors.length] },
          { offset: 0.5, color: colors[(i + 1) % colors.length] },
          { offset: 1, color: colors[(i + 2) % colors.length] }
        ]
      });
    }

    return {
      paths,
      gradients,
      colors,
      background: this.generateBackground()
    };
  }

  /**
   * Organic style - flowing curves and natural patterns
   */
  generateOrganic(dataSize) {
    const elements = [];
    const colors = this.generateColorPalette('organic');
    const numCurves = Math.max(15, Math.ceil(dataSize / 60));

    const paths = [];
    for (let i = 0; i < Math.min(numCurves, 40); i++) {
      const path = this.generateOrganicCurve();
      paths.push({
        d: path.d,
        pathData: path.pathData,
        fill: 'none',
        stroke: colors[i % colors.length],
        strokeWidth: 2 + this.rng() * 3,
        opacity: 0.6 + this.rng() * 0.4
      });
    }

    const gradients = [];
    const numGradients = Math.min(8, Math.ceil(dataSize / 120));
    for (let i = 0; i < numGradients; i++) {
      gradients.push({
        id: `grad${i}`,
        type: 'radial',
        stops: [
          { offset: 0, color: colors[i % colors.length] },
          { offset: 1, color: colors[(i + 1) % colors.length] }
        ]
      });
    }

    return {
      paths,
      gradients,
      colors,
      background: this.generateBackground('organic')
    };
  }

  /**
   * Logo style - clean, modern, iconic shapes
   */
  generateLogo(dataSize) {
    const colors = this.generateColorPalette('logo');
    const paths = [];

    // Central iconic shape
    const centerPath = this.generateLogoShape();
    paths.push({
      d: centerPath.d,
      pathData: centerPath.pathData,
      fill: colors[0],
      opacity: 1.0
    });

    // Additional decorative elements
    const numElements = Math.min(10, Math.ceil(dataSize / 100));
    for (let i = 0; i < numElements; i++) {
      const path = this.generateLogoElement(i, numElements);
      paths.push({
        d: path.d,
        pathData: path.pathData,
        fill: colors[(i + 1) % colors.length],
        opacity: 0.8 + this.rng() * 0.2
      });
    }

    return {
      paths,
      gradients: [{
        id: 'grad0',
        stops: [
          { offset: 0, color: colors[0] },
          { offset: 1, color: colors[1] }
        ]
      }],
      colors,
      background: '#FFFFFF'
    };
  }

  /**
   * QR-Hybrid style - QR code aesthetics with artistic flair
   */
  generateQRHybrid(dataSize) {
    const colors = this.generateColorPalette('qr');
    const paths = [];
    const gridSize = Math.ceil(Math.sqrt(dataSize / 8));
    const cellSize = Math.min(this.width, this.height) / gridSize;

    // Create QR-like grid
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (this.rng() > 0.5) {
          const path = this.generateQRCell(x * cellSize, y * cellSize, cellSize);
          paths.push({
            d: path.d,
            pathData: path.pathData,
            fill: colors[0],
            opacity: 0.9 + this.rng() * 0.1
          });
        }
      }
    }

    // Add artistic overlay
    const overlayPath = this.generateArtisticOverlay();
    paths.push({
      d: overlayPath.d,
      pathData: overlayPath.pathData,
      fill: 'none',
      stroke: colors[1],
      strokeWidth: 2,
      opacity: 0.5
    });

    return {
      paths,
      gradients: [],
      colors,
      background: '#FFFFFF'
    };
  }

  /**
   * Generate color palette based on style
   */
  generateColorPalette(style = 'default') {
    const palettes = {
      default: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
      organic: ['#2A9D8F', '#E76F51', '#F4A261', '#E9C46A', '#264653'],
      logo: ['#667EEA', '#764BA2', '#F093FB', '#4FACFE', '#00F2FE'],
      qr: ['#000000', '#667EEA', '#764BA2']
    };

    return palettes[style] || palettes.default;
  }

  /**
   * Generate geometric path
   */
  generateGeometricPath() {
    const cx = this.rng() * this.width;
    const cy = this.rng() * this.height;
    const size = 50 + this.rng() * 150;
    const sides = Math.floor(3 + this.rng() * 5);

    const pathData = [];
    const commands = [];

    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = cx + Math.cos(angle) * size;
      const y = cy + Math.sin(angle) * size;

      if (i === 0) {
        pathData.push({ type: 'M', x, y });
        commands.push(`M ${x} ${y}`);
      } else {
        pathData.push({ type: 'L', x, y });
        commands.push(`L ${x} ${y}`);
      }
    }

    return { d: commands.join(' ') + ' Z', pathData };
  }

  /**
   * Generate organic curve
   */
  generateOrganicCurve() {
    const startX = this.rng() * this.width;
    const startY = this.rng() * this.height;
    const pathData = [{ type: 'M', x: startX, y: startY }];
    const commands = [`M ${startX} ${startY}`];

    const numPoints = 3 + Math.floor(this.rng() * 5);

    for (let i = 0; i < numPoints; i++) {
      const x1 = this.rng() * this.width;
      const y1 = this.rng() * this.height;
      const x2 = this.rng() * this.width;
      const y2 = this.rng() * this.height;
      const x = this.rng() * this.width;
      const y = this.rng() * this.height;

      pathData.push({ type: 'C', x1, y1, x2, y2, x, y });
      commands.push(`C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`);
    }

    return { d: commands.join(' '), pathData };
  }

  /**
   * Generate logo shape (abstract symbol)
   */
  generateLogoShape() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const size = Math.min(this.width, this.height) * 0.3;

    const pathData = [
      { type: 'M', x: cx, y: cy - size },
      { type: 'C', x1: cx + size, y1: cy - size, x2: cx + size, y2: cy, x: cx + size, y: cy },
      { type: 'C', x1: cx + size, y1: cy + size, x2: cx, y2: cy + size, x: cx, y: cy + size },
      { type: 'C', x1: cx - size, y1: cy + size, x2: cx - size, y2: cy, x: cx - size, y: cy },
      { type: 'C', x1: cx - size, y1: cy - size, x2: cx, y2: cy - size, x: cx, y: cy - size }
    ];

    const commands = pathData.map((cmd, i) => {
      if (cmd.type === 'M') return `M ${cmd.x} ${cmd.y}`;
      if (cmd.type === 'C') return `C ${cmd.x1} ${cmd.y1}, ${cmd.x2} ${cmd.y2}, ${cmd.x} ${cmd.y}`;
      return '';
    });

    return { d: commands.join(' ') + ' Z', pathData };
  }

  /**
   * Generate logo decorative element
   */
  generateLogoElement(index, total) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = (index / total) * Math.PI * 2;
    const distance = Math.min(this.width, this.height) * 0.4;

    const x = cx + Math.cos(angle) * distance;
    const y = cy + Math.sin(angle) * distance;
    const size = 20 + this.rng() * 30;

    const pathData = [];
    const commands = [];

    for (let i = 0; i <= 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const px = x + Math.cos(a) * size;
      const py = y + Math.sin(a) * size;

      if (i === 0) {
        pathData.push({ type: 'M', x: px, y: py });
        commands.push(`M ${px} ${py}`);
      } else {
        pathData.push({ type: 'L', x: px, y: py });
        commands.push(`L ${px} ${py}`);
      }
    }

    return { d: commands.join(' ') + ' Z', pathData };
  }

  /**
   * Generate QR cell
   */
  generateQRCell(x, y, size) {
    const pathData = [
      { type: 'M', x, y },
      { type: 'L', x: x + size, y },
      { type: 'L', x: x + size, y: y + size },
      { type: 'L', x, y: y + size }
    ];

    return {
      d: `M ${x} ${y} L ${x + size} ${y} L ${x + size} ${y + size} L ${x} ${y + size} Z`,
      pathData
    };
  }

  /**
   * Generate artistic overlay for QR
   */
  generateArtisticOverlay() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const radius = Math.min(this.width, this.height) * 0.3;

    const pathData = [];
    const commands = [];

    for (let i = 0; i <= 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      if (i === 0) {
        pathData.push({ type: 'M', x, y });
        commands.push(`M ${x} ${y}`);
      } else {
        pathData.push({ type: 'L', x, y });
        commands.push(`L ${x} ${y}`);
      }
    }

    return { d: commands.join(' ') + ' Z', pathData };
  }

  /**
   * Generate background
   */
  generateBackground(style = 'default') {
    if (style === 'organic') {
      return '#F7F7F2';
    }
    return '#FAFAFA';
  }
}
