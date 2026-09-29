import { useState } from 'react';
import { api } from '../api.js';

export const ProBadge = () => <span className="pro-badge">Pro</span>;

export const activeSkills = (skills = []) => skills.filter((s) => s.items?.length);

export function Socials({ profile = {} }) {
  const links = [...(profile.socials || []), ...(profile.resumeUrl ? [{ label: 'Resume', url: profile.resumeUrl }] : [])];
  return links.map((s) => <a key={s.label + s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>);
}

export function ProjectLinks({ project }) {
  return (
    <>
      {project.repoLink && <a href={project.repoLink} target="_blank" rel="noopener noreferrer">Source code</a>}
      {project.liveLink && <a href={project.liveLink} target="_blank" rel="noopener noreferrer">Live site</a>}
    </>
  );
}

// Lazy-loaded, fixed-ratio screenshots keep the page fast and stop layout jumps.
export function Shot({ project }) {
  if (!project.screenshot) return null;
  return <img className="shot" src={project.screenshot} alt={`Screenshot of ${project.title}`} width="640" height="360" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
}

export function ContactForm({ username, disabled }) {
  const [state, setState] = useState({ text: '', error: false, busy: false });

  const submit = async (e) => {
    e.preventDefault();
    if (disabled) return setState({ text: 'Disabled in preview.', error: false, busy: false });
    const form = e.currentTarget;
    const f = new FormData(form);
    setState({ text: '', error: false, busy: true });
    try {
      await api(`/contact/${username}`, { method: 'POST', body: { from: f.get('from'), message: f.get('message'), website: f.get('website') } });
      form.reset();
      setState({ text: 'Message sent.', error: false, busy: false });
    } catch (err) {
      setState({ text: err.message, error: true, busy: false });
    }
  };

  return (
    <form className="contact" onSubmit={submit}>
      <label>Your email<input name="from" type="email" required /></label>
      <label>Message<textarea name="message" rows="4" required minLength="5" maxLength="2000" /></label>
      <input name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" className="hp" />
      <button disabled={state.busy}>{state.busy ? 'Sending…' : 'Send message'}</button>
      <small role="status" className={state.error ? 'err' : ''}>{state.text}</small>
    </form>
  );
}
