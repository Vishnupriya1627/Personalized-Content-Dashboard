import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleDarkMode } from '@/features/preferences/preferencesSlice';

export default function ThemeToggle() {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((s) => s.preferences.darkMode);

  return (
    <button
      onClick={() => dispatch(toggleDarkMode())}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-lg p-2 text-muted transition hover:bg-border hover:text-text"
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}