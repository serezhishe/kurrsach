import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import {
	RegisterComponent,
	LoginComponent,
	HeaderComponent,
	AccountComponent,
	VerifyComponent,
	AddSmartphoneTariffComponent,
} from '@app/components';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SmartphoneTariffsComponent } from './components/smartphone-tariffs/smartphone-tariffs.component';
import { MainComponent } from './components/main/main.component';
import { InternetTariffsComponent } from './components/internet-tariffs/internet-tariffs.component';
import { TvTariffsComponent } from './components/tv-tariffs/tv-tariffs.component';
import { PackagesComponent } from './components/packages/packages.component';
import { MatListModule } from '@angular/material/list';
import { AddInternetTariffComponent } from './components/add-internet-tariff/add-internet-tariff.component';
import { AddTvTariffComponent } from './components/add-tv-tariff/add-tv-tariff.component';
import { AddPackageComponent } from './components/add-package/add-package.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { AbonentInfoComponent } from './components/abonent-info/abonent-info.component';
import { AddAbonentComponent } from './components/add-abonent/add-abonent.component';
import { AllUsersComponent } from './components/all-users/all-users.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { EditAbonentComponent } from './components/edit-abonent/edit-abonent.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		RegisterComponent,
		HeaderComponent,
		AccountComponent,
		VerifyComponent,
		AddSmartphoneTariffComponent,
  		SmartphoneTariffsComponent,
		MainComponent,
		InternetTariffsComponent,
		TvTariffsComponent,
		PackagesComponent,
		AddInternetTariffComponent,
		AddTvTariffComponent,
		AddPackageComponent,
		UserInfoComponent,
		AbonentInfoComponent,
		AddAbonentComponent,
		AllUsersComponent,
		EditAbonentComponent,
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		CommonModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		MatButtonModule,
		ReactiveFormsModule,
		MatCardModule,
		MatInputModule,
		MatToolbarModule,
		MatTabsModule,
		MatListModule,
		MatAutocompleteModule,
		MatIconModule,
		MatTableModule,
		MatPaginatorModule,
		MatSortModule,
		MatDialogModule,
		MatSelectModule,
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: JwtInterceptor,
			multi: true,
		},
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	bootstrap: [AppComponent],
})
export class AppModule {}
