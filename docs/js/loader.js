/**
 * Component Loader
 * Loads HTML components and pages dynamically
 */

async function loadComponent(elementId, componentPath) {
  try {
    const response = await fetch(componentPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${componentPath}`);
    }
    const html = await response.text();
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
    }
  } catch (error) {
    console.error(`Error loading component ${componentPath}:`, error);
  }
}

async function loadComponents() {
  // Load header and footer
  await loadComponent('header-component', 'components/header.html');
  await loadComponent('footer-component', 'components/footer.html');

  // Load navigation tabs
  await loadComponent('tabs-component', 'components/tabs.html');

  // Load pages
  await loadComponent('encode-page', 'pages/encode.html');
  await loadComponent('decode-page', 'pages/decode.html');
  await loadComponent('library-page', 'pages/library.html');
  await loadComponent('examples-page', 'pages/examples.html');
  await loadComponent('about-page', 'pages/about.html');
}

// Load all components when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();

  // Initialize app after components are loaded
  if (typeof init === 'function') {
    init();
  }
});
