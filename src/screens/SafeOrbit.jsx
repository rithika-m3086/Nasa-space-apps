import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { BigButton, Card } from '../components/ui/index.js';

const safetyPromises = [
  'No ads.',
  'No accounts.',
  'No tracking.',
  'Your mission choices stay on this device.',
];

export default function SafeOrbit() {
  return (
    <section className="mx-auto grid max-w-2xl gap-5">
      <Card>
        <ShieldCheck className="mb-3 text-[var(--color-science)]" size={40} aria-hidden="true" />
        <p className="font-semibold text-[var(--color-power)]">A KIND PLACE TO LEARN</p>
        <h1 className="oc-display mt-1 text-4xl">Why this is safe</h1>
        <ul className="mt-5 grid gap-3">
          {safetyPromises.map((promise) => (
            <li className="flex min-h-12 items-center gap-3 rounded-xl bg-[var(--color-panel-raised)] p-3" key={promise}>
              <ShieldCheck size={22} aria-hidden="true" />
              <span>{promise}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[var(--color-muted)]">
          NASA space-weather requests use NASA services only. Your choices are not sent.
        </p>
        <a
          className="oc-source-link mt-4 inline-flex min-h-11 items-center"
          href="https://www.ftc.gov/reports/bringing-dark-patterns-light"
          target="_blank"
          rel="noreferrer"
        >
          Read research about manipulative app design
        </a>
      </Card>
      <div className="flex justify-center">
        <BigButton variant="secondary" onClick={() => { window.location.hash = '#/'; }}>
          Back to mission
        </BigButton>
      </div>
    </section>
  );
}
