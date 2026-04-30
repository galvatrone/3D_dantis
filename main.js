    /* ============================================================
       LENIS SMOOTH SCROLL
       ============================================================ */
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function rafLoop(time) {
      lenis.raf(time);
      requestAnimationFrame(rafLoop);
    }
    requestAnimationFrame(rafLoop);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);


    /* ============================================================
       HEADER SCROLL BEHAVIOUR
       ============================================================ */
    const header = document.getElementById('header');
    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: self => {
        header.classList.toggle('scrolled', self.progress > 0);
      }
    });


    /* ============================================================
       MOBILE NAV
       ============================================================ */
    const hamburger   = document.getElementById('hamburger');
    const mobileNav   = document.getElementById('mobileNav');
    const mobileClose = document.getElementById('mobileNavClose');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    hamburger.addEventListener('click', () => {
      mobileNav.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    function closeMobileNav() {
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    }

    mobileClose.addEventListener('click', closeMobileNav);
    mobileLinks.forEach(link => link.addEventListener('click', closeMobileNav));


    /* ============================================================
       HERO FRAME SCRUB — scroll-driven video sequence (192 frames)
       ============================================================ */
    (function initFrameScrub() {
      const canvas = document.getElementById('hero-canvas');
      const ctx    = canvas.getContext('2d');
      const loader = document.getElementById('heroLoader');

      const TOTAL = 192;
      const frames = new Array(TOTAL);
      let loadedCount = 0;
      let currentFrame = 0;

      function pad(n) {
        return String(n).padStart(4, '0');
      }

      /* Sync canvas pixel buffer to its current CSS size */
      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cw  = canvas.offsetWidth;
        const ch  = canvas.offsetHeight;
        canvas.width  = cw * dpr;
        canvas.height = ch * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawFrame(currentFrame);
      }

      /* Cover-fit: fill this canvas, centred on the image */
      function drawFrame(idx) {
        const img = frames[idx];
        if (!img || !img.complete || !img.naturalWidth) return;
        const cw = canvas.offsetWidth  || canvas.width;
        const ch = canvas.offsetHeight || canvas.height;
        const iw = img.naturalWidth, ih = img.naturalHeight;
        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale, dh = ih * scale;
        const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, dx, dy, dw, dh);
      }

      /* Load a single frame; optional callback on first load */
      function loadFrame(i, cb) {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          loadedCount++;
          loader.style.width = (loadedCount / TOTAL * 100) + '%';
          if (loadedCount >= TOTAL) loader.classList.add('done');
          if (cb) cb();
        };
        img.src = 'frames/frame_' + pad(i + 1) + '.png';
        frames[i] = img;
      }

      /* Boot: load frame 0 immediately so hero is never blank */
      loadFrame(0, () => {
        resize();
        drawFrame(0);
        /* After first frame visible, kick off the rest */
        for (let i = 1; i < TOTAL; i++) loadFrame(i);
      });

      resize();
      window.addEventListener('resize', resize);

      /* GSAP ScrollTrigger — pin hero, scrub through frames */
      const obj = { frame: 0 };

      gsap.to(obj, {
        frame: TOTAL - 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '+=250%',      /* scroll distance: 2.5× viewport height */
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
        onUpdate() {
          const idx = Math.min(Math.round(obj.frame), TOTAL - 1);
          if (idx !== currentFrame) {
            currentFrame = idx;
            drawFrame(currentFrame);
          }
        },
      });

    })();


    /* ============================================================
       GSAP SCROLLTRIGGER REVEAL ANIMATIONS
       ============================================================ */
    gsap.registerPlugin(ScrollTrigger);

    // Fade-up reveals
    gsap.utils.toArray('.reveal').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Left reveals
    gsap.utils.toArray('.reveal-left').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: -48 },
        {
          opacity: 1, x: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Right reveals
    gsap.utils.toArray('.reveal-right').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: 48 },
        {
          opacity: 1, x: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Service cards stagger
    gsap.utils.toArray('.service-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.7,
          ease: 'power3.out',
          delay: i * 0.08,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Pricing cards stagger
    gsap.utils.toArray('.pricing-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0,
          duration: 0.65,
          ease: 'power3.out',
          delay: i * 0.1,
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Process steps stagger
    gsap.utils.toArray('.process-step').forEach((step, i) => {
      gsap.fromTo(step,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0,
          duration: 0.65,
          ease: 'power3.out',
          delay: i * 0.12,
          scrollTrigger: {
            trigger: step,
            start: 'top 90%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Gallery items stagger
    gsap.utils.toArray('.gallery-item').forEach((item, i) => {
      gsap.fromTo(item,
        { opacity: 0, scale: 0.96 },
        {
          opacity: 1, scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          delay: i * 0.09,
          scrollTrigger: {
            trigger: item,
            start: 'top 92%',
            toggleActions: 'play none none none',
          }
        }
      );
    });


    /* ============================================================
       LIGHTBOX
       ============================================================ */
    const lightbox      = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDesc  = document.getElementById('lightboxDesc');

    const caseData = [
      { title: 'Fixed Braces Treatment',    desc: 'Duration: 18 months. Metal braces, full correction. Image placeholder — replace with consented patient photography.' },
      { title: 'Clear Aligner Treatment',   desc: 'Duration: 12 months. Clear removable aligners. Image placeholder — replace with consented patient photography.' },
      { title: 'Teen Orthodontics',         desc: 'Duration: 20 months. Early adolescent treatment. Image placeholder — replace with consented patient photography.' },
      { title: 'Adult Orthodontics',        desc: 'Duration: 14 months. Discreet adult treatment. Image placeholder — replace with consented patient photography.' },
      { title: 'Ceramic Braces Treatment',  desc: 'Duration: 16 months. Tooth-coloured ceramic brackets. Image placeholder — replace with consented patient photography.' },
    ];

    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index)));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') openLightbox(parseInt(item.dataset.index));
      });
    });

    function openLightbox(index) {
      const data = caseData[index] || caseData[0];
      lightboxTitle.textContent = data.title;
      lightboxDesc.textContent  = data.desc;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }


    /* ============================================================
       CONTACT FORM — client-side validation
       ============================================================ */
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError   = document.getElementById('formError');

    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      const firstName = contactForm.firstName.value.trim();
      const phone     = contactForm.phone.value.trim();

      formSuccess.style.display = 'none';
      formError.style.display   = 'none';

      if (!firstName || !phone) {
        formError.style.display = 'block';
        return;
      }

      /*
        EDITABLE: Replace this block with your actual form submission logic.
        Options:
          - Netlify Forms: add data-netlify="true" to <form> tag
          - Formspree: change action to "https://formspree.io/f/YOUR_ID" and remove e.preventDefault()
          - Custom API: use fetch() here
      */
      formSuccess.style.display = 'block';
      contactForm.reset();
    });


    /* ============================================================
       SMOOTH SCROLL FOR ANCHOR LINKS
       ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) lenis.scrollTo(target, { offset: -72, duration: 1.4 });
      });
    });

    /* ============================================================
       REVIEWS — seed data + localStorage persistence
       ============================================================ */
    const SEED_REVIEWS = [
      {
        id: 'seed-1',
        name: 'Panayiotis Ioakeimides',
        initials: 'PI',
        rating: 5,
        date: '4 months ago',
        text: 'Είχα πολύ μεγάλο θέμα με την κάτω γνάθο μου και πολύ στραβά δόντια. Μετά απο την δουλεια του δρ Χρίστου ομως αλλάξανε όλα. Πολύ καλή δουλειά, πολυ καλό χέρι.',
        translation: 'I had a very big problem with my lower jaw and very crooked teeth. After Dr. Christou\'s work though, everything changed. Very good work, very skilled hands.',
        source: 'google',
      },
      { id: 'seed-2', name: 'Giorgos Varnava',      initials: 'GV', rating: 5, date: '2 months ago', text: '', source: 'google' },
      { id: 'seed-3', name: 'Pamela Christou',       initials: 'PC', rating: 5, date: '4 months ago', text: '', source: 'google' },
      { id: 'seed-4', name: 'Marina Stylianou',      initials: 'MS', rating: 5, date: '4 months ago', text: '', source: 'google' },
      { id: 'seed-5', name: 'Marios Charalampous',   initials: 'MC', rating: 5, date: '4 months ago', text: '', source: 'google' },
      { id: 'seed-6', name: 'Mariam Petrossian',     initials: 'MP', rating: 5, date: '4 months ago', text: '', source: 'google' },
      { id: 'seed-7', name: 'Nicoletta Trokkoude',   initials: 'NT', rating: 5, date: '4 months ago', text: '', source: 'google' },
    ];

    function getStoredReviews() {
      try { return JSON.parse(localStorage.getItem('christou_reviews') || '[]'); }
      catch { return []; }
    }

    function saveReview(review) {
      const stored = getStoredReviews();
      stored.unshift(review);
      localStorage.setItem('christou_reviews', JSON.stringify(stored));
    }

    function starsHTML(n) {
      return '★'.repeat(n) + '☆'.repeat(5 - n);
    }

    function buildReviewCard(r) {
      const hasText = r.text && r.text.trim().length > 0;
      return `
        <div class="review-card reveal">
          <div class="review-card-header">
            <div class="review-avatar">${r.initials || r.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
            <div>
              <div class="review-author-name">${r.name}</div>
              <div class="review-meta">${r.date || 'Recently'}</div>
            </div>
          </div>
          <div class="review-stars" aria-label="${r.rating} out of 5 stars">${starsHTML(r.rating)}</div>
          ${hasText ? `<p class="review-text">"${r.text}"</p>` : ''}
          ${r.translation ? `<p class="review-translation">${r.translation}</p>` : ''}
          <div class="review-source-badge">${r.source === 'google' ? '🔍 Google' : r.source === 'facebook' ? '👍 Facebook' : '✍️ Direct'}</div>
        </div>`;
    }

    function renderReviews() {
      const grid = document.getElementById('reviewsGrid');
      if (!grid) return;
      const stored  = getStoredReviews();
      const all     = [...stored, ...SEED_REVIEWS];
      grid.innerHTML = all.map(buildReviewCard).join('');

      // Animate new cards
      gsap.utils.toArray('#reviewsGrid .review-card').forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 28 },
          {
            opacity: 1, y: 0,
            duration: 0.6,
            ease: 'power3.out',
            delay: i * 0.07,
            scrollTrigger: { trigger: card, start: 'top 92%', toggleActions: 'play none none none' },
          }
        );
      });
    }

    renderReviews();

    /* Star rating interaction */
    let selectedRating = 0;
    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedRating = parseInt(btn.dataset.val);
        document.getElementById('reviewRating').value = selectedRating;
        document.querySelectorAll('.star-btn').forEach((s, i) => {
          s.classList.toggle('active', i < selectedRating);
        });
      });
      btn.addEventListener('mouseenter', () => {
        const val = parseInt(btn.dataset.val);
        document.querySelectorAll('.star-btn').forEach((s, i) => {
          s.style.color = i < val ? '#F5A623' : '';
        });
      });
      btn.addEventListener('mouseleave', () => {
        document.querySelectorAll('.star-btn').forEach((s, i) => {
          s.style.color = '';
          s.classList.toggle('active', i < selectedRating);
        });
      });
    });

    /* Auto-fill today's date */
    const reviewDateInput = document.getElementById('reviewDate');
    if (reviewDateInput) {
      const today = new Date();
      reviewDateInput.value = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    /* Toggle review form */
    const reviewFormToggle = document.getElementById('reviewFormToggle');
    const reviewFormWrap   = document.getElementById('reviewFormWrap');
    const reviewFormCancel = document.getElementById('reviewFormCancel');

    reviewFormToggle?.addEventListener('click', () => {
      const open = reviewFormWrap.style.display !== 'none';
      reviewFormWrap.style.display = open ? 'none' : 'block';
      reviewFormToggle.setAttribute('aria-expanded', String(!open));
      if (!open) reviewFormWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    reviewFormCancel?.addEventListener('click', () => {
      reviewFormWrap.style.display = 'none';
      reviewFormToggle.setAttribute('aria-expanded', 'false');
    });

    /* Submit review */
    const reviewForm    = document.getElementById('reviewForm');
    const reviewSuccess = document.getElementById('reviewSuccess');

    reviewForm?.addEventListener('submit', e => {
      e.preventDefault();
      const name   = document.getElementById('reviewName').value.trim();
      const text   = document.getElementById('reviewText').value.trim();
      const rating = parseInt(document.getElementById('reviewRating').value) || 0;

      if (!name || !text || rating === 0) {
        alert('Please fill in your name, rating, and review text.');
        return;
      }

      const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const review = {
        id:       'user-' + Date.now(),
        name,
        initials,
        rating,
        date:     'Just now',
        text,
        source:   'direct',
      };

      saveReview(review);
      reviewSuccess.style.display = 'block';
      reviewForm.reset();
      selectedRating = 0;
      document.querySelectorAll('.star-btn').forEach(s => s.classList.remove('active'));
      setTimeout(() => {
        reviewFormWrap.style.display = 'none';
        reviewFormToggle.setAttribute('aria-expanded', 'false');
        reviewSuccess.style.display = 'none';
        renderReviews();
      }, 2000);
    });

