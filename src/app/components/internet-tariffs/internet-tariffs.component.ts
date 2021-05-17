import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UserService } from '@app/services';
import { JsonService } from '@app/services/json/json.service';
import { InternetTariff } from '@app/types';
import { pluck } from 'rxjs/operators';

@Component({
	selector: 'app-internet-tariffs',
	templateUrl: './internet-tariffs.component.html',
	styleUrls: ['./internet-tariffs.component.less'],
})
export class InternetTariffsComponent implements OnInit {
	public tariffs$ = this.http.get<{ tariffs: InternetTariff[] }>('/api/internet_tariffs').pipe(
		pluck('tariffs')
	);

	public isAuth$ = this.userService.isAuthorized$;
	public canAddTariffs$ = this.userService.canAddTariffs$;

	constructor(
		private sanitizer: DomSanitizer,
		private http: HttpClient,
		private userService: UserService,
		private router: Router,
		private jsonService: JsonService,
	) {}

	getSafeHTML(value: string): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(value);
	}

	public navigate(): void {
		this.router.navigateByUrl('/login');
	}

	public addTariff(): void {
		this.router.navigateByUrl('/addInternetTariff');
	}

	ngOnInit(): void {}

	public deleteTariff(id: number): void {
		this.http.delete('/api/internet_tariffs?id=' + id).subscribe(() => {
			this.tariffs$ = this.http.get<{ tariffs: InternetTariff[] }>('/api/internet_tariffs').pipe(
				pluck('tariffs')
			);
		});
	}

	public export(tariff: InternetTariff): void {
		this.jsonService.saveFile(tariff, `${tariff.internet_tariff_name}.json`);
	}
}
