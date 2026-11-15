import React from 'react';
import { useMission } from '../store/useMission.js';
import { CheckCircle2, Scale, Sparkles } from 'lucide-react';
import { BigButton, Card } from '../components/ui/index.js';
import { sources } from '../data/sources.js';
import nasaImages from '../data/nasa-images.json';

const tagInfo = {
  safe: { label: 'Careful plan', Icon: CheckCircle2 },
  balanced: { label: 'Balanced plan', Icon: Scale },
  risky: { label: 'Bold plan', Icon: Sparkles },
};

function findImage(nasaId) {
  return nasaImages.items.find((item) => item.nasa_id === nasaId);
}

export default function EventCard() {
  const event = useMission((state) => state.event);
  const chooseOption = useMission((state) => state.chooseOption);
  const image = event?.image?.nasaId ? findImage(event.image.nasaId) : null;
  const scienceSource = event?.science?.sourceId
    ? sources.find((source) => source.id === event.science.sourceId)
    : null;
  const safeThumbnail = image?.thumbnail_href && new URL(image.thumbnail_href).hostname === 'images-api.nasa.gov'
    ? image.thumbnail_href
    : null;

  if (!event) {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <h1 className="oc-display text-3xl">The crew is ready</h1>
        <p className="my-4">Your plan is set. Let’s keep going.</p>
        <p className="text-sm text-[var(--color-muted)]">No event is waiting right now.</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-5">
      <Card>
        <p className="font-semibold text-[var(--color-power)]">MISSION EVENT</p>
        <h1 className="oc-display mt-1 text-4xl">{event.title}</h1>
        <p className="mt-3 text-lg leading-relaxed">{event.kid}</p>
        <p className="mt-2 text-[var(--color-muted)]">{event.why}</p>
        {image && (
          <figure className="mt-4">
            {safeThumbnail ? (
              <img className="max-h-72 w-full rounded-2xl object-cover" src={safeThumbnail} alt={image.title} loading="lazy" />
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[var(--color-panel-raised)] p-4 text-sm">
                NASA image: {image.title}
              </div>
            )}
            <figcaption className="mt-2 text-sm text-[var(--color-muted)]">
              Image credit: NASA {image.center ? `· ${image.center}` : ''}
              {image.date_created ? ` · ${image.date_created.slice(0, 10)}` : ''}
            </figcaption>
          </figure>
        )}
      </Card>

      <section className="grid gap-3" aria-label="Choose what the crew should do">
        {event.options.map((option) => {
          const tag = tagInfo[option.tag] || tagInfo.balanced;
          const Icon = tag.Icon;
          return (
            <BigButton
              key={option.id}
              variant="secondary"
              className="w-full justify-start gap-4 p-4 text-left"
              onClick={() => chooseOption(option.id)}
            >
              <Icon aria-hidden="true" className="shrink-0 text-[var(--color-science)]" size={24} />
              <span className="grid gap-1">
                <span className="font-bold">{option.label}</span>
                <span className="text-sm text-[var(--color-muted)]">{option.hint} · {tag.label}</span>
              </span>
            </BigButton>
          );
        })}
      </section>

      <Card>
        <details>
          <summary className="min-h-12 cursor-pointer py-3 font-semibold">Science Behind the Screen</summary>
          <div className="grid gap-2 border-t border-white/10 pt-4">
            <h2 className="oc-display text-xl">{event.science.headline}</h2>
            <p><strong>Mission:</strong> {event.science.mission}</p>
            <p><strong>Instrument:</strong> {event.science.instrument}</p>
            <p>{event.science.fact}</p>
            {scienceSource?.url.startsWith('http') ? (
              <a className="inline-flex min-h-11 items-center text-[var(--color-power)] underline" href={scienceSource.url} target="_blank" rel="noreferrer">
                Source: {scienceSource.title}
              </a>
            ) : (
              <p className="text-sm text-[var(--color-warning)]">Source link needs review.</p>
            )}
          </div>
        </details>
      </Card>
    </div>
  );
}
