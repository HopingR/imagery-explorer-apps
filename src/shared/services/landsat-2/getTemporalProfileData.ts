import { Point } from 'esri/geometry';
import { getLandsatScenes } from './getLandsatScenes';
import { TemporalProfileData, LandsatScene } from '@typing/imagery-service';
import { LANDSAT_LEVEL_2_SERVICE_URL } from './config';
import { getSamples, LandsatSampleData } from './getSamples';
import { checkClearFlagInQABand } from './helpers';

type GetProfileDataOptions = {
    queryLocation: Point;
    acquisitionMonth: number;
    samplingTemporalResolution: number;
    abortController: AbortController;
};

// let controller: AbortController = null;

/**
 * Splits an array of object IDs into separate groups, each containing a maximum of 20 object IDs.
 * This is useful when making requests with an upper limit on the number of object IDs.
 *
 * @param {number[]} objectIds - An array of object IDs to be split into groups.
 * @returns {number[][]} An array of arrays, each representing a separate group of object IDs.
 */
const splitObjectIdsToSeparateGroups = (objectIds: number[]): number[][] => {
    // Define the maximum number of items per group
    const ItemsPerGroup = 20;

    // number of groups needed based on the total number of object IDs
    const numOfGroups = Math.ceil(objectIds.length / ItemsPerGroup);

    // Initialize an array of empty arrays to hold the separate groups of object IDs
    const objectsIdsInSeparateGroups: number[][] = [
        ...new Array(numOfGroups),
    ].map(() => []);

    for (let i = 0; i < numOfGroups; i++) {
        // Calculate the start and end indices for the current group
        const startIdx = i * ItemsPerGroup;
        const endIdx = Math.min(startIdx + ItemsPerGroup, objectIds.length);
        objectsIdsInSeparateGroups[i] = objectIds.slice(startIdx, endIdx);
    }

    return objectsIdsInSeparateGroups;
};

/**
 * Retrieves data for the Temporal Profile Tool based on specific criteria.
 *
 * This function queries Landsat scenes at the provided query location that were acquired during the given acquisition month.
 * It refines the scenes to retain only the one with the least cloud coverage within a specified month.
 * Subsequently, it sends requests to fetch pixel values at the input location for each selected Landsat scene.
 * Finally, it returns an array of TemporalProfileData formatted from the fetched samples.
 *
 * @param param0
 * @returns An array of TemporalProfileData representing pixel values sampled at input query location over time.
 */
export const getTemporalProfileData = async ({
    queryLocation,
    acquisitionMonth,
    samplingTemporalResolution,
    abortController,
}: GetProfileDataOptions): Promise<TemporalProfileData[]> => {
    const { x, y } = queryLocation;

    // query Landsat scenes based on input location and acquisition month.
    const landsatScenes = await getLandsatScenes({
        mapPoint: [x, y],
        acquisitionMonth,
        abortController,
    });

    if (!landsatScenes.length) {
        return [];
    }

    // refine Landsat scenes based on cloud coverage and temporal resolution.
    const landsatScenesToSample = getLandsatScenesToSample(
        landsatScenes,
        samplingTemporalResolution
    );

    // extract object IDs from refined Landsat scenes.
    const objectIds = landsatScenesToSample.map((d) => d.objectId);

    // divide object IDs into separate groups for parallel fetching.
    const objectsIdsInSeparateGroups =
        splitObjectIdsToSeparateGroups(objectIds);
    // console.log(objectsIdsInSeparateGroups)

    // fetch samples data in parallel for each group of object IDs.
    const samplesDataInSeparateGroups: LandsatSampleData[][] =
        await Promise.all(
            objectsIdsInSeparateGroups.map((oids) =>
                getSamples(queryLocation, oids, abortController)
            )
        );

    // combine samples data from different groups into a single array.
    const samplesData: LandsatSampleData[] = samplesDataInSeparateGroups.reduce(
        (combined, subsetOfSamplesData) => {
            return [...combined, ...subsetOfSamplesData];
        },
        []
    );
    // console.log(samplesData);

    const temporalProfileData = formatAsTemporalProfileData(
        samplesData,
        landsatScenesToSample
    );

    // exclude pixels with poor quality using the QA Band.
    const temporalProfileDataWithBadPixelsExcluded = temporalProfileData.filter(
        (d) => {
            const { values } = d;
            return checkClearFlagInQABand(values);
        }
    );

    return temporalProfileDataWithBadPixelsExcluded;
};

/**
 * Create Temporal Profiles Data by combining samples data and imagery scene data
 * @param samples
 * @param scenes
 * @returns
 */
const formatAsTemporalProfileData = (
    samples: LandsatSampleData[],
    scenes: LandsatScene[]
): TemporalProfileData[] => {
    const output: TemporalProfileData[] = [];

    const sceneByObjectId = new Map<number, LandsatScene>();

    for (const scene of scenes) {
        sceneByObjectId.set(scene.objectId, scene);
    }

    for (let i = 0; i < samples.length; i++) {
        const sampleData = samples[i];
        const { rasterId, values } = sampleData;

        if (sceneByObjectId.has(rasterId) === false) {
            continue;
        }

        // const scene = scenes[i];
        const {
            objectId,
            acquisitionDate,
            acquisitionMonth,
            acquisitionYear,
            formattedAcquisitionDate,
        } = sceneByObjectId.get(rasterId);

        output.push({
            objectId,
            acquisitionDate,
            acquisitionMonth,
            acquisitionYear,
            formattedAcquisitionDate,
            values,
            // values: sampleData.value.split(' ').map((d) => +d),
        });
    }

    return output;
};

/**
 * The input Landsat Scenes contain multiple Scenes that were acquired from the same month and year.
 * This helper function filters the input Landsat Scenes and only keep one Landsat Scene for each month,
 * the selected scenes for a specific month is the one that with least cloud coverage for that month
 *
 * @param scenes landsat scenes
 * @param samplingTemporalResolution landsat scenes
 * @returns LandsatScene[]
 */
const getLandsatScenesToSample = (
    scenes: LandsatScene[],
    samplingTemporalResolution: number
): LandsatScene[] => {
    if (!scenes.length) {
        return [];
    }

    const candidates: LandsatScene[] = [scenes[0]];

    for (let i = 1; i < scenes.length; i++) {
        const prevScene = candidates[candidates.length - 1];

        const currentScene = scenes[i];

        if (
            currentScene.acquisitionYear - prevScene.acquisitionYear <
            samplingTemporalResolution
        ) {
            continue;
        }

        // add current scene to candidates if it was acquired from a different year or month
        if (
            prevScene?.acquisitionYear !== currentScene.acquisitionYear ||
            prevScene?.acquisitionMonth !== currentScene.acquisitionMonth
        ) {
            candidates.push(currentScene);
            continue;
        }

        // if two landsat scenes that were acquired within the same year and month
        // we should keep the one with smaller cloud coverage
        if (currentScene.cloudCover < prevScene.cloudCover) {
            candidates.pop();
            candidates.push(currentScene);
        }
    }

    return candidates;
};
