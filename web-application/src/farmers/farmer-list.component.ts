import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import * as _ from 'lodash';
import {MatSelectChange} from '@angular/material/select';
import {FarmerService} from '../data/services/farmer-service';
import {Farmer} from '../data/models/farmer';

@Component({
    selector: 'farmer-list',
    templateUrl: './farmer-list.component.html',
    styleUrls: ['./farmer-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FarmerListComponent implements OnInit {
    farmers: Farmer[] = [];
    searchFields = ['id', 'address', 'firstName', 'lastName'];
    currentFilterProperty: string = null;
    currentFilterValue: string = null;

    constructor(private _farmerService: FarmerService) {
    }

    ngOnInit(): void {
        this._farmerService.getAll().subscribe((farmers) => (this.farmers = farmers));
    }

    onPropertyChange(event: MatSelectChange): void {
        this.currentFilterProperty = event.value;
    }

    onValueChange(): void {
        if (!this.currentFilterProperty) { return; }

        this.farmers = _.filter(this._farmerService.getLocalAll(), c => {
            const value = _.get(c, this.currentFilterProperty, null);
            return _.includes(value, this.currentFilterValue);
        });
    }
}
