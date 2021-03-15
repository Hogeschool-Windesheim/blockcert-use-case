import {Component} from '@angular/core';
import {Certificate} from '../data/models/certificate';

@Component({
    selector: 'certificate-creation',
    templateUrl: './certificate-creation.component.html',
    styleUrls: ['./certificate-creation.component.scss']
})
export class CertificateCreationComponent {
    model = new Certificate();
    jsonThing = JSON.stringify;
    states = [{type: 'ISSUED'}, {type: 'REVOKED'}];
}
