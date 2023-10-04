import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../configureStore';

export const selectQueryLocation4SpectralProfileTool = createSelector(
    (state: RootState) => state.SpectralProfileTool.queryLocation,
    (queryLocation) => queryLocation
);

export const selectIsLoadingData4SpectralProfileTool = createSelector(
    (state: RootState) => state.SpectralProfileTool.isLoading,
    (isLoading) => isLoading
);

export const selectData4SpectralProfileTool = createSelector(
    (state: RootState) => state.SpectralProfileTool.spectralProfileData,
    (spectralProfileData) => spectralProfileData
);

export const selectError4SpectralProfileTool = createSelector(
    (state: RootState) => state.SpectralProfileTool.error,
    (error) => error
);
