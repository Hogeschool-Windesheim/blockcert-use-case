import {State} from '../ledger-api/state'

export class QueryUtils {
    ctx;
    name;

    constructor(ctx, listName){
        this.ctx = ctx;
        this.name = listName;
    }

    async getAssetHistory(id: string): Promise<any>{
        const resultsIterator = await this.ctx.stub.getHistoryForKey(id);
        let results = await this.getAllResults(resultsIterator, true);
        return results;
    }

    async getAllResults(iterator, isHistory): Promise<any> {
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
    
}