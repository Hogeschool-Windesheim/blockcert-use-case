import {Component, OnInit} from '@angular/core';
import {NavigationService} from './navigation.service';
import {environment} from '../environments/environment';

export interface NavigationItem {
    text: string;
    route: string;
}

@Component({
    selector: 'app-navigation-bar',
    templateUrl: './navigation-bar.component.html',
    styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {
    show = false;
    navigationItems: NavigationItem[] = [];

    constructor(private _navigationService: NavigationService) {
    }

    ngOnInit(): void {
        if (environment.canCreate) {
            this.navigationItems = [{text: 'Create new certificate', route: '/create-certificate'},
                {text: 'Create new farmer', route: '/create-farmer'},
                {text: 'List of certificates', route: '/certificate-list'},
                {text: 'List of farmers', route: '/farmer-list'}];
        } else {
            this.navigationItems = [{text: 'List of certificates', route: '/certificate-list'},
                {text: 'List of farmers', route: '/farmer-list'}];
        }
    }

    toggle(): void {
        this._navigationService.open = !this._navigationService.open;
        this.show = this._navigationService.open;
    }
}
