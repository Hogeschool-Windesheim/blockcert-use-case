import {Wallet, Wallets} from 'fabric-network';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Function to intialize the different organizations according to a folder that is correctly initialized with the
 * expecte files.
 * @param filePath Path to the directory containing the configuration.
 */
const buildCCPOrg = (filePath: string): Record<string, any> => {
    // load the common connection configuration file
    const ccpPath = path.resolve(__dirname, filePath);
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
        throw new Error(`no such file or directory: ${ccpPath}`);
    }
    const contents = fs.readFileSync(ccpPath, 'utf8');

    // build a JSON object from the file contents
    const ccp = JSON.parse(contents);

    console.log(`Loaded the network configuration located at ${ccpPath}`);
    return ccp;
};

const buildWallet = async (walletPath: string): Promise<Wallet> => {
    // Create a new  wallet : Note that wallet is for managing identities.
    let wallet: Wallet;
    if (walletPath) {
        wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Built a file system wallet at ${walletPath}`);
    } else {
        wallet = await Wallets.newInMemoryWallet();
        console.log('Built an in memory wallet');
    }

    return wallet;
};

export function removeSpecialChars(stringToConvert: string): string {
    return stringToConvert.replace(/\r?\n|\r/g, '');
}

export function removeSpecialChars2(stringToConvert: string): string {
    return stringToConvert.replace(/\\r?\\n|\\r/g, '');
}

export function checkTokenAndReturnUser(req: any, tokenToUser: { [token: string]: string }): string {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        throw Error('No header provided');
    }
    const token = authorizationHeader.slice(4);
    if (!tokenToUser[token]) {
        throw Error('No user found for this token');
    }
    return tokenToUser[token];
}

export {
    buildCCPOrg,
    buildWallet,
};
