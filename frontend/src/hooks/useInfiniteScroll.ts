import { useEffect, useRef } from 'react';

export function useInfiniteScroll(onIntersect: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect();
      },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return ref;
}