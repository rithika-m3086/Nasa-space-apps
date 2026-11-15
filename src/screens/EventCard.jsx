import React from 'react';
import { useCallback, useState } from 'react';
import { useMission } from '../store/useMission.js';
import { BigButton, Card } from '../components/ui/index.js';
import FlareWave from '../components/FlareWave.jsx';
import OptionPreview from '../components/OptionPreview.jsx';
import nasaImages from '../data/nasa-images.json';
import copy from '../i18n/en.json';
import { Star } from 'lucide-react';

function findImage(nasaId) {
  return nasaImages.items.find((item) => item.nasa_id === nasaId);
}

export default function EventCard() {
  const event = useMission((state) => state.event);
  const chooseOption = useMission((state) => state.chooseOption);
  const flareClass = useMission((state) => state.live?.sun?.flareClass);
  const [waveResult, setWaveResult] = useState(null);
  const flareStars = waveResult?.event === event ? waveResult.stars : null;
  const onWaveComplete = useCallback((stars) => setWaveResult({ event, stars }), [event]);
  const image = event?.image?.nasaId ? findImage(event.image.nasaId) : null;
  const safeThumbnail = image?.thumbnail_href && new URL(image.thumbnail_href).hostname === 'images-api.nasa.gov'
    ? image.thumbnail_href
    : null;
  const hasFlareWave = Boolean(event && ['flare', 'dust'].includes(event.kind));
  const recommendedTag = flareStars === 3 ? 'safe' : flareStars === 2 ? 'balanced' : 'risky';
  const recommendedOption = !hasFlareWave || flareStars === null
    ? null
    : event?.options.find((option) => option.tag === recommendedTag) || null;

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

      {hasFlareWave && (
        <FlareWave
          key={event.id}
          flareClass={flareClass}
          onComplete={onWaveComplete}
        />
      )}

      {recommendedOption && (
        <div className="flare-wave__suggestion" role="note">
          <Star aria-hidden="true" fill="currentColor" size={20} />
          <p>{copy.flareWave.suggestedChoice} <strong>{recommendedOption.label}</strong></p>
        </div>
      )}

      {(!hasFlareWave || flareStars !== null) && (
        <section className="grid gap-3" aria-label="Choose what the crew should do">
          {event.options.map((option) => {
            const isSuggested = option.id === recommendedOption?.id;
            return (
              <BigButton
                key={option.id}
                variant="secondary"
                className={`w-full justify-start p-4 text-left${isSuggested ? ' flare-wave-option--suggested' : ''}`}
                onClick={() => chooseOption(option.id)}
              >
                <span className="grid w-full gap-1">
                  <span className="flex flex-wrap items-center gap-2 font-bold">
                    {option.label}
                    {isSuggested && (
                      <span className="flare-wave__recommendation">
                        <Star aria-hidden="true" fill="currentColor" size={16} />
                        {copy.flareWave.starMatch}
                      </span>
                    )}
                  </span>
                  <OptionPreview option={option} />
                </span>
              </BigButton>
            );
          })}
        </section>
      )}
    </div>
  );
}
