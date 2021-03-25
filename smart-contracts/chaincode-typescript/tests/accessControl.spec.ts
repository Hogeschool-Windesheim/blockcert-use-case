import {ClientIdentity} from 'fabric-shim';
import {createMock} from 'ts-auto-mock';
import {AccessControl} from '../src/accessControl';
import {CertificateLogic} from '../src/certificateLogic';

let setupMock: any;
const CheckMock = jest.fn(() => {
    return ({
        getMSPID: jest.fn(),
        getID: jest.fn(),
    });
});

beforeEach(() => {
    setupMock = new CheckMock();
});

describe('Assert error behavior', () => {
    let clientIdentityMock: ClientIdentity;

    beforeEach(() => {
        clientIdentityMock = createMock<ClientIdentity>();
    });

    it('Test method that is not implemented', async () => {
        expect(() => {
            AccessControl.isAuthorized('NotAMethod', clientIdentityMock, '');
        }).toThrow('Authorization on this function not implemented');
    });
});

describe('Test access control for Certification Body Only', () => {
    // Only Org2, i.e. IsaCert, should be able to change the elements.
    const accessOrganisations: Array<[string, boolean]> = [['Org1MSP', false], ['Org2MSP', true], ['Org3MSP', false]];
    let simpleMockedIdentity: any;
    const SimpleMock = jest.fn(() => {
        return ({
            getMSPID: jest.fn(),
        });
    });

    beforeEach(() => {
        simpleMockedIdentity = SimpleMock();
    });

    const simpleAccessFunctions = [
        CertificateLogic.prototype.DeleteCertificate.name,
        CertificateLogic.prototype.UpdateCertificate.name,
        CertificateLogic.prototype.UpdateState.name,
        CertificateLogic.prototype.GetAllCertificates.name,
        CertificateLogic.prototype.queryState.name,
        CertificateLogic.prototype.queryRegistrationNr.name,
        CertificateLogic.prototype.CreateCertificate.name,
    ];

    accessOrganisations.forEach(([organisation, access]) => {
        simpleAccessFunctions.forEach((method) => {
            it(`Assert Farmer access control: ${organisation} for ${method}`, () => {
                setupMock.getMSPID.mockReturnValueOnce(organisation);
                const mockedIdentity = simpleMockedIdentity as unknown as ClientIdentity;
                expect(AccessControl.isAuthorized(method, mockedIdentity, 'Can be empty') === access);
                expect(mockedIdentity.getMSPID).toBeCalledTimes(1);
            });
        });
    });
});

describe(`Test ${CertificateLogic.prototype.CheckCertificateFromAcquirerIsIssued.name} for own identity`, () => {
    const organisations: string[] = ['Org2MSP', 'Org3MSP'];

    organisations.forEach((organisation) => {
        it(`Assert access set for ${organisation}`, () => {
            setupMock.getMSPID.mockReturnValueOnce(organisation);
            setupMock.getID.mockReturnValueOnce(`CN=${organisation}::`);
            const mockedIdentity = setupMock as unknown as ClientIdentity;
            // Perform query to own channel
            expect(AccessControl.isAuthorized(CertificateLogic.prototype.CheckCertificateFromAcquirerIsIssued.name,
                mockedIdentity, organisation)).toBe(true);
            expect(mockedIdentity.getMSPID).toBeCalledTimes(1);
            expect(mockedIdentity.getID).toBeCalledTimes(0);
        });
    });

    it(`Assert access set for Farmer`, () => {
        const farmerID = 'Org1MSP';
        setupMock.getMSPID.mockReturnValueOnce(farmerID);
        setupMock.getID.mockReturnValueOnce(`CN=${farmerID}::`);
        const mockedIdentity = setupMock as unknown as ClientIdentity;
        expect(AccessControl.isAuthorized(CertificateLogic.prototype.CheckCertificateFromAcquirerIsIssued.name,
            mockedIdentity, farmerID)).toBe(true);
        expect(mockedIdentity.getMSPID).toBeCalledTimes(1);
        expect(mockedIdentity.getID).toBeCalledTimes(1);
    });
});

describe(`Test ${CertificateLogic.prototype.queryAcquirer.name} for own identity`, () => {
    const organisations: string[] = ['Org2MSP', 'Org3MSP'];

    organisations.forEach((organisation) => {
        it(`Assert access set for ${organisation}`, () => {
            setupMock.getMSPID.mockReturnValueOnce(organisation);
            setupMock.getID.mockReturnValueOnce(`CN=${organisation}::`);
            const mockedIdentity = setupMock as unknown as ClientIdentity;
            // Perform query to own channel
            expect(AccessControl.isAuthorized(CertificateLogic.prototype.CheckCertificateFromAcquirerIsIssued.name,
                mockedIdentity, organisation)).toBe(true);
            expect(mockedIdentity.getMSPID).toBeCalledTimes(1);
            expect(mockedIdentity.getID).toBeCalledTimes(0);
        });
    });

    it(`Assert access set for Farmer`, () => {
        const farmerID = 'Org1MSP';
        setupMock.getMSPID.mockReturnValueOnce(farmerID);
        setupMock.getID.mockReturnValueOnce(`CN=${farmerID}::`);
        const mockedIdentity = setupMock as unknown as ClientIdentity;
        expect(AccessControl.isAuthorized(CertificateLogic.prototype.CheckCertificateFromAcquirerIsIssued.name,
            mockedIdentity, farmerID)).toBe(true);
        expect(mockedIdentity.getMSPID).toBeCalledTimes(1);
        expect(mockedIdentity.getID).toBeCalledTimes(1);
    });
});

describe(`Test ${CertificateLogic.prototype.CheckCertificateFromAcquirerIsIssued.name} for other identities`, () => {
    const OTHER_ORGANISATION = 'NOT_AN_ORGANISATION';
    const organisations: string[] = ['Org2MSP', 'Org3MSP'];

    organisations.forEach((organisation) => {
        it(`Assert access set for ${organisation}`, () => {
            // TODO: Verify that this is what we want
            setupMock.getMSPID.mockReturnValueOnce(organisation);
            setupMock.getID.mockReturnValueOnce(`CN=${organisation}::`);
            const mockedIdentity = setupMock as unknown as ClientIdentity;
            expect(AccessControl.isAuthorized(CertificateLogic.prototype.CheckCertificateFromAcquirerIsIssued.name,
                mockedIdentity, OTHER_ORGANISATION)).toBe(true);
            expect(mockedIdentity.getMSPID).toBeCalledTimes(1);
            expect(mockedIdentity.getID).toBeCalledTimes(0);
        });
    });

    it(`Assert access set for Farmer`, () => {
        const farmerID = 'Org1MSP';
        setupMock.getMSPID.mockReturnValueOnce(farmerID);
        setupMock.getID.mockReturnValueOnce(`CN=${farmerID}::`);
        const mockedIdentity = setupMock as unknown as ClientIdentity;
        expect(AccessControl.isAuthorized(CertificateLogic.prototype.CheckCertificateFromAcquirerIsIssued.name,
            mockedIdentity, OTHER_ORGANISATION)).toBe(false);
        expect(mockedIdentity.getMSPID).toBeCalledTimes(1);
        expect(mockedIdentity.getID).toBeCalledTimes(1);
    });
});
