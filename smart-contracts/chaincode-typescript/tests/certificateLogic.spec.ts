import {Context} from 'fabric-contract-api';
import {createMock} from 'ts-auto-mock';
import {ImportMock} from 'ts-mock-imports';

// Import modules to be mocked using ImportMock, as these objects are instantiated/used within the to be tested code.
import * as parametrize from 'js-parametrize';
import * as accessControlModule from '../src/accessControl';
import * as queryUtilityModule from '../src/queries';
import * as utilityControlModule from '../src/utility';

import {Utility} from '../dist/utility';
import {Certificate} from '../src/certificate';
import {CertificateLogic} from '../src/certificateLogic';

const accessControlMock = ImportMock.mockFunction(accessControlModule.AccessControl, 'isAuthorized');
const stateValidityUtilityMock = ImportMock.mockFunction(utilityControlModule.Utility, 'checkStateValidity');
const mockedQueryUtilityModule = ImportMock.mockClass(queryUtilityModule, 'QueryUtils');

const isAuthorizedSpy = jest.fn((_) => true);
const isValidStateSpy = jest.fn((_) => true);

const isUnauthorizedSpy = jest.fn((_) => false);

const contextMock: Context = createMock<Context>();
const certLogic = new CertificateLogic();

const testingCertificate = {
    ID: '1',
    StartDate: '1/1/2020',
    EndDate: '1/1/2021',
    CertNr: '1',
    Acquirer: 'Test',
    Address: 'TestStreet',
    RegistrationNr: '1',
    State: 'VALID',
} as Certificate;

afterEach(() => {
    // By clearing all the mocks we can be sure that the mocks are properly instantiated
    // I.e. the call history is reset.
    jest.clearAllMocks();
});

describe('Test SmartContract Ledger Initialization', () => {
    const certificates: Certificate[] = [
        {
            ID: '1',
            StartDate: '03-10-2021',
            EndDate: '03-30-2021',
            CertNr: 'certNr',
            Acquirer: 'henk',
            Address: 'address',
            RegistrationNr: 'registrationNr',
            State: 'ISSUED',
        },
        {
            ID: '2',
            StartDate: '03-10-2021',
            EndDate: '03-22-2021',
            CertNr: 'certNr2',
            Acquirer: 'acquirer2',
            Address: 'address2',
            RegistrationNr: 'registrationNr2',
            State: 'ISSUED',
        },
    ];

    it('Test chaincode initialization', async () => {
        await certLogic.InitLedger(contextMock);
        expect(contextMock.stub.putState).toBeCalledTimes(2);
        expect(contextMock.stub.putState).toHaveBeenNthCalledWith(1, '1', Buffer.from(JSON.stringify(certificates[0])));
        expect(contextMock.stub.putState).toHaveBeenNthCalledWith(2, '2', Buffer.from(JSON.stringify(certificates[1])));
    });
});

describe('Test creation of certificates', () => {

    it('Unauthorized test', async () => {
        accessControlMock.callsFake(isUnauthorizedSpy);
        await expect(() => certLogic.CreateCertificate(contextMock, testingCertificate.ID, testingCertificate.StartDate,
            testingCertificate.EndDate, testingCertificate.CertNr, testingCertificate.Acquirer, testingCertificate.Address,
            testingCertificate.RegistrationNr, testingCertificate.State))
            .rejects.toThrowError(new Error('Action not allowed by this user'));

        expect(isUnauthorizedSpy).toBeCalledWith('CreateCertificate', contextMock.clientIdentity, null);
        expect(contextMock.stub.putState).toBeCalledTimes(0);
    });

    it('Authorized test', async () => {
        accessControlMock.callsFake(isAuthorizedSpy);

        stateValidityUtilityMock.callsFake(isValidStateSpy);
        expect(await certLogic.CreateCertificate(contextMock, testingCertificate.ID, testingCertificate.StartDate,
            testingCertificate.EndDate, testingCertificate.CertNr, testingCertificate.Acquirer, testingCertificate.Address,
            testingCertificate.RegistrationNr, testingCertificate.State));
        expect(isAuthorizedSpy).toBeCalledWith('CreateCertificate', contextMock.clientIdentity, null);
        expect(isValidStateSpy).toBeCalledWith(testingCertificate.State);
        expect(contextMock.stub.putState).toBeCalledTimes(1);
    });

    it('Assert authorization is used', () => {
        certLogic.CreateCertificate(contextMock, testingCertificate.ID, testingCertificate.StartDate,
            testingCertificate.EndDate, testingCertificate.CertNr, testingCertificate.Acquirer, testingCertificate.Address,
            testingCertificate.RegistrationNr, testingCertificate.State);

        expect(contextMock.stub.putState).toHaveBeenCalledWith(testingCertificate.ID, Buffer.from(JSON.stringify(testingCertificate)));
    });
});

describe('Test Reading certificate', () => {

    it('Test existing certificate', async () => {
        const returnValue = new Uint8Array(Buffer.from(JSON.stringify(testingCertificate)));
        // @ts-ignore
        jest.spyOn(contextMock.stub, 'getState').mockReturnValue(returnValue);
        expect(await certLogic.ReadCertificate(contextMock, testingCertificate.ID)).toBe(returnValue.toString());
        expect(contextMock.stub.getState).toBeCalledWith(testingCertificate.ID);
        expect(contextMock.stub.getState).toBeCalledTimes(1);
    });

    it('Test non existing certificate', async () => {
        const returnValue: Promise<Uint8Array> = Promise.resolve(new Uint8Array());

        jest.spyOn(contextMock.stub, 'getState').mockReturnValue(returnValue);

        await expect(certLogic.ReadCertificate(contextMock, testingCertificate.ID)).rejects
            .toThrow('The certificate 1 does not exist');
        expect(contextMock.stub.getState).toBeCalledWith(testingCertificate.ID);
        expect(contextMock.stub.getState).toBeCalledTimes(1);
    });
});

describe('Test updating certificates', () => {

    it('Check unauthorized access', async () => {
        accessControlMock.callsFake(isUnauthorizedSpy);

        await expect(certLogic.UpdateCertificate(contextMock, testingCertificate.ID, testingCertificate.StartDate,
            testingCertificate.EndDate, testingCertificate.CertNr, testingCertificate.Acquirer, testingCertificate.Address,
            testingCertificate.RegistrationNr, testingCertificate.State))
            .rejects
            .toThrowError('Action not allowed by this user');
        expect(isUnauthorizedSpy).toBeCalledWith('UpdateCertificate', contextMock.clientIdentity, null);
    });

    it('Non existing certificate', async () => {
        // As to not pollute the used CertificateLogic object
        const certificateLogicLocal = new CertificateLogic();
        const existsSpy = jest.fn().mockReturnValue(false);
        ImportMock.mockFunction(certificateLogicLocal,
            'CertificateExists')
            .callsFake(existsSpy);

        const accessControlSpy = jest.fn().mockReturnValue(true);
        accessControlMock.callsFake(accessControlSpy);

        await expect(certificateLogicLocal.UpdateCertificate(contextMock, testingCertificate.ID, testingCertificate.StartDate,
            testingCertificate.EndDate, testingCertificate.CertNr, testingCertificate.Acquirer, testingCertificate.Address,
            testingCertificate.RegistrationNr, testingCertificate.State))
            .rejects
            .toThrowError('The certificate 1 does not exist');
        expect(existsSpy).toBeCalledWith(contextMock, testingCertificate.ID);
        expect(accessControlSpy).toBeCalledWith('UpdateCertificate', contextMock.clientIdentity, null);
    });

    it('Existing certificate', async () => {
        // As to not pollute the used CertificateLogic object
        const certificateLogicLocal = new CertificateLogic();
        const existsSpy = jest.fn().mockReturnValue(true);
        ImportMock.mockFunction(certificateLogicLocal,
            'CertificateExists')
            .callsFake(existsSpy);

        const accessControlSpy = jest.fn().mockReturnValue(true);
        accessControlMock.callsFake(accessControlSpy);
        await certificateLogicLocal.UpdateCertificate(contextMock, testingCertificate.ID, testingCertificate.StartDate,
            testingCertificate.EndDate, testingCertificate.CertNr, testingCertificate.Acquirer, testingCertificate.Address,
            testingCertificate.RegistrationNr, testingCertificate.State);

        expect(contextMock.stub.putState).toBeCalledWith(testingCertificate.ID, Buffer.from(JSON.stringify(testingCertificate)));

    });
});

describe('Test Deleting certificates', () => {

    it('Check unauthorized access', async () => {
        accessControlMock.callsFake(isUnauthorizedSpy);

        await expect(certLogic.DeleteCertificate(contextMock, testingCertificate.ID))
            .rejects
            .toThrowError('Action not allowed by this user');
        expect(isUnauthorizedSpy).toBeCalledWith('DeleteCertificate', contextMock.clientIdentity, null);
    });

    it('Non existing certificate', async () => {
        // As to not pollute the used CertificateLogic object
        const certificateLogicLocal = new CertificateLogic();
        const existsSpy = jest.fn().mockReturnValue(false);
        ImportMock.mockFunction(certificateLogicLocal,
            'CertificateExists')
            .callsFake(existsSpy);

        accessControlMock.callsFake(isAuthorizedSpy);

        await expect(certificateLogicLocal.DeleteCertificate(contextMock, testingCertificate.ID))
            .rejects
            .toThrowError('The certificate 1 does not exist');
        expect(existsSpy).toBeCalledWith(contextMock, testingCertificate.ID);
        expect(isAuthorizedSpy).toBeCalledWith('DeleteCertificate', contextMock.clientIdentity, null);
    });

    it('Existing certificate', async () => {
        // As to not pollute the used CertificateLogic object
        const certificateLogicLocal = new CertificateLogic();
        const existsSpy = jest.fn().mockReturnValue(true);
        ImportMock.mockFunction(certificateLogicLocal,
            'CertificateExists')
            .callsFake(existsSpy);

        accessControlMock.callsFake(isAuthorizedSpy);
        await certificateLogicLocal.DeleteCertificate(contextMock, testingCertificate.ID);

        expect(contextMock.stub.deleteState).toBeCalledWith(testingCertificate.ID);
    });
});

describe('Test Update certificate state', () => {

    const updatedCertificate = {
        ID: '1',
        StartDate: '1/1/2020',
        EndDate: '1/1/2021',
        CertNr: '1',
        Acquirer: 'Test',
        Address: 'TestStreet',
        RegistrationNr: '1',
        State: 'REVOKED',
    };

    it('Check unauthorized access', async () => {
        accessControlMock.callsFake(isUnauthorizedSpy);

        await expect(certLogic.UpdateState(contextMock, testingCertificate.ID, testingCertificate.State))
            .rejects
            .toThrowError('Action not allowed by this user');
        expect(isUnauthorizedSpy).toBeCalledWith('UpdateState', contextMock.clientIdentity, null);
    });

    it('Non existing certificate', async () => {
        const updatedState = 'REVOKED';
        // As to not pollute the used CertificateLogic object
        jest.spyOn(contextMock.stub, 'getState').mockReturnValue(Promise.resolve(new Uint8Array()));
        accessControlMock.callsFake(isAuthorizedSpy);
        stateValidityUtilityMock.callsFake(isValidStateSpy);
        await expect(certLogic.UpdateState(contextMock, testingCertificate.ID, updatedState))
            .rejects
            .toThrowError('The certificate 1 does not exist');
        expect(isValidStateSpy).toBeCalledWith(updatedState);
        expect(contextMock.stub.getState).toBeCalledWith(testingCertificate.ID);
        expect(isAuthorizedSpy).toBeCalledWith('UpdateState', contextMock.clientIdentity, null);
    });

    it('Existing certificate', async () => {
        const updatedState = 'REVOKED';
        // As to not pollute the used CertificateLogic object
        const certificateLogicLocal = new CertificateLogic();
        const readCertificateSpy = jest.fn().mockReturnValue(JSON.stringify(testingCertificate));
        ImportMock.mockFunction(certificateLogicLocal,
            'ReadCertificate')
            .callsFake(readCertificateSpy);

        stateValidityUtilityMock.callsFake(isValidStateSpy);
        accessControlMock.callsFake(isAuthorizedSpy);
        await certificateLogicLocal.UpdateState(contextMock, testingCertificate.ID, updatedState);
        expect(isValidStateSpy).toBeCalledWith(updatedState);
        expect(contextMock.stub.putState).toBeCalledWith(updatedCertificate.ID, Buffer.from(JSON.stringify(updatedCertificate)));
        expect(isAuthorizedSpy).toBeCalledWith('UpdateState', contextMock.clientIdentity, null);
    });
});

describe('Test UpdateStateAllCertificates', () => {

    it('Authorized test', async () => {
        const stringToDateMock = ImportMock.mockFunction(Utility, 'stringToDate');
        const stringToDateSpy = jest.fn().mockReturnValue(new Date());
        stringToDateMock.callsFake(stringToDateSpy);

        const certificateLogicLocal = new CertificateLogic();
        const queryStateMock = ImportMock.mockFunction(certificateLogicLocal, 'queryState');
        queryStateMock.callsFake((_) => [{Record: testingCertificate}]);
        const UpdateStateMock = ImportMock.mockFunction(certificateLogicLocal, 'UpdateState');
        const updateStateSpy = jest.fn();
        UpdateStateMock.callsFake(updateStateSpy);

        await certificateLogicLocal.updateStateAllCertificates(contextMock);
        expect(updateStateSpy).toBeCalledWith(contextMock, testingCertificate.ID, 'EXPIRED');

    });
});

describe('Test Registration number queries', () => {
    it('Authorized query', async () => {
        accessControlMock.callsFake(isAuthorizedSpy);
        const querySpy = jest.fn();
        mockedQueryUtilityModule.mock('queryByRegistrationNr').callsFake(querySpy);

        accessControlMock.callsFake(isAuthorizedSpy);
        await certLogic.queryRegistrationNr(contextMock, '1');

        expect(isAuthorizedSpy).toBeCalledWith('queryRegistrationNr', contextMock.clientIdentity, null);
        expect(querySpy).toBeCalledWith('1');
    });

    it('Unauthorized query', async () => {
        accessControlMock.callsFake(isUnauthorizedSpy);
        await expect(certLogic.queryRegistrationNr(contextMock, '1'))
            .rejects
            .toThrow('Action not allowed by this user');
        expect(isUnauthorizedSpy).toBeCalledWith('queryRegistrationNr', contextMock.clientIdentity, null);
    });
});

describe('Test queryState', () => {
    it('Authorized query', async () => {
        accessControlMock.callsFake(isAuthorizedSpy);
        const querySpy = jest.fn();
        mockedQueryUtilityModule.mock('queryKeyByState').callsFake(querySpy);

        accessControlMock.callsFake(isAuthorizedSpy);
        await certLogic.queryState(contextMock, 'SOME_STATE');
        expect(isAuthorizedSpy).toBeCalledWith('queryState', contextMock.clientIdentity, null);
        expect(querySpy).toBeCalledWith('SOME_STATE');
    });

    it('Unauthorized query', async () => {
        accessControlMock.callsFake(isUnauthorizedSpy);
        await expect(certLogic.queryState(contextMock, 'SOME_STATE'))
            .rejects
            .toThrow('Action not allowed by this user');
        expect(isUnauthorizedSpy).toBeCalledWith('queryState', contextMock.clientIdentity, null);
    });
});

describe('Test queryAcquirer', () => {
    it('Authorized query', async () => {
        accessControlMock.callsFake(isAuthorizedSpy);
        const querySpy = jest.fn();
        mockedQueryUtilityModule.mock('queryKeyByAcquirer').callsFake(querySpy);

        accessControlMock.callsFake(isAuthorizedSpy);
        await certLogic.queryAcquirer(contextMock, 'SomeFarmer');
        expect(isAuthorizedSpy).toBeCalledWith('queryAcquirer', contextMock.clientIdentity, 'SomeFarmer');
        expect(querySpy).toBeCalledWith('SomeFarmer');
    });

    it('Unauthorized query', async () => {
        accessControlMock.callsFake(isUnauthorizedSpy);
        await expect(certLogic.queryAcquirer(contextMock, 'SomeFarmer'))
            .rejects
            .toThrow('Action not allowed by this user');
        expect(isUnauthorizedSpy).toBeCalledWith('queryAcquirer', contextMock.clientIdentity, 'SomeFarmer');
    });
});

describe('Test CheckCertificateFromAcquirerIsIssued', () => {
    parametrize([
        [Promise.resolve([testingCertificate]), true],
        [Promise.resolve([]), false],
    ], (answer, assert) => {
        it(`Test for a issued == ${assert}`, async () => {
            accessControlMock.callsFake(isAuthorizedSpy);
            const querySpy = jest.fn().mockReturnValue(answer);
            mockedQueryUtilityModule.mock('queryByAcquirerAndState').callsFake(querySpy);

            accessControlMock.callsFake(isAuthorizedSpy);
            expect(await certLogic.CheckCertificateFromAcquirerIsIssued(contextMock, 'SomeFarmer')).toBe(assert);
            expect(isAuthorizedSpy).toBeCalledWith('CheckCertificateFromAcquirerIsIssued', contextMock.clientIdentity, 'SomeFarmer');
            expect(querySpy).toBeCalledWith('SomeFarmer', 'ISSUED');
        });
    });

    it('Unauthorized query', async () => {
        accessControlMock.callsFake(isUnauthorizedSpy);
        await expect(certLogic.CheckCertificateFromAcquirerIsIssued(contextMock, 'SomeFarmer'))
            .rejects
            .toThrow('Action not allowed by this user');
        expect(isUnauthorizedSpy).toBeCalledWith('CheckCertificateFromAcquirerIsIssued', contextMock.clientIdentity, 'SomeFarmer');
    });
});

describe('Test CertificateExists', () => {
    parametrize([
        [Promise.resolve([testingCertificate]), true],
        [Promise.resolve([]), false],
    ], (answer, assert) => {
        it(`Test for a an existing == ${assert} certificate`, async () => {
            accessControlMock.callsFake(isAuthorizedSpy);
            const querySpy = jest.fn().mockReturnValue(answer);
            mockedQueryUtilityModule.mock('queryByAcquirerAndState').callsFake(querySpy);
            jest.spyOn(contextMock.stub, 'getState').mockReturnValue(answer);
            accessControlMock.callsFake(isAuthorizedSpy);
            expect(await certLogic.CertificateExists(contextMock, '1234')).toBe(assert);
            // We expect this function to not perform access control.
            expect(isAuthorizedSpy).toBeCalledTimes(0);
            expect(contextMock.stub.getState).toBeCalledWith('1234');
        });
    });
});
