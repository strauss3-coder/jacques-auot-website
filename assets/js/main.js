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
