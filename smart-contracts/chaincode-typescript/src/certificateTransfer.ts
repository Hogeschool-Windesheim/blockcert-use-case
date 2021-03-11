/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import {Certificate} from './certificate';
import { CertificateList } from './certificateList';

export class CertificateContext extends Context {
    
    certificateList: CertificateList;
    
    constructor() {
        super();
        // All papers are held in a list of papers
        this.certificateList = new CertificateList(this);
    }
}


@Info({title: 'CertificateTransfer', description: 'Smart contract for trading certificates'})
export class CertificateTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const certificates: Certificate[] = [
            new Certificate({
                ID: '1',
                StartDate: 'startDate',
                EndDate: 'endDate',
                CertNr: 'certNr',
                Acquirer: 'acquirer',
                Address: 'address',
                RegistrationNr: 'registrationNr',
                State: 'ISSUED'
            }),
            new Certificate({
                ID: '2',
                StartDate: 'startDate2',
                EndDate: 'endDate2',
                CertNr: 'certNr2',
                Acquirer: 'acquirer2',
                Address: 'address2',
                RegistrationNr: 'registrationNr2',
                State: 'REVOKED'
            }),
        ];

        for (const certificate of certificates) {
            await ctx.stub.putState(certificate.ID, Buffer.from(JSON.stringify(certificate)));
            console.info(`Certificate ${certificate.ID} initialized`);
        }
    }


    // CreateCertificate issues a new certificate to the world state with given details.
    @Transaction()
    public async CreateCertificate(ctx: Context, id: string, startDate: string, endDate: string, certNr: string, acquirer: string, address: string, registrationNr: string, state: string): Promise<void> {
        this.checkCertificateState(state);

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
        this.checkCertificateState(state)
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
        this.checkCertificateState(state)
        const certificateString = await this.ReadCertificate(ctx, id);
        const certificate = JSON.parse(certificateString);
        certificate.State = state;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(certificate)));
    }

    // GetAllCertificates returns all certificates found in the world state.
    // @Transaction(false)
    // @Returns('string')
    // public async GetAllCertificates(ctx: Context): Promise<string> {
    //     return "test";
    //     const allResults = [];
    //     // range query with empty string for startKey and endKey does an open-ended query of all certificates in the chaincode namespace.
    //     const iterator = await ctx.stub.getStateByRange('', '');
    //     let result = await iterator.next();
    //     while (!result.done) {
    //         const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    //         let record;
    //         try {
    //             record = JSON.parse(strValue);
    //         } catch (err) {
    //             console.log(err);
    //             record = strValue;
    //         }
    //         allResults.push({Key: result.value.key, Record: record});
    //         result = await iterator.next();
    //     }
    //     return JSON.stringify(allResults);
    // }


    @Transaction(false)
    async getAllCertificates(iterator, isHistory) {
        let allResults = [];
        let res = { done: false, value: null };

        while (true) {
            res = await iterator.next();
            let jsonRes: any = {};
            if (res.value && res.value.value.toString()) {
                if (isHistory && isHistory === true) {
                    //jsonRes.TxId = res.value.tx_id;
                    jsonRes.TxId = res.value.txId;
                    jsonRes.Timestamp = res.value.timestamp;
                    jsonRes.Timestamp = new Date((res.value.timestamp.seconds.low * 1000));
                    let ms = res.value.timestamp.nanos / 1000000;
                    jsonRes.Timestamp.setMilliseconds(ms);
                    if (res.value.is_delete) {
                        jsonRes.IsDelete = res.value.is_delete.toString();
                    } else {
                        try {
                            jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                            // report the commercial paper states during the asset lifecycle, just for asset history reporting
                            switch (jsonRes.Value.currentState) {
                                case 1:
                                    jsonRes.Value.currentState = 'ISSUED';
                                    break;
                                case 2:
                                    jsonRes.Value.currentState = 'REVOKED';
                                    break;
                                default: // else, unknown named query
                                    jsonRes.Value.currentState = 'UNKNOWN';
                            }

                        } catch (err) {
                            console.log(err);
                            jsonRes.Value = res.value.value.toString('utf8');
                        }
                    }
                } else { // non history query ..
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            // check to see if we have reached the end
            if (res.done) {
                // explicitly close the iterator 
                console.log('iterator is done');
                await iterator.close();
                return allResults;
            }

        }  // while true
    }

    private checkCertificateState(state: string){
        if (state != 'ISSUED' && state != 'REVOKED'){
            throw new Error('The certificate does not have a valid State')
        }
    }

}
