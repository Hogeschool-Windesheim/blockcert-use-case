import * as path from 'path';
import {Network, NetworkConfig} from './network';
import {ServerFarmer} from './serverFarmer';

/**
 * This app is meant to be run by the Certificate Body, it will have the ability to initialize the ledger,
 * and alter it afterwards. Furthermore, it is allowed to lookup certificates from this own registrationNr.
 */
async function main() {
    const networkConfig: NetworkConfig = {
        chaincodeName: 'basic',
        channelName: 'mychannel',
        caName: 'ca.org1.example.com',
        department: 'org1.department1',
        filePath: path.resolve(__dirname, '..', '..', '..', 'test-network',
            'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json'),
        mspOrg: 'Org1MSP',
        userId: 'appUser',
        walletPath: path.join(__dirname, 'wallet/walletFarmer'),
    };
    const network = new Network();
    await network.initialize(networkConfig);
    const server = new ServerFarmer(network);
    server.start();
}

main();
