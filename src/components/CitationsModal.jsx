import React from 'react';
import { useState } from 'react';
import { BigButton, Modal } from './ui/index.js';
import { sources } from '../data/sources.js';

export default function CitationsModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BigButton variant="ghost" onClick={() => setOpen(true)}>
        NASA data &amp; sources
      </BigButton>
      <Modal open={open} onClose={() => setOpen(false)} title="NASA data & sources">
        <ul className="grid gap-3">
          {sources.map((source) => (
            <li key={source.id} className="rounded-xl border border-white/10 p-3">
              <h3 className="font-semibold">{source.title}</h3>
              <p className="text-sm text-[var(--color-muted)]">{source.org} · {source.usedFor}</p>
              <p className="mt-1 text-sm">{source.note}</p>
              {source.url.startsWith('http') ? (
                <a className="mt-2 inline-flex min-h-11 items-center text-[var(--color-power)] underline" href={source.url} target="_blank" rel="noreferrer">
                  Open source
                </a>
              ) : (
                <p className="mt-2 text-sm text-[var(--color-warning)]">Source link needs review.</p>
              )}
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
