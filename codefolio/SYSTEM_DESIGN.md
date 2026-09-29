# System design note: how `/username` is routed

**Short answer:** both. Express decides what a URL *returns*; React Router decides what the browser *shows*.

## The request flow for `codefolio.com/john`

1. **Express** receives `GET /john`. It is not under `/api`, so it falls through to the catch-all and returns `client/dist/index.html` (the React app shell). Without this, a cold visit or a refresh on `/john` would 404, because `/john` is not a real file.
2. Before sending the shell, Express looks up `john` and writes the real `<title>` and meta description into the HTML. Crawlers that do not run JavaScript still get correct SEO tags.
3. **React Router** matches `/:username` and `<Public />` reads it with `useParams()`.
4. `<Public />` calls `GET /api/portfolio/:username`. Express returns the public view of the user (never the email or password hash).
5. `<Public />` picks the layout: `templateMap[data.templateId] || DefaultLayout`, and renders it with the data.
6. **React Helmet** updates `<title>` and the description from the bio. It replaces the server-written tags instead of duplicating them (`data-rh`).

## Why not backend-only or router-only?

| Option | Problem |
| --- | --- |
| Router only | Works after the app loads, but a direct visit or refresh needs the server to return the shell. Crawlers see an empty page. |
| Backend only (server-side render) | Needs an SSR framework, which is more than this brief asks for. |
| **Both (chosen)** | Simple to build and deploy as one service, and SEO is covered by the server-side tag injection. |

## Reserved names and route order

Usernames like `login`, `dashboard`, `api` and `user` are rejected at sign-up (`RESERVED` in `server/routes/auth.js`). In React Router, `/login` and `/dashboard` are declared before `/:username`. `/user/:username` also works, so URLs like `/user/demo1` from the brief resolve too.

## Custom domains (Pro)

A Pro user saves `john.com` on their account. The domain's CNAME points at the app. `hostRouter` (`server/middleware.js`) reads the `Host` header, finds the owner, and the catch-all injects `window.__CF_USER__ = "john"` into the shell. On `/`, React renders that user's portfolio while the address bar stays `john.com`. TLS certificates for custom domains are out of scope here (a proxy such as Cloudflare or Caddy would handle that).

## Contact form privacy

The browser posts `{ from, message }` to `POST /api/contact/:username`. The server looks up the owner's email itself, sends with Nodemailer (`replyTo` is the visitor), and never returns the address. The route is rate limited and has a honeypot field.
