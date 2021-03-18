import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import {Gateway, GatewayOptions} from 'fabric-network';
import {createServer} from 'http';
import * as path from 'path';
import {buildCCPOrg3, buildWallet, prettyJSONString} from './utils//AppUtil';
import {buildCAClient, enrollAdmin, registerAndEnrollUser} from './utils/CAUtil';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg3 = 'Org3MSP';
const walletPath = path.join(__dirname, 'wallet/walletProducer');
const org3UserId = 'appUser';
const acquirer = 'henk';

/*
 * This app is meant to be run on the producer's peer. A producer is allowed to check whether or not a farmer's certificate
 * is valid or not.
 */
async function main() {
    try {
        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp = buildCCPOrg3();

        // build an instance of the fabric ca services client based on
        // the information in the network configuration
        const caClient = buildCAClient(ccp, 'ca.org3.example.com');

        // setup the wallet to hold the credentials of the application user
        const wallet = await buildWallet(walletPath);

        // in a real application this would be done on an administrative flow, and only once
        await enrollAdmin(caClient, wallet, mspOrg3);

        // in a real application this would be done only when a new user was required to be added
        // and would be part of an administrative flow
        await registerAndEnrollUser(caClient, wallet, mspOrg3, org3UserId, 'org3.department1');

        // Create a new gateway instance for interacting with the fabric network.
        // In a real application this would be done as the backend server session is setup for
        // a user that has been verified.
        const gateway = new Gateway();

        const gatewayOpts: GatewayOptions = {
            wallet,
            identity: org3UserId,
            discovery: { enabled: true, asLocalhost: true }, // using asLocalhost as this gateway is using a fabric network deployed locally
        };

        try {
            // setup the gateway instance
            // The user will now be able to create connections to the fabric network and be able to
            // submit transactions and query. All transactions submitted by this gateway will be
            // signed by this user using the credentials stored in the wallet.
            await gateway.connect(ccp, gatewayOpts);

            // Build a network instance based on the channel where the smart contract is deployed
            const network = await gateway.getNetwork(channelName);

            // Get the contract from the network.
            const contract = network.getContract(chaincodeName);

            // Let's try a query type operation (function).
            // This will be sent to just one peer and the results will be shown.
            let result = await contract.evaluateTransaction('CheckCertificateFromFarmerIsIssued', acquirer);
            console.log(`*** Result: ${prettyJSONString(result.toString())}`);

            const result2 = await contract.evaluateTransaction('CheckCertificateFromFarmerIsIssued', 'acquirer2');
            console.log(`*** Result: ${prettyJSONString(result2.toString())}`);

            const server = createServer(app).listen(4100, () => {
                console.log(`Server started on ${4100}`);
            });
            app.get('/certificate', async (req, res) => {
                result = await contract.evaluateTransaction('GetAllCertificates');
                console.log(result);
                res.json({
                    success: true,
                    message: JSON.parse(result.toString()),
                });
            });
        } finally {
            // Disconnect from the gateway when the application is closing
            // This will close all connections to the network
            // gateway.disconnect();
        }
    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
}

main();
