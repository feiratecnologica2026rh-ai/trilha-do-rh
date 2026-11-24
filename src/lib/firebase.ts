import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, onValue, ref, type Database } from 'firebase/database';

const env = import.meta.env;

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
};

/** O modo online só fica disponível quando as variáveis do Firebase estão preenchidas. */
export const firebaseReady = Boolean(config.apiKey && config.databaseURL && config.projectId);

let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Database | null = null;

/** Diferença entre o relógio do aparelho e o do servidor (ms). */
let serverOffset = 0;

if (firebaseReady) {
  app = initializeApp(config);
  auth = getAuth(app);
  auth.languageCode = 'pt';
  db = getDatabase(app);
  onValue(ref(db, '.info/serverTimeOffset'), (snap) => {
    serverOffset = Number(snap.val()) || 0;
  });
}

/** Horário do servidor: todos os aparelhos usam a mesma referência para os timers. */
export const serverNow = () => Date.now() + serverOffset;
