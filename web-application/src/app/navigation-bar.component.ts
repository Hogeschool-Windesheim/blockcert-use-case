import {Component} from '@angular/core';
import {Router} from '@angular/router';

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
    navigationItems: NavigationItem[] = [{text: 'Create new certificate', route: '/create-certificate'},
        {text: 'List of certificates', route: '/certificate-list'}];

    constructor(private _router: Router) {
    }

    toggle(): void {
        this.show = !this.show;
    }

    navigate(navigationItem: NavigationItem): void {
        // this._router.navigate();
    }

}
