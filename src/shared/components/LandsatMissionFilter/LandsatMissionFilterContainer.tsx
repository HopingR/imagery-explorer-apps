import React from 'react';
import { LandsatMissionFilter } from './LandsatMissionFilter';
import { useSelector } from 'react-redux';
import { selectLandsatMissionsToBeExcluded } from '@shared/store/ImageryScene/selectors';
import { useDispatch } from 'react-redux';
import { missionsToBeExcludedUpdated } from '@shared/store/ImageryScene/reducer';

export const LandsatMissionFilterContainer = () => {
    const dispatch = useDispatch();

    const missionsToBeExcluded = useSelector(selectLandsatMissionsToBeExcluded);

    return (
        <LandsatMissionFilter
            missionsToBeExcluded={missionsToBeExcluded}
            missionsToBeExcludedOnChange={(updatedMissionsToBeExcluded) => {
                dispatch(
                    missionsToBeExcludedUpdated(updatedMissionsToBeExcluded)
                );
            }}
        />
    );
};
