import express from 'express';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';
import multer from 'multer';
import fs from 'fs';
import Database from 'better-sqlite3';
import sharp from 'sharp';

const __dirname = path.resolve();
const app = express();
const port = process.env.PORT || 4000;

const InstaStore = SQLiteStoreFactory(session);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'insta', 'views'));
app.use('/static', express.static(path.join(__dirname, 'insta', 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'insta', 'uploads')));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new InstaStore({ db: 'sessions.sqlite' }),
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
}));

// DB
const dbPath = path.join(__dirname, 'insta', 'data.sqlite');
const db = new Database(dbPath);

// Ensure tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  bio TEXT,
  avatar TEXT
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  image TEXT,
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  post_id INTEGER
);
`);

const uploadDir = path.join(__dirname, 'insta', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Helpers
function currentUser(req){
  return req.session.userId ? db.prepare('SELECT id, username, bio, avatar FROM users WHERE id = ?').get(req.session.userId) : null;
}

app.get('/', (req, res) => {
  const posts = db.prepare('SELECT posts.*, users.username FROM posts JOIN users ON users.id = posts.user_id ORDER BY created_at DESC').all();
  res.render('index', { user: currentUser(req), posts });
});

app.get('/signup', (req, res) => res.render('signup'));
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const info = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);
    req.session.userId = info.lastInsertRowid;
    res.redirect('/');
  } catch (e) {
    res.send('Error creating account: ' + e.message);
  }
});

app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.send('No such user');
  bcrypt.compare(password, user.password).then(match => {
    if (!match) return res.send('Invalid password');
    req.session.userId = user.id;
    res.redirect('/');
  });
});

app.get('/logout', (req, res) => { req.session.destroy(()=>res.redirect('/')); });

app.get('/upload', (req, res) => { if (!currentUser(req)) return res.redirect('/login'); res.render('upload', { user: currentUser(req) }); });
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!currentUser(req)) return res.redirect('/login');
  const file = req.file;
  if (!file) return res.send('No file');
  // create thumbnail
  const thumbPath = path.join(uploadDir, 'thumb-' + file.filename);
  await sharp(file.path).resize(600).toFile(thumbPath);
  db.prepare('INSERT INTO posts (user_id, image, caption) VALUES (?, ?, ?)').run(req.session.userId, file.filename, req.body.caption || '');
  res.redirect('/');
});

app.post('/like/:postId', (req, res) => {
  if (!currentUser(req)) return res.status(401).json({ error: 'login' });
  const postId = Number(req.params.postId);
  const existing = db.prepare('SELECT * FROM likes WHERE user_id = ? AND post_id = ?').get(req.session.userId, postId);
  if (existing) {
    db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
    return res.json({ liked: false });
  }
  db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(req.session.userId, postId);
  res.json({ liked: true });
});

app.get('/profile/:username', (req, res) => {
  const user = db.prepare('SELECT id, username, bio, avatar FROM users WHERE username = ?').get(req.params.username);
  if (!user) return res.send('No such user');
  const posts = db.prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  res.render('profile', { user: currentUser(req), profile: user, posts });
});

app.listen(port, ()=>console.log(`Insta prototype running on ${port}`));
