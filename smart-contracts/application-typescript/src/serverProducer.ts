import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import {Wallet} from 'fabric-network';
import {createServer} from 'http';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';
import {Network} from './network';
import {buildWallet, checkTokenAndReturnUser, removeSpecialChars, removeSpecialChars2} from './utils/AppUtil';
import {getArguments, NetworkConfig} from './utils/NetworkConfig';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

export class ServerProducer {
    private _tokenToUser: { [token: string]: string } = {};
    private _userIdToNetwork: { [userId: string]: Network } = {};
    private _wallet: Wallet;

    constructor(walletPath: string) {
        buildWallet(walletPath).then((wallet) => {
            this._wallet = wallet;
        });
    }

    /**
     * Start the server on the pre-specified port. This creates listeners for the different requests types that are
     * are needed by the front-end application. See also the web application in the `web-application` directory for
     * more information on the expected usage of these different access paths.
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
         * Get path for certificates. Returns all the certificates on the ledger that the Producer peer knows of.
         * Note that in a real-life setting, the propagation of the Gossip protocol used by HLF may require some
         * time to propagate fully.
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
         * Put path for certificates. Producers are not allowed to create new contracts, hence a 403 is returned.
         * Access control in the chaincode, however, would result in an Error to be raised during the evaluation of the
         * command.
         */
        app.put('/certificate', async (req, res) => {
            res.sendStatus(403);
        });
        app.put('/farmer', async (req, res) => {
            res.sendStatus(403);
        });

        /**
         * Login route, to allow a user on a network to interact from the producers' perspective. Note that access
         * control is limited, as it is assumed that the network handles most of the access control, i.e. using a
         * VPN to restrict access.
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
         * Delete path for certificates. Producers are not allowed to delete the Farmers from the chaincode, so a
         * 403 is returned. Access control in the chaincode, however, would result in an Error to be raised during
         * the evaluation of the command.
         */
        app.delete('/certificate', async (req, res) => {
            res.sendStatus(403);
        });
        app.delete('/farmer', async (req, res) => {
            res.sendStatus(403);
        });
    }
}
