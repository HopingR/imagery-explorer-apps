import {
    createSlice,
    // createSelector,
    PayloadAction,
    // createAsyncThunk
} from '@reduxjs/toolkit';

export type AnalysisTool = 'mask' | 'profile';

/**
 * Spectral indices are combinations of the pixel values from two or more spectral bands in a multispectral image.
 * Spectral indices are designed to highlight pixels showing the relative abundance or lack of a land-cover type of interest in an image.
 */
export type SpectralIndex = 'water' | 'vegetation' | 'moisture';

export type MaskOptions = {
    selectedRange: number[];
    /**
     * color array in RGB format
     */
    color: number[];
};

type QueryLocation = {
    longitude: number;
    latitude: number;
};

export type AnalysisState = {
    /**
     * active analysis tool
     */
    tool: AnalysisTool;
    /**
     * user selected spectral index to be used in the mask tool
     */
    spectralIndex: SpectralIndex;
    /**
     * maks tool options by spectral index name
     */
    maskOptionsBySpectralIndex: Record<SpectralIndex, MaskOptions>;
    /**
     * opacity of the mask layer
     */
    maskLayerOpacity: number;
    /**
     * if true, mask layer should be used to clip the landsat scene
     */
    shouldClipMaskLayer: boolean;
    /**
     * Query Location for Profile tool
     */
    queryLocation4ProfileTool: QueryLocation;
};

export const initialAnalysisState: AnalysisState = {
    tool: 'mask',
    spectralIndex: 'water',
    maskLayerOpacity: 1,
    shouldClipMaskLayer: false,
    maskOptionsBySpectralIndex: {
        moisture: {
            selectedRange: [0, 1],
            color: [89, 255, 252],
        },
        vegetation: {
            selectedRange: [0, 1],
            color: [115, 255, 132],
        },
        water: {
            selectedRange: [0, 1],
            color: [89, 214, 255],
        },
    },
    queryLocation4ProfileTool: null,
};

const slice = createSlice({
    name: 'Analysis',
    initialState: initialAnalysisState,
    reducers: {
        activeAnalysisToolChanged: (
            state,
            action: PayloadAction<AnalysisTool>
        ) => {
            state.tool = action.payload;
        },
        spectralIndexChanged: (state, action: PayloadAction<SpectralIndex>) => {
            state.spectralIndex = action.payload;
        },
        maskOptionsChanged: (state, action: PayloadAction<MaskOptions>) => {
            const spectralIndex = state.spectralIndex;
            state.maskOptionsBySpectralIndex[spectralIndex] = action.payload;
        },
        maskLayerOpacityChanged: (state, action: PayloadAction<number>) => {
            state.maskLayerOpacity = action.payload;
        },
        shouldClipMaskLayerToggled: (state, action: PayloadAction<boolean>) => {
            state.shouldClipMaskLayer = !state.shouldClipMaskLayer;
        },
        queryLocation4ProfileToolChanged: (
            state,
            action: PayloadAction<QueryLocation>
        ) => {
            state.queryLocation4ProfileTool = action.payload;
        },
    },
});

const { reducer } = slice;

export const {
    activeAnalysisToolChanged,
    spectralIndexChanged,
    maskOptionsChanged,
    maskLayerOpacityChanged,
    shouldClipMaskLayerToggled,
    queryLocation4ProfileToolChanged,
} = slice.actions;

export default reducer;
