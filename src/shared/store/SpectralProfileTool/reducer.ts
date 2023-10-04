import {
    createSlice,
    // createSelector,
    PayloadAction,
    // createAsyncThunk
} from '@reduxjs/toolkit';
import Point from 'esri/geometry/Point';

export type SpectralProfileFeatureOfInterest =
    | 'Cloud'
    | 'Snow/Ice'
    | 'Desert'
    | 'Dry Grass'
    | 'Concrete'
    | 'Lush Grass'
    | 'Urban'
    | 'Rock'
    | 'Forest'
    | 'Water'
    | '';

export type SpectralProfileToolState = {
    /**
     * point of interest that will be used to query the pixel values that will be used in spectral profile comparison
     */
    queryLocation: Point;
    /**
     * user selected feature of interest that will be used in spectral profile comparison
     */
    featureOfInterest: SpectralProfileFeatureOfInterest;
    /**
     * spectral prfile data/band values from the pixel of the query location
     */
    spectralProfileData: number[];
    /**
     * if true, it is in process of fetching spectral profile data
     */
    isLoading: boolean;
    /**
     * error message that was caught while fetch the spectral profile data
     */
    error: string;
};

export const initialSpectralProfileToolState: SpectralProfileToolState = {
    queryLocation: null,
    featureOfInterest: '',
    spectralProfileData: [],
    isLoading: false,
    error: null,
};

const slice = createSlice({
    name: 'SpectralProfileTool',
    initialState: initialSpectralProfileToolState,
    reducers: {
        queryLocationChanged: (state, action: PayloadAction<Point>) => {
            state.queryLocation = action.payload;
        },
        featureOfInterestChanged: (
            state,
            action: PayloadAction<SpectralProfileFeatureOfInterest>
        ) => {
            state.featureOfInterest = action.payload;
        },
        isLoadingToggled: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        spectralProfileDataUpdated: (
            state,
            action: PayloadAction<number[]>
        ) => {
            state.spectralProfileData = action.payload;
            state.error = null;
        },
        errorChanged: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
    },
});

const { reducer } = slice;

export const {
    queryLocationChanged,
    featureOfInterestChanged,
    isLoadingToggled,
    spectralProfileDataUpdated,
    errorChanged,
} = slice.actions;

export default reducer;