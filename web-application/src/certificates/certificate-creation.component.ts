import {Component} from '@angular/core';
import {Certificate} from '../data/models/certificate';
import {CertificateService} from '../data/services/certificate-service';

@Component({
    selector: 'certificate-creation',
    templateUrl: './certificate-creation.component.html',
    styleUrls: ['./certificate-creation.component.scss']
})
export class CertificateCreationComponent {
    model = new Certificate();
    jsonThing = JSON.stringify;
    states = [{type: 'ISSUED'}, {type: 'REVOKED'}];

    constructor(private _certificateService: CertificateService) {
    }

    onCreate(): void {
        this._certificateService.save(this.model);
    }
}
