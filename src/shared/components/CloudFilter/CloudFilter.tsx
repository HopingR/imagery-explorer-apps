import './style.css';
import React, { FC, useEffect, useRef } from 'react';
import ISlider from 'esri/widgets/Slider';
import { loadModules } from 'esri-loader';
import { CloudIcons } from './CloudIcons';
import classNames from 'classnames';

type Props = {
    /**
     * user selected cloud coverage threshold ranges from 0 to 1
     */
    cloudCoverage: number;
    /**
     * fires when user selects a new cloud coverage threshold
     * @param val new cloud coverage threshold
     * @returns
     */
    onChange: (val: number) => void;
};

/**
 * A slider component to select cloud coverage that will be used to find Landsat scenes
 * @param param0
 * @returns
 */
export const CloudFilter: FC<Props> = ({ cloudCoverage, onChange }) => {
    const containerRef = useRef<HTMLDivElement>();

    const sliderRef = useRef<ISlider>();

    const debounceDelay = useRef<NodeJS.Timeout>();

    const init = async () => {
        type Modules = [typeof ISlider];

        try {
            const [Slider] = await (loadModules([
                'esri/widgets/Slider',
            ]) as Promise<Modules>);

            sliderRef.current = new Slider({
                container: containerRef.current,
                min: 0, // no cloud cover at all
                max: 1, // 100% if cloud coverage
                steps: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                values: [0.5],
                snapOnClickEnabled: false,
                visibleElements: {
                    labels: false,
                    rangeLabels: false,
                },
                layout: 'vertical',
            });

            sliderRef.current.on('thumb-drag', (evt) => {
                // console.log(evt.value)
                clearTimeout(debounceDelay.current);

                debounceDelay.current = setTimeout(() => {
                    const value = +evt.value;
                    onChange(value);
                }, 500);
            });
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        init();

        return () => {
            sliderRef.current.destroy();
        };
    }, []);

    // Synchronize the position of the slider thumb with the current value of cloud coverage.
    // The Cloud Filter component controls the cloud coverage for different scenes (e.g., left/right scenes in swipe mode).
    // Each scene can have a different cloud coverage, and the slider component should always display the value of cloud coverage from the selected scene.
    useEffect(() => {
        if (!sliderRef.current) {
            return;
        }

        if (cloudCoverage === undefined) {
            return;
        }

        // Check if the current value of the slider is different from the cloud coverage value.
        // If so, update the slider's value to match the cloud coverage value of the selected scene.
        if (sliderRef.current.values[0] !== cloudCoverage) {
            sliderRef.current.viewModel.setValue(0, cloudCoverage);
        }
    }, [cloudCoverage]);

    return (
        <div
            className={classNames('mx-4', {
                'is-disabled': cloudCoverage === undefined,
            })}
        >
            <div className="text-center text-xs mb-4">
                <span>{Math.floor(cloudCoverage * 100)}% Cloud</span>
                <br />
                <span className="uppercase text-custom-light-blue-50">
                    Tolerance
                </span>
            </div>

            <div className="flex mx-2">
                <div
                    id="cloud-filter-container"
                    className="text-custom-light-blue h-cloud-slider-height w-6"
                    ref={containerRef}
                ></div>

                <CloudIcons />
            </div>
        </div>
    );
};