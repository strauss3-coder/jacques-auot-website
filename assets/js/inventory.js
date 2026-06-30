/* ===================================================================
   INVENTORY LIBRARY — Jacques Auto
   Data-driven vehicle inventory: search, filter, card carousel,
   preview panel and full-screen lightbox. Vanilla JS, no libraries.

   HOW TO ADD A VEHICLE
   ─────────────────────
   1. Copy any vehicle object in the INVENTORY array.
   2. Create a folder: assets/images/inventory/<slug>/
   3. Add 5 images named 1.jpg, 2..jpeg, 3..jpeg, 4..jpeg, 5..jpeg
   4. Fill in all fields — the card, filters and preview update automatically.
   5. Save and push.
   =================================================================== */

(function () {
  'use strict';

  /* ================================================================
     § 1 — INVENTORY DATA
     ================================================================
     Each object is one vehicle. Fill in every TODO field.
     Fields used for filtering: make, model, category, bodyType,
     price (number), transmission, fuel.
     ================================================================ */
  var INVENTORY = [

    /* ── 1. BMW 320d ─────────────────────────────────────────────── */
    {
      id:          'bmw-320d',
      folder:      'assets/images/inventory/bmw-320d',
      images:      ['1.jpg','2..jpeg','3..jpeg','4..jpeg','5..jpeg'],
      make:        'BMW',
      model:       '320d',
      year:        2014,
      price:       189900,
      priceDisplay:'R189 900',
      mileage:     '128 000 km',
      transmission:'Manual',
      fuel:        'Diesel',
      engine:      '2.0L Diesel',
      colour:      '',
      bodyType:    'Sedan',
      category:    'Cars',
      description: 'A well-maintained 2014 BMW 320d with full service history. Powerful 2.0L diesel engine paired with a smooth manual gearbox — an executive sedan that drives as good as it looks.',
      features:    ['Aircon','Spare Keys','Full Service History','Finance Available'],
      financeAvailable: true,
    },

    /* ── 2. Ford Ranger 2.5i C/C ─────────────────────────────────── */
    {
      id:          'ford-ranger',
      folder:      'assets/images/inventory/ford-ranger',
      images:      ['1.jpg','2..jpeg','3..jpeg','4..jpeg','5..jpeg'],
      make:        'Ford',
      model:       'Ranger 2.5i C/C',
      year:        2015,
      price:       159900,
      priceDisplay:'R159 900',
      mileage:     '208 000 km',
      transmission:'Manual',
      fuel:        'Petrol',
      engine:      '2.5i Petrol',
      colour:      '',
      bodyType:    'Bakkie',
      category:    'Bakkies',
      description: 'A 2015 Ford Ranger 2.5i Club Cab — the bakkie built for South African roads. Manual gearbox, aircon, spare keys and partial service history. Ready to work and play.',
      features:    ['Aircon','Spare Keys','Partial Service History','Finance Available'],
      financeAvailable: true,
    },

    /* ── 3. Hyundai H-100 ────────────────────────────────────────── */
    {
      id:          'hyundai-h100',
      folder:      'assets/images/inventory/hyundai-h100',
      images:      ['1.jpg','2..jpeg','3..jpeg','4..jpeg','5..jpeg'],
      make:        'Hyundai',
      model:       'H-100 2.6i',
      year:        2020,
      price:       189900,
      priceDisplay:'R189 900',
      mileage:     '175 000 km',
      transmission:'Manual',
      fuel:        'Diesel',
      engine:      '2.6i Diesel',
      colour:      '',
      bodyType:    'Van',
      category:    'Vans',
      description: 'A 2020 Hyundai H-100 diesel — South Africa\'s favourite workhorse panel van. High mileage but priced right for a business that needs reliable payload capacity.',
      features:    ['Finance Available'],
      financeAvailable: true,
    },

    /* ── 4. Hyundai i10 1.1i Motion ──────────────────────────────── */
    {
      id:          'hyundai-i10',
      folder:      'assets/images/inventory/hyundai-i10',
      images:      ['1.jpg','2..jpeg','3..jpeg','4..jpeg','5..jpeg'],
      make:        'Hyundai',
      model:       'i10 1.1i Motion',
      year:        2016,
      price:       109900,
      priceDisplay:'R109 900',
      mileage:     '188 000 km',
      transmission:'Manual',
      fuel:        'Petrol',
      engine:      '1.1i Petrol',
      colour:      '',
      bodyType:    'Hatchback',
      category:    'Cars',
      description: 'An affordable and economical 2016 Hyundai i10 1.1i Motion. Compact city car with aircon, spare keys and partial service history — perfect for everyday commuting.',
      features:    ['Aircon','Spare Keys','Partial Service History','Finance Available'],
      financeAvailable: true,
    },

    /* ── 5. Mahindra Pik Up 2.2Tdi S/C ──────────────────────────── */
    {
      id:          'mahindra',
      folder:      'assets/images/inventory/mahindra',
      images:      ['1.jpg','2..jpeg','3..jpeg','4..jpeg','5..jpeg'],
      make:        'Mahindra',
      model:       'Pik Up 2.2Tdi S/C',
      year:        2022,
      price:       209900,
      priceDisplay:'R209 900',
      mileage:     '3 600 km',
      transmission:'Manual',
      fuel:        'Diesel',
      engine:      '2.2Tdi Diesel',
      colour:      '',
      bodyType:    'Bakkie',
      category:    'Bakkies',
      description: 'Nearly new 2022 Mahindra Pik Up 2.2Tdi Single Cab with only 3 600 km on the clock. Still under manufacturer warranty and with partial service history — essentially a brand-new bakkie at a used price.',
      features:    ['Aircon','Spare Keys','Partial Service History','Finance Available'],
      financeAvailable: true,
    },

    /* ── 6. Nissan NP200 1.6i ────────────────────────────────────── */
    {
      id:          'nissan-np200',
      folder:      'assets/images/inventory/nissan-np200',
      images:      ['1.jpg','2..jpeg','3..jpeg','4..jpeg','5..jpeg'],
      make:        'Nissan',
      model:       'NP200 1.6i',
      year:        2012,
      price:       149900,
      priceDisplay:'R149 900',
      mileage:     '65 000 km',
      transmission:'Manual',
      fuel:        'Petrol',
      engine:      '1.6i Petrol',
      colour:      '',
      bodyType:    'Bakkie',
      category:    'Bakkies',
      description: 'A 2012 Nissan NP200 1.6i with an exceptional full service history and low mileage of only 65 000 km. This little workhorse is reliable, economical and ready for another decade of service.',
      features:    ['Spare Keys','Full Service History','Finance Available'],
      financeAvailable: true,
    },

    /* ── 7. VW Polo 1.4i Vivo (2024) ────────────────────────────── */
    {
      id:          'polo-vivo',
      folder:      'assets/images/inventory/polo-vivo',
      images:      ['1.jpg','2..jpeg','3..jpeg','4..jpeg','5..jpeg'],
      make:        'Volkswagen',
      model:       'Polo 1.4i Vivo',
      year:        2024,
      price:       259900,
      priceDisplay:'R259 900',
      mileage:     '2 700 km',
      transmission:'Manual',
      fuel:        'Petrol',
      engine:      '1.4i Petrol',
      colour:      '',
      bodyType:    'Hatchback',
      category:    'Cars',
      description: 'A 2024 Volkswagen Polo 1.4i Vivo with just 2 700 km — practically brand new. Full service history, aircon, spare keys and the German build quality you trust. Finance available.',
      features:    ['Aircon','Spare Keys','Full Service History','Finance Available'],
      financeAvailable: true,
    },

    /* ── 8. Suzuki Swift 1.2i GA ─────────────────────────────────── */
    {
      id:          'suzuki-swift',
      folder:      'assets/images/inventory/suzuki-swift',
      images:      ['1.jpg','2..jpeg','3..jpeg','4..jpeg','5..jpeg'],
      make:        'Suzuki',
      model:       'Swift 1.2i GA',
      year:        2023,
      price:       189900,
      priceDisplay:'R189 900',
      mileage:     '54 000 km',
      transmission:'Manual',
      fuel:        'Petrol',
      engine:      '1.2i Petrol',
      colour:      '',
      bodyType:    'Hatchback',
      category:    'Cars',
      description: 'A fun and fuel-efficient 2023 Suzuki Swift 1.2i GA with full service history. Only 54 000 km, aircon and spare keys — a sporty hatchback that sips petrol and loves corners.',
      features:    ['Aircon','Spare Keys','Full Service History','Finance Available'],
      financeAvailable: true,
    },

    /* ── 9. Toyota Hilux 2.7VVti R/B S/C ────────────────────────── */
    {
      id:          'toyota-hilux',
      folder:      'assets/images/inventory/toyota-hilux',
      images:      ['1.jpg','2..jpeg','3..jpeg','4..jpeg','5..jpeg'],
      make:        'Toyota',
      model:       'Hilux 2.7VVti R/B S/C',
      year:        2005,
      price:       209900,
      priceDisplay:'R209 900',
      mileage:     '265 000 km',
      transmission:'Manual',
      fuel:        'Petrol',
      engine:      '2.7VVti Petrol',
      colour:      '',
      bodyType:    'Bakkie',
      category:    'Bakkies',
      description: 'A classic 2005 Toyota Hilux 2.7VVti Single Cab with a proven petrol V6 engine. High mileage but the Hilux reputation speaks for itself — these trucks run forever with basic maintenance.',
      features:    ['Aircon','Spare Keys','Partial Service History','Finance Available'],
      financeAvailable: true,
    },

    /* ── 10. VW Polo 1.6i Comfortline (2009) ────────────────────── */
    {
      id:          'volkswagen-polo-vivo',
      folder:      'assets/images/inventory/volkswagen-polo-vivo',
      images:      ['1.jpg','2..jpeg','3..jpeg','4..jpeg','5..jpeg'],
      make:        'Volkswagen',
      model:       'Polo 1.6i Comfortline',
      year:        2009,
      price:       109900,
      priceDisplay:'R109 900',
      mileage:     '191 000 km',
      transmission:'Manual',
      fuel:        'Petrol',
      engine:      '1.6i Petrol',
      colour:      '',
      bodyType:    'Hatchback',
      category:    'Cars',
      description: 'A 2009 Volkswagen Polo 1.6i Comfortline — solid German build with partial service history, aircon and spare keys. Well priced for a comfortable and reliable daily driver.',
      features:    ['Aircon','Spare Keys','Partial Service History','Finance Available'],
      financeAvailable: true,
    },

    /* ─────────────────────────────────────────────────────────────
       ADD MORE VEHICLES HERE — Copy the block below, create the
       image folder at assets/images/inventory/<slug>/, add 5 photos
       named 1.jpg, 2..jpeg, 3..jpeg, 4..jpeg, 5..jpeg, fill fields.
       ───────────────────────────────────────────────────────────── */
    /* TODO — new vehicle template:
    {
      id:          'make-model-year',
      folder:      'assets/images/inventory/make-model-year',
      images:      ['1.jpg','2..jpeg','3..jpeg','4..jpeg','5..jpeg'],
      make:        '', model:        '', year:         0,
      price:       0,  priceDisplay: '', mileage:      '',
      transmission:'', fuel:         '', engine:       '', colour: '',
      bodyType:    '', category:     '', description:  '', features: [],
      financeAvailable: true,
    }, */
  ];

  /* ================================================================
     § 2 — DOM REFERENCES
     ================================================================ */
  var gridEl     = document.getElementById('inv-grid');
  var countEl    = document.getElementById('inv-count');
  var emptyEl    = document.getElementById('inv-empty');
  var previewEl  = document.getElementById('inv-preview');
  var filterForm = document.getElementById('inv-filter-form');

  if (!gridEl) return;   /* safety — only runs on inventory page */

  /* filter inputs */
  var fSearch = document.getElementById('inv-search');
  var fCat    = document.getElementById('inv-cat');
  var fBody   = document.getElementById('inv-body');
  var fPrice  = document.getElementById('inv-price');
  var fTrans  = document.getElementById('inv-trans');
  var fFuel   = document.getElementById('inv-fuel');

  /* ================================================================
     § 3 — WHATSAPP URL BUILDER
     ================================================================ */
  function waUrl(v) {
    var msg = encodeURIComponent(
      'Hi! I\'m interested in the ' +
      (v.year || '') + ' ' + v.make + ' ' + v.model +
      (v.priceDisplay ? ' (' + v.priceDisplay + ')' : '') +
      '. Can you share more details and availability?'
    );
    return 'https://wa.me/27722034791?text=' + msg;
  }

  /* ================================================================
     § 4 — FILTER ENGINE  (runs on every keystroke / select change)
     ================================================================ */
  function applyFilters() {
    var search = fSearch ? fSearch.value.toLowerCase().trim() : '';
    var cat    = fCat   ? fCat.value    : '';
    var body   = fBody  ? fBody.value   : '';
    var price  = fPrice ? fPrice.value  : '';
    var trans  = fTrans ? fTrans.value  : '';
    var fuel   = fFuel  ? fFuel.value   : '';

    var results = INVENTORY.filter(function (v) {
      /* text search across make + model */
      if (search && (v.make + ' ' + v.model).toLowerCase().indexOf(search) === -1) return false;
      if (cat   && v.category    !== cat)   return false;
      if (body  && v.bodyType    !== body)  return false;
      if (trans && v.transmission !== trans) return false;
      if (fuel  && v.fuel        !== fuel)  return false;
      if (price) {
        if (price === 'u100'    && v.price >= 100000) return false;
        if (price === '100-150' && (v.price < 100000 || v.price >= 150000)) return false;
        if (price === '150-200' && (v.price < 150000 || v.price >= 200000)) return false;
        if (price === '200plus' && v.price < 200000) return false;
      }
      return true;
    });

    renderGrid(results);
  }

  function resetFilters() {
    if (fSearch) fSearch.value = '';
    if (fCat)    fCat.value    = '';
    if (fBody)   fBody.value   = '';
    if (fPrice)  fPrice.value  = '';
    if (fTrans)  fTrans.value  = '';
    if (fFuel)   fFuel.value   = '';
    applyFilters();
  }

  /* ================================================================
     § 5 — CARD BUILDER
     ================================================================ */
  var WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="16" height="16"><path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.1-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.4.4 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3A3 3 0 0 0 6 8.6c0 1.8 1.3 3.5 1.5 3.8s2.6 4 6.3 5.3c2.3.8 2.4.5 2.9.5a2.5 2.5 0 0 0 1.7-1.2 2 2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z"/></svg>';

  function buildCard(v) {
    var n = v.images.length;
    /* image strip */
    var imgHTML = v.images.map(function (img, i) {
      return '<img class="inv-img" src="' + v.folder + '/' + img + '" alt="' +
        v.make + ' ' + v.model + ' photo ' + (i + 1) + '" loading="lazy" draggable="false">';
    }).join('');

    /* dot indicators */
    var dotHTML = v.images.map(function (_, i) {
      return '<span class="inv-dot' + (i === 0 ? ' active' : '') + '" data-i="' + i + '"></span>';
    }).join('');

    /* meta chips */
    var meta = [
      v.mileage     ? '<span>' + v.mileage     + '</span>' : '',
      v.transmission ? '<span>' + v.transmission + '</span>' : '',
      v.fuel         ? '<span>' + v.fuel         + '</span>' : '',
    ].filter(Boolean).join('<span class="inv-meta-sep">·</span>');

    return (
      '<article class="inv-card inv-reveal" data-id="' + v.id + '">' +

        /* image carousel */
        '<div class="inv-imgs" data-id="' + v.id + '" data-idx="0" data-n="' + n + '">' +
          '<div class="inv-imgs-track">' + imgHTML + '</div>' +
          (n > 1 ? [
            '<button class="inv-arr inv-arr-prev" type="button" aria-label="Previous image">',
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>',
            '</button>',
            '<button class="inv-arr inv-arr-next" type="button" aria-label="Next image">',
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>',
            '</button>',
            '<div class="inv-dots">' + dotHTML + '</div>',
          ].join('') : '') +
          (v.financeAvailable ? '<span class="inv-fin-badge">Finance</span>' : '') +
        '</div>' +

        /* card body */
        '<div class="inv-card-body">' +
          '<div class="inv-card-header">' +
            '<h3 class="inv-card-name">' + (v.year ? v.year + ' ' : '') + v.make + ' ' + v.model + '</h3>' +
            '<div class="inv-card-price">' + (v.priceDisplay || 'Contact for price') + '</div>' +
          '</div>' +
          (meta ? '<div class="inv-meta">' + meta + '</div>' : '') +
          '<div class="inv-card-actions">' +
            '<a class="btn btn-wa inv-wa" href="' + waUrl(v) + '" target="_blank" rel="noopener noreferrer">' +
              WA_SVG + 'WhatsApp' +
            '</a>' +
            '<button class="btn btn-ghost inv-details" type="button" data-id="' + v.id + '">' +
              'View Details' +
            '</button>' +
          '</div>' +
        '</div>' +

      '</article>'
    );
  }

  /* ================================================================
     § 6 — GRID RENDERER
     ================================================================ */
  var revealObserver = null;

  function renderGrid(vehicles) {
    /* disconnect old observers */
    if (revealObserver) revealObserver.disconnect();

    /* show/hide empty state */
    if (vehicles.length === 0) {
      gridEl.innerHTML = '';
      if (emptyEl)  emptyEl.hidden = false;
      if (countEl)  countEl.textContent = 'No vehicles found';
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    if (countEl) countEl.textContent = vehicles.length + ' vehicle' + (vehicles.length === 1 ? '' : 's') + ' found';

    gridEl.innerHTML = vehicles.map(buildCard).join('');

    /* scroll-reveal via IntersectionObserver */
    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            revealObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

      gridEl.querySelectorAll('.inv-reveal').forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      /* no observer — show all immediately */
      gridEl.querySelectorAll('.inv-reveal').forEach(function (el) {
        el.classList.add('in');
      });
    }
  }

  /* ================================================================
     § 7 — CARD IMAGE CAROUSEL  (event delegation on grid)
     ================================================================ */
  /* move carousel to index idx */
  function carouselTo(imgEl, idx) {
    var n = parseInt(imgEl.dataset.n || '1');
    idx = ((idx % n) + n) % n;
    imgEl.dataset.idx = idx;
    var track = imgEl.querySelector('.inv-imgs-track');
    if (track) track.style.transform = 'translateX(-' + (idx * (100 / n)) + '%)';
    imgEl.querySelectorAll('.inv-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });
  }

  /* arrow buttons (delegated) */
  gridEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.inv-arr');
    if (!btn) return;
    e.stopPropagation();
    var imgEl = btn.closest('.inv-imgs');
    if (!imgEl) return;
    var cur = parseInt(imgEl.dataset.idx || '0');
    carouselTo(imgEl, cur + (btn.classList.contains('inv-arr-next') ? 1 : -1));
  });

  /* dot click */
  gridEl.addEventListener('click', function (e) {
    var dot = e.target.closest('.inv-dot');
    if (!dot) return;
    var imgEl = dot.closest('.inv-imgs');
    if (!imgEl) return;
    carouselTo(imgEl, parseInt(dot.dataset.i));
  });

  /* touch swipe on image area */
  var cTouchState = null;

  gridEl.addEventListener('touchstart', function (e) {
    var imgEl = e.target.closest('.inv-imgs');
    if (!imgEl || e.touches.length > 1) return;
    cTouchState = {
      imgEl:  imgEl,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      startIdx: parseInt(imgEl.dataset.idx || '0'),
      dir:    null,
    };
  }, { passive: true });

  gridEl.addEventListener('touchmove', function (e) {
    if (!cTouchState) return;
    var t  = e.touches[0];
    var dx = t.clientX - cTouchState.startX;
    var dy = t.clientY - cTouchState.startY;

    if (!cTouchState.dir) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        cTouchState.dir = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      }
      return;
    }
    if (cTouchState.dir !== 'x') return;

    e.preventDefault();

    /* live drag — shift track without snapping */
    var n     = parseInt(cTouchState.imgEl.dataset.n || '1');
    var track = cTouchState.imgEl.querySelector('.inv-imgs-track');
    if (!track) return;
    var base   = -(cTouchState.startIdx * (100 / n));
    var delta  = (dx / cTouchState.imgEl.offsetWidth) * (100 / n);
    track.style.transition = 'none';
    track.style.transform  = 'translateX(' + (base + delta) + '%)';
  }, { passive: false });

  gridEl.addEventListener('touchend', function (e) {
    if (!cTouchState || cTouchState.dir !== 'x') { cTouchState = null; return; }
    var dx = e.changedTouches[0].clientX - cTouchState.startX;
    var imgEl = cTouchState.imgEl;
    var track = imgEl.querySelector('.inv-imgs-track');

    if (track) track.style.transition = '';   /* restore CSS transition */
    var newIdx = cTouchState.startIdx + (dx < -48 ? 1 : dx > 48 ? -1 : 0);
    carouselTo(imgEl, newIdx);
    cTouchState = null;
  }, { passive: true });

  /* ================================================================
     § 8 — PREVIEW SECTION
     ================================================================ */
  var prevGalleryIdx = 0;
  var prevVehicle    = null;

  function vehicleById(id) {
    for (var i = 0; i < INVENTORY.length; i++) {
      if (INVENTORY[i].id === id) return INVENTORY[i];
    }
    return null;
  }

  function showPreview(v) {
    prevVehicle    = v;
    prevGalleryIdx = 0;
    buildPreview(v);
    previewEl.classList.add('inv-preview-active');
    /* smooth scroll — allow DOM paint first */
    requestAnimationFrame(function () {
      previewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function buildPreview(v) {
    if (!previewEl) return;
    var n = v.images.length;

    /* thumb strip */
    var thumbsHTML = v.images.map(function (img, i) {
      return '<button class="inv-prev-thumb' + (i === 0 ? ' active' : '') +
        '" type="button" data-i="' + i + '" aria-label="View photo ' + (i + 1) + '">' +
        '<img src="' + v.folder + '/' + img + '" alt="" loading="lazy">' +
      '</button>';
    }).join('');

    /* spec rows */
    var specs = [
      ['Year',          v.year         || '—'],
      ['Mileage',       v.mileage      || '—'],
      ['Transmission',  v.transmission || '—'],
      ['Fuel Type',     v.fuel         || '—'],
      ['Engine',        v.engine       || '—'],
      ['Colour',        v.colour       || '—'],
      ['Body Type',     v.bodyType     || '—'],
    ].map(function (r) {
      return '<div class="inv-spec-row"><span class="inv-spec-label">' + r[0] + '</span>' +
        '<span class="inv-spec-val">' + r[1] + '</span></div>';
    }).join('');

    /* features */
    var featHTML = (v.features && v.features.length) ?
      '<div class="inv-prev-features">' +
        v.features.map(function (f) { return '<span class="inv-feat">' + f + '</span>'; }).join('') +
      '</div>' : '';

    previewEl.innerHTML = (
      '<div class="inv-prev-close-wrap"><button class="inv-prev-close" type="button" aria-label="Close preview">&times;</button></div>' +
      '<div class="wrap">' +
        '<div class="inv-prev-layout">' +

          /* LEFT — gallery */
          '<div class="inv-prev-gallery">' +
            '<div class="inv-prev-main">' +
              '<img id="inv-prev-img" src="' + v.folder + '/' + v.images[0] + '" alt="' + v.make + ' ' + v.model + '" loading="eager">' +
              '<button class="inv-prev-lb-btn" type="button" aria-label="View full size">&#8599;</button>' +
              '<button class="inv-prev-arr inv-prev-arr-prev" type="button" aria-label="Previous photo">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>' +
              '</button>' +
              '<button class="inv-prev-arr inv-prev-arr-next" type="button" aria-label="Next photo">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>' +
              '</button>' +
            '</div>' +
            '<div class="inv-prev-thumbs">' + thumbsHTML + '</div>' +
          '</div>' +

          /* RIGHT — details */
          '<div class="inv-prev-details">' +
            '<div class="inv-prev-header">' +
              '<h2 class="inv-prev-name">' + (v.year ? v.year + ' ' : '') + v.make + ' ' + v.model + '</h2>' +
              '<div class="inv-prev-price">' + (v.priceDisplay || 'Contact for price') + '</div>' +
            '</div>' +

            '<div class="inv-specs">' + specs + '</div>' +

            (v.description ? '<div class="inv-prev-desc"><p>' + v.description + '</p></div>' : '') +

            featHTML +

            (v.financeAvailable ?
              '<div class="inv-prev-finance">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="20" height="20" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>' +
                '<span>Finance available — we work with trusted lenders to get you approved.</span>' +
              '</div>' : '') +

            '<div class="inv-prev-cta">' +
              '<a class="btn btn-wa" href="' + waUrl(v) + '" target="_blank" rel="noopener noreferrer">' +
                WA_SVG + ' Enquire on WhatsApp' +
              '</a>' +
              '<a class="btn btn-dark" href="tel:0722034791">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="17" height="17" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>' +
                'Call Us' +
              '</a>' +
            '</div>' +

          '</div>' + /* /inv-prev-details */

        '</div>' + /* /inv-prev-layout */
      '</div>' /* /wrap */
    );

    /* wire up preview interactions */
    wirePreview(v);
  }

  function setPrevImg(v, idx) {
    var n = v.images.length;
    prevGalleryIdx = ((idx % n) + n) % n;
    var imgEl = document.getElementById('inv-prev-img');
    if (imgEl) {
      imgEl.style.opacity = '0';
      setTimeout(function () {
        imgEl.src = v.folder + '/' + v.images[prevGalleryIdx];
        imgEl.style.opacity = '1';
      }, 180);
    }
    previewEl.querySelectorAll('.inv-prev-thumb').forEach(function (th, i) {
      th.classList.toggle('active', i === prevGalleryIdx);
    });
  }

  function wirePreview(v) {
    /* close button */
    var closeBtn = previewEl.querySelector('.inv-prev-close');
    if (closeBtn) closeBtn.addEventListener('click', function () {
      previewEl.classList.remove('inv-preview-active');
    });

    /* thumbnail strip */
    previewEl.querySelectorAll('.inv-prev-thumb').forEach(function (th) {
      th.addEventListener('click', function () {
        setPrevImg(v, parseInt(th.dataset.i));
      });
    });

    /* gallery arrows */
    var prevArr = previewEl.querySelector('.inv-prev-arr-prev');
    var nextArr = previewEl.querySelector('.inv-prev-arr-next');
    if (prevArr) prevArr.addEventListener('click', function () { setPrevImg(v, prevGalleryIdx - 1); });
    if (nextArr) nextArr.addEventListener('click', function () { setPrevImg(v, prevGalleryIdx + 1); });

    /* open lightbox */
    var lbBtn = previewEl.querySelector('.inv-prev-lb-btn');
    var mainImg = previewEl.querySelector('.inv-prev-main');
    var lbTrigger = function () { openLb(v, prevGalleryIdx); };
    if (lbBtn) lbBtn.addEventListener('click', lbTrigger);
    if (mainImg) mainImg.querySelector('img') && mainImg.querySelector('img').addEventListener('click', lbTrigger);

    /* touch swipe on preview main image */
    var mainImgEl = previewEl.querySelector('.inv-prev-main');
    if (mainImgEl) wirePrevSwipe(mainImgEl, v);
  }

  function wirePrevSwipe(el, v) {
    var sx = 0;
    el.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) sx = e.touches[0].clientX;
    }, { passive: true });
    el.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 48) setPrevImg(v, prevGalleryIdx + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* "View Details" delegated click */
  gridEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.inv-details');
    if (!btn) return;
    var v = vehicleById(btn.dataset.id);
    if (v) showPreview(v);
  });

  /* ================================================================
     § 9 — LIGHTBOX (full-res images from preview)
     ================================================================ */
  var lb        = null;
  var lbVehicle = null;
  var lbIdx     = 0;
  var lbTx0     = 0;

  function buildLb() {
    lb = document.createElement('div');
    lb.className = 'inv-lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Full-size image viewer');
    lb.innerHTML = (
      '<button class="inv-lb-close" aria-label="Close">&times;</button>' +
      '<button class="inv-lb-nav inv-lb-prev" aria-label="Previous">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><path d="M15 18l-6-6 6-6"/></svg>' +
      '</button>' +
      '<button class="inv-lb-nav inv-lb-next" aria-label="Next">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><path d="M9 18l6-6-6-6"/></svg>' +
      '</button>' +
      '<div class="inv-lb-inner"><img class="inv-lb-img" src="" alt="" loading="eager"></div>' +
      '<p class="inv-lb-cap"></p>'
    );
    document.body.appendChild(lb);

    lb.querySelector('.inv-lb-close').addEventListener('click', closeLb);
    lb.querySelector('.inv-lb-prev').addEventListener('click', function (e) { e.stopPropagation(); lbNav(-1); });
    lb.querySelector('.inv-lb-next').addEventListener('click', function (e) { e.stopPropagation(); lbNav(1); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('inv-lb-inner')) closeLb();
    });

    /* keyboard */
    document.addEventListener('keydown', function (e) {
      if (!lb || !lb.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLb();
      if (e.key === 'ArrowLeft')  lbNav(-1);
      if (e.key === 'ArrowRight') lbNav(1);
    });

    /* swipe inside lightbox */
    lb.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) lbTx0 = e.touches[0].clientX;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - lbTx0;
      if (Math.abs(dx) > 50) lbNav(dx > 0 ? -1 : 1);
    }, { passive: true });
  }

  function openLb(v, idx) {
    if (!lb) buildLb();
    lbVehicle = v;
    lbSetImg(idx, false);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function lbNav(dir) {
    var n = lbVehicle.images.length;
    lbSetImg(((lbIdx + dir) % n + n) % n, true);
  }

  function lbSetImg(idx, animate) {
    lbIdx = idx;
    var imgEl = lb.querySelector('.inv-lb-img');
    var capEl = lb.querySelector('.inv-lb-cap');
    var src   = lbVehicle.folder + '/' + lbVehicle.images[idx];
    var cap   = (lbVehicle.year ? lbVehicle.year + ' ' : '') + lbVehicle.make + ' ' + lbVehicle.model +
                ' — ' + (idx + 1) + ' / ' + lbVehicle.images.length;

    if (animate) {
      imgEl.style.opacity   = '0';
      imgEl.style.transform = 'scale(0.97)';
      setTimeout(function () {
        imgEl.src             = src;
        imgEl.alt             = cap;
        imgEl.style.opacity   = '1';
        imgEl.style.transform = 'scale(1)';
        if (capEl) capEl.textContent = cap;
      }, 160);
    } else {
      imgEl.src             = src;
      imgEl.alt             = cap;
      imgEl.style.opacity   = '1';
      imgEl.style.transform = 'scale(1)';
      if (capEl) capEl.textContent = cap;
    }
  }

  /* ================================================================
     § 10 — FILTER BAR EVENT BINDINGS
     ================================================================ */
  if (filterForm) {
    /* live filter on any input/select change */
    filterForm.addEventListener('input',  applyFilters);
    filterForm.addEventListener('change', applyFilters);

    var resetBtn = filterForm.querySelector('.inv-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);

    var resetLink = document.getElementById('inv-reset-link');
    if (resetLink) resetLink.addEventListener('click', function (e) {
      e.preventDefault();
      resetFilters();
    });
  }

  /* ================================================================
     § 11 — INIT
     ================================================================ */
  renderGrid(INVENTORY);

})();
