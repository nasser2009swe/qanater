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
  const [data, listings] = await Promise.all([
    loadJSON('data/services.json'),
    loadJSON('data/listings.json')
  ]);
  
  if (!data) return;
  const grid = document.getElementById('servicesGrid');
  const searchResultsGrid = document.getElementById('searchResultsGrid');
  const homeSectionTitle = document.getElementById('homeSectionTitle');
  if (!grid) return;

  renderServices(data.services, grid);

  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        grid.classList.remove('hidden');
        searchResultsGrid.classList.add('hidden');
        searchResultsGrid.innerHTML = '';
        homeSectionTitle.textContent = 'الخدمات المتاحة';
        renderServices(data.services, grid);
        document.getElementById('noResults').classList.add('hidden');
      } else {
        homeSectionTitle.textContent = 'نتائج البحث';
        
        // Search categories
        const filteredServices = data.services.filter(s =>
          s.name.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q))
        );
        
        // Search doctors and places
        let filteredListings = [];
        if (listings) {
          const allItems = [...(listings.doctors || []), ...(listings.places || [])];
          filteredListings = allItems.filter(item => 
            item.name.toLowerCase().includes(q) || 
            (item.specialty && item.specialty.toLowerCase().includes(q)) ||
            (item.about && item.about.toLowerCase().includes(q))
          );
        }

        grid.classList.toggle('hidden', filteredServices.length === 0);
        renderServices(filteredServices, grid);

        if (filteredListings.length > 0) {
          searchResultsGrid.classList.remove('hidden');
          renderSearchResults(filteredListings, searchResultsGrid);
        } else {
          searchResultsGrid.classList.add('hidden');
          searchResultsGrid.innerHTML = '';
        }

        const hasResults = filteredServices.length > 0 || filteredListings.length > 0;
        document.getElementById('noResults').classList.toggle('hidden', hasResults);
      }
    });
  }
}

function renderSearchResults(items, grid) {
  grid.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('a');
    card.className = 'listing-card fade-in';
    // Determine type based on serviceId
    const isDoctor = item.serviceId === 'clinics';
    card.href = `pages/detail.html?type=${isDoctor ? 'doctor' : 'place'}&id=${item.id}`;
    
    const imgContent = item.image ? `<img src="${item.image}" alt="${item.name}"/>` : (isDoctor ? '👨‍⚕️' : '🏪');
    const subText = item.schedule || item.workingHours || '';
    
    let ratingHtml = '';
    if (item.rating) {
      const full = Math.floor(item.rating);
      ratingHtml = `<span class="stars">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span><span class="rating-num">${item.rating}</span>`;
    }

    card.innerHTML = `
      <div class="listing-img">${imgContent}</div>
      <div class="listing-info">
        <div class="listing-name">${item.name}</div>
        <div class="listing-sub">${subText}</div>
        <div class="listing-meta">
          ${item.fees ? `<span class="listing-fee">${item.fees}</span>` : ''}
          ${ratingHtml}
        </div>
      </div>
      <span class="listing-arrow">‹</span>
    `;
    grid.appendChild(card);
  });
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
