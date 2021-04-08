import {Component, Input} from '@angular/core';
import * as _ from 'lodash';
import {NavigationService} from '../app/navigation.service';
import {Farmer} from '../data/models/farmer';
import {FarmerService} from '../data/services/farmer-service';

@Component({
    selector: 'farmer-creation',
    templateUrl: './farmer-creation.component.html',
    styleUrls: ['./farmer-creation.component.scss']
})
export class FarmerCreationComponent {
    @Input()
    model = new Farmer();

    @Input()
    update = false;

    @Input()
    delete = false;

    @Input()
    disableID = false;
    isValid = false;

    constructor(private _farmerService: FarmerService, public navigationService: NavigationService) {
    }

    onValueChange(): void {
        this.isValid = !_.some(this.model, (value, prop) => _.isNull(value));
    }

    onCreate(): void {
        this._farmerService.save(this.model);
    }

    onDelete(): void {
        this._farmerService.delete(this.model);
    }
}
