import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CertificateListComponent} from '../certificates/certificate-list.component';
import {CertificateCreationPageComponent} from '../certificates/certificate-creation-page.component';

const routes: Routes = [{
    path: 'certificate-list', component: CertificateListComponent
}, {
    path: 'create-certificate', component: CertificateCreationPageComponent
}, {
    path: '', redirectTo: '/certificate-list', pathMatch: 'full'
}];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
