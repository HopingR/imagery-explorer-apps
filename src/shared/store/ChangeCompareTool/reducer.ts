import {
    createSlice,
    // createSelector,
    PayloadAction,
    // createAsyncThunk
} from '@reduxjs/toolkit';
import { SpectralIndex } from '@typing/imagery-service';

export type ActiveScene4ChangeCompareTool = 'scene a' | 'scene b';

export type ChangeCompareToolState = {
    /**
     * use selected spectral index
     */
    spectralIndex: SpectralIndex;
    /**
     * indicator of the active scene for change compare tool
     */
    activeScene: ActiveScene4ChangeCompareTool;
    /**
     * if true, user is viewing change on the map
     */
    isViewingChange: boolean;
    /**
     * user selected pixel value range, the full range of pixel values of change compare layer should be between -2 and 2
     */
    selectedRange: number[];
};

export const initialChangeCompareToolState: ChangeCompareToolState = {
    spectralIndex: 'vegetation',
    activeScene: 'scene a',
    isViewingChange: false,
    selectedRange: [-2, 2],
};

const slice = createSlice({
    name: 'ChangeCompareTool',
    initialState: initialChangeCompareToolState,
    reducers: {
        spectralIndex4ChangeCompareToolChanged: (
            state,
            action: PayloadAction<SpectralIndex>
        ) => {
            state.spectralIndex = action.payload;
        },
        activeSceneChanged: (
            state,
            action: PayloadAction<ActiveScene4ChangeCompareTool>
        ) => {
            state.activeScene = action.payload;
        },
        isViewingChangeUpdated: (state, action: PayloadAction<boolean>) => {
            state.isViewingChange = action.payload;
        },
        selectedRangeUpdated: (state, action: PayloadAction<number[]>) => {
            state.selectedRange = action.payload;
        },
    },
});

const { reducer } = slice;

export const {
    spectralIndex4ChangeCompareToolChanged,
    activeSceneChanged,
    isViewingChangeUpdated,
    selectedRangeUpdated,
} = slice.actions;

export default reducer;
