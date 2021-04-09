import {Component, Input, OnInit} from '@angular/core';
import {Certificate} from '../data/models/certificate';
import {CertificateService} from '../data/services/certificate-service';
import * as _ from 'lodash';
import * as moment from 'moment';
import {NavigationService} from '../app/navigation.service';
import {Farmer} from '../data/models/farmer';
import {FarmerService} from '../data/services/farmer-service';

@Component({
    selector: 'certificate-creation',
    templateUrl: './certificate-creation.component.html',
    styleUrls: ['./certificate-creation.component.scss']
})
export class CertificateCreationComponent implements OnInit {
    @Input()
    model = new Certificate();

    @Input()
    update = false;

    @Input()
    delete = false;

    @Input()
    disableID = false;

    farmers: Farmer[] = [];
    jsonThing = JSON.stringify;
    states = [{type: 'ISSUED'}, {type: 'REVOKED'}, {type: 'EXPIRED'}];
    isValid = false;

    constructor(private _certificateService: CertificateService, private _farmerService: FarmerService,
                public navigationService: NavigationService) {
    }

    ngOnInit(): void {
        this._farmerService.getAll().subscribe((farmers) => {this.farmers = farmers});
    }

    onValueChange(): void {
        this.model.setValid();
        this.isValid = !_.some(this.model, (value, prop) => _.isNull(value));
    }

    onCreate(): void {
        this._certificateService.save(this.model);
    }

    onDelete(): void {
        this._certificateService.delete(this.model);
    }
}
