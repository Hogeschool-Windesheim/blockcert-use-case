import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {BlockingDialogComponent} from '../dialog/dialog.component';
import {Router} from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    isAuthenticated = false;

    constructor( private http: HttpClient, public dialog: MatDialog, private _router: Router) {
    }

    login(username: string, walletKey: string): void {
        const url = environment.requestUrl + '/login';
        const dialogRef = this.dialog.open(BlockingDialogComponent);
        dialogRef.componentInstance.options.title = 'Trying to log in...';
        this.http.put(url, {username: username, walletKey: walletKey}).subscribe((res) => {
            this.dialog.closeAll();
            this.isAuthenticated = true;
            this._router.navigateByUrl('/certificate-list');
        }, () => {
            dialogRef.componentInstance.options.title = 'Incorrect username or wallet-key';
        });
    }
}
