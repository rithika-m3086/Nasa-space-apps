import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { selectDebrief, selectShareCode, useMission } from '../store/useMission.js';
import { BigButton, Card } from '../components/ui/index.js';
import { usePrefs } from './usePrefs.js';
import PatchArtwork from './patch/PatchArtwork.jsx';
import { DEFAULT_PATCH } from './patch/patchOptions.js';
import './certificate.css';

function downloadImage(dataUrl, fileName) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
}

export default function Certificate() {
  const state = useMission();
  const report = selectDebrief(state);
  const shareCode = selectShareCode(state);
  const savedPatch = usePrefs((preferences) => preferences.patchDesign);
  const design = savedPatch || { ...DEFAULT_PATCH, name: state.config.cadetName || DEFAULT_PATCH.name };
  const [message, setMessage] = useState('');
  const certificateRef = useRef(null);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  async function downloadCertificate() {
    if (!certificateRef.current) return;
    try {
      const image = await toPng(certificateRef.current, { cacheBust: true, pixelRatio: 2 });
      downloadImage(image, 'junior-flight-director-certificate.png');
      setMessage('Your certificate picture is ready!');
    } catch {
      setMessage("We couldn't save that picture. You can print this page instead.");
    }
  }

  return (
    <div className="certificate-page mx-auto grid max-w-5xl gap-5">
      <header className="certificate-actions flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--color-power)]">MISSION KEEPSAKE</p>
          <h1 className="oc-display text-4xl">Your certificate</h1>
        </div>
        <BigButton variant="ghost" onClick={() => { window.location.hash = '#/'; }}>
          <ArrowLeft aria-hidden="true" size={20} /> Back to report
        </BigButton>
      </header>

      <Card className="certificate-actions flex flex-wrap justify-center gap-3">
        <BigButton onClick={downloadCertificate}>
          <Download aria-hidden="true" size={20} /> Download PNG
        </BigButton>
        <BigButton variant="secondary" onClick={() => window.print()}>
          <Printer aria-hidden="true" size={20} /> Print certificate
        </BigButton>
        <p className="w-full text-center text-sm text-[var(--color-muted)]" role="status" aria-live="polite">
          {message}
        </p>
      </Card>

      <section ref={certificateRef} className="certificate-print certificate-sheet">
        <div className="certificate-corner certificate-corner--top-left" aria-hidden="true">✦</div>
        <div className="certificate-corner certificate-corner--top-right" aria-hidden="true">✦</div>
        <div className="certificate-corner certificate-corner--bottom-left" aria-hidden="true">✧</div>
        <div className="certificate-corner certificate-corner--bottom-right" aria-hidden="true">✧</div>
        <p className="certificate-kicker">OUTPOST COMMAND · MISSION LEARNING REPORT</p>
        <h2 className="certificate-title">Junior Flight Director</h2>
        <p className="certificate-subtitle">Certificate of Curiosity</p>
        <div className="certificate-rule" aria-hidden="true" />
        <p className="certificate-presented">This certificate celebrates</p>
        <p className="certificate-name">{state.config.cadetName || 'Junior Cadet'}</p>
        <p className="certificate-copy">
          for leading a crew on a {state.config.site === 'mars' ? 'Mars' : 'Moon'} mission
          and learning with every choice.
        </p>
        <div className="certificate-patch">
          <PatchArtwork design={design} size={150} />
        </div>
        <div className="certificate-details">
          <p><strong>Rank</strong><span>{report.rank || state.rank || 'Mission Explorer'}</span></p>
          <p><strong>Mission</strong><span>{state.config.site === 'mars' ? 'Mars' : 'Moon'} · {report.days} days</span></p>
          <p><strong>Date</strong><span>{date}</span></p>
        </div>
        <p className="certificate-code">Mission code · {shareCode}</p>
        <p className="certificate-footer">Keep exploring. Keep asking big questions.</p>
      </section>
    </div>
  );
}
