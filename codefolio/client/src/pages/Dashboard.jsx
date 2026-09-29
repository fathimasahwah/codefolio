import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { api } from '../api.js';
import { templateMap, DefaultLayout, TEMPLATE_LABELS } from '../templates/index.jsx';

const CATEGORIES = ['Frontend', 'Backend', 'DevOps'];
const split = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

// Server data -> form values (arrays become comma-separated strings for easy typing).
const toForm = (u) => ({
  templateId: u.templateId || 'minimalist',
  customDomain: u.customDomain || '',
  profile: { name: u.profile?.name || '', bio: u.profile?.bio || '', resumeUrl: u.profile?.resumeUrl || '', socials: u.profile?.socials || [] },
  projects: (u.projects || []).map((p) => ({ ...p, techStack: (p.techStack || []).join(', ') })),
  skills: CATEGORIES.map((category) => ({ category, items: ((u.skills || []).find((s) => s.category === category)?.items || []).join(', ') })),
});

// Form values -> the shape the API and the templates both use.
const toData = (f) => ({
  templateId: f.templateId,
  customDomain: f.customDomain,
  profile: f.profile,
  projects: (f.projects || []).map((p) => ({ ...p, techStack: split(p.techStack) })),
  skills: (f.skills || []).map((s) => ({ category: s.category, items: split(s.items) })),
});

export default function Dashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState({ text: '', error: false });
  const { register, control, handleSubmit, reset, watch, formState: { isDirty, isSubmitting } } = useForm();
  const projects = useFieldArray({ control, name: 'projects' });
  const socials = useFieldArray({ control, name: 'profile.socials' });

  useEffect(() => {
    api('/me').then((u) => { setMe(u); reset(toForm(u)); }).catch((e) => setStatus({ text: e.message, error: true }));
  }, [reset]);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    const warn = (e) => { if (isDirty) e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const values = watch();
  const preview = useMemo(() => (me ? { ...toData(values), pro: me.pro, username: me.username } : null), [values, me]);

  if (!me) return <main className="notfound"><p>{status.text || 'Loading…'}</p></main>;

  const flash = (text, error = false) => { setStatus({ text, error }); if (!error) setTimeout(() => setStatus({ text: '', error: false }), 2500); };
  const save = async (form) => {
    try { await api('/me', { method: 'PUT', body: toData(form) }); reset(form); flash('Saved'); }
    catch (e) { flash(e.message, true); }
  };
  const upgrade = async () => {
    try { await api('/me/upgrade', { method: 'POST' }); setMe({ ...me, pro: true }); flash('You are on Pro'); }
    catch (e) { flash(e.message, true); }
  };
  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };
  const Layout = templateMap[values.templateId] || DefaultLayout;

  return (
    <div className="dash">
      <form className="editor" onSubmit={handleSubmit(save)}>
        <header className="editor-head">
          <div>
            <strong>{me.username}</strong>{me.pro && <span className="pro">Pro</span>}
            <a href={`/${me.username}`} target="_blank" rel="noreferrer">View public page</a>
          </div>
          <button type="button" className="link" onClick={logout}>Log out</button>
        </header>

        <fieldset>
          <legend>Profile</legend>
          <label>Name<input {...register('profile.name')} /></label>
          <label>Bio<textarea rows="3" maxLength="500" {...register('profile.bio')} /></label>
          <label>Resume URL<input placeholder="https://…" {...register('profile.resumeUrl')} /></label>
          <label>Template
            <select {...register('templateId')}>
              {Object.keys(templateMap).map((k) => <option key={k} value={k}>{TEMPLATE_LABELS[k]}</option>)}
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Social links</legend>
          {socials.fields.map((f, i) => (
            <div className="row" key={f.id}>
              <input placeholder="Label (GitHub)" {...register(`profile.socials.${i}.label`)} />
              <input placeholder="https://…" {...register(`profile.socials.${i}.url`)} />
              <button type="button" className="link" onClick={() => socials.remove(i)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => socials.append({ label: '', url: '' })}>Add social link</button>
        </fieldset>

        <fieldset>
          <legend>Projects</legend>
          {projects.fields.map((f, i) => (
            <div className="project" key={f.id}>
              <input placeholder="Title" {...register(`projects.${i}.title`)} />
              <textarea rows="2" placeholder="What does it do?" {...register(`projects.${i}.description`)} />
              <input placeholder="Tech stack: React, Node, MongoDB" {...register(`projects.${i}.techStack`)} />
              <div className="row">
                <input placeholder="Repo link" {...register(`projects.${i}.repoLink`)} />
                <input placeholder="Live link" {...register(`projects.${i}.liveLink`)} />
              </div>
              <input placeholder="Screenshot image URL" {...register(`projects.${i}.screenshot`)} />
              <button type="button" className="link" onClick={() => projects.remove(i)}>Remove project</button>
            </div>
          ))}
          <button type="button" onClick={() => projects.append({ title: '', description: '', techStack: '', repoLink: '', liveLink: '', screenshot: '' })}>Add project</button>
        </fieldset>

        <fieldset>
          <legend>Skills</legend>
          {CATEGORIES.map((c, i) => (
            <label key={c}>{c}
              <input placeholder="Comma separated: React, CSS" {...register(`skills.${i}.items`)} />
              <input type="hidden" {...register(`skills.${i}.category`)} />
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Pro</legend>
          {me.pro ? (
            <label>Custom domain
              <input placeholder="john.com" {...register('customDomain')} />
              <small>Point a CNAME record for this domain at your CodeFolio host, then save.</small>
            </label>
          ) : (
            <p>Pro adds a badge to your portfolio and lets you use your own domain. Payment is simulated in this project. <button type="button" onClick={upgrade}>Upgrade to Pro</button></p>
          )}
        </fieldset>

        <footer className="editor-foot">
          <button className="primary" disabled={isSubmitting || !isDirty}>Save changes</button>
          <span className={status.error ? 'error' : 'ok'} role="status">{status.text}{isDirty && !status.text && 'Unsaved changes'}</span>
        </footer>
      </form>

      <section className="preview" aria-label="Live preview">
        <div className="preview-bar">Live preview</div>
        <div className="preview-frame"><Layout data={preview} preview /></div>
      </section>
    </div>
  );
}
