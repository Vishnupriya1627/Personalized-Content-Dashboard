import { useState } from 'react';

interface Props {
  name?: string | null;
  email?: string | null;
  src?: string | null;
  size?: number;
}

export default function Avatar({ name, email, src, size = 36 }: Props) {
  // Keyed on src below, so a new URL gets a fresh chance to load
  const [failed, setFailed] = useState(false);
  const label = name || email || 'User';
  const initial = label.charAt(0).toUpperCase();

  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent font-semibold text-on-accent"
    >
      {src && !failed ? (
        <img
          key={src}
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          onLoad={() => setFailed(false)}
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  );
}