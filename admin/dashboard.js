// Auth check
if (sessionStorage.getItem('adminAuth') !== 'true') {
  window.location.href = 'login.html';
}

// Storage key
const STORAGE_KEY = 'qanater_listings';

// Specialty labels
const specialtyLabels = {
  internal: 'طب باطني', dental: 'أسنان', bones: 'عظام',
  children: 'أطفال', skin: 'جلدية', eye: 'عيون',
  ent: 'أنف وأذن وحنجرة', gynecology: 'نساء وتوليد',
  urology: 'مسالك بولية', neurology: 'أعصاب'
};

const serviceLabels = {
  pharmacies:'صيدلية', labs:'معمل تحاليل', radiology:'مركز أشعة',
  restaurants:'مطعم', cafes:'كافيه', bakeries:'مخبز/حلواني',
  schools:'مدرسة', supermarkets:'سوبر ماركت', gyms:'جيم',
  beauty:'صالون تجميل', electronics:'إلكترونيات'
};

// Load data from localStorage or fetch from JSON file
async function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  // Fetch from file as base
  try {
    const res = await fetch('../data/listings.json?t=' + Date.now());
    const data = await res.json();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch(e) {
    return { doctors: [], places: [] };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function genId(prefix) {
  return prefix + Date.now().toString(36);
}

function showAlert(id, duration = 3000) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', duration);
  }
}

// ===== TABS =====
function switchTab(name, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}

// ===== DOCTORS =====
async function saveDoctor() {
  const name = document.getElementById('docName').value.trim();
  const specialty = document.getElementById('docSpecialty').value;
  if (!name) { showAlert('docError'); return; }

  const data = await loadData();
  const doc = {
    id: genId('d'),
    name,
    specialty,
    serviceId: 'clinics',
    image: document.getElementById('docImage').value.trim(),
    phone: document.getElementById('docPhone').value.trim(),
    address: document.getElementById('docAddress').value.trim(),
    location: document.getElementById('docLocation').value.trim(),
    schedule: document.getElementById('docSchedule').value.trim(),
    fees: document.getElementById('docFees').value.trim(),
    about: document.getElementById('docAbout').value.trim(),
    rating: parseFloat(document.getElementById('docRating').value) || 0,
    reviews: 0
  };

  data.doctors = data.doctors || [];
  data.doctors.push(doc);
  saveData(data);
  showAlert('docSuccess');
  clearDoctorForm();
  renderDoctorsList(data);
}

function clearDoctorForm() {
  ['docName','docPhone','docAddress','docSchedule','docFees','docLocation','docImage','docAbout','docRating']
    .forEach(id => document.getElementById(id).value = '');
}

async function deleteDoctor(id) {
  if (!confirm('هل تريد حذف هذا الطبيب؟')) return;
  const data = await loadData();
  data.doctors = data.doctors.filter(d => d.id !== id);
  saveData(data);
  renderDoctorsList(data);
}

function renderDoctorsList(data) {
  const list = document.getElementById('doctorsList');
  const docs = data.doctors || [];
  document.getElementById('docCount').textContent = `(${docs.length})`;
  if (docs.length === 0) {
    list.innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:20px;">لا يوجد أطباء بعد</p>';
    return;
  }
  list.innerHTML = docs.map(d => `
    <div class="listing-item">
      <div class="listing-item-info">
        <div class="listing-item-name">${d.name}</div>
        <div class="listing-item-sub">${specialtyLabels[d.specialty] || d.specialty} ${d.fees ? '• ' + d.fees : ''}</div>
      </div>
      <div class="listing-item-actions">
        <button class="btn-danger" onclick="deleteDoctor('${d.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

// ===== PLACES =====
async function savePlace() {
  const name = document.getElementById('placeName').value.trim();
  const serviceId = document.getElementById('placeService').value;
  if (!name) { showAlert('placeError'); return; }

  const data = await loadData();
  const place = {
    id: genId('p'),
    name,
    serviceId,
    subcategory: '',
    image: document.getElementById('placeImage').value.trim(),
    phone: document.getElementById('placePhone').value.trim(),
    address: document.getElementById('placeAddress').value.trim(),
    location: document.getElementById('placeLocation').value.trim(),
    workingHours: document.getElementById('placeHours').value.trim(),
    about: document.getElementById('placeAbout').value.trim(),
    rating: parseFloat(document.getElementById('placeRating').value) || 0,
    reviews: 0
  };

  data.places = data.places || [];
  data.places.push(place);
  saveData(data);
  showAlert('placeSuccess');
  clearPlaceForm();
  renderPlacesList(data);
}

function clearPlaceForm() {
  ['placeName','placePhone','placeAddress','placeHours','placeLocation','placeImage','placeAbout','placeRating']
    .forEach(id => document.getElementById(id).value = '');
}

async function deletePlace(id) {
  if (!confirm('هل تريد حذف هذا المكان؟')) return;
  const data = await loadData();
  data.places = data.places.filter(p => p.id !== id);
  saveData(data);
  renderPlacesList(data);
}

function renderPlacesList(data) {
  const list = document.getElementById('placesList');
  const places = data.places || [];
  document.getElementById('placeCount').textContent = `(${places.length})`;
  if (places.length === 0) {
    list.innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:20px;">لا توجد أماكن بعد</p>';
    return;
  }
  list.innerHTML = places.map(p => `
    <div class="listing-item">
      <div class="listing-item-info">
        <div class="listing-item-name">${p.name}</div>
        <div class="listing-item-sub">${serviceLabels[p.serviceId] || p.serviceId} ${p.workingHours ? '• ' + p.workingHours : ''}</div>
      </div>
      <div class="listing-item-actions">
        <button class="btn-danger" onclick="deletePlace('${p.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

// ===== EXPORT =====
function exportListings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { alert('لا توجد بيانات للتصدير'); return; }
  const blob = new Blob([raw], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'listings.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ===== LOGOUT =====
function logout() {
  sessionStorage.removeItem('adminAuth');
  window.location.href = 'login.html';
}

// ===== INIT =====
async function init() {
  const data = await loadData();
  renderDoctorsList(data);
  renderPlacesList(data);
}

init();
