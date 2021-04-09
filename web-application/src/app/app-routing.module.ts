import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CertificateListComponent} from '../certificates/certificate-list.component';
import {CertificateCreationPageComponent} from '../certificates/certificate-creation-page.component';
import {FarmerCreationPageComponent} from '../farmers/farmer-creation-page.component';
import {FarmerListComponent} from '../farmers/farmer-list.component';

const routes: Routes = [{
    path: 'certificate-list', component: CertificateListComponent
}, {
    path: 'create-certificate', component: CertificateCreationPageComponent
}, {
    path: 'farmer-list', component: FarmerListComponent
}, {
    path: 'create-farmer', component: FarmerCreationPageComponent
}, {
    path: '', redirectTo: '/certificate-list', pathMatch: 'full'
}];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
