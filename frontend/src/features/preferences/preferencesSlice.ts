import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

interface PreferencesState {
  darkMode: boolean;
  categories: string[];
}

const initialState: PreferencesState = {
  darkMode: getInitialDark(),
  categories: ['technology', 'sports'],
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    setCategories(state, action: PayloadAction<string[]>) {
      state.categories = action.payload;
    },
  },
});

export const { toggleDarkMode, setCategories } = preferencesSlice.actions;
export default preferencesSlice.reducer;