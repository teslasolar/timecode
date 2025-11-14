# TIMECODE::STEGSVG - Web Application

Modern, component-based web application for SVG steganography.

## 📁 Structure

```
docs/
├── index.html              # Main entry point (component-based)
├── index-monolithic.html   # Backup (old single-file version)
│
├── css/                    # Stylesheets
│   └── styles.css         # Main application styles
│
├── js/                     # JavaScript modules
│   ├── loader.js          # Component loader
│   ├── lib.js             # Core steganography library
│   └── app.js             # UI logic and event handlers
│
├── components/             # Reusable UI components
│   ├── header.html        # Page header
│   ├── footer.html        # Page footer
│   └── tabs.html          # Navigation tabs
│
├── pages/                  # Page content
│   ├── encode.html        # Encode tab content
│   ├── decode.html        # Decode tab content
│   ├── examples.html      # Examples & use cases
│   └── about.html         # About & technical details
│
└── assets/                 # Static assets (images, icons, etc.)
```

## 🎯 Component System

The app uses a simple component loader to keep code organized:

- **Components**: Reusable UI pieces (header, footer, tabs)
- **Pages**: Tab content that changes based on navigation
- **Loader**: Fetches and injects HTML components on page load

## 🚀 How It Works

1. **index.html** loads with placeholder divs
2. **loader.js** fetches component HTML files
3. Components are injected into their containers
4. **app.js** initializes after components load

## 🛠️ Development

### Adding a New Page

1. Create `pages/newpage.html` with your content
2. Add container in `index.html`: `<div id="newpage-page"></div>`
3. Load in `loader.js`: `await loadComponent('newpage-page', 'pages/newpage.html')`
4. Add tab button in `components/tabs.html`

### Adding a Component

1. Create `components/newcomponent.html`
2. Add container in `index.html`: `<div id="newcomponent-component"></div>`
3. Load in `loader.js`: `await loadComponent('newcomponent-component', 'components/newcomponent.html')`

## 📦 Files

- **index.html** (1.0 KB) - Minimal, clean structure
- **styles.css** (8.8 KB) - Complete styling system
- **lib.js** (16.8 KB) - Full steganography implementation
- **app.js** (9.5 KB) - UI event handlers
- **loader.js** (0.8 KB) - Component loading system

Total: ~37 KB (excluding pako CDN dependency)

## 🌐 Deployment

Works on any static hosting:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

No build process required - pure vanilla JavaScript!

## 🔧 Dependencies

- **pako** (via CDN): Gzip compression/decompression
- No npm packages needed for the web app

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Modern mobile browsers

Requires:
- ES6+ JavaScript
- Fetch API
- Crypto.subtle API
- TextEncoder/TextDecoder

## 🎨 Styling

Modern dark theme with:
- CSS Grid for layouts
- Flexbox for components
- CSS custom properties (variables)
- Responsive design
- Smooth animations

## ⚡ Performance

- Components loaded in parallel
- Minimal JavaScript
- No framework overhead
- Fast first paint
- All processing client-side

---

**TIMECODE::STEGSVG** - Beautiful SVG steganography in your browser 🎨🔐
