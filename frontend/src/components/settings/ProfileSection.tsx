import { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/features/auth/authSlice';
import Avatar from '@/components/Avatar';

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export default function ProfileSection() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [name, setName] = useState(user?.name ?? '');
  const [photo, setPhoto] = useState(user?.photo ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const trimmedName = name.trim();
  const trimmedPhoto = photo.trim();
  const unchanged =
    trimmedName === (user?.name ?? '') && trimmedPhoto === (user?.photo ?? '');

  const nameError = trimmedName.length === 0 ? 'Name is required.' : trimmedName.length > 50 ? 'Name must be 50 characters or fewer.' : '';
  const photoError =
    trimmedPhoto && !isHttpUrl(trimmedPhoto) ? 'Enter a valid http(s) image URL.' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const current = auth.currentUser;
    if (!current || nameError || photoError) return;

    setSaving(true);
    setMessage(null);
    try {
      await updateProfile(current, {
        displayName: trimmedName,
        photoURL: trimmedPhoto || null, // null removes the photo
      });
      // onAuthStateChanged does not fire for profile edits, so sync Redux by hand
      dispatch(
        setUser({
          uid: current.uid,
          email: current.email,
          name: current.displayName,
          photo: current.photoURL,
        })
      );
      setMessage({ kind: 'ok', text: 'Profile updated.' });
    } catch {
      setMessage({ kind: 'error', text: "Couldn't save your profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-text placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <section aria-labelledby="profile-heading" className="rounded-xl border border-border bg-surface p-5">
      <h2 id="profile-heading" className="font-semibold text-text">Profile</h2>
      <p className="mt-1 text-sm text-muted">Your name and photo appear in the header menu.</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
        <div className="flex items-center gap-4">
          <Avatar name={trimmedName || user?.name} email={user?.email} src={photoError ? null : trimmedPhoto} size={64} />
          <div>
            <p className="text-sm font-medium text-text">{user?.email}</p>
            <p className="text-xs text-muted">Email can't be changed here.</p>
          </div>
        </div>

        <div>
          <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-text">
            Display name
          </label>
          <input
            id="profile-name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'profile-name-error' : undefined}
            autoComplete="name"
          />
          {nameError && (
            <p id="profile-name-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{nameError}</p>
          )}
        </div>

        <div>
          <label htmlFor="profile-photo" className="mb-1.5 block text-sm font-medium text-text">
            Photo URL <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="profile-photo"
            type="url"
            className={inputClass}
            placeholder="https://example.com/me.jpg"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            aria-invalid={Boolean(photoError)}
            aria-describedby={photoError ? 'profile-photo-error' : undefined}
          />
          {photoError && (
            <p id="profile-photo-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{photoError}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || unchanged || Boolean(nameError) || Boolean(photoError)}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {message && (
            <p
              role={message.kind === 'error' ? 'alert' : 'status'}
              className={`text-sm ${message.kind === 'ok' ? 'text-brand' : 'text-red-700 dark:text-red-300'}`}
            >
              {message.text}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}