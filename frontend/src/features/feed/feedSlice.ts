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
  },
});

export const { setOrder, resetOrder } = feedSlice.actions;
export default feedSlice.reducer;