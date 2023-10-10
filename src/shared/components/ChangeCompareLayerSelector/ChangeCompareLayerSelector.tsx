import classNames from 'classnames';
import React, { FC } from 'react';
import { Button } from '../Button';
import { Dropdown } from '../Dropdown';
import { SpectralIndex } from '@typing/imagery-service';
import { ActiveScene4ChangeCompareTool } from '@shared/store/ChangeCompareTool/reducer';
import { QueryParams4ImageryScene } from '@shared/store/Landsat/reducer';

type Props = {
    activeScene: ActiveScene4ChangeCompareTool;
    /**
     * if true, user is viewing change on the map
     */
    isViewingChange: boolean;
    /**
     * if true, view change button shouldbe disabled
     */
    viewChangeButtonDisabled: boolean;
    /**
     * query params for selected Scene A
     */
    queryParams4SceneA: QueryParams4ImageryScene;
    /**
     * query params for selected Scene B
     */
    queryParams4SceneB: QueryParams4ImageryScene;
    /**
     * emits when user selects a new spectral index
     * @param val
     * @returns
     */
    selectedSpectralIndexOnChange: (val: SpectralIndex) => void;
    /**
     * emits when user clicks on view change button
     * @returns
     */
    viewChangeButtonOnClick: () => void;
    /**
     * emits when user selects an active scene
     * @returns
     */
    activeSceneOnChange: (val: ActiveScene4ChangeCompareTool) => void;
};

type ButtonTextLabelProps = {
    activeScene: ActiveScene4ChangeCompareTool;
    queryParams4ActiveScene: QueryParams4ImageryScene;
};

const ButtonTextLabel: FC<ButtonTextLabelProps> = ({
    activeScene,
    queryParams4ActiveScene,
}) => {
    if (!queryParams4ActiveScene || !queryParams4ActiveScene.acquisitionDate) {
        return (
            <div className="text-xs normal-case">
                <span>choose</span>
                <br />
                <span className="uppercase">{activeScene}</span>
            </div>
        );
    }

    return (
        <div className="text-xs normal-case">
            <span className="uppercase">{activeScene}</span>
            <br />
            <span className="">{queryParams4ActiveScene.acquisitionDate}</span>
        </div>
    );
};

export const ChangeCompareLayerSelector: FC<Props> = ({
    activeScene,
    isViewingChange,
    queryParams4SceneA,
    queryParams4SceneB,
    activeSceneOnChange,
    viewChangeButtonOnClick,
    selectedSpectralIndexOnChange,
    viewChangeButtonDisabled,
}) => {
    return (
        <div>
            <div className="mb-2">
                <Dropdown
                    data={[
                        {
                            label: 'VEGETATION',
                            value: 'vegetation' as SpectralIndex,
                            selected: false,
                        },
                    ]}
                    onChange={(val: SpectralIndex) => {
                        // acquisitionYearOnChange(+val);
                    }}
                />
            </div>

            <div className={classNames('relative mb-1')}>
                <Button
                    appearance={
                        activeScene === 'scene a' && isViewingChange === false
                            ? 'solid'
                            : 'transparent'
                    }
                    scale="s"
                    onClickHandler={() => {
                        activeSceneOnChange('scene a');
                    }}
                    decorativeIndicator={
                        activeScene === 'scene a' && isViewingChange === false
                            ? 'left'
                            : null
                    }
                >
                    {/* <div className="text-xs normal-case">
                        <span>choose</span>
                        <br />
                        <span className="uppercase">scene a</span>
                    </div> */}
                    <ButtonTextLabel
                        activeScene={activeScene}
                        queryParams4ActiveScene={queryParams4SceneA}
                    />
                </Button>
            </div>

            {/* <div className='text-center leading-none'>
                <span>-</span>
            </div> */}

            <div className={classNames('relative mb-1')}>
                <Button
                    appearance={
                        activeScene === 'scene b' && isViewingChange === false
                            ? 'solid'
                            : 'transparent'
                    }
                    scale="s"
                    onClickHandler={() => {
                        activeSceneOnChange('scene b');
                    }}
                    decorativeIndicator={
                        activeScene === 'scene b' && isViewingChange === false
                            ? 'left'
                            : null
                    }
                >
                    {/* <div className="text-xs normal-case">
                        <span>choose</span>
                        <br />
                        <span className="uppercase">scene b</span>
                    </div> */}
                    <ButtonTextLabel
                        activeScene={activeScene}
                        queryParams4ActiveScene={queryParams4SceneB}
                    />
                </Button>
            </div>

            {/* <div className='text-center leading-none'>
                <span>=</span>
            </div> */}

            <div
                className={classNames('relative', {
                    'is-disabled': viewChangeButtonDisabled,
                })}
            >
                <Button
                    appearance={isViewingChange ? 'solid' : 'transparent'}
                    scale="s"
                    onClickHandler={viewChangeButtonOnClick}
                    decorativeIndicator={
                        isViewingChange === true ? 'left' : null
                    }
                >
                    <div className="text-xs normal-case">
                        <span className="uppercase">view change</span>
                        <br />
                        <span>Scene A - Scene B</span>
                    </div>
                </Button>
            </div>
        </div>
    );
};