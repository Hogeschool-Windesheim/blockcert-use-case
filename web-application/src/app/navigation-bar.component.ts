import {Component} from '@angular/core';
import {NavigationService} from './navigation.service';

export interface NavigationItem {
    text: string;
    route: string;
}

@Component({
    selector: 'app-navigation-bar',
    templateUrl: './navigation-bar.component.html',
    styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
    show = false;
    navigationItems: NavigationItem[] = [
        {text: 'Create new certificate', route: '/create-certificate'},
        {text: 'Create new farmer', route: '/create-farmer'},
        {text: 'List of certificates', route: '/certificate-list'},
        {text: 'List of farmers', route: '/farmer-list'}];

    constructor(private _navigationService: NavigationService) {
    }

    toggle(): void {
        this._navigationService.open = !this._navigationService.open;
        this.show = this._navigationService.open;
    }
}
