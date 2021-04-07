import { Object, Property } from 'fabric-contract-api';

// This class represents the data structure used in the blockchain
@Object()
export class Certificate {

    @Property()
    public ID: string;

    @Property()
    public CertNr: string;

    @Property()
    public StartDate: string;

    @Property()
    public EndDate: string;

    @Property()
    public Address: string;

    // The acquirer is the owner of the certificate, e.g. a farmer, this is a unique ID for each farmer.
    @Property()
    public AcquirerID: string;

    // This is the name corresponding to the acquirerID, this field does not have to be unique.
    @Property()
    public AcquirerName: string;

    // The registrationNr indicates the certificate body which issued a certificate.
    @Property()
    public RegistrationNr: string;

    // This is to be used in the future to link to the PDF version of the certificate.
    @Property()
    public CertificateURL: string;

    @Property()
    public State: string;
}
