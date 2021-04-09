import {Utility} from '../src/utility';

import * as parametrize from 'js-parametrize';

describe('Test basic reject behavior of utility', () => {

    it('Test invalid state format, should not occur in deployment', () => {
        expect(() => Utility.checkStateValidity('NOT A VALID State')).toThrow('Invalid state');
    });

    it('Test invalid date format, should not occur in deployment', () => {
        expect(() => Utility.stringToDate('notADate'))
            .toThrow('Invalid date format');
    });
});

describe('Test basic accept behavior of utility', () => {

    parametrize(['EXPIRED', 'ISSUED', 'REVOKED'], (elem) => {
        it(`Test ${elem}`, () => {
            expect(Utility.checkStateValidity(elem));
        });
    });
});
