import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { ArrowLeft, Download, Shuffle } from 'lucide-react';
import { useMission } from '../store/useMission.js';
import { BigButton, Card } from '../components/ui/index.js';
import { usePrefs } from './usePrefs.js';
import PatchArtwork from './patch/PatchArtwork.jsx';
import {
  DEFAULT_PATCH,
  PATCH_ICONS,
  PATCH_MOTTOS,
  PATCH_PALETTES,
  PATCH_SHAPES,
} from './patch/patchOptions.js';

function downloadImage(dataUrl, fileName) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
}

export default function PatchDesigner() {
  const missionName = useMission((state) => state.config.cadetName);
  const preferences = usePrefs();
  const [design, setDesign] = useState(() => (
    preferences.patchDesign || { ...DEFAULT_PATCH, name: missionName || DEFAULT_PATCH.name }
  ));
  const [message, setMessage] = useState('');
  const previewRef = useRef(null);
  const surpriseCount = useRef(0);

  function changeDesign(changes) {
    const next = { ...design, ...changes };
    setDesign(next);
    preferences.patch({ patchDesign: next });
    setMessage('');
  }

  function surpriseMe() {
    surpriseCount.current += 1;
    const turn = surpriseCount.current;
    changeDesign({
      shape: PATCH_SHAPES[turn % PATCH_SHAPES.length].id,
      palette: PATCH_PALETTES[(turn * 2) % PATCH_PALETTES.length].id,
      icon: PATCH_ICONS[(turn * 5) % PATCH_ICONS.length].id,
      motto: PATCH_MOTTOS[(turn * 3) % PATCH_MOTTOS.length],
    });
  }

  async function savePatch() {
    if (!previewRef.current) return;
    try {
      const image = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 3 });
      downloadImage(image, 'outpost-mission-patch.png');
      setMessage('Your patch picture is ready!');
    } catch {
      setMessage("We couldn't save that picture. Please try again.");
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--color-power)]">MISSION KEEPSAKE</p>
          <h1 className="oc-display text-4xl">Design your patch</h1>
        </div>
        <BigButton variant="ghost" onClick={() => { window.location.hash = '#/'; }}>
          <ArrowLeft aria-hidden="true" size={20} /> Back to report
        </BigButton>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid content-start gap-4">
          <Card>
            <h2 className="oc-display text-2xl">Choose a shape</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {PATCH_SHAPES.map((shape) => (
                <BigButton
                  key={shape.id}
                  variant={design.shape === shape.id ? 'primary' : 'secondary'}
                  aria-pressed={design.shape === shape.id}
                  onClick={() => changeDesign({ shape: shape.id })}
                >
                  {shape.label}
                </BigButton>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="oc-display text-2xl">Choose colors</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PATCH_PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  aria-pressed={design.palette === palette.id}
                  onClick={() => changeDesign({ palette: palette.id })}
                  className="flex min-h-12 items-center gap-3 rounded-xl border border-white/15 p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                >
                  <span className="h-7 w-7 rounded-full border-2" style={{ background: palette.base, borderColor: palette.accent }} aria-hidden="true" />
                  {palette.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="oc-display text-2xl">Choose a symbol</h2>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {PATCH_ICONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={`Choose ${label} symbol`}
                  aria-pressed={design.icon === id}
                  onClick={() => changeDesign({ icon: id })}
                  className="flex min-h-12 items-center justify-center rounded-xl border border-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                >
                  <Icon aria-hidden="true" size={24} />
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="oc-display text-2xl">Pick a motto</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {PATCH_MOTTOS.map((motto) => (
                <BigButton
                  key={motto}
                  variant={design.motto === motto ? 'primary' : 'secondary'}
                  aria-pressed={design.motto === motto}
                  onClick={() => changeDesign({ motto })}
                >
                  {motto}
                </BigButton>
              ))}
            </div>
          </Card>

          <Card>
            <label htmlFor="patch-name" className="oc-display text-2xl">Name on the ring</label>
            <input
              id="patch-name"
              className="mt-3 min-h-12 w-full rounded-xl border border-white/20 bg-[var(--color-bg)] px-4"
              value={design.name}
              maxLength={18}
              onChange={(event) => changeDesign({ name: event.target.value })}
            />
          </Card>
        </div>

        <aside className="grid content-start gap-4 lg:sticky lg:top-5">
          <Card className="text-center">
            <h2 className="oc-display text-2xl">Your patch</h2>
            <div ref={previewRef} className="mx-auto mt-3 w-full rounded-2xl bg-[var(--color-panel)] p-3">
              <PatchArtwork design={design} size={250} />
            </div>
            <div className="mt-4 grid gap-2">
              <BigButton variant="secondary" onClick={surpriseMe}>
                <Shuffle aria-hidden="true" size={20} /> Surprise me
              </BigButton>
              <BigButton onClick={savePatch}>
                <Download aria-hidden="true" size={20} /> Save patch as PNG
              </BigButton>
            </div>
            <p className="mt-3 min-h-6 text-sm text-[var(--color-muted)]" role="status" aria-live="polite">
              {message}
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
