const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = v => { const d = new Date(v); return isNaN(d) ? '' : d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}); };
const byDate = (a, b) => new Date(b.date) - new Date(a.date);

const NAV = [
  ['students.html','Home','home'],
  ['resources.html','Question sources','resources'],
  ['news.html','Exam news','news'],
  ['topics.html','Topics to pages','topics'],
  ['notes.html','Short notes','notes'],
  ['stories.html','Student stories','stories']
];

function layout() {
  const page = document.body.dataset.page;
  $('#site-header').innerHTML = `
    <header class="top"><div class="wrap bar">
      <a class="brand" href="students.html">አለታ ህዳሴ <span>Grade 12 Prep</span></a>
      <button class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button>
      <nav id="nav" aria-label="Main">
        ${NAV.map(n => `<a href="${n[0]}" ${n[2]===page?'aria-current="page"':''}>${n[1]}</a>`).join('')}
        <a class="back" href="/home.html">School site</a>
      </nav></div></header>`;
  $('#site-footer').innerHTML = `<footer><div class="wrap">አለታ ህዳሴ Grade 12 Preparatory Portal. Study materials are linked from their original sources. <a href="/home.html">Back to the school website</a></div></footer>`;
  const btn = $('.menu-btn'), nav = $('#nav');
  btn.addEventListener('click', () => btn.setAttribute('aria-expanded', nav.classList.toggle('open')));
}

/* shared search + subject filter for list pages */
function listPage({data, card, fields}) {
  const params = new URLSearchParams(location.search);
  let subject = params.get('subject') || 'All', term = '';
  const chips = $('#chips'), list = $('#list'), empty = $('#empty'), q = $('#q');
  const subjects = ['All', ...SUBJECTS];
  chips.innerHTML = subjects.map(s => `<button class="chip" data-s="${esc(s)}">${esc(s)}</button>`).join('');
  function draw() {
    chips.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.s === subject));
    const t = term.trim().toLowerCase();
    const rows = data.filter(d => (subject === 'All' || d.subject === subject) &&
      (!t || fields.some(f => [].concat(d[f] || '').join(' ').toLowerCase().includes(t))));
    list.innerHTML = rows.map(card).join('');
    empty.hidden = rows.length > 0;
    $('#count').textContent = rows.length + (rows.length === 1 ? ' result' : ' results');
  }
  chips.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) { subject = b.dataset.s; draw(); } });
  q.addEventListener('input', () => { term = q.value; draw(); });
  draw();
}

const newsCard = n => `
  <article class="news-row">
    <div class="meta">${n.tag ? `<span class="tag hot">${esc(n.tag)}</span>` : ''}<span class="tag date">${esc(fmtDate(n.date))}</span></div>
    <h3>${esc(n.title)}</h3><p>${esc(n.body)}</p>
  </article>`;

const PAGES = {
  home() {
    $('#latest-news').innerHTML = [...NEWS].sort(byDate).slice(0, 3).map(newsCard).join('');
    const box = $('#countdown');
    if (EXAM_DATE) {
      const days = Math.ceil((new Date(EXAM_DATE) - new Date()) / 86400000);
      box.innerHTML = days > 0 ? `<b>${days}</b><small>days until the exam</small>` : `<b>Good luck!</b><small>The exam has started</small>`;
    } else box.remove();
  },
  resources() {
    listPage({data: RESOURCES, fields: ['title','desc','type','subject'], card: r => `
      <article class="card">
        <div class="meta"><span class="tag">${esc(r.subject)}</span><span class="tag hot">${esc(r.type)}</span></div>
        <h3>${esc(r.title)}</h3><p>${esc(r.desc)}</p>
        ${r.url ? `<a class="btn" href="${esc(r.url)}" target="_blank" rel="noopener">Open source</a>` : `<span class="pending">Link not added yet</span>`}
      </article>`});
  },
  news() {
    const list = $('#list');
    list.innerHTML = [...NEWS].sort(byDate).map(newsCard).join('');
    $('#empty').hidden = NEWS.length > 0;
  },
  topics() {
    listPage({data: TOPICS, fields: ['topic','tip','subject','unit'], card: t => {
      const where = (t.unit || t.page) ? `<div class="where">Textbook: ${esc([t.unit, t.page].filter(Boolean).join(', '))}</div>`
                                       : `<div class="where todo">Unit and page not added yet</div>`;
      return `<article class="card"><div class="meta"><span class="tag">${esc(t.subject)}</span></div>
        <h3>${esc(t.topic)}</h3>${where}<p>${esc(t.tip)}</p></article>`;
    }});
  },
  notes() {
    listPage({data: NOTES, fields: ['title','points','subject'], card: n => `
      <article class="card"><div class="meta"><span class="tag">${esc(n.subject)}</span></div>
        <h3>${esc(n.title)}</h3><ul>${n.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul></article>`});
  },
  stories() {
    const KEY = 'portal_stories';
    const saved = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
    const subjSel = $('#f-subject');
    subjSel.innerHTML = ['General', ...SUBJECTS].map(s => `<option>${esc(s)}</option>`).join('');
    function show() {
      const all = [...saved(), ...STORIES].sort(byDate);
      $('#list').innerHTML = all.map(s => `
        <article class="card"><div class="meta"><span class="tag">${esc(s.subject)}</span><span class="tag date">${esc(fmtDate(s.date))}</span></div>
          <h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><p class="note">Shared by ${esc(s.name || 'a student')}</p></article>`).join('');
    }
    $('#story-form').addEventListener('submit', e => {
      e.preventDefault();
      const entry = {name: $('#f-name').value.trim(), subject: subjSel.value, title: $('#f-title').value.trim(),
                     text: $('#f-text').value.trim(), date: new Date().toISOString().slice(0, 10)};
      if (!entry.title || !entry.text) return;
      try { localStorage.setItem(KEY, JSON.stringify([entry, ...saved()])); } catch (err) {}
      e.target.reset(); show();
      const m = $('#story-msg'); m.textContent = 'Story saved. Thank you for sharing.';
    });
    show();
  }
};

layout();
const run = PAGES[document.body.dataset.page];
if (run) run();
