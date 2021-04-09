import {Context} from 'fabric-contract-api';
import {createMock} from 'ts-auto-mock';
import {ImportMock} from 'ts-mock-imports';

// Import modules to be mocked using ImportMock, as these objects are instantiated/used within the to be tested code.
import * as parametrize from 'js-parametrize';
import * as accessControlModule from '../src/accessControl';
import {Farmer} from '../src/farmer';
import {FarmerLogic} from '../src/farmerLogic';
import * as queryUtilityModule from '../src/queries';

const accessControlMock = ImportMock.mockFunction(accessControlModule.AccessControl, 'isAuthorized');
const mockedQueryUtilityModule = ImportMock.mockClass(queryUtilityModule, 'QueryUtils');

const isAuthorizedSpy = jest.fn((_) => true);
const isUnauthorizedSpy = jest.fn((_) => false);

const contextMock: Context = createMock<Context>();
const farmerLogic = new FarmerLogic();

const testingCertificate: Farmer = {
    id: '1',
    address: 'Penny lane',
    firstName: 'John',
    lastName: 'Deere',
};

beforeEach(() => {
    // By clearing all the mocks we can be sure that the mocks are properly instantiated
    // I.e. the call history is reset.
    jest.clearAllMocks();
});

describe('Test creation of farmer', () => {
    const callCreate = (farmer: Farmer) => farmerLogic.createFarmer(contextMock, farmer.id,
        farmer.address, farmer.firstName, farmer.lastName);

    it('Unauthorized test', async () => {
        accessControlMock.callsFake(isUnauthorizedSpy);
        await expect(callCreate(testingCertificate))
            .rejects.toThrowError(new Error('Action not allowed by this user'));

        expect(isUnauthorizedSpy).toBeCalledWith('createFarmer', contextMock.clientIdentity, null);
        expect(contextMock.stub.putState).toBeCalledTimes(0);
    });

    it('Authorized test', async () => {
        accessControlMock.callsFake(isAuthorizedSpy);
        await expect(callCreate(testingCertificate));

        expect(isAuthorizedSpy).toBeCalledWith('createFarmer', contextMock.clientIdentity, null);
        expect(contextMock.stub.putState).toBeCalledWith(testingCertificate.id, Buffer.from(JSON.stringify(testingCertificate)));
    });
});


describe('Test updating farmer', () => {

    /**
     * 'Curry' update function to reduce code base to minimal lines of codes.
     * @param certificate Certificate to test with.
     * @param certificateLogic Underlying certificate logic to test with.
     */
    const createCallUpdate = (certificate: Farmer, certificateLogic: FarmerLogic = farmerLogic) => {
        return () =>
            certificateLogic.updateFarmer(contextMock, certificate.id,
                certificate.address, certificate.firstName, certificate.lastName);
    };

    it('Check unauthorized access', async () => {
        accessControlMock.callsFake(isUnauthorizedSpy);
        await expect(createCallUpdate(testingCertificate))
            .rejects
            .toThrowError('Action not allowed by this user');
        expect(isUnauthorizedSpy).toBeCalledWith('updateFarmer', contextMock.clientIdentity, null);
    });

    it('Non existing certificate', async () => {
        // As to not pollute the used CertificateLogic object
        const certificateLogicLocal = new FarmerLogic();
        const existsSpy = jest.fn().mockReturnValue(false);
        ImportMock.mockFunction(certificateLogicLocal,
            'farmerExists')
            .callsFake(existsSpy);

        const accessControlSpy = jest.fn().mockReturnValue(true);
        accessControlMock.callsFake(accessControlSpy);

        await expect(createCallUpdate(testingCertificate, certificateLogicLocal))
            .rejects
            .toThrowError('The certificate 1 does not exist');
        expect(existsSpy).toBeCalledWith(contextMock, testingCertificate.id);
        expect(accessControlSpy).toBeCalledWith('updateFarmer', contextMock.clientIdentity, null);
    });

    it('Existing certificate', async () => {
        // As to not pollute the used CertificateLogic object
        const certificateLogicLocal = new FarmerLogic();
        const existsSpy = jest.fn().mockReturnValue(true);
        ImportMock.mockFunction(certificateLogicLocal,
            'farmerExists')
            .callsFake(existsSpy);

        const accessControlSpy = jest.fn().mockReturnValue(true);
        accessControlMock.callsFake(accessControlSpy);
        await createCallUpdate(testingCertificate, certificateLogicLocal)();

        expect(contextMock.stub.putState).toBeCalledWith(testingCertificate.id, Buffer.from(JSON.stringify(testingCertificate)));

    });
});

describe('Test Deleting farmer', () => {

    it('Check unauthorized access', async () => {
        accessControlMock.callsFake(isUnauthorizedSpy);

        await expect(farmerLogic.deleteFarmer(contextMock, testingCertificate.id))
            .rejects
            .toThrowError('Action not allowed by this user');
        expect(isUnauthorizedSpy).toBeCalledWith('deleteFarmer', contextMock.clientIdentity, null);
    });

    const callDelete = (certificateLogicLocal: FarmerLogic, farmer: Farmer) => certificateLogicLocal.deleteFarmer(contextMock, farmer.id);
    it('Non existing certificate', async () => {
        // As to not pollute the used CertificateLogic object
        const certificateLogicLocal = new FarmerLogic();
        const existsSpy = jest.fn().mockReturnValue(false);
        ImportMock.mockFunction(certificateLogicLocal,
            'farmerExists')
            .callsFake(existsSpy);

        accessControlMock.callsFake(isAuthorizedSpy);

        await expect(callDelete(certificateLogicLocal, testingCertificate))
            .rejects
            .toThrowError('The farmer 1 does not exist');
        expect(existsSpy).toBeCalledWith(contextMock, testingCertificate.id);
        expect(isAuthorizedSpy).toBeCalledWith('deleteFarmer', contextMock.clientIdentity, null);
    });

    it('Existing certificate', async () => {
        // As to not pollute the used CertificateLogic object
        const certificateLogicLocal = new FarmerLogic();
        const existsSpy = jest.fn().mockReturnValue(true);
        ImportMock.mockFunction(certificateLogicLocal,
            'farmerExists')
            .callsFake(existsSpy);

        accessControlMock.callsFake(isAuthorizedSpy);
        await callDelete(certificateLogicLocal, testingCertificate);

        expect(contextMock.stub.deleteState).toBeCalledWith(testingCertificate.id);
    });
});

describe('Test FarmerExists', () => {
    parametrize([
        [Promise.resolve([testingCertificate]), true],
        [Promise.resolve([]), false],
    ], (answer, assert) => {
        it(`Test for a an existing == ${assert} certificate`, async () => {
            accessControlMock.callsFake(isAuthorizedSpy);
            const querySpy = jest.fn().mockReturnValue(answer);
            mockedQueryUtilityModule.mock('queryKeyByFarmerID').callsFake(querySpy);
            jest.spyOn(contextMock.stub, 'getState').mockReturnValue(answer);
            accessControlMock.callsFake(isAuthorizedSpy);
            expect(await farmerLogic.farmerExists(contextMock, testingCertificate.id)).toBe(assert);
            // We expect this function to not perform access control.
            expect(isAuthorizedSpy).toBeCalledTimes(0);
            expect(contextMock.stub.getState).toBeCalledWith(testingCertificate.id);
        });
    });
});


describe('Test getFarmerByID', () => {

    it('Check unauthorized access', async () => {
        accessControlMock.callsFake(isUnauthorizedSpy);

        await expect(farmerLogic.getFarmerByID(contextMock, testingCertificate.id))
            .rejects
            .toThrowError('Action not allowed by this user');
        expect(isUnauthorizedSpy).toBeCalledWith('getFarmerByID', contextMock.clientIdentity, testingCertificate.id);
    });

    it('Test existing farmer', async () => {
        accessControlMock.callsFake(isAuthorizedSpy);
        const result = [JSON.stringify(testingCertificate)];
        const querySpy = jest.fn().mockReturnValue(result);
        mockedQueryUtilityModule.mock('queryKeyByFarmerID').callsFake(querySpy);
        accessControlMock.callsFake(isAuthorizedSpy);
        expect(await farmerLogic.getFarmerByID(contextMock, testingCertificate.id)).toBe(result);
        expect(isAuthorizedSpy).toBeCalledWith('getFarmerByID', contextMock.clientIdentity, testingCertificate.id);
        expect(querySpy).toBeCalledWith(testingCertificate.id);
    });

});
