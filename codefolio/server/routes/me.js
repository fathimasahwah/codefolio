import { Router } from 'express';
import User from '../models/User.js';
import { auth, wrap } from '../middleware.js';
import { cleanPortfolio, DOMAIN_RE } from '../utils/sanitize.js';

const router = Router();
router.use(auth);

router.get('/', wrap(async (req, res) => {
  const user = await User.findById(req.uid).select('-passwordHash').lean();
  if (!user) return res.status(401).json({ error: 'Please log in again.' });
  res.json(user);
}));

router.put('/', wrap(async (req, res) => {
  const user = await User.findById(req.uid);
  if (!user) return res.status(401).json({ error: 'Please log in again.' });
  Object.assign(user, cleanPortfolio(req.body));
  if (user.pro && req.body.customDomain !== undefined) {
    const domain = String(req.body.customDomain || '').trim().toLowerCase();
    if (domain && !DOMAIN_RE.test(domain)) return res.status(400).json({ error: 'Enter a valid domain, like john.com.' });
    user.customDomain = domain || undefined;
  }
  try {
    await user.save();
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'That domain is already connected to another account.' });
    throw e;
  }
  res.json({ ok: true });
}));

// Payment is simulated for this project: this endpoint just flips the Pro flag.
router.post('/upgrade', wrap(async (req, res) => {
  await User.updateOne({ _id: req.uid }, { pro: true });
  res.json({ ok: true });
}));

export default router;
