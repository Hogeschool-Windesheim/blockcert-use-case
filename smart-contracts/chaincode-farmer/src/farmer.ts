import { Object, Property } from 'fabric-contract-api';

// This class represents the data structure used in the blockchain
@Object()
export class Farmer {

    @Property()
    public id: string;

    @Property()
    public address: string;

    @Property()
    public firstName: string;

    @Property()
    public lastName: string;

    constructor(id: string, address: string, firstName: string, lastName: string) {
        this.id = id;
        this.address = address;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}
