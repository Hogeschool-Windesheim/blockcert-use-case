import {Component, ViewEncapsulation} from '@angular/core';
import {NavigationService} from '../app/navigation.service';
import {FarmerService} from '../data/services/farmer-service';

@Component({
    selector: 'farmer-creation-page',
    templateUrl: './farmer-creation-page.component.html',
    styleUrls: ['./farmer-creation-page.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FarmerCreationPageComponent {

    constructor(private _farmerService: FarmerService, public navigationService: NavigationService) {
    }
}
