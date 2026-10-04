import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, googleProvider } from '@/lib/firebase';
import { useAppSelector } from '@/store/hooks';
import Spinner from '@/components/Spinner';

function friendlyError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later.';
    }
  }
  return 'Something went wrong. Please try again.';
}

export default function LoginPage() {
  const status = useAppSelector((s) => s.auth.status);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'loading') return <Spinner />;
  if (status === 'authenticated') return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
      }
    } catch (err) {
      setError(friendlyError(err));
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(friendlyError(err));
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text ' +
    'placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-accent p-12 text-on-accent lg:flex">
        <div className="text-xl font-bold tracking-tight"></div>
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            All your news, movies
            <br />
            and posts in one place.
          </h2>
          <p className="mt-4 max-w-md opacity-80">
            Pick your interests and get a feed that updates in real time.
          </p>
        </div>
        <p className="text-sm opacity-70"> </p>
      </aside>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-text">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {mode === 'login'
              ? 'Log in to see your personalized feed.'
              : 'It only takes a few seconds.'}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface py-2.5 font-medium text-text transition hover:bg-border disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text">
                  Name
                </label>
                <input
                  id="name"
                  className={inputClass}
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className={inputClass}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className={inputClass}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-300/60 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-60"
            >
              {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="font-semibold text-brand hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}