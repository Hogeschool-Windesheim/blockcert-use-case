import * as path from 'path';
import {buildCCPOrg, buildWallet} from './utils/AppUtil';
import {buildCAClient, enrollAdmin, registerAndEnrollUser} from './utils/CAUtil';

const mspOrg = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet/walletFarmer');
const org1UserId = 'henk';
const caName = 'ca.org1.example.com';
const department = 'org1.department1';
const filePath = '../../../../test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';

/*
 * This app is meant for to be run on the farmer peer. Farmers should be allowed to query their own certificates,
 * and check whether or not he currently has a valid certificate.
 */
async function main() {
    try {
        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp = buildCCPOrg(filePath);

        // build an instance of the fabric ca services client based on
        // the information in the network configuration
        const caClient = buildCAClient(ccp, caName);

        // setup the wallet to hold the credentials of the application user
        const wallet = await buildWallet(walletPath);

        // in a real application this would be done on an administrative flow, and only once
        await enrollAdmin(caClient, wallet, mspOrg);

        // in a real application this would be done only when a new user was required to be added
        // and would be part of an administrative flow
        await registerAndEnrollUser(caClient, wallet, mspOrg, org1UserId, department);
       
    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
}

main();
