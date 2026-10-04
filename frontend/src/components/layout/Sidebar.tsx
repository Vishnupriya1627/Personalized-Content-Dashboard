import { NavLink } from 'react-router-dom';
import { Home, Flame, Heart, BookCheck, Settings, X } from 'lucide-react';

const links = [
  { to: '/', label: 'My Feed', icon: Home, end: true },
  { to: '/trending', label: 'Trending', icon: Flame, end: false },
  { to: '/favorites', label: 'Favorites', icon: Heart, end: false },
  { to: '/read', label: 'Read', icon: BookCheck, end: false },  
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface p-4 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-xl font-bold tracking-tight text-text">DashBoard</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-muted hover:bg-border lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Main navigation" className="mt-6 flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent text-on-accent'
                    : 'text-muted hover:bg-border hover:text-text'
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}