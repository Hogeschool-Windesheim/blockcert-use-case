 export class QueryUtils {

    ctx;
    constructor(ctx) {
        this.ctx = ctx;
        //this.supportedTypes = {};
    }
 // ===== Example: Parameterized rich query =================================================
    // queryKeyByOwner queries for assets based on a passed in owner.
    // This is an example of a parameterized query accepting a single query parameter (owner).
    // Only available on state databases that support rich query (e.g. CouchDB)
    // =========================================================================================
    /**
    * queryKeyByOwner commercial paper
    * @param {String} acquirer commercial paper owner
    */
     async queryKeyByOwner(acquirer) {
        //  
        let self = this;
        if (arguments.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting owner name.');
        }
        let queryString: any = {};
        queryString.selector = {};
        //  queryString.selector.docType = 'indexOwnerDoc';
        queryString.selector.Acquirer = acquirer;
        // set to (eg)  '{selector:{owner:MagnetoCorp}}'
        let method = self.getQueryResultForQueryString;
        let queryResults = await method(this.ctx, self, JSON.stringify(queryString));
        return queryResults;
    }


    /**
    * queryKeyByOwner commercial paper
    * @param {String} acquirer commercial paper owner
    */
     async queryKeyByState(state) {
        //  
        let self = this;
        if (arguments.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting state name.');
        }
        let queryString: any = {};
        queryString.selector = {};
        //  queryString.selector.docType = 'indexOwnerDoc';
        queryString.selector.State = state;
        // set to (eg)  '{selector:{owner:MagnetoCorp}}'
        let method = self.getQueryResultForQueryString;
        let queryResults = await method(this.ctx, self, JSON.stringify(queryString));
        return queryResults;
    }
    
     

      // =========================================================================================
    // getQueryResultForQueryString woerk function executes the passed-in query string.
    // Result set is built and returned as a byte array containing the JSON results.
    // =========================================================================================
    /**
     * Function getQueryResultForQueryString
     * @param {Context} ctx the transaction context
     * @param {any}  self within scope passed in
     * @param {String} the query string created prior to calling this fn
    */
    async getQueryResultForQueryString(ctx, self, queryString) {

        // console.log('- getQueryResultForQueryString queryString:\n' + queryString);

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