document.addEventListener('DOMContentLoaded', () => {
  // Inject Dark Mode Button
  const darkModeBtn = document.createElement('button');
  darkModeBtn.id = 'darkModeBtn';
  darkModeBtn.className = 'floating-btn visible';
  darkModeBtn.innerHTML = localStorage.getItem('theme') === 'dark' ? '☀️' : '🌙';
  document.body.appendChild(darkModeBtn);

  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }

  darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    darkModeBtn.innerHTML = isDark ? '☀️' : '🌙';
  });

  // Inject Back To Top Button
  const backBtn = document.createElement('button');
  backBtn.id = 'backToTopBtn';
  backBtn.className = 'floating-btn';
  backBtn.innerHTML = '↑';
  document.body.appendChild(backBtn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  });

  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== PWA INSTALLATION LOGIC =====
  let deferredPrompt;

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    // GitHub Pages base path is usually /qanater/
    const basePath = window.location.pathname.includes('/qanater/') ? '/qanater/' : '/';
    navigator.serviceWorker.register(basePath + 'sw.js').then(registration => {
      console.log('SW Registered!', registration);
    }).catch(err => {
      console.log('SW Registration failed', err);
    });
  }

  // Handle the install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    
    // Check if we already asked recently (optional, let's just show it)
    if (localStorage.getItem('pwaPromptClosed')) return;

    // Create the banner
    const banner = document.createElement('div');
    banner.className = 'pwa-banner';
    banner.innerHTML = `
      <div class="pwa-info">
        <span class="pwa-icon">🌊</span>
        <div class="pwa-text">
          <h4>تطبيق القناطر</h4>
          <p>أضف الموقع للشاشة الرئيسية لسهولة الوصول</p>
        </div>
      </div>
      <div class="pwa-actions">
        <button class="pwa-btn" id="pwaInstallBtn">تثبيت</button>
        <button class="pwa-close" id="pwaCloseBtn">✖</button>
      </div>
    `;
    document.body.appendChild(banner);

    // Show it with a slight delay
    setTimeout(() => {
      banner.classList.add('show');
    }, 2000);

    document.getElementById('pwaInstallBtn').addEventListener('click', async () => {
      banner.classList.remove('show');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      deferredPrompt = null;
    });

    document.getElementById('pwaCloseBtn').addEventListener('click', () => {
      banner.classList.remove('show');
      localStorage.setItem('pwaPromptClosed', 'true');
    });
  });
});
