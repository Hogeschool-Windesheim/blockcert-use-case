import {DataService} from './dataservice';
import {Injectable} from '@angular/core';
import {Certificate} from '../models/certificate';

@Injectable({
    providedIn: 'root'
})
export class CertificateService extends DataService<Certificate> {
    CERTIFICATES = [new Certificate(), new Certificate()];

    getAll(): Certificate[] {
        this.CERTIFICATES[0].revoked = true;
        this.CERTIFICATES[1].id = 2;
        return this.CERTIFICATES;
    }
}
