const STORAGE_KEY = 'qanater_listings';

async function loadListings() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) { try { return JSON.parse(stored); } catch(e) {} }
  try {
    const res = await fetch('../data/listings.json?t=' + Date.now());
    return await res.json();
  } catch(e) { return { doctors: [], places: [] }; }
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function initDetail() {
  const type = getParam('type');
  const id = getParam('id');
  const data = await loadListings();

  let item = null;
  if (type === 'doctor') {
    item = (data.doctors || []).find(d => d.id === id);
    if (item) renderDoctor(item);
  } else {
    item = (data.places || []).find(p => p.id === id);
    if (item) renderPlace(item);
  }
  if (!item) document.getElementById('detailName').textContent = 'غير موجود';
}

function starBar(rating, reviews) {
  const full = Math.floor(rating || 0);
  return `<span class="stars">${'★'.repeat(full)}${'☆'.repeat(5-full)}</span>
          <span class="rating-num">${rating}${reviews ? ' (' + reviews + ' تقييم)' : ''}</span>`;
}

function buildInfoCard(icon, label, value) {
  const card = document.createElement('div');
  card.className = 'info-card fade-in';
  card.innerHTML = `
    <div class="info-icon">${icon}</div>
    <div class="info-body">
      <div class="info-label">${label}</div>
      <div class="info-value">${value}</div>
    </div>`;
  return card;
}

function renderDoctor(doc) {
  document.title = `القناطر - ${doc.name}`;
  document.getElementById('detailName').textContent = doc.name;
  document.getElementById('profileName').textContent = doc.name;
  document.getElementById('profileSpecialty').textContent = doc.about || '';
  const imgEl = document.getElementById('profileImg');
  imgEl.innerHTML = doc.image ? `<img src="${doc.image}" alt="${doc.name}"/>` : '👨‍⚕️';
  if (doc.rating) document.getElementById('ratingRow').innerHTML = starBar(doc.rating, doc.reviews);

  const infoCards = document.getElementById('infoCards');
  [
    { icon: '📍', label: 'العنوان', value: doc.address },
    { icon: '🕐', label: 'مواعيد الكشف', value: doc.schedule || doc.workingHours },
    { icon: '💰', label: 'رسوم الكشف', value: doc.fees },
    { icon: '📞', label: 'رقم التواصل', value: (doc.phones && doc.phones.length > 0) ? doc.phones.join(' - ') : doc.phone },
  ].filter(i => i.value).forEach(i => infoCards.appendChild(buildInfoCard(i.icon, i.label, i.value)));

  const actions = document.getElementById('actionButtons');
  const phoneList = (doc.phones && doc.phones.length > 0) ? doc.phones : (doc.phone ? doc.phone.split(' - ') : []);
  const waIndex = Math.min(doc.whatsappIndex || 0, phoneList.length - 1);
  phoneList.forEach((p, idx) => {
    const label = phoneList.length > 1 ? `📞 اتصال ${idx + 1}` : '📞 اتصال';
    actions.innerHTML += `<a href="tel:${p}" class="action-btn btn-call">${label}</a>`;
  });
  if (phoneList.length > 0) {
    const waPhone = phoneList[waIndex] || phoneList[0];
    actions.innerHTML += `<a href="https://wa.me/2${waPhone.replace(/^0/, '')}" target="_blank" class="action-btn btn-whatsapp">💬 واتساب</a>`;
  }
  if (doc.location) {
    actions.innerHTML += `<a href="${doc.location}" target="_blank" class="action-btn btn-location action-btn-wide">📍 الموقع على الخريطة</a>`;
  }
  if (doc.facebook) {
    actions.innerHTML += `<a href="${doc.facebook}" target="_blank" class="action-btn btn-facebook action-btn-wide" style="background:#1877f2;color:#fff;">📘 صفحة الفيسبوك</a>`;
  }
  
  if (navigator.share) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'action-btn btn-share action-btn-wide';
    shareBtn.innerHTML = '📤 مشاركة';
    shareBtn.onclick = () => {
      navigator.share({
        title: `القناطر الخيرية - ${doc.name}`,
        text: `تعرف على ${doc.name} في القناطر الخيرية!`,
        url: window.location.href
      }).catch(err => console.log('Error sharing', err));
    };
    actions.appendChild(shareBtn);
  }
}

function renderPlace(place) {
  document.title = `القناطر - ${place.name}`;
  document.getElementById('detailName').textContent = place.name;
  document.getElementById('profileName').textContent = place.name;
  document.getElementById('profileSpecialty').textContent = place.about || '';
  const imgEl = document.getElementById('profileImg');
  imgEl.innerHTML = place.image ? `<img src="${place.image}" alt="${place.name}"/>` : '🏪';
  if (place.rating) document.getElementById('ratingRow').innerHTML = starBar(place.rating, place.reviews);

  const infoCards = document.getElementById('infoCards');
  [
    { icon: '📍', label: 'العنوان', value: place.address },
    { icon: '🕐', label: 'ساعات العمل', value: place.workingHours },
    { icon: '📞', label: 'رقم التواصل', value: place.phone },
  ].filter(i => i.value).forEach(i => infoCards.appendChild(buildInfoCard(i.icon, i.label, i.value)));

  const actions = document.getElementById('actionButtons');
  const placePhones = (place.phones && place.phones.length > 0) ? place.phones : (place.phone ? place.phone.split(' - ') : []);
  const waIdxPlace = Math.min(place.whatsappIndex || 0, placePhones.length - 1);
  placePhones.forEach((p, idx) => {
    const label = placePhones.length > 1 ? `📞 اتصال ${idx + 1}` : '📞 اتصال';
    actions.innerHTML += `<a href="tel:${p}" class="action-btn btn-call">${label}</a>`;
  });
  if (placePhones.length > 0) {
    const waPhone = placePhones[waIdxPlace] || placePhones[0];
    actions.innerHTML += `<a href="https://wa.me/2${waPhone.replace(/^0/, '')}" target="_blank" class="action-btn btn-whatsapp">💬 واتساب</a>`;
  }
  if (place.location) {
    actions.innerHTML += `<a href="${place.location}" target="_blank" class="action-btn btn-location action-btn-wide">📍 الموقع على الخريطة</a>`;
  }
  if (place.facebook) {
    actions.innerHTML += `<a href="${place.facebook}" target="_blank" class="action-btn btn-facebook action-btn-wide" style="background:#1877f2;color:#fff;">📘 صفحة الفيسبوك</a>`;
  }

  if (navigator.share) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'action-btn btn-share action-btn-wide';
    shareBtn.innerHTML = '📤 مشاركة';
    shareBtn.onclick = () => {
      navigator.share({
        title: `القناطر الخيرية - ${place.name}`,
        text: `تعرف على ${place.name} في القناطر الخيرية!`,
        url: window.location.href
      }).catch(err => console.log('Error sharing', err));
    };
    actions.appendChild(shareBtn);
  }
}

document.addEventListener('DOMContentLoaded', initDetail);
