import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '..';

interface UiState {
  permissionDeniedOpen: boolean;
}

const initialState: UiState = {
  permissionDeniedOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showPermissionDenied: (state) => {
      state.permissionDeniedOpen = true;
    },
    hidePermissionDenied: (state) => {
      state.permissionDeniedOpen = false;
    },
  },
});

export const { showPermissionDenied, hidePermissionDenied } = uiSlice.actions;

export const selectPermissionDeniedOpen = (state: RootState) => state.ui.permissionDeniedOpen;

export default uiSlice.reducer;
