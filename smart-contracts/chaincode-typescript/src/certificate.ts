import {Object, Property} from 'fabric-contract-api';

/**
 * State class. States have a class, unique key, and a lifecycle current state
 * the current state is determined by the specific subclass
 */
@Object()
class State {

    /**
     * Convert object to buffer containing JSON data serialization
     * Typically used before putState()ledger API
     * @param {Object} JSON object to serialize
     * @return {buffer} buffer with the data to store
     */
    public static serialize(object) {
        // don't write the key:value passed in - we already have a real composite key, issuer and paper Number.
        delete object.key;
        return Buffer.from(JSON.stringify(object));
    }

    /**
     * Deserialize object into one of a set of supported JSON classes
     * i.e. Covert serialized data to JSON object
     * Typically used after getState() ledger API
     * @param {data} data to deserialize into JSON object
     * @param (supportedClasses) the set of classes data can be serialized to
     * @return {json} json with the data to store
     */
    public static deserialize(data, supportedClasses) {
        const json = JSON.parse(data.toString());
        const objClass = supportedClasses[json.class];
        if (!objClass) {
            throw new Error(`Unknown class of ${json.class}`);
        }
        const object = new (objClass)(json);

        return object;
    }

    /**
     * Deserialize object into specific object class
     * Typically used after getState() ledger API
     * @param {data} data to deserialize into JSON object
     * @return {json} json with the data to store
     */
    public static deserializeClass(data, objClass) {
        const json = JSON.parse(data.toString());
        const object = new (objClass)(json);
        return object;
    }

    /**
     * Join the keyParts to make a unififed string
     * @param (String[]) keyParts
     */
    public static makeKey(keyParts) {
        // return keyParts.map(part => JSON.stringify(part)).join(':');
        return keyParts.map((part) => part).join(':');
    }

    public static splitKey(key) {
        return key.split(':');
    }

    private class: any;
    private key: any;
    protected currentState: any;

    /**
     * @param {String|Object} class  An indentifiable class of the instance
     * @param {keyParts[]} elements to pull together to make a key for the objects
     */
    constructor(stateClass: any, keyParts: any) {
        this.class = stateClass;
        this.key = State.makeKey(keyParts);
        this.currentState = null;
    }

    public getClass() {
        return this.class;
    }

    public getKey() {
        return this.key;
    }

    public getSplitKey() {
        return State.splitKey(this.key);
    }

    public getCurrentState() {
        return this.currentState;
    }

}

const cState = {
    ISSUED: 1,
    REVOKED: 2,
};

@Object()
export class Certificate extends State {

    public static fromBuffer(buffer) {
        return Certificate.deserialize(buffer);
    }

    public static deserialize(data) {
        return State.deserializeClass(data, Certificate);
    }

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

    constructor(obj: any) {
        super(obj.getClass(), obj.ID);
    }

    public isIssued() {
        return this.currentState === cState.ISSUED;
    }

    public setIssued() {
        this.currentState = cState.ISSUED;
    }

    public isRevoked() {
        return this.currentState === cState.REVOKED;
    }

    public setRevoked() {
        this.currentState = cState.REVOKED;
    }

    public toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    public getClass() {
        return 'org.livinglab.certificate';
    }
}
