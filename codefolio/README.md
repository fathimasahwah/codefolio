# CodeFolio

A portfolio builder for developers (MERN). Users fill in a dashboard, pick a template, and get a public page at `/username`.

**Features:** JWT auth, dashboard CMS (React Hook Form) with live preview, template engine (Minimalist, Cyberpunk, Corporate), vanity URLs, SEO with React Helmet plus server-side tags, contact form via Nodemailer, Pro badge and custom domains, lazy-loaded screenshots.

## Run locally

Requires Node 18+ and a MongoDB (local or Atlas).

```bash
cd server && cp .env.example .env     # edit MONGO_URI and JWT_SECRET
npm install && npm run seed && npm run dev      # API on :5000
# in a second terminal
cd client && npm install && npm run dev         # app on :5173 (proxies /api to :5000)
```

Demo profiles after seeding (log in with `demo1@example.com` / `password123`):

| URL | Template | Plan |
| --- | --- | --- |
| `/demo1` (or `/user/demo1`) | Minimalist | Free |
| `/demo2` | Cyberpunk | Pro |
| `/demo3` | Corporate | Free |

## Deploy as one service (Render, Railway, etc.)

Build command: `npm run build`. Start command: `npm start`.
Environment variables: `MONGO_URI` (MongoDB Atlas), `JWT_SECRET`, `APP_HOST` (your domain), and `SMTP_*` plus `MAIL_FROM` for real email. Run `npm run seed` once against the production database to create the demo profiles.

## Project layout

```
server/  index.js  middleware.js  seed.js
         models/User.js  routes/{auth,me,public}.js  utils/{mailer,sanitize}.js
client/src/
         pages/{Login,Dashboard,Public}.jsx     dashboard code and public code are separate
         templates/{Minimalist,Cyberpunk,Corporate,shared,index}.jsx + templates.css
```

Add a template: create `templates/MyTheme.jsx`, add one line to `templateMap` in `templates/index.jsx`, and add its id to `TEMPLATES` in `server/models/User.js`.

## Notes

- Without `SMTP_HOST`, contact messages are printed to the server console instead of emailed.
- "Upgrade to Pro" only flips a flag; payment is simulated.
- Routing explanation: see [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md).
