(function () {
  'use strict';

  var nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  var scrim = document.getElementById('scrim');

  function openMenu() {
    mobileMenu.classList.add('open');
    scrim.classList.add('show');
    burger.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    mobileMenu.classList.remove('open');
    scrim.classList.remove('show');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && mobileMenu && scrim) {
    burger.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.contains('open');
      isOpen ? closeMenu() : openMenu();
    });
    scrim.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }
})();
