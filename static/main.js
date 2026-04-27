/**
 * NANOfusion Main logic module
 * Handles Reveal System, Branding patches, and UI enhancements.
 */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });

const syncHeroText = async (heading) => {
  try {
    const { supabase } = await import('./supabase-config.js');
    const { data, error } = await supabase.from('site_config').select('value').eq('key', 'hero_title').single();
    if (!error && data) {
      heading.innerHTML = data.value;
      console.log('NANOfusion: Hero text synchronizován');
    } else {
      heading.innerHTML = 'Špičková péče o to,<br><span style="color: #f59e0b;">co jste usilovně vybudovali</span>';
    }
  } catch (e) {
    heading.innerHTML = 'Špičková péče o to,<br><span style="color: #f59e0b;">co jste usilovně vybudovali</span>';
  }
};

const observeAll = () => {
  document.querySelectorAll('.section-reveal:not(.observed)').forEach(el => {
    revealObserver.observe(el);
    el.classList.add('observed');
  });

  // Dynamic Text Replacement & Layout Fix
  const heroHeading = document.querySelector('h1.font-heading');
  if (heroHeading && (heroHeading.textContent.includes('co jste vybudovali') || heroHeading.textContent.includes('Čistíme')) && !heroHeading.dataset.updated) {
    syncHeroText(heroHeading);
    heroHeading.style.fontSize = 'min(7vw, 64px)';
    heroHeading.style.lineHeight = '1.1';
    heroHeading.style.fontWeight = '900';
    heroHeading.style.letterSpacing = '-0.02em';

    const parentContainer = heroHeading.closest('.max-w-2xl') || heroHeading.parentElement;
    if (parentContainer) {
      parentContainer.style.maxWidth = '1000px';
      parentContainer.classList.remove('max-w-2xl');
      parentContainer.classList.add('max-w-4xl');
    }
    heroHeading.dataset.updated = 'true';
  }

  // Remove header phone number
  const navPhone = document.querySelector('header a[href="tel:+420774509409"]');
  if (navPhone) navPhone.remove();

  // Update Header Logo (excluding chatbot)
  const headerLogos = document.querySelectorAll('header img:not(.chat-logo):not(.ai-chat-launcher img), nav img:not(.chat-logo)');
  headerLogos.forEach(img => {
    if ((img.src.includes('logo.jpg') || img.src.includes('logo-nav.jpg')) && !img.closest('#ai-chat-launcher') && !img.closest('#ai-chat-window')) {
      img.src = '/static/nanofusion-long.png';
      img.style.height = '75px';
      img.style.width = 'auto';
    }
  });

  // Inject Portfolio & Galerie & Blog Links into Navigation
  const navLinks = Array.from(document.querySelectorAll('header nav a, header div a'));
  const referenceLink = navLinks.find(a => a.textContent.trim() === 'Reference');

  if (referenceLink) {
    // Standardize all hash links to be root-relative ONLY if on a subpage
    const isRoot = window.location.pathname === '/' || window.location.pathname === '/index.html';
    navLinks.forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        if (!isRoot) a.href = '/' + href;
      }
    });

    if (!document.querySelector('a[href="#galerie"]')) {
      const galleryLink = referenceLink.cloneNode(true);
      galleryLink.textContent = 'Galerie';
      galleryLink.href = '#galerie';
      referenceLink.parentNode.insertBefore(galleryLink, referenceLink.nextSibling);
    }

    if (!document.querySelector('a[href="#blog"]')) {
      const blogLink = referenceLink.cloneNode(true);
      blogLink.textContent = 'Blog';
      blogLink.href = '#blog';
      referenceLink.parentNode.insertBefore(blogLink, referenceLink.nextSibling);
    }

    // Set active state for links
    const currentPath = window.location.pathname;
    document.querySelectorAll('header nav a').forEach(a => {
      if (a.getAttribute('href') === currentPath || (currentPath === '/' && a.getAttribute('href') === '/')) {
        a.style.color = '#f59e0b';
      } else {
        // Only reset if it was previously set by us or matches known color
        if (a.style.color === 'rgb(245, 158, 11)' || a.style.color === '#f59e0b') {
          a.style.color = '';
        }
      }
    });
  }

  // Update Footer Style & Logo
  const footer = document.querySelector('footer');
  if (footer) {
    footer.style.backgroundColor = '#111111'; // Pure deep black to bleed into logo background
    footer.classList.remove('bg-neutral-900', 'bg-slate-900');
  }

  const footerLogos = document.querySelectorAll('footer img');
  footerLogos.forEach(img => {
    if (img.src.includes('logo.jpg') || img.src.includes('logo-nav.jpg') || img.src.includes('logo_dark.jpg') || img.src.includes('nanofusion-long')) {
      img.src = '/static/nanofusion-long.png';
      img.style.height = '75px';
      img.style.width = 'auto';

      const parent = img.parentElement;
      if (parent && parent.classList.contains('bg-white') && parent.classList.contains('p-2')) {
        parent.style.background = 'transparent';
        parent.style.padding = '0';
      }
    }
  });

  // Update IČO
  const footerTexts = document.querySelectorAll('footer p.text-xs.text-neutral-500');
  footerTexts.forEach(p => {
    if (p.textContent.includes('IČ:')) {
      p.innerHTML = `© 2026 NANOfusion s.r.o. | IČ: 29375363 | 
        <a href="https://eshop.nanofusion.cz" target="_blank" style="color: inherit; text-decoration: none; margin-left: 10px; border-bottom: 1px solid #444;">E-shop</a> | 
        <a href="https://nanofusion-j3bs.vercel.app/admin/login" style="color: #f59e0b; font-weight: 700; text-decoration: none; margin-left: 5px;">Zaměstnanci</a>`;
    }
  });

  // Format Footer Description Text
  const footerDescTexts = document.querySelectorAll('footer p.text-sm.text-neutral-400');
  footerDescTexts.forEach(p => {
    if (!p.dataset.brUpdated && (p.textContent.includes('Od roku 2012') || p.textContent.includes('13 let') || p.textContent.includes('12 let'))) {
      p.innerHTML = 'Profesionální čištění, impregnace a nátěry.<br>Již 14 let pečujeme o váš majetek po celé ČR.';
      p.dataset.brUpdated = 'true';
    }
  });

  // Update Experience Stats
  const statsLabels = document.querySelectorAll('div, p, span, h2, h3, h4');
  statsLabels.forEach(el => {
    if (el.children.length === 0) {
      if (el.textContent.includes('12 let zkušeností') || el.textContent.includes('13 let zkušeností')) {
        el.textContent = el.textContent.replace('12 let zkušeností', '14 let zkušeností').replace('13 let zkušeností', '14 let zkušeností');
      }
      if ((el.textContent.trim() === '12' || el.textContent.trim() === '13') && el.nextElementSibling && el.nextElementSibling.textContent.includes('Let zkušeností')) {
        el.textContent = '14';
      }
    }
  });

  // Dynamic Gallery Data Fetching
  let galleryShowcaseData = [];

  const fetchGalleryData = async () => {
    try {
      const { supabase } = await import('./supabase-config.js');
      const { data, error } = await supabase
        .from('realizations')
        .select('*, realization_photos(*)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        galleryShowcaseData = data.map(r => ({
          id: r.id,
          title: r.title,
          category: (r.work_type || 'Realizace').toUpperCase(),
          description: r.description || '',
          image: r.realization_photos?.sort((a, b) => a.order_index - b.order_index)[0]?.url || 'https://images.unsplash.com/photo-1635339001328-8007ebfd4a60?w=800',
          photos: r.realization_photos?.sort((a, b) => a.order_index - b.order_index).map(p => p.url) || [],
          location: r.location,
          duration: r.duration
        }));
        renderGalleryItems();
      }
    } catch (e) {
      console.error('Gallery Fetch Error:', e);
    }
  };

  const renderGalleryItems = () => {
    const scroller = document.getElementById('gallery-scroller-inner');
    if (!scroller) return;

    scroller.innerHTML = galleryShowcaseData.map(item => `
      <div class="gallery-item-v" onclick="window.nnf_openGallery('${item.id}')" style="flex: 0 0 450px; background: #0f172a; border-radius: 2rem; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.3s ease;">
          <div style="height: 250px; position: relative;">
              <img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
              <div class="gallery-item-overlay" style="position:absolute; inset:0; background:linear-gradient(to top, rgba(15,23,42,0.6), transparent); opacity:0; transition:opacity 0.3s; display:flex; align-items:center; justify-content:center;">
                <span style="background:white; color:#0f172a; padding:0.75rem 1.5rem; border-radius:1rem; font-weight:800; font-size:0.8rem; transform:translateY(20px); transition:transform 0.3s;">DETAIL PROJEKTU</span>
              </div>
          </div>
          <div style="padding: 2rem;">
              <div style="color: #f59e0b; font-weight: 800; font-size: 0.75rem; letter-spacing: 0.1em; margin-bottom: 0.5rem;">${item.category}</div>
              <h3 style="color: white; font-weight: 800; font-size: 1.25rem; margin-bottom: 1rem; line-height: 1.2;">${item.title}</h3>
              <div style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6; height: 3.2rem; overflow: hidden;">${item.description.replace(/<[^>]*>/g, '').substring(0, 85)}...</div>
          </div>
      </div>
    `).join('');
  };


  window.nnf_openGallery = (id) => {
    const item = galleryShowcaseData.find(g => String(g.id) === String(id));
    if (!item) return;

    let overlay = document.getElementById('gallery-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'gallery-modal-overlay';
      overlay.style.cssText = 'position:fixed; inset:0; background:rgba(15,23,42,0.95); backdrop-filter:blur(20px); z-index:999999; display:none; align-items:center; justify-content:center; padding:20px;';
      document.body.appendChild(overlay);
    }

    const photos = item.photos && item.photos.length > 0 ? item.photos : [item.image];
    const mainPhoto = photos[0];

    const thumbsHtml = photos.length > 1 ? `
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 1fr)); gap:12px; margin-top:25px;">
        ${photos.map((p, i) => `
          <div onclick="document.getElementById('gallery-main-img').src='${p}'; Array.from(this.parentElement.children).forEach(el=>el.style.borderColor='transparent'); this.style.borderColor='#f59e0b'" 
               style="aspect-ratio:4/3; border-radius:14px; overflow:hidden; cursor:pointer; border:2px solid ${i === 0 ? '#f59e0b' : 'transparent'}; transition:all 0.2s; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
            <img src="${p}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
          </div>
        `).join('')}
      </div>
    ` : '';

    overlay.innerHTML = `
      <div class="modal-content-premium" style="background:white; width:100%; max-width:1100px; max-height:95vh; border-radius:40px; overflow:hidden; display:flex; flex-direction:column; position:relative; box-shadow:0 50px 100px rgba(0,0,0,0.6); animation: modalEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1);">
        <button onclick="document.getElementById('gallery-modal-overlay').style.display='none'" style="position:absolute; top:25px; right:25px; background:white; border:none; width:54px; height:54px; border-radius:50%; cursor:pointer; font-size:32px; z-index:100; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 30px rgba(0,0,0,0.15); transition:all 0.3s; color:#0f172a;" onmouseenter="this.style.transform='rotate(90deg) scale(1.1)'" onmouseleave="this.style.transform='rotate(0deg) scale(1)'">&times;</button>
        
        <div style="flex: 1; overflow-y:auto; scrollbar-width:none; -ms-overflow-style:none;">
          <div style="height:550px; position:relative; background:#f1f5f9; overflow:hidden;">
            <img id="gallery-main-img" src="${mainPhoto}" style="width:100%; height:100%; object-fit:cover; transition: opacity 0.4s ease;" onclick="window.open(this.src, '_blank')">
            <div style="position:absolute; bottom:20px; right:20px; background:rgba(0,0,0,0.5); color:white; padding:8px 16px; border-radius:99px; font-size:12px; backdrop-filter:blur(5px); pointer-events:none;">
              Kliknutím na obrázek jej otevřete v plné velikosti
            </div>
          </div>
          
          <div style="padding:60px; background:white;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:50px; margin-bottom:40px;">
              <div style="flex:1; min-width:300px;">
                <div style="display:flex; gap:10px; margin-bottom:15px; flex-wrap:wrap;">
                   <span style="color:#f59e0b; font-weight:800; text-transform:uppercase; font-size:13px; letter-spacing:0.15em; background:#fff7ed; padding:5px 15px; border-radius:99px;">${item.category}</span>
                   ${item.location ? `<span style="background:#f1f5f9; color:#64748b; font-weight:700; font-size:13px; padding:5px 15px; border-radius:99px;">📍 ${item.location}</span>` : ''}
                   ${item.duration ? `<span style="background:#f1f5f9; color:#64748b; font-weight:700; font-size:13px; padding:5px 15px; border-radius:99px;">⏱ ${item.duration}</span>` : ''}
                </div>
                <h2 style="font-size:48px; font-weight:900; color:#0f172a; line-height:1.1; margin-bottom:25px; letter-spacing:-0.03em;">${item.title}</h2>
                <div class="w-24 h-2 bg-amber-500 rounded-full mb-10"></div>
                <div style="font-size:19px; line-height:1.9; color:#475569; font-weight:500; margin-bottom:40px;">${item.description}</div>
                
                <h4 style="font-weight:900; text-transform:uppercase; font-size:14px; letter-spacing:0.1em; color:#94a3b8; margin-bottom:20px;">Galerie záběrů z realizace</h4>
                ${thumbsHtml}
              </div>
              
              <div style="width:100%; max-width:380px; background:#0f172a; padding:50px; border-radius:40px; color:white; box-shadow:0 30px 60px rgba(15,23,42,0.3); position:sticky; top:20px;">
                <h4 style="font-weight:900; font-size:26px; margin-bottom:15px; line-height:1.2;">Chcete stejný výsledek u vás?</h4>
                <p style="font-size:16px; opacity:0.8; margin-bottom:35px; line-height:1.7;">Zanechte nám vzkaz nebo si nechte spočítat orientační cenu přes náš AI chat.</p>
                <button onclick="document.getElementById('gallery-modal-overlay').style.display='none'; setTimeout(() => document.getElementById('ai-chat-launcher').click(), 300)" 
                  style="width:100%; background:#f59e0b; color:white; border:none; padding:22px; border-radius:22px; font-weight:900; cursor:pointer; font-size:15px; letter-spacing:0.05em; text-transform:uppercase; transition:all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow:0 15px 30px rgba(245, 158, 11, 0.3);"
                  onmouseenter="this.style.transform='translateY(-5px) scale(1.02)'; this.style.boxShadow='0 20px 40px rgba(245, 158, 11, 0.4)'"
                  onmouseleave="this.style.transform='translateY(0) scale(1)'">
                  CHCI NEZÁVAZNOU KALKULACI 💬
                </button>
                <div style="margin-top:30px; display:flex; align-items:center; gap:15px; opacity:0.6;">
                  <div style="width:10px; height:10px; background:#22c55e; border-radius:50%;"></div>
                  <span style="font-size:13px; font-weight:700;">Specialista online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>
        @keyframes modalEnter {
          from { opacity:0; transform:scale(0.95) translateY(40px); }
          to { opacity:1; transform:scale(1) translateY(0); }
        }
        .modal-content-premium::-webkit-scrollbar { display: none; }
        .gallery-item-v:hover .gallery-item-overlay { opacity: 1 !important; display: flex !important; }
        .gallery-item-v:hover .gallery-item-overlay span { transform: translateY(0) !important; }
      </style>
    `;
    overlay.style.display = 'flex';
  };

    overlay.style.display = 'flex';
  };

  // Inject Gallery Section (Single Page Architecture)
  const injectGallery = () => {
    let gallerySection = document.getElementById('galerie');
    const referenceSection = document.getElementById('reference');
    if (!gallerySection && referenceSection) {
      gallerySection = document.createElement('section');
      gallerySection.id = 'galerie';
      gallerySection.className = 'pt-24 pb-32 bg-white relative overflow-hidden';
      referenceSection.parentNode.insertBefore(gallerySection, referenceSection.nextSibling);

      gallerySection.innerHTML = `
        <div class="container mx-auto px-4">
            <div class="text-center mb-16">
                <div style="color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.875rem; margin-bottom: 1rem;">GALERIE REALIZACÍ</div>
                <h2 class="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-heading">Špičková péče o váš majetek v detailech</h2>
                <div class="w-20 h-1 bg-amber-500 mx-auto rounded-full"></div>
            </div>
        </div>

        <div class="relative max-w-[1550px] mx-auto px-4 md:px-20">
          <!-- Navigation Arrows Above the Track -->
          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-bottom: 2rem;">
            <button id="gallery-prev" class="w-12 h-12 md:w-16 md:h-16 rounded-full text-white flex items-center justify-center hover:scale-110 active:scale-95 border-none transition-all shadow-[0_4px_25px_rgba(245,158,11,0.4)]" style="background-color: #f59e0b !important; cursor: pointer;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>
            </button>
            <button id="gallery-next" class="w-12 h-12 md:w-16 md:h-16 rounded-full text-white flex items-center justify-center hover:scale-110 active:scale-95 border-none transition-all shadow-[0_4px_25px_rgba(245,158,11,0.4)]" style="background-color: #f59e0b !important; cursor: pointer;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"></path></svg>
            </button>
          </div>

          <div id="gallery-scroller-inner" style="display: flex; gap: 1.5rem; overflow-x: auto; scroll-behavior: smooth; padding: 1rem 0 3rem; -ms-overflow-style: none; scrollbar-width: none;">
            <style>#gallery-scroller-inner::-webkit-scrollbar { display: none; }</style>
            
            <!-- Dynamic Gallery Track -->
            <div id="gallery-track-placeholder" style="display:flex; gap:1.5rem;">
               <div style="flex:0 0 450px; height:400px; background:#f1f5f9; border-radius:2rem; animate:pulse 2s infinite;"></div>
               <div style="flex:0 0 450px; height:400px; background:#f1f5f9; border-radius:2rem; animate:pulse 2s infinite; opacity:0.5;"></div>
            </div>
          </div>
        </div>
      `;

      fetchGalleryData();



      // JS Scroll Logic
      const scroller = document.getElementById('gallery-scroller-inner');
      const nextBtn = document.getElementById('gallery-next');
      const prevBtn = document.getElementById('gallery-prev');
      let scrollInterval;
      let isPaused = false;

      const performJump = (dir) => {
        const jumpAmount = scroller.clientWidth > 1000 ? 474 : 350; // Dynamic jump amount based on card width
        scroller.scrollBy({ left: dir * jumpAmount, behavior: 'smooth' });
      };

      const startAutoJump = () => {
        scrollInterval = setInterval(() => {
          if (!isPaused) {
            if (scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 100) {
              scroller.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
              performJump(1);
            }
          }
        }, 5000);
      };

      startAutoJump();

      scroller.addEventListener('mouseenter', () => isPaused = true);
      scroller.addEventListener('mouseleave', () => isPaused = false);
      nextBtn.addEventListener('click', () => { performJump(1); isPaused = true; setTimeout(() => isPaused = false, 15000); });
      prevBtn.addEventListener('click', () => { performJump(-1); isPaused = true; setTimeout(() => isPaused = false, 15000); });
    }
  };
  injectGallery();

  // Add Social Icons in Footer
  const socialLinks = document.querySelectorAll('footer a[href*="facebook.com"], footer a[href*="instagram.com"], footer a[href*="linkedin.com"], footer a[href*="youtube.com"], footer a[href*="tiktok.com"]');
  if (socialLinks.length > 0) {
    const socialParent = socialLinks[0].closest('ul') || socialLinks[0].parentElement;

    // Senior CTO: Inject TikTok if missing
    const hasTikTok = Array.from(socialLinks).some(l => l.href.includes('tiktok.com'));
    if (!hasTikTok && socialParent) {
      const ttLi = document.createElement('li');
      const ttA = document.createElement('a');
      ttA.href = 'https://www.tiktok.com/@nano_fusion_cz';
      ttA.textContent = 'TikTok';
      ttLi.appendChild(ttA);
      socialParent.appendChild(ttLi);
      // Re-run selector to include the new link
      return observeAll();
    }

    if (socialParent && !socialParent.dataset.rowified) {
      socialParent.style.display = 'flex';
      socialParent.style.gap = '1.25rem';
      socialParent.style.marginTop = '1rem';
      socialParent.style.listStyle = 'none';
      socialParent.style.padding = '0';
      socialParent.dataset.rowified = 'true';
    }

    socialLinks.forEach(link => {
      // Force User-Specific Social URLs
      if (link.href.includes('instagram.com')) link.href = 'https://www.instagram.com/nano_fusion_cz/';
      if (link.href.includes('youtube.com')) link.href = 'https://www.youtube.com/@nanofusion7654';
      if (link.href.includes('facebook.com')) link.href = 'https://www.facebook.com/nanofusioncz';
      if (link.href.includes('linkedin.com')) link.href = 'https://www.linkedin.com/company/nanofusion/';
      if (link.href.includes('tiktok.com')) link.href = 'https://www.tiktok.com/@nano_fusion_cz';

      if (!link.dataset.iconized) {
        link.style.width = '36px';
        link.style.height = '36px';
        link.style.borderRadius = '50%';
        link.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        link.style.display = 'flex';
        link.style.alignItems = 'center';
        link.style.justifyContent = 'center';
        link.style.color = '#f59e0b';
        link.style.transition = 'all 0.3s ease';
        link.title = link.textContent.trim();
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        let iconSvg = '';
        if (link.href.includes('facebook')) {
          iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`;
        } else if (link.href.includes('instagram')) {
          iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
        } else if (link.href.includes('linkedin')) {
          iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`;
        } else if (link.href.includes('youtube')) {
          iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`;
        } else if (link.href.includes('tiktok')) {
          iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`;
        }

        link.innerHTML = iconSvg;
        link.onmouseenter = () => {
          link.style.transform = 'translateY(-4px)';
          link.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
          link.style.opacity = '1';
        };
        link.onmouseleave = () => {
          link.style.transform = 'translateY(0)';
          link.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          link.style.opacity = '1';
        };
        link.dataset.iconized = 'true';

        if (link.parentElement.tagName === 'LI') {
          link.parentElement.style.margin = '0';
          link.parentElement.style.padding = '0';
        }
      }
    });
  }

  // Transform Footer Services
  const footerHeadings = Array.from(document.querySelectorAll('footer h3, footer h4, footer p.font-bold'));
  const servicesHeading = footerHeadings.find(h => h.textContent.includes('Služby'));
  const contactHeading = footerHeadings.find(h => h.textContent.includes('Kontakt'));

  if (servicesHeading) {
    servicesHeading.style.color = '#f59e0b';
    servicesHeading.style.fontWeight = '800';
    const servicesUl = servicesHeading.parentElement.querySelector('ul');
    if (servicesUl && !servicesUl.dataset.finalized) {
      const serviceItems = [
        { id: 'facade', name: 'Čištění fasád' },
        { id: 'roof', name: 'Čištění střech' },
        { id: 'pavement', name: 'Čištění dlažeb' },
        { id: 'pv', name: 'Solární panely' },
        { id: 'graffiti', name: 'Odstranění graffiti' },
        { id: 'industrial', name: 'Průmyslové čištění' },
        { id: 'facade-paint', name: 'Nátěry fasád' },
        { id: 'roof-paint', name: 'Nátěry střech' },
        { id: 'antislip', name: 'Protiskluzová úprava' },
        { id: 'ceramfloor', name: 'IG CeramFloor' },
        { id: 'antibac', name: 'Antibakteriální ochrana' }
      ];

      servicesUl.innerHTML = '';
      servicesUl.className = 'space-y-4';

      serviceItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = item.name;
        a.className = 'footer-service-link';
        a.style.color = '#f59e0b';
        a.style.fontWeight = '700';
        a.style.transition = 'all 0.3s ease';
        a.style.display = 'block';

        a.onclick = (e) => {
          e.preventDefault();
          if (window.nnf_openService) {
            window.nnf_openService(item.id);
          } else {
            const cards = Array.from(document.querySelectorAll('#sluzby h3, #sluzby h4'));
            const card = cards.find(c => c.textContent.toLowerCase().includes(item.name.toLowerCase()));
            if (card) card.click();
          }
        };

        a.onmouseenter = () => { a.style.transform = 'translateX(8px)'; a.style.opacity = '0.8'; };
        a.onmouseleave = () => { a.style.transform = 'translateX(0)'; a.style.opacity = '1'; };

        li.appendChild(a);
        servicesUl.appendChild(li);
      });
      servicesUl.dataset.finalized = 'true';
    }
  }

  // Inject Map
  if (contactHeading) {
    contactHeading.style.color = '#f59e0b';
    contactHeading.style.fontWeight = '800';
    const contactCol = contactHeading.parentElement;
    if (contactCol && !contactCol.querySelector('.footer-map-container')) {
      const mapContainer = document.createElement('div');
      mapContainer.className = 'footer-map-container section-reveal';
      mapContainer.style.marginTop = '1.5rem';
      mapContainer.style.borderRadius = '1rem';
      mapContainer.style.overflow = 'hidden';
      mapContainer.style.border = '2px solid #f59e0b';
      mapContainer.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
      mapContainer.style.height = '250px';
      mapContainer.style.position = 'relative';

      mapContainer.innerHTML = `
        <a href="https://www.google.com/maps/search/?api=1&query=Cezavy+627,+664+56+Blučina" target="_blank" style="display: block; height: 100%;">
          <iframe 
            src="https://www.google.com/maps?q=Cezavy%20627,664%2056%20Blučina&output=embed" 
            width="100%" 
            height="100%" 
            style="border:0; pointer-events: none;" 
            allowfullscreen="" 
            loading="lazy">
          </iframe>
          <div style="position: absolute; inset: 0; background: rgba(0,0,0,0); transition: background 0.3s ease;" 
               onmouseenter="this.style.background='rgba(245, 158, 11, 0.1)'"
               onmouseleave="this.style.background='rgba(0,0,0,0)'">
          </div>
        </a>
      `;
      contactCol.appendChild(mapContainer);
      revealObserver.observe(mapContainer);
    }
  }
};

// Global reveal registration
window.observeAll = observeAll;

let isObserving = false;
const domObserver = new MutationObserver(() => {
  if (isObserving) return;
  isObserving = true;
  try {
    observeAll();
  } catch (e) {
    console.error('Observation error:', e);
  } finally {
    setTimeout(() => { isObserving = false; }, 100);
  }
});

const clearPreloader = () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
    setTimeout(() => { if (preloader.parentNode) preloader.remove(); }, 500);
  }
  document.body.style.opacity = '1';
  document.body.style.overflow = 'auto';
};

const initApp = () => {
  try {
    domObserver.observe(document.body, { childList: true, subtree: true });
    observeAll();
  } catch (e) {
    console.warn('Initial app injection error:', e);
  }
  // Independent preloader clearing
  setTimeout(clearPreloader, 100);
};

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Senior CTO Fallback: Force clear preloader after 4.5s no matter what
setTimeout(clearPreloader, 4500);

