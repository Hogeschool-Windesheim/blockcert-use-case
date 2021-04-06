import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import {createServer} from 'http';
import {Network} from './network';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

export class ServerProducer {

    static port = 4102;
    constructor(private _network: Network) {

    }

    start(): void {
        createServer(app).listen(ServerProducer.port, () => console.log(`Server started on ${ServerProducer.port}`));
        this._getListener();
        this._putListener();
        this._deleteListener();
    }

    private _getListener(): void {
        app.get('/certificate', async (req, res) => {
            const result = await this._network.contract.evaluateTransaction('GetAllCertificates');
            console.log(result);
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
