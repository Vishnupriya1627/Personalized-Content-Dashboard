import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';

export default function ThemeSync() {
  const darkMode = useAppSelector((s) => s.preferences.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    } catch {
      /* storage unavailable, ignore */
    }
  }, [darkMode]);

  return null;
}