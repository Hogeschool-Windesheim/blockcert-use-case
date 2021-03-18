import { Context } from 'fabric-contract-api';

export class QueryUtils {

    ctx: Context;
    constructor(ctx) {
        this.ctx = ctx;
    }


    /** 
     * Queries the ledger for all certificates with the given acquirer
     * @param {string} acquirer owner of certificate
     */
    async queryKeyByAcquirer(acquirer: string) {
        let self = this;
        if (arguments.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting acquirer name.');
        }
        let queryString: any = {};
        queryString.selector = {};
        queryString.selector.Acquirer = acquirer;
        let method = self.getQueryResultForQueryString;
        let queryResults = await method(this.ctx, self, JSON.stringify(queryString));
        return queryResults;
    }


    /**
     * Queries the ledger for all certificates with the given state
     * @param {string} state the state of a certificate
     */
    async queryKeyByState(state: string) {
        let self = this;
        if (arguments.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting state name.');
        }
        let queryString: any = {};
        queryString.selector = {};
        queryString.selector.State = state;
        let method = self.getQueryResultForQueryString;
        let queryResults = await method(this.ctx, self, JSON.stringify(queryString));
        return queryResults;
    }


    /**
     * Queries the ledger for all certificates with the given acquirer and state
     * @param {string} acquirer the owner of a certificate
     * @param {string} state the state of a certificate
     */
    async queryByAcquirerAndState(acquirer: string, state: string) {
        let self = this;
        if (arguments.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting state name.');
        }
        let queryString: any = {};
        queryString.selector = {};
        queryString.selector.State = state;
        queryString.selector.Acquirer = acquirer;
        let method = self.getQueryResultForQueryString;
        let queryResults = await method(this.ctx, self, JSON.stringify(queryString));
        return queryResults;
    }


    /**
     * Queries the ledger for all certificates with the given registration number
     * @param {string} registrationNr the id of the certificate body which issued a certificate
     */
    async queryByRegistrationNr(registrationNr: string) {
        let self = this;
        if (arguments.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting state name.');
        }
        let queryString: any = {};
        queryString.selector = {};
        //  queryString.selector.docType = 'indexOwnerDoc';
        queryString.selector.RegistrationNr = registrationNr;
        // set to (eg)  '{selector:{owner:MagnetoCorp}}'
        let method = self.getQueryResultForQueryString;
        let queryResults = await method(this.ctx, self, JSON.stringify(queryString));
        return queryResults;
    }


    /**
     * Function getQueryResultForQueryString
     * @param {Context} ctx the transaction context
     * @param {any} self within scope passed in
     * @param {String} the query string created prior to calling this fn
     */
    async getQueryResultForQueryString(ctx, self, queryString) {
        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        let results = await self.getAllResults(resultsIterator, false);

        return results;
    }


    /**
     * Function getAllResults
     * @param {resultsIterator} iterator within scope passed in
     * @param {Boolean} isHistory query string created prior to calling this fn
     */
    async getAllResults(iterator, isHistory) {
        let allResults = [];
        let res = { done: false, value: null };

        while (true) {
            res = await iterator.next();
            let jsonRes: any = {};
            if (res.value && res.value.value.toString()) {
                if (isHistory && isHistory === true) {
                    console.log('not yet implemented')
                    //TODO this part

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