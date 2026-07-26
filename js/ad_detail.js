let currentAdId = '';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (!id) {
    document.getElementById('loadingState').innerHTML = '<h2>إعلان غير صالح</h2>';
    return;
  }

  currentAdId = id;

  try {
    const { data: ad, error } = await supabaseClient
      .from('marketplace_ads')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !ad) throw error || new Error('Not found');

    renderAdDetails(ad);
    
    // Reviews setup
    if (localStorage.getItem(`qanater_reviewed_${id}`)) {
      document.getElementById('addReviewBox').style.display = 'none';
      document.getElementById('alreadyReviewedBox').style.display = 'block';
    } else {
      setupRatingInput();
    }
    loadAdReviews(id);

  } catch (err) {
    console.error(err);
    document.getElementById('loadingState').innerHTML = '<h2>هذا الإعلان تم حذفه أو غير متوفر حالياً</h2>';
  }
});

function renderAdDetails(ad) {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('adDetailMain').style.display = 'block';

  document.getElementById('detailTitle').textContent = ad.title;
  document.getElementById('detailPrice').textContent = ad.price ? `${ad.price} ج.م` : 'تواصل لمعرفة السعر';
  document.getElementById('detailAdvertiser').textContent = ad.advertiser_name;
  document.getElementById('detailDesc').textContent = ad.description || 'لا يوجد وصف مضاف.';

  // Phones
  const rawPhone = ad.advertiser_phone.replace(/\D/g, '');
  const egPhone = (rawPhone.startsWith('01') && rawPhone.length === 11) ? '2' + rawPhone : 
                  (rawPhone.startsWith('1') && rawPhone.length === 10) ? '20' + rawPhone : rawPhone;
  
  document.getElementById('btnCall').href = `tel:${rawPhone}`;
  document.getElementById('btnWhatsapp').href = `https://wa.me/${egPhone}?text=مرحباً، بخصوص إعلانك "${ad.title}" على دليل القناطر...`;

  // Images Gallery
  const imgContainer = document.getElementById('imagesContainer');
  let images = [];
  if (ad.main_image) images.push(ad.main_image);
  if (ad.images_json && Array.isArray(ad.images_json)) {
    images = images.concat(ad.images_json);
  }

  if (images.length === 0) {
    images.push('../css/1.jpg'); // placeholder
  }

  imgContainer.innerHTML = images.map(src => `
    <img src="${src}" style="height: 250px; min-width: 80%; object-fit: cover; border-radius: 12px; scroll-snap-align: center; border: 1px solid rgba(0,0,0,0.1);" onerror="this.src='../css/1.jpg'"/>
  `).join('');

  // Video
  if (ad.video_url) {
    const vidContainer = document.getElementById('videoContainer');
    const vidEl = document.getElementById('detailVideo');
    vidContainer.style.display = 'block';
    vidEl.src = ad.video_url;
  }
}

// --- REVIEWS LOGIC --- //
async function loadAdReviews(id) {
  try {
    const { data, error } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('entity_id', id)
      .eq('entity_type', 'marketplace_ad')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const list = document.getElementById('reviewsList');
    if (!data || data.length === 0) {
      list.innerHTML = '<p style="color:var(--text-light); font-size: 0.9rem;">لا توجد تعليقات حتى الآن. كن أول من يقيّم المنتج!</p>';
      return;
    }

    list.innerHTML = data.map(rev => {
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

  } catch (err) {
    console.error('Error loading reviews', err);
    document.getElementById('reviewsList').innerHTML = '<p style="color:var(--text-light);">تعذر تحميل التعليقات.</p>';
  }
}

function setupRatingInput() {
  const stars = document.querySelectorAll('#starRatingInput span');
  const hiddenInput = document.getElementById('reviewRatingVal');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-val'));
      hiddenInput.value = val;
      
      stars.forEach(s => {
        if (parseInt(s.getAttribute('data-val')) <= val) {
          s.style.color = '#f1c40f'; 
        } else {
          s.style.color = '#ccc'; 
        }
      });
    });
  });
}

async function submitAdReview() {
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
      entity_id: currentAdId,
      entity_type: 'marketplace_ad',
      user_name: name,
      rating: rating,
      comment: comment
    }]);

    if (error) throw error;

    // Trigger update rating on ad (optional, via PostgreSQL function we can add later)
    
    successEl.style.display = 'block';
    localStorage.setItem(`qanater_reviewed_${currentAdId}`, 'true');
    
    setTimeout(() => {
      document.getElementById('addReviewBox').style.display = 'none';
      document.getElementById('alreadyReviewedBox').style.display = 'block';
      loadAdReviews(currentAdId); 
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
