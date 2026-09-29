import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../api.js';
import { templateMap, DefaultLayout } from '../templates/index.jsx';

// Reads :username from the URL (React Router), then asks the API for that user's data.
export default function Public({ username: forced }) {
  const params = useParams();
  const username = forced || params.username;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    api(`/portfolio/${username}`).then(setData).catch((e) => setError(e.message));
  }, [username]);

  if (error) return <main className="notfound"><h1>No portfolio at /{username}</h1><p>Check the spelling, or <a href="/login">create your own</a>.</p></main>;
  if (!data) return <main className="notfound"><p>Loading…</p></main>;

  // The core of the template engine: pick a layout by templateId, fall back to the default.
  const PortfolioLayout = templateMap[data.templateId] || DefaultLayout;
  const name = data.profile?.name || data.username;
  return (
    <>
      <Helmet>
        <title>{`${name} | Developer Portfolio`}</title>
        <meta name="description" content={(data.profile?.bio || `${name}'s developer portfolio`).slice(0, 155)} />
        <meta property="og:title" content={`${name} | Developer Portfolio`} />
      </Helmet>
      <PortfolioLayout data={data} />
    </>
  );
}
