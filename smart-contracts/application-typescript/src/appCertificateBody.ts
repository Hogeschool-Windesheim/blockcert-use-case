import * as path from 'path';
import {Network, NetworkConfig} from './network';
import {Server} from './server';

/**
 * This app is meant to be run by the Certificate Body, it will have the ability to initialize the ledger,
 * and alter it afterwards. Furthermore, it is allowed to lookup certificates from this own registrationNr.
 */
async function main() {
    const networkConfig: NetworkConfig = {
        chaincodeName: 'basic',
        channelName: 'mychannel',
        caName: 'ca.org2.example.com',
        department: 'org2.department1',
        filePath: path.resolve(__dirname, '..', '..', '..', 'test-network',
            'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json'),
        mspOrg: 'Org2MSP',
        userId: 'appUser',
        walletPath: path.join(__dirname, 'wallet/walletCert'),
    };
    const network = new Network();
    await network.initialize(networkConfig);
    const server = new Server(network);
    server.start();
}

main();
