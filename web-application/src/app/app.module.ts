import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CertificatesComponent} from '../certificates/certificates.component';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {HttpClientModule} from '@angular/common/http';
import {NavigationBarComponent} from './navigation-bar.component';
import {CertificateCreationComponent} from '../certificates/certificate-creation.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';


@NgModule({
    declarations: [
        AppComponent,
        CertificatesComponent,
        NavigationBarComponent,
        CertificateCreationComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        MatIconModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatExpansionModule,
        HttpClientModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatMomentDateModule,
        MatOptionModule,
        MatSelectModule
    ],
    providers: [MatDatepickerModule],
    bootstrap: [AppComponent]
})
export class AppModule {
}
