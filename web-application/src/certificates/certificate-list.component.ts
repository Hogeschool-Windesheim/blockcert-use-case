import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Certificate} from '../data/models/certificate';
import {CertificateService} from '../data/services/certificate-service';

@Component({
    selector: 'certificate-list',
    templateUrl: './certificate-list.component.html',
    styleUrls: ['./certificate-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CertificateListComponent implements OnInit {
    certificates: Certificate[] = [];

    constructor(private _certificateService: CertificateService) {
    }

    ngOnInit(): void {
        this._certificateService.getAll().subscribe((certificates) => (this.certificates = certificates));
    }
}
