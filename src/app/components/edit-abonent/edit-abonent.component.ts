import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from '@app/services';
import { Abonent, Package } from '@app/types';
import {
	Nullable,
	TvTariff,
	InternetTariff,
	SmartphoneTariff,
} from '@app/types';
import { Observable, combineLatest } from 'rxjs';
import { map, pluck, startWith, tap } from 'rxjs/operators';

@Component({
	selector: 'app-edit-abonent',
	templateUrl: './edit-abonent.component.html',
	styleUrls: ['./edit-abonent.component.less'],
})
export class EditAbonentComponent implements OnInit {
	public error: Nullable<string> = null;
	public form: FormGroup = new FormGroup({
		tv_tariff: new FormControl(this.data.tv_tariff_name),
		internet_tariff: new FormControl(this.data.internet_tariff_name),
		smartphone_tariff: new FormControl(this.data.smartphone_tariff_name),
		package_id: new FormControl(this.data.package_name),
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
		private router: Router,
		public dialogRef: MatDialogRef<EditAbonentComponent>,
		@Inject(MAT_DIALOG_DATA) public data: Abonent,
	) {}

	public smartphoneTariffId: Nullable<number> = this.data.smartphone_tariff_id;
	public internetTariffId: Nullable<number> = this.data.internet_tariff_id;
	public tvTariffId: Nullable<number> = this.data.tv_tariff_id;
	public packageId: Nullable<number> = this.data.package_id;
	public disabled = false;

	public ngOnInit(): void {
		if (this.data.package_id) {
			this.smartphoneTariffId = null;
			this.form.controls.tv_tariff.setValue('-');
			this.form.controls.tv_tariff.disable();
			this.tvTariffId = null;
			this.form.controls.internet_tariff.setValue('-');
			this.form.controls.internet_tariff.disable();
			this.internetTariffId = null;
			this.form.controls.smartphone_tariff.setValue('-');
			this.form.controls.smartphone_tariff.disable();
		}
		this.filteredTvTariffs$ = combineLatest([
			this.http
				.get<{ tariffs: TvTariff[] }>('/api/tv_tariffs')
				.pipe(pluck('tariffs')),
			this.form.controls.tv_tariff.valueChanges.pipe(
				tap(() => {
					if (this.tvTariffId) {
						this.tvTariffId = null;
					}
				}),
				startWith(''),
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
				tap(() => {
					if (this.internetTariffId) {
						this.internetTariffId = null;
					}
				}),
				startWith(''),
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
				tap(() => {
					if (this.smartphoneTariffId) {
						this.smartphoneTariffId = null;
					}
				}),
				startWith(''),
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
				tap(() => {
					if (this.packageId) {
						this.packageId = null;
						this.form.controls.tv_tariff.setValue('');
						this.form.controls.internet_tariff.setValue('');
						this.form.controls.smartphone_tariff.setValue('');
						this.form.controls.tv_tariff.enable();
						this.form.controls.internet_tariff.enable();
						this.form.controls.smartphone_tariff.enable();
					}
				}),
				startWith(''),
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
			const abonentData: Partial<Abonent> = {
				abonent_id: this.data.abonent_id,
				user_id: this.data.user_id,
				balance: this.data.balance,
				left_minute_count: this.data.left_minute_count,
				left_gb_count: this.data.left_gb_count,
				left_home_gb_count: this.data.left_home_gb_count,
				left_sms_count: this.data.left_sms_count,
				phone_number: this.data.phone_number,
				smartphone_tariff_id: this.smartphoneTariffId,
				internet_tariff_id: this.internetTariffId,
				tv_tariff_id: this.tvTariffId,
				package_id: this.packageId,
			};
			this.disabled = true;
			this.userService
				.editAbonent(abonentData)
				.subscribe(() => {
					this.dialogRef.close();
				});
		}
	}

	public onCancel(): void {
		this.dialogRef.close();
	}

	public onSmartphoneSelected(e: any): void {
		const id = e.option._element.nativeElement.tariffId;
		if (id === null) {
			this.smartphoneTariffId = null;
		} else {
			this.smartphoneTariffId = id;
		}
	}

	public onTvSelected(e: any): void {
		const id = e.option._element.nativeElement.tariffId;
		if (id === null) {
			this.tvTariffId = null;
		} else {
			this.tvTariffId = id;
		}
	}

	public onPackageSelected(e: any): void {
		const id = e.option._element.nativeElement.packageId;
		if (id === null) {
			this.packageId = null;
		} else {
			this.packageId = id;
			this.smartphoneTariffId = null;
			this.form.controls.tv_tariff.setValue('-');
			this.form.controls.tv_tariff.disable();
			this.tvTariffId = null;
			this.form.controls.internet_tariff.setValue('-');
			this.form.controls.internet_tariff.disable();
			this.internetTariffId = null;
			this.form.controls.smartphone_tariff.setValue('-');
			this.form.controls.smartphone_tariff.disable();
		}
	}

	public onInternetSelected(e: any): void {
		const id = e.option._element.nativeElement.tariffId;
		if (id === null) {
			this.internetTariffId = null;
		} else {
			this.internetTariffId = id;
		}
	}
}
