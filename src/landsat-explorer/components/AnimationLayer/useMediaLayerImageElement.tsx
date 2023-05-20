import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import IMapView from 'esri/views/MapView';
import IImageElement from 'esri/layers/support/ImageElement';
import IExtentAndRotationGeoreference from 'esri/layers/support/ExtentAndRotationGeoreference';
import { loadModules } from 'esri-loader';
import { exportImage } from '../../../landsat-explorer/components/LandsatLayer/exportImage';
import { selectAnimationStatus } from '../../../shared/store/UI/selectors';
import { selectQueryParams4ScenesInAnimateMode } from '../../../shared/store/Landsat/selectors';
import { AnimationStatus } from '../../../shared/store/UI/reducer';
import { QueryParams4LandsatScene } from '../../../shared/store/Landsat/reducer';

type Props = {
    mapView?: IMapView;
    animationStatus: AnimationStatus;
    queryParams4LandsatScenes: QueryParams4LandsatScene[];
};

const useMediaLayerImageElement = ({
    mapView,
    animationStatus,
    queryParams4LandsatScenes,
}: Props) => {
    const [imageElements, setImageElements] = useState<IImageElement[]>(null);

    const abortControllerRef = useRef<AbortController>();

    // const animationStatus = useSelector(selectAnimationStatus);

    const loadFrameData = async () => {
        if (!mapView) {
            return;
        }

        type Modules = [
            typeof IImageElement,
            typeof IExtentAndRotationGeoreference
        ];

        // use a new abort controller so the pending requests can be cancelled
        // if user quits animation mode before the responses are returned
        abortControllerRef.current = new AbortController();

        try {
            const [ImageElement, ExtentAndRotationGeoreference] =
                await (loadModules([
                    'esri/layers/support/ImageElement',
                    'esri/layers/support/ExtentAndRotationGeoreference',
                ]) as Promise<Modules>);

            const { extent, width, height } = mapView;

            const { xmin, ymin, xmax, ymax } = extent;

            // get images via export image request
            const requests = queryParams4LandsatScenes
                .filter(
                    (queryParam) => queryParam.objectIdOfSelectedScene !== null
                )
                .map((queryParam) => {
                    return exportImage({
                        extent,
                        width,
                        height,
                        objectId: queryParam.objectIdOfSelectedScene,
                        rasterFunctionName: queryParam.rasterFunctionName,
                        abortController: abortControllerRef.current,
                    });
                });

            const responses = await Promise.all(requests);

            // once responses are received, get array of image elements using the binary data returned from export image requests
            const imageElements = responses.map((blob: Blob) => {
                return new ImageElement({
                    image: URL.createObjectURL(blob),
                    georeference: new ExtentAndRotationGeoreference({
                        extent: {
                            spatialReference: {
                                wkid: 102100,
                            },
                            xmin,
                            ymin,
                            xmax,
                            ymax,
                        },
                    }),
                    opacity: 1,
                });
            });

            setImageElements(imageElements);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!animationStatus) {
            // call abort so all pending requests can be cancelled
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // call revokeObjectURL so these image elements can be freed from the memory
            if (imageElements) {
                for (const elem of imageElements) {
                    URL.revokeObjectURL(elem.image as string);
                }
            }

            setImageElements(null);
        } else if (animationStatus === 'loading') {
            loadFrameData();
        }
    }, [animationStatus]);

    return imageElements;
};

export default useMediaLayerImageElement;