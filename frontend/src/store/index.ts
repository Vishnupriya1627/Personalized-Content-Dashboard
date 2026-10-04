import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import authReducer from '@/features/auth/authSlice';
import preferencesReducer from '@/features/preferences/preferencesSlice';
import favoritesReducer from '@/features/favorites/favoritesSlice';
import { contentApi } from '@/features/api/contentApi';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import feedReducer from '@/features/feed/feedSlice';
import searchReducer from '@/features/search/searchSlice';
import liveReducer from '@/features/live/liveSlice';

const storage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const rootReducer = combineReducers({
  auth: authReducer,
  preferences: preferencesReducer,
  favorites: favoritesReducer,
  feed: feedReducer,
  search: searchReducer,
  live: liveReducer, 
  [contentApi.reducerPath]: contentApi.reducer,
});

const persistedReducer = persistReducer(
  {
    key: 'root',
    storage,
    whitelist: ['preferences', 'favorites', 'feed'],
    stateReconciler: autoMergeLevel2,
  },
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(contentApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;