import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import {createServer} from 'http';
import {Certificate} from '../../chaincode-typescript/dist/certificate';
import {Network} from './network';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

export class ServerFarmer {

    static port = 4102
    constructor(private _network: Network) {

    }

    start(): void {
        createServer(app).listen(ServerFarmer.port, () => console.log(`Server started on ${ServerFarmer.port}`));
        this._getListener();
    }

    private _getListener(): void {
        app.get('/certificate/:id', async (req, res) => {
            //TODO what to do when action is not allowed, or crashes for whatever reason?
            let result;
            try{
                result = await this._network.contract.evaluateTransaction('queryAcquirer', req.params.id);
            } catch {
                res.status(405).send('error error beep boop')
                //TODO stop here!
            }
            console.log(result);
            res.json({
                success: true,
                message: JSON.parse(result.toString()),
            });
        });
        app.get('/certificate/isValid/:id', async (req, res) => {
            const result = await this._network.contract.evaluateTransaction('CheckCertificateFromAcquirerIsIssued', req.params.id);
            console.log(result);
            res.json({
                success: true,
                message: JSON.parse(result.toString()),
            });
        });
    }
}
