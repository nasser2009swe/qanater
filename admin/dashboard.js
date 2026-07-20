// Auth check using Supabase
document.addEventListener('DOMContentLoaded', async () => {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = 'login.html';
  } else {
    init();
  }
});

let editingDoctorId = null;
let editingPlaceId  = null;
let editingAdId = null;

const specialtyLabels = {
  internal: 'طب باطني واطفال', dental: 'أسنان', bones: 'عظام',
  skin: 'جلدية', eye: 'عيون',
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

// ===== LOAD DATA FROM SUPABASE =====
async function getDoctors() {
  const { data, error } = await supabaseClient.from('doctors').select('*');
  return error ? [] : (data || []);
}
async function getPlaces() {
  const { data, error } = await supabaseClient.from('places').select('*');
  return error ? [] : (data || []);
}
async function getAds() {
  const { data, error } = await supabaseClient.from('ads').select('*');
  return error ? [] : (data || []);
}

// ===== DOCTORS =====
async function saveDoctor() {
  const name = document.getElementById('docName').value.trim();
  const specialty = document.getElementById('docSpecialty').value;
  if (!name) { showAlert('docError'); return; }

  const phoneRaw = document.getElementById('docPhone').value.trim();
  const phones = phoneRaw ? phoneRaw.split(/[,،\-]+/).map(p => p.trim()).filter(p => p) : [];
  const whatsappIndex = parseInt(document.getElementById('docWhatsappIndex').value) || 0;

  const docData = {
    name, specialty, phones,
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

  let error;
  if (editingDoctorId) {
    docData.id = editingDoctorId;
    const res = await supabaseClient.from('doctors').upsert(docData);
    error = res.error;
    editingDoctorId = null;
    document.getElementById('saveDoctorBtn').textContent = '💾 حفظ الطبيب';
    document.getElementById('docFormTitle').textContent  = '➕ إضافة طبيب جديد';
    document.getElementById('cancelDoctorEdit').style.display = 'none';
  } else {
    docData.id = genId('d');
    docData.reviews = 0;
    const res = await supabaseClient.from('doctors').insert([docData]);
    error = res.error;
  }

  if (error) {
    console.error(error);
    showAlert('docError');
  } else {
    showAlert('docSuccess');
    clearDoctorForm();
    const docs = await getDoctors();
    renderDoctorsList(docs);
  }
}

async function editDoctor(id) {
  const docs = await getDoctors();
  const doc = docs.find(d => d.id === id);
  if (!doc) return;

  editingDoctorId = id;
  document.getElementById('docName').value     = doc.name     || '';
  document.getElementById('docSpecialty').value= doc.specialty|| 'internal';
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

  document.getElementById('saveDoctorBtn').textContent = '✏️ حفظ التعديل';
  document.getElementById('docFormTitle').textContent  = '✏️ تعديل بيانات الطبيب';
  document.getElementById('cancelDoctorEdit').style.display = 'block';

  scrollToForm('docFormCard');
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
  
  await supabaseClient.from('doctors').delete().eq('id', id);
  
  const docs = await getDoctors();
  renderDoctorsList(docs);
}

function renderDoctorsList(docs) {
  const list = document.getElementById('doctorsList');
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

  const placeData = {
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

  let error;
  if (editingPlaceId) {
    placeData.id = editingPlaceId;
    const res = await supabaseClient.from('places').upsert(placeData);
    error = res.error;
    editingPlaceId = null;
    document.getElementById('savePlaceBtn').textContent = '💾 حفظ المكان';
    document.getElementById('placeFormTitle').textContent = '➕ إضافة مكان جديد';
    document.getElementById('cancelPlaceEdit').style.display = 'none';
  } else {
    placeData.id = genId('p');
    placeData.reviews = 0;
    placeData.subcategory = '';
    const res = await supabaseClient.from('places').insert([placeData]);
    error = res.error;
  }

  if (error) {
    console.error(error);
    showAlert('placeError');
  } else {
    showAlert('placeSuccess');
    clearPlaceForm();
    const places = await getPlaces();
    renderPlacesList(places);
  }
}

async function editPlace(id) {
  const places = await getPlaces();
  const place = places.find(p => p.id === id);
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
  
  await supabaseClient.from('places').delete().eq('id', id);
  
  const places = await getPlaces();
  renderPlacesList(places);
}

function renderPlacesList(places) {
  const list = document.getElementById('placesList');
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

// ===== ADS =====
async function saveAd() {
  const title = document.getElementById('adTitle').value.trim();
  if (!title) { showAlert('adError'); return; }

  const adObj = {
    title,
    description: document.getElementById('adDesc').value.trim(),
    image:       document.getElementById('adImage').value.trim(),
    link:        document.getElementById('adLink').value.trim(),
    linkText:    document.getElementById('adLinkText').value.trim() || 'اعرف أكثر',
    bgColor:     document.getElementById('adBgColor').value,
    active:      document.getElementById('adActive').checked,
  };

  let error;
  if (editingAdId) {
    adObj.id = editingAdId;
    const res = await supabaseClient.from('ads').upsert(adObj);
    error = res.error;
    editingAdId = null;
    document.getElementById('saveAdBtn').textContent   = '💾 حفظ الإعلان';
    document.getElementById('adFormTitle').textContent = '📢 إضافة إعلان جديد';
    document.getElementById('cancelAdEdit').style.display = 'none';
  } else {
    adObj.id = genId('ad');
    const res = await supabaseClient.from('ads').insert([adObj]);
    error = res.error;
  }

  if (error) {
    console.error(error);
    showAlert('adError');
  } else {
    showAlert('adSuccess');
    clearAdForm();
    const ads = await getAds();
    renderAdsList(ads);
  }
}

async function editAd(id) {
  const ads = await getAds();
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
  
  await supabaseClient.from('ads').delete().eq('id', id);
  const ads = await getAds();
  renderAdsList(ads);
}

async function toggleAd(id) {
  const ads = await getAds();
  const ad = ads.find(a => a.id === id);
  if (ad) {
    await supabaseClient.from('ads').update({ active: !ad.active }).eq('id', id);
    const newAds = await getAds();
    renderAdsList(newAds);
  }
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

// ===== SETTINGS & EXPORT (DISABLED) =====
function saveSettings() {
  alert('هذه الميزة تم تعطيلها بعد التحديث. قم بتغيير كلمة المرور من لوحة تحكم Supabase.');
}
function exportListings() {
  alert('التصدير غير مطلوب الآن، البيانات متصلة بقاعدة البيانات (السحابة) مباشرة.');
}
function exportAds() {
  alert('التصدير غير مطلوب الآن، البيانات متصلة بقاعدة البيانات (السحابة) مباشرة.');
}

// ===== LOGOUT =====
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}

// ===== INIT =====
async function init() {
  const [docs, places, ads] = await Promise.all([getDoctors(), getPlaces(), getAds()]);
  renderDoctorsList(docs);
  renderPlacesList(places);
  renderAdsList(ads);
}

