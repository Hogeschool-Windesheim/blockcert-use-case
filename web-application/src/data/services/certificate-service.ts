import {Injectable} from '@angular/core';
import {Certificate} from '../models/certificate';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import * as _ from 'lodash';
import {ServerResponse} from '../server-response';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class CertificateService {
    private _certificates: { [id: number]: Certificate } = {};
    private _configUrl = 'http://localhost:4100/certificate';
    private _httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private http: HttpClient) {
    }

    async save(certificate: Certificate): Promise<any> {
        const object = _.assign({}, certificate);
        _.assign(object, {StartDate: certificate.StartDate.toISOString(), EndDate: certificate.EndDate.toISOString()});
        await this.http.put(this._configUrl, JSON.stringify(object), this._httpOptions).toPromise();
    }

    async getAll(): Promise<Certificate[]> {
        this._certificates = {};
        const data = await this.http.get<ServerResponse<Certificate>>(this._configUrl).toPromise();

        _.forEach(data.message, (certificate) => this._deserialize(certificate.Record));

        this._checkIfValid();
        return _.values(this._certificates);
    }

    private _checkIfValid(): void {
        _.forEach(this._certificates, (certificate) => certificate.setValid());
    }

    private _deserialize(object: Certificate): void {
        const instance = new Certificate();
        _.forEach(instance, (value, prop) => _.set(instance, prop, object[prop]));
        _.forEach(['StartDate', 'EndDate'], dateField => {
            const momentDate = moment(_.get(instance, dateField));
            _.set(instance, dateField, momentDate.isValid() ? momentDate.toDate() : null);
        });
        _.set(this._certificates, instance.ID, instance);
    }

    delete(certificate: Certificate): void {
        this.http.delete(this._configUrl + `?id=${certificate.ID}`, this._httpOptions);
    }
}
