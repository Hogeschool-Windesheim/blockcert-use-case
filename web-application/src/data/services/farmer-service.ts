import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import * as _ from 'lodash';
import {ServerResponse} from '../server-response';
import {ReplaySubject} from 'rxjs';
import {environment} from '../../environments/environment';
import {MatDialog} from '@angular/material/dialog';
import {BlockingDialogComponent} from '../../dialog/dialog.component';
import {Farmer} from '../models/farmer';

@Injectable({
    providedIn: 'root'
})
export class FarmerService {
    private _getAll$ = new ReplaySubject<Farmer[]>();
    private _farmers: { [id: number]: Farmer } = {};
    private _configUrl: string;
    private _httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private http: HttpClient, public dialog: MatDialog) {
        this._configUrl = environment.requestUrl + '/farmer';
    }

    async save(farmer: Farmer): Promise<any> {
        const object = _.assign({}, farmer);
        const dialogRef = this.dialog.open(BlockingDialogComponent);
        dialogRef.componentInstance.options.title = 'Creating Farmer...';
        this.http.put(this._configUrl, JSON.stringify(object), this._httpOptions).subscribe((res) => {
            dialogRef.componentInstance.options.title = 'Successfully created farmer!';
        }, () => {
            dialogRef.componentInstance.options.title = 'Unauthorized for creating farmers';
        });
    }

    getAll(): ReplaySubject<Farmer[]> {
        this._farmers = {};
        this.http.get<ServerResponse<Farmer>>(this._configUrl).subscribe((data) => {
            _.forEach(data.message, (farmer) => this._deserialize(farmer.Record));
            this._getAll$.next(_.values(this._farmers));
        });
        return this._getAll$;
    }

    getLocalAll(): Farmer[] {
        return _.values(this._farmers);
    }

    private _deserialize(object: Farmer): void {
        const instance = new Farmer();
        _.forEach(instance, (value, prop) => _.set(instance, prop, object[prop]));
        _.set(this._farmers, instance.id, instance);
    }

    async delete(farmer: Farmer): Promise<void> {
        const httpParams = new HttpParams().set('farmer', `${farmer.id}`);
        const dialogRef = this.dialog.open(BlockingDialogComponent);
        dialogRef.componentInstance.options.title = 'Deleting farmer...';
        this.http.delete(this._configUrl, {params: httpParams}).subscribe(() => {
            dialogRef.componentInstance.options.title = 'Successfully deleted farmer!';
            this.getAll();
        }, () => {
            dialogRef.componentInstance.options.title = 'Unauthorized for deleting farmer';
        });
    }
}
