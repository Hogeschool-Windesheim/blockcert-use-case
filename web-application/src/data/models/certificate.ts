import * as _ from 'lodash';

const INVALID_STATES = new Set(['REVOKED', 'EXPIRED']);

export class Certificate {
    ID: number = null;
    CertNr: number = null;
    StartDate: Date = null;
    EndDate: Date = null;
    Address: string = null;
    AcquirerID: string = null;
    AcquirerName: string = null;
    RegistrationNr: number = null;
    CertificateURL: number = null;
    State: string = null;
    Valid: boolean = null;

    setValid(): void {
        if (_.isNull(this.StartDate) || _.isNull(this.StartDate) || _.isNull(this.State) || INVALID_STATES.has(this.State)) {
            this.Valid = false;
            return;
        }
        this.Valid = this.StartDate < new Date() && this.EndDate > new Date();
    }
}
