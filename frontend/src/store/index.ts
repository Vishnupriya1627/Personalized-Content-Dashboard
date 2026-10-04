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
import feedReducer from '@/features/feed/feedSlice';
import searchReducer from '@/features/search/searchSlice';
import liveReducer from '@/features/live/liveSlice';
import readReducer from '@/features/read/readSlice';
import { contentApi } from '@/features/api/contentApi';

import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';

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
  read: readReducer,
  [contentApi.reducerPath]: contentApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer<RootState>(
  {
    key: 'root',
    storage,
    whitelist: ['preferences', 'favorites', 'feed', 'read'],
    stateReconciler: autoMergeLevel2,
  },
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }).concat(contentApi.middleware),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;