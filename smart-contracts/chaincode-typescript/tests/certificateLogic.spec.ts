import {Context} from 'fabric-contract-api';
import {createMock} from 'ts-auto-mock';
import {ImportMock} from 'ts-mock-imports';
import * as accessControlModule from '../src/accessControl';
import {Certificate} from '../src/certificate';
import {CertificateLogic} from '../src/certificateLogic';

const accessControlMock = ImportMock.mockFunction(accessControlModule.AccessControl, 'isAuthorized');
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
    // TODO: Extract this from field of Certificate Logic
    const certificates: Certificate[] = [
        {
            ID: '1',
            StartDate: 'startDate',
            EndDate: 'endDate',
            CertNr: 'certNr',
            Acquirer: 'henk',
            Address: 'address',
            RegistrationNr: 'registrationNr',
            State: 'ISSUED',
        },
        {
            ID: '2',
            StartDate: 'startDate2',
            EndDate: 'endDate2',
            CertNr: 'certNr2',
            Acquirer: 'acquirer2',
            Address: 'address2',
            RegistrationNr: 'registrationNr2',
            State: 'REVOKED',
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
        const isAuthorizedSpy = jest.fn((_) => false);
        accessControlMock.callsFake(isAuthorizedSpy);
        await expect(() => certLogic.CreateCertificate(contextMock, testingCertificate.ID, testingCertificate.StartDate,
            testingCertificate.EndDate, testingCertificate.CertNr, testingCertificate.Acquirer, testingCertificate.Address,
            testingCertificate.RegistrationNr, testingCertificate.State))
            .rejects.toThrowError(new Error('Action not allowed by this user'));

        expect(isAuthorizedSpy).toBeCalledWith('CreateCertificate', contextMock.clientIdentity, null);
        expect(contextMock.stub.putState).toBeCalledTimes(0);
    });

    it('Authorized test', async () => {
        const isAuthorizedSpy = jest.fn((_) => true);
        accessControlMock.callsFake(isAuthorizedSpy);
        expect(await certLogic.CreateCertificate(contextMock, testingCertificate.ID, testingCertificate.StartDate,
            testingCertificate.EndDate, testingCertificate.CertNr, testingCertificate.Acquirer, testingCertificate.Address,
            testingCertificate.RegistrationNr, testingCertificate.State));
        expect(isAuthorizedSpy).toBeCalledWith('CreateCertificate', contextMock.clientIdentity, null);
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

    it('Check unauthorized access', () => {
        const accessControlSpy = jest.fn().mockReturnValue(false);
        accessControlMock.callsFake(accessControlSpy);

        expect(certLogic.UpdateCertificate(contextMock, testingCertificate.ID, testingCertificate.StartDate,
            testingCertificate.EndDate, testingCertificate.CertNr, testingCertificate.Acquirer, testingCertificate.Address,
            testingCertificate.RegistrationNr, testingCertificate.State))
            .rejects
            .toThrowError('Action not allowed by this user');
        expect(accessControlSpy).toBeCalledWith('UpdateCertificate', contextMock.clientIdentity, null);
    });

    it('Non existing certificate', () => {
        // As to not pollute the used CertificateLogic object
        const certificateLogicLocal = new CertificateLogic();
        const existsSpy = jest.fn().mockReturnValue(false);
        ImportMock.mockFunction(certificateLogicLocal,
            'CertificateExists')
            .callsFake(existsSpy);

        const accessControlSpy = jest.fn().mockReturnValue(true);
        accessControlMock.callsFake(accessControlSpy);

        expect(certificateLogicLocal.UpdateCertificate(contextMock, testingCertificate.ID, testingCertificate.StartDate,
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

    it('Check unauthorized access', () => {
        const accessControlSpy = jest.fn().mockReturnValue(false);
        accessControlMock.callsFake(accessControlSpy);

        expect(certLogic.DeleteCertificate(contextMock, testingCertificate.ID))
            .rejects
            .toThrowError('Action not allowed by this user');
        expect(accessControlSpy).toBeCalledWith('DeleteCertificate', contextMock.clientIdentity, null);
    });

    it('Non existing certificate', () => {
        // As to not pollute the used CertificateLogic object
        const certificateLogicLocal = new CertificateLogic();
        const existsSpy = jest.fn().mockReturnValue(false);
        ImportMock.mockFunction(certificateLogicLocal,
            'CertificateExists')
            .callsFake(existsSpy);

        const accessControlSpy = jest.fn().mockReturnValue(true);
        accessControlMock.callsFake(accessControlSpy);

        expect(certificateLogicLocal.DeleteCertificate(contextMock, testingCertificate.ID))
            .rejects
            .toThrowError('The certificate 1 does not exist');
        expect(existsSpy).toBeCalledWith(contextMock, testingCertificate.ID);
        expect(accessControlSpy).toBeCalledWith('DeleteCertificate', contextMock.clientIdentity, null);
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

    it('Check unauthorized access', () => {
        const accessControlSpy = jest.fn().mockReturnValue(false);
        accessControlMock.callsFake(accessControlSpy);

        expect(certLogic.UpdateState(contextMock, testingCertificate.ID, testingCertificate.State))
            .rejects
            .toThrowError('Action not allowed by this user');
        expect(accessControlSpy).toBeCalledWith('UpdateState', contextMock.clientIdentity, null);
    });

    it('Non existing certificate', () => {
        // As to not pollute the used CertificateLogic object
        jest.spyOn(contextMock.stub, 'getState').mockReturnValue(Promise.reject());
        const accessControlSpy = jest.fn().mockReturnValue(true);
        accessControlMock.callsFake(accessControlSpy);

        expect(certLogic.UpdateState(contextMock, testingCertificate.ID, 'REVOKED'))
            .rejects
            .toThrowError('The certificate 1 does not exist');
        expect(contextMock.stub.getState).toBeCalledWith(testingCertificate.ID);
        expect(accessControlSpy).toBeCalledWith('UpdateState', contextMock.clientIdentity, null);
    });

    it('Existing certificate', async () => {
        // As to not pollute the used CertificateLogic object
        const certificateLogicLocal = new CertificateLogic();
        const readCertificateSpy = jest.fn().mockReturnValue(JSON.stringify(testingCertificate));
        ImportMock.mockFunction(certificateLogicLocal,
            'ReadCertificate')
            .callsFake(readCertificateSpy);

        const accessControlSpy = jest.fn().mockReturnValue(true);
        accessControlMock.callsFake(accessControlSpy);
        await certificateLogicLocal.UpdateState(contextMock, testingCertificate.ID, 'REVOKED');

        expect(contextMock.stub.putState).toBeCalledWith(updatedCertificate.ID, Buffer.from(JSON.stringify(updatedCertificate)));
        expect(accessControlSpy).toBeCalledWith('UpdateState', contextMock.clientIdentity, null);
    });
});
