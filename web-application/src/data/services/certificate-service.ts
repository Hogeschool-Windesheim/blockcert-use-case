import {Injectable} from '@angular/core';
import {Certificate} from '../models/certificate';
import {HttpClient} from '@angular/common/http';
import * as _ from 'lodash';
import {ServerResponse} from '../server-response';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class CertificateService {
    private _certificates: { [id: number]: Certificate } = {};

    configUrl = 'http://localhost:4100/certificate';

    constructor(private http: HttpClient) {
    }

    async save(certificate: Certificate): Promise<any> {
        const body = JSON.stringify(certificate);
        console.log(body);
        const response = await this.http.put(this.configUrl, JSON.stringify(certificate)).toPromise();
        console.log(response);
    }

    async getAll(): Promise<Certificate[]> {
        this._certificates = {};
        const data = await this.http.get<ServerResponse<Certificate>>(this.configUrl).toPromise();

        _.forEach(data.message, (certificate) => this._deserialize(certificate.Record));

        this._checkIfValid();
        return _.values(this._certificates);
    }

    private _checkIfValid(): void {
        _.forEach(this._certificates, (certificate) => {
            certificate.Valid = certificate.StartDate < new Date() && certificate.EndDate > new Date();
        });
    }

    private _deserialize(instance: Certificate): void {
        _.forEach(['StartDate', 'EndDate'], dateField => {
            const momentDate = moment(_.get(instance, dateField), 'MM-DD-YYYY');
            _.set(instance, dateField, momentDate.isValid() ? momentDate.toDate() : null);
        });
        _.set(this._certificates, instance.ID, instance);
    }
}
