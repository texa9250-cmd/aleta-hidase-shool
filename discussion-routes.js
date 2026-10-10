/* Discussion board API for the school server.
   Uses the same school.db file. Needs: npm install better-sqlite3 express  (skip what you already have)
   In server.js add:   app.use('/api/discuss', require('./discussion-routes'));
   In .env add:        TEACHER_CODE=choose-a-long-secret-code            */
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","English","Aptitude","Geography","History","Economics","Civics"];
const LEVELS = ["foundation","growth","excellence"];

const db = new Database(path.join(__dirname, 'school.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS discuss_questions(
  id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, body TEXT NOT NULL, subject TEXT NOT NULL, level TEXT NOT NULL,
  name TEXT, anon INTEGER DEFAULT 0, reports INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS discuss_answers(
  id INTEGER PRIMARY KEY AUTOINCREMENT, question_id INTEGER NOT NULL REFERENCES discuss_questions(id) ON DELETE CASCADE,
  body TEXT NOT NULL, name TEXT, is_teacher INTEGER DEFAULT 0, verified INTEGER DEFAULT 0, votes INTEGER DEFAULT 0,
  reports INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);

const router = express.Router();
router.use(express.json({limit: '20kb'}));

/* ---- helpers ---- */
const sha = s => crypto.createHash('sha256').update(String(s)).digest();
function isTeacher(req) {
  const code = process.env.TEACHER_CODE;
  if (!code) return false;
  return crypto.timingSafeEqual(sha(req.get('x-teacher-code') || ''), sha(code));
}
const hits = new Map();                                   // very small rate limit: 12 posts per minute per address
function tooMany(req) {
  const now = Date.now(), list = (hits.get(req.ip) || []).filter(t => now - t < 60000);
  list.push(now); hits.set(req.ip, list); return list.length > 12;
}
const clean = (v, max) => String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max);
const needTeacher = (req, res, next) => isTeacher(req) ? next() : res.status(401).json({error: 'Teacher code is not correct.'});
const bad = (res, msg) => res.status(400).json({error: msg});

/* ---- teacher check ---- */
router.get('/teacher/check', needTeacher, (req, res) => res.json({ok: true}));

/* ---- questions ---- */
router.get('/questions', (req, res) => {
  const subject = SUBJECTS.includes(req.query.subject) ? req.query.subject : '';
  const level = LEVELS.includes(req.query.level) ? req.query.level : '';
  const T = isTeacher(req);
  const rows = db.prepare(`
    SELECT q.*, (SELECT COUNT(*) FROM discuss_answers a WHERE a.question_id = q.id) AS answers,
           (SELECT COUNT(*) FROM discuss_answers a WHERE a.question_id = q.id AND a.verified = 1) AS solved
    FROM discuss_questions q WHERE (? = '' OR q.subject = ?) AND (? = '' OR q.level = ?) ORDER BY q.id DESC LIMIT 100`)
    .all(subject, subject, level, level);
  res.json(rows.map(q => ({id: q.id, title: q.title, body: q.body, subject: q.subject, level: q.level,
    author: q.anon ? 'Anonymous' : (q.name || 'Student'), createdAt: q.created_at, answers: q.answers, solved: q.solved > 0,
    ...(T ? {reports: q.reports} : {})})));
});

router.post('/questions', (req, res) => {
  if (tooMany(req)) return res.status(429).json({error: 'Please wait a minute before posting again.'});
  const title = clean(req.body.title, 120), body = clean(req.body.body, 2000), name = clean(req.body.name, 40);
  if (title.length < 5 || body.length < 10) return bad(res, 'Please write a clear title and some detail.');
  if (!SUBJECTS.includes(req.body.subject) || !LEVELS.includes(req.body.level)) return bad(res, 'Choose a subject and a path.');
  const info = db.prepare('INSERT INTO discuss_questions(title, body, subject, level, name, anon) VALUES (?,?,?,?,?,?)')
    .run(title, body, req.body.subject, req.body.level, name, req.body.anon ? 1 : 0);
  res.status(201).json({id: info.lastInsertRowid});
});

router.get('/questions/:id', (req, res) => {
  const q = db.prepare('SELECT * FROM discuss_questions WHERE id = ?').get(req.params.id);
  if (!q) return res.status(404).json({error: 'Question not found.'});
  const T = isTeacher(req);
  const answers = db.prepare('SELECT * FROM discuss_answers WHERE question_id = ? ORDER BY verified DESC, is_teacher DESC, votes DESC, id').all(q.id);
  res.json({id: q.id, title: q.title, body: q.body, subject: q.subject, level: q.level, author: q.anon ? 'Anonymous' : (q.name || 'Student'),
    createdAt: q.created_at, ...(T && q.anon ? {realName: q.name || '(no name given)'} : {}),
    answerList: answers.map(a => ({id: a.id, body: a.body, author: a.is_teacher ? (a.name || 'Teacher') : (a.name || 'Student'),
      isTeacher: !!a.is_teacher, verified: !!a.verified, votes: a.votes, createdAt: a.created_at}))});
});

router.post('/questions/:id/answers', (req, res) => {
  if (tooMany(req)) return res.status(429).json({error: 'Please wait a minute before posting again.'});
  const body = clean(req.body.body, 2000), name = clean(req.body.name, 40);
  if (body.length < 2) return bad(res, 'Please write your answer.');
  if (!db.prepare('SELECT 1 FROM discuss_questions WHERE id = ?').get(req.params.id)) return res.status(404).json({error: 'Question not found.'});
  db.prepare('INSERT INTO discuss_answers(question_id, body, name, is_teacher) VALUES (?,?,?,?)').run(req.params.id, body, name, isTeacher(req) ? 1 : 0);
  res.status(201).json({ok: true});
});

/* ---- votes and reports (anyone) ---- */
router.post('/answers/:id/vote', (req, res) => { db.prepare('UPDATE discuss_answers SET votes = votes + 1 WHERE id = ?').run(req.params.id); res.json({ok: true}); });
router.post('/questions/:id/report', (req, res) => { db.prepare('UPDATE discuss_questions SET reports = reports + 1 WHERE id = ?').run(req.params.id); res.json({ok: true}); });
router.post('/answers/:id/report', (req, res) => { db.prepare('UPDATE discuss_answers SET reports = reports + 1 WHERE id = ?').run(req.params.id); res.json({ok: true}); });

/* ---- teacher only ---- */
router.post('/answers/:id/verify', needTeacher, (req, res) => {
  db.prepare('UPDATE discuss_answers SET verified = 1 - verified WHERE id = ?').run(req.params.id); res.json({ok: true});
});
router.delete('/answers/:id', needTeacher, (req, res) => { db.prepare('DELETE FROM discuss_answers WHERE id = ?').run(req.params.id); res.json({ok: true}); });
router.delete('/questions/:id', needTeacher, (req, res) => { db.prepare('DELETE FROM discuss_questions WHERE id = ?').run(req.params.id); res.json({ok: true}); });

router.use((err, req, res, next) => { console.error(err); res.status(500).json({error: 'Server error. Please try again.'}); });
module.exports = router;
