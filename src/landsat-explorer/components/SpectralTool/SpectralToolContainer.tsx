import { AnalysisToolHeader } from '@shared/components/AnalysisToolHeader';
import {
    selectActiveAnalysisTool,
    selectQueryParams4SceneInSelectedMode,
} from '@shared/store/ImageryScene/selectors';
import {
    selectData4SpectralProfileTool,
    selectError4SpectralProfileTool,
    selectIsLoadingData4SpectralProfileTool,
    selectQueryLocation4SpectralProfileTool,
} from '@shared/store/SpectralProfileTool/selectors';
import { updateSpectralProfileData } from '@shared/store/SpectralProfileTool/thunks';
import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { SpectralProfileChart } from './SpectralProfileChart';
import { findMostSimilarFeatureOfInterest } from './helper';
import { SpectralProfileChartLegend } from './SpectralProfileChartLegend';
import { FeatureOfInterests, SpectralProfileFeatureOfInterest } from './config';
import { useSpectralProfileChartData } from './useSpectralProfileChartData';

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

    const [selectedFeatureOfInterest, setSelectedFeatureOfInterest] =
        useState<SpectralProfileFeatureOfInterest>();

    const chartData = useSpectralProfileChartData(
        spectralProfileData,
        selectedFeatureOfInterest
    );

    const spectralProfileToolMessage = useMemo(() => {
        if (isLoading) {
            return 'fetching spectral profile data';
        }

        if (error4SpectralProfileTool) {
            return error4SpectralProfileTool;
        }

        if (!spectralProfileData.length) {
            return 'Select a scene and click on the map to identify the spectral profile for the point of interest.';
        }

        return '';
    }, [isLoading, error4SpectralProfileTool, spectralProfileData]);

    const shouldShowChart = useMemo(() => {
        if (isLoading || error4SpectralProfileTool) {
            return false;
        }

        if (!spectralProfileData || !spectralProfileData.length) {
            return false;
        }

        return true;
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

    useEffect(() => {
        if (!spectralProfileData || !spectralProfileData.length) {
            return;
        }

        const mostSimilarFeatureOfInterest =
            findMostSimilarFeatureOfInterest(spectralProfileData);

        setSelectedFeatureOfInterest(mostSimilarFeatureOfInterest);
    }, [spectralProfileData]);

    if (tool !== 'spectral') {
        return null;
    }

    return (
        <div
            className={classNames(
                'w-full h-full'
                // {
                //     'is-disabled': !objectIdOfSelectedScene || !queryLocation,
                // }
            )}
        >
            <AnalysisToolHeader
                title="Profile"
                dropdownListOptions={FeatureOfInterests.map(
                    (featureOfInterest) => {
                        return {
                            value: featureOfInterest,
                        };
                    }
                )}
                selectedValue={selectedFeatureOfInterest}
                tooltipText={`The spectral reflectance of different materials on the Earth's surface is variable. Spectral profiles can be used to identify different land cover types.`}
                dropdownMenuSelectedItemOnChange={(val) => {
                    setSelectedFeatureOfInterest(
                        val as SpectralProfileFeatureOfInterest
                    );
                }}
            />

            {shouldShowChart && (
                <>
                    <div className="w-full h-[120px] my-2">
                        <SpectralProfileChart
                            // featureOfInterest={selectedFeatureOfInterest}
                            // data={spectralProfileData}
                            chartData={chartData}
                        />
                    </div>

                    <SpectralProfileChartLegend
                        featureOfInterest={selectedFeatureOfInterest}
                    />
                </>
            )}

            {spectralProfileToolMessage && (
                <div className="w-full mt-10 flex justify-center text-center">
                    {isLoading && <calcite-loader inline />}
                    <p className="text-sm opacity-50">
                        {spectralProfileToolMessage}
                    </p>
                </div>
            )}
        </div>
    );
};
