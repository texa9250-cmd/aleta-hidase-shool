const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || (
  console.warn('WARNING: JWT_SECRET is not set. Using a temporary one; everyone is logged out on restart.'),
  crypto.randomBytes(32).toString('hex')
);
const CATEGORIES = ['Academic', 'Events', 'Sports', 'General'];
const ROLES = ['admin', 'publisher'];

/* ---------- Database ---------- */
const db = new DatabaseSync(process.env.DB_FILE || path.join(__dirname, 'school.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Run several statements as one all-or-nothing step.
function tx(fn) {
  db.exec('BEGIN');
  try { const r = fn(); db.exec('COMMIT'); return r; }
  catch (e) { db.exec('ROLLBACK'); throw e; }
}
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','publisher')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  pinned INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);`);

// Create the first admin on first run.
if (!db.prepare('SELECT 1 FROM users LIMIT 1').get()) {
  const u = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
  const p = process.env.ADMIN_PASSWORD || '';
  if (!u || p.length < 10) {
    console.error('First run: set ADMIN_USERNAME and ADMIN_PASSWORD (at least 10 characters) in .env');
    process.exit(1);
  }
  db.prepare('INSERT INTO users (username, password_hash, full_name, role) VALUES (?,?,?,?)')
    .run(u, bcrypt.hashSync(p, 12), 'Administrator', 'admin');
  console.log(`Created first admin account "${u}". You can remove ADMIN_PASSWORD from .env now.`);
}

/* ---------- App setup ---------- */
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src https://fonts.gstatic.com; img-src 'self' data:; frame-ancestors 'none'"
  });
  next();
});
app.use(express.json({ limit: '50kb' }));
 app.use('/api/discuss', require('./discussion-routes'));

/* ---------- Helpers ---------- */
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);
const attempts = new Map(); // ip -> { count, resetAt }

function loginLimited(ip) {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || a.resetAt < now) { attempts.set(ip, { count: 0, resetAt: now + 15 * 60 * 1000 }); return false; }
  return a.count >= 10;
}

function auth(req, res, next) {
  const m = /^Bearer (.+)$/.exec(req.get('Authorization') || '');
  if (!m) return res.status(401).json({ error: 'Please log in.' });
  try {
    const { id } = jwt.verify(m[1], SECRET);
    // Look the user up every time, so a deleted account loses access at once.
    const user = db.prepare('SELECT id, username, full_name, role FROM users WHERE id = ?').get(id);
    if (!user) return res.status(401).json({ error: 'Account no longer exists.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

const adminOnly = (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admins only.' });

function cleanAnnouncement(b) {
  const title = String(b.title ?? '').trim();
  const body = String(b.body ?? '').trim();
  const category = String(b.category ?? '');
  const date = String(b.date ?? '');
  if (!title || title.length > 120) return { error: 'Title is required (max 120 characters).' };
  if (!body || body.length > 5000) return { error: 'Message is required (max 5000 characters).' };
  if (!CATEGORIES.includes(category)) return { error: 'Choose a valid category.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return { error: 'Choose a valid date.' };
  return { value: { title, body, category, date, pinned: b.pinned ? 1 : 0, published: b.published === false ? 0 : 1 } };
}

const canEdit = (user, row) => user.role === 'admin' || row.author_id === user.id;
const validPassword = p => typeof p === 'string' && p.length >= 10 && p.length <= 200;

/* ---------- Public API (what the website reads) ---------- */
app.get('/api/announcements', (req, res) => {
  const rows = db.prepare(
    'SELECT id, title, body, category, date, pinned FROM announcements WHERE published = 1 ORDER BY date DESC, id DESC'
  ).all();
  res.json(rows.map(r => ({ ...r, pinned: !!r.pinned })));
});

/* ---------- Login ---------- */
app.post('/api/login', (req, res) => {
  const ip = req.ip;
  if (loginLimited(ip)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  const username = String(req.body.username ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '');
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  const ok = bcrypt.compareSync(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) {
    attempts.get(ip).count++;
    return res.status(401).json({ error: 'Wrong username or password.' });
  }
  attempts.delete(ip);
  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } });
});

app.get('/api/me', auth, (req, res) => res.json(req.user));

app.patch('/api/me/password', auth, (req, res) => {
  const { current, next } = req.body;
  if (!validPassword(next)) return res.status(400).json({ error: 'New password must be at least 10 characters.' });
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(String(current ?? ''), row.password_hash))
    return res.status(400).json({ error: 'Current password is wrong.' });
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(next, 12), req.user.id);
  res.json({ ok: true });
});

/* ---------- Staff: manage announcements ---------- */
// Admins see everything. Publishers see only their own.
app.get('/api/admin/announcements', auth, (req, res) => {
  const base = `SELECT a.*, u.full_name AS author FROM announcements a LEFT JOIN users u ON u.id = a.author_id`;
  const rows = req.user.role === 'admin'
    ? db.prepare(base + ' ORDER BY a.date DESC, a.id DESC').all()
    : db.prepare(base + ' WHERE a.author_id = ? ORDER BY a.date DESC, a.id DESC').all(req.user.id);
  res.json(rows.map(r => ({ ...r, pinned: !!r.pinned, published: !!r.published })));
});

app.post('/api/admin/announcements', auth, (req, res) => {
  const { value, error } = cleanAnnouncement(req.body);
  if (error) return res.status(400).json({ error });
  const result = tx(() => {
    if (value.pinned) db.prepare('UPDATE announcements SET pinned = 0').run(); // only one pinned notice
    return db.prepare(
      'INSERT INTO announcements (title, body, category, date, pinned, published, author_id) VALUES (?,?,?,?,?,?,?)'
    ).run(value.title, value.body, value.category, value.date, value.pinned, value.published, req.user.id);
  });
  res.status(201).json({ id: Number(result.lastInsertRowid) });
});

app.put('/api/admin/announcements/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Announcement not found.' });
  if (!canEdit(req.user, row)) return res.status(403).json({ error: 'You can only edit your own announcements.' });
  const { value, error } = cleanAnnouncement(req.body);
  if (error) return res.status(400).json({ error });
  tx(() => {
    if (value.pinned) db.prepare('UPDATE announcements SET pinned = 0').run();
    db.prepare(
      `UPDATE announcements SET title=?, body=?, category=?, date=?, pinned=?, published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).run(value.title, value.body, value.category, value.date, value.pinned, value.published, row.id);
  });
  res.json({ ok: true });
});

app.delete('/api/admin/announcements/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Announcement not found.' });
  if (!canEdit(req.user, row)) return res.status(403).json({ error: 'You can only delete your own announcements.' });
  db.prepare('DELETE FROM announcements WHERE id = ?').run(row.id);
  res.json({ ok: true });
});

/* ---------- Admin: manage staff accounts ---------- */
app.get('/api/admin/users', auth, adminOnly, (req, res) => {
  res.json(db.prepare('SELECT id, username, full_name, role FROM users ORDER BY full_name').all());
});

app.post('/api/admin/users', auth, adminOnly, (req, res) => {
  const username = String(req.body.username ?? '').trim().toLowerCase();
  const full_name = String(req.body.full_name ?? '').trim();
  const { password, role } = req.body;
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) return res.status(400).json({ error: 'Username: 3-30 letters, numbers, . _ -' });
  if (!full_name || full_name.length > 80) return res.status(400).json({ error: 'Full name is required.' });
  if (!validPassword(password)) return res.status(400).json({ error: 'Password must be at least 10 characters.' });
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Choose a valid role.' });
  if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username))
    return res.status(409).json({ error: 'That username is taken.' });
  const r = db.prepare('INSERT INTO users (username, password_hash, full_name, role) VALUES (?,?,?,?)')
    .run(username, bcrypt.hashSync(password, 12), full_name, role);
  res.status(201).json({ id: Number(r.lastInsertRowid) });
});

app.put('/api/admin/users/:id/password', auth, adminOnly, (req, res) => {
  if (!validPassword(req.body.password)) return res.status(400).json({ error: 'Password must be at least 10 characters.' });
  const r = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(req.body.password, 12), req.params.id);
  r.changes ? res.json({ ok: true }) : res.status(404).json({ error: 'User not found.' });
});

app.delete('/api/admin/users/:id', auth, adminOnly, (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: "You can't delete your own account." });
  const r = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  r.changes ? res.json({ ok: true }) : res.status(404).json({ error: 'User not found.' });
});

/* ---------- Pages ---------- */
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'home.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid request.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => console.log(`School site running at http://localhost:${PORT}  (staff login: /admin)`));
