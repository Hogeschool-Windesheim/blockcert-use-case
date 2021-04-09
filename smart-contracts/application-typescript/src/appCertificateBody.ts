import * as path from 'path';
import {Network} from './network';
import {Server} from './server';
import {getArguments, NetworkConfig} from './utils/NetworkConfig';

/**
 * This app is meant to be run by the Certificate Body, it will have the ability to initialize the ledger,
 * and alter it afterwards. Furthermore, it is allowed to lookup certificates from this own registrationNr.
 */
async function main() {
    const networkConfiguration: NetworkConfig = getArguments();
    networkConfiguration.walletPath = path.join(__dirname, networkConfiguration.walletPath);
    const network = new Network();
    await network.initialize(networkConfiguration);
    const server = new Server(network);
    server.start(networkConfiguration.portNumber);
}

main();
