const STORAGE_KEY = 'qanater_listings';

async function loadListings() {
  // Try localStorage first (admin edits)
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  // Fallback to JSON file
  try {
    const res = await fetch('../data/listings.json?t=' + Date.now());
    return await res.json();
  } catch(e) { return { doctors: [], places: [] }; }
}

async function loadServices() {
  try {
    const res = await fetch('../data/services.json?t=' + Date.now());
    return await res.json();
  } catch(e) { return { services: [] }; }
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function initService() {
  const serviceId = getParam('id');
  const subcat = getParam('sub');

  const [servicesData, listingsData] = await Promise.all([
    loadServices(),
    loadListings()
  ]);

  const service = servicesData.services.find(s => s.id === serviceId);
  if (!service) return;

  // Update header
  const subName = subcat
    ? (service.subcategories || []).find(s => s.id === subcat)?.name
    : null;
  document.getElementById('pageTitle').textContent = subName || service.name;
  document.getElementById('pageIcon').textContent = service.icon;
  document.title = `القناطر الخيرية - ${subName || service.name}`;

  // Chips section
  const chipsSection = document.getElementById('chipsSection');
  const chipsContainer = document.getElementById('chipsContainer');
  const listingsGrid = document.getElementById('listingsGrid');
  const listingsTitle = document.getElementById('listingsTitle');
  const emptyState = document.getElementById('emptyState');

  let currentDocs = [];
  let currentSubcat = subcat || 'all';

  if (service.subcategories && service.subcategories.length > 0) {
    chipsSection.classList.remove('hidden');
    
    // Add "All" chip
    const allChip = document.createElement('div');
    allChip.className = `chip ${currentSubcat === 'all' ? 'active' : ''}`;
    allChip.innerHTML = `<span class="chip-icon">${service.icon}</span> الكل`;
    allChip.onclick = () => filterDoctors('all', 'جميع الأطباء', allChip);
    chipsContainer.appendChild(allChip);

    // Add subcategories chips
    service.subcategories.forEach(sub => {
      const chip = document.createElement('div');
      chip.className = `chip ${currentSubcat === sub.id ? 'active' : ''}`;
      chip.innerHTML = `<span class="chip-icon">${sub.icon}</span> ${sub.name}`;
      chip.onclick = () => filterDoctors(sub.id, sub.name, chip);
      chipsContainer.appendChild(chip);
    });
  }

  function filterDoctors(filterId, title, activeChipEl) {
    // Update active chip
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    activeChipEl.classList.add('active');
    
    // Update title
    listingsTitle.textContent = title;
    
    // Filter docs
    let docs = listingsData.doctors || [];
    if (filterId !== 'all') {
      docs = docs.filter(d => d.specialty === filterId);
    }
    
    // Render
    renderDoctors(docs, listingsGrid);
    emptyState.classList.toggle('hidden', docs.length > 0);
  }

  // Initial Listings Load
  if (serviceId === 'clinics') {
    const docs = listingsData.doctors || [];
    let initialDocs = docs;
    if (currentSubcat !== 'all') {
      initialDocs = docs.filter(d => d.specialty === currentSubcat);
      listingsTitle.textContent = subName || 'الأطباء';
    } else {
      listingsTitle.textContent = 'جميع الأطباء';
    }
    renderDoctors(initialDocs, listingsGrid);
    emptyState.classList.toggle('hidden', initialDocs.length > 0);
  } else {
    const places = (listingsData.places || []).filter(p => p.serviceId === serviceId);
    listingsTitle.textContent = service.name;
    renderPlaces(places, listingsGrid);
    emptyState.classList.toggle('hidden', places.length > 0);
  }
}

function starBar(rating) {
  const full = Math.floor(rating || 0);
  return `<span class="stars">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span>
          <span class="rating-num">${rating}</span>`;
}

function renderDoctors(doctors, grid) {
  grid.innerHTML = '';
  doctors.forEach(doc => {
    const card = document.createElement('a');
    card.className = 'listing-card fade-in';
    card.href = `detail.html?type=doctor&id=${doc.id}`;
    const imgContent = doc.image
      ? `<img src="${doc.image}" alt="${doc.name}"/>`
      : '👨‍⚕️';
    card.innerHTML = `
      <div class="listing-img">${imgContent}</div>
      <div class="listing-info">
        <div class="listing-name">${doc.name}</div>
        <div class="listing-sub">${doc.schedule || ''}</div>
        <div class="listing-meta">
          ${doc.fees ? `<span class="listing-fee">${doc.fees}</span>` : ''}
          ${doc.rating ? starBar(doc.rating) : ''}
        </div>
      </div>
      <span class="listing-arrow">‹</span>
    `;
    grid.appendChild(card);
  });
}

function renderPlaces(places, grid) {
  grid.innerHTML = '';
  places.forEach(p => {
    const card = document.createElement('a');
    card.className = 'listing-card fade-in';
    card.href = `detail.html?type=place&id=${p.id}`;
    const imgContent = p.image
      ? `<img src="${p.image}" alt="${p.name}"/>`
      : '🏪';
    card.innerHTML = `
      <div class="listing-img">${imgContent}</div>
      <div class="listing-info">
        <div class="listing-name">${p.name}</div>
        <div class="listing-sub">${p.workingHours || ''}</div>
        <div class="listing-meta">
          ${p.rating ? starBar(p.rating) : ''}
        </div>
      </div>
      <span class="listing-arrow">‹</span>
    `;
    grid.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', initService);
