const STORAGE_KEY = 'qanater_listings';

async function loadListings() {
  const [doctorsRes, placesRes] = await Promise.all([
    supabaseClient.from('doctors').select('*'),
    supabaseClient.from('places').select('*')
  ]);
  return {
    doctors: doctorsRes.data || [],
    places: placesRes.data || []
  };
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
    const cleanWaPhone = waPhone.replace(/\\D/g, '').replace(/^0/, '');
    actions.innerHTML += `<a href="https://wa.me/20${cleanWaPhone}" target="_blank" class="action-btn btn-whatsapp">\uD83D\uDCAC واتساب</a>`;
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
    const cleanWaPhone = waPhone.replace(/\\D/g, '').replace(/^0/, '');
    actions.innerHTML += `<a href="https://wa.me/20${cleanWaPhone}" target="_blank" class="action-btn btn-whatsapp">\uD83D\uDCAC واتساب</a>`;
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

// --- Reviews Logic ---
let currentEntityType = 'doctor';
let currentEntityId = '';

async function loadEntityReviews(id) {
  try {
    const { data, error } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('entity_id', id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    renderReviewsList(data || []);
  } catch (err) {
    console.error('Error loading reviews', err);
    document.getElementById('reviewsList').innerHTML = '<p style="color:rgba(255,255,255,0.5);">تعذر تحميل التعليقات.</p>';
  }
}

function renderReviewsList(reviews) {
  const list = document.getElementById('reviewsList');
  if (!reviews || reviews.length === 0) {
    list.innerHTML = '<p style="color:var(--text-light); font-size: 0.9rem;">لا توجد تعليقات حتى الآن. كن أول من يقيّم!</p>';
    return;
  }

  list.innerHTML = reviews.map(rev => {
    const date = new Date(rev.created_at).toLocaleDateString('ar-EG');
    return `
      <div style="background: var(--card-bg); border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; padding: 14px; box-shadow: var(--shadow);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong style="font-size: 0.95rem; color: var(--text-dark);">${rev.user_name}</strong>
          <span style="font-size: 0.8rem; color: var(--text-light);">${date}</span>
        </div>
        <div style="margin-bottom: 8px;">
          <span style="color: #f1c40f; font-size: 1rem;">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</span>
        </div>
        <p style="margin: 0; font-size: 0.9rem; color: var(--text-mid); line-height: 1.5;">${rev.comment || ''}</p>
      </div>
    `;
  }).join('');
}

function setupRatingInput() {
  const stars = document.querySelectorAll('#starRatingInput span');
  const hiddenInput = document.getElementById('reviewRatingVal');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-val'));
      hiddenInput.value = val;
      
      // Update UI
      stars.forEach(s => {
        if (parseInt(s.getAttribute('data-val')) <= val) {
          s.style.color = '#f1c40f'; // Yellow
        } else {
          s.style.color = '#ccc'; // Gray
        }
      });
    });
  });
}

async function submitReview() {
  const name = document.getElementById('reviewName').value.trim() || 'زائر';
  const comment = document.getElementById('reviewComment').value.trim();
  const rating = parseInt(document.getElementById('reviewRatingVal').value);

  const errorEl = document.getElementById('reviewError');
  const successEl = document.getElementById('reviewSuccess');
  const btn = document.getElementById('submitReviewBtn');

  if (rating === 0) {
    errorEl.style.display = 'block';
    setTimeout(() => errorEl.style.display = 'none', 3000);
    return;
  }

  btn.textContent = 'جاري الإرسال...';
  btn.disabled = true;

  try {
    const { error } = await supabaseClient.from('reviews').insert([{
      entity_id: currentEntityId,
      entity_type: currentEntityType,
      user_name: name,
      rating: rating,
      comment: comment
    }]);

    if (error) throw error;

    // Success
    successEl.style.display = 'block';
    localStorage.setItem(`qanater_reviewed_${currentEntityId}`, 'true');
    
    // Hide form, show thanks
    setTimeout(() => {
      document.getElementById('addReviewBox').style.display = 'none';
      document.getElementById('alreadyReviewedBox').style.display = 'block';
      loadEntityReviews(currentEntityId); // Reload list
    }, 1500);

  } catch (err) {
    console.error('Submit error:', err);
    errorEl.textContent = '❌ حدث خطأ أثناء الإرسال.';
    errorEl.style.display = 'block';
    setTimeout(() => errorEl.style.display = 'none', 3000);
    btn.textContent = 'نشر التقييم';
    btn.disabled = false;
  }
}

// Override initDetail slightly to set up reviews
const originalInitDetail = initDetail;
initDetail = async function() {
  await originalInitDetail();
  
  const type = getParam('type');
  const id = getParam('id');
  if (!id) return;

  currentEntityType = type;
  currentEntityId = id;

  // Check if already reviewed
  if (localStorage.getItem(`qanater_reviewed_${id}`)) {
    document.getElementById('addReviewBox').style.display = 'none';
    document.getElementById('alreadyReviewedBox').style.display = 'block';
  } else {
    setupRatingInput();
  }

  // Load reviews
  loadEntityReviews(id);
};

document.addEventListener('DOMContentLoaded', initDetail);
