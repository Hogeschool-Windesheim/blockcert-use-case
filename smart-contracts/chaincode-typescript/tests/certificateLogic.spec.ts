import {Context} from 'fabric-contract-api';
import {createMock} from 'ts-auto-mock';
import {ImportMock} from 'ts-mock-imports';
import * as certificateModule from '../src/accessControl';
import {Certificate} from '../src/certificate';
import {CertificateLogic} from '../src/certificateLogic';

const contextMock: Context = createMock<Context>();
const certLogic = new CertificateLogic();

afterEach(() => {
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
    const mockManager = ImportMock.mockFunction(certificateModule.AccessControl, 'isAuthorized');
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

    it('Unauthorized test', async () => {
        const isAuthorizedSpy = jest.fn((_) => false);
        mockManager.callsFake(isAuthorizedSpy);
        await expect(() => certLogic.CreateCertificate(contextMock, testingCertificate.ID, testingCertificate.StartDate,
            testingCertificate.EndDate, testingCertificate.CertNr, testingCertificate.Acquirer, testingCertificate.Address,
            testingCertificate.RegistrationNr, testingCertificate.State))
            .rejects.toThrowError(new Error('Action not allowed by this user'));

        expect(isAuthorizedSpy).toBeCalledWith('CreateCertificate', contextMock.clientIdentity, null);
        expect(contextMock.stub.putState).toBeCalledTimes(0);
    });

    it('Authorized test', async () => {
        const isAuthorizedSpy = jest.fn((_) => true);
        mockManager.callsFake(isAuthorizedSpy);
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

describe('Test UpdateCertificate', () => {

    it('Test authorized', () => {
        expect(true);
    });
});
