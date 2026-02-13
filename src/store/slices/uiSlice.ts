import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '..';

interface UiState {
  permissionDeniedOpen: boolean;
  sidebarWidth: number;
}

const initialState: UiState = {
  permissionDeniedOpen: false,
  sidebarWidth: 280,
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
    setSidebarWidth: (state, action) => {
      state.sidebarWidth = action.payload;
    },
  },
});

export const { showPermissionDenied, hidePermissionDenied, setSidebarWidth } = uiSlice.actions;

export const selectPermissionDeniedOpen = (state: RootState) => state.ui.permissionDeniedOpen;
export const selectSidebarWidth = (state: RootState) => state.ui.sidebarWidth;

export default uiSlice.reducer;
