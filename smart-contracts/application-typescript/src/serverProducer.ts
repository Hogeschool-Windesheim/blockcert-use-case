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

    constructor(private _network: Network) {

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
            const result = await this._network.certificateContract.evaluateTransaction('GetAllCertificates');
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
