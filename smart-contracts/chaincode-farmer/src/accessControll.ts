import {ClientIdentity} from 'fabric-shim';
import {FarmerLogic} from './farmerLogic';

/**
 * This class is used to regulate access controll on different functions performed on the blockchain.
 */
export class AccessControll {
    static farmerOrg = 'Org1MSP';
    static certBodyOrg = 'Org2MSP';
    static producerOrg = 'Org3MSP';

    /**
     * Method which returns true iff the client invoking a function is authorized to do so
     * @param methodInvoked the method being invoked
     * @param clientIdentity the client invoking the function
     * @param queryValue optional value used to check walletIds
     * @returns
     */
    static isAuthorized(methodInvoked: string, clientIdentity: ClientIdentity, queryValue: string): boolean {
        switch (methodInvoked) {
            // Match all funcitons which only the certification body is allowed to perform
            case FarmerLogic.prototype.createFarmer.name:
            case FarmerLogic.prototype.deleteFarmer.name:
            case FarmerLogic.prototype.updateFarmer.name: {
                return clientIdentity.getMSPID() === this.certBodyOrg;
            }

            case FarmerLogic.prototype.getAllFarmers.name: {
                const mspId = clientIdentity.getMSPID();
                return mspId === this.certBodyOrg || mspId === this.producerOrg;
            }
            // Functions without auth: ReadCertificate, and CertificateExists
            default: {
                throw new Error('Authorization on this function not implemented');
            }
        }
    }

    /**
     * This method is currently the solution to finding the walled id,
     * however there might exist a more elegant solution.
     * @param idString string representing the id of the invoker
     */
    private static getWalletId(idString: string) {
        const startIndex = idString.indexOf('CN=') + 3;
        const endIndex = idString.indexOf('::', startIndex);
        return idString.substring(startIndex, endIndex);
    }
}
