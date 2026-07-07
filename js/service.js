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

  // Subcategories section
  const subSection = document.getElementById('subcategoriesSection');
  const subGrid = document.getElementById('subcategoriesGrid');

  if (!subcat && service.subcategories && service.subcategories.length > 0) {
    subSection.classList.remove('hidden');
    service.subcategories.forEach(sub => {
      const card = document.createElement('a');
      card.className = 'sub-card fade-in';
      card.href = `service.html?id=${serviceId}&sub=${sub.id}`;
      card.innerHTML = `<span class="sub-icon">${sub.icon}</span><span class="sub-name">${sub.name}</span>`;
      subGrid.appendChild(card);
    });
  }

  // Listings
  const listingsGrid = document.getElementById('listingsGrid');
  const listingsTitle = document.getElementById('listingsTitle');
  const emptyState = document.getElementById('emptyState');

  let items = [];

  if (serviceId === 'clinics') {
    let docs = listingsData.doctors || [];
    if (subcat) {
      docs = docs.filter(d => d.specialty === subcat);
      listingsTitle.textContent = subName || 'الأطباء';
    } else {
      listingsTitle.textContent = 'جميع الأطباء';
    }
    items = docs;
    renderDoctors(docs, listingsGrid);
  } else {
    const places = (listingsData.places || []).filter(p => p.serviceId === serviceId);
    listingsTitle.textContent = service.name;
    items = places;
    renderPlaces(places, listingsGrid);
  }

  if (items.length === 0) {
    emptyState.classList.remove('hidden');
  }
}

function starBar(rating) {
  const full = Math.floor(rating || 0);
  return `<span class="stars">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span>
          <span class="rating-num">${rating}</span>`;
}

function renderDoctors(doctors, grid) {
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
