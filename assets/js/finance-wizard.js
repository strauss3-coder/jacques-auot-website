/* ===================================================================
   FINANCE APPLICATION WIZARD — Jacques Auto
   Multi-step form that generates a pre-filled mailto link.
   No server required — the user's email client opens ready to send.
   =================================================================== */
(function () {
  'use strict';

  var fw = document.getElementById('fw');
  if (!fw) return;

  /* ── state ── */
  var current = 1;
  var data    = {};

  /* ── helpers ── */
  function $(id)  { return document.getElementById(id); }
  function v(id)  { var e = $(id); return e ? e.value.trim() : ''; }
  function sv(id) { var e = $(id); return e ? e.value       : ''; }
  function money(n) { return n ? 'R ' + Number(n).toLocaleString('en-ZA') : '—'; }

  /* ── progress bar ── */
  function setProgress(n) {
    var bar = $('fw-bar');
    if (bar) bar.style.width = (Math.max(0, n - 1) / 3 * 100) + '%';
    fw.querySelectorAll('.fw-step').forEach(function (s) {
      var sn = parseInt(s.dataset.step);
      s.classList.toggle('active', sn === n);
      s.classList.toggle('done', sn < n);
    });
  }

  /* ── show panel ── */
  function showPanel(n) {
    fw.querySelectorAll('.fw-panel').forEach(function (p) {
      var on = parseInt(p.dataset.step) === n;
      p.classList.toggle('fw-panel--active', on);
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    setProgress(n);
    current = n;
    fw.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── validation ── */
  function checkField(id) {
    var e = $(id);
    if (!e) return true;
    var ok = e.value.trim() !== '';
    e.closest('.fw-field').classList.toggle('has-err', !ok);
    return ok;
  }

  function validate(n) {
    var ok = true;
    if (n === 1) {
      if (!checkField('fw-name'))  ok = false;
      if (!checkField('fw-phone')) ok = false;
      if (!checkField('fw-email')) ok = false;
    }
    if (n === 2) {
      if (!checkField('fw-status')) ok = false;
      if (!checkField('fw-income')) ok = false;
    }
    if (n === 3) {
      if (!checkField('fw-vehicle')) ok = false;
    }
    return ok;
  }

  /* ── collect step data ── */
  function collect(n) {
    if (n === 1) {
      data.name       = v('fw-name');
      data.phone      = v('fw-phone');
      data.email      = v('fw-email');
      data.idNumber   = v('fw-id');
      data.province   = sv('fw-province');
      data.city       = v('fw-city');
    }
    if (n === 2) {
      data.status     = sv('fw-status');
      data.employer   = v('fw-employer');
      data.occupation = v('fw-occupation');
      data.income     = v('fw-income');
      data.tenure     = sv('fw-tenure');
    }
    if (n === 3) {
      data.vehicle    = sv('fw-vehicle');
      data.deposit    = v('fw-deposit');
      data.tradeIn    = sv('fw-tradein');
      data.budget     = v('fw-budget');
      data.notes      = v('fw-notes');
    }
  }

  /* ── review panel builder ── */
  function rRow(k, val) {
    return '<div class="fw-review-row">' +
      '<span class="fw-review-key">' + k + '</span>' +
      '<span class="fw-review-val">' + (val || '—') + '</span>' +
    '</div>';
  }

  function rSection(title, stepN, rows) {
    return '<div class="fw-review-section">' +
      '<div class="fw-review-section-head">' +
        '<span class="fw-review-section-title">' + title + '</span>' +
        '<button class="fw-review-edit" type="button" data-goto="' + stepN + '">Edit</button>' +
      '</div>' +
      '<div class="fw-review-rows">' + rows.join('') + '</div>' +
    '</div>';
  }

  function buildReview() {
    var panel = fw.querySelector('[data-step="4"]');
    if (!panel) return;

    var ICON_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="margin-left:8px" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

    panel.innerHTML = (
      '<h2 class="fw-heading">Review Your Application</h2>' +
      '<p class="fw-sub">Please review your details. Once submitted, we’ll contact you within 24 hours.</p>' +

      '<div class="fw-review-card">' +
        rSection('Personal Information', 1, [
          rRow('Full Name',    data.name       || '—'),
          rRow('Phone',        data.phone      || '—'),
          rRow('Email',        data.email      || '—'),
          rRow('ID Number',    data.idNumber   || 'Not provided'),
          rRow('Province',     data.province   || '—'),
          rRow('City',         data.city       || '—'),
        ]) +
        rSection('Employment Information', 2, [
          rRow('Status',           data.status     || '—'),
          rRow('Employer',         data.employer   || '—'),
          rRow('Occupation',       data.occupation || '—'),
          rRow('Monthly Income',   money(data.income)),
          rRow('Time Employed',    data.tenure     || '—'),
        ]) +
        rSection('Finance Information', 3, [
          rRow('Vehicle',          data.vehicle    || '—'),
          rRow('Deposit',          money(data.deposit)),
          rRow('Trade-In',         data.tradeIn    || '—'),
          rRow('Monthly Budget',   money(data.budget)),
          rRow('Notes',            data.notes      || 'None'),
        ]) +
      '</div>' +

      '<div class="fw-actions">' +
        '<button class="fw-back" type="button" id="fw-back-4">← Back</button>' +
        '<button class="btn btn-primary fw-submit" type="button" id="fw-submit">' +
          'Submit Application' + ICON_ARROW +
        '</button>' +
      '</div>'
    );

    /* wire edit buttons */
    panel.querySelectorAll('.fw-review-edit').forEach(function (btn) {
      btn.addEventListener('click', function () { showPanel(parseInt(btn.dataset.goto)); });
    });

    var back4  = $('fw-back-4');
    var submit = $('fw-submit');
    if (back4)  back4.addEventListener('click', function () { showPanel(3); });
    if (submit) submit.addEventListener('click', submitApplication);
  }

  /* ── mailto generator ── */
  function submitApplication() {
    var d = data;
    var subject = 'Finance Application – ' + (d.vehicle || 'Vehicle Enquiry');

    var body = [
      'FINANCE APPLICATION — JACQUES AUTO',
      '==========================================',
      '',
      'PERSONAL INFORMATION',
      '  Full Name:      ' + (d.name       || '—'),
      '  Phone:          ' + (d.phone      || '—'),
      '  Email:          ' + (d.email      || '—'),
      '  ID Number:      ' + (d.idNumber   || 'Not provided'),
      '  Province:       ' + (d.province   || '—'),
      '  City:           ' + (d.city       || '—'),
      '',
      'EMPLOYMENT INFORMATION',
      '  Status:         ' + (d.status     || '—'),
      '  Employer:       ' + (d.employer   || '—'),
      '  Occupation:     ' + (d.occupation || '—'),
      '  Monthly Income: ' + money(d.income),
      '  Time Employed:  ' + (d.tenure     || '—'),
      '',
      'FINANCE INFORMATION',
      '  Vehicle:        ' + (d.vehicle    || '—'),
      '  Deposit:        ' + money(d.deposit),
      '  Trade-In:       ' + (d.tradeIn    || '—'),
      '  Monthly Budget: ' + money(d.budget),
      '  Notes:          ' + (d.notes      || 'None'),
      '',
      '==========================================',
      'Submitted via jacquesauto.com',
    ].join('\n');

    window.location.href =
      'mailto:sales@jacquesauto.com' +
      '?subject=' + encodeURIComponent(subject) +
      '&body='    + encodeURIComponent(body);
  }

  /* ── next handler ── */
  function goNext(fromStep) {
    if (!validate(fromStep)) return;
    collect(fromStep);
    if (fromStep === 3) buildReview();
    showPanel(fromStep + 1);
  }

  /* ── event bindings ── */
  fw.querySelectorAll('.fw-next').forEach(function (btn) {
    btn.addEventListener('click', function () { goNext(parseInt(btn.dataset.step)); });
  });

  fw.querySelectorAll('.fw-back:not(#fw-back-4)').forEach(function (btn) {
    btn.addEventListener('click', function () { showPanel(parseInt(btn.dataset.step) - 1); });
  });

  /* clear error highlight on any input/change */
  fw.querySelectorAll('.fw-input, .fw-select, .fw-textarea').forEach(function (el) {
    ['input', 'change'].forEach(function (ev) {
      el.addEventListener(ev, function () {
        var field = el.closest('.fw-field');
        if (field) field.classList.remove('has-err');
      });
    });
  });

  /* ── init ── */
  showPanel(1);
})();
