import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import {Wallet} from 'fabric-network';
import {createServer} from 'http';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';
import {Certificate} from '../../chaincode-certificate/dist/certificate';
import {Farmer} from '../../chaincode-farmer/dist/farmer';
import {Network} from './network';
import {buildWallet, checkTokenAndReturnUser, removeSpecialChars, removeSpecialChars2} from './utils/AppUtil';
import {getArguments, NetworkConfig} from './utils/NetworkConfig';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

export class Server {
    private _tokenToUser: { [token: string]: string } = {};
    private _userIdToNetwork: { [userId: string]: Network } = {};
    private _wallet: Wallet;

    constructor(walletPath: string) {
        buildWallet(walletPath).then((wallet) => {
            this._wallet = wallet;
        });
    }

    /**
     * Start the server on the pre-specified port.
     * @param port integer representation on which port an identity must start.
     */
    start(port: string): void {
        const portNumber = parseInt(port, 10);
        createServer(app)
            .listen(portNumber, () => console.log(`Server started on ${portNumber}`));
        this._getListener();
        this._putListener();
        this._deleteListener();
    }

    private _getListener(): void {

        /**
         * Get path for certificates. Returns all the certificates on the ledger.
         */
        app.get('/certificate', async (req, res) => {
            const userId = checkTokenAndReturnUser(req, this._tokenToUser);
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            const result = await this._userIdToNetwork[userId].certificateContract.evaluateTransaction('GetAllCertificates');
            res.json({
                success: true,
                message: JSON.parse(result.toString()),
            });
        });

        /**
         * Get path for farmers. Returns all the farmers on the ledger.
         */
        app.get('/farmer', async (req, res) => {
            const userId = checkTokenAndReturnUser(req, this._tokenToUser);
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            const result = await this._userIdToNetwork[userId].farmerContract.evaluateTransaction('getAllFarmers');
            res.json({
                success: true,
                message: JSON.parse(result.toString()),
            });
        });
    }

    private _putListener(): void {

        /**
         * Put path for certificates. Allow the CA body to create new certificates.
         */
        app.put('/certificate', async (req, res) => {
            const userId = checkTokenAndReturnUser(req, this._tokenToUser);
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            const contract = this._userIdToNetwork[userId].certificateContract;
            const proposal = req.body as Certificate;
            const certificateStatusBuffer: Buffer = await contract.evaluateTransaction('CertificateExists', proposal.ID);
            const certificateStatus: boolean = 'true' === certificateStatusBuffer.toString();

            const updateFunction = certificateStatus ? 'UpdateCertificate' : 'CreateCertificate';
            await contract.submitTransaction(updateFunction, proposal.ID, proposal.StartDate, proposal.EndDate,
                proposal.CertNr, proposal.AcquirerID, proposal.RegistrationNr, proposal.CertificateURL, proposal.State);
            const newCertificateCreated = await contract.evaluateTransaction('CertificateExists', proposal.ID);
            res.json({certificate: proposal, status: newCertificateCreated.toString()});
        });

        /**
         * Put path for a new farmer. Allows the CA body to create a new farmer. These farmers allow then to be used
         * in new certificates on the ledger.
         */
        app.put('/farmer', async (req, res) => {
            const userId = checkTokenAndReturnUser(req, this._tokenToUser);
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            const contract = this._userIdToNetwork[userId].farmerContract;
            const proposal = req.body as Farmer;
            const farmerExistsBuffer: Buffer = await contract.evaluateTransaction('farmerExists', proposal.id);
            const farmerExists: boolean = 'true' === farmerExistsBuffer.toString();

            const updateFunction = farmerExists ? 'updateFarmer' : 'createFarmer';
            await contract.submitTransaction(updateFunction, proposal.id, proposal.address, proposal.firstName, proposal.lastName);
            const newFarmerCreated = await contract.evaluateTransaction('farmerExists', proposal.id);
            res.json({farmer: proposal, status: newFarmerCreated.toString()});
        });

        /**
         * Login route, to allow a user on a network to interact from the CA bodies perspective.
         */
        app.put('/login', async (req, res) => {
            const proposal = req.body as { username: string, walletKey: string };
            const identity: any = await this._wallet.get(proposal.username);
            const str1 = removeSpecialChars(identity.credentials.privateKey);
            const str2 = removeSpecialChars2(proposal.walletKey);

            if (str1 === str2) {
                const token = jwt.sign({data: proposal}, 'secret', {expiresIn: '1h'});
                const networkConfiguration: NetworkConfig = getArguments();
                networkConfiguration.userId = proposal.username;
                networkConfiguration.walletPath = path.join(__dirname, networkConfiguration.walletPath);
                const network = new Network();
                await network.initialize(networkConfiguration);
                this._userIdToNetwork[proposal.username] = network;
                this._tokenToUser[token] = proposal.username;
                res.json({token: token});
            } else {
                res.sendStatus(403);
            }
        });
    }

    private _deleteListener(): void {

        /**
         * Delete path for certificates. Only the Certification body is allowed to 'delete' certificates from the ledger.
         * Note that deletion does not result in the removal of the actual data, as otherwise the ledger could
         * become inconsistent. For actual removal of data, the organizations would have to create a new genesis block
         * and remove the old data from disk.
         */
        app.delete('/certificate', async (req, res) => {
            const userId = checkTokenAndReturnUser(req, this._tokenToUser);
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            await this._userIdToNetwork[userId].certificateContract.submitTransaction('DeleteCertificate', req.query.certificate.toString());
            res.json({certificate: req.query.certificate.toString(), status: 200});
        });

        /**
         * Delete path for farmers. Only the Certification body is allowed to 'delete' farmers from the ledger.
         * Note that deletion does not result in the removal of the actual data, as otherwise the ledger could
         * become inconsistent. For actual removal of data, the organizations would have to create a new genesis block
         * and remove the old data from disk.
         */
        app.delete('/farmer', async (req, res) => {
            const userId = checkTokenAndReturnUser(req, this._tokenToUser);
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            await this._userIdToNetwork[userId].farmerContract.submitTransaction('deleteFarmer', req.query.farmer.toString());
            res.json({farmer: req.query.farmer.toString(), status: 200});
        });
    }
}
