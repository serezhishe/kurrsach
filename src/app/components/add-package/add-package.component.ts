import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TariffsService } from '@app/services/tariffs/tariffs.service';
import { InternetTariff, Nullable, SmartphoneTariff, TvTariff } from '@app/types';
import { combineLatest, Observable } from 'rxjs';
import { map, pluck, startWith } from 'rxjs/operators';

@Component({
	selector: 'app-add-package',
	templateUrl: './add-package.component.html',
	styleUrls: ['./add-package.component.less'],
})
export class AddPackageComponent implements OnInit {
	public error: Nullable<string> = null;
	public form: FormGroup = new FormGroup({
		package_name: new FormControl('', [
			Validators.required,
			Validators.pattern(/^[A-Za-z].+$/),
		]),
		description: new FormControl('', [
			Validators.required,
			Validators.minLength(50),
			Validators.maxLength(1500),
		]),
		month_pay: new FormControl(0),
		tv_tariff_id: new FormControl('', [
			Validators.required,
			Validators.pattern(/\(TariffId: \d+\)/),
		]),
		internet_tariff_id: new FormControl('', [
			Validators.required,
			Validators.pattern(/\(TariffId: \d+\)/),
		]),
		smartphone_tariff_id: new FormControl('', [
			Validators.required,
			Validators.pattern(/\(TariffId: \d+\)/),
		]),
	});
	public filteredTvTariffs$: Nullable<Observable<TvTariff[]>> = null;
	public filteredInternetTariffs$: Nullable<Observable<InternetTariff[]>> = null;
	public filteredSmartphoneTariffs$: Nullable<Observable<SmartphoneTariff[]>> = null;

	public file: Nullable<File> = null;

	public descriptionPreview$: Observable<SafeHtml> = this.form.controls.description.valueChanges.pipe(
		map((value) => {
			return this.sanitizer.bypassSecurityTrustHtml(value);
		})
	);

	constructor(
		private sanitizer: DomSanitizer,
		private tariffsService: TariffsService,
		private http: HttpClient,
		private router: Router,
	) {}

	public ngOnInit(): void {
		this.filteredTvTariffs$ = combineLatest([
			this.http.get<{ tariffs: TvTariff[] }>('/api/tv_tariffs').pipe(
				pluck('tariffs')
			),
			this.form.controls.tv_tariff_id.valueChanges.pipe(startWith('')),
		]).pipe(
			map(([tariffs, filter]) => tariffs.filter(tariff => tariff.tv_tariff_name.toLowerCase().includes(`${filter}`.toLowerCase()))),
		);
		this.filteredInternetTariffs$ = combineLatest([
			this.http.get<{ tariffs: InternetTariff[] }>('/api/internet_tariffs').pipe(
				pluck('tariffs')
			),
			this.form.controls.internet_tariff_id.valueChanges.pipe(startWith('')),
		]).pipe(
			map(([tariffs, filter]) => tariffs.filter(tariff => tariff.internet_tariff_name.toLowerCase().includes(`${filter}`.toLowerCase()))),
		);
		this.filteredSmartphoneTariffs$ = combineLatest([
			this.http.get<{ tariffs: SmartphoneTariff[] }>('/api/smartphone_tariffs').pipe(
				pluck('tariffs')
			),
			this.form.controls.smartphone_tariff_id.valueChanges.pipe(startWith('')),
		]).pipe(
			map(([tariffs, filter]) => tariffs.filter(tariff => tariff.smartphone_tariff_name.toLowerCase().includes(`${filter}`.toLowerCase()))),
		);
	}

	public submit(): void {
		if (this.form.valid) {
			if (!this.file) {
				this.error = 'No image is provided';
				return;
			}
			const tariffData = {
				...this.form.value,
				tv_tariff_id: this.form.value.tv_tariff_id.match(/\(TariffId: \d+\)/)[0].match(/\d+/)[0],
				internet_tariff_id: this.form.value.internet_tariff_id.match(/\(TariffId: \d+\)/)[0].match(/\d+/)[0],
				smartphone_tariff_id: this.form.value.smartphone_tariff_id.match(/\(TariffId: \d+\)/)[0].match(/\d+/)[0],
			};
			this.tariffsService
				.addPackage(tariffData, this.file)
				.subscribe(() => {
					this.router.navigateByUrl('/main');
				});
		}
	}

	public onFileSelected(): void {
		this.error = null;
		const inputNode: HTMLInputElement = document.querySelector(
			'#file'
		) as any;
		const copy = inputNode.files!.item(0)?.slice();
		this.file = inputNode.files!.item(0);
		const urlCreator = window.URL || window.webkitURL;
		const imageUrl = urlCreator.createObjectURL(copy);
		(document.querySelector('#image')! as any).src = imageUrl;
	}

	public goBack(): void {
		this.router.navigateByUrl('/main');
	}

	public async onJSONFileSelected(): Promise<void> {
		const inputNode: HTMLInputElement = document.querySelector(
			'#json'
		) as any;
		const file = await inputNode.files!.item(0)?.text();
		const imported = JSON.parse(file || '{}');
		if (imported.package_name && typeof imported.package_name === 'string') {
			this.form.controls.package_name.setValue(imported.package_name);
		}
		if (imported.description && typeof imported.description === 'string') {
			this.form.controls.description.setValue(imported.description);
		}
		if (imported.month_pay && typeof imported.month_pay === 'number') {
			this.form.controls.month_pay.setValue(imported.month_pay);
		}
		if (
			imported.tv_tariff_id && typeof imported.tv_tariff_id === 'number'
			&& imported.tv_tariff_name && typeof imported.tv_tariff_name === 'string'
		) {
			this.form.controls.tv_tariff_id.setValue(`${imported.tv_tariff_name} (TariffId: ${imported.tv_tariff_id})`);
		}
		if (
			imported.internet_tariff_id && typeof imported.internet_tariff_id === 'number'
			&& imported.internet_tariff_name && typeof imported.internet_tariff_name === 'string'
		) {
			this.form.controls.internet_tariff_id.setValue(`${imported.internet_tariff_name} (TariffId: ${imported.internet_tariff_id})`);
		}
		if (
			imported.smartphone_tariff_id && typeof imported.smartphone_tariff_id === 'number'
			&& imported.smartphone_tariff_name && typeof imported.smartphone_tariff_name === 'string'
		) {
			this.form.controls.smartphone_tariff_id.setValue(`${imported.smartphone_tariff_name} (TariffId: ${imported.smartphone_tariff_id})`);
		}
	}
}
