/* ===================================================================
   COVERFLOW 3D CAROUSEL — Jacques Auto  (v2 — refined interactions)
   Premium infinite showroom carousel, vanilla JS, no dependencies.

   Fixes in this version:
   · Image paths resolved from <template> with full relative path
   · Touch: direction-aware — horizontal swipe owns the carousel,
     vertical swipe falls through to page scroll; no passive conflict
   · Mouse drag: clean velocity tracking, cursor feedback, click guard
   · Spring physics ("magnetic" snap) replacing linear lerp
   · Image load-error placeholder
   =================================================================== */

(function () {
  'use strict';

  var root = document.getElementById('coverflow');
  if (!root) return;

  /* ── 1. Vehicle data from <template id="cf-data"> ────────────── */
  var tpl = document.getElementById('cf-data');
  if (!tpl) return;
  var nodes = tpl.content.querySelectorAll('[data-img]');
  if (!nodes.length) return;

  var VEHICLES = Array.prototype.slice.call(nodes).map(function (n) {
    return {
      img:   n.dataset.img,          /* already a full relative path */
      title: n.dataset.title,
      year:  n.dataset.year  || '',
      price: n.dataset.price || '',
      km:    n.dataset.km    || '',
      tag:   n.dataset.tag   || '',
      alt:   n.dataset.alt   || n.dataset.title,
    };
  });

  var N = VEHICLES.length;

  /* ── 2. Responsive layout config ────────────────────────────── */
  function cfg() {
    var w = window.innerWidth;
    if (w >= 1080) return { side: 2, spread: 340, cardW: 300, cardH: 410, persp: 1200 };
    if (w >=  680) return { side: 1, spread: 260, cardW: 250, cardH: 360, persp:  900 };
    var cw = Math.min(w - 64, 280);
    return { side: 1, spread: cw * 0.88, cardW: cw, cardH: 380, persp: 700 };
  }

  var C = cfg();

  /* ── 3. Spring physics constants ────────────────────────────── */
  var SPRING_K  = 0.20;   /* stiffness — pull toward target per frame   */
  var SPRING_D  = 0.76;   /* damping  — slightly underdamped for overshoot */
  var MOMENTUM  = 3.2;    /* how far a fast fling carries past snap point  */

  /* ── 4. State ────────────────────────────────────────────────── */
  var pos        = 0;     /* current interpolated index (float)  */
  var target     = 0;     /* desired index (snaps to integer)    */
  var springVel  = 0;     /* spring velocity                     */
  var hovered    = false;
  var isDrag     = false;
  var didDrag    = false; /* distinguishes click vs. drag on mouseup */
  var dragX0     = 0;
  var dragPos0   = 0;
  var lastX      = 0;
  var velX       = 0;     /* smoothed drag velocity              */
  var autoTimer  = null;
  var resTimer   = null;
  var wheelSnap  = null;

  /* ── 5. DOM references ───────────────────────────────────────── */
  var track   = root.querySelector('.cf-track');
  var stage   = root.querySelector('.cf-perspective');
  var prevBtn = root.querySelector('.cf-prev');
  var nextBtn = root.querySelector('.cf-next');

  /* ── 6. Build card elements ──────────────────────────────────── */
  var cards = VEHICLES.map(function (v) {
    var card = document.createElement('article');
    card.className = 'cf-card';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', v.title);
    card.innerHTML = buildCard(v);

    /* image error → placeholder */
    var img = card.querySelector('img');
    if (img) {
      img.addEventListener('error', function () {
        this.style.display = 'none';
        var ph = card.querySelector('.cf-ph');
        if (ph) ph.style.display = 'flex';
      });
    }

    track.appendChild(card);
    return card;
  });

  function buildCard(v) {
    var msg = encodeURIComponent(
      'Hi! I\'m interested in the ' + v.title +
      (v.price ? ' (' + v.price + ')' : '') +
      '. Can you share more details and availability?'
    );
    var wa = 'https://wa.me/27722034791?text=' + msg;
    /* initials for placeholder */
    var init = v.title.split(' ').slice(0, 2).map(function (w) {
      return w[0] || '';
    }).join('').toUpperCase();

    return (
      '<div class="cf-inner">' +
        '<div class="cf-img-wrap">' +
          '<img src="' + v.img + '" alt="' + v.alt + '" loading="lazy">' +
          /* shown only when image fails to load */
          '<div class="cf-ph" aria-hidden="true">' + init + '</div>' +
        '</div>' +
        '<div class="cf-label">' + v.title + '</div>' +
        '<div class="cf-glass">' +
          '<div class="cf-glass-row">' +
            '<span class="cf-price">' + v.price + '</span>' +
            '<span class="cf-badge">Finance Available</span>' +
          '</div>' +
          '<div class="cf-meta">' +
            (v.year ? v.year + ' &middot; ' : '') + v.km +
            (v.tag  ? ' &middot; ' + v.tag  : '') +
          '</div>' +
          '<a class="btn btn-wa cf-wa" href="' + wa +
             '" target="_blank" rel="noopener noreferrer">' +
            '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
              '<path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12' +
              ' 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12' +
              ' 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.1-.5' +
              ' 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.4.4 0 0 0 0-.4l-.8' +
              '-1.9c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3A3 3 0 0 0 6 8.6c0' +
              ' 1.8 1.3 3.5 1.5 3.8s2.6 4 6.3 5.3c2.3.8 2.4.5 2.9.5a2.5 2.5' +
              ' 0 0 0 1.7-1.2 2 2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z"/>' +
            '</svg>' +
            'Enquire on WhatsApp' +
          '</a>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── 7. Apply responsive dimensions ─────────────────────────── */
  function applyConfig() {
    if (stage) stage.style.perspective = C.persp + 'px';
    track.style.width  = C.cardW + 'px';
    track.style.height = C.cardH + 'px';
    cards.forEach(function (c) {
      c.style.width  = C.cardW + 'px';
      c.style.height = C.cardH + 'px';
    });
  }

  /* ── 8. Per-card transform from distance (unchanged visuals) ── */
  function getProps(dist) {
    var abs = Math.abs(dist);
    return {
      tx:      dist * C.spread,
      tz:      Math.max(0, (1 - abs) * 90),
      rotY:    dist * -24,
      scale:   Math.max(0.42, 1 - abs * 0.19),
      opacity: Math.max(0.10, 1 - abs * 0.38),
      blur:    Math.max(0,    abs * 3),
      zIdx:    Math.round(100 - abs * 22),
      glassOp: Math.max(0,    1 - abs * 8),
      labelOp: Math.min(1,    abs * 4),
    };
  }

  /* ── 9. Render — apply transforms to every visible card ─────── */
  function render() {
    var activeIdx = -1;
    var minDist   = Infinity;

    cards.forEach(function (card, i) {
      /* shortest-path circular distance */
      var d = i - pos;
      while (d >  N / 2) d -= N;
      while (d < -N / 2) d += N;

      var abs  = Math.abs(d);
      var clip = C.side + 2;

      if (abs > clip) {
        card.style.visibility = 'hidden';
        card.style.opacity    = '0';
        return;
      }

      var p = getProps(d);

      card.style.visibility    = 'visible';
      card.style.zIndex        = p.zIdx;
      card.style.opacity       = p.opacity;
      card.style.pointerEvents = abs < 1.5 ? 'auto' : 'none';
      card.style.cursor        = (isDrag || abs < 0.3) ? 'default' : 'pointer';
      card.style.transform     =
        'translateX(' + p.tx    + 'px) ' +
        'translateZ(' + p.tz    + 'px) ' +
        'rotateY('    + p.rotY  + 'deg) ' +
        'scale('      + p.scale + ')';
      card.style.filter = abs < 0.08 ? 'none' : 'blur(' + p.blur + 'px)';

      card.classList.toggle('cf-active', abs < 0.15);

      var glass = card.querySelector('.cf-glass');
      if (glass) {
        glass.style.opacity       = p.glassOp;
        glass.style.transform     = 'translateY(' + (1 - p.glassOp) * 8 + 'px)';
        glass.style.pointerEvents = p.glassOp > 0.1 ? 'auto' : 'none';
      }
      var label = card.querySelector('.cf-label');
      if (label) label.style.opacity = p.labelOp;

      if (abs < minDist) { minDist = abs; activeIdx = i; }
    });

    cards.forEach(function (c, i) {
      c.setAttribute('aria-current', i === activeIdx ? 'true' : 'false');
    });
  }

  /* ── 10. Spring animation tick ───────────────────────────────── */
  function tick() {
    if (!isDrag) {
      /* spring physics: apply stiffness + damping each frame */
      var diff  = target - pos;
      springVel = springVel * SPRING_D + diff * SPRING_K;
      pos      += springVel;

      /* settle: close enough AND barely moving */
      if (Math.abs(diff) < 0.0006 && Math.abs(springVel) < 0.0006) {
        pos       = target;
        springVel = 0;
        /* normalise to prevent float drift */
        var norm = ((Math.round(pos) % N) + N) % N;
        pos    = norm;
        target = norm;
      }
    }
    /* when isDrag, pos is written directly by the drag handler */

    render();
    requestAnimationFrame(tick);
  }

  /* ── 11. Navigation helpers ──────────────────────────────────── */
  function snapTo(idx) {
    /* always pick the shortest wrap-around path */
    var d = idx - target;
    while (d >  N / 2) d -= N;
    while (d < -N / 2) d += N;
    target    = target + d;
    springVel = 0;          /* let spring start fresh from current pos */
  }

  function step(dir) { snapTo(Math.round(pos) + dir); }

  /* ── 12. Auto-advance (pauses on interaction) ────────────────── */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(function () {
      if (!isDrag && !hovered) step(1);
    }, 4200);
  }
  function stopAuto() { clearInterval(autoTimer); }

  /* ── 13. Arrow buttons ───────────────────────────────────────── */
  if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { step(1);  });

  /* ── 14. Click on side card → navigate ─────────────────────── */
  track.addEventListener('click', function (e) {
    /* ignore if this click was the end of a mouse drag */
    if (didDrag) { didDrag = false; return; }
    var card = e.target.closest('.cf-card');
    if (!card) return;
    var idx = cards.indexOf(card);
    if (idx < 0) return;
    var d = idx - pos;
    while (d >  N / 2) d -= N;
    while (d < -N / 2) d += N;
    if (Math.abs(d) > 0.35) { e.preventDefault(); snapTo(idx); }
  });

  /* ── 15. Mouse drag — desktop ───────────────────────────────── */
  track.style.cursor = 'grab';

  track.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    isDrag   = true;
    didDrag  = false;
    dragX0   = e.clientX;
    dragPos0 = pos;
    lastX    = e.clientX;
    velX     = 0;
    springVel = 0;
    track.style.cursor          = 'grabbing';
    document.body.style.cursor  = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDrag) return;
    /* exponential-smoothed velocity for natural momentum */
    var rawVel = e.clientX - lastX;
    velX  = velX * 0.6 + rawVel * 0.4;
    lastX = e.clientX;

    /* move dx > 4px → mark as a drag (not a click) */
    if (Math.abs(e.clientX - dragX0) > 4) didDrag = true;

    /* write pos directly while dragging (spring bypassed in tick) */
    pos = dragPos0 + (dragX0 - e.clientX) / C.spread;
  });

  document.addEventListener('mouseup', function () {
    if (!isDrag) return;
    isDrag = false;
    track.style.cursor         = 'grab';
    document.body.style.cursor = '';

    /* fling snap: nearest card + momentum throw */
    var throwCards = -(velX / C.spread) * MOMENTUM;
    snapTo(Math.round(pos + throwCards));
  });

  /* ── 16. Touch swipe — direction-aware, page-scroll safe ─────
     Strategy:
     · touchstart (passive) — record start coords, reset state
     · touchmove  (non-passive!) — detect direction on first move
       > horizontal → e.preventDefault(), own the carousel
       > vertical   → do nothing, let page scroll through
     · touchend (passive) — snap to nearest card with momentum       */

  var tStartX  = 0;
  var tStartY  = 0;
  var tStartPos = 0;
  var tDir     = null;   /* null | 'x' | 'y' */
  var tLastX   = 0;
  var tVelX    = 0;

  track.addEventListener('touchstart', function (e) {
    var t    = e.touches[0];
    tStartX  = t.clientX;
    tStartY  = t.clientY;
    tStartPos = pos;
    tLastX   = t.clientX;
    tVelX    = 0;
    tDir     = null;
    springVel = 0;
  }, { passive: true });

  track.addEventListener('touchmove', function (e) {
    var t  = e.touches[0];
    var dx = t.clientX - tStartX;
    var dy = t.clientY - tStartY;

    /* lock direction on first significant movement (6 px threshold) */
    if (tDir === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      tDir = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }

    /* vertical scroll — don't interfere */
    if (tDir !== 'x') return;

    /* horizontal swipe — own it */
    e.preventDefault();

    var rawVel = t.clientX - tLastX;
    tVelX  = tVelX * 0.6 + rawVel * 0.4;
    tLastX = t.clientX;

    /* write pos directly while dragging */
    pos = tStartPos + (tStartX - t.clientX) / C.spread;
  }, { passive: false });   /* MUST be non-passive to call preventDefault */

  track.addEventListener('touchend', function () {
    if (tDir !== 'x') { tDir = null; return; }
    tDir = null;
    var throwCards = -(tVelX / C.spread) * MOMENTUM;
    snapTo(Math.round(pos + throwCards));
  }, { passive: true });

  /* ── 17. Mouse wheel / trackpad horizontal ───────────────────── */
  root.addEventListener('wheel', function (e) {
    /* prefer horizontal delta (trackpad 2-finger scroll);
       fall back to vertical (traditional mouse wheel)       */
    var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    /* only hijack wheel when there is actual horizontal intent
       OR when the user is over the carousel (not just scrolling past) */
    e.preventDefault();
    target   += delta / 220;
    springVel = 0;

    clearTimeout(wheelSnap);
    wheelSnap = setTimeout(function () {
      snapTo(Math.round(target));
    }, 200);
  }, { passive: false });

  /* ── 18. Keyboard ────────────────────────────────────────────── */
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1);  }
  });
  track.setAttribute('tabindex', '0');

  /* ── 19. Hover pause ─────────────────────────────────────────── */
  root.addEventListener('mouseenter', function () { hovered = true;  });
  root.addEventListener('mouseleave', function () { hovered = false; });

  /* ── 20. Responsive resize ───────────────────────────────────── */
  window.addEventListener('resize', function () {
    clearTimeout(resTimer);
    resTimer = setTimeout(function () {
      C = cfg();
      applyConfig();
    }, 260);
  });

  /* ── 21. Init ────────────────────────────────────────────────── */
  applyConfig();
  render();
  requestAnimationFrame(tick);
  startAuto();

})();
