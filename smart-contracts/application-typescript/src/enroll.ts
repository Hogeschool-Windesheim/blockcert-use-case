import * as path from 'path';
import {Network} from './network';
import {getArguments, NetworkConfig} from './utils/NetworkConfig';

/*
 * This app is meant for to be run on the farmer peer. Farmers should be allowed to query their own certificates,
 * and check whether or not he currently has a valid certificate.
 */
async function main() {
    const networkConfiguration: NetworkConfig = getArguments();
    networkConfiguration.walletPath = path.join(__dirname, networkConfiguration.walletPath);
    const network = new Network();
    await network.initialize(networkConfiguration);
}

main();
