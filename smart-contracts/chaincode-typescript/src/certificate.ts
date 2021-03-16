import {Object, Property} from 'fabric-contract-api';


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

    @Property()
    public Acquirer: string;

    @Property()
    public RegistrationNr: string;

    @Property()
    public State: string;
}
