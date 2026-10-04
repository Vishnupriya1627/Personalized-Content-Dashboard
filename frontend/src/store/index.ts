import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import preferencesReducer from '@/features/preferences/preferencesSlice';
import { contentApi } from '@/features/api/contentApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    preferences: preferencesReducer,
    [contentApi.reducerPath]: contentApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(contentApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;