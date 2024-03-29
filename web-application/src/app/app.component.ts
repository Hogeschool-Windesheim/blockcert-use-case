import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
// @ts-ignore
import * as _ from 'lodash';
import {NavigationBarComponent} from './navigation-bar.component';
import {environment} from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit {
    @ViewChild('barComponent')
    navigationBar: NavigationBarComponent;

    title = 'Blockcert-Demo';
    currentpage = '';
    collide = false;

    constructor(private _router: Router) {
        this._router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((e: any) => this._setPageState(e));
    }

    ngOnInit(): void {
        this.title = (environment as any).headerName;
        throw new Error('Method not implemented.');
    }

    ngAfterViewInit(): void {
        this.collide = this.navigationBar.show;
    }

    menuClick(): void {
        this.navigationBar.toggle();
        this.collide = this.navigationBar.show;
    }

    private _setPageState(routerEvent: NavigationEnd): void {
        const pathArray = _.map(routerEvent.url.split('/'), str => str.charAt(0).toUpperCase() + str.slice(1));
        this.currentpage = pathArray.join(' ');
    }


}
