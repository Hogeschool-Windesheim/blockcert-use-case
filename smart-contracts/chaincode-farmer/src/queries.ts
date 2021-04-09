import {Context} from 'fabric-contract-api';

export class QueryUtil {

    ctx: Context;
    constructor(ctx) {
        this.ctx = ctx;
    }

    /**
     * Function getQueryResultForQueryString to obtain results from a given query
     * @param {Context} ctx the transaction context
     * @param {any} self within scope passed in
     * @param {string} queryString Query to perform on the state database.
     */
    async getQueryResultForQueryString(ctx, self: QueryUtil, queryString: string) {
        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        return await self.getAllResults(resultsIterator);
    }

    /**
     * Queries the ledger for all certificates with the given acquirer
     * @param {string} farmerID owner of certificate
     */
    async queryKeyByFarmerID(farmerID: string) {
        const self = this;
        if (arguments.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting farmerID to be passed.');
        }
        const queryString: any = {};
        queryString.selector = {};
        queryString.selector.id = farmerID;
        const method = self.getQueryResultForQueryString;
        return await method(this.ctx, self, JSON.stringify(queryString));
    }

    /**
     * Function getAllResults
     * @param {resultsIterator} iterator within scope passed in
     */
    async getAllResults(iterator) {
        const allResults = [];
        let res = { done: false, value: null };
        while (true) {
            res = await iterator.next();
            const jsonRes: any = {};
            if (res.value && res.value.value.toString()) {
                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            // check to see if we have reached the end
            if (res.done) {
                // explicitly close the iterator
                console.log('Completed collection of the results.');
                await iterator.close();
                return allResults;
            }

        }
    }
}
