import { Rocket } from 'lucide-react';
import { selectDayLabel } from '../../store/useMission.js';

export default function DayRail({ day = 1, site = 'moon' }) {
  const label = selectDayLabel(site);
  return (
    <div aria-label={`${label} ${day} of 7`} className="relative">
      <ol className="oc-rail">
        {Array.from({ length: 7 }, (_, index) => {
          const currentDay = index + 1;
          const state = currentDay === day ? 'current' : currentDay < day ? 'done' : 'upcoming';
          return (
            <li
              key={currentDay}
              className={`oc-rail__step oc-rail__step--${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              {state === 'current' && (
                <Rocket className="oc-rail__astronaut" aria-hidden="true" />
              )}
              <span className="oc-rail__dot" aria-hidden="true" />
              <span>{label} {currentDay}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
