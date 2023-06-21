import {
    createSlice,
    // createSelector,
    PayloadAction,
    // createAsyncThunk
} from '@reduxjs/toolkit';
import { MAP_CENTER, MAP_ZOOM, WEB_MAP_ID } from '../../constants/map';

// import { RootState, StoreDispatch, StoreGetState } from '../configureStore';

export type MapState = {
    /**
     * item id of the web map
     */
    webmapId: string;
    /**
     * center of map [longitude, latitude]
     */
    center: number[];
    /**
     * zoom level
     */
    zoom?: number;
};

export const initialMapState: MapState = {
    webmapId: WEB_MAP_ID, // Topographic
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
};

const slice = createSlice({
    name: 'Map',
    initialState: initialMapState,
    reducers: {
        webmapIdChanged: (state, action: PayloadAction<string>) => {
            state.webmapId = action.payload;
        },
        centerChanged: (state, action: PayloadAction<number[]>) => {
            state.center = action.payload;
        },
        zoomChanged: (state, action: PayloadAction<number>) => {
            state.zoom = action.payload;
        },
    },
});

const { reducer } = slice;

export const { webmapIdChanged, centerChanged, zoomChanged } = slice.actions;

export default reducer;
