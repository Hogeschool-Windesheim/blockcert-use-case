import {Context} from 'fabric-contract-api';
import {Iterators} from 'fabric-shim';

export class QueryUtils {

    ctx: Context;
    constructor(ctx) {
        this.ctx = ctx;
    }

    /**
     * Queries the ledger for all certificates with the given acquirer
     * @param {string} acquirer owner of certificate
     */
    async queryKeyByAcquirer(acquirer: string): Promise<string[]> {
        const self = this;
        if (arguments.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting acquirer name.');
        }
        const queryString: any = {};
        queryString.selector = {};
        queryString.selector.AcquirerID = acquirer;
        const method = self.getQueryResultForQueryString;
        return await method(this.ctx, self, JSON.stringify(queryString));
    }

    /**
     * Queries the ledger for all certificates with the given state
     * @param {string} state the state of a certificate
     */
    async queryKeyByState(state: string): Promise<string[]> {
        const self = this;
        if (arguments.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting state name.');
        }
        const queryString: any = {};
        queryString.selector = {};
        queryString.selector.State = state;
        const method = self.getQueryResultForQueryString;
        return await method(this.ctx, self, JSON.stringify(queryString));
    }

    /**
     * Queries the ledger for all certificates with the given acquirer and state
     * @param {string} acquirer the owner of a certificate
     * @param {string} state the state of a certificate
     */
    async queryByAcquirerAndState(acquirer: string, state: string): Promise<string[]> {
        const self = this;
        if (arguments.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting state name.');
        }
        const queryString: any = {};
        queryString.selector = {};
        queryString.selector.State = state;
        queryString.selector.Acquirer = acquirer;
        const method = self.getQueryResultForQueryString;
        return await method(this.ctx, self, JSON.stringify(queryString));
    }

    /**
     * Queries the ledger for all certificates with the given registration number
     * @param {string} registrationNr the id of the certificate body which issued a certificate
     */
    async queryByRegistrationNr(registrationNr: string): Promise<string[]> {
        const self = this;
        if (arguments.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting state name.');
        }
        const queryString: any = {};
        queryString.selector = {};
        //  queryString.selector.docType = 'indexOwnerDoc';
        queryString.selector.RegistrationNr = registrationNr;
        // set to (eg)  '{selector:{owner:MagnetoCorp}}'
        const method = self.getQueryResultForQueryString;
        return await method(this.ctx, self, JSON.stringify(queryString));
    }

    /**
     * Function getQueryResultForQueryString
     * @param {Context} ctx the transaction context
     * @param {any} self within scope passed in
     * @param {String} queryString the query string created prior to calling this fn
     */
    async getQueryResultForQueryString(ctx, self, queryString): Promise<string[]> {
        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        return await self.getAllResults(resultsIterator, false);
    }

    /**
     * Function getAllResults to obtain all the certificates that are related to a query. This function
     * acts as a helper for the query functions of the QueryUtility.
     * @param {StateQueryIterator} iterator within scope passed onto this function to extract all results.
     * Note that no size checks are in place, so out-of-memory may occur for a very large result set.
     * @param {Boolean} isHistory query string created prior to invoking getAllResults.
     */
    async getAllResults(iterator: Iterators.StateQueryIterator, isHistory): Promise<string[]> {
        const allResults = [];
        let res = { done: false, value: null };

        while (true) {
            res = await iterator.next();
            const jsonRes: any = {};
            if (res.value && res.value.value.toString()) {
                if (isHistory && isHistory === true) {
                    console.log('not yet implemented');
                    // TODO this part

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
}
