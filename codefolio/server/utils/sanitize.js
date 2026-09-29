import { CATEGORIES, TEMPLATES } from '../models/User.js';

const text = (v, max = 500) => String(v ?? '').trim().slice(0, max);

// Only http(s) links are allowed, which blocks javascript: URLs in href attributes.
export const url = (v) => {
  const s = text(v, 300);
  if (!s) return '';
  return /^https?:\/\//i.test(s) ? s : `https://${s.replace(/^[a-z]+:\/*/i, '')}`;
};

// Screenshots may also be same-origin paths such as /demo/app.svg.
const imgUrl = (v) => { const s = text(v, 300); return /^\/(?!\/)[\w./-]+$/.test(s) ? s : url(s); };

const list = (v, max) => (Array.isArray(v) ? v : String(v ?? '').split(',')).map((x) => text(x, 40)).filter(Boolean).slice(0, max);

export function cleanPortfolio(body = {}) {
  const p = body.profile || {};
  return {
    templateId: TEMPLATES.includes(body.templateId) ? body.templateId : 'minimalist',
    profile: {
      name: text(p.name, 80),
      bio: text(p.bio, 500),
      resumeUrl: url(p.resumeUrl),
      socials: (p.socials || []).slice(0, 8).map((s) => ({ label: text(s.label, 30), url: url(s.url) })).filter((s) => s.label && s.url),
    },
    projects: (body.projects || []).slice(0, 20).map((x) => ({
      title: text(x.title, 100),
      description: text(x.description, 600),
      techStack: list(x.techStack, 15),
      repoLink: url(x.repoLink),
      liveLink: url(x.liveLink),
      screenshot: imgUrl(x.screenshot),
    })).filter((x) => x.title),
    skills: CATEGORIES.map((category) => ({
      category,
      items: list((body.skills || []).find((s) => s.category === category)?.items, 30),
    })),
  };
}

export const DOMAIN_RE = /^(?=.{4,253}$)([a-z0-9-]+\.)+[a-z]{2,}$/;
