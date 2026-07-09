const ADS_KEY = 'qanater_ads';

async function loadAds() {
  const stored = localStorage.getItem(ADS_KEY);
  if (stored) { try { return JSON.parse(stored); } catch(e) {} }
  try {
    const res = await fetch('data/ads.json?t=' + Date.now());
    const data = await res.json();
    return data.ads || [];
  } catch(e) { return []; }
}

async function initAds() {
  const ads = await loadAds();
  const activeAds = ads.filter(a => a.active);
  if (!activeAds.length) return;

  // Show first active ad after 1 second
  let currentIndex = 0;
  showAd(activeAds[currentIndex], activeAds.length, currentIndex);

  // Navigation between ads
  document.getElementById('adNext')?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % activeAds.length;
    updateAdContent(activeAds[currentIndex], activeAds.length, currentIndex);
  });
  document.getElementById('adPrev')?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + activeAds.length) % activeAds.length;
    updateAdContent(activeAds[currentIndex], activeAds.length, currentIndex);
  });
}

function showAd(ad, total, index) {
  const overlay = document.getElementById('adOverlay');
  if (!overlay) return;
  updateAdContent(ad, total, index);
  setTimeout(() => {
    overlay.classList.add('active');
  }, 1000);
}

function updateAdContent(ad, total, index) {
  // Background
  const modal = document.getElementById('adModal');
  if (ad.bgColor) modal.style.background = `linear-gradient(135deg, ${ad.bgColor}ee, ${ad.bgColor}99)`;

  // Image
  const imgEl = document.getElementById('adImage');
  if (ad.image) {
    imgEl.innerHTML = `<img src="${ad.image}" alt="${ad.title}" onerror="this.parentElement.style.display='none'"/>`;
    imgEl.style.display = 'block';
  } else {
    imgEl.style.display = 'none';
  }

  // Text
  document.getElementById('adTitle').textContent = ad.title || '';
  document.getElementById('adDesc').textContent  = ad.description || '';

  // Link button
  const linkBtn = document.getElementById('adLink');
  if (ad.link) {
    linkBtn.href = ad.link;
    linkBtn.textContent = ad.linkText || 'اعرف أكثر';
    linkBtn.style.display = 'flex';
  } else {
    linkBtn.style.display = 'none';
  }

  // Dots & nav
  const dotsEl = document.getElementById('adDots');
  dotsEl.innerHTML = Array.from({length: total}, (_, i) =>
    `<span class="ad-dot ${i === index ? 'active' : ''}"></span>`
  ).join('');

  // Show/hide nav arrows
  const navEl = document.getElementById('adNav');
  navEl.style.display = total > 1 ? 'flex' : 'none';
}

function closeAd() {
  const overlay = document.getElementById('adOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.classList.add('closing');
    setTimeout(() => overlay.classList.remove('closing'), 400);
  }
}

// Close on overlay click
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('adOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAd();
  });
  initAds();
});
