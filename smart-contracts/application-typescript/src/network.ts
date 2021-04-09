import {Contract, Gateway, GatewayOptions, Wallet} from 'fabric-network';
import {buildCCPOrg, buildWallet} from './utils/AppUtil';
import {buildCAClient, enrollAdmin, registerAndEnrollUser} from './utils/CAUtil';
import {NetworkConfig} from './utils/NetworkConfig';

export class Network {
    certificateContract: Contract;
    farmerContract: Contract;
    userId: string;
    wallet: Wallet;
    private _ccp: Record<string, any>;

    async enrollUser(options: NetworkConfig): Promise<void> {
        this._ccp = buildCCPOrg(options.filePath);
        const caClient = buildCAClient(this._ccp, options.caName);
        this.wallet = await buildWallet(options.walletPath);
        await enrollAdmin(caClient, this.wallet, options.mspOrg);
        await registerAndEnrollUser(caClient, this.wallet, options.mspOrg, options.userId, options.department);
    }

    async initialize(config: NetworkConfig): Promise<void> {
        await this.enrollUser(config);
        const gateway = new Gateway();
        const gatewayOpts: GatewayOptions = {
            wallet: this.wallet,
            identity: config.userId,
            discovery: {enabled: true, asLocalhost: true},
        };
        await gateway.connect(this._ccp, gatewayOpts);
        const network = await gateway.getNetwork(config.channelName);
        this.userId = config.userId;
        this.certificateContract = network.getContract(config.chaincodeName, 'CertificateLogic');
        this.farmerContract = network.getContract('farmer', 'FarmerLogic');
    }
}
