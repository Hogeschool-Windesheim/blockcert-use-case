/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import {Certificate} from './certificate';

@Info({title: 'CertificateTransfer', description: 'Smart contract for trading certificates'})
export class CertificateTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const certificates: Certificate[] = [
            {
                ID: '1',
                StartDate: 'startDate',
                EndDate: 'endDate',
                CertNr: 'certNr',
                Acquirer: 'henk',
                Address: 'address',
                RegistrationNr: 'registrationNr',
                State: 'ISSUED'
            },
            {
                ID: '2',
                StartDate: 'startDate2',
                EndDate: 'endDate2',
                CertNr: 'certNr2',
                Acquirer: 'acquirer2',
                Address: 'address2',
                RegistrationNr: 'registrationNr2',
                State: 'REVOKED'
            },
        ];

        for (const certificate of certificates) {
            await ctx.stub.putState(certificate.ID, Buffer.from(JSON.stringify(certificate)));
            console.info(`Certificate ${certificate.ID} initialized`);
        }
    }


    // CreateCertificate issues a new certificate to the world state with given details.
    @Transaction()
    public async CreateCertificate(ctx: Context, id: string, startDate: string, endDate: string, certNr: string, acquirer: string, address: string, registrationNr: string, state: string): Promise<void> {
        const certificate = {
            ID: id,
            StartDate: startDate,
            EndDate: endDate,
            CertNr: certNr,
            Acquirer: acquirer,
            Address: address,
            RegistrationNr: registrationNr,
            State: state
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(certificate)));
    }

    // ReadCertificate returns the certificate stored in the world state with given id.
    @Transaction(false)
    public async ReadCertificate(ctx: Context, id: string): Promise<string> {
        const certificateJSON = await ctx.stub.getState(id); // get the certificate from chaincode state
        if (!certificateJSON || certificateJSON.length === 0) {
            throw new Error(`The certificate ${id} does not exist`);
        }
        return certificateJSON.toString();
    }

    // UpdateCertificate updates an existing certificate in the world state with provided parameters.
    @Transaction()
    public async UpdateCertificate(ctx: Context, id: string, startDate: string, endDate: string, certNr: string, acquirer: string, address: string, registrationNr: string, state: string): Promise<void> {
        const exists = await this.CertificateExists(ctx, id);
        if (!exists) {
            throw new Error(`The certificate ${id} does not exist`);
        }

        // overwriting original certificate with new certificate
        const updatedCertificate = {
            ID: id,
            StartDate: startDate,
            EndDate: endDate,
            CertNr: certNr,
            Acquirer: acquirer,
            Address: address,
            RegistrationNr: registrationNr,
            State: state
        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedCertificate)));
    }

    // DeleteCertificate deletes an given certificate from the world state.
    @Transaction()
    public async DeleteCertificate(ctx: Context, id: string): Promise<void> {
        const exists = await this.CertificateExists(ctx, id);
        if (!exists) {
            throw new Error(`The certificate ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }


    // CertificateExists returns true when certificate with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async CertificateExists(ctx: Context, id: string): Promise<boolean> {
        const certificateJSON = await ctx.stub.getState(id);
        return certificateJSON && certificateJSON.length > 0;
    }

    // UpdateState updates the state field of certificate with given id in the world state.
    @Transaction()
    public async UpdateState(ctx: Context, id: string, state: string): Promise<void> {
        const certificateString = await this.ReadCertificate(ctx, id);
        const certificate = JSON.parse(certificateString);
        certificate.State = state;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(certificate)));
    }

    // GetAllCertificates returns all certificates found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllCertificates(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all certificates in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({Key: result.value.key, Record: record});
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // GetAllIssuedCertificates returns all currently issued certificates found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllIssuedCertificates(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all certificates in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record: any;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.State === 'ISSUED'){
                allResults.push({Key: result.value.key, Record: record});
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

     // GetAllIssuedCertificates returns all currently issued certificates found in the world state.
     @Transaction(false)
     @Returns('string')
     public async GetAllCertificatesFromFarmer(ctx: Context, acquirer: string): Promise<string> {
         const allResults = [];
         // range query with empty string for startKey and endKey does an open-ended query of all certificates in the chaincode namespace.
         const iterator = await ctx.stub.getStateByRange('', '');
         let result = await iterator.next();
         while (!result.done) {
             const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
             let record: any;
             try {
                 record = JSON.parse(strValue);
             } catch (err) {
                 console.log(err);
                 record = strValue;
             }
             if (record.Acquirer === acquirer){
                 allResults.push({Key: result.value.key, Record: record});
             }
             result = await iterator.next();
         }
         return JSON.stringify(allResults);
     }

     // GetAllIssuedCertificates returns all currently issued certificates found in the world state.
     @Transaction(false)
     @Returns('boolean')
     public async CheckCertificateFromFarmerIsIssued(ctx: Context, acquirer: string): Promise<boolean> {
         const allResults = [];
         // range query with empty string for startKey and endKey does an open-ended query of all certificates in the chaincode namespace.
         const iterator = await ctx.stub.getStateByRange('', '');
         let result = await iterator.next();
         while (!result.done) {
             const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
             let record: any;
             try {
                 record = JSON.parse(strValue);
             } catch (err) {
                 console.log(err);
                 record = strValue;
             }
             if (record.Acquirer === acquirer && record.State === 'ISSUED'){
                 allResults.push({Key: result.value.key, Record: record});
             }
             result = await iterator.next();
         }
         return (allResults.length > 0);
     }

     

}
