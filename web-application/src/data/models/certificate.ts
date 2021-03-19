import * as _ from 'lodash';

export class Certificate {
    ID: number = null;
    CertNr: number = null;
    StartDate: Date = null;
    EndDate: Date = null;
    Address: string = null;
    Acquirer: string = null;
    RegistrationNr: number = null;
    State: string = null;
    Valid: boolean = null;

    setValid(): void {
        if (_.isNull(this.StartDate) || _.isNull(this.StartDate) ) {
            this.Valid = false;
            return;
        }
        this.Valid = this.StartDate < new Date() && this.EndDate > new Date();
    }
}
