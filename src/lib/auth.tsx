import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

export interface AppUser {
  uid: string;
  name: string;
  photo: string | null;
  guest: boolean;
}

interface AuthCtx {
  user: AppUser | null;
  loading: boolean;
  loginGoogle: () => Promise<void>;
  loginGuest: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

const toAppUser = (u: User, fallbackName?: string): AppUser => ({
  uid: u.uid,
  name: u.displayName || fallbackName || localStorage.getItem('trilha:guestName') || 'Visitante',
  photo: u.photoURL,
  guest: u.isAnonymous,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(Boolean(auth));

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u ? toAppUser(u) : null);
      setLoading(false);
    });
  }, []);

  const value: AuthCtx = {
    user,
    loading,
    async loginGoogle() {
      if (!auth) return;
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await signInWithPopup(auth, provider);
      } catch (e) {
        const code = (e as { code?: string }).code ?? '';
        // Alguns navegadores de celular bloqueiam janelas pop-up: usa redirecionamento.
        if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
          await signInWithRedirect(auth, provider);
        } else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
          throw e;
        }
      }
    },
    async loginGuest(name: string) {
      if (!auth) return;
      const clean = name.trim().slice(0, 20);
      try {
        localStorage.setItem('trilha:guestName', clean);
      } catch {
        /* sem armazenamento local: tudo bem */
      }
      const cred = await signInAnonymously(auth);
      await updateProfile(cred.user, { displayName: clean });
      setUser(toAppUser(cred.user, clean));
    },
    async logout() {
      if (auth) await signOut(auth);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth fora do AuthProvider');
  return ctx;
}
