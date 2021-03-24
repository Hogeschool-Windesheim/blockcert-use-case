import * as path from 'path';
import {Network, NetworkConfig} from './network';
import {Server} from './server';
import { ServerProducer } from './serverProducer';

/**
 * This app is meant to be run by the Certificate Body, it will have the ability to initialize the ledger,
 * and alter it afterwards. Furthermore, it is allowed to lookup certificates from this own registrationNr.
 */
async function main() {
    const networkConfig: NetworkConfig = {
        chaincodeName: 'basic',
        channelName: 'mychannel',
        caName: 'ca.org3.example.com',
        department: 'org3.department1',
        filePath: path.resolve(__dirname, '..', '..', '..', 'test-network',
            'organizations', 'peerOrganizations', 'org3.example.com', 'connection-org3.json'),
        mspOrg: 'Org3MSP',
        userId: 'appUser',
        walletPath: path.join(__dirname, 'wallet/walletProducer'),
    };
    const network = new Network();
    await network.initialize(networkConfig);
    const server = new ServerProducer(network);
    server.start();
}

main();
