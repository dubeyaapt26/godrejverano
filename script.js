/* Godrej Verano landing page: nav, forms, popup */
(function () {
  'use strict';

  var PHONE = '919211535553';
  var MAIL_ROUTE = '/api/enquiry';
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/aaptdubey@godrejverano.org';

  /* Mobile nav */
  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('mobilenav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = mnav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mnav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mnav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Forms */
  function getParam(name) {
    try { return new URLSearchParams(window.location.search).get(name) || ''; } catch (e) { return ''; }
  }

  function buildWhatsAppText(data) {
    var lines = ['Hi, I am interested in Godrej Verano Sector 63A.'];
    if (data.name) lines.push('Name: ' + data.name);
    if (data.phone) lines.push('Mobile: ' + data.phone);
    if (data.config) lines.push('Configuration: ' + data.config);
    if (data.purpose) lines.push('Purpose: ' + data.purpose);
    if (data.message) lines.push('Note: ' + data.message);
    lines.push('Please send the price list and floor plans.');
    return encodeURIComponent(lines.join('\n'));
  }

  function setMsg(form, text, ok) {
    var el = form.querySelector('.form-msg');
    if (!el) return;
    el.textContent = text;
    el.className = 'form-msg ' + (ok ? 'ok' : 'err');
  }

  function validate(form) {
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (input) {
      input.classList.remove('invalid');
      var v = input.value.trim();
      if (!v) { valid = false; input.classList.add('invalid'); return; }
      if (input.type === 'tel' && !/^[6-9][0-9]{9}$/.test(v)) { valid = false; input.classList.add('invalid'); }
      if (input.type === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { valid = false; input.classList.add('invalid'); }
    });
    return valid;
  }

  function handleSubmit(e) {
    e.preventDefault();
    var form = e.target;
    if (form.querySelector('.honey') && form.querySelector('.honey').value) return; /* bot */
    if (!validate(form)) {
      setMsg(form, 'Please check your name and 10 digit mobile number.', false);
      return;
    }
    var btn = form.querySelector('button[type="submit"]');
    var original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    var fd = new FormData(form);
    var data = {};
    fd.forEach(function (v, k) { if (k !== '_honey') data[k] = v; });
    data.source = form.getAttribute('data-source') || 'page';
    data.page = window.location.href;
    data.utm_source = getParam('utm_source');
    data.utm_medium = getParam('utm_medium');
    data.utm_campaign = getParam('utm_campaign');
    data.submitted_at = new Date().toISOString();
    data._subject = 'Godrej Verano enquiry: ' + (data.name || '') + ' (' + (data.config || '') + ')';
    data._template = 'table';
    data._captcha = 'false';

    var waUrl = 'https://wa.me/' + PHONE + '?text=' + buildWhatsAppText(data);

    function done(ok) {
      btn.disabled = false;
      btn.textContent = original;
      if (ok) {
        setMsg(form, 'Thanks. Your enquiry is in. Opening WhatsApp so you get the price list straight away.', true);
        form.reset();
        if (window.gtag) { try { gtag('event', 'generate_lead', { source: data.source }); } catch (err) {} }
        if (window.fbq) { try { fbq('track', 'Lead'); } catch (err) {} }
        setTimeout(function () { window.open(waUrl, '_blank'); }, 900);
      } else {
        setMsg(form, 'Could not send just now. Tap below to send the same details on WhatsApp.', false);
        var fallback = document.createElement('a');
        fallback.href = waUrl;
        fallback.target = '_blank';
        fallback.rel = 'noopener';
        fallback.className = 'btn btn--wa btn--full';
        fallback.textContent = 'Send on WhatsApp instead';
        form.appendChild(fallback);
      }
    }

    function postJSON(url) {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.ok) return r.json();
        return Promise.reject(r.status);
      });
    }
    /* 1. site mail route (Vercel, sends via the godrejverano.org mailbox); 2. FormSubmit as fallback; 3. WhatsApp */
    postJSON(MAIL_ROUTE)
      .then(function () { done(true); })
      .catch(function () {
        postJSON(FORM_ENDPOINT)
          .then(function () { done(true); })
          .catch(function () { done(false); });
      });
  }

  document.querySelectorAll('.lead-form').forEach(function (f) {
    f.addEventListener('submit', handleSubmit);
    var tel = f.querySelector('input[type="tel"]');
    if (tel) tel.addEventListener('input', function () { tel.value = tel.value.replace(/\D/g, '').slice(0, 10); });
  });

  /* Popup: once per session, after 35s or on exit intent (desktop) */
  var popup = document.getElementById('popup');
  var shown = false;
  try { shown = sessionStorage.getItem('gv_popup') === '1'; } catch (e) {}
  function showPopup() {
    if (shown || !popup) return;
    shown = true;
    try { sessionStorage.setItem('gv_popup', '1'); } catch (e) {}
    popup.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function hidePopup() {
    if (!popup) return;
    popup.hidden = true;
    document.body.style.overflow = '';
  }
  if (popup) {
    popup.querySelector('.modal__close').addEventListener('click', hidePopup);
    popup.addEventListener('click', function (e) { if (e.target === popup) hidePopup(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hidePopup(); });
    setTimeout(showPopup, 35000);
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY < 10 && window.innerWidth > 1024) showPopup();
    });
  }

  /* Active nav highlight */
  var links = document.querySelectorAll('.nav a');
  if ('IntersectionObserver' in window && links.length) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (a) { a.style.color = ''; });
          map[en.target.id].style.color = '#1f8a7f';
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }
})();

/* Lightbox for gallery, plans and figures */
(function () {
  var lb = document.getElementById('lightbox');
  if (!lb) return;
  var img = lb.querySelector('img');
  var cap = lb.querySelector('.lightbox__cap');
  function open(src, alt) {
    img.src = src; img.alt = alt || ''; cap.textContent = alt || '';
    lb.hidden = false; document.body.style.overflow = 'hidden';
  }
  function close() { lb.hidden = true; img.src = ''; document.body.style.overflow = ''; }
  document.querySelectorAll('[data-full]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var target = el.tagName === 'IMG' ? el : el.querySelector('img');
      open(el.getAttribute('data-full'), target ? target.alt : '');
    });
  });
  lb.querySelector('.lightbox__close').addEventListener('click', close);
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) close(); });
})();
