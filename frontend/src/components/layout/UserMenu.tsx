import { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAppSelector } from "@/store/hooks";
import Avatar from "@/components/Avatar";

export default function UserMenu() {
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-brand/40"
      >
        <Avatar name={user?.name} email={user?.email} src={user?.photo} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-surface p-2 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-semibold text-text">
              {user?.name || "Account"}
            </p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <button
            role="menuitem"
            onClick={() => signOut(auth)}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text transition hover:bg-border"
          >
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
