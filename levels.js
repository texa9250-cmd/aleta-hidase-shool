/* Student Levels: hub, level pages and discussion board. */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const params = new URLSearchParams(location.search);
const fmt = v => { const d = new Date(v); return isNaN(d) ? '' : d.toLocaleDateString('en-US', {month:'short', day:'numeric'}); };
const myLevels = () => LS.get('lv_levels', {});
const setLevel = (subject, level) => { const m = myLevels(); m[subject] = level; LS.set('lv_levels', m); };
const levelTag = k => LEVELS[k] ? `<span class="lv-tag" style="background:${LEVELS[k].color}22;color:${LEVELS[k].color}">${LEVELS[k].icon} ${esc(LEVELS[k].name)}</span>` : '';

/* ---------- shared header / footer ---------- */
function layout(active) {
  const nav = [['home.html','Home'],['announcements.html','Announcement'],['achievement.html','Achievements'],
               ['history.html','About'],['contact.html','Contact'],['levels.html','Student levels','levels'],['discuss.html','Discussion','discuss']];
  $('#lv-header').innerHTML = `<div class="lv-wrap lv-bar">
    <a class="lv-logo" href="home.html">አለታ <span>-ህዳሴ</span></a>
    <button class="lv-menu" aria-expanded="false" aria-controls="lv-nav">Menu</button>
    <nav id="lv-nav" aria-label="Main">${nav.map(n => `<a href="${n[0]}" ${n[2] === active ? 'aria-current="page"' : ''}>${n[1]}</a>`).join('')}</nav>
    <button id="theme-toggle" class="lv-icon" type="button">☾</button></div>`;
  $('#lv-footer').innerHTML = `<div class="lv-wrap">አለታ ህዳሴ School. Learn at your own pace; every path leads forward.</div>`;
  const b = $('.lv-menu'), n = $('#lv-nav');
  b.addEventListener('click', () => b.setAttribute('aria-expanded', n.classList.toggle('open')));
}

const subjectChips = (current, hrefFn) => `<div class="lv-chips" role="group" aria-label="Subject">` +
  SUBJECTS.map(s => `<a class="lv-chip" href="${hrefFn(s)}" aria-pressed="${s === current}">${esc(s)}</a>`).join('') + `</div>`;

/* ================= HUB: levels.html ================= */
function hubPage() {
  let subject = SUBJECTS.includes(params.get('subject')) ? params.get('subject') : SUBJECTS[0];
  const box = $('#hub');
  function draw() {
    const mine = myLevels()[subject];
    box.innerHTML = `
      <p class="lv-note">Choose a subject. Each subject has its own path, so you can be on Excellence in one subject and Foundation in another.</p>
      <div class="lv-chips" id="subj">${SUBJECTS.map(s => `<button class="lv-chip" data-s="${esc(s)}" aria-pressed="${s === subject}">${esc(s)}</button>`).join('')}</div>
      ${mine ? `<p class="lv-ok">Your current path in ${esc(subject)}: ${LEVELS[mine].icon} ${LEVELS[mine].name} (${LEVELS[mine].am})</p>` : ''}
      <div class="lv-block"><h2>Not sure where to start? Take the 1-minute self-check</h2>
        <form class="lv-form" id="check">
          ${CHECK.map((c, i) => `<fieldset style="border:0;padding:0;margin:0"><legend><b>${i + 1}. ${esc(c.q)}</b></legend>
            ${c.o.map((o, j) => `<label class="inline"><input type="radio" name="q${i}" value="${j}" required> ${esc(o)}</label>`).join('')}</fieldset>`).join('')}
          <button class="lv-btn" type="submit" style="justify-self:start">Suggest my path</button>
        </form><div id="result"></div></div>
      <div class="lv-block"><h2>Or choose a path yourself</h2><div class="lv-grid">
        ${Object.entries(LEVELS).map(([k, L]) => `<div class="lv-card" style="border-top:6px solid ${L.color}">
          <h3>${L.icon} ${L.name} <span class="lv-note">${L.am}</span></h3><p>${esc(L.tag)}</p>
          <div class="lv-actions"><a class="lv-btn small" href="level.html?level=${k}&subject=${encodeURIComponent(subject)}">Open this path</a></div></div>`).join('')}
      </div></div>
      <p class="lv-note" style="margin-top:24px">You can change your path at any time. Moving up is something to celebrate, and your choices are private to this device.</p>`;
    $('#subj').addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) { subject = b.dataset.s; draw(); } });
    $('#check').addEventListener('submit', e => {
      e.preventDefault();
      const score = CHECK.reduce((t, _, i) => t + Number(new FormData(e.target).get('q' + i)), 0);
      const k = score <= 3 ? 'foundation' : score <= 6 ? 'growth' : 'excellence', L = LEVELS[k];
      $('#result').innerHTML = `<div class="lv-card" style="margin-top:14px;border-left:6px solid ${L.color}">
        <h3>${L.icon} A good starting point for ${esc(subject)}: ${L.name} (${L.am})</h3>
        <p>This is only a starting point. You know yourself best, and you can switch at any time.</p>
        <div class="lv-actions"><a class="lv-btn small" id="useit" href="level.html?level=${k}&subject=${encodeURIComponent(subject)}">Start this path</a></div></div>`;
      $('#useit').addEventListener('click', () => setLevel(subject, k));
    });
  }
  draw();
}

/* ================= LEVEL PAGE: level.html?level=growth&subject=Physics ================= */
const TXT = {
  am: {who:'ይህ መንገድ ለማን ነው?', plan:'የሳምንቱ እቅድ', tips:'የሚረዱ የጥናት ልምዶች', check:'የእድገት ማረጋገጫ ዝርዝር', help:'ልምምድና እገዛ', change:'መንገድዎን ይቀይሩ',
       notes:'አጫጭር ማስታወሻዎች', topics:'ርዕሶችና የመጽሐፍ ገጾች', sources:'የጥያቄ ምንጮች', ask:'በመድረኩ ይጠይቁ ወይም ይመልሱ', day:'ቀን',
       prog:(n, t) => `${n} ከ ${t} እርምጃዎች ተጠናቀዋል። ትንንሽ እርምጃዎችም ይቆጠራሉ።`, ready:'በጣም ጥሩ! ለመሸጋገር ዝግጁ ነዎት፦'},
  en: {who:'Who this path is for', plan:'Your week at a glance', tips:'Study habits that help', check:'Your progress checklist', help:'Practice and get help', change:'Change your path',
       notes:'Short notes', topics:'Topics and textbook pages', sources:'Question sources', ask:'Ask or answer on the board', day:'Day',
       prog:(n, t) => `${n} of ${t} steps done. Small steps count.`, ready:'Well done! You are ready to try'}
};
function levelPage() {
  const key = LEVELS[params.get('level')] ? params.get('level') : 'foundation', L = LEVELS[key];
  const subject = SUBJECTS.includes(params.get('subject')) ? params.get('subject') : SUBJECTS[0];
  document.documentElement.style.setProperty('--c', L.color);
  setLevel(subject, key);
  const ckKey = `lv_check_${key}_${subject}`, q = encodeURIComponent(subject), enc = x => encodeURIComponent(x);
  let lang = LS.get('lv_lang', 'am');

  function render() {
    const X = TXT[lang], am = lang === 'am', done = LS.get(ckKey, []);
    document.title = `${L.name} | ${subject} | አለታ ህዳሴ`;
    document.documentElement.lang = am ? 'am' : 'en';
    const plan = L.plan.map((p, i) => [am ? `${X.day} ${i + 1}` : p[0], am ? L.planAm[i] : p[1]]);
    const tips = am ? L.tipsAm : L.tips, list = am ? L.checklistAm : L.checklist;
    $('#level').innerHTML = `
      <div class="lv-hero"><div class="lv-wrap"><p class="lv-note" style="color:#aab6e8">${esc(subject)}</p>
        <h1>${L.icon} ${L.name} <span style="font-weight:400">· ${L.am}</span></h1><p>${esc(am ? L.tagAm : L.tag)}</p></div></div>
      <div class="lv-wrap">
        <div class="lv-chips" role="group" aria-label="Language" style="justify-content:flex-end;margin-bottom:0">
          <button class="lv-chip" data-lang="am" aria-pressed="${am}">አማርኛ</button><button class="lv-chip" data-lang="en" aria-pressed="${!am}">English</button></div>
        ${subjectChips(subject, s => `level.html?level=${key}&subject=${enc(s)}`)}
        <div class="lv-block"><div class="lv-card"><h3>${X.who}</h3><p>${esc(am ? L.forWhoAm : L.forWho)}</p></div></div>
        <div class="lv-block"><h2>${X.plan}</h2><ul class="lv-plan">${plan.map(p => `<li><b>${esc(p[0])}</b><span>${esc(p[1])}</span></li>`).join('')}</ul></div>
        <div class="lv-block"><h2>${X.tips}</h2><div class="lv-grid">${tips.map(t => `<div class="lv-card"><p>${esc(t)}</p></div>`).join('')}</div></div>
        <div class="lv-block"><h2>${X.check}</h2><ul class="lv-check" id="ck">
          ${list.map((c, i) => `<li><label><input type="checkbox" data-i="${i}" ${done.includes(i) ? 'checked' : ''}> <span>${esc(c)}</span></label></li>`).join('')}</ul>
          <div class="lv-bar-track"><div class="lv-bar-fill" id="fill"></div></div><p id="msg" class="lv-note"></p></div>
        <div class="lv-block"><h2>${X.help}</h2><div class="lv-actions">
          <a class="lv-btn" href="/portal/notes.html?subject=${q}">${X.notes}: ${esc(subject)}</a>
          <a class="lv-btn" href="/portal/topics.html?subject=${q}">${X.topics}</a>
          <a class="lv-btn" href="/portal/resources.html?subject=${q}">${X.sources}</a>
          <a class="lv-btn ghost" href="discuss.html?subject=${q}&level=${key}">${X.ask}</a></div></div>
        <div class="lv-block"><h2>${X.change}</h2><div class="lv-actions">
          ${Object.entries(LEVELS).filter(([k]) => k !== key).map(([k, x]) => `<a class="lv-btn ghost small" href="level.html?level=${k}&subject=${q}">${x.icon} ${x.name} · ${x.am}</a>`).join('')}</div></div>
      </div>`;
    document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; LS.set('lv_lang', lang); render(); }));
    $('#ck').addEventListener('change', e => {
      const i = Number(e.target.dataset.i), s = new Set(LS.get(ckKey, []));
      e.target.checked ? s.add(i) : s.delete(i); LS.set(ckKey, [...s]); progress();
    });
    progress();
  }
  function progress() {
    const X = TXT[lang], n = LS.get(ckKey, []).length, total = L.checklist.length;
    $('#fill').style.width = (n / total * 100) + '%';
    if (n < total) { $('#msg').textContent = X.prog(n, total); $('#msg').className = 'lv-note'; return; }
    $('#msg').className = 'lv-ok';
    $('#msg').innerHTML = L.next
      ? `${X.ready} <a href="level.html?level=${L.next}&subject=${q}">${LEVELS[L.next].icon} ${LEVELS[L.next].name}</a>.`
      : esc(lang === 'am' ? L.finishAm : L.finish);
  }
  render();
}

/* ================= DISCUSSION BOARD: discuss.html ================= */
let mode = 'server';                       // switches to 'local' when the server routes are not installed
async function call(method, path, body, teacher) {
  if (mode === 'local') return localApi(method, path, body);
  let r;
  try {
    r = await fetch('/api/discuss' + path, {method, headers: {'Content-Type':'application/json', ...(teacher ? {'x-teacher-code': teacher} : {})},
      body: body ? JSON.stringify(body) : undefined});
  } catch (e) { mode = 'local'; return localApi(method, path, body); }
  const ct = r.headers.get('content-type') || '';
  if (r.status === 404 && !ct.includes('json')) { mode = 'local'; return localApi(method, path, body); }
  const data = ct.includes('json') ? await r.json() : {};
  if (!r.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}
/* browser-only copy of the same routes: works before the server part is installed (posts stay on this device) */
function localApi(method, path, body) {
  const d = LS.get('lv_discuss', {next: 1, q: []}), save = () => LS.set('lv_discuss', d);
  const pub = q => ({id:q.id, title:q.title, body:q.body, subject:q.subject, level:q.level, author:q.anon ? 'Anonymous' : (q.name || 'Student'),
    createdAt:q.createdAt, answers:q.a.length, solved:q.a.some(a => a.verified)});
  let m;
  if (method === 'GET' && (m = path.match(/^\/questions(?:\?(.*))?$/))) {
    const p = new URLSearchParams(m[1] || '');
    return d.q.filter(q => (!p.get('subject') || q.subject === p.get('subject')) && (!p.get('level') || q.level === p.get('level'))).sort((a, b) => b.id - a.id).map(pub);
  }
  if (method === 'POST' && path === '/questions') {
    const q = {id: d.next++, title: body.title, body: body.body, subject: body.subject, level: body.level, name: body.name, anon: !!body.anon, createdAt: new Date().toISOString(), a: []};
    d.q.push(q); save(); return {id: q.id};
  }
  if (method === 'GET' && (m = path.match(/^\/questions\/(\d+)$/))) {
    const q = d.q.find(x => x.id == m[1]); if (!q) throw new Error('Question not found.');
    return {...pub(q), answerList: q.a.map(a => ({id:a.id, body:a.body, author:a.name || 'Student', isTeacher:false, verified:false, votes:a.votes, createdAt:a.createdAt}))};
  }
  if (method === 'POST' && (m = path.match(/^\/questions\/(\d+)\/answers$/))) {
    const q = d.q.find(x => x.id == m[1]); if (!q) throw new Error('Question not found.');
    q.a.push({id: d.next++, body: body.body, name: body.name, votes: 0, createdAt: new Date().toISOString()}); save(); return {ok:true};
  }
  if (method === 'POST' && (m = path.match(/^\/answers\/(\d+)\/vote$/))) {
    d.q.forEach(q => q.a.forEach(a => { if (a.id == m[1]) a.votes++; })); save(); return {ok:true};
  }
  if (/\/report$/.test(path)) return {ok:true};
  throw new Error('This needs the school server. Ask your teacher to enable it.');
}

function discussPage() {
  const S = {subject: SUBJECTS.includes(params.get('subject')) ? params.get('subject') : 'All', level: LEVELS[params.get('level')] ? params.get('level') : 'All',
             term: '', teacher: sessionStorage.getItem('lv_teacher') || '', open: null};
  const list = $('#qlist'), voted = new Set(LS.get('lv_voted', []));
  $('#f-subject').innerHTML = '<option value="All">All subjects</option>' + SUBJECTS.map(s => `<option ${s === S.subject ? 'selected' : ''}>${esc(s)}</option>`).join('');
  $('#f-level').innerHTML = '<option value="All">All paths</option>' + Object.entries(LEVELS).map(([k, L]) => `<option value="${k}" ${k === S.level ? 'selected' : ''}>${L.name}</option>`).join('');
  $('#n-subject').innerHTML = SUBJECTS.map(s => `<option ${s === S.subject ? 'selected' : ''}>${esc(s)}</option>`).join('');
  $('#n-level').innerHTML = Object.entries(LEVELS).map(([k, L]) => `<option value="${k}" ${k === S.level ? 'selected' : ''}>${L.name}</option>`).join('');
  $('#n-name').value = LS.get('lv_name', '');

  const banner = () => { $('#mode').innerHTML = mode === 'local'
    ? `<div class="lv-banner">Practice mode: questions are saved on this device only. Once the school server part is installed, everyone will see the same board.</div>` : ''; 
    $('#teacher-box').style.display = mode === 'local' ? 'none' : ''; };

  async function load() {
    const p = new URLSearchParams(); if (S.subject !== 'All') p.set('subject', S.subject); if (S.level !== 'All') p.set('level', S.level);
    try { const all = await call('GET', '/questions?' + p, null, S.teacher); banner();
      const t = S.term.trim().toLowerCase();
      const rows = all.filter(q => !t || (q.title + ' ' + q.body).toLowerCase().includes(t));
      list.innerHTML = rows.length ? rows.map(q => `<article class="lv-q" data-id="${q.id}">
        <button class="lv-qhead" data-act="toggle" aria-expanded="${S.open == q.id}">
          <div class="lv-meta"><span class="lv-tag">${esc(q.subject)}</span>${levelTag(q.level)}${q.solved ? '<span class="lv-tag s">✔ Verified answer</span>' : ''}<span>${fmt(q.createdAt)}</span></div>
          <h3>${esc(q.title)}</h3><div class="lv-meta"><span>${esc(q.author)}</span><span>${q.answers} ${q.answers === 1 ? 'answer' : 'answers'}</span></div></button>
        <div class="lv-thread" ${S.open == q.id ? '' : 'hidden'}></div></article>`).join('')
        : `<div class="lv-empty">No questions here yet. Be the first to ask.</div>`;
      if (S.open) openThread(S.open);
    } catch (e) { list.innerHTML = `<div class="lv-empty">${esc(e.message)}</div>`; }
  }

  async function openThread(id) {
    const box = list.querySelector(`[data-id="${id}"] .lv-thread`); if (!box) return;
    try {
      const q = await call('GET', '/questions/' + id, null, S.teacher), T = !!S.teacher && mode === 'server';
      box.innerHTML = `<p class="lv-text">${esc(q.body)}</p>
        ${q.realName ? `<p class="lv-note">Teacher view: asked by ${esc(q.realName)}</p>` : ''}
        <div class="lv-actions"><button class="lv-btn ghost small" data-act="reportq" data-id="${q.id}">Report</button>
          ${T ? `<button class="lv-btn danger small" data-act="delq" data-id="${q.id}">Delete question</button>` : ''}</div>
        <h4>${q.answerList.length} ${q.answerList.length === 1 ? 'answer' : 'answers'}</h4>
        ${q.answerList.map(a => `<div class="lv-ans ${a.isTeacher ? 'teacher' : ''} ${a.verified ? 'verified' : ''}">
          <div class="lv-meta">${a.isTeacher ? '<span class="lv-tag t">Teacher</span>' : ''}${a.verified ? '<span class="lv-tag s">✔ Verified</span>' : ''}<span>${esc(a.author)}</span><span>${fmt(a.createdAt)}</span></div>
          <p class="lv-text">${esc(a.body)}</p>
          <div class="lv-actions"><button class="lv-btn ghost small" data-act="vote" data-id="${a.id}" ${voted.has(a.id) ? 'disabled' : ''}>👍 Helpful (${a.votes})</button>
            <button class="lv-btn ghost small" data-act="reporta" data-id="${a.id}">Report</button>
            ${T ? `<button class="lv-btn small" data-act="verify" data-id="${a.id}">${a.verified ? 'Remove verified' : 'Mark verified'}</button><button class="lv-btn danger small" data-act="dela" data-id="${a.id}">Delete</button>` : ''}</div></div>`).join('')}
        <form class="lv-form" data-qid="${q.id}" style="margin-top:14px"><label>Your answer
          <textarea rows="3" maxlength="2000" required placeholder="Explain the steps, not only the result."></textarea></label>
          <div class="lv-row"><label>Your name (optional)<input type="text" maxlength="40" value="${esc(LS.get('lv_name', ''))}"></label>
          <span style="align-self:end"><button class="lv-btn" type="submit">${T ? 'Post as teacher' : 'Post answer'}</button></span></div>
          <p class="lv-err" role="alert"></p></form>`;
    } catch (e) { box.innerHTML = `<p class="lv-err">${esc(e.message)}</p>`; }
  }

  list.addEventListener('click', async e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const id = b.dataset.id || b.closest('.lv-q').dataset.id, act = b.dataset.act;
    try {
      if (act === 'toggle') { const qid = b.closest('.lv-q').dataset.id; S.open = S.open == qid ? null : qid; return load(); }
      if (act === 'vote') { await call('POST', `/answers/${id}/vote`); voted.add(Number(id)); LS.set('lv_voted', [...voted]); }
      if (act === 'reportq') { await call('POST', `/questions/${id}/report`); alert('Thank you. A teacher will review it.'); return; }
      if (act === 'reporta') { await call('POST', `/answers/${id}/report`); alert('Thank you. A teacher will review it.'); return; }
      if (act === 'verify') await call('POST', `/answers/${id}/verify`, null, S.teacher);
      if (act === 'dela' && confirm('Delete this answer?')) await call('DELETE', `/answers/${id}`, null, S.teacher);
      if (act === 'delq' && confirm('Delete this question and its answers?')) { await call('DELETE', `/questions/${id}`, null, S.teacher); S.open = null; }
      load();
    } catch (err) { alert(err.message); }
  });
  list.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, err = $('.lv-err', f), name = $('input', f).value.trim();
    try { await call('POST', `/questions/${f.dataset.qid}/answers`, {body: $('textarea', f).value.trim(), name}, S.teacher); LS.set('lv_name', name); load(); }
    catch (x) { err.textContent = x.message; }
  });

  $('#f-subject').addEventListener('change', e => { S.subject = e.target.value; S.open = null; load(); });
  $('#f-level').addEventListener('change', e => { S.level = e.target.value; S.open = null; load(); });
  $('#f-search').addEventListener('input', e => { S.term = e.target.value; load(); });
  $('#ask').addEventListener('submit', async e => {
    e.preventDefault(); const err = $('#ask-err'); err.textContent = '';
    const body = {title: $('#n-title').value.trim(), body: $('#n-body').value.trim(), subject: $('#n-subject').value, level: $('#n-level').value,
                  name: $('#n-name').value.trim(), anon: $('#n-anon').checked};
    if (body.title.length < 5 || body.body.length < 10) { err.textContent = 'Please write a clear title (5+ letters) and some detail (10+ letters).'; return; }
    try { const r = await call('POST', '/questions', body, S.teacher); LS.set('lv_name', body.name); e.target.reset(); $('#n-name').value = body.name;
      $('#ask-ok').textContent = 'Your question is posted.'; S.open = r.id; S.subject = 'All'; S.level = 'All'; $('#f-subject').value = 'All'; $('#f-level').value = 'All'; load(); }
    catch (x) { err.textContent = x.message; }
  });
  $('#teacher-form').addEventListener('submit', async e => {
    e.preventDefault(); const code = $('#t-code').value.trim(), m = $('#t-msg');
    try { await call('GET', '/teacher/check', null, code); S.teacher = code; sessionStorage.setItem('lv_teacher', code); m.textContent = 'Teacher mode is on.'; m.className = 'lv-ok'; load(); }
    catch (x) { m.textContent = x.message; m.className = 'lv-err'; }
  });
  if (S.teacher) $('#t-msg').textContent = 'Teacher mode is on.';
  load();
}

/* ---------- start ---------- */
const PAGE = document.body.dataset.page;
layout(PAGE === 'hub' || PAGE === 'level' ? 'levels' : 'discuss');
({hub: hubPage, level: levelPage, discuss: discussPage})[PAGE]?.();
