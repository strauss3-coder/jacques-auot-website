/* ===================================================================
   COVERFLOW 3D CAROUSEL — Jacques Auto  (v3)
   Premium infinite showroom carousel · vanilla JS · no dependencies

   Interaction model
   ─────────────────
   · Touch / mouse drag  → free momentum (no spring, no forced snap)
   · Arrows / auto       → smooth lerp to exact card index
   · After momentum dies → gentle passive drift to nearest card
     (prevents forever-stuck-between-cards without feeling like a snap)
   · Wheel               → continuous, snaps after brief idle
   · Lightbox            → full-res poster with in-lightbox navigation
   =================================================================== */

(function () {
  'use strict';

  var root = document.getElementById('coverflow');
  if (!root) return;

  /* ── 1. Vehicle data ─────────────────────────────────────────── */
  var tpl = document.getElementById('cf-data');
  if (!tpl) return;
  var nodes = tpl.content.querySelectorAll('[data-img]');
  if (!nodes.length) return;

  var VEHICLES = Array.prototype.slice.call(nodes).map(function (n) {
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
    var cw = Math.min(w - 64, 280);
    return { side: 1, spread: cw * 0.88, cardW: cw, cardH: 380, persp: 700 };
  }

  var C = cfg();

  /* ── 3. Motion constants ─────────────────────────────────────── */
  var FRICTION       = 0.93;  /* momentum decay per frame (swipe glide)    */
  var DRIFT_FACTOR   = 0.05;  /* passive drift rate once momentum is ~zero */
  var DRIFT_THRESH   = 0.002; /* momentum below this → start passive drift */
  var LERP_FACTOR    = 0.12;  /* lerp rate for arrow / auto-advance        */
  var FLING_MULT     = 3.0;   /* fling distance multiplier                 */
  var WHEEL_SCALE    = 220;   /* pixels of wheel delta per card            */

  /* ── 4. State ────────────────────────────────────────────────── */
  var pos        = 0;      /* current visual position (float, in card units) */
  var momentum   = 0;      /* post-release glide velocity (card units/frame) */
  var lerpTarget = null;   /* non-null only during arrow/auto navigation     */
  var hovered    = false;
  var isDrag     = false;
  var didDrag    = false;  /* distinguishes drag-release from click           */
  var dragX0     = 0;
  var dragPos0   = 0;
  var lastX      = 0;
  var velX       = 0;      /* smoothed drag/swipe velocity                    */
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

    /* broken-image fallback */
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

    return (
      '<div class="cf-inner">' +
        '<div class="cf-img-wrap">' +
          '<img src="' + v.img + '" alt="' + v.alt + '" loading="lazy">' +
          '<div class="cf-ph" aria-hidden="true"></div>' +
        '</div>' +
        '<div class="cf-actions">' +
          '<a class="btn btn-wa cf-action-btn" href="' + wa +
             '" target="_blank" rel="noopener noreferrer">' +
            '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">' +
              '<path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.1-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.4.4 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3A3 3 0 0 0 6 8.6c0 1.8 1.3 3.5 1.5 3.8s2.6 4 6.3 5.3c2.3.8 2.4.5 2.9.5a2.5 2.5 0 0 0 1.7-1.2 2 2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z"/>' +
            '</svg>' +
            'Enquire' +
          '</a>' +
          '<button class="btn cf-action-btn cf-action-ghost cf-view-btn" type="button">View Poster</button>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── 7. Responsive dimensions ────────────────────────────────── */
  function applyConfig() {
    if (stage) stage.style.perspective = C.persp + 'px';
    track.style.width  = C.cardW + 'px';
    track.style.height = C.cardH + 'px';
    cards.forEach(function (c) {
      c.style.width  = C.cardW + 'px';
      c.style.height = C.cardH + 'px';
    });
  }

  /* ── 8. Per-card visual transform (visuals UNCHANGED) ─────────── */
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

  /* ── 9. Render ───────────────────────────────────────────────── */
  function render() {
    var activeIdx = -1;
    var minDist   = Infinity;

    cards.forEach(function (card, i) {
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

      var actions = card.querySelector('.cf-actions');
      if (actions) {
        actions.style.opacity       = p.glassOp;
        actions.style.transform     = 'translateY(' + (1 - p.glassOp) * 8 + 'px)';
        actions.style.pointerEvents = p.glassOp > 0.1 ? 'auto' : 'none';
      }

      if (abs < minDist) { minDist = abs; activeIdx = i; }
    });

    cards.forEach(function (c, i) {
      c.setAttribute('aria-current', i === activeIdx ? 'true' : 'false');
    });
  }

  /* ── 10. Helpers: normalise position to [0, N) ───────────────── */
  function normalise() {
    pos = ((pos % N) + N) % N;
    if (lerpTarget !== null) {
      /* keep lerp target on same "side" to avoid wrap-around jumps */
      while (lerpTarget - pos >  N / 2) lerpTarget -= N;
      while (pos - lerpTarget >  N / 2) lerpTarget += N;
    }
  }

  /* ── 11. Animation tick ──────────────────────────────────────── */
  function tick() {
    if (!isDrag) {

      if (lerpTarget !== null) {
        /* ── arrow / auto-advance: smooth lerp, no bounce ── */
        var diff = lerpTarget - pos;
        pos += diff * LERP_FACTOR;
        if (Math.abs(diff) < 0.0005) {
          pos        = lerpTarget;
          lerpTarget = null;
          normalise();
        }

      } else if (Math.abs(momentum) > DRIFT_THRESH) {
        /* ── post-swipe: free momentum glide ── */
        pos      += momentum;
        momentum *= FRICTION;
        normalise();

      } else {
        /* ── passive drift: gently align to nearest card ─────────
           This engages only when momentum has fully decayed.
           Rate is slow enough to feel like settling, not snapping. */
        momentum = 0;
        var nearest = Math.round(pos);
        var toNearest = nearest - pos;
        /* shortest path across wrap boundary */
        while (toNearest >  N / 2) toNearest -= N;
        while (toNearest < -N / 2) toNearest += N;
        if (Math.abs(toNearest) > 0.0005) {
          pos += toNearest * DRIFT_FACTOR;
        } else {
          pos = nearest;
          normalise();
        }
      }
    }
    /* during drag: pos is written directly — tick just renders */

    render();
    requestAnimationFrame(tick);
  }

  /* ── 12. Navigation: arrow buttons, auto, keyboard ──────────── */
  function navTo(idx) {
    /* shortest circular path, then smooth lerp */
    var d = idx - pos;
    while (d >  N / 2) d -= N;
    while (d < -N / 2) d += N;
    lerpTarget = pos + d;
    momentum   = 0;
  }

  function step(dir) { navTo(Math.round(pos) + dir); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(function () {
      if (!isDrag && !hovered) step(1);
    }, 4200);
  }
  function stopAuto() { clearInterval(autoTimer); }

  if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { step(1);  });

  /* ── 13. Side-card click → navigate ─────────────────────────── */
  track.addEventListener('click', function (e) {
    /* "View full poster" button — handled separately below */
    if (e.target.classList.contains('cf-view-btn')) return;
    /* suppress click if this pointer-up follows a real drag */
    if (didDrag) { didDrag = false; return; }

    var card = e.target.closest('.cf-card');
    if (!card) return;
    var idx  = cards.indexOf(card);
    if (idx < 0) return;
    var d = idx - pos;
    while (d >  N / 2) d -= N;
    while (d < -N / 2) d += N;
    if (Math.abs(d) > 0.35) { e.preventDefault(); navTo(idx); }
  });

  /* ── 14. Mouse drag ──────────────────────────────────────────── */
  track.style.cursor = 'grab';

  track.addEventListener('mousedown', function (e) {
    if (e.button !== 0 || e.target.closest('a, button')) return;
    isDrag     = true;
    didDrag    = false;
    dragX0     = e.clientX;
    dragPos0   = pos;
    lastX      = e.clientX;
    velX       = 0;
    momentum   = 0;
    lerpTarget = null;
    track.style.cursor         = 'grabbing';
    document.body.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDrag) return;
    var rawVel = e.clientX - lastX;
    velX  = velX * 0.65 + rawVel * 0.35;   /* smoothed velocity */
    lastX = e.clientX;
    if (Math.abs(e.clientX - dragX0) > 4) didDrag = true;
    pos = dragPos0 + (dragX0 - e.clientX) / C.spread;
  });

  document.addEventListener('mouseup', function () {
    if (!isDrag) return;
    isDrag     = false;
    lerpTarget = null;
    track.style.cursor         = 'grab';
    document.body.style.cursor = '';
    /* release: hand velocity off to momentum system */
    momentum = -(velX / C.spread) * FLING_MULT;
  });

  /* ── 15. Touch swipe — direction-aware ───────────────────────── */
  var tStartX   = 0;
  var tStartY   = 0;
  var tStartPos = 0;
  var tDir      = null;   /* null | 'x' | 'y' */
  var tLastX    = 0;
  var tVelX     = 0;

  track.addEventListener('touchstart', function (e) {
    if (e.touches.length > 1) return;   /* ignore multi-touch */
    var t   = e.touches[0];
    tStartX  = t.clientX;
    tStartY  = t.clientY;
    tStartPos = pos;
    tLastX   = t.clientX;
    tVelX    = 0;
    tDir     = null;
    momentum = 0;
    lerpTarget = null;
  }, { passive: true });

  track.addEventListener('touchmove', function (e) {
    if (e.touches.length > 1) { tDir = 'y'; return; } /* pinch = page zoom, bail */
    var t  = e.touches[0];
    var dx = t.clientX - tStartX;
    var dy = t.clientY - tStartY;

    /* detect direction on first 4 px of movement */
    if (tDir === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      tDir = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
    }

    /* vertical → page scrolls normally, don't touch carousel */
    if (tDir !== 'x') return;

    e.preventDefault();   /* own the horizontal gesture */

    var rawVel = t.clientX - tLastX;
    tVelX  = tVelX * 0.65 + rawVel * 0.35;
    tLastX = t.clientX;

    pos = tStartPos + (tStartX - t.clientX) / C.spread;
  }, { passive: false });   /* non-passive required for preventDefault */

  track.addEventListener('touchend', function (e) {
    if (tDir !== 'x') { tDir = null; return; }
    tDir       = null;
    lerpTarget = null;
    /* hand velocity off to momentum system */
    momentum = -(tVelX / C.spread) * FLING_MULT;
  }, { passive: true });

  /* ── 16. Wheel ───────────────────────────────────────────────── */
  root.addEventListener('wheel', function (e) {
    e.preventDefault();
    var delta  = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    lerpTarget = null;
    pos       += delta / WHEEL_SCALE;
    momentum   = 0;
    clearTimeout(wheelSnap);
    wheelSnap = setTimeout(function () { navTo(Math.round(pos)); }, 220);
  }, { passive: false });

  /* ── 17. Keyboard ────────────────────────────────────────────── */
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1);  }
  });
  track.setAttribute('tabindex', '0');

  /* ── 18. Hover pause ─────────────────────────────────────────── */
  root.addEventListener('mouseenter', function () { hovered = true;  });
  root.addEventListener('mouseleave', function () { hovered = false; });

  /* ── 19. Resize ──────────────────────────────────────────────── */
  window.addEventListener('resize', function () {
    clearTimeout(resTimer);
    resTimer = setTimeout(function () { C = cfg(); applyConfig(); }, 260);
  });

  /* ================================================================
     LIGHTBOX — full-res poster viewer with in-lightbox navigation
     ================================================================ */
  var lb        = null;
  var lbImgEl   = null;
  var lbCapEl   = null;
  var lbIdx     = 0;
  var lbOpen    = false;
  var lbTx0     = 0;

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'cf-lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Vehicle poster viewer');
    lb.innerHTML = (
      '<button class="cf-lb-close" aria-label="Close">&#xd7;</button>' +
      '<button class="cf-lb-nav cf-lb-prev" aria-label="Previous poster">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
          '<path d="M15 18l-6-6 6-6"/></svg>' +
      '</button>' +
      '<button class="cf-lb-nav cf-lb-next" aria-label="Next poster">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
          '<path d="M9 18l6-6-6-6"/></svg>' +
      '</button>' +
      '<div class="cf-lb-inner">' +
        '<img class="cf-lb-img" src="" alt="" loading="eager">' +
      '</div>' +
      '<p class="cf-lb-cap"></p>'
    );
    document.body.appendChild(lb);

    lbImgEl = lb.querySelector('.cf-lb-img');
    lbCapEl = lb.querySelector('.cf-lb-cap');

    /* close handlers */
    lb.querySelector('.cf-lb-close').addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target === lb.querySelector('.cf-lb-inner')) closeLb();
    });

    /* in-lightbox navigation */
    lb.querySelector('.cf-lb-prev').addEventListener('click', function (e) {
      e.stopPropagation(); lbNav(-1);
    });
    lb.querySelector('.cf-lb-next').addEventListener('click', function (e) {
      e.stopPropagation(); lbNav(1);
    });

    /* keyboard (only active when lightbox is open) */
    document.addEventListener('keydown', function (e) {
      if (!lbOpen) return;
      if (e.key === 'Escape')      closeLb();
      if (e.key === 'ArrowLeft')   lbNav(-1);
      if (e.key === 'ArrowRight')  lbNav(1);
    });

    /* swipe in lightbox to navigate (single-touch only, let 2-finger pinch zoom) */
    lb.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) lbTx0 = e.touches[0].clientX;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (e.changedTouches.length !== 1) return;
      var dx = e.changedTouches[0].clientX - lbTx0;
      if (Math.abs(dx) > 48) lbNav(dx > 0 ? -1 : 1);
    }, { passive: true });
  }

  function openLb(idx) {
    if (!lb) buildLightbox();
    lbIdx  = ((idx % N) + N) % N;
    lbOpen = true;
    lbSetSlide(lbIdx, false);
    lb.classList.add('cf-lb-show');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.cf-lb-close').focus();
  }

  function closeLb() {
    if (!lb) return;
    lbOpen = false;
    lb.classList.remove('cf-lb-show');
    document.body.style.overflow = '';
  }

  function lbNav(dir) {
    lbIdx = ((lbIdx + dir) % N + N) % N;
    lbSetSlide(lbIdx, true);
  }

  function lbSetSlide(idx, animate) {
    var v = VEHICLES[idx];
    if (animate) {
      lbImgEl.style.opacity = '0';
      lbImgEl.style.transform = 'scale(0.97)';
      setTimeout(function () {
        lbImgEl.src = v.img;
        lbImgEl.alt = v.alt;
        lbCapEl.textContent = v.title + (v.price ? '  ·  ' + v.price : '');
        lbImgEl.style.opacity   = '1';
        lbImgEl.style.transform = 'scale(1)';
      }, 160);
    } else {
      lbImgEl.src = v.img;
      lbImgEl.alt = v.alt;
      lbCapEl.textContent = v.title + (v.price ? '  ·  ' + v.price : '');
      lbImgEl.style.opacity   = '1';
      lbImgEl.style.transform = 'scale(1)';
    }
  }

  /* "View full poster" button — delegated click on track */
  track.addEventListener('click', function (e) {
    var btn = e.target.closest('.cf-view-btn');
    if (!btn) return;
    e.stopPropagation();
    var card = btn.closest('.cf-card');
    var idx  = cards.indexOf(card);
    if (idx >= 0) openLb(idx);
  });

  /* ── 20. Init ────────────────────────────────────────────────── */
  applyConfig();
  render();
  requestAnimationFrame(tick);
  startAuto();

})();
