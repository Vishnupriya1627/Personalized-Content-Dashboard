import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addLiveItem, setStatus } from '@/features/live/liveSlice';
import type { ContentItem } from '@/types/content';

function wsUrl(): string {
  // In production, set VITE_WS_URL (e.g. wss://your-backend.onrender.com/ws)
  const fromEnv = import.meta.env.VITE_WS_URL as string | undefined;
  if (fromEnv) return fromEnv;
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.host}/ws`;
}

function isContentItem(v: unknown): v is ContentItem {
  const o = v as Partial<ContentItem> | null;
  return !!o && typeof o.id === 'string' && typeof o.title === 'string' && typeof o.type === 'string';
}

export function useLiveFeed() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retry = 0;
    let timer: ReturnType<typeof setTimeout>;
    let closedByUs = false;

    const connect = () => {
      dispatch(setStatus(retry === 0 ? 'connecting' : 'reconnecting'));
      ws = new WebSocket(wsUrl());

      ws.onopen = () => {
        retry = 0;
        dispatch(setStatus('live'));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'new_item' && isContentItem(msg.payload)) {
            dispatch(addLiveItem(msg.payload));
          }
        } catch {
          /* ignore malformed messages */
        }
      };

      ws.onerror = () => ws?.close();

      ws.onclose = () => {
        if (closedByUs) return;
        dispatch(setStatus('reconnecting'));
        // Exponential backoff: 1s, 2s, 4s ... capped at 30s
        const delay = Math.min(1000 * 2 ** retry, 30000);
        retry += 1;
        timer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      closedByUs = true;
      clearTimeout(timer);
      ws?.close();
      dispatch(setStatus('offline'));
    };
  }, [dispatch]);
}