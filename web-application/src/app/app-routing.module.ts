import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CertificateListComponent} from '../certificates/certificate-list.component';
import {CertificateCreationPageComponent} from '../certificates/certificate-creation-page.component';
import {FarmerCreationPageComponent} from '../farmers/farmer-creation-page.component';
import {FarmerListComponent} from '../farmers/farmer-list.component';
import {LoggedInGuard} from '../login/login-guard';
import {LoginPageComponent} from '../login/login-page.component';

const routes: Routes = [{
    path: 'certificate-list', component: CertificateListComponent, canActivate: [LoggedInGuard]
}, {
    path: 'create-certificate', component: CertificateCreationPageComponent, canActivate: [LoggedInGuard]
}, {
    path: 'farmer-list', component: FarmerListComponent, canActivate: [LoggedInGuard]
}, {
    path: 'create-farmer', component: FarmerCreationPageComponent, canActivate: [LoggedInGuard]
}, {
    path: 'login', component: LoginPageComponent

}, {
    path: '', redirectTo: '/login', pathMatch: 'full'
}];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
