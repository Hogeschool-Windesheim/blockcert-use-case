import {Component, Input} from '@angular/core';
import {Certificate} from '../data/models/certificate';

@Component({
    selector: 'certificate-comp',
    templateUrl: './certificate.component.html',
    styleUrls: ['./certificate.component.scss']
})
export class CertificateComponent {
    @Input()
    certificate: Certificate;

    constructor() {
    }
}
