import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import {Gateway, GatewayOptions} from 'fabric-network';
import {createServer} from 'http';
import * as path from 'path';
import {Certificate} from '../../chaincode-typescript/dist/certificate';
import {buildCCPOrg2, buildWallet, prettyJSONString} from './utils//AppUtil';
import {buildCAClient, enrollAdmin, registerAndEnrollUser} from './utils/CAUtil';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg2 = 'Org2MSP';
const walletPath = path.join(__dirname, 'wallet/walletCert');
const org2UserId = 'appUser';
const registrationNr = 'registrationNr2';

/**
 * This app is meant to be run by the Certificate Body, it will have the ability to initialize the ledger,
 * and alter it afterwards. Furthermore, it is allowed to lookup certificates from this own registrationNr.
 */
async function main() {
    try {
        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp = buildCCPOrg2();

        // build an instance of the fabric ca services client based on
        // the information in the network configuration
        const caClient = buildCAClient(ccp, 'ca.org2.example.com');

        // setup the wallet to hold the credentials of the application user
        const wallet = await buildWallet(walletPath);

        // in a real application this would be done on an administrative flow, and only once
        await enrollAdmin(caClient, wallet, mspOrg2);

        // in a real application this would be done only when a new user was required to be added
        // and would be part of an administrative flow
        await registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');

        // Create a new gateway instance for interacting with the fabric network.
        // In a real application this would be done as the backend server session is setup for
        // a user that has been verified.
        const gateway = new Gateway();

        const gatewayOpts: GatewayOptions = {
            wallet,
            identity: org2UserId,
            discovery: {enabled: true, asLocalhost: true}, // using asLocalhost as this gateway is using a fabric network deployed locally
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

            console.log('\n--> Submit Transaction: CreateCertificate, creates new certificate');
            await contract.submitTransaction('CreateCertificate', 'certificate13', '01-10-1312', '01-13-4212', '47718', 'henk', 'lepellaan 13', 'isacertid', 'ISSUED');
            console.log('*** Result: committed');

            console.log('\n--> Evaluate Transaction: GetAllCertificates, function returns all the current certificates on the ledger');
            let result = await contract.evaluateTransaction('GetAllCertificates');
            console.log(`*** Result: ${prettyJSONString(result.toString())}`);

            console.log('\n--> Evaluate Transaction: queryRegistratoinNr, function which returns all certificates from a certain registrationNr')
            let result2 = await contract.evaluateTransaction('queryRegistrationNr', registrationNr);
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
            /**
             * Register event listner to react to handle the creation of certicate.
             * TODO: Further extend the capabilities to handle updates of certificates. This requires some level of
             * TODO: inter-chaincode access control.
             */
            app.put('/certificate', async (req, res) => {
                // TODO: Use logging framework to keep track of events.
                const proposal = req.body as Certificate;
                // Request, expected type is a buffer representation of a Boolean.
                const certificateStatusBuffer: Buffer = await contract.evaluateTransaction('CertificateExists', proposal.ID);
                // TODO: Use proper parsing to validate request.
                const certificateStatus: boolean = 'true' === certificateStatusBuffer.toString();

                if (certificateStatus) {
                    // TODO: Update certificate according to business logic?
                    res.json(result);
                } else {
                    const ignore = await contract.submitTransaction('CreateCertificate', proposal.ID, proposal.StartDate,
                        proposal.EndDate, proposal.CertNr, proposal.Acquirer, proposal.Address, proposal.RegistrationNr,
                        'ISSUED');
                    // Report existence back to backend
                    const newCertificateCreated = await contract.evaluateTransaction('CertificateExists', proposal.ID);
                    res.json({certificate: proposal, status: newCertificateCreated.toString()});
                }
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
