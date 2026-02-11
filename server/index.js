import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'surchef-dev-secret';
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    const seed = { users: [], mealPlans: [], pantryItems: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }

  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  const db = readDb();
  const existing = db.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'Email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  writeDb(db);

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const db = readDb();
  const user = db.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/me', auth, (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.json({ id: user.id, name: user.name, email: user.email });
});

app.get('/api/meal-plans', auth, (req, res) => {
  const db = readDb();
  const plans = db.mealPlans.filter((item) => item.userId === req.user.id);
  res.json(plans);
});

app.post('/api/meal-plans', auth, (req, res) => {
  const { day, mealType, title, calories = 500 } = req.body;
  if (!day || !mealType || !title) {
    return res.status(400).json({ message: 'day, mealType and title are required.' });
  }

  const db = readDb();
  const plan = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    day,
    mealType,
    title,
    calories: Number(calories) || 0,
    createdAt: new Date().toISOString()
  };

  db.mealPlans.push(plan);
  writeDb(db);
  res.status(201).json(plan);
});

app.delete('/api/meal-plans/:id', auth, (req, res) => {
  const db = readDb();
  const idx = db.mealPlans.findIndex((item) => item.id === req.params.id && item.userId === req.user.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Meal plan not found.' });
  }

  db.mealPlans.splice(idx, 1);
  writeDb(db);
  res.status(204).send();
});

app.get('/api/pantry-items', auth, (req, res) => {
  const db = readDb();
  const items = db.pantryItems.filter((item) => item.userId === req.user.id);
  res.json(items);
});

app.post('/api/pantry-items', auth, (req, res) => {
  const { name, quantity = '1' } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'name is required.' });
  }

  const db = readDb();
  const item = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    name,
    quantity,
    createdAt: new Date().toISOString()
  };

  db.pantryItems.push(item);
  writeDb(db);
  res.status(201).json(item);
});

app.delete('/api/pantry-items/:id', auth, (req, res) => {
  const db = readDb();
  const idx = db.pantryItems.findIndex((item) => item.id === req.params.id && item.userId === req.user.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Pantry item not found.' });
  }

  db.pantryItems.splice(idx, 1);
  writeDb(db);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`SurChef API running at http://localhost:${PORT}`);
});
