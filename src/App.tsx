import { useEffect, useState } from 'react';
import { Home } from './screens/Home';
import { LocalGame } from './screens/LocalGame';
import { OnlineRoom } from './screens/OnlineRoom';
import { Ranking } from './screens/Ranking';
import { useAuth } from './lib/auth';
import { createRoom, normalizeCode } from './lib/rooms';

type Screen = { name: 'home' } | { name: 'local' } | { name: 'ranking' } | { name: 'room'; code: string };

function codeFromUrl() {
  const raw = new URLSearchParams(window.location.search).get('sala');
  const code = raw ? normalizeCode(raw) : '';
  return code.length === 5 ? code : '';
}

function setUrlCode(code: string | null) {
  const url = new URL(window.location.href);
  if (code) url.searchParams.set('sala', code);
  else url.searchParams.delete('sala');
  window.history.replaceState(null, '', url.toString());
}

export default function App() {
  const { user } = useAuth();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [pendingCode, setPendingCode] = useState(codeFromUrl);

  // Quem abriu o link ?sala=XXXXX entra direto assim que estiver logado.
  useEffect(() => {
    if (user && pendingCode && screen.name === 'home') {
      setScreen({ name: 'room', code: pendingCode });
      setPendingCode('');
    }
  }, [user, pendingCode, screen.name]);

  const goHome = () => {
    setUrlCode(null);
    setScreen({ name: 'home' });
  };

  if (screen.name === 'local') return <LocalGame onExit={goHome} />;
  if (screen.name === 'ranking') return <Ranking onExit={goHome} />;

  if (screen.name === 'room' && user) {
    return <OnlineRoom key={screen.code} code={screen.code} user={user} onExit={goHome} />;
  }

  return (
    <Home
      initialCode={pendingCode}
      onLocal={() => setScreen({ name: 'local' })}
      onRanking={() => setScreen({ name: 'ranking' })}
      onCreateRoom={async () => {
        if (!user) return;
        const code = await createRoom(user);
        setUrlCode(code);
        setScreen({ name: 'room', code });
      }}
      onJoinRoom={(code) => {
        setUrlCode(code);
        setScreen({ name: 'room', code });
      }}
    />
  );
}
