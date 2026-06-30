/* ===================================================================
   REVIEWS CAROUSEL — Jacques Auto
   Data-driven testimonial slider with infinite loop, autoplay,
   touch/drag support and staggered entrance animation.

   TO ADD OR EDIT A REVIEW: update the REVIEWS array below.
   Each object = one card. No HTML changes needed.
   =================================================================== */
(function () {
  'use strict';

  /* ================================================================
     § 1 — REVIEW DATA  ← edit here
     ================================================================
     Fields: name, initials, color (avatar bg), rating (1-5),
             text (review body), date (display string).
     Add as many objects as you like — the carousel adapts.
     ================================================================ */
  var REVIEWS = [
    /* TODO: replace or append with live Google review data */
    {
      name:     'Danie Botha',
      initials: 'D',
      color:    '#e91e63',
      rating:   5,
      text:     'Fast perfect deal made on older vehicle. All done perfectly. Thank you Jacques',
      date:     'A month ago',
    },
    {
      name:     'Sphiwe Mahamba',
      initials: 'S',
      color:    '#607d8b',
      rating:   5,
      text:     'Great customer service.',
      date:     'A year ago',
    },
    {
      name:     'Isabell Jacobs',
      initials: 'I',
      color:    '#9c27b0',
      rating:   5,
      text:     'Excellent experience at Jacques Auto. Very professional and friendly team.',
      date:     'A month ago',
    },
    {
      name:     'Lucky Relas',
      initials: 'L',
      color:    '#2e7d32',
      rating:   5,
      text:     'Great place to buy a used vehicle. Highly recommended.',
      date:     '4 years ago',
    },
  ];

  var N = REVIEWS.length;

  /* ================================================================
     § 2 — DOM REFERENCES
     ================================================================ */
  var outer    = document.querySelector('.rv-outer');
  var carousel = document.getElementById('rv-carousel');
  var track    = document.getElementById('rv-track');
  var dotsEl   = document.getElementById('rv-dots');
  if (!carousel || !track) return;

  /* ================================================================
     § 3 — STATE
     ================================================================ */
  /* Track has N prefix clones + N real items + N suffix clones.
     trackPos starts at N (first real card). */
  var trackPos   = N;
  var autoId     = null;
  var dragging   = false;
  var dragStartX = 0;
  var dragOffset = 0;

  /* ================================================================
     § 4 — DIMENSIONS
     ================================================================ */
  function visibleCount() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640)  return 2;
    return 1;
  }

  function cardWidth() {
    return carousel.offsetWidth / visibleCount();
  }

  /* ================================================================
     § 5 — OFFSET CALCULATION
     ================================================================
     For vis ≥ 3: center the active card (put it in slot 1 of 3).
     For vis 1-2: active card starts at left edge.
     ================================================================ */
  function getTargetOffset(tp) {
    var cw   = cardWidth();
    var vis  = visibleCount();
    var bias = vis >= 3 ? 1 : 0;
    return -(tp * cw) + bias * cw;
  }

  /* ================================================================
     § 6 — ICON ASSETS
     ================================================================ */
  var GOOGLE_G = (
    '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">' +
    '<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.37 18.09 22.56 15.3 22.56 12.25z" fill="#4285f4"/>' +
    '<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34a853"/>' +
    '<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10 10 0 0 0 2 12c0 1.61.38 3.14 1.18 4.93l3.66-2.84z" fill="#fbbc05"/>' +
    '<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ea4335"/>' +
    '</svg>'
  );

  var GOOGLE_G_LG = (
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
    '<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.37 18.09 22.56 15.3 22.56 12.25z" fill="#4285f4"/>' +
    '<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34a853"/>' +
    '<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10 10 0 0 0 2 12c0 1.61.38 3.14 1.18 4.93l3.66-2.84z" fill="#fbbc05"/>' +
    '<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ea4335"/>' +
    '</svg>'
  );

  /* ================================================================
     § 7 — CARD BUILDER
     ================================================================ */
  function buildCard(r) {
    var stars = Array(Math.max(0, Math.min(5, r.rating))).fill('★').join('');
    return (
      '<article class="rv-card" role="listitem">' +
        '<div class="rv-card-inner">' +
          '<div class="rv-card-top">' +
            '<div class="rv-avatar" style="background:' + r.color + '">' + r.initials + '</div>' +
            '<div class="rv-meta">' +
              '<div class="rv-name">' + r.name + '</div>' +
              '<div class="rv-verified">' + GOOGLE_G + ' Verified Google Review</div>' +
            '</div>' +
          '</div>' +
          '<div class="rv-stars" aria-label="' + r.rating + ' out of 5 stars">' + stars + '</div>' +
          (r.text ? '<p class="rv-text">“' + r.text + '”</p>' : '') +
          '<div class="rv-card-foot">' +
            '<span class="rv-date">' + r.date + '</span>' +
            '<div class="rv-g-icon">' + GOOGLE_G_LG + '</div>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  /* ================================================================
     § 8 — BUILD TRACK  (prefix clones + real items + suffix clones)
     ================================================================ */
  function buildTrack() {
    var html = '';
    for (var a = 0; a < N; a++) html += buildCard(REVIEWS[a]);  /* prefix */
    for (var b = 0; b < N; b++) html += buildCard(REVIEWS[b]);  /* real   */
    for (var c = 0; c < N; c++) html += buildCard(REVIEWS[c]);  /* suffix */
    track.innerHTML = html;
    applyCardWidths();
  }

  function applyCardWidths() {
    var cw = cardWidth();
    Array.from(track.children).forEach(function (card) {
      card.style.width = cw + 'px';
    });
  }

  /* ================================================================
     § 9 — RENDER
     ================================================================ */
  function setOffset(instant) {
    var off = getTargetOffset(trackPos);
    if (instant) {
      track.style.transition = 'none';
      track.offsetHeight;           /* force reflow so instant takes effect */
    } else {
      track.style.transition = 'transform .6s cubic-bezier(.25,.46,.45,.94)';
    }
    track.style.transform = 'translateX(' + off + 'px)';
    updateActive();
    updateDots();
  }

  function updateActive() {
    Array.from(track.children).forEach(function (card, i) {
      card.classList.toggle('rv-card--active', i === trackPos);
      card.classList.toggle('rv-card--adj',    i === trackPos - 1 || i === trackPos + 1);
    });
  }

  /* ================================================================
     § 10 — NAVIGATION
     ================================================================ */
  function goTo(dir) {
    trackPos += dir;
    setOffset(false);
  }

  /* Infinite loop: after transition, silently jump from clone to real */
  track.addEventListener('transitionend', function () {
    if (trackPos < N) {
      trackPos += N;
      setOffset(true);
    } else if (trackPos >= 2 * N) {
      trackPos -= N;
      setOffset(true);
    }
    updateDots();
  });

  /* ================================================================
     § 11 — DOTS
     ================================================================ */
  function currentReal() {
    var r = ((trackPos % N) + N) % N;
    return r;
  }

  function updateDots() {
    if (!dotsEl) return;
    var active = currentReal();
    dotsEl.querySelectorAll('.rv-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === active);
    });
  }

  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = REVIEWS.map(function (r, i) {
      return '<button class="rv-dot" type="button" aria-label="Review ' + (i + 1) + ': ' + r.name + '"></button>';
    }).join('');
    dotsEl.querySelectorAll('.rv-dot').forEach(function (d, i) {
      d.addEventListener('click', function () {
        var delta = i - currentReal();
        if (delta === 0) return;
        /* shortest path wrapping */
        if (delta > N / 2)  delta -= N;
        if (delta < -N / 2) delta += N;
        goTo(delta);
        resetAuto();
      });
    });
    updateDots();
  }

  /* ================================================================
     § 12 — AUTOPLAY
     ================================================================ */
  function startAuto() {
    if (autoId) return;
    autoId = setInterval(function () { goTo(1); }, 4500);
  }

  function stopAuto() {
    clearInterval(autoId);
    autoId = null;
  }

  function resetAuto() { stopAuto(); startAuto(); }

  /* Pause on hover of the whole outer block */
  var hoverTarget = outer || carousel;
  hoverTarget.addEventListener('mouseenter', stopAuto);
  hoverTarget.addEventListener('mouseleave', startAuto);

  /* ================================================================
     § 13 — ARROWS
     ================================================================ */
  var arrowParent = outer || carousel;
  arrowParent.addEventListener('click', function (e) {
    var btn = e.target.closest('.rv-arrow');
    if (!btn) return;
    goTo(btn.classList.contains('rv-prev') ? -1 : 1);
    resetAuto();
  });

  /* ================================================================
     § 14 — TOUCH SWIPE
     ================================================================ */
  var tStart = null;

  track.addEventListener('touchstart', function (e) {
    if (e.touches.length > 1) return;
    tStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
    stopAuto();
  }, { passive: true });

  track.addEventListener('touchmove', function (e) {
    if (!tStart) return;
    /* if clearly vertical, release for page scroll */
    var dx = Math.abs(e.touches[0].clientX - tStart.x);
    var dy = Math.abs(e.touches[0].clientY - tStart.y);
    if (dy > dx + 8) { tStart = null; }
  }, { passive: true });

  track.addEventListener('touchend', function (e) {
    if (!tStart) { startAuto(); return; }
    var dx  = e.changedTouches[0].clientX - tStart.x;
    var dy  = Math.abs(e.changedTouches[0].clientY - tStart.y);
    var vel = Math.abs(dx) / Math.max(1, Date.now() - tStart.t);
    tStart = null;
    if ((Math.abs(dx) > 48 || vel > 0.25) && Math.abs(dx) > dy) {
      goTo(dx < 0 ? 1 : -1);
    }
    startAuto();
  }, { passive: true });

  /* ================================================================
     § 15 — MOUSE DRAG
     ================================================================ */
  track.addEventListener('mousedown', function (e) {
    if (e.button !== 0 || e.target.closest('a, button')) return;
    dragging   = true;
    dragStartX = e.clientX;
    dragOffset = getTargetOffset(trackPos);
    track.style.transition = 'none';
    track.classList.add('rv-dragging');
    stopAuto();
    e.preventDefault();
  });

  window.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    track.style.transform = 'translateX(' + (dragOffset + e.clientX - dragStartX) + 'px)';
  });

  window.addEventListener('mouseup', function (e) {
    if (!dragging) return;
    var dx  = e.clientX - dragStartX;
    dragging = false;
    track.classList.remove('rv-dragging');
    if (Math.abs(dx) > cardWidth() * 0.22) {
      goTo(dx < 0 ? 1 : -1);
    } else {
      setOffset(false);
    }
    startAuto();
  });

  /* ================================================================
     § 16 — RESIZE
     ================================================================ */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      applyCardWidths();
      setOffset(true);
    }, 120);
  });

  /* ================================================================
     § 17 — INIT
     ================================================================ */
  buildTrack();
  buildDots();
  setOffset(true);
  startAuto();

})();
