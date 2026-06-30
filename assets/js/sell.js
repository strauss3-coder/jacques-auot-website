/* ===================================================================
   SELL YOUR VEHICLE WIZARD — Jacques Auto
   Multi-step valuation form that generates a pre-filled WhatsApp link.
   =================================================================== */
(function () {
  'use strict';

  var wrap = document.getElementById('svWrap');
  if (!wrap) return;

  var current = 1;

  /* ── field value helper ── */
  function gv(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  /* ── show step n ── */
  function showStep(n) {
    wrap.querySelectorAll('.sv-panel').forEach(function (p) {
      var on = parseInt(p.dataset.step) === n;
      p.classList.toggle('sv-panel--active', on);
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
    });

    wrap.querySelectorAll('.sv-step').forEach(function (s) {
      var sn = parseInt(s.dataset.step);
      s.classList.toggle('sv-step--active', sn === n);
      s.classList.toggle('sv-step--done',   sn < n);
    });

    current = n;
    wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (n === 4) {
      buildReview();
      updateSubmitLink();
    }
  }

  /* ── validation ── */
  function markErr(id, bad) {
    var el = document.getElementById(id);
    if (!el) return;
    el.closest('.sv-field').classList.toggle('has-err', bad);
  }

  function validate(step) {
    var ok = true;
    if (step === 1) {
      ['sv-make', 'sv-model', 'sv-year'].forEach(function (id) {
        var bad = !gv(id);
        markErr(id, bad);
        if (bad) ok = false;
      });
    }
    if (step === 3) {
      ['sv-name', 'sv-phone'].forEach(function (id) {
        var bad = !gv(id);
        markErr(id, bad);
        if (bad) ok = false;
      });
    }
    return ok;
  }

  /* ── review builder ── */
  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function row(label, val) {
    return '<div class="sv-review-row">' +
      '<span class="sv-review-key">' + label + '</span>' +
      '<span class="sv-review-val">' + esc(val || '—') + '</span>' +
      '</div>';
  }

  function group(title, rows) {
    return '<div class="sv-review-group">' +
      '<div class="sv-review-group-title">' + title + '</div>' +
      rows + '</div>';
  }

  function buildReview() {
    var el = document.getElementById('sv-review');
    if (!el) return;
    el.innerHTML =
      group('🚗 Vehicle Details',
        row('Make',         gv('sv-make')) +
        row('Model',        gv('sv-model')) +
        row('Year',         gv('sv-year')) +
        row('Variant',      gv('sv-variant')) +
        row('Mileage',      gv('sv-mileage') ? gv('sv-mileage') + ' km' : '') +
        row('Colour',       gv('sv-colour')) +
        row('Transmission', gv('sv-transmission')) +
        row('Fuel Type',    gv('sv-fuel'))
      ) +
      group('🔧 Vehicle Condition',
        row('Service History',     gv('sv-service')) +
        row('Accident History',    gv('sv-accident')) +
        row('Mechanical',          gv('sv-mechanical')) +
        row('Exterior',            gv('sv-exterior')) +
        row('Interior',            gv('sv-interior')) +
        row('Finance Outstanding', gv('sv-outstanding')) +
        row('Asking Price',        gv('sv-price')) +
        row('Additional Notes',    gv('sv-comments'))
      ) +
      group('👤 Seller Details',
        row('Name',              gv('sv-name')) +
        row('Phone',             gv('sv-phone')) +
        row('Email',             gv('sv-email')) +
        row('Preferred Contact', gv('sv-contact-pref'))
      );
  }

  /* ── WhatsApp message builder ── */
  function buildWAUrl() {
    var v = {
      make:        gv('sv-make'),
      model:       gv('sv-model'),
      year:        gv('sv-year'),
      variant:     gv('sv-variant'),
      mileage:     gv('sv-mileage') ? gv('sv-mileage') + ' km' : '',
      colour:      gv('sv-colour'),
      transmission:gv('sv-transmission'),
      fuel:        gv('sv-fuel'),
      service:     gv('sv-service'),
      accident:    gv('sv-accident'),
      mechanical:  gv('sv-mechanical'),
      exterior:    gv('sv-exterior'),
      interior:    gv('sv-interior'),
      outstanding: gv('sv-outstanding'),
      price:       gv('sv-price'),
      comments:    gv('sv-comments'),
      name:        gv('sv-name'),
      phone:       gv('sv-phone'),
      email:       gv('sv-email'),
      contactPref: gv('sv-contact-pref')
    };

    function line(label, val) {
      return '\n' + label + ': ' + (val || '—');
    }

    var msg = [
      '*Vehicle Valuation Request — Jacques Auto*',
      '',
      '*🚗 Vehicle Details*',
      'Make: '         + (v.make        || '—'),
      'Model: '        + (v.model       || '—'),
      'Year: '         + (v.year        || '—'),
      'Variant: '      + (v.variant     || '—'),
      'Mileage: '      + (v.mileage     || '—'),
      'Colour: '       + (v.colour      || '—'),
      'Transmission: ' + (v.transmission|| '—'),
      'Fuel Type: '    + (v.fuel        || '—'),
      '',
      '*🔧 Vehicle Condition*',
      'Service History: '      + (v.service     || '—'),
      'Accident History: '     + (v.accident    || '—'),
      'Mechanical Condition: ' + (v.mechanical  || '—'),
      'Exterior Condition: '   + (v.exterior    || '—'),
      'Interior Condition: '   + (v.interior    || '—'),
      'Finance Outstanding: '  + (v.outstanding || '—'),
      'Estimated Asking Price: '+ (v.price      || '—'),
      'Additional Notes: '     + (v.comments    || '—'),
      '',
      '*👤 Seller Details*',
      'Name: '             + (v.name        || '—'),
      'Phone: '            + (v.phone       || '—'),
      'Email: '            + (v.email       || '—'),
      'Preferred Contact: '+ (v.contactPref || '—'),
      '',
      '_I will attach photos of my vehicle after sending this message._'
    ].join('\n');

    return 'https://wa.me/27722034791?text=' + encodeURIComponent(msg);
  }

  function updateSubmitLink() {
    var btn = document.getElementById('svSubmit');
    if (btn) btn.href = buildWAUrl();
  }

  /* ── event delegation ── */
  wrap.addEventListener('click', function (e) {
    if (e.target.closest('.sv-btn-next')) {
      if (!validate(current)) return;
      if (current < 4) showStep(current + 1);
    }
    if (e.target.closest('.sv-btn-back')) {
      if (current > 1) showStep(current - 1);
    }
    if (e.target.closest('#svSubmit')) {
      updateSubmitLink();
    }
  });

  /* clear field errors on input */
  wrap.addEventListener('input',  function (e) {
    var f = e.target.closest('.sv-field');
    if (f) f.classList.remove('has-err');
  });
  wrap.addEventListener('change', function (e) {
    var f = e.target.closest('.sv-field');
    if (f) f.classList.remove('has-err');
  });

})();
