/* site-effects.js : page-load splash + night mode.
   Add  <script src="site-effects.js"></script>  inside <head> of every page. */
(function () {
  var root = document.documentElement, KEY = 'night-mode';

  /* ---------- apply saved theme + splash immediately (no flash) ---------- */
  try { if (localStorage.getItem(KEY) === 'dark') root.setAttribute('data-night', 'on'); } catch (e) {}
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var arriving = false;
  try { arriving = sessionStorage.getItem('splash') === '1'; sessionStorage.removeItem('splash'); } catch (e) {}
  if (arriving && !reduce) root.classList.add('splash', 'arriving');

  /* ---------- styles ---------- */
  var DARK = 'invert(1) hue-rotate(180deg)';
  var css = `
  html.splash::before{content:"አለታ-ህዳሴ";position:fixed;inset:0;z-index:99999;display:grid;place-items:center;
    background:#0f1730;color:#ff7a3d;font:800 clamp(2rem,6vw,3rem) "Noto Sans Ethiopic",system-ui,sans-serif;animation:sp-in .25s ease both}
  html.splash::after{content:"";position:fixed;left:50%;top:calc(50% + 46px);width:120px;height:4px;margin-left:-60px;z-index:100000;
    border-radius:4px;background:linear-gradient(90deg,#ff7a3d,#fdc83a);animation:sp-bar .7s ease-in-out infinite alternate}
  html.splash.arriving::before{animation:none}
  html.splash-out::before,html.splash-out::after{opacity:0;transition:opacity .4s ease}
  @keyframes sp-in{from{opacity:0}to{opacity:1}}
  @keyframes sp-bar{from{transform:scaleX(.3)}to{transform:scaleX(1)}}

  /* night mode: invert the page, but keep the header, pictures and video as they are */
  html[data-night="on"]{background:#0b1020;color-scheme:dark}
  html[data-night="on"] body{background:#0b1020}
  html[data-night="on"] body > :not(header):not(nav):not(script):not(style):not(#theme-toggle){filter:${DARK}}
  html[data-night="on"] body > :not(header):not(nav) :is(img,picture,video,iframe,canvas,.hero){filter:${DARK}}
  #theme-toggle{cursor:pointer}
  #theme-toggle.floating{position:fixed;right:16px;bottom:16px;z-index:9999;width:46px;height:46px;border-radius:50%;
    border:0;background:#14206b;color:#fff;font-size:1.3rem;line-height:1;box-shadow:0 4px 14px rgba(0,0,0,.35)}
  `;
  var st = document.createElement('style'); st.textContent = css; (document.head || root).appendChild(st);

  /* ---------- after the page is ready ---------- */
  function ready() {
    /* hide the splash */
    if (root.classList.contains('splash')) {
      var hide = function () {
        root.classList.add('splash-out');
        setTimeout(function () { root.classList.remove('splash', 'splash-out', 'arriving'); }, 420);
      };
      if (document.readyState === 'complete') setTimeout(hide, 250);
      else window.addEventListener('load', function () { setTimeout(hide, 250); });
    }

    /* night-mode button: #theme-toggle, else the moon/sun button, else the last button in the header */
    var btn = document.getElementById('theme-toggle') ||
      document.querySelector('.nav-actions .icon-button') ||
      Array.prototype.find.call(document.querySelectorAll('header button, header a, nav button'),
        function (b) { return /[☾🌙☀🌞]/.test(b.textContent); });
    if (!btn) {
      btn = document.createElement('button'); btn.className = 'floating'; btn.textContent = '☾';
      document.body.appendChild(btn);
    }
    if (btn) {
      var setIcon = function () {
        var dark = root.getAttribute('data-night') === 'on';
        btn.textContent = dark ? '☀' : '☾';
        btn.setAttribute('aria-pressed', dark);
        btn.setAttribute('aria-label', dark ? 'Switch to day mode' : 'Switch to night mode');
      };
      var fresh = btn.cloneNode(true);            // removes any old click handlers
      btn.parentNode.replaceChild(fresh, btn); btn = fresh; btn.id = 'theme-toggle';
      if (btn.tagName === 'A') {                       // your icon is an <a> without a link: make it behave like a button
        btn.setAttribute('role', 'button'); btn.tabIndex = 0; btn.style.cursor = 'pointer';
        btn.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); btn.click(); } });
      } else btn.type = 'button';
      btn.addEventListener('click', function () {
        var dark = root.getAttribute('data-night') === 'on';
        if (dark) root.removeAttribute('data-night'); else root.setAttribute('data-night', 'on');
        try { localStorage.setItem(KEY, dark ? 'light' : 'dark'); } catch (e) {}
        setIcon();
      });
      setIcon();
    }

    /* menu text turns black while the menu is over a light background */
    var navEl = document.querySelector('nav'), hdrEl = document.querySelector('header') || navEl, ticking = false;
    function isLight(el) {
      for (; el && el !== root; el = el.parentElement) {
        var cs = getComputedStyle(el);
        if (cs.backgroundImage !== 'none') return false;              // photo / gradient (hero) = dark
        var m = cs.backgroundColor.match(/[\d.]+/g);
        if (m && (m.length < 4 || +m[3] > 0.5))
          return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255 > 0.6;
      }
      return false;
    }
    function updateNav() {
      ticking = false;
      if (!navEl) return;
      var light = false;
      if (root.getAttribute('data-night') !== 'on') {
        var r = hdrEl.getBoundingClientRect(), y = Math.max(1, Math.min(r.bottom - 8, innerHeight - 1)), votes = 0;
        hdrEl.style.pointerEvents = 'none';
        [0.25, 0.5, 0.75].forEach(function (f) { if (isLight(document.elementFromPoint(innerWidth * f, y))) votes++; });
        hdrEl.style.pointerEvents = '';
        light = votes >= 2;
      }
      navEl.classList.toggle('on-light', light);
    }
    function queue() { if (!ticking) { ticking = true; requestAnimationFrame(updateNav); } }
    addEventListener('scroll', queue, {passive: true}); addEventListener('resize', queue);
    document.addEventListener('click', function () { setTimeout(updateNav, 0); });   // after night-mode toggle
    updateNav();

    /* splash when moving between pages (including clicking Home while on Home) */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      var u = new URL(a.href, location.href);
      if (u.origin !== location.origin || !/^https?:$/.test(u.protocol)) return;
      if (u.pathname === location.pathname && u.hash) return;      // same-page anchor: normal scroll
      if (reduce) return;
      e.preventDefault();
      root.classList.remove('arriving', 'splash-out'); root.classList.add('splash');
      try { sessionStorage.setItem('splash', '1'); } catch (err) {}
      setTimeout(function () { location.href = u.href; }, 280);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();

  /* back/forward button: never leave the splash stuck */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) root.classList.remove('splash', 'splash-out', 'arriving');
  });
})();
