import { ContactForm, ProBadge, Socials, ProjectLinks, Shot, activeSkills } from './shared.jsx';

export default function Cyberpunk({ data, preview }) {
  const { profile = {}, projects = [], skills = [] } = data;
  return (
    <div className="tpl tpl-cyber">
      <header>
        <h1>{profile.name}{data.pro && <ProBadge />}</h1>
        <p className="lede">// {profile.bio}</p>
        <nav className="links"><Socials profile={profile} /></nav>
      </header>
      {projects.length > 0 && (
        <section>
          <h2>&gt; projects</h2>
          <div className="grid">
            {projects.map((p, i) => (
              <article key={i}>
                <Shot project={p} />
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <p>{(p.techStack || []).map((t) => <span className="chip" key={t}>{t}</span>)}</p>
                <nav className="links"><ProjectLinks project={p} /></nav>
              </article>
            ))}
          </div>
        </section>
      )}
      {activeSkills(skills).length > 0 && (
        <section>
          <h2>&gt; skills</h2>
          {activeSkills(skills).map((s) => (
            <div className="skill-row" key={s.category}><b>{s.category}</b>{s.items.map((t) => <span className="chip" key={t}>{t}</span>)}</div>
          ))}
        </section>
      )}
      <section>
        <h2>&gt; contact</h2>
        <ContactForm username={data.username} disabled={preview} />
      </section>
    </div>
  );
}
