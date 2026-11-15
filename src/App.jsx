import { useMission } from './store/useMission.js';

export default function App() {
  const state = useMission();

  return (
    <main>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </main>
  );
}
