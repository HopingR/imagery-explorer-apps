import { FIELD_NAMES } from './config';
import { LANDSAT_LEVEL_2_SERVICE_URL } from '../../config';
import { IFeature } from '@esri/arcgis-rest-feature-service';
import { format } from 'date-fns';

type GetLandsatScenesParams = {
    /**
     * year of acquisition
     */
    year: number;
    /**
     * longitude and latitude (e.g. [-105, 40])
     */
    mapPoint: number[];
    /**
     * percent of cloud coverage that is ranged between 0 to 1
     */
    cloudCover: number;
    /**
     * month of acquisition
     */
    month?: number;
};

export type LandsatScene = {
    objectId: number;
    /**
     * acquisitionDate as a string in ISO format (YYYY-MM-DD).
     */
    formattedAcquisitionDate: string;
    /**
     * acquisitionDate in unix timestamp
     */
    acquisitionDate: number;
    name: string;
    cloudCover: number;
    best: number;
    /**
     * if true, this scene was acquired during a cloudy day
     */
    isCloudy: boolean;
};

const { OBJECTID, ACQUISITION_DATE, CLOUD_COVER, CATEGORY, NAME, BEST } =
    FIELD_NAMES;

/**
 * any scene with cloud coverage beyond this will be considered as cloudy day
 */
const CLOUDY_THRESHOLD = 0.25;

/**
 * Formats the features from Landsat-level-2 service and returns an array of LandsatScene objects.
 * @param features - An array of IFeature objects from Landsat-level-2 service.
 * @returns An array of LandsatScene objects containing the acquisition date, formatted acquisition date, name, cloud cover, and best attributes.
 */
const getFormattedLandsatScenes = (features: IFeature[]): LandsatScene[] => {
    return features.map((feature) => {
        const { attributes } = feature;

        const acquisitionDate = attributes[ACQUISITION_DATE];

        /**
         * formatted aquisition date should be like `2023-05-01`
         */
        const formattedAcquisitionDate = format(acquisitionDate, 'yyyy-MM-dd');

        return {
            objectId: attributes[OBJECTID],
            acquisitionDate,
            formattedAcquisitionDate,
            name: attributes[NAME],
            cloudCover: attributes[CLOUD_COVER],
            best: attributes[BEST],
            isCloudy: attributes[CLOUD_COVER] > CLOUDY_THRESHOLD,
        } as LandsatScene;
    });
};

/**
 * Query the Landsat-level-2 imagery service to find a list of scenes for available Landsat data that
 * intersect with the input map point or map extent and were acquired during the input year and month.
 *
 * @param {number} params.year - The year of the desired acquisition dates.
 * @param {number} [params.cloudCover=0.1] - The maximum cloud cover percentage of the desired Landsat data.
 * @param {Object} params.mapPoint - The point geometry to query.
 * @param {number} params.month - The month of the desired acquisition dates.
 *
 * @returns {Promise} A promise that resolves to an array of LandsatAcquisitionDate objects.
 *
 */
export const getLandsatScenes = async ({
    year,
    cloudCover,
    mapPoint,
    month,
}: GetLandsatScenesParams): Promise<LandsatScene[]> => {
    const whereClauses = [
        `(${CATEGORY} = 1)`,
        `(${CLOUD_COVER} <= ${cloudCover})`,
        `(${ACQUISITION_DATE} BETWEEN timestamp '${year}-01-01 00:00:00' AND timestamp '${year}-12-31 23:59:59')`,
    ];

    const [longitude, latitude] = mapPoint;

    const geometry = JSON.stringify({
        spatialReference: {
            wkid: 4326,
        },
        x: longitude,
        y: latitude,
    });

    const params = new URLSearchParams({
        f: 'json',
        spatialRel: 'esriSpatialRelIntersects',
        // geometryType: 'esriGeometryEnvelope',
        geometryType: 'esriGeometryPoint',
        // inSR: '102100',
        outFields: [ACQUISITION_DATE, CLOUD_COVER, NAME, BEST].join(','),
        orderByFields: ACQUISITION_DATE,
        resultOffset: '0',
        returnGeometry: 'false',
        resultRecordCount: '1000',
        geometry,
        where: whereClauses.join(` AND `),
    });

    const res = await fetch(
        `${LANDSAT_LEVEL_2_SERVICE_URL}/query?${params.toString()}`
    );

    if (!res.ok) {
        throw new Error('failed to query Landsat-2 service');
    }

    const data = await res.json();

    if (data.error) {
        throw data.error;
    }

    return getFormattedLandsatScenes(data?.features || []);
};
