import { useState } from 'react';
import { BookOpen, LogIn, LogOut, Plus, Smartphone, Trophy, UserRound, Users } from 'lucide-react';
import logo from '../assets/logo.webp';
import { RulesSummary } from '../components/RulesSummary';
import { useAuth } from '../lib/auth';
import { firebaseReady } from '../lib/firebase';
import { normalizeCode } from '../lib/rooms';

interface Props {
  onLocal: () => void;
  onRanking: () => void;
  onCreateRoom: () => Promise<void>;
  onJoinRoom: (code: string) => void;
  initialCode?: string;
}

export function Home({ onLocal, onRanking, onCreateRoom, onJoinRoom, initialCode = '' }: Props) {
  const { user, loading, loginGoogle, loginGuest, logout } = useAuth();
  const [code, setCode] = useState(initialCode);
  const [guestName, setGuestName] = useState('');
  const [showGuest, setShowGuest] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setError('');
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo deu errado. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh px-4 py-6">
      <div className="mx-auto max-w-md grid gap-4">
        <div className="rounded-3xl bg-white shadow-sm overflow-hidden">
          <img src={logo} alt="Trilha do RH — Segurança e Saúde no Trabalho" className="w-full aspect-[16/9] object-cover" />
        </div>

        <p className="text-center font-bold text-marinho/80">
          Jogo educativo baseado na NR-1. Responda, jogue o dado e chegue primeiro à CHEGADA!
        </p>

        {/* Jogar neste aparelho */}
        <button
          onClick={onLocal}
          className="flex items-center gap-3 rounded-3xl bg-verde text-white px-5 py-4 text-left shadow-md active:scale-[0.99] transition"
        >
          <Smartphone size={32} className="flex-none" />
          <span>
            <span className="block text-lg font-black">Jogar neste aparelho</span>
            <span className="block text-sm font-bold text-white/85">1 a 3 jogadores · funciona sem internet</span>
          </span>
        </button>

        <button
          onClick={onRanking}
          className="flex items-center gap-3 rounded-3xl bg-white px-5 py-3.5 text-left shadow-sm active:scale-[0.99] transition"
        >
          <Trophy size={28} className="flex-none text-amarelo" />
          <span className="flex-1">
            <span className="block text-lg font-black">Ranking de jogadores</span>
            <span className="block text-sm font-bold text-marinho/60">Os 3 primeiros · sozinho e em grupo</span>
          </span>
        </button>

        {/* Online */}
        <section className="rounded-3xl bg-white p-5 shadow-sm grid gap-3">
          <h2 className="flex items-center gap-2 text-lg font-black">
            <Users size={22} /> Jogar online (cada um no seu celular)
          </h2>

          {!firebaseReady ? (
            <p className="text-sm font-semibold text-marinho/70">
              O modo online ainda não foi configurado. Siga o passo a passo do README para conectar o Firebase.
            </p>
          ) : loading ? (
            <p className="text-sm font-semibold text-marinho/60">Carregando…</p>
          ) : !user ? (
            <>
              <button
                disabled={busy}
                onClick={() => run(loginGoogle)}
                className="flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white py-3 font-extrabold hover:bg-slate-50"
              >
                <GoogleIcon /> Entrar com Google
              </button>
              {!showGuest ? (
                <button onClick={() => setShowGuest(true)} className="flex items-center justify-center gap-2 py-2 font-bold text-azul">
                  <UserRound size={18} /> Visitante rápido (apenas nome)
                </button>
              ) : (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (guestName.trim()) run(() => loginGuest(guestName));
                  }}
                >
                  <input
                    autoFocus
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    maxLength={20}
                    placeholder="Seu nome"
                    className="min-w-0 flex-1 rounded-2xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-azul"
                  />
                  <button disabled={busy || !guestName.trim()} className="rounded-2xl bg-azul text-white px-4 font-black disabled:opacity-40">
                    <LogIn size={20} />
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-2xl bg-fundo px-3 py-2">
                {user.photo ? (
                  <img src={user.photo} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-azul text-white grid place-items-center font-black">{user.name.charAt(0)}</div>
                )}
                <span className="flex-1 font-extrabold truncate">{user.name}</span>
                <button onClick={() => logout()} className="flex items-center gap-1 text-sm font-bold text-marinho/60">
                  <LogOut size={16} /> Sair
                </button>
              </div>
              <button
                disabled={busy}
                onClick={() => run(onCreateRoom)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-azul text-white py-3.5 text-lg font-black shadow active:scale-[0.99] disabled:opacity-50"
              >
                <Plus size={22} /> Criar Nova Sala
              </button>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const c = normalizeCode(code);
                  if (c.length === 5) onJoinRoom(c);
                  else setError('O código tem 5 caracteres, por exemplo RH7K2.');
                }}
              >
                <input
                  value={code}
                  onChange={(e) => setCode(normalizeCode(e.target.value))}
                  placeholder="Código (ex: RH7K2)"
                  autoCapitalize="characters"
                  className="min-w-0 flex-1 rounded-2xl border-2 border-slate-200 px-4 py-3 font-black tracking-widest uppercase outline-none focus:border-azul"
                />
                <button className="rounded-2xl bg-marinho text-white px-5 font-black">Entrar</button>
              </form>
            </>
          )}
          {error && <p className="text-sm font-bold text-red-600">{error}</p>}
        </section>

        <section className="rounded-3xl bg-white shadow-sm">
          <button onClick={() => setRulesOpen(!rulesOpen)} className="w-full flex items-center gap-2 px-5 py-4 text-lg font-black">
            <BookOpen size={22} /> Como jogar
            <span className="ml-auto text-sm text-azul">{rulesOpen ? 'fechar' : 'ver'}</span>
          </button>
          {rulesOpen && (
            <div className="px-5 pb-5">
              <RulesSummary />
            </div>
          )}
        </section>

        <p className="text-center text-xs font-semibold text-marinho/50">
          Material educativo escolar baseado na NR-1. Para requisitos legais, consulte a versão vigente publicada pelo Ministério do Trabalho e Emprego.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
