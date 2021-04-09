import {Component, Input} from '@angular/core';
import {Farmer} from '../data/models/farmer';

@Component({
    selector: 'farmer-comp',
    templateUrl: './farmer.component.html',
    styleUrls: ['./farmer.component.scss']
})
export class FarmerComponent {
    @Input()
    farmer: Farmer;

    constructor() {
    }
}
