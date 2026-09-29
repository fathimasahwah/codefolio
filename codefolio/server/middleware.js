import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from './models/User.js';

// Express 4 does not catch rejected promises, so every async handler is wrapped.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const signToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    req.uid = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ error: 'Please log in again.' });
  }
}

export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, message: { error: 'Too many attempts. Try again in a few minutes.' } });
export const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, message: { error: 'Too many messages. Try again later.' } });

// Pro custom domains: if the Host header is not the main app host, look for a Pro user who owns it.
export const hostRouter = wrap(async (req, _res, next) => {
  const host = (req.headers.host || '').split(':')[0].toLowerCase();
  const appHost = (process.env.APP_HOST || 'localhost').toLowerCase();
  if (host && host !== appHost && host !== 'localhost' && !req.path.startsWith('/api')) {
    const user = await User.findOne({ customDomain: host, pro: true }).select('username');
    if (user) req.customUsername = user.username;
  }
  next();
});
