import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Certificate} from '../data/models/certificate';
import {CertificateService} from '../data/services/certificate-service';
import * as _ from 'lodash';
import {MatSelectChange} from '@angular/material/select';

@Component({
    selector: 'certificate-list',
    templateUrl: './certificate-list.component.html',
    styleUrls: ['./certificate-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CertificateListComponent implements OnInit {
    certificates: Certificate[] = [];
    searchFields = [];
    currentFilterProperty: string = null;
    currentFilterValue: string = null;

    constructor(private _certificateService: CertificateService) {
    }

    ngOnInit(): void {
        const certificate = new Certificate();
        _.forEach(certificate, (value, prop) => this.searchFields.push(prop));
        this._certificateService.getAll().subscribe((certificates) => (this.certificates = certificates));
    }

    onPropertyChange(event: MatSelectChange): void {
        this.currentFilterProperty = event.value;
    }

    onValueChange(): void {
        if (!this.currentFilterProperty) { return; }

        this.certificates = _.filter(this._certificateService.getLocalAll(), c => {
            const value = _.get(c, this.currentFilterProperty, null);
            return _.includes(value, this.currentFilterValue);
        });
    }
}
