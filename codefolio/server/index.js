import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import User from './models/User.js';
import authRoutes, { RESERVED } from './routes/auth.js';
import meRoutes from './routes/me.js';
import publicRoutes from './routes/public.js';
import { hostRouter, wrap } from './middleware.js';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set. Copy .env.example to .env first.');

const app = express();
app.set('trust proxy', 1); // correct client IPs for rate limiting behind Render/Heroku/nginx
app.use(cors(), express.json({ limit: '1mb' }), hostRouter);

app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api', publicRoutes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// In production Express also serves the built React app. Every non-API path returns index.html,
// so a cold visit to /john (or to a Pro custom domain) still reaches React Router.
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');
  const shell = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get('*', wrap(async (req, res) => {
    const segments = req.path.split('/').filter(Boolean);
    const handle = req.customUsername || (segments[0] === 'user' ? segments[1] : segments[0]);
    let html = shell;
    if (handle && !RESERVED.includes(handle.toLowerCase())) {
      const user = await User.findOne({ username: handle.toLowerCase() }).select('username profile').lean();
      if (user) {
        // Crawlers that skip JavaScript still see the right title and description.
        // data-rh lets React Helmet replace these tags instead of duplicating them.
        const title = `${user.profile?.name || user.username} | Developer Portfolio`;
        const desc = (user.profile?.bio || '').slice(0, 155);
        html = html
          .replace(/<title>.*?<\/title>/, `<title data-rh="true">${esc(title)}</title>`)
          .replace('</head>', `<meta data-rh="true" name="description" content="${esc(desc)}"><script>window.__CF_USER__=${req.customUsername ? JSON.stringify(user.username) : 'null'}</script></head>`);
      }
    }
    res.type('html').send(html);
  }));
}

// Central error handler: async route errors land here instead of crashing the process.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side.' });
});

await mongoose.connect(process.env.MONGO_URI);
app.listen(process.env.PORT || 5000, () => console.log(`API listening on :${process.env.PORT || 5000}`));
