import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent, RegisterComponent, AccountComponent, VerifyComponent, AddSmartphoneTariffComponent } from '@app/components';
import { AddAbonentComponent } from './components/add-abonent/add-abonent.component';
import { AddInternetTariffComponent } from './components/add-internet-tariff/add-internet-tariff.component';
import { AddPackageComponent } from './components/add-package/add-package.component';
import { AddTvTariffComponent } from './components/add-tv-tariff/add-tv-tariff.component';
import { AllUsersComponent } from './components/all-users/all-users.component';
import { MainComponent } from './components/main/main.component';
import { LoggedGuard } from './guards/logged.guard';
import { RoleGuardGuard } from './guards/role-guard.guard';

const routes: Routes = [
	{ path: 'main', component: MainComponent },
	{ path: 'login', component: LoginComponent, canActivate: [LoggedGuard] },
	{ path: 'register', component: RegisterComponent, canActivate: [LoggedGuard] },
	{ path: 'account', component: AccountComponent, canActivate: [LoggedGuard] },
	{ path: 'verify', component: VerifyComponent, canActivate: [LoggedGuard] },
	{ path: 'addSmartphoneTariff', component: AddSmartphoneTariffComponent, canActivate: [LoggedGuard, RoleGuardGuard] },
	{ path: 'addTvTariff', component: AddTvTariffComponent, canActivate: [LoggedGuard, RoleGuardGuard] },
	{ path: 'addInternetTariff', component: AddInternetTariffComponent, canActivate: [LoggedGuard, RoleGuardGuard] },
	{ path: 'addPackage', component: AddPackageComponent, canActivate: [LoggedGuard, RoleGuardGuard] },
	{ path: 'addAbonent', component: AddAbonentComponent, canActivate: [LoggedGuard, RoleGuardGuard] },
	{ path: 'allUsers', component: AllUsersComponent, canActivate: [LoggedGuard, RoleGuardGuard] },
	{ path: '**', redirectTo: 'main' },
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true })],
	exports: [RouterModule]
})
export class AppRoutingModule { }
