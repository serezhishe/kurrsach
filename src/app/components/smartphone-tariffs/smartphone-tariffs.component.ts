import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UserService } from '@app/services';
import { JsonService } from '@app/services/json/json.service';
import { SmartphoneTariff } from '@app/types';
import { pluck } from 'rxjs/operators';

@Component({
	selector: 'app-smartphone-tariffs',
	templateUrl: './smartphone-tariffs.component.html',
	styleUrls: ['./smartphone-tariffs.component.less'],
})
export class SmartphoneTariffsComponent implements OnInit {
	public tariffs$ = this.http.get<{ tariffs: SmartphoneTariff[] }>('/api/smartphone_tariffs').pipe(
		pluck('tariffs')
	);

	public canAddTariffs$ = this.userService.canAddTariffs$;
	public isAuth$ = this.userService.isAuthorized$;

	constructor(
		private sanitizer: DomSanitizer,
		private http: HttpClient,
		private userService: UserService,
		private router: Router,
		private jsonService: JsonService,
	) {}

	ngOnInit(): void {}

	getSafeHTML(value: string): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(value);
	}

	public navigate(): void {
		this.router.navigateByUrl('/login');
	}

	public addTariff(): void {
		this.router.navigateByUrl('/addSmartphoneTariff');
	}

	public deleteTariff(id: number): void {
		this.http.delete('/api/smartphone_tariffs?id=' + id).subscribe(() => {
			this.tariffs$ = this.http.get<{ tariffs: SmartphoneTariff[] }>('/api/smartphone_tariffs').pipe(
				pluck('tariffs')
			);
		});
	}

	public export(tariff: SmartphoneTariff): void {
		this.jsonService.saveFile(tariff, `${tariff.smartphone_tariff_name}.json`);
	}
}
