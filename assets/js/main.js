(function () {
  'use strict';

  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');

  function openLightbox(src, alt) {
    if (!src || !lightbox || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || 'Enlarged view';
    lightbox.classList.add('show');
    lbClose && lbClose.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('show');
  }

  if (lightbox && lbImg) {
    document.querySelectorAll('[data-full]').forEach(function (el) {
      el.addEventListener('click', function () {
        var img = el.querySelector('img');
        openLightbox(el.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    lbClose && lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  document.querySelectorAll('.carousel').forEach(function (carouselEl) {
    var track = carouselEl.querySelector('.carousel-track');
    var prev = carouselEl.querySelector('.carousel-btn.prev');
    var next = carouselEl.querySelector('.carousel-btn.next');
    if (!track) return;

    function step() {
      var card = track.querySelector('.vcard');
      return card ? card.getBoundingClientRect().width + 22 : track.clientWidth * 0.8;
    }

    function update() {
      var max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = max <= 4 || track.scrollLeft >= max - 4;
    }

    prev && prev.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    next && next.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        track.scrollBy({ left: step(), behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        track.scrollBy({ left: -step(), behavior: 'smooth' });
      }
    });

    /* let a vertical mouse-wheel drive horizontal scroll, but only while
       the carousel still has room to move so the page can keep scrolling */
    track.addEventListener(
      'wheel',
      function (e) {
        var max = track.scrollWidth - track.clientWidth;
        if (max <= 0) return;
        var atStart = track.scrollLeft <= 0;
        var atEnd = track.scrollLeft >= max;
        var verticalIntent = Math.abs(e.deltaY) > Math.abs(e.deltaX);
        if (verticalIntent && !((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd))) {
          e.preventDefault();
          track.scrollLeft += e.deltaY;
        }
      },
      { passive: false }
    );

    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ── "Local Dealer You Can Trust" — connected-cards effect ── */
  (function () {
    var grid = document.querySelector('.why-grid');
    if (!grid) return;

    /* connected dimming: hovering one card dims siblings */
    grid.addEventListener('mouseenter', function () {
      grid.classList.add('has-hover');
    }, true);
    grid.addEventListener('mouseleave', function () {
      grid.classList.remove('has-hover');
    }, true);

    /* cursor spotlight: track mouse inside each card, update CSS vars */
    grid.querySelectorAll('.why-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top)  + 'px');
      });
    });
  })();

  var form = document.getElementById('enquiryForm');
  var ok = document.getElementById('formOk');
  if (form && ok) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ok.classList.add('show');
      form.reset();
      setTimeout(function () {
        ok.classList.remove('show');
      }, 4000);
    });
  }
})();
