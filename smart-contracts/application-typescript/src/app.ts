import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import {Gateway, GatewayOptions} from 'fabric-network';
import {createServer} from 'http';
import * as path from 'path';
import {buildCCPOrg1, buildWallet, prettyJSONString} from './utils//AppUtil';
import {buildCAClient, enrollAdmin, registerAndEnrollUser} from './utils/CAUtil';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

// pre-requisites:
// - fabric-sample two organization test-network setup with two peers, ordering service,
//   and 2 certificate authorities
//         ===> from directory /fabric-samples/test-network
//         ./network.sh up createChannel -ca
// - Use any of the certificate-transfer-basic chaincodes deployed on the channel "mychannel"
//   with the chaincode name of "basic". The following deploy command will package,
//   install, approve, and commit the javascript chaincode, all the actions it takes
//   to deploy a chaincode to a channel.
//         ===> from directory /fabric-samples/test-network
//         ./network.sh deployCC -ccn basic -ccp ../certificate-transfer-basic/chaincode-typescript/ -ccl javascript
// - Be sure that node.js is installed
//         ===> from directory /fabric-samples/certificate-transfer-basic/application-typescript
//         node -v
// - npm installed code dependencies
//         ===> from directory /fabric-samples/certificate-transfer-basic/application-typescript
//         npm install
// - to run this test application
//         ===> from directory /fabric-samples/certificate-transfer-basic/application-typescript
//         npm start

// NOTE: If you see  kind an error like these:
/*
    2020-08-07T20:23:17.590Z - error: [DiscoveryService]: send[mychannel] - Channel:mychannel received discovery error:access denied
    ******** FAILED to run the application: Error: DiscoveryService: mychannel error: access denied

   OR

   Failed to register user : Error: fabric-ca request register failed with errors [[ { code: 20, message: 'Authentication failure' } ]]
   ******** FAILED to run the application: Error: Identity not found in wallet: appUser
*/
// Delete the /fabric-samples/certificate-transfer-basic/application-typescript/wallet directory
// and retry this application.
//
// The certificate authority must have been restarted and the saved certificates for the
// admin and application user are not valid. Deleting the wallet store will force these to be reset
// with the new certificate authority.
//

/**
 *  A test application to show basic queries operations with any of the certificate-transfer-basic chaincodes
 *   -- How to submit a transaction
 *   -- How to query and check the results
 *
 * To see the SDK workings, try setting the logging to show on the console before running
 *        export HFC_LOGGING='{"debug":"console"}'
 */
async function main() {
    try {
        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp = buildCCPOrg1();

        // build an instance of the fabric ca services client based on
        // the information in the network configuration
        const caClient = buildCAClient(ccp, 'ca.org1.example.com');

        // setup the wallet to hold the credentials of the application user
        const wallet = await buildWallet(walletPath);

        // in a real application this would be done on an administrative flow, and only once
        await enrollAdmin(caClient, wallet, mspOrg1);

        // in a real application this would be done only when a new user was required to be added
        // and would be part of an administrative flow
        await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

        // Create a new gateway instance for interacting with the fabric network.
        // In a real application this would be done as the backend server session is setup for
        // a user that has been verified.
        const gateway = new Gateway();

        const gatewayOpts: GatewayOptions = {
            wallet,
            identity: org1UserId,
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

            // Initialize a set of certificate data on the channel using the chaincode 'InitLedger' function.
            // This type of transaction would only be run once by an application the first time it was started after it
            // deployed the first time. Any updates to the chaincode deployed later would likely not need to run
            // an "init" type function.
            console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of certificates on the ledger');
            await contract.submitTransaction('InitLedger');
            console.log('*** Result: committed');

            // Let's try a query type operation (function).
            // This will be sent to just one peer and the results will be shown.
            console.log('\n--> Evaluate Transaction: GetAllCertificates, function returns all the current certificates on the ledger');
            let result = await contract.evaluateTransaction('GetAllCertificates');
            console.log(`*** Result: ${prettyJSONString(result.toString())}`);

            // Now let's try to submit a transaction.
            // This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
            // to the orderer to be committed by each of the peer's to the channel ledger.
            console.log('\n--> Submit Transaction: CreateCertificate, creates new certificate');
            await contract.submitTransaction('CreateCertificate', 'certificate13', '01-10-1312', '01-13-4212', '47718', 'boer henk', 'lepellaan 13', 'isacertid', 'ISSUED');
            console.log('*** Result: committed');

            console.log('\n--> Evaluate Transaction: ReadCertificate, function returns an certificate with a given certificateID');
            result = await contract.evaluateTransaction('ReadCertificate', 'certificate13');
            console.log(`*** Result: ${prettyJSONString(result.toString())}`);

            console.log('\n--> Evaluate Transaction: CertificateExists, function returns "true" if an certificate with given certificateID exist');
            result = await contract.evaluateTransaction('CertificateExists', 'certificate13');
            console.log(`*** Result: ${prettyJSONString(result.toString())}`);

            console.log('\n--> Submit Transaction: UpdateCertificate certificate1');
            await contract.submitTransaction('UpdateCertificate', 'certificate13', '01-10-1312', '01-13-3212', '47718', 'boer jan', 'lepellaan 13', 'isacertid', 'ISSUED');
            console.log('*** Result: committed');

            console.log('\n--> Evaluate Transaction: ReadCertificate, function returns "certificate1" attributes');
            result = await contract.evaluateTransaction('ReadCertificate', 'certificate13');
            console.log(`*** Result: ${prettyJSONString(result.toString())}`);

            // try {
            //     // How about we try a transactions where the executing chaincode throws an error
            //     // Notice how the submitTransaction will throw an error containing the error thrown by the chaincode
            //     console.log('\n--> Submit Transaction: UpdateCertificate certificate70, certificate70 does not exist and should return an error');
            //     await contract.submitTransaction('UpdateCertificate', 'certificate70', 'blue', '5', 'Tomoko', '300');
            //     console.log('******** FAILED to return an error');
            // } catch (error) {
            //     console.log(`*** Successfully caught the error: \n    ${error}`);
            // }

            console.log('\n--> Evaluate Transaction: ReadCertificate, function returns "certificate1" attributes');
            result = await contract.evaluateTransaction('ReadCertificate', '1');
            console.log(`*** Result: ${prettyJSONString(result.toString())}`);


            console.log('\n--> Update state of cert13')
            await contract.submitTransaction('UpdateState', 'certificate13', 'REVOKED')
            result = await contract.evaluateTransaction('ReadCertificate', 'certificate13');
            console.log(`*** Result: ${prettyJSONString(result.toString())}`);

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
            app.put('/certificate', async (req, res) => {
                console.log(req.body);
                res.json(req.body);
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
