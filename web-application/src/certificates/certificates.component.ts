import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Certificate} from '../data/models/certificate';
import {CertificateService} from '../data/services/certificate-service';
import * as _ from 'lodash';

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
        this._certificateService.getAll().then((data: any) => {
            console.log(data);
            _.forEach(data.message, (datas: any) => {
                console.log(datas['Record']);
                this.certificates.push(datas['Record']);
            });
            console.log(this.certificates);
        });
    }

}
