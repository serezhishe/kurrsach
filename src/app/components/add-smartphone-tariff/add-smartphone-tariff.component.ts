import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Nullable } from '@app/types/common';
import { TariffsService } from '@app/services/tariffs/tariffs.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-smartphone-add-tariff',
	templateUrl: './add-smartphone-tariff.component.html',
	styleUrls: ['./add-smartphone-tariff.component.less'],
})
export class AddSmartphoneTariffComponent {
	public error: Nullable<string> = null;
	public form: FormGroup = new FormGroup({
		smartphone_tariff_name: new FormControl('', [
			Validators.required,
			Validators.pattern(/^[A-Za-z].+$/),
		]),
		description: new FormControl('', [
			Validators.required,
			Validators.minLength(50),
			Validators.maxLength(1500),
		]),
		month_pay: new FormControl(0),
		included_minute_cost: new FormControl(0),
		included_gb_cost: new FormControl(0),
		included_sms_cost: new FormControl(0),
		over_minute_cost: new FormControl(0),
		over_gb_cost: new FormControl(0),
		over_sms_cost: new FormControl(0),
		included_minute_count: new FormControl(0),
		included_gb_count: new FormControl(0),
		included_sms_count: new FormControl(0),
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
		private router: Router
	) {}

	public submit(): void {
		if (this.form.valid) {
			if (!this.file) {
				this.error = 'No image is provided';
				return;
			}
			const tariffData = this.form.value;
			this.tariffsService
				.addSmartphoneTarriff(tariffData, this.file)
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
		if (imported.smartphone_tariff_name && typeof imported.smartphone_tariff_name === 'string') {
			this.form.controls.smartphone_tariff_name.setValue(imported.smartphone_tariff_name);
		}
		if (imported.description && typeof imported.description === 'string') {
			this.form.controls.description.setValue(imported.description);
		}
		if (imported.month_pay && typeof imported.month_pay === 'number') {
			this.form.controls.month_pay.setValue(imported.month_pay);
		}
		if (imported.included_minute_cost && typeof imported.included_minute_cost === 'number') {
			this.form.controls.included_minute_cost.setValue(imported.included_minute_cost);
		}
		if (imported.included_gb_cost && typeof imported.included_gb_cost === 'number') {
			this.form.controls.included_gb_cost.setValue(imported.included_gb_cost);
		}
		if (imported.included_sms_cost && typeof imported.included_sms_cost === 'number') {
			this.form.controls.included_sms_cost.setValue(imported.included_sms_cost);
		}
		if (imported.over_minute_cost && typeof imported.over_minute_cost === 'number') {
			this.form.controls.over_minute_cost.setValue(imported.over_minute_cost);
		}
		if (imported.over_gb_cost && typeof imported.over_gb_cost === 'number') {
			this.form.controls.over_gb_cost.setValue(imported.over_gb_cost);
		}
		if (imported.over_sms_cost && typeof imported.over_sms_cost === 'number') {
			this.form.controls.over_sms_cost.setValue(imported.over_sms_cost);
		}
		if (imported.included_minute_count && typeof imported.included_minute_count === 'number') {
			this.form.controls.included_minute_count.setValue(imported.included_minute_count);
		}
		if (imported.included_gb_count && typeof imported.included_gb_count === 'number') {
			this.form.controls.included_gb_count.setValue(imported.included_gb_count);
		}
		if (imported.included_sms_count && typeof imported.included_sms_count === 'number') {
			this.form.controls.included_sms_count.setValue(imported.included_sms_count);
		}
	}
}
