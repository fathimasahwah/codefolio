import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { wrap, signToken, authLimiter } from '../middleware.js';

export const RESERVED = ['api', 'login', 'register', 'dashboard', 'assets', 'user', 'admin', 'static', 'favicon.ico'];
const router = Router();

router.post('/register', authLimiter, wrap(async (req, res) => {
  const username = String(req.body.username || '').trim().toLowerCase();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!/^[a-z0-9_-]{3,30}$/.test(username)) return res.status(400).json({ error: 'Username must be 3-30 characters: letters, numbers, - or _.' });
  if (RESERVED.includes(username)) return res.status(400).json({ error: 'That username is reserved.' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  try {
    const user = await User.create({ username, email, passwordHash: await bcrypt.hash(password, 10), profile: { name: username, bio: '' } });
    res.status(201).json({ token: signToken(user) });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'That username or email is already taken.' });
    throw e;
  }
}));

router.post('/login', authLimiter, wrap(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').trim().toLowerCase() });
  const ok = user && (await bcrypt.compare(String(req.body.password || ''), user.passwordHash));
  if (!ok) return res.status(401).json({ error: 'Email or password is incorrect.' });
  res.json({ token: signToken(user) });
}));

export default router;
