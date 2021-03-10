import {Injectable} from '@angular/core';
import {Certificate} from '../models/certificate';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class CertificateService {
    CERTIFICATES = [new Certificate(), new Certificate()];

    configUrl = 'http://localhost:4000/users';

    constructor(private http: HttpClient) {
    }

    async getAll(): Promise<Certificate[]> {
        const data = await this.http.get<Certificate[]>(this.configUrl).toPromise();
        console.log(data);
        return await this.http.get<Certificate[]>(this.configUrl).toPromise();
    }

    // getAll(): Certificate[] {
    //     this.CERTIFICATES[0].revoked = true;
    //     this.CERTIFICATES[1].id = 2;
    //     return this.CERTIFICATES;
    // }
}
