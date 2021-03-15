/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

// Utility class for collections of ledger states --  a state list
import {StateList} from './../ledger-api/statelist';

import {Certificate} from './certificate';

export class CertificateList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.livinglab.certificate');
        this.use(Certificate);
    }

    async addCertificate(certificate) {
        return this.addState(certificate);
    }

    async getCertificate(certificateKey) {
        return this.getState(certificateKey);
    }

    async updateCertificate(certificate) {
        return this.updateState(certificate);
    }
}

