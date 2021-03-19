/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Certificate } from './certificate';
import { QueryUtils } from './queries';

/*
 * This file describes all operations allowed on the blockchain, such as creating, updating, deleting, and quering certificates.
 */
@Info({ title: 'CertificateLogic', description: 'Smart contract for trading certificates' })
export class CertificateLogic extends Contract {

    /*
     * This function initialized the ledger with some initial data. 
     * When moving to production, this will likely have to be altered.
     */
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


    /** 
     * CreateCertificate issues a new certificate to the world state with given details.
     * @param {Context} ctx  the transaction context
     * @param {string} id the id of the certificate
     * @param {string} startDate the start date of the certificate
     * @param {string} endDate the end date of the certificate
     * @param {string} certNr the certification number
     * @param {string} acquirer the current owner of the certificate
     * @param {string} address the address of the owner
     * @param {string} registrationNr the id of the certificate body who issued the certificate
     * @param {string} state the current state of the certificate
     */
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

    /** 
     * ReadCertificate returns the certificate stored in the world state with given id.
     * @param {Context} ctx the transaction context
     * @param {string} id the id of the certificate to be read
     */
    @Transaction(false)
    public async ReadCertificate(ctx: Context, id: string): Promise<string> {
        const certificateJSON = await ctx.stub.getState(id); // get the certificate from chaincode state
        if (!certificateJSON || certificateJSON.length === 0) {
            throw new Error(`The certificate ${id} does not exist`);
        }
        return certificateJSON.toString();
    }

    /** UpdateCertificate updates an existing certificate in the world state with provided parameters.
     * @param {Context} ctx  the transaction context
     * @param {string} id the id of the certificate to be updated
     * @param {string} startDate the new start date of the certificate
     * @param {string} endDate the new end date of the certificate
     * @param {string} certNr the new certification number
     * @param {string} acquirer the new current owner of the certificate
     * @param {string} address the new address of the owner
     * @param {string} registrationNr the new id of the certificate body who issued the certificate
     * @param {string} state the new state of the certificate
     */
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

    /** 
     * DeleteCertificate deletes an given certificate from the world state.
     * @param {Context} ctx the transaction context
     * @param {string} id the id of the certificate to be deleted
     */
    @Transaction()
    public async DeleteCertificate(ctx: Context, id: string): Promise<void> {
        const exists = await this.CertificateExists(ctx, id);
        if (!exists) {
            throw new Error(`The certificate ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }


    /**
     * CertificateExists returns true iff certificate with given ID exists in world state.
     * @param {Context} ctx the transaction context
     * @param {string} id the id of the certificate for which we are checking if it exists
     */
    @Transaction(false)
    @Returns('boolean')
    public async CertificateExists(ctx: Context, id: string): Promise<boolean> {
        const certificateJSON = await ctx.stub.getState(id);
        return certificateJSON && certificateJSON.length > 0;
    }

    /**
     * UpdateState updates the state field of certificate with given id in the world state.
     * @param {Context} ctx the transaction context
     * @param {string} id the id of the certificate to be updated
     * @param {string} state the new state of the certificate
     */
    @Transaction()
    public async UpdateState(ctx: Context, id: string, state: string): Promise<void> {
        const certificateString = await this.ReadCertificate(ctx, id);
        const certificate = JSON.parse(certificateString);
        certificate.State = state;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(certificate)));
    }

    /**
     * GetAllCertificates returns all certificates found in the world state.
     * @param {Context} ctx the transaction context
     */
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
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    /**
     * CheckCertificateFromFarmerIsIssued returns true iff the farmer currently has any ISSUED certificate
     * @param {Context} ctx the transaction context
     * @param {string} acquirer the id of the farmer for who we are checking
     */
    @Transaction(false)
    @Returns('boolean')
    public async CheckCertificateFromFarmerIsIssued(ctx: Context, acquirer: string): Promise<boolean> {
        let query = new QueryUtils(ctx);
        let owner_results = await query.queryByAcquirerAndState(acquirer, 'ISSUED');

        return (owner_results.length > 0)
    }


    /**
     * queryOwner commercial paper: supply name of owning org, to find list of papers based on owner field
     * @param {Context} ctx the transaction context
     * @param {String} acquirer the acquirer who we want to query for
     */
    @Transaction(false)
    @Returns('string')
    public async queryAcquirer(ctx: Context, acquirer: string): Promise<string> {
        let query = new QueryUtils(ctx);
        let owner_results = await query.queryKeyByAcquirer(acquirer);

        return owner_results;
    }

    /**
     * queryOwner commercial paper: supply name of owning org, to find list of papers based on owner field
     * @param {Context} ctx the transaction context
     * @param {String} state the state for which we are querying
     */
    @Transaction(false)
    @Returns('string')
    public async queryState(ctx: Context, state: string): Promise<string> {
        let query = new QueryUtils(ctx);
        let owner_results = await query.queryKeyByState(state);

        return owner_results;
    }

    /**
     * queryOwner commercial paper: supply name of owning org, to find list of papers based on owner field
     * @param {Context} ctx the transaction context
     * @param {String} registrationNr the registration number which we are querying
     */
    @Transaction(false)
    @Returns('string')
    public async queryRegistrationNr(ctx: Context, registrationNr: string): Promise<string> {
        let query = new QueryUtils(ctx);
        let owner_results = await query.queryByRegistrationNr(registrationNr);

        return owner_results;
    }
}