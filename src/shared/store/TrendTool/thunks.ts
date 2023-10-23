import { Point } from 'esri/geometry';
import { RootState, StoreDispatch, StoreGetState } from '../configureStore';
import {
    trendToolDataUpdated,
    queryLocation4TrendToolChanged,
    trendToolIsLoadingChanged,
} from './reducer';
import {
    selectAcquisitionMonth4TrendTool,
    selectAcquisitionYear4TrendTool,
    selectQueryLocation4TrendTool,
    selectTrendToolOption,
} from './selectors';
import { getDataForTrendTool } from '@shared/services/landsat-level-2/getTemporalProfileData';
import {
    selectActiveAnalysisTool,
    selectLandsatMissionsToBeExcluded,
} from '../Landsat/selectors';
import { TemporalProfileData } from '@typing/imagery-service';

export const updateQueryLocation4TrendTool =
    (point: Point) =>
    async (dispatch: StoreDispatch, getState: StoreGetState) => {
        const tool = selectActiveAnalysisTool(getState());

        if (tool !== 'trend') {
            return;
        }

        dispatch(queryLocation4TrendToolChanged(point));
    };

let abortController: AbortController = null;

export const updateTrendToolData =
    () => async (dispatch: StoreDispatch, getState: StoreGetState) => {
        const rootState = getState();

        const queryLocation = selectQueryLocation4TrendTool(rootState);

        const acquisitionMonth = selectAcquisitionMonth4TrendTool(rootState);

        const acquisitionYear = selectAcquisitionYear4TrendTool(rootState);

        const trendToolOption = selectTrendToolOption(rootState);

        const missionsToBeExcluded =
            selectLandsatMissionsToBeExcluded(rootState);

        if (!queryLocation) {
            dispatch(trendToolDataUpdated([]));
            return;
        }

        if (abortController) {
            abortController.abort();
        }

        abortController = new AbortController();

        dispatch(trendToolIsLoadingChanged(true));

        try {
            const data: TemporalProfileData[] = await getDataForTrendTool({
                queryLocation,
                acquisitionMonth:
                    trendToolOption === 'year-to-year'
                        ? acquisitionMonth
                        : null,
                acquisitionYear:
                    trendToolOption === 'month-to-month'
                        ? acquisitionYear
                        : null,
                // samplingTemporalResolution,
                missionsToBeExcluded,
                abortController,
            });

            dispatch(trendToolDataUpdated(data));
        } catch (err) {
            console.log('failed to fetch temporal profile data');
        }

        dispatch(trendToolIsLoadingChanged(false));
    };
