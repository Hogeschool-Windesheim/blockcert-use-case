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

export class ServerProducer {

    static port = 4103;
    constructor(private _network: Network) {

    }

    start(): void {
        createServer(app).listen(ServerProducer.port, () => console.log(`Server started on ${ServerProducer.port}`));
        this._getListener();
    }

    private _getListener(): void {
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
