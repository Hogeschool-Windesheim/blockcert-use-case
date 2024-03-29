import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import {AccessControl} from './accessControl';
import {Certificate} from './certificate';
import {QueryUtils} from './queries';
import {Utility} from './utility';

/**
 * This file describes all operations allowed on the blockchain, such as creating, updating, deleting, and quering certificates.
 */
@Info({title: 'CertificateLogic', description: 'Smart contract for trading certificates'})
export class CertificateLogic extends Contract {
    certificates: Certificate[] = [
        {
            ID: '1',
            StartDate: '03-10-2021',
            EndDate: '03-30-2021',
            CertNr: 'certNr',
            AcquirerID: '4736',
            RegistrationNr: 'registrationNr',
            CertificateURL: 'www.test.nl',
            State: 'ISSUED',
        },
        {
            ID: '2',
            StartDate: '03-10-2021',
            EndDate: '03-22-2021',
            CertNr: 'certNr2',
            AcquirerID: '1231',
            RegistrationNr: 'registrationNr2',
            CertificateURL: 'www.template.nl',
            State: 'ISSUED',
        },
    ];
    /**
     * This function initialized the ledger with some initial data.
     * When moving to production, this will likely have to be altered.
     */
    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        for (const certificate of this.certificates) {
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
     * @param {string} acquirerID id of the owner of the certificate
     * @param {string} registrationNr the id of the certificate body who issued the certificate
     * @param {string} certificateURL link to the official certificate
     * @param {string} state the current state of the certificate
     */
    @Transaction()
    public async CreateCertificate(ctx: Context, id: string, startDate: string, endDate: string, certNr: string, acquirerID: string,
                                   registrationNr: string, certificateURL: string, state: string): Promise<void> {
        const isAuthorized = AccessControl.isAuthorized(this.CreateCertificate.name, ctx.clientIdentity, null);
        if (isAuthorized) {
            Utility.checkStateValidity(state);
            const certificate: Certificate = {
                ID: id,
                StartDate: startDate,
                EndDate: endDate,
                CertNr: certNr,
                AcquirerID: acquirerID,
                RegistrationNr: registrationNr,
                CertificateURL: certificateURL,
                State: state,
            };
            await ctx.stub.putState(id, Buffer.from(JSON.stringify(certificate)));
        } else {
            throw new Error('Action not allowed by this user');
        }
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

    /**
     * UpdateCertificate updates a pre-existing certificate in the world state with provided parameters.
     * Requires the request to be performed by an Authorized party, using a valid update state. Otherwise,
     * Errors are thrown to indicate incorrect invocation.
     * @param {Context} ctx  the transaction context
     * @param {string} id the id of the certificate to be updated
     * @param {string} startDate the new start date of the certificate
     * @param {string} endDate the new end date of the certificate
     * @param {string} certNr the new certification number
     * @param {string} acquirerID id of the new owner of the certificate
     * @param {string} registrationNr the new id of the certificate body who issued the certificate
     * @param {string} certificateURL link to the official certificate
     * @param {string} state the new state of the certificate
     */
    @Transaction()
    public async UpdateCertificate(ctx: Context, id: string, startDate: string, endDate: string, certNr: string, acquirerID: string,
                                   registrationNr: string, certificateURL: string, state: string): Promise<void> {
        const isAuthorized = AccessControl.isAuthorized(this.UpdateCertificate.name, ctx.clientIdentity, null);
        if (isAuthorized) {
            Utility.checkStateValidity(state);
            const exists = await this.CertificateExists(ctx, id);
            if (!exists) {
                throw new Error(`The certificate ${id} does not exist`);
            }
            // overwriting original certificate with new certificate
            const updatedCertificate: Certificate = {
                ID: id,
                StartDate: startDate,
                EndDate: endDate,
                CertNr: certNr,
                AcquirerID: acquirerID,
                RegistrationNr: registrationNr,
                CertificateURL: certificateURL,
                State: state,
            };
            return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedCertificate)));
        } else {
            throw new Error('Action not allowed by this user');
        }
    }

    /**
     * DeleteCertificate deletes an given certificate from the world state.
     * @param {Context} ctx the transaction context
     * @param {string} id the id of the certificate to be deleted
     */
    @Transaction()
    public async DeleteCertificate(ctx: Context, id: string): Promise<void> {
        const isAuthorized = AccessControl.isAuthorized(this.DeleteCertificate.name, ctx.clientIdentity, null);
        if (isAuthorized) {
            const exists = await this.CertificateExists(ctx, id);
            if (!exists) {
                throw new Error(`The certificate ${id} does not exist`);
            }
            return ctx.stub.deleteState(id);
        } else {
            throw new Error('Action not allowed by this user');
        }
    }

    /**
     * CertificateExists returns true iff certificate with given ID exists in world state. Note that
     * this function does not perform access control, and thus requires the caller to invoke this function
     * after verifying the authorization of a request.
     * @param {Context} ctx the transaction context.
     * @param {string} id the id of the certificate for which we are checking if it exists.
     */
    @Transaction(false)
    @Returns('boolean')
    public async CertificateExists(ctx: Context, id: string): Promise<boolean> {
        const certificateJSON = await ctx.stub.getState(id);
        return certificateJSON && certificateJSON.length > 0;
    }

    /**
     * UpdateState updates the state field of certificate with given id in the world state.
     * Note that ReadCertificate also checks for existence of certificate, as such no access control
     * checks are performed by this function itself.
     * @param {Context} ctx the transaction context
     * @param {string} id the id of the certificate to be updated
     * @param {string} state the new state of the certificate
     */
    @Transaction()
    public async UpdateState(ctx: Context, id: string, state: string): Promise<void> {
        const isAuthorized = AccessControl.isAuthorized(this.UpdateState.name, ctx.clientIdentity, null);
        if (isAuthorized) {
            Utility.checkStateValidity(state);
            const certificateString = await this.ReadCertificate(ctx, id);
            const certificate = JSON.parse(certificateString);
            certificate.State = state;
            await ctx.stub.putState(id, Buffer.from(JSON.stringify(certificate)));
        } else {
            throw new Error('Action not allowed by this user');
        }
    }

    /**
     * GetAllCertificates returns all certificates found in the world state. Note that this function is untested
     * as testing this becomes a complex mocking exercise. As such, a different testing approach is needed
     * for this piece of code.
     * @param {Context} ctx the transaction context
     */
    @Transaction(false)
    @Returns('string')
    public async GetAllCertificates(ctx: Context): Promise<string> {
        const isAuthorized = AccessControl.isAuthorized(this.GetAllCertificates.name, ctx.clientIdentity, null);
        if (isAuthorized) {
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
        } else {
            throw new Error('Action not allowed by this user');
        }
    }

    /**
     * CheckCertificateFromFarmerIsIssued returns true iff the farmer currently has any ISSUED certificate
     * @param {Context} ctx the transaction context
     * @param {string} acquirer the id of the farmer for who we are checking
     */
    @Transaction(false)
    @Returns('boolean')
    public async CheckCertificateFromAcquirerIsIssued(ctx: Context, acquirer: string): Promise<boolean> {
        const isAuthorized = AccessControl.isAuthorized(this.CheckCertificateFromAcquirerIsIssued.name, ctx.clientIdentity, acquirer);
        if (isAuthorized) {
            const query = new QueryUtils(ctx);
            const queryResults = await query.queryByAcquirerAndState(acquirer, 'ISSUED');

            return (queryResults.length > 0);
        } else {
            throw new Error('Action not allowed by this user');
        }
    }

    /**
     * queryAcquirer returns all certificates belonging to the acquirer
     * @param {Context} ctx the transaction context
     * @param {String} acquirer the acquirer id who we want to query for
     */
    @Transaction(false)
    @Returns('string')
    public async queryAcquirer(ctx: Context, acquirer: string): Promise<string[]> {
        const isAuthorized = AccessControl.isAuthorized(this.queryAcquirer.name, ctx.clientIdentity, acquirer);
        if (isAuthorized) {
            const query = new QueryUtils(ctx);
            return await query.queryKeyByAcquirer(acquirer);
        } else {
            throw new Error('Action not allowed by this user');
        }
    }

    /**
     * queryState returns all certificates having the specified state
     * @param {Context} ctx the transaction context
     * @param {String} state the state for which we are querying
     */
    @Transaction(false)
    @Returns('string')
    public async queryState(ctx: Context, state: string): Promise<string[]> {
        const isAuthorized = AccessControl.isAuthorized(this.queryState.name, ctx.clientIdentity, null);
        if (isAuthorized) {
            const query = new QueryUtils(ctx);
            return await query.queryKeyByState(state);
        } else {
            throw new Error('Action not allowed by this user');
        }
    }

    /**
     * queryState returns all certificates issued by a certain certification body
     * @param {Context} ctx the transaction context
     * @param {String} registrationNr the registration number which we are querying
     */
    @Transaction(false)
    @Returns('string')
    public async queryRegistrationNr(ctx: Context, registrationNr: string): Promise<string[]> {
        const isAuthorized = AccessControl.isAuthorized(this.queryRegistrationNr.name, ctx.clientIdentity, null);
        if (isAuthorized) {
            const query = new QueryUtils(ctx);
            return await query.queryByRegistrationNr(registrationNr);
        } else {
            throw new Error('Action not allowed by this user');
        }
    }

    /**
     * Function which updates all expired certificates in the ledger
     * NOTE: this function rules certificates on the same date still as valid,
     * it only expires certificates with endDate < currentDate.
     * @param ctx the transaction context
     */
    @Transaction(false)
    public async updateStateAllCertificates(ctx: Context): Promise<void> {
        const rawResult: any[] = await this.queryState(ctx, 'ISSUED');
        const date = new Date();
        for (const certificate of rawResult) {
            const certDate: Date = Utility.stringToDate(certificate.Record.EndDate);
            if (certDate <= date) {
                await this.UpdateState(ctx, certificate.Record.ID, 'EXPIRED');
            }
        }
    }
}
