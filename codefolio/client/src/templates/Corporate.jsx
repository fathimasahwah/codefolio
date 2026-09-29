import { ContactForm, ProBadge, Socials, ProjectLinks, Shot, activeSkills } from './shared.jsx';

export default function Corporate({ data, preview }) {
  const { profile = {}, projects = [], skills = [] } = data;
  return (
    <div className="tpl tpl-corp">
      <header>
        <h1>{profile.name}{data.pro && <ProBadge />}</h1>
        <p className="lede">{profile.bio}</p>
      </header>
      <div className="cols">
        <aside>
          <h2>Links</h2>
          <nav className="links"><Socials profile={profile} /></nav>
          {activeSkills(skills).length > 0 && <h2>Skills</h2>}
          {activeSkills(skills).map((s) => (
            <div key={s.category}><h3>{s.category}</h3><ul>{s.items.map((t) => <li key={t}>{t}</li>)}</ul></div>
          ))}
        </aside>
        <main>
          <h2>Selected work</h2>
          {projects.map((p, i) => (
            <article key={i}>
              <Shot project={p} />
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              {p.techStack?.length > 0 && <p className="stack">{p.techStack.join(', ')}</p>}
              <nav className="links"><ProjectLinks project={p} /></nav>
            </article>
          ))}
          <h2>Get in touch</h2>
          <ContactForm username={data.username} disabled={preview} />
        </main>
      </div>
    </div>
  );
}
