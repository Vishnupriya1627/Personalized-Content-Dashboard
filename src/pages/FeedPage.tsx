import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppSelector } from '@/store/hooks';

export default function FeedPage() {
  const user = useAppSelector((s) => s.auth.user);
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Hello, {user?.name ?? user?.email} 👋</h1>
      <button
        onClick={() => signOut(auth)}
        className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white"
      >
        Sign out
      </button>
    </main>
  );
}