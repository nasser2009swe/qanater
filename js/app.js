// ===== DATA LAYER =====
async function loadJSON(path) {
  try {
    const res = await fetch(path + '?t=' + Date.now());
    if (!res.ok) throw new Error('not found');
    return await res.json();
  } catch(e) {
    return null;
  }
}

// ===== HOME PAGE =====
async function initHome() {
  const data = await loadJSON('data/services.json');
  if (!data) return;
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;

  renderServices(data.services, grid);

  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        renderServices(data.services, grid);
        document.getElementById('noResults').classList.add('hidden');
      } else {
        const filtered = data.services.filter(s =>
          s.name.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q))
        );
        renderServices(filtered, grid);
        document.getElementById('noResults').classList.toggle('hidden', filtered.length > 0);
      }
    });
  }
}

function renderServices(services, grid) {
  grid.innerHTML = '';
  services.forEach(s => {
    const card = document.createElement('a');
    card.className = 'service-card fade-in';
    card.href = `pages/service.html?id=${s.id}`;
    card.style.setProperty('--card-color', s.color || '#1B4F72');
    card.innerHTML = `
      <span class="service-emoji">${s.icon}</span>
      <span class="service-name">${s.name}</span>
    `;
    grid.appendChild(card);
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', initHome);
