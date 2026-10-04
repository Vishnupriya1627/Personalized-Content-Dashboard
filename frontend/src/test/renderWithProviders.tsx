import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import preferencesReducer from '@/features/preferences/preferencesSlice';
import favoritesReducer from '@/features/favorites/favoritesSlice';
import feedReducer from '@/features/feed/feedSlice';
import searchReducer from '@/features/search/searchSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  preferences: preferencesReducer,
  favorites: favoritesReducer,
  feed: feedReducer,
  search: searchReducer,
});

export type TestState = ReturnType<typeof rootReducer>;

export function renderWithProviders(ui: ReactElement, preloadedState: Partial<TestState> = {}) {
  const store = configureStore({ reducer: rootReducer, preloadedState });
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>
    ),
  };
}