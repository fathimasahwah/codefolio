import { ContactForm, ProBadge, Socials, ProjectLinks, Shot, activeSkills } from './shared.jsx';

export default function Minimalist({ data, preview }) {
  const { profile = {}, projects = [], skills = [] } = data;
  return (
    <div className="tpl tpl-min">
      <main>
        <header>
          <h1>{profile.name}{data.pro && <ProBadge />}</h1>
          <p className="lede">{profile.bio}</p>
          <nav className="links"><Socials profile={profile} /></nav>
        </header>
        {projects.length > 0 && (
          <section>
            <h2>Projects</h2>
            {projects.map((p, i) => (
              <article key={i}>
                <Shot project={p} />
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                {p.techStack?.length > 0 && <p className="stack">{p.techStack.join(', ')}</p>}
                <nav className="links"><ProjectLinks project={p} /></nav>
              </article>
            ))}
          </section>
        )}
        {activeSkills(skills).length > 0 && (
          <section>
            <h2>Skills</h2>
            <dl>{activeSkills(skills).map((s) => <div key={s.category}><dt>{s.category}</dt><dd>{s.items.join(', ')}</dd></div>)}</dl>
          </section>
        )}
        <section>
          <h2>Contact</h2>
          <ContactForm username={data.username} disabled={preview} />
        </section>
      </main>
    </div>
  );
}
