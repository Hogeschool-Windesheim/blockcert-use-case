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
        this.certificates = this._certificateService.getAll();
    }

    ngOnInit(): void {
    }

}
