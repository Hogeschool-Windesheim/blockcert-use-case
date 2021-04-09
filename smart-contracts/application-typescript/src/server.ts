import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import {createServer} from 'http';
import {Certificate} from '../../chaincode-typescript/dist/certificate';
import {Farmer} from '../../chaincode-typescript/dist/farmer';
import {Network} from './network';
import {Identity} from 'fabric-network';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

export class Server {

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
            res.json({
                success: true,
                message: JSON.parse(result.toString()),
            });
        });
        app.get('/farmer', async (req, res) => {
            const result = await this._network.farmerContract.evaluateTransaction('getAllFarmers');
            res.json({
                success: true,
                message: JSON.parse(result.toString()),
            });
        });
    }

    private _putListener(): void {
        app.put('/certificate', async (req, res) => {
            const contract = this._network.certificateContract;
            const proposal = req.body as Certificate;
            const certificateStatusBuffer: Buffer = await contract.evaluateTransaction('CertificateExists', proposal.ID);
            const certificateStatus: boolean = 'true' === certificateStatusBuffer.toString();

            const updateFunction = certificateStatus ? 'UpdateCertificate' : 'CreateCertificate';
            await contract.submitTransaction(updateFunction, proposal.ID, proposal.StartDate, proposal.EndDate,
                proposal.CertNr, proposal.AcquirerID, proposal.RegistrationNr, proposal.CertificateURL, proposal.State);
            const newCertificateCreated = await contract.evaluateTransaction('CertificateExists', proposal.ID);
            res.json({certificate: proposal, status: newCertificateCreated.toString()});
        });
        app.put('/farmer', async (req, res) => {
            const contract = this._network.farmerContract;
            const proposal = req.body as Farmer;
            const farmerExistsBuffer: Buffer = await contract.evaluateTransaction('farmerExists', proposal.id);
            const farmerExists: boolean = 'true' === farmerExistsBuffer.toString();

            const updateFunction = farmerExists ? 'updateFarmer' : 'createFarmer';
            await contract.submitTransaction(updateFunction, proposal.id, proposal.address, proposal.firstName, proposal.lastName);
            const newFarmerCreated = await contract.evaluateTransaction('farmerExists', proposal.id);
            res.json({farmer: proposal, status: newFarmerCreated.toString()});
        });
        app.put('/login', async (req, res) => {
            const contract = this._network.farmerContract;
            const proposal = req.body as {username: string, walletKey: string };
            // console.log(proposal);
            const identity: any = await this._network.wallet.get(proposal.username);
            const decodedWalletKey = unescape(encodeURIComponent(proposal.walletKey));
            console.log(decodedWalletKey);
            console.log(proposal.walletKey);
            console.log(identity.credentials.privateKey);
            const isEqual = identity.credentials.privateKey.trim() === decodedWalletKey.trim();
            console.log(isEqual);
            res.json({status: 'ok'});
        });
    }

    private _deleteListener(): void {
        app.delete('/certificate', async (req, res) => {
            await this._network.certificateContract.submitTransaction('DeleteCertificate', req.query.certificate.toString());
            res.json({certificate: req.query.certificate.toString(), status: 200});
        });
        app.delete('/farmer', async (req, res) => {
            await this._network.farmerContract.submitTransaction('deleteFarmer', req.query.farmer.toString());
            res.json({farmer: req.query.farmer.toString(), status: 200});
        });
    }
}
