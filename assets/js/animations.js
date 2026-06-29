(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function runCount(el) {
    var target = +el.getAttribute('data-target');
    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString();
      return;
    }
    var dur = 1500;
    var start = null;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var v = Math.floor((1 - Math.pow(1 - p, 3)) * target);
      el.textContent = v >= 1000 ? v.toLocaleString() : v;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var revealEls = document.querySelectorAll('.reveal');

  function revealAll() {
    revealEls.forEach(function (el) {
      el.classList.add('in');
      el.querySelectorAll('.count').forEach(runCount);
    });
  }

  if ('IntersectionObserver' in window) {
    try {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              entry.target.querySelectorAll('.count').forEach(runCount);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    } catch (err) {
      revealAll();
    }
  } else {
    revealAll();
  }
})();

/* hero intro: scroll-driven word-by-word title reveal */
(function () {
  'use strict';

  var hero = document.querySelector('.hero');
  if (!hero) return;

  var words = hero.querySelectorAll('h1 .word');
  var heroRest = hero.querySelector('.hero-rest');
  var heroScroll = document.getElementById('heroScroll');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var alreadySeen = false;
  try {
    alreadySeen = sessionStorage.getItem('heroIntroDone') === '1';
  } catch (e) {}

  function showAll() {
    words.forEach(function (w) {
      w.classList.add('in');
    });
    heroRest && heroRest.classList.add('in');
  }

  if (prefersReducedMotion || alreadySeen || words.length === 0 || window.scrollY > 0) {
    showAll();
    return;
  }

  var revealed = 0;
  var total = words.length;
  var delta = 0;
  var THRESHOLD = 90;
  var locked = true;

  var hintTimer = setTimeout(function () {
    if (locked && revealed === 0 && heroScroll) heroScroll.classList.add('show');
  }, 3000);

  function setRevealed(n) {
    n = Math.max(0, Math.min(total, n));
    if (n === revealed) return;
    revealed = n;
    words.forEach(function (w, i) {
      w.classList.toggle('in', i < revealed);
    });
    if (revealed > 0) {
      clearTimeout(hintTimer);
      heroScroll && heroScroll.classList.remove('show');
    }
    if (revealed >= total) unlock();
  }

  function unlock() {
    if (!locked) return;
    locked = false;
    clearTimeout(hintTimer);
    heroScroll && heroScroll.classList.remove('show');
    heroRest && heroRest.classList.add('in');
    document.body.classList.remove('hero-lock');
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('keydown', onKeyDown);
    try {
      sessionStorage.setItem('heroIntroDone', '1');
    } catch (e) {}
  }

  function onWheel(e) {
    if (!locked) return;
    e.preventDefault();
    delta += e.deltaY;
    while (delta >= THRESHOLD) {
      delta -= THRESHOLD;
      setRevealed(revealed + 1);
    }
    while (delta <= -THRESHOLD) {
      delta += THRESHOLD;
      setRevealed(revealed - 1);
    }
  }

  var touchStartY = null;
  function onTouchStart(e) {
    touchStartY = e.touches[0].clientY;
  }
  function onTouchMove(e) {
    if (!locked || touchStartY === null) return;
    e.preventDefault();
    var y = e.touches[0].clientY;
    var d = touchStartY - y;
    touchStartY = y;
    delta += d * 1.6;
    while (delta >= THRESHOLD) {
      delta -= THRESHOLD;
      setRevealed(revealed + 1);
    }
    while (delta <= -THRESHOLD) {
      delta += THRESHOLD;
      setRevealed(revealed - 1);
    }
  }

  function onKeyDown(e) {
    if (!locked) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      setRevealed(revealed + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      setRevealed(revealed - 1);
    }
  }

  document.body.classList.add('hero-lock');
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('keydown', onKeyDown);

  /* safety valve: never trap the user indefinitely */
  setTimeout(function () {
    if (locked) setRevealed(total);
  }, 20000);
})();
