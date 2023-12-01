import {
    createSlice,
    // createSelector,
    PayloadAction,
    // createAsyncThunk
} from '@reduxjs/toolkit';
// import { getCurrentYear } from '@shared/utils/date-time/getCurrentYear';

/**
 * modes that the user can use to explore the imagery layer/scene
 */
export type AppMode =
    | 'dynamic' // view the mosaicked scenes
    | 'find a scene' // find and explorer a single scene
    | 'swipe' // compare two scenes side by side using Swipe widget
    | 'animate' // animate a list of scenes
    | 'analysis' // analyze the selected scene
    | 'spectral sampling'; // sampling data from a list of scenes

/**
 * the imagery explorer app supports these analysis tools
 */
export type AnalysisTool = 'mask' | 'trend' | 'spectral' | 'change';

/**
 * Swipe Mode allows user to compare Imagery scene the
 */
export type Side4SwipeMode = 'left' | 'right';

/**
 * Query Params and Rendering Options for a Imagery Scene (e.g. Landsat or Sentinel-2)
 */
export type QueryParams4ImageryScene = {
    /**
     * User selected acquisition date in format of `YYYY-MM-DD`.
     * This acquisition date will be used to select a Imagery Scene from `availableScenes` array.
     */
    acquisitionDate?: string;
    // /**
    //  * use selected cloud coverage threshold ranges from 0 to 1
    //  */
    // cloudCover?: number;
    /**
     * name of raster function that will be used to render the Imagery scene
     */
    rasterFunctionName?: string;
    /**
     * Object Id of selected Imagery scene.
     *
     * The Object ID of the selected Imagery scene will be automatically determined based on the changes in the `acquisitionDate` or `availableScenes`.
     * We will use the object ID of the Imagery scene from the `availableScenes` that was acquired on the `acquisitionDate`.
     * If no Imagery scene was acquired on that date, the object ID will be reset to null.
     */
    objectIdOfSelectedScene?: number;
    /**
     * unique id of the query params that is associated with this Imagery Scene
     */
    uniqueId?: string;
    /**
     * This property represents the acquisition year inherited from the previously selected item in the listOfQueryParams.
     *
     * Normally, the current year is used as the default acquisition year for new query parameters.
     * However, to enhance the user experience in animation mode, we retain the acquisition year from the previous frame.
     * This ensures a seamless workflow, allowing users to seamlessly continue their work on the same year as the prior animation frame.
     */
    inheritedAcquisitionYear?: number;
};

export type ImageryScenesState = {
    /**
     * mode to be used to visualize and compare the imagery scenes
     */
    mode?: AppMode;
    /**
     * tool to be used to analyze the imagery scene
     */
    tool: AnalysisTool;
    /**
     * query params for the Imagery scene to be used in "Find a Scene" mode; and
     * on the left side of the "Swipe" mode
     */
    queryParams4MainScene?: QueryParams4ImageryScene;
    /**
     * query params for the Imagery scene that will be used on the right side of the "swipe" mode
     */
    queryParams4SecondaryScene?: QueryParams4ImageryScene;
    /**
     * Selected side for Swipe Mode. This value determines which item in `queryParams4SwipeMode` should be updated.
     */
    selectedSide4SwipeMode?: Side4SwipeMode;
    /**
     * list of query parameters for Imagery scenes that will be used in Animation Mode, Spectral Sampling Mode and etc.
     */
    listOfQueryParams?: {
        byId?: {
            [key: string]: QueryParams4ImageryScene;
        };
        ids?: string[];
    };
    /**
     * Id of the selected item in `listOfQueryParams`. This Id helps identify which item in `listOfQueryParams` should be updated.
     */
    idOfSelectedItemInListOfQueryParams?: string;
    /**
     * user selected cloud coverage threshold, the value ranges from 0 to 1
     */
    cloudCover: number;
    // /**
    //  * list of Landat missions to be excluded
    //  */
    // missionsToBeExcluded: number[];
};

export const DefaultQueryParams4ImageryScene: QueryParams4ImageryScene = {
    acquisitionDate: '',
    rasterFunctionName: '',
    objectIdOfSelectedScene: null,
    uniqueId: null,
};

export const initialImagerySceneState: ImageryScenesState = {
    mode: 'dynamic',
    tool: 'mask',
    queryParams4MainScene: {
        ...DefaultQueryParams4ImageryScene,
    },
    queryParams4SecondaryScene: {
        ...DefaultQueryParams4ImageryScene,
    },
    selectedSide4SwipeMode: 'left',
    listOfQueryParams: {
        byId: {},
        ids: [],
    },
    idOfSelectedItemInListOfQueryParams: null,
    cloudCover: 0.5,
};

const slice = createSlice({
    name: 'ImageryScenes',
    initialState: initialImagerySceneState,
    reducers: {
        queryParams4MainSceneChanged: (
            state,
            action: PayloadAction<QueryParams4ImageryScene>
        ) => {
            state.queryParams4MainScene = action.payload;
        },
        queryParams4SecondarySceneChanged: (
            state,
            action: PayloadAction<QueryParams4ImageryScene>
        ) => {
            state.queryParams4SecondaryScene = action.payload;
        },
        queryParams4SceneInSwipeModeChanged: (
            state,
            action: PayloadAction<QueryParams4ImageryScene>
        ) => {
            const side = state.selectedSide4SwipeMode;

            if (side === 'left') {
                state.queryParams4MainScene = action.payload;
            } else {
                state.queryParams4SecondaryScene = action.payload;
            }
        },
        modeChanged: (state, action: PayloadAction<AppMode>) => {
            state.mode = action.payload;
        },
        selectedSide4SwipeModeChanged: (
            state,
            action: PayloadAction<Side4SwipeMode>
        ) => {
            state.selectedSide4SwipeMode = action.payload;
        },
        idOfSelectedItemInListOfQueryParamsChanged: (
            state,
            action: PayloadAction<string>
        ) => {
            state.idOfSelectedItemInListOfQueryParams = action.payload;
        },
        listOfQueryParamsChanged: (
            state,
            action: PayloadAction<QueryParams4ImageryScene[]>
        ) => {
            const byId = {};
            const ids = [];

            for (const item of action.payload) {
                const { uniqueId } = item;

                if (!uniqueId) {
                    continue;
                }

                ids.push(uniqueId);
                byId[uniqueId] = item;
            }

            state.listOfQueryParams = {
                byId,
                ids,
            };
        },
        queryParams4SelectedItemInListChanged: (
            state,
            action: PayloadAction<QueryParams4ImageryScene>
        ) => {
            const itemId = state.idOfSelectedItemInListOfQueryParams;
            state.listOfQueryParams.byId[itemId] = action.payload;
        },
        cloudCoverChanged: (state, action: PayloadAction<number>) => {
            state.cloudCover = action.payload;
        },
        activeAnalysisToolChanged: (
            state,
            action: PayloadAction<AnalysisTool>
        ) => {
            state.tool = action.payload;
        },
    },
});

const { reducer } = slice;

export const {
    // availableScenesUpdated,
    queryParams4MainSceneChanged,
    queryParams4SecondarySceneChanged,
    queryParams4SceneInSwipeModeChanged,
    modeChanged,
    selectedSide4SwipeModeChanged,
    idOfSelectedItemInListOfQueryParamsChanged,
    listOfQueryParamsChanged,
    queryParams4SelectedItemInListChanged,
    cloudCoverChanged,
    activeAnalysisToolChanged,
    // missionsToBeExcludedUpdated,
} = slice.actions;

export default reducer;