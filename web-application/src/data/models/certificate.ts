export class Certificate {
  id = 1;
  revoked = false;
  revokeDate: Date = new Date();

  contructor(): Certificate {
    return this;
  }

}
