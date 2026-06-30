/* ===================================================================
   ENQUIRY WIZARD — Jacques Auto
   2-step form: fill details → review → send via WhatsApp.
   =================================================================== */
(function () {
  'use strict';

  var wrap = document.getElementById('eqWrap');
  if (!wrap) return;

  function gv(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  /* ── panel toggle ── */
  function showPanel(n) {
    var panels = wrap.querySelectorAll('.eq-panel');
    panels.forEach(function (p, i) {
      var on = i + 1 === n;
      p.classList.toggle('eq-panel--active', on);
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (n === 2) {
      buildReview();
      updateLink();
    }
  }

  /* ── validation ── */
  function markErr(id, bad) {
    var el = document.getElementById(id);
    if (!el) return;
    var field = el.closest('.sv-field');
    if (field) field.classList.toggle('has-err', bad);
  }

  function validate() {
    var ok = true;
    ['eq-name', 'eq-phone'].forEach(function (id) {
      var bad = !gv(id);
      markErr(id, bad);
      if (bad) ok = false;
    });
    return ok;
  }

  /* ── review builder ── */
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function row(label, val) {
    return '<div class="sv-review-row">' +
      '<span class="sv-review-key">' + label + '</span>' +
      '<span class="sv-review-val">' + esc(val || '—') + '</span>' +
      '</div>';
  }

  function buildReview() {
    var el = document.getElementById('eq-review');
    if (!el) return;
    el.innerHTML =
      '<div class="sv-review-group">' +
        '<div class="sv-review-group-title">Enquiry Details</div>' +
        row('Name',    gv('eq-name')) +
        row('Phone',   gv('eq-phone')) +
        row('Email',   gv('eq-email')) +
        row('Subject', gv('eq-subject')) +
        row('Message', gv('eq-msg')) +
      '</div>';
  }

  /* ── WhatsApp URL ── */
  function buildWAUrl() {
    var msg = [
      '*General Enquiry — Jacques Auto*',
      '',
      'Name: '    + (gv('eq-name')    || '—'),
      'Phone: '   + (gv('eq-phone')   || '—'),
      'Email: '   + (gv('eq-email')   || '—'),
      'Subject: ' + (gv('eq-subject') || '—'),
      '',
      '*Message:*',
      gv('eq-msg') || '—'
    ].join('\n');
    return 'https://wa.me/27722034791?text=' + encodeURIComponent(msg);
  }

  function updateLink() {
    var a = document.getElementById('eqSubmit');
    if (a) a.href = buildWAUrl();
  }

  /* ── events ── */
  wrap.addEventListener('click', function (e) {
    if (e.target.closest('.eq-btn-next')) {
      if (validate()) showPanel(2);
    }
    if (e.target.closest('.eq-btn-back')) {
      showPanel(1);
    }
    if (e.target.closest('#eqSubmit')) {
      updateLink();
    }
  });

  wrap.addEventListener('input', function (e) {
    var f = e.target.closest('.sv-field');
    if (f) f.classList.remove('has-err');
  });
  wrap.addEventListener('change', function (e) {
    var f = e.target.closest('.sv-field');
    if (f) f.classList.remove('has-err');
  });

})();
