import {Component, Input} from '@angular/core';
import {Certificate} from '../data/models/certificate';
import {CertificateService} from '../data/services/certificate-service';
import {Router} from '@angular/router';

@Component({
    selector: 'certificate-comp',
    templateUrl: './certificate.component.html',
    styleUrls: ['./certificate.component.scss']
})
export class CertificateComponent {
    @Input()
    certificate: Certificate;

    constructor(private _certificateService: CertificateService, private _router: Router) {
    }

    ngOnInit() {
    }

    onUpdate() {
        // this.router.this._certificateService.delete(this.certificate);
    }

    onDelete() {
        this._certificateService.delete(this.certificate);
    }

}
