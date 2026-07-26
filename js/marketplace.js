document.addEventListener('DOMContentLoaded', async () => {
  const feedContainer = document.getElementById('feedContainer');
  const loader = document.getElementById('marketLoader');

  try {
    const { data: ads, error } = await supabaseClient
      .from('marketplace_ads')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;

    loader.style.display = 'none';

    if (!ads || ads.length === 0) {
      feedContainer.innerHTML = `
        <div style="color:#fff; text-align:center; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:100%;">
          <div style="font-size:3rem; margin-bottom:10px;">🛒</div>
          <h2>لا توجد إعلانات حالياً</h2>
          <p style="color:rgba(255,255,255,0.6);">كن أول من يضيف إعلانه في القناطر!</p>
        </div>
      `;
      return;
    }

    renderFeed(ads, feedContainer);
    setupIntersectionObserver();

  } catch (err) {
    console.error('Error fetching ads', err);
    loader.textContent = '❌ حدث خطأ في تحميل الإعلانات';
  }
});

function renderFeed(ads, container) {
  ads.forEach((ad, index) => {
    const isVideo = ad.video_url && ad.video_url.trim() !== '';
    const mediaHtml = isVideo 
      ? `<video src="${ad.video_url}" class="feed-media" loop playsinline ${index === 0 ? 'autoplay' : ''}></video>
         <div class="play-overlay">▶</div>`
      : `<img src="${ad.main_image || '../css/1.jpg'}" class="feed-media" alt="Ad Image"/>`;

    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `
      ${mediaHtml}
      
      <div class="action-sidebar">
        <div class="action-btn" onclick="likeAd('${ad.id}', this)">
          <div class="action-icon" style="color: #fff;">❤️</div>
          <span class="action-text">إعجاب</span>
        </div>
        <a href="ad_detail.html?id=${ad.id}" class="action-btn">
          <div class="action-icon">💬</div>
          <span class="action-text">${ad.reviews_count || 0}</span>
        </a>
        <a href="https://wa.me/${ad.advertiser_phone.replace(/\D/g, '').startsWith('01') ? '2'+ad.advertiser_phone.replace(/\D/g, '') : ad.advertiser_phone.replace(/\D/g, '')}" target="_blank" class="action-btn">
          <div class="action-icon" style="background:#25D366;">📲</div>
          <span class="action-text">واتساب</span>
        </a>
      </div>

      <div class="feed-info">
        <div class="feed-advertiser">👤 ${ad.advertiser_name}</div>
        <div class="feed-title">${ad.title}</div>
        ${ad.price ? `<div class="feed-price">${ad.price} ج.م</div>` : ''}
        <a href="ad_detail.html?id=${ad.id}" class="view-details-btn">التفاصيل والصور ➔</a>
      </div>
    `;

    // Add click to play/pause if it's a video
    if (isVideo) {
      item.addEventListener('click', (e) => {
        // Prevent if clicking on sidebar or buttons
        if(e.target.closest('.action-sidebar') || e.target.closest('.feed-info')) return;
        
        const vid = item.querySelector('video');
        if(vid) {
          if(vid.paused) {
            vid.play();
            item.classList.remove('is-paused');
          } else {
            vid.pause();
            item.classList.add('is-paused');
          }
        }
      });
    }

    container.appendChild(item);
  });
}

function setupIntersectionObserver() {
  const videos = document.querySelectorAll('video.feed-media');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const vid = entry.target;
      const item = vid.closest('.feed-item');
      if (entry.isIntersecting) {
        // Play video when in view
        vid.play().then(() => {
          item.classList.remove('is-paused');
        }).catch(e => {
          console.log("Autoplay prevented", e);
          item.classList.add('is-paused'); // Show play button if browser blocks autoplay
        });
      } else {
        // Pause video when out of view
        vid.pause();
        item.classList.remove('is-paused');
      }
    });
  }, {
    threshold: 0.6 // 60% of the video must be visible
  });

  videos.forEach(vid => observer.observe(vid));
}

function likeAd(id, btnElement) {
  const icon = btnElement.querySelector('.action-icon');
  // Simple visual toggle for now
  if (icon.style.color === 'rgb(231, 76, 60)') {
    icon.style.color = '#fff';
  } else {
    icon.style.color = '#e74c3c';
  }
}
