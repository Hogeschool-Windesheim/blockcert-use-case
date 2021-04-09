import {Component} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';

@Component({
    selector: 'login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

    username: string = null;
    walletKey: string = null;

    constructor(private _authenticationService: AuthenticationService,) {
    }

    onLogin(): void {
        this._authenticationService.login(this.username, this.walletKey);
    }
}
