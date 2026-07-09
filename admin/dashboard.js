// Auth check
if (sessionStorage.getItem('adminAuth') !== 'true') {
  window.location.href = 'login.html';
}

const STORAGE_KEY = 'qanater_listings';

// Edit state - stores ID being edited (null = add mode)
let editingDoctorId = null;
let editingPlaceId  = null;

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

async function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) { try { return JSON.parse(stored); } catch(e) {} }
  try {
    const res = await fetch('../data/listings.json?t=' + Date.now());
    const data = await res.json();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch(e) { return { doctors: [], places: [] }; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function genId(prefix) { return prefix + Date.now().toString(36); }

function showAlert(id, duration = 3000) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'block'; setTimeout(() => el.style.display = 'none', duration); }
}

// ===== TABS =====
function switchTab(name, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}

// ===== SCROLL TO FORM =====
function scrollToForm(formId) {
  const el = document.getElementById(formId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== DOCTORS =====
async function saveDoctor() {
  const name     = document.getElementById('docName').value.trim();
  const specialty = document.getElementById('docSpecialty').value;
  if (!name) { showAlert('docError'); return; }

  const data = await loadData();
  data.doctors = data.doctors || [];

  if (editingDoctorId) {
    // UPDATE existing
    const idx = data.doctors.findIndex(d => d.id === editingDoctorId);
    if (idx !== -1) {
      data.doctors[idx] = {
        ...data.doctors[idx],
        name, specialty,
        image:    document.getElementById('docImage').value.trim(),
        phone:    document.getElementById('docPhone').value.trim(),
        address:  document.getElementById('docAddress').value.trim(),
        location: document.getElementById('docLocation').value.trim(),
        schedule: document.getElementById('docSchedule').value.trim(),
        fees:     document.getElementById('docFees').value.trim(),
        about:    document.getElementById('docAbout').value.trim(),
        rating:   parseFloat(document.getElementById('docRating').value) || 0,
      };
    }
    editingDoctorId = null;
    document.getElementById('saveDoctorBtn').textContent = '💾 حفظ الطبيب';
    document.getElementById('docFormTitle').textContent  = '➕ إضافة طبيب جديد';
    document.getElementById('cancelDoctorEdit').style.display = 'none';
  } else {
    // ADD new
    data.doctors.push({
      id: genId('d'), name, specialty, serviceId: 'clinics',
      image:    document.getElementById('docImage').value.trim(),
      phone:    document.getElementById('docPhone').value.trim(),
      address:  document.getElementById('docAddress').value.trim(),
      location: document.getElementById('docLocation').value.trim(),
      schedule: document.getElementById('docSchedule').value.trim(),
      fees:     document.getElementById('docFees').value.trim(),
      about:    document.getElementById('docAbout').value.trim(),
      rating:   parseFloat(document.getElementById('docRating').value) || 0,
      reviews:  0
    });
  }

  saveData(data);
  showAlert('docSuccess');
  clearDoctorForm();
  renderDoctorsList(data);
}

function editDoctor(id) {
  loadData().then(data => {
    const doc = (data.doctors || []).find(d => d.id === id);
    if (!doc) return;

    editingDoctorId = id;
    document.getElementById('docName').value     = doc.name     || '';
    document.getElementById('docSpecialty').value= doc.specialty|| 'internal';
    document.getElementById('docPhone').value    = doc.phone    || '';
    document.getElementById('docAddress').value  = doc.address  || '';
    document.getElementById('docSchedule').value = doc.schedule || '';
    document.getElementById('docFees').value     = doc.fees     || '';
    document.getElementById('docLocation').value = doc.location || '';
    document.getElementById('docImage').value    = doc.image    || '';
    document.getElementById('docAbout').value    = doc.about    || '';
    document.getElementById('docRating').value   = doc.rating   || '';

    document.getElementById('saveDoctorBtn').textContent = '✏️ حفظ التعديل';
    document.getElementById('docFormTitle').textContent  = '✏️ تعديل بيانات الطبيب';
    document.getElementById('cancelDoctorEdit').style.display = 'block';

    scrollToForm('docFormCard');
  });
}

function cancelDoctorEdit() {
  editingDoctorId = null;
  clearDoctorForm();
  document.getElementById('saveDoctorBtn').textContent = '💾 حفظ الطبيب';
  document.getElementById('docFormTitle').textContent  = '➕ إضافة طبيب جديد';
  document.getElementById('cancelDoctorEdit').style.display = 'none';
}

function clearDoctorForm() {
  ['docName','docPhone','docAddress','docSchedule','docFees','docLocation','docImage','docAbout','docRating']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('docSpecialty').selectedIndex = 0;
}

async function deleteDoctor(id) {
  if (!confirm('هل تريد حذف هذا الطبيب؟')) return;
  if (editingDoctorId === id) cancelDoctorEdit();
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
        <div class="listing-item-sub">${specialtyLabels[d.specialty] || d.specialty}${d.fees ? ' • ' + d.fees : ''}</div>
      </div>
      <div class="listing-item-actions">
        <button class="btn-edit" onclick="editDoctor('${d.id}')">✏️</button>
        <button class="btn-danger" onclick="deleteDoctor('${d.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

// ===== PLACES =====
async function savePlace() {
  const name      = document.getElementById('placeName').value.trim();
  const serviceId = document.getElementById('placeService').value;
  if (!name) { showAlert('placeError'); return; }

  const data = await loadData();
  data.places = data.places || [];

  if (editingPlaceId) {
    // UPDATE existing
    const idx = data.places.findIndex(p => p.id === editingPlaceId);
    if (idx !== -1) {
      data.places[idx] = {
        ...data.places[idx],
        name, serviceId,
        image:        document.getElementById('placeImage').value.trim(),
        phone:        document.getElementById('placePhone').value.trim(),
        address:      document.getElementById('placeAddress').value.trim(),
        location:     document.getElementById('placeLocation').value.trim(),
        workingHours: document.getElementById('placeHours').value.trim(),
        about:        document.getElementById('placeAbout').value.trim(),
        rating:       parseFloat(document.getElementById('placeRating').value) || 0,
      };
    }
    editingPlaceId = null;
    document.getElementById('savePlaceBtn').textContent = '💾 حفظ المكان';
    document.getElementById('placeFormTitle').textContent = '➕ إضافة مكان جديد';
    document.getElementById('cancelPlaceEdit').style.display = 'none';
  } else {
    // ADD new
    data.places.push({
      id: genId('p'), name, serviceId, subcategory: '',
      image:        document.getElementById('placeImage').value.trim(),
      phone:        document.getElementById('placePhone').value.trim(),
      address:      document.getElementById('placeAddress').value.trim(),
      location:     document.getElementById('placeLocation').value.trim(),
      workingHours: document.getElementById('placeHours').value.trim(),
      about:        document.getElementById('placeAbout').value.trim(),
      rating:       parseFloat(document.getElementById('placeRating').value) || 0,
      reviews:      0
    });
  }

  saveData(data);
  showAlert('placeSuccess');
  clearPlaceForm();
  renderPlacesList(data);
}

function editPlace(id) {
  loadData().then(data => {
    const place = (data.places || []).find(p => p.id === id);
    if (!place) return;

    editingPlaceId = id;
    document.getElementById('placeName').value    = place.name         || '';
    document.getElementById('placeService').value = place.serviceId    || 'pharmacies';
    document.getElementById('placePhone').value   = place.phone        || '';
    document.getElementById('placeAddress').value = place.address      || '';
    document.getElementById('placeHours').value   = place.workingHours || '';
    document.getElementById('placeLocation').value= place.location     || '';
    document.getElementById('placeImage').value   = place.image        || '';
    document.getElementById('placeAbout').value   = place.about        || '';
    document.getElementById('placeRating').value  = place.rating       || '';

    document.getElementById('savePlaceBtn').textContent  = '✏️ حفظ التعديل';
    document.getElementById('placeFormTitle').textContent = '✏️ تعديل بيانات المكان';
    document.getElementById('cancelPlaceEdit').style.display = 'block';

    scrollToForm('placeFormCard');
  });
}

function cancelPlaceEdit() {
  editingPlaceId = null;
  clearPlaceForm();
  document.getElementById('savePlaceBtn').textContent   = '💾 حفظ المكان';
  document.getElementById('placeFormTitle').textContent = '➕ إضافة مكان جديد';
  document.getElementById('cancelPlaceEdit').style.display = 'none';
}

function clearPlaceForm() {
  ['placeName','placePhone','placeAddress','placeHours','placeLocation','placeImage','placeAbout','placeRating']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('placeService').selectedIndex = 0;
}

async function deletePlace(id) {
  if (!confirm('هل تريد حذف هذا المكان؟')) return;
  if (editingPlaceId === id) cancelPlaceEdit();
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
        <div class="listing-item-sub">${serviceLabels[p.serviceId] || p.serviceId}${p.workingHours ? ' • ' + p.workingHours : ''}</div>
      </div>
      <div class="listing-item-actions">
        <button class="btn-edit" onclick="editPlace('${p.id}')">✏️</button>
        <button class="btn-danger" onclick="deletePlace('${p.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

// ===== SETTINGS =====
async function saveSettings() {
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value.trim();
  const confirm  = document.getElementById('confirmPassword').value.trim();

  if (!username || !password || !confirm) { showAlert('settingsError'); return; }
  if (password !== confirm) {
    document.getElementById('settingsError').textContent = '❌ كلمتا المرور غير متطابقتين';
    showAlert('settingsError'); return;
  }

  let config = {};
  try {
    const res = await fetch('../data/config.json?t=' + Date.now());
    config = await res.json();
  } catch(e) {}

  config.username = username;
  config.password = password;
  localStorage.setItem('qanater_config', JSON.stringify(config));

  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'config.json'; a.click();
  URL.revokeObjectURL(url);

  document.getElementById('newUsername').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  showAlert('settingsSuccess');
}

// ===== EXPORT =====
function exportListings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { alert('لا توجد بيانات للتصدير'); return; }
  const blob = new Blob([raw], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'listings.json'; a.click();
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
