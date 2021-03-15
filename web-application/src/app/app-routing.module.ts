import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CertificatesComponent} from '../certificates/certificates.component';
import {CertificateCreationComponent} from '../certificates/certificate-creation.component';

const routes: Routes = [{
    path: 'certificate-list', component: CertificatesComponent
}, {
    path: 'create-certificate', component: CertificateCreationComponent
}, {
    path: '', redirectTo: '/certificate-list', pathMatch: 'full'
}];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
