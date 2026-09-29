import { Router } from 'express';
import User from '../models/User.js';
import { wrap, contactLimiter } from '../middleware.js';
import { sendContactMail } from '../utils/mailer.js';

const router = Router();

// The public view never includes the owner's email or password hash.
const publicView = (u) => ({ username: u.username, templateId: u.templateId, pro: u.pro, profile: u.profile, projects: u.projects, skills: u.skills });

router.get('/portfolio/:username', wrap(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() }).lean();
  if (!user) return res.status(404).json({ error: 'No portfolio found.' });
  res.json(publicView(user));
}));

router.post('/contact/:username', contactLimiter, wrap(async (req, res) => {
  const { from, message, website } = req.body;
  if (website) return res.json({ ok: true }); // honeypot field: real visitors never fill it in
  if (!/^\S+@\S+\.\S+$/.test(String(from || ''))) return res.status(400).json({ error: 'Enter a valid email address.' });
  const body = String(message || '').trim();
  if (body.length < 5 || body.length > 2000) return res.status(400).json({ error: 'Message must be 5-2000 characters.' });
  const owner = await User.findOne({ username: req.params.username.toLowerCase() }).select('email');
  if (!owner) return res.status(404).json({ error: 'No portfolio found.' });
  try {
    await sendContactMail({ to: owner.email, replyTo: String(from).trim(), message: body });
  } catch (e) {
    console.error('[contact] mail failed', e.message);
    return res.status(502).json({ error: 'Could not send the message. Try again later.' });
  }
  res.json({ ok: true }); // the owner's address is never returned
}));

export default router;
