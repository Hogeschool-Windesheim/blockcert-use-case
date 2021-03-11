/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

import {State} from '../ledger-api/state.js';

const cState = {
  ISSUED: 1,
  REVOKED: 2
}

@Object()
export class Certificate extends State {

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

    constructor(obj: any){
      super(obj.getClass(), obj.ID);
    }

    isIssued(){
      return this.currentState === cState.ISSUED;
    }

    setIssued(){
      this.currentState = cState.ISSUED;
    }

    isRevoked(){
      return this.currentState === cState.REVOKED;
    }

    setRevoked(){
      this.currentState = cState.REVOKED;
    }

    static fromBuffer(buffer){
      return Certificate.deserialize(buffer);
    }

    toBuffer(){
      return Buffer.from(JSON.stringify(this))
    }

    static deserialize(data){
      return State.deserializeClass(data, Certificate)
    }

    getClass() {
      return 'org.livinglab.certificate'
    }
}
