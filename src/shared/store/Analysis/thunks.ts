import { RootState, StoreDispatch, StoreGetState } from '../configureStore';
import { MaskOptions, maskOptionsChanged } from './reducer';
import { selectMaskOptions } from './selectors';

/**
 * update selected range for the active mask method
 * @param index index of value, 0 indicates min value of the range and 1 indicates max value of the range
 * @param value
 * @returns void
 */
export const updateSelectedRange =
    (index: number, value: number) =>
    async (dispatch: StoreDispatch, getState: StoreGetState) => {
        const maskOptions = selectMaskOptions(getState());

        const selectedRange = [...maskOptions.selectedRange];

        selectedRange[index] = value;

        const updatedMaskOptions = {
            ...maskOptions,
            selectedRange,
        };

        dispatch(maskOptionsChanged(updatedMaskOptions));
    };

export const updateMaskColor =
    (color: number[]) =>
    async (dispatch: StoreDispatch, getState: StoreGetState) => {
        const maskOptions = selectMaskOptions(getState());

        const updatedMaskOptions = {
            ...maskOptions,
            color,
        };

        dispatch(maskOptionsChanged(updatedMaskOptions));
    };