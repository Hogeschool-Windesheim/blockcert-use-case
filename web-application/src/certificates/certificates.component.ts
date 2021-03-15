import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Certificate} from '../data/models/certificate';
import {CertificateService} from '../data/services/certificate-service';

@Component({
    selector: 'app-certificates',
    templateUrl: './certificates.component.html',
    styleUrls: ['./certificates.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CertificatesComponent implements OnInit {
    certificates: Certificate[] = [];

    constructor(private _certificateService: CertificateService) {
    }

    ngOnInit(): void {
        this._certificateService.getAll().then((certificates) => (this.certificates = certificates));
    }

    getValidLabel(certificate: Certificate): string {
        if (certificate.StartDate < new Date() && certificate.EndDate > new Date()) {
            return `Valid until ${certificate.EndDate}`;
        }

        return 'Not valid anymore';
    }

}
