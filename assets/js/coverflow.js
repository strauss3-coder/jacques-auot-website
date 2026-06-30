/* ===================================================================
   COVERFLOW 3D CAROUSEL — Jacques Auto
   Premium infinite showroom carousel, vanilla JS, no dependencies.
   =================================================================== */

(function () {
  'use strict';

  var root = document.getElementById('coverflow');
  if (!root) return;

  /* ── 1. Read vehicle data from the embedded <template> ───────── */
  var tpl = document.getElementById('cf-data');
  if (!tpl) return;
  var dataNodes = tpl.content.querySelectorAll('[data-img]');
  if (!dataNodes.length) return;

  var VEHICLES = Array.prototype.slice.call(dataNodes).map(function (n) {
    return {
      img:   n.dataset.img,
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
    /* mobile: one card + partial previews */
    var cw = Math.min(w - 64, 280);
    return { side: 1, spread: cw * 0.92, cardW: cw, cardH: 380, persp: 700 };
  }

  var C = cfg();

  /* ── 3. State ─────────────────────────────────────────────────── */
  var pos       = 0;    /* current interpolated index (float) */
  var target    = 0;    /* desired index (float, snaps to integer) */
  var hovered   = false;
  var isDrag    = false;
  var dragX0    = 0;
  var dragPos0  = 0;
  var lastX     = 0;
  var velX      = 0;
  var autoTimer = null;
  var resTimer  = null;
  var wheelSnap = null;

  /* ── 4. DOM references ───────────────────────────────────────── */
  var track   = root.querySelector('.cf-track');
  var stage   = root.querySelector('.cf-perspective');
  var prevBtn = root.querySelector('.cf-prev');
  var nextBtn = root.querySelector('.cf-next');

  /* ── 5. Build card elements ──────────────────────────────────── */
  var cards = VEHICLES.map(function (v, i) {
    var card = document.createElement('article');
    card.className = 'cf-card';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', v.title);
    card.innerHTML = buildCard(v);
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

    return (
      '<div class="cf-inner">' +
        '<div class="cf-img-wrap">' +
          '<img src="' + v.img + '" alt="' + v.alt + '" loading="lazy">' +
        '</div>' +
        /* inactive overlay — title on image */
        '<div class="cf-label">' + v.title + '</div>' +
        /* active glassmorphism panel */
        '<div class="cf-glass">' +
          '<div class="cf-glass-row">' +
            '<span class="cf-price">' + v.price + '</span>' +
            '<span class="cf-badge">Finance Available</span>' +
          '</div>' +
          '<div class="cf-meta">' +
            (v.year ? v.year + ' &middot; ' : '') + v.km +
            (v.tag  ? ' &middot; ' + v.tag : '') +
          '</div>' +
          '<a class="btn btn-wa cf-wa" href="' + wa + '" target="_blank" rel="noopener noreferrer">' +
            '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.1-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.4.4 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3A3 3 0 0 0 6 8.6c0 1.8 1.3 3.5 1.5 3.8s2.6 4 6.3 5.3c2.3.8 2.4.5 2.9.5a2.5 2.5 0 0 0 1.7-1.2 2 2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z"/></svg>' +
            'Enquire on WhatsApp' +
          '</a>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── 6. Apply config dimensions ──────────────────────────────── */
  function applyConfig() {
    if (stage) stage.style.perspective = C.persp + 'px';
    track.style.width  = C.cardW + 'px';
    track.style.height = C.cardH + 'px';
    cards.forEach(function (c) {
      c.style.width  = C.cardW + 'px';
      c.style.height = C.cardH + 'px';
    });
  }

  /* ── 7. Per-card visual transform from distance ──────────────── */
  function getProps(dist) {
    var abs = Math.abs(dist);
    return {
      tx:      dist * C.spread,
      tz:      Math.max(0, (1 - abs) * 90),    /* center floats toward viewer */
      rotY:    dist * -24,                       /* outer cards angle toward center */
      scale:   Math.max(0.42, 1 - abs * 0.19),
      opacity: Math.max(0.1,  1 - abs * 0.38),
      blur:    Math.max(0,    abs * 3),
      zIdx:    Math.round(100 - abs * 22),
      glassOp: Math.max(0,    1 - abs * 8),     /* glass fades in sharply at center */
      labelOp: Math.min(1, abs * 4),             /* label only on non-active cards */
    };
  }

  /* ── 8. Render loop ──────────────────────────────────────────── */
  var LERP = 0.09; /* smoothing: lower = more butter */

  function render() {
    var activeIdx = -1;
    var minDist   = Infinity;

    cards.forEach(function (card, i) {
      /* shortest circular distance from current pos */
      var d = i - pos;
      while (d >  N / 2) d -= N;
      while (d < -N / 2) d += N;

      var abs  = Math.abs(d);
      var clip = C.side + 2;      /* hide cards beyond visible window */

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
      card.style.cursor        = abs < 0.3 ? 'default' : 'pointer';
      card.style.transform     =
        'translateX(' + p.tx   + 'px) ' +
        'translateZ(' + p.tz   + 'px) ' +
        'rotateY('    + p.rotY + 'deg) ' +
        'scale('      + p.scale + ')';
      card.style.filter = abs < 0.08 ? 'none' : 'blur(' + p.blur + 'px)';

      /* active class drives breathing CSS animation */
      var isActive = abs < 0.15;
      card.classList.toggle('cf-active', isActive);

      /* glass panel (active only) */
      var glass = card.querySelector('.cf-glass');
      if (glass) {
        glass.style.opacity       = p.glassOp;
        glass.style.transform     = 'translateY(' + (1 - p.glassOp) * 8 + 'px)';
        glass.style.pointerEvents = p.glassOp > 0.1 ? 'auto' : 'none';
      }

      /* title label (inactive only) */
      var label = card.querySelector('.cf-label');
      if (label) label.style.opacity = p.labelOp;

      if (abs < minDist) { minDist = abs; activeIdx = i; }
    });

    /* aria-current */
    cards.forEach(function (c, i) {
      c.setAttribute('aria-current', i === activeIdx ? 'true' : 'false');
    });
  }

  function tick() {
    var diff = target - pos;
    if (Math.abs(diff) < 0.0008) {
      pos = target;
      /* keep position in [0, N) to prevent float drift */
      var norm = ((Math.round(pos) % N) + N) % N;
      pos    = norm;
      target = norm;
    } else {
      pos += diff * LERP;
    }
    render();
    requestAnimationFrame(tick);
  }

  /* ── 9. Navigation helpers ───────────────────────────────────── */
  function snapTo(idx) {
    /* choose the shortest wrap-around path from current target */
    var d = idx - target;
    while (d >  N / 2) d -= N;
    while (d < -N / 2) d += N;
    target = target + d;
  }

  function step(dir) { snapTo(Math.round(pos) + dir); }

  /* ── 10. Auto-advance ────────────────────────────────────────── */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(function () {
      if (!isDrag && !hovered) step(1);
    }, 4200);
  }
  function stopAuto() { clearInterval(autoTimer); }

  /* ── 11. Arrow buttons ───────────────────────────────────────── */
  if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { step(1);  });

  /* ── 12. Click on side card → navigate to it ────────────────── */
  track.addEventListener('click', function (e) {
    if (isDrag) return;
    var card = e.target.closest('.cf-card');
    if (!card) return;
    var idx = cards.indexOf(card);
    if (idx < 0) return;
    var d = idx - pos;
    while (d >  N / 2) d -= N;
    while (d < -N / 2) d += N;
    if (Math.abs(d) > 0.35) { e.preventDefault(); snapTo(idx); }
  });

  /* ── 13. Mouse drag ──────────────────────────────────────────── */
  track.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    isDrag   = true;
    dragX0   = e.clientX;
    dragPos0 = pos;
    lastX    = e.clientX;
    velX     = 0;
    e.preventDefault();
  });
  document.addEventListener('mousemove', function (e) {
    if (!isDrag) return;
    velX   = e.clientX - lastX;
    lastX  = e.clientX;
    target = dragPos0 + (dragX0 - e.clientX) / C.spread;
  });
  document.addEventListener('mouseup', function () {
    if (!isDrag) return;
    isDrag = false;
    snapTo(Math.round(pos - velX / C.spread * 2.5));
  });

  /* ── 14. Touch swipe ─────────────────────────────────────────── */
  var tx0 = 0, tp0 = 0;
  track.addEventListener('touchstart', function (e) {
    tx0  = e.touches[0].clientX;
    tp0  = pos;
    lastX = tx0;
    velX  = 0;
  }, { passive: true });
  track.addEventListener('touchmove', function (e) {
    velX   = e.touches[0].clientX - lastX;
    lastX  = e.touches[0].clientX;
    target = tp0 + (tx0 - lastX) / C.spread;
  }, { passive: true });
  track.addEventListener('touchend', function () {
    snapTo(Math.round(pos - velX / C.spread * 2.5));
  });

  /* ── 15. Mouse wheel / trackpad ──────────────────────────────── */
  root.addEventListener('wheel', function (e) {
    e.preventDefault();
    target += (e.deltaX !== 0 ? e.deltaX : e.deltaY) / 240;
    clearTimeout(wheelSnap);
    wheelSnap = setTimeout(function () { snapTo(Math.round(target)); }, 180);
  }, { passive: false });

  /* ── 16. Keyboard ────────────────────────────────────────────── */
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1);  }
  });
  track.setAttribute('tabindex', '0');

  /* ── 17. Hover pause ─────────────────────────────────────────── */
  root.addEventListener('mouseenter', function () { hovered = true;  });
  root.addEventListener('mouseleave', function () { hovered = false; });

  /* ── 18. Responsive resize ───────────────────────────────────── */
  window.addEventListener('resize', function () {
    clearTimeout(resTimer);
    resTimer = setTimeout(function () {
      C = cfg();
      applyConfig();
    }, 260);
  });

  /* ── 19. Init ────────────────────────────────────────────────── */
  applyConfig();
  render();
  requestAnimationFrame(tick);
  startAuto();

})();
