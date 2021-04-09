import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import {AccessControll} from './accessControll';
import {Farmer} from './farmer';

/**
 * This file describes all operations allowed on farmers, such as creating, updating, deleting, and quering certificates.
 */
@Info({title: 'FarmerLogic', description: 'Smart contract for trading certificates'})
export class FarmerLogic extends Contract {

    /**
     * CreateCertificate issues a new certificate to the world state with given details.
     * @param {Context} ctx  the transaction context
     * @param {string} id the id of the certificate
     * @param {string} address the address of the owner
     * @param {string} firstName of the farmer
     * @param {string} lastName of the farmer
     */
    @Transaction()
    public async createFarmer(ctx: Context, id: string, address: string, firstName: string, lastName: string): Promise<void> {
        const isAuthorized = AccessControll.isAuthorized(this.createFarmer.name, ctx.clientIdentity, null);
        if (isAuthorized) {
            const farmer: Farmer = new Farmer(id, address, firstName, lastName);
            await ctx.stub.putState(id, Buffer.from(JSON.stringify(farmer)));
        } else {
            throw new Error('Action not allowed by this user');
        }
    }

    /**
     * CreateCertificate issues a new certificate to the world state with given details.
     * @param {Context} ctx  the transaction context
     * @param {string} id the id of the certificate
     * @param {string} address the address of the owner
     * @param {string} firstName of the farmer
     * @param {string} lastName of the farmer
     */
    @Transaction()
    public async updateFarmer(ctx: Context, id: string, address: string, firstName: string, lastName: string): Promise<void> {
        const isAuthorized = AccessControll.isAuthorized(this.createFarmer.name, ctx.clientIdentity, null);
        if (isAuthorized) {
            const exists = await this.farmerExists(ctx, id);
            if (!exists) {
                throw new Error(`The certificate ${id} does not exist`);
            }
            const farmer: Farmer = new Farmer(id, address, firstName, lastName);
            await ctx.stub.putState(id, Buffer.from(JSON.stringify(farmer)));
        } else {
            throw new Error('Action not allowed by this user');
        }
    }

    /**
     * deleteFarmer deletes an given farmer from the world state.
     * @param {Context} ctx the transaction context
     * @param {string} id the id of the farmer to be deleted
     */
    @Transaction()
    public async deleteFarmer(ctx: Context, id: string): Promise<void> {
        const isAuthorized = AccessControll.isAuthorized(this.deleteFarmer.name, ctx.clientIdentity, null);
        if (isAuthorized) {
            const exists = await this.farmerExists(ctx, id);
            if (!exists) {
                throw new Error(`The certificate ${id} does not exist`);
            }
            return ctx.stub.deleteState(id);
        } else {
            throw new Error('Action not allowed by this user');
        }
    }

    /**
     * @param {Context} ctx the transaction context
     * @param {string} id the id of the farmer for which we are checking if it exists.
     * @return {Promise<boolean>} whether farmer exists or not.
     */
    @Transaction(false)
    @Returns('boolean')
    public async farmerExists(ctx: Context, id: string): Promise<boolean> {
        const certificateJSON = await ctx.stub.getState(id);
        return certificateJSON && certificateJSON.length > 0;
    }

    /**
     * GetAllCertificates returns all certificates found in the world state.
     * @param {Context} ctx the transaction context
     */
    @Transaction(false)
    @Returns('string')
    public async getAllFarmers(ctx: Context): Promise<string> {
        const isAuthorized = AccessControll.isAuthorized(this.getAllFarmers.name, ctx.clientIdentity, null);
        if (isAuthorized) {
            const allResults = [];
            // range query with empty string for startKey and endKey does an open-ended query of all farmers in the chaincode namespace.
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
                if (record.id) {
                    allResults.push({Key: result.value.key, Record: record});
                }
                result = await iterator.next();
            }
            return JSON.stringify(allResults);
        } else {
            throw new Error('Action not allowed by this user');
        }
    }
}
