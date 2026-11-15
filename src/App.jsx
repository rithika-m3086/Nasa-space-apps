import { useEffect, useState } from 'react';
import DevGallery from './screens/DevGallery.jsx';

export default function App() {
  const [showGallery, setShowGallery] = useState(
    typeof window !== 'undefined' && window.location.hash === '#/dev',
  );

  useEffect(() => {
    const updateRoute = () => setShowGallery(window.location.hash === '#/dev');
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  if (showGallery) return <DevGallery />;
  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-6 py-16 text-[var(--color-text)]">
      <section className="mx-auto max-w-3xl rounded-3xl bg-[var(--color-panel)] p-8 text-center shadow-xl">
        <p className="font-semibold text-[var(--color-power)]">OUTPOST COMMAND</p>
        <h1 className="oc-display mt-3 text-5xl">Junior Flight Director</h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted)]">
          Plan a kind, clever mission for your crew among the stars.
        </p>
        <a
          className="oc-button oc-button--primary mt-7 no-underline"
          href="#/dev"
        >
          Open the component gallery
        </a>
      </section>
    </main>
  );
}
