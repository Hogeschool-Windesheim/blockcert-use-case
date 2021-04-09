import * as moment from 'moment';
import {State} from './state';

const STATES = new Set([State.ISSUED, State.REVOKED, State.EXPIRED]);

export class Utility {

    /**
     * Checks the state of a certificate, throws an error if state is invalid.
     * @param stateStr the state to be checked
     */
    public static checkStateValidity(stateStr: string): void {
        const state = State[stateStr];
        if (!STATES.has(state)) {
            throw new Error('Invalid state');
        }
    }

    /**
     * Function which translate a string representation of a date, into a Date type
     * @param dateString the string representation of date
     * @returns Date corresponding to @param dateString
     */
    public static stringToDate(dateString: string): Date {
        try {
            return moment(dateString, 'MM-DD-YYYY').toDate();
        } catch {
            throw new Error('Invalid date format');
        }
    }
}
