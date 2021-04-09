import {Component} from '@angular/core';
import {AuthenticationService} from './authentication.service';

@Component({
    selector: 'login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

    username: string = null;
    walletKey: string = null;

    constructor(private _authenticationService: AuthenticationService) {
    }

    onLogin(): void {
        this._authenticationService.login(this.username, this.walletKey);
    }
}
