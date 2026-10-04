import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ContentItem } from '@/types/content';

export type LiveStatus = 'connecting' | 'live' | 'reconnecting' | 'offline';

interface LiveState {
  status: LiveStatus;
  pending: ContentItem[]; // arrived but not shown yet, newest first
  revealed: ContentItem[]; // shown at the top of the feed, newest first
}

const MAX_PENDING = 50;
const MAX_REVEALED = 100;

const initialState: LiveState = { status: 'connecting', pending: [], revealed: [] };

const liveSlice = createSlice({
  name: 'live',
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<LiveStatus>) {
      state.status = action.payload;
    },
    addLiveItem(state, action: PayloadAction<ContentItem>) {
      const id = action.payload.id;
      if (state.pending.some((i) => i.id === id) || state.revealed.some((i) => i.id === id)) return;
      state.pending = [action.payload, ...state.pending].slice(0, MAX_PENDING);
    },
    revealPending(state) {
      state.revealed = [...state.pending, ...state.revealed].slice(0, MAX_REVEALED);
      state.pending = [];
    },
  },
});

export const { setStatus, addLiveItem, revealPending } = liveSlice.actions;
export default liveSlice.reducer;