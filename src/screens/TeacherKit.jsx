import React, { useMemo, useState } from 'react';
import { BookOpenCheck, ClipboardList, UsersRound } from 'lucide-react';
import { BigButton, Card } from '../components/ui/index.js';
import { selectDebrief, useMission } from '../store/useMission.js';
import { parseShareCode } from './shareCode.js';

function teacherSummary(state) {
  return selectDebrief(state).lessons.map((lesson) => ({
    day: lesson.day,
    question: `What choice helped the crew on Day ${lesson.day}?`,
  }));
}

export default function TeacherKit() {
  const state = useMission();
  const [classCode, setClassCode] = useState('ORION-42');
  const [codeNumber, setCodeNumber] = useState(42);
  const [pastedCodes, setPastedCodes] = useState('');
  const rows = useMemo(() => pastedCodes
    .split(/\r?\n/)
    .map((code) => code.trim())
    .filter(Boolean)
    .map((code) => ({ code, result: parseShareCode(code) })), [pastedCodes]);
  const questions = teacherSummary(state);

  const generateCode = () => {
    const nextNumber = codeNumber >= 99 ? 42 : codeNumber + 1;
    setCodeNumber(nextNumber);
    setClassCode(`ORION-${nextNumber}`);
  };

  return (
    <section className="mx-auto grid max-w-4xl gap-5">
      <Card>
        <p className="font-semibold text-[var(--color-power)]">CLASSROOM FLIGHT PLAN</p>
        <h1 className="oc-display mt-1 text-4xl">Teacher Kit</h1>
        <p className="mt-2 text-[var(--color-muted)]">A simple way to explore choices, teamwork, and space science.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p className="min-h-12 rounded-xl bg-[var(--color-panel-raised)] px-4 py-3 font-mono text-lg font-bold" aria-live="polite">
            {classCode}
          </p>
          <BigButton variant="secondary" onClick={generateCode}>Generate class code</BigButton>
        </div>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Codes are made here. No student names are needed.</p>
      </Card>

      <Card>
        <h2 className="oc-display flex items-center gap-2 text-2xl">
          <ClipboardList aria-hidden="true" /> Run it in 10 minutes
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          <li className="oc-teacher-step"><strong>1. Join</strong><span>Share the class code with your crew.</span></li>
          <li className="oc-teacher-step"><strong>2. Plan</strong><span>Balance power, life support, and shields.</span></li>
          <li className="oc-teacher-step"><strong>3. Discuss</strong><span>Compare choices and what the crew learned.</span></li>
        </ol>
      </Card>

      <Card>
        <h2 className="oc-display flex items-center gap-2 text-2xl">
          <UsersRound aria-hidden="true" /> Student share codes
        </h2>
        <label className="mt-4 grid gap-2 font-semibold" htmlFor="student-share-codes">
          Paste one share code per line
        </label>
        <textarea
          id="student-share-codes"
          className="oc-share-input mt-2"
          rows={4}
          value={pastedCodes}
          placeholder={'AP-M-7DAYS\nAP-R-ORBIT'}
          onChange={(event) => setPastedCodes(event.target.value)}
        />
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Codes are checked in this browser. Nothing is sent to a server.
        </p>
        {rows.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="oc-results-table">
              <caption className="sr-only">Results from pasted share codes</caption>
              <thead>
                <tr><th scope="col">Share code</th><th scope="col">Site</th><th scope="col">Mission key</th><th scope="col">Status</th></tr>
              </thead>
              <tbody>
                {rows.map(({ code, result }, index) => (
                  <tr key={`${code}-${index}`}>
                    <td>{code}</td>
                    <td>{result?.site || '—'}</td>
                    <td>{result?.missionKey || '—'}</td>
                    <td>{result ? 'Ready to discuss' : 'Check this code'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="oc-display flex items-center gap-2 text-2xl">
          <BookOpenCheck aria-hidden="true" /> Talk about the mission
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Choose a question for a short class discussion.</p>
        <ul className="mt-3 grid gap-3">
          {questions.map(({ day, question }) => (
            <li className="rounded-xl bg-[var(--color-panel-raised)] p-3" key={day}>
              <strong>Day {day}:</strong> {question}
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex justify-center">
        <BigButton variant="secondary" onClick={() => { window.location.hash = '#/'; }}>
          Back to mission
        </BigButton>
      </div>
    </section>
  );
}
