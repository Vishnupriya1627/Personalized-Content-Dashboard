import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ContentItem } from '@/types/content';

const MAX_ITEMS = 200;

interface ReadState {
  items: ContentItem[]; // most recently read first
}

const initialState: ReadState = { items: [] };

const readSlice = createSlice({
  name: 'read',
  initialState,
  reducers: {
    // Used when the user opens an item: marks it, never un-marks it
    markRead(state, action: PayloadAction<ContentItem>) {
      if (state.items.some((i) => i.id === action.payload.id)) return;
      state.items = [action.payload, ...state.items].slice(0, MAX_ITEMS);
    },
    // Used by the button: marks or un-marks
    toggleRead(state, action: PayloadAction<ContentItem>) {
      const index = state.items.findIndex((i) => i.id === action.payload.id);
      if (index >= 0) state.items.splice(index, 1);
      else state.items = [action.payload, ...state.items].slice(0, MAX_ITEMS);
    },
    clearRead(state) {
      state.items = [];
    },
  },
});

export const { markRead, toggleRead, clearRead } = readSlice.actions;
export default readSlice.reducer;