import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthenticationService} from './authentication.service';

@Injectable({
    providedIn: 'root',
})
export class LoggedInGuard implements CanActivate {

    constructor(private _authenticationService: AuthenticationService, private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return new Observable<boolean>(subscriber => {
            if (this._authenticationService.isAuthenticated) {
                subscriber.next(this._authenticationService.isAuthenticated);
                subscriber.complete();
            }
            subscriber.next(this._authenticationService.isAuthenticated);
            subscriber.complete();
            !this._authenticationService.isAuthenticated && this._router.navigateByUrl('/login');
        });
    }

}
