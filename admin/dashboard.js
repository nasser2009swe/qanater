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
  ent: 'أنف وأذن وحنجرة', women: 'نساء وتوليد', heart: 'قلب وأوعية دموية',
  brain: 'مخ وأعصاب ونفسية', speech: 'تخاطب وتعديل سلوك', surgery: 'جراحة عامة',
  physio: 'علاج طبيعي', chest: 'صدر وجهاز تنفسي', general: 'تخصصات أخرى'
};

const serviceLabels = {
  pharmacies:'صيدلية', labs:'معمل تحاليل', radiology:'مركز أشعة',
  restaurants:'مطعم', cafes:'كافيه', bakeries:'مخبز/حلواني',
  schools:'مدرسة', supermarkets:'سوبر ماركت', gyms:'جيم',
  beauty:'صالون تجميل', electronics:'إلكترونيات',
  nurseries: 'حضانات', travel: 'سياحة وسفر', clothing: 'محلات ملابس', other: 'أخرى'
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

  // Parse phones: split by comma or dash, clean up
  const phoneRaw = document.getElementById('docPhone').value.trim();
  const phones = phoneRaw ? phoneRaw.split(/[,،\-]+/).map(p => p.trim()).filter(p => p) : [];
  const whatsappIndex = parseInt(document.getElementById('docWhatsappIndex').value) || 0;

  const data = await loadData();
  data.doctors = data.doctors || [];

  const docData = {
    name, specialty,
    phones,
    phone: phones.join(' - '),
    whatsappIndex,
    image:    document.getElementById('docImage').value.trim(),
    address:  document.getElementById('docAddress').value.trim(),
    location: document.getElementById('docLocation').value.trim(),
    facebook: document.getElementById('docFacebook').value.trim(),
    schedule: document.getElementById('docSchedule').value.trim(),
    fees:     document.getElementById('docFees').value.trim(),
    about:    document.getElementById('docAbout').value.trim(),
    rating:   parseFloat(document.getElementById('docRating').value) || 0,
    serviceId: 'clinics',
  };

  if (editingDoctorId) {
    const idx = data.doctors.findIndex(d => d.id === editingDoctorId);
    if (idx !== -1) {
      data.doctors[idx] = { ...data.doctors[idx], ...docData };
    }
    editingDoctorId = null;
    document.getElementById('saveDoctorBtn').textContent = '\u{1F4BE} \u062D\u0641\u0638 \u0627\u0644\u0637\u0628\u064A\u0628';
    document.getElementById('docFormTitle').textContent  = '\u{2795} \u0625\u0636\u0627\u0641\u0629 \u0637\u0628\u064A\u0628 \u062C\u062F\u064A\u062F';
    document.getElementById('cancelDoctorEdit').style.display = 'none';
  } else {
    data.doctors.push({ id: genId('d'), reviews: 0, ...docData });
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
    // Show phones joined by comma for editing
    const phonesDisplay = doc.phones && doc.phones.length > 0 ? doc.phones.join(', ') : (doc.phone || '');
    document.getElementById('docPhone').value    = phonesDisplay;
    document.getElementById('docWhatsappIndex').value = doc.whatsappIndex || 0;
    document.getElementById('docAddress').value  = doc.address  || '';
    document.getElementById('docSchedule').value = doc.schedule || '';
    document.getElementById('docFees').value     = doc.fees     || '';
    document.getElementById('docLocation').value = doc.location || '';
    document.getElementById('docFacebook').value = doc.facebook || '';
    document.getElementById('docImage').value    = doc.image    || '';
    document.getElementById('docAbout').value    = doc.about    || '';
    document.getElementById('docRating').value   = doc.rating   || '';

    document.getElementById('saveDoctorBtn').textContent = '\u270F\uFE0F \u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644';
    document.getElementById('docFormTitle').textContent  = '\u270F\uFE0F \u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0628';
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
  ['docName','docPhone','docAddress','docSchedule','docFees','docLocation','docFacebook','docImage','docAbout','docRating']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('docSpecialty').selectedIndex = 0;
  document.getElementById('docWhatsappIndex').selectedIndex = 0;
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
        facebook:     document.getElementById('placeFacebook').value.trim(),
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
      facebook:     document.getElementById('placeFacebook').value.trim(),
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
    document.getElementById('placeFacebook').value= place.facebook     || '';
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
  ['placeName','placePhone','placeAddress','placeHours','placeLocation','placeFacebook','placeImage','placeAbout','placeRating']
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

// ===== ADS =====
const ADS_KEY = 'qanater_ads';
let editingAdId = null;

async function loadAds() {
  const stored = localStorage.getItem(ADS_KEY);
  if (stored) { try { return JSON.parse(stored); } catch(e) {} }
  try {
    const res = await fetch('../data/ads.json?t=' + Date.now());
    const data = await res.json();
    const ads = data.ads || [];
    localStorage.setItem(ADS_KEY, JSON.stringify(ads));
    return ads;
  } catch(e) { return []; }
}

function saveAdsData(ads) { localStorage.setItem(ADS_KEY, JSON.stringify(ads)); }

async function saveAd() {
  const title = document.getElementById('adTitle').value.trim();
  if (!title) { showAlert('adError'); return; }

  const ads = await loadAds();
  const adObj = {
    title,
    description: document.getElementById('adDesc').value.trim(),
    image:       document.getElementById('adImage').value.trim(),
    link:        document.getElementById('adLink').value.trim(),
    linkText:    document.getElementById('adLinkText').value.trim() || 'اعرف أكثر',
    bgColor:     document.getElementById('adBgColor').value,
    active:      document.getElementById('adActive').checked,
  };

  if (editingAdId) {
    const idx = ads.findIndex(a => a.id === editingAdId);
    if (idx !== -1) ads[idx] = { ...ads[idx], ...adObj };
    editingAdId = null;
    document.getElementById('saveAdBtn').textContent   = '💾 حفظ الإعلان';
    document.getElementById('adFormTitle').textContent = '📢 إضافة إعلان جديد';
    document.getElementById('cancelAdEdit').style.display = 'none';
  } else {
    ads.push({ id: genId('ad'), ...adObj });
  }

  saveAdsData(ads);
  showAlert('adSuccess');
  clearAdForm();
  renderAdsList(ads);
}

function editAd(id) {
  loadAds().then(ads => {
    const ad = ads.find(a => a.id === id);
    if (!ad) return;
    editingAdId = id;
    document.getElementById('adTitle').value    = ad.title       || '';
    document.getElementById('adDesc').value     = ad.description || '';
    document.getElementById('adImage').value    = ad.image       || '';
    document.getElementById('adLink').value     = ad.link        || '';
    document.getElementById('adLinkText').value = ad.linkText    || '';
    document.getElementById('adBgColor').value  = ad.bgColor     || '#1B4F72';
    document.getElementById('adActive').checked = ad.active !== false;
    document.getElementById('saveAdBtn').textContent   = '✏️ حفظ التعديل';
    document.getElementById('adFormTitle').textContent = '✏️ تعديل الإعلان';
    document.getElementById('cancelAdEdit').style.display = 'block';
    scrollToForm('adFormCard');
  });
}

function cancelAdEdit() {
  editingAdId = null;
  clearAdForm();
  document.getElementById('saveAdBtn').textContent   = '💾 حفظ الإعلان';
  document.getElementById('adFormTitle').textContent = '📢 إضافة إعلان جديد';
  document.getElementById('cancelAdEdit').style.display = 'none';
}

function clearAdForm() {
  ['adTitle','adDesc','adImage','adLink','adLinkText'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('adBgColor').value  = '#1B4F72';
  document.getElementById('adActive').checked = true;
}

async function deleteAd(id) {
  if (!confirm('هل تريد حذف هذا الإعلان؟')) return;
  if (editingAdId === id) cancelAdEdit();
  const ads = (await loadAds()).filter(a => a.id !== id);
  saveAdsData(ads);
  renderAdsList(ads);
}

async function toggleAd(id) {
  const ads = await loadAds();
  const idx = ads.findIndex(a => a.id === id);
  if (idx !== -1) ads[idx].active = !ads[idx].active;
  saveAdsData(ads);
  renderAdsList(ads);
}

function renderAdsList(ads) {
  const list = document.getElementById('adsList');
  document.getElementById('adCount').textContent = `(${ads.length})`;
  if (!ads.length) {
    list.innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:20px;">لا توجد إعلانات بعد</p>';
    return;
  }
  list.innerHTML = ads.map(a => `
    <div class="listing-item">
      <div class="listing-item-info">
        <div class="listing-item-name">${a.title}</div>
        <div style="margin-top:4px;">
          <span class="${a.active ? 'ad-active-badge' : 'ad-inactive-badge'}">${a.active ? '● مفعّل' : '○ معطّل'}</span>
        </div>
      </div>
      <div class="listing-item-actions">
        <button class="btn-edit" onclick="toggleAd('${a.id}')" title="${a.active ? 'إيقاف' : 'تفعيل'}">${a.active ? '⏸' : '▶'}</button>
        <button class="btn-edit" onclick="editAd('${a.id}')">✏️</button>
        <button class="btn-danger" onclick="deleteAd('${a.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
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

function exportAds() {
  const raw = localStorage.getItem(ADS_KEY);
  if (!raw) { alert('لا توجد إعلانات للتصدير'); return; }
  const blob = new Blob([JSON.stringify({ ads: JSON.parse(raw) }, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'ads.json'; a.click();
  URL.revokeObjectURL(url);
}

// ===== LOGOUT =====
function logout() {
  sessionStorage.removeItem('adminAuth');
  window.location.href = 'login.html';
}

// ===== INIT =====
async function init() {
  const [data, ads] = await Promise.all([loadData(), loadAds()]);
  renderDoctorsList(data);
  renderPlacesList(data);
  renderAdsList(ads);
}

init();

