import {Component, Input} from '@angular/core';
import {Certificate} from '../data/models/certificate';
import {CertificateService} from '../data/services/certificate-service';
import * as _ from 'lodash';
import * as moment from 'moment';
import {NavigationService} from '../app/navigation.service';

@Component({
    selector: 'certificate-creation',
    templateUrl: './certificate-creation.component.html',
    styleUrls: ['./certificate-creation.component.scss']
})
export class CertificateCreationComponent {
    @Input()
    model = new Certificate();

    @Input()
    update = false;

    @Input()
    delete = false;

    jsonThing = JSON.stringify;
    states = [{type: 'ISSUED'}, {type: 'REVOKED'}, {}];
    isValid = false;

    constructor(private _certificateService: CertificateService, public navigationService: NavigationService) {
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
