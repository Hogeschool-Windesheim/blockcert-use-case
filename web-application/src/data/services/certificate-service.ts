import {Injectable} from '@angular/core';
import {Certificate} from '../models/certificate';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import * as _ from 'lodash';
import {ServerResponse} from '../server-response';
import * as moment from 'moment';
import {ReplaySubject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CertificateService {
    private _getAll$ = new ReplaySubject<Certificate[]>();
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

    getAll(): ReplaySubject<Certificate[]> {
        this._certificates = {};
        this.http.get<ServerResponse<Certificate>>(this._configUrl).subscribe((data) => {
            _.forEach(data.message, (certificate) => this._deserialize(certificate.Record));
            this._checkIfValid();
            this._getAll$.next(_.values(this._certificates));
        });
        return this._getAll$;
    }

    getLocalAll(): Certificate[] {
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

    async delete(certificate: Certificate): Promise<void> {
        const httpParams = new HttpParams().set('certificate', `${certificate.ID}`);
        const result = await this.http.delete(this._configUrl, {params: httpParams}).toPromise();
        console.log(result);
        this.getAll();
    }
}
