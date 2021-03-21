import {CertificateLogic} from './certificateLogic';
import { ClientIdentity } from 'fabric-shim';

const cert = new CertificateLogic()
const farmerOrg = 'Org1MSP'
const certBodyOrg = 'Org2MSP'
const producerOrg = 'Org3MSP'

export class AccessControll {
    static isAuthorized(methodInvoked: string, clientIdentity: ClientIdentity, queryValue: string): Boolean{
        switch (methodInvoked){
            // Match all funcitons which only the certification body is allowed to perform
            case cert.DeleteCertificate.name:
            case cert.UpdateCertificate.name:
            case cert.UpdateState.name:
            case cert.GetAllCertificates.name:
            case cert.queryState.name:
            case cert.CreateCertificate.name: {
                return (clientIdentity.getMSPID() === certBodyOrg) ? true : false;
            }
            // The certBody, all producers, and the acquirer of a certificate are allowed to check whether or not he has a valid cert
            case cert.CheckCertificateFromFarmerIsIssued.name: {
                const mspId = clientIdentity.getMSPID();
                if (mspId === certBodyOrg || mspId === producerOrg) return true;
                clientIdentity.getID();
                return false;
            }
            default: {
                throw new Error("Authorization on this function not implemented")
            }
        }

    }
}