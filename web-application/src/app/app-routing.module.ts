import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CertificateListComponent} from '../certificates/certificate-list.component';
import {CertificateCreationComponent} from '../certificates/certificate-creation.component';

const routes: Routes = [{
    path: 'certificate-list', component: CertificateListComponent
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
