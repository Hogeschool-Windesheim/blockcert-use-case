import {parse} from 'ts-command-line-args';

export interface NetworkConfig {
    caName: string;
    chaincodeName: string;
    channelName: string;
    department: string;
    filePath: string;
    mspOrg: string;
    userId: string;
    walletPath: string;
    configFile?: string;
    jsonPath?: string;
}

export function getArguments() {
    return parse<NetworkConfig>({
            caName: {type: String, optional: true},
            chaincodeName: {type: String, optional: true},
            channelName: {type: String, optional: true},
            department: {type: String, optional: true},
            filePath: {type: String, optional: true},
            mspOrg: {type: String, optional: true},
            userId: {type: String, optional: true},
            walletPath: {type: String, optional: true},
            configFile: {type: String, optional: true},
            jsonPath: {type: String, optional: true},
        }, {
            loadFromFileArg: 'configFile',
            loadFromFileJsonPathArg: 'jsonPath',
        },
    );
}
