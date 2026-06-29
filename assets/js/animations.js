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
