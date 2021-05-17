import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '@app/services';
import { Package } from '@app/types';
import {
	Nullable,
	TvTariff,
	InternetTariff,
	SmartphoneTariff,
} from '@app/types';
import { Observable, combineLatest } from 'rxjs';
import { map, pluck, startWith, tap } from 'rxjs/operators';

@Component({
	selector: 'app-add-abonent',
	templateUrl: './add-abonent.component.html',
	styleUrls: ['./add-abonent.component.less'],
})
export class AddAbonentComponent implements OnInit {
	public smartphoneTariffId: Nullable<string> = null;
	public internetTariffId: Nullable<string> = null;
	public tvTariffId: Nullable<string> = null;
	public packageId: Nullable<string> = null;
	public error: Nullable<string> = null;
	public form: FormGroup = new FormGroup({
		tv_tariff: new FormControl(''),
		internet_tariff: new FormControl(''),
		smartphone_tariff: new FormControl(''),
		package_id: new FormControl(''),
	});
	public filteredTvTariffs$: Nullable<Observable<TvTariff[]>> = null;
	public filteredInternetTariffs$: Nullable<
		Observable<InternetTariff[]>
	> = null;
	public filteredSmartphoneTariffs$: Nullable<
		Observable<SmartphoneTariff[]>
	> = null;
	public filteredPackages$: Nullable<Observable<Package[]>> = null;

	constructor(
		private userService: UserService,
		private http: HttpClient,
		private router: Router
	) {}

	public ngOnInit(): void {
		this.filteredTvTariffs$ = combineLatest([
			this.http
				.get<{ tariffs: TvTariff[] }>('/api/tv_tariffs')
				.pipe(pluck('tariffs')),
			this.form.controls.tv_tariff.valueChanges.pipe(
				startWith(''),
				tap(() => {
					if (this.tvTariffId) {
						this.tvTariffId = null;
					}
				})
			),
		]).pipe(
			map(([tariffs, filter]) =>
				tariffs.filter((tariff) =>
					tariff.tv_tariff_name
						.toLowerCase()
						.includes(`${filter}`.toLowerCase())
				)
			)
		);
		this.filteredInternetTariffs$ = combineLatest([
			this.http
				.get<{ tariffs: InternetTariff[] }>('/api/internet_tariffs')
				.pipe(pluck('tariffs')),
			this.form.controls.internet_tariff.valueChanges.pipe(
				startWith(''),
				tap(() => {
					if (this.internetTariffId) {
						this.internetTariffId = null;
					}
				})
			),
		]).pipe(
			map(([tariffs, filter]) =>
				tariffs.filter((tariff) =>
					tariff.internet_tariff_name
						.toLowerCase()
						.includes(`${filter}`.toLowerCase())
				)
			)
		);
		this.filteredSmartphoneTariffs$ = combineLatest([
			this.http
				.get<{ tariffs: SmartphoneTariff[] }>('/api/smartphone_tariffs')
				.pipe(pluck('tariffs')),
			this.form.controls.smartphone_tariff.valueChanges.pipe(
				startWith(''),
				tap(() => {
					if (this.smartphoneTariffId) {
						this.smartphoneTariffId = null;
					}
				})
			),
		]).pipe(
			map(([tariffs, filter]) =>
				tariffs.filter((tariff) =>
					tariff.smartphone_tariff_name
						.toLowerCase()
						.includes(`${filter}`.toLowerCase())
				)
			)
		);
		this.filteredPackages$ = combineLatest([
			this.http
				.get<{ packages: Package[] }>('/api/packages')
				.pipe(pluck('packages')),
			this.form.controls.package_id.valueChanges.pipe(
				startWith(''),
				tap(() => {
					if (this.packageId) {
						this.packageId = null;
						this.form.controls.tv_tariff.enable();
						this.form.controls.internet_tariff.enable();
						this.form.controls.smartphone_tariff.enable();
					}
				})
			),
		]).pipe(
			map(([packages, filter]) =>
				packages.filter((packageData) =>
					packageData.package_name
						.toLowerCase()
						.includes(`${filter}`.toLowerCase())
				)
			)
		);
	}

	public submit(): void {
		if (
			this.smartphoneTariffId ||
			this.internetTariffId ||
			this.tvTariffId ||
			this.packageId
		) {
			const abonentData: any = {};
			if (this.smartphoneTariffId) {
				abonentData.smartphone_tariff_id = this.smartphoneTariffId;
			}
			if (this.internetTariffId) {
				abonentData.internet_tariff_id = this.internetTariffId;
			}
			if (this.tvTariffId) {
				abonentData.tv_tariff_id = this.tvTariffId;
			}
			if (this.packageId) {
				abonentData.package_id = this.packageId;
			}
			this.userService
				.addAbonent(abonentData)
				.subscribe(() => {
					this.router.navigateByUrl('/account');
				});
		}
	}

	public goBack(): void {
		this.router.navigateByUrl('/account');
	}

	public onSmartphoneSelected(e: any): void {
		this.smartphoneTariffId = e.option._element.nativeElement.tariffId;
	}

	public onTvSelected(e: any): void {
		this.tvTariffId = e.option._element.nativeElement.tariffId;
	}

	public onPackageSelected(e: any): void {
		this.smartphoneTariffId = null;
		this.form.controls.tv_tariff.setValue(null);
		this.form.controls.tv_tariff.disable();
		this.tvTariffId = null;
		this.form.controls.internet_tariff.setValue(null);
		this.form.controls.internet_tariff.disable();
		this.internetTariffId = null;
		this.form.controls.smartphone_tariff.setValue(null);
		this.form.controls.smartphone_tariff.disable();
		this.packageId = e.option._element.nativeElement.packageId;
	}

	public onInternetSelected(e: any): void {
		this.internetTariffId = e.option._element.nativeElement.tariffId;
	}
}
