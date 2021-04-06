import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import {createServer} from 'http';
import {Network} from './network';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

export class ServerFarmer {

    static port = 4101;

    constructor(private _network: Network) {

    }

    start(): void {
        createServer(app).listen(ServerFarmer.port, () => console.log(`Server started on ${ServerFarmer.port}`));
        this._getListener();
        this._putListener();
        this._deleteListener();
    }

    private _getListener(): void {
        app.get('/certificate', async (req, res) => {
            // TODO what to do when action is not allowed, or crashes for whatever reason?
            let result;
            result = await this._network.contract.evaluateTransaction('queryAcquirer', this._network.userId);
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
    }

    private _deleteListener(): void {
        app.delete('/certificate', async (req, res) => {
            res.sendStatus(403);
        });
    }
}
