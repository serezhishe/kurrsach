import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TariffsService } from '@app/services/tariffs/tariffs.service';
import { Nullable } from 'backend/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
	selector: 'app-add-internet-tariff',
	templateUrl: './add-internet-tariff.component.html',
	styleUrls: ['./add-internet-tariff.component.less'],
})
export class AddInternetTariffComponent {
	public error: Nullable<string> = null;
	public form: FormGroup = new FormGroup({
		internet_tariff_name: new FormControl('', [
			Validators.required,
			Validators.pattern(/^[A-Za-z].+$/),
		]),
		description: new FormControl('', [
			Validators.required,
			Validators.minLength(50),
			Validators.maxLength(1500),
		]),
		month_pay: new FormControl(0),
		included_home_gb_cost: new FormControl(0),
		over_home_gb_cost: new FormControl(0),
		included_home_gb_count: new FormControl(0),
		max_speed: new FormControl(0),
	});

	public file: Nullable<File> = null;

	public descriptionPreview$: Observable<SafeHtml> = this.form.controls.description.valueChanges.pipe(
		map((value) => {
			return this.sanitizer.bypassSecurityTrustHtml(value);
		})
	);

	constructor(
		private sanitizer: DomSanitizer,
		private tariffsService: TariffsService,
		private router: Router,
	) {}

	public submit(): void {
		if (this.form.valid) {
			if (!this.file) {
				this.error = 'No image is provided';
				return;
			}
			const tariffData = this.form.value;
			this.tariffsService
				.addInternetTarriff(tariffData, this.file)
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
		if (imported.internet_tariff_name && typeof imported.internet_tariff_name === 'string') {
			this.form.controls.internet_tariff_name.setValue(imported.internet_tariff_name);
		}
		if (imported.description && typeof imported.description === 'string') {
			this.form.controls.description.setValue(imported.description);
		}
		if (imported.month_pay && typeof imported.month_pay === 'number') {
			this.form.controls.month_pay.setValue(imported.month_pay);
		}
		if (imported.included_home_gb_cost && typeof imported.included_home_gb_cost === 'number') {
			this.form.controls.included_home_gb_cost.setValue(imported.included_home_gb_cost);
		}
		if (imported.over_home_gb_cost && typeof imported.over_home_gb_cost === 'number') {
			this.form.controls.over_home_gb_cost.setValue(imported.over_home_gb_cost);
		}
		if (imported.included_home_gb_count && typeof imported.included_home_gb_count === 'number') {
			this.form.controls.included_home_gb_count.setValue(imported.included_home_gb_count);
		}
	}
}
