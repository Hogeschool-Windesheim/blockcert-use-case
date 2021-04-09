import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    isAuthenticated = false;

    constructor( private http: HttpClient, public dialog: MatDialog) {
    }

    login(username: string, walletKey: string): void {
        const url = environment.requestUrl + '/login';
        this.http.put(url, {username: username, walletKey: walletKey}).subscribe(res => {
            console.log(res);
        });
    }
}
