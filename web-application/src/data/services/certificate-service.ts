import {Injectable} from '@angular/core';
import {Certificate} from '../models/certificate';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import * as _ from 'lodash';
import {ServerResponse} from '../server-response';
import * as moment from 'moment';
import {ReplaySubject} from 'rxjs';
import {environment} from '../../environments/environment';
import {MatDialog} from '@angular/material/dialog';
import {BlockingDialogComponent} from '../../dialog/dialog.component';
import {AuthenticationService} from '../../login/authentication.service';

@Injectable({
    providedIn: 'root'
})
export class CertificateService {
    private _getAll$ = new ReplaySubject<Certificate[]>();
    private _certificates: { [id: number]: Certificate } = {};
    private _configUrl: string;
    private _httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private http: HttpClient, public dialog: MatDialog, private _authenticationService: AuthenticationService) {
        this._configUrl = environment.requestUrl + '/certificate';
        this._authenticationService.tokenChange.subscribe(() => {
            this._httpOptions.headers = new HttpHeaders({
                'Content-Type': 'application/json', authorization: 'JWT ' + sessionStorage.getItem('token')
            });
        });
    }

    async save(certificate: Certificate): Promise<any> {
        const object = _.assign({}, certificate);
        _.assign(object, {StartDate: certificate.StartDate.toISOString(), EndDate: certificate.EndDate.toISOString()});
        const dialogRef = this.dialog.open(BlockingDialogComponent);
        dialogRef.componentInstance.options.title = 'Creating certificate...';
        console.log(this._httpOptions);
        this.http.put(this._configUrl, JSON.stringify(object), this._httpOptions).subscribe((res) => {
            dialogRef.componentInstance.options.title = 'Successfully created certificate!';
        }, () => {
            dialogRef.componentInstance.options.title = 'Unauthorized for creating certificates';
        });
    }

    getAll(): ReplaySubject<Certificate[]> {
        this._certificates = {};
        this.http.get<ServerResponse<Certificate>>(this._configUrl, this._httpOptions).subscribe((data) => {
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
        const dialogRef = this.dialog.open(BlockingDialogComponent);
        dialogRef.componentInstance.options.title = 'Deleting certificate...';
        this.http.delete(this._configUrl, {params: httpParams}).subscribe(() => {
            dialogRef.componentInstance.options.title = 'Successfully deleted certificate!';
            this.getAll();
        }, () => {
            dialogRef.componentInstance.options.title = 'Unauthorized for deleting certificates';
        });
    }
}
