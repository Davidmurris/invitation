// Opens the cover, reveals the envelope, drops petals, and runs the music button.
(function () {
  var cover = document.getElementById('cover');
  var envImg = document.getElementById('envImg');
  var music = document.getElementById('music');
  var song = document.getElementById('song');

  // Falling petals on the cover (skipped if the visitor prefers reduced motion)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (var i = 0; i < 14; i++) {
      var p = document.createElement('span');
      p.className = 'petal';
      p.style.left = Math.random() * 100 + '%';
      p.style.background = i % 3 ? '#7a1d2b' : '#f1dfd0';
      p.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      p.style.animationDuration = (9 + Math.random() * 9) + 's';
      p.style.animationDelay = (-Math.random() * 14) + 's';
      cover.appendChild(p);
    }
  }

  function setPlaying(on) {
    music.classList.toggle('on', on);
    music.setAttribute('aria-pressed', on);
  }

  // "Open" button
  document.getElementById('openBtn').addEventListener('click', function () {
    cover.classList.add('gone');
    document.body.classList.remove('locked');
    music.classList.add('show');
    window.scrollTo(0, 0);
    setTimeout(function () { envImg.classList.add('in'); }, 200);

    // Browsers allow audio only after a tap, so start it here
    song.play().then(function () { setPlaying(true); }).catch(function () { setPlaying(false); });
  });

  // Music button
  music.addEventListener('click', function () {
    if (song.paused) { song.play().then(function () { setPlaying(true); }).catch(function () {}); }
    else { song.pause(); setPlaying(false); }
  });

  // ---------- Photo gallery (3D coverflow) ----------
  var PHOTO_COUNT = 11;                       // CHANGE: how many photos you have
  var EXTS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'];
var PHOTO_PATH = function (n, e) { return 'assets/gallery/' + (n < 10 ? '0' + n : n) + '.' + EXTS[e]; };

  var cf = document.getElementById('cf'), countEl = document.getElementById('cfCount');
  var arch = document.querySelector('.arch');
  document.querySelectorAll('.has-arch').forEach(function (sec) { sec.insertBefore(arch.cloneNode(true), sec.firstChild); });  // building sketch behind each section
  var slides = [], cur = 0;

  for (var n = 1; n <= PHOTO_COUNT; n++) {
    (function (n) {
      var s = document.createElement('div'); s.className = 'sl';
      var im = new Image(); im.alt = 'Photo ' + n; im.loading = 'lazy'; im.draggable = false;
   var tries = 0;
im.onerror = function () {
  tries++;
  if (tries < EXTS.length) { im.src = PHOTO_PATH(n, tries); }
  else { s.className = 'sl ph'; s.textContent = n; }
};
im.src = PHOTO_PATH(n, 0); s.appendChild(im); cf.appendChild(s); slides.push(s);
    })(n);
  }
  function layout() {
    slides.forEach(function (s, i) {
      var d = i - cur, ad = Math.abs(d), sg = d < 0 ? -1 : 1;
      var x = d ? sg * (0.5 + 0.21 * (ad - 1)) : 0;
      var rot = d ? -sg * Math.min(50 + 22 * (ad - 1), 78) : 0;
      var sc = d ? 0.7 - 0.04 * (ad - 1) : 1;
      s.style.transform = 'translate(-50%,-50%) translateX(' + x * 100 + '%) rotateY(' + rot + 'deg) scale(' + sc + ')';
      s.style.zIndex = 10 - ad; s.style.opacity = ad > 3 ? 0 : 1; s.style.pointerEvents = ad > 3 ? 'none' : 'auto';
      s.style.filter = d ? 'brightness(.88)' : 'none';
    });
    countEl.textContent = (cur + 1) + ' / ' + PHOTO_COUNT;
  }
  function go(i) { cur = Math.max(0, Math.min(PHOTO_COUNT - 1, i)); layout(); }
  var startX = null;
  cf.addEventListener('pointerdown', function (e) { startX = e.clientX; });
  cf.addEventListener('pointerup', function (e) {
    if (startX === null) return; var dx = e.clientX - startX; startX = null;
    if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); return; }
    var t = e.target.closest('.sl'); if (t) go(slides.indexOf(t));          // tap a side photo to bring it forward
  });
  cf.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });
  layout();

  // ---------- Countdown ----------
  var cd = document.getElementById('countdown'), target = new Date(cd.dataset.target).getTime();
  function tick() {
    var ms = target - Date.now();
    if (ms <= 0) { cd.textContent = 'The day has arrived!'; return; }
    var t = Math.floor(ms / 1000);
    cd.textContent = Math.floor(t / 86400) + ' days ' + Math.floor(t % 86400 / 3600) + ' hours ' +
      Math.floor(t % 3600 / 60) + ' min ' + (t % 60) + ' sec';
  }
  tick(); setInterval(tick, 1000);

  // ---------- Calendar (Monday-first, highlights the wedding day) ----------
  var cal = document.getElementById('calendar'), p = cal.dataset.date.split('-').map(Number);
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var first = (new Date(p[0], p[1] - 1, 1).getDay() + 6) % 7, days = new Date(p[0], p[1], 0).getDate();
  var html = '<h3>' + months[p[1] - 1] + ' ' + p[0] + '</h3><div class="row wd">' +
    ['Mo','Tu','We','Th','Fr','Sa','Su'].map(function (d) { return '<span>' + d + '</span>'; }).join('') + '</div>';
  var cells = [], k;
  for (k = 0; k < first; k++) cells.push('<span></span>');
  for (k = 1; k <= days; k++) cells.push('<span' + (k === p[2] ? ' class="hl"' : '') + '>' + k + '</span>');
  while (cells.length % 7) cells.push('<span></span>');
  for (k = 0; k < cells.length; k += 7) html += '<div class="row">' + cells.slice(k, k + 7).join('') + '</div>';
  cal.innerHTML = html;

  // ---------- Add to Calendar (downloads an .ics file) ----------
  var EVENT = { title: "Bridget & Joshua's Wedding", start: '20270430T090000', end: '20270430T210000', place: "J's Signatures Hotel, Port-Harcourt, Nigeria" };  // CHANGE
  document.getElementById('addCal').addEventListener('click', function (e) {
    e.preventDefault();
    var ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding Invitation//EN','BEGIN:VEVENT','UID:' + EVENT.start + '@wedding-invite',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]|\.\d{3}/g, ''),'DTSTART:' + EVENT.start,'DTEND:' + EVENT.end,
      'SUMMARY:' + EVENT.title,'LOCATION:' + EVENT.place,'END:VEVENT','END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'wedding.ics'; document.body.appendChild(a); a.click(); a.remove();
  });

   // ---------- Guestbook ----------
  // Wishes are saved in the "Guestbook" tab of your Google Sheet (through the same RSVP.endpoint link),
  // so every guest sees everyone's wishes. If RSVP.endpoint is empty, wishes only stay in this browser (testing).
  var KEY = 'guestbook-wishes', list = document.getElementById('gbList'), wishes = [], usingSamples = false;
  var SAMPLES = [   // shown only when no link is set; they disappear once you connect Google
    { name: 'Guest Name', text: 'Congratulations! We can’t wait to celebrate with you both.', t: Date.now() - 86400000 },
    { name: 'Another Guest', text: 'Wishing you a lifetime of love and happiness.', t: Date.now() - 172800000 }
  ];
  function localWishes() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function renderWishes() {
    list.textContent = '';
    if (!wishes.length) {
      var empty = document.createElement('p'); empty.textContent = 'Be the first to leave a wish.';
      empty.style.cssText = 'text-align:center;color:#8a4a50;font-size:1.1rem'; list.appendChild(empty); return;
    }
    wishes.slice().sort(function (a, b) { return b.t - a.t; }).forEach(function (w) {
      var card = document.createElement('article'); card.className = 'wish';
      var hd = document.createElement('div'); hd.className = 'hd';
      var nm = document.createElement('b'); nm.textContent = w.name;
      var tm = document.createElement('time'); tm.textContent = new Date(w.t).toLocaleString('en-US');
      var p = document.createElement('p'); p.textContent = w.text;
      hd.appendChild(nm); hd.appendChild(tm); card.appendChild(hd); card.appendChild(p); list.appendChild(card);
    });
  }
  function loadWishes() {
    if (RSVP.endpoint) {
      fetch(RSVP.endpoint + '?action=wishes').then(function (r) { return r.json(); })
        .then(function (d) { wishes = d; renderWishes(); })
        .catch(function () { wishes = localWishes(); renderWishes(); });
    } else {
      wishes = localWishes(); if (!wishes.length) { wishes = SAMPLES; usingSamples = true; } renderWishes();
    }
  }
  var gbName = document.getElementById('gbName'), gbMsg = document.getElementById('gbMsg'), gbHp = document.getElementById('gbHp');
  document.getElementById('gbForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = gbName.value.trim(), text = gbMsg.value.trim();
    if (!name || !text) { (name ? gbMsg : gbName).focus(); return; }
    if (usingSamples) { wishes = []; usingSamples = false; }
    wishes.unshift({ name: name, text: text, t: Date.now() });            // show it straight away
    if (RSVP.endpoint) {
      try { fetch(RSVP.endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ type: 'wish', name: name, text: text, hp: gbHp ? gbHp.value : '' }) }); } catch (err) {}
    } else { try { localStorage.setItem(KEY, JSON.stringify(wishes)); } catch (err) {} }
    gbName.value = gbMsg.value = ''; renderWishes(); list.scrollTop = 0;
  });
  var IDEAS = ['Congratulations! May your love grow stronger with each passing day.',
    'Wishing you a beautiful marriage filled with joy, laughter and God’s blessings.',
    'So happy for you both! Can’t wait to celebrate your big day.',
    'May your home be filled with peace, love and endless happiness.'];
  document.getElementById('gbWand').addEventListener('click', function () { gbMsg.value = IDEAS[Math.floor(Math.random() * IDEAS.length)]; });
  window.addEventListener('load', loadWishes);     // runs after the whole page (and RSVP.endpoint) is ready


  // ---------- Monetary gifts dialog ----------
  var dlg = document.getElementById('giftDlg');
  document.getElementById('giftBtn').addEventListener('click', function () { dlg.showModal(); });
  document.getElementById('giftClose').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  document.getElementById('copyAcct').addEventListener('click', function (e) {
    var b = e.currentTarget; if (navigator.clipboard) navigator.clipboard.writeText(document.getElementById('acctNo').textContent);
    b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1500);
  });

     // ---------- RSVP popup ----------
  // CHANGE (after you set up the Google Sheet script):
  //   endpoint = the "Web app" address from Google Apps Script. It saves each RSVP in your sheet and emails the guest.
  //   whatsapp = your number with country code, digits only (e.g. '2348012345678'); shows a "Message us on WhatsApp" button.
  var RSVP = { endpoint: 'https://script.google.com/macros/s/AKfycbzzTHtJ_VSl20tdUrSs37TQwoIAXoObWXACghwicDCUKVbSHjB2dKh8dX04pren3zgZ/exec', whatsapp: '2348130842981' };
  var rDlg = document.getElementById('rsvpDlg'), rForm = document.getElementById('rsvpForm'), rMain = document.getElementById('rsvpMain'),
      rName = document.getElementById('rsvpName'), rEmail = document.getElementById('rsvpEmail'), rPhone = document.getElementById('rsvpPhone'),
      rGo = document.getElementById('rsvpGo'), rDone = document.getElementById('rsvpDone'), rWa = document.getElementById('rsvpWa'),
      rOpts = rDlg.querySelectorAll('.opt'), rChoice = '';
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
  function validPhone(v) { var d = v.replace(/\D/g, ''); return d.length >= 7 && d.length <= 15; }
  function rCheck() { rGo.disabled = !(rName.value.trim() && rChoice && (validEmail(rEmail.value) || validPhone(rPhone.value))); }
  document.getElementById('rsvp').addEventListener('click', function (e) { e.preventDefault(); rDlg.showModal(); });
  document.getElementById('rsvpClose').addEventListener('click', function () { rDlg.close(); });
  document.getElementById('rsvpOk').addEventListener('click', function () { rDlg.close(); });
  rDlg.addEventListener('click', function (e) { if (e.target === rDlg) rDlg.close(); });
  [rName, rEmail, rPhone].forEach(function (i) { i.addEventListener('input', rCheck); });
  rOpts.forEach(function (o) {
    o.addEventListener('click', function () {
      rChoice = o.dataset.v;
      rOpts.forEach(function (x) { x.setAttribute('aria-checked', x === o ? 'true' : 'false'); });
      rCheck();
    });
  });
  rForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (rGo.disabled) return;
    var name = rName.value.trim(), yes = rChoice === 'yes', email = validEmail(rEmail.value) ? rEmail.value.trim() : '', phone = validPhone(rPhone.value) ? rPhone.value.trim() : '';
    rGo.disabled = true; rGo.textContent = 'Sending…';
    function finish() {
      document.getElementById('rsvpThanks').textContent = yes ? 'Thank you, ' + name + '!' : 'We’ll miss you, ' + name;
      var msg = yes ? 'We can’t wait to celebrate with you.' : 'Thank you for letting us know.';
      if (email && RSVP.endpoint) msg += ' A confirmation email is on its way. Please check your spam folder if you don’t see it.';
      document.getElementById('rsvpThanksMsg').textContent = msg;
      if (RSVP.whatsapp) {
        rWa.href = 'https://wa.me/' + RSVP.whatsapp + '?text=' + encodeURIComponent('RSVP: ' + name + (yes ? ' will attend the wedding.' : ' is sorry, can’t make it to the wedding.'));
        rWa.hidden = false;
      }
      rMain.hidden = true; rDone.hidden = false; rGo.textContent = 'Confirm';
    }
    if (!RSVP.endpoint) { finish(); return; }
    var timer = setTimeout(finish, 8000), done = false;
    function once() { if (!done) { done = true; clearTimeout(timer); finish(); } }
    try {
      fetch(RSVP.endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ name: name, attending: yes, email: email, whatsapp: phone, hp: document.getElementById('rsvpHp').value, time: new Date().toISOString() }) })
        .then(once, once);
    } catch (err) { once(); }
  });
  rDlg.addEventListener('close', function () {
    rMain.hidden = false; rDone.hidden = true; rWa.hidden = true; rForm.reset(); rChoice = '';
    rOpts.forEach(function (x) { x.setAttribute('aria-checked', 'false'); }); rCheck();
  });

})();
