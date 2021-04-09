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

export class ServerFarmer {
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
        app.get('/certificate', async (req, res) => {
            // TODO what to do when action is not allowed, or crashes for whatever reason?
            const userId = checkTokenAndReturnUser(req, this._tokenToUser);
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            const result = await this._userIdToNetwork[userId].certificateContract.evaluateTransaction('queryAcquirer', userId);
            res.json({
                success: true,
                message: JSON.parse(result.toString()),
            });
        });

        /**
         * Get farmer information using the userID that was set.
         */
        app.get('/farmer', async (req, res) => {
            const userId = checkTokenAndReturnUser(req, this._tokenToUser);
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            const result = await this._userIdToNetwork[userId].farmerContract.evaluateTransaction('getFarmerByID', userId);
            res.json({
                success: true,
                message: JSON.parse(result.toString()),
            });
        });
    }

    private _putListener(): void {
        app.put('/certificate', async (req, res) => {
            res.sendStatus(403);
        });
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
        app.delete('/certificate', async (req, res) => {
            res.sendStatus(403);
        });
    }
}
