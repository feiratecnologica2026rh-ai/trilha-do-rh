import { useState } from 'react';
import { Home } from './screens/Home';
import { LocalGame } from './screens/LocalGame';
import { Ranking } from './screens/Ranking';

// O modo online (salas com código/QR, em src/screens/OnlineRoom.tsx) foi retirado da tela:
// ele depende do Firebase, que está fora do ar. O código continua no projeto para uso futuro.
type Screen = 'home' | 'local' | 'ranking';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const goHome = () => setScreen('home');

  if (screen === 'local') return <LocalGame onExit={goHome} />;
  if (screen === 'ranking') return <Ranking onExit={goHome} />;
  return <Home onLocal={() => setScreen('local')} onRanking={() => setScreen('ranking')} />;
}
