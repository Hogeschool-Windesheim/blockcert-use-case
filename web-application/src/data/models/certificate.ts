
export class Certificate {
    ID = 1;
    CertNr = '';
    StartDate: Date = new Date();
    EndDate: Date = new Date();
    Address = '';
    Acquirer = '';
    RegistrationNr = '';
    State = '';

    contructor(): Certificate {
        return this;
    }
}
