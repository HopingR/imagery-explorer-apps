import { AnalysisToolHeader } from '@shared/components/AnalysisToolHeader';
import {
    selectActiveAnalysisTool,
    selectQueryParams4SceneInSelectedMode,
} from '@shared/store/Landsat/selectors';
import {
    selectData4SpectralProfileTool,
    selectError4SpectralProfileTool,
    selectIsLoadingData4SpectralProfileTool,
    selectQueryLocation4SpectralProfileTool,
} from '@shared/store/SpectralProfileTool/selectors';
import { updateSpectralProfileData } from '@shared/store/SpectralProfileTool/thunks';
import classNames from 'classnames';
import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { SpectralProfileChart } from './SpectralProfileChart';

export const SpectralToolContainer = () => {
    const dispatch = useDispatch();

    const tool = useSelector(selectActiveAnalysisTool);

    const { objectIdOfSelectedScene } =
        useSelector(selectQueryParams4SceneInSelectedMode) || {};

    const queryLocation = useSelector(selectQueryLocation4SpectralProfileTool);

    const isLoading = useSelector(selectIsLoadingData4SpectralProfileTool);

    const spectralProfileData = useSelector(selectData4SpectralProfileTool);

    const error4SpectralProfileTool = useSelector(
        selectError4SpectralProfileTool
    );

    const spectralProfileToolMessage = useMemo(() => {
        if (isLoading) {
            return 'fetching spectral profile data';
        }

        if (error4SpectralProfileTool) {
            return error4SpectralProfileTool;
        }

        if (!spectralProfileData.length) {
            return 'Select an acquisition date in Calendar and click on map to get the spectral profile';
        }

        return '';
    }, [isLoading, error4SpectralProfileTool, spectralProfileData]);

    // triggers when user selects a new query location
    useEffect(() => {
        (async () => {
            if (tool !== 'spectral') {
                return;
            }

            try {
                await dispatch(updateSpectralProfileData());
            } catch (err) {
                console.log(err);
            }
        })();
    }, [queryLocation, objectIdOfSelectedScene]);

    if (tool !== 'spectral') {
        return null;
    }

    return (
        <div
            className={classNames('w-analysis-tool-container-width h-full', {
                'is-disabled': !objectIdOfSelectedScene || !queryLocation,
            })}
        >
            <AnalysisToolHeader
                title="Spectral"
                dropdownListOptions={[
                    {
                        value: 'water',
                        label: 'WATER INDEX',
                    },
                ]}
                selectedValue={null}
                tooltipText={''}
                dropdownMenuSelectedItemOnChange={(val) => {
                    // dispatch(spectralIndex4MaskToolChanged(val));
                }}
            />

            <div className="w-full h-[120px] my-2">
                {spectralProfileToolMessage ? (
                    <div className="h-full w-full flex items-center justify-center text-center">
                        {isLoading && <calcite-loader inline />}
                        <p className="text-sm opacity-80">
                            {spectralProfileToolMessage}
                        </p>
                    </div>
                ) : (
                    <SpectralProfileChart data={spectralProfileData} />
                )}
            </div>
        </div>
    );
};