import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ContentItem } from '@/types/content';

interface FavoritesState {
  items: ContentItem[];
}

const initialState: FavoritesState = { items: [] };

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<ContentItem>) {
      const index = state.items.findIndex((i) => i.id === action.payload.id);
      if (index >= 0) state.items.splice(index, 1);
      else state.items.unshift(action.payload);
    },
  },
});

export const { toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;