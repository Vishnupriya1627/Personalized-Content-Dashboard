import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FeedState {
  order: string[]; // item ids in the user's preferred order
}

const initialState: FeedState = { order: [] };

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setOrder(state, action: PayloadAction<string[]>) {
      state.order = action.payload;
    },
    resetOrder(state) {
      state.order = [];
    },
    prependToOrder(state, action: PayloadAction<string[]>) {
      // With no custom order, new items already go on top, so there's nothing to do
      if (state.order.length === 0) return;
      const incoming = action.payload.filter((id) => !state.order.includes(id));
      state.order = [...incoming, ...state.order];
    },
  },
});

export const { setOrder, resetOrder, prependToOrder } = feedSlice.actions;
export default feedSlice.reducer;