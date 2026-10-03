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
      // On success, AuthListener updates Redux and the <Navigate> above redirects.
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
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your personalized content dashboard awaits.
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" /> OR <span className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="font-medium text-indigo-600 hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </main>
  );
}