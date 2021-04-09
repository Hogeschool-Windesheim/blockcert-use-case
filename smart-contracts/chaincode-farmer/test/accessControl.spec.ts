import {ClientIdentity} from 'fabric-shim';
// Import modules to be mocked using ImportMock, as these objects are instantiated/used within the to be tested code.
import * as parametrize from 'js-parametrize';
import {createMock} from 'ts-auto-mock';
import {AccessControl} from '../src/accessControl';
import {FarmerLogic} from '../src/farmerLogic';

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
    const clientIdentityMock = createMock<ClientIdentity>();

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

    parametrize([FarmerLogic.prototype.createFarmer.name,
        FarmerLogic.prototype.deleteFarmer.name,
        FarmerLogic.prototype.updateFarmer.name,
        FarmerLogic.prototype.getAllFarmers.name], (method) => {
        parametrize(accessOrganisations, ([organisation, access]) => {
            it(`Assert Farmer access control: ${organisation} for ${method}`, () => {
                setupMock.getMSPID.mockReturnValueOnce(organisation);
                const mockedIdentity = simpleMockedIdentity as unknown as ClientIdentity;
                expect(AccessControl.isAuthorized(method, mockedIdentity, 'Can be empty') === access);
                expect(mockedIdentity.getMSPID).toBeCalledTimes(1);
            });
        });
    });
});

describe(`Test ${FarmerLogic.prototype.getFarmerByID.name} for own identity`, () => {
    const organisations: string[] = ['Org2MSP', 'Org3MSP'];

    organisations.forEach((organisation) => {
        it(`Assert access set for ${organisation}`, () => {
            setupMock.getMSPID.mockReturnValueOnce(organisation);
            setupMock.getID.mockReturnValueOnce(`CN=${organisation}::`);
            const mockedIdentity = setupMock as unknown as ClientIdentity;
            // Perform query to own channel
            expect(AccessControl.isAuthorized(FarmerLogic.prototype.getFarmerByID.name,
                mockedIdentity, organisation)).toBe(true);
            expect(mockedIdentity.getMSPID).toBeCalledTimes(1);
            expect(mockedIdentity.getID).toBeCalledTimes(1);
        });
    });

    parametrize( [['FARMER1234', 'FARMER1234', true],
        ['FARMER1234', 'FARMER12345', false]], (requestor, request, assert) => {
            it(`Assert ${requestor} to request ${request} farmer to be ${assert}`, () => {
                setupMock.getMSPID.mockReturnValueOnce('MSP1');
                setupMock.getID.mockReturnValueOnce(`CN=${requestor}::`);
                const mockedIdentity = setupMock as unknown as ClientIdentity;
                expect(AccessControl.isAuthorized(FarmerLogic.prototype.getFarmerByID.name,
                    mockedIdentity, request)).toBe(assert);
                expect(mockedIdentity.getMSPID).toBeCalledTimes(1);
                expect(mockedIdentity.getID).toBeCalledTimes(1);
            });
        });
});
