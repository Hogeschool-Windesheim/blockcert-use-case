import {Component, ViewEncapsulation} from '@angular/core';
import {CertificateService} from '../data/services/certificate-service';
import {NavigationService} from '../app/navigation.service';

@Component({
    selector: 'certificate-creation-page',
    templateUrl: './certificate-creation-page.component.html',
    styleUrls: ['./certificate-creation-page.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CertificateCreationPageComponent {

    constructor(private _certificateService: CertificateService, public navigationService: NavigationService) {
    }
}
