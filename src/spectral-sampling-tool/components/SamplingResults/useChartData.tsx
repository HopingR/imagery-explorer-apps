import { formatLandsatBandValuesAsLineChartDataItems } from '@landsat-explorer/components/SpectralTool/helper';
import {
    selectSelectedSpectralSamplingPointData,
    selectSpectralSamplingPointsData,
} from '@shared/store/SpectralSamplingTool/selectors';
import { averageMatrixColumns } from '@shared/utils/snippets/averageMatrixColumns';
// import { LineChartDataItem } from '@vannizhang/react-d3-charts/dist/LineChart/types';
import { LineGroupData } from '@vannizhang/react-d3-charts/dist/MultipleLinesChart/types';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * The custom hook that returns data to be used to render sampling results chart.
 * The chart should include:
 * - a line represent spectral profile of currently selected point
 * - a line represents the average spectral profile from all sampling point
 * @returns
 */
export const useChartData = () => {
    const samplingPointsData = useSelector(selectSpectralSamplingPointsData);

    const selectedSamplingPointsData = useSelector(
        selectSelectedSpectralSamplingPointData
    );

    const chartData = useMemo(() => {
        if (!samplingPointsData || !samplingPointsData.length) {
            return [];
        }

        // a matrix that contains band values from all sampling points
        const matrixOfBandValues = samplingPointsData
            .filter((d) => d.bandValues !== null)
            .map((d) => d.bandValues);

        // const output: LineGroupData[] = [];

        // if (
        //     selectedSamplingPointsData &&
        //     selectedSamplingPointsData.bandValues
        // ) {
        //     output.push({
        //         fill: 'var(--custom-light-blue-90)',
        //         key: 'selected',
        //         values: formatLandsatBandValuesAsLineChartDataItems(
        //             selectedSamplingPointsData.bandValues
        //         ),
        //         // dashPattern: '9 3', // use dash pattern to provide user a hint that the feature of interest is just a reference
        //     });
        // }

        // if (matrixOfBandValues.length >= 2) {
        //     const averageBandValues = averageMatrixColumns(matrixOfBandValues);

        //     output.push({
        //         fill: 'var(--custom-light-blue-70)',
        //         key: 'average',
        //         values: formatLandsatBandValuesAsLineChartDataItems(
        //             averageBandValues
        //         ),
        //         dashPattern: '9 3', // use dash pattern to provide user a hint that the feature of interest is just a reference
        //     });
        // }

        const output: LineGroupData[] = samplingPointsData
            .filter((d) => d.location && d.bandValues)
            .map((d, index) => {
                const values = formatLandsatBandValuesAsLineChartDataItems(
                    d.bandValues
                );

                return {
                    fill:
                        d.uniqueId === selectedSamplingPointsData?.uniqueId
                            ? 'var(--custom-light-blue-70)'
                            : 'var(--custom-light-blue-25)',
                    key: index.toString(),
                    values,
                    // dashPattern: '9 3', // use dash pattern to provide user a hint that the feature of interest is just a reference
                } as LineGroupData;
            });

        if (matrixOfBandValues.length >= 2) {
            const averageBandValues = averageMatrixColumns(matrixOfBandValues);

            output.push({
                fill: 'var(--custom-light-blue-90)',
                key: 'average',
                values: formatLandsatBandValuesAsLineChartDataItems(
                    averageBandValues
                ),
                dashPattern: '9 3', // use dash pattern to provide user a hint that the feature of interest is just a reference
            });
        }

        return output;
    }, [samplingPointsData, selectedSamplingPointsData]);

    return chartData;
};
