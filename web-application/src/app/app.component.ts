import {Component, ViewChild} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {filter} from 'rxjs/operators';
// @ts-ignore
import * as _ from 'lodash';
import {NavigationBarComponent} from './navigation-bar.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    @ViewChild('barComponent')
    navigationBar: NavigationBarComponent;

    title = 'Blockcert-Demo';
    currentpage = '';

    constructor(private _router: Router) {
        this._router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((e: any) => this._setPageState(e));
    }

    menuClick(): void {
        this.navigationBar.toggle();
    }

    private _setPageState(routerEvent: NavigationEnd): void {
        const pathArray = _.map(routerEvent.url.split('/'), str => str.charAt(0).toUpperCase() + str.slice(1));
        this.currentpage = pathArray.join(' ');
    }
}
