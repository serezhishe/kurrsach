import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UserService } from '@app/services';
import { JsonService } from '@app/services/json/json.service';
import { TvTariff } from 'backend/types';
import { pluck } from 'rxjs/operators';

@Component({
	selector: 'app-tv-tariffs',
	templateUrl: './tv-tariffs.component.html',
	styleUrls: ['./tv-tariffs.component.less'],
})
export class TvTariffsComponent implements OnInit {
	public tariffs$ = this.http.get<{ tariffs: TvTariff[] }>('/api/tv_tariffs').pipe(
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
		this.router.navigateByUrl('/addTvTariff');
	}

	public deleteTariff(id: number): void {
		this.http.delete('/api/tv_tariffs?id=' + id).subscribe(() => {
			this.tariffs$ = this.http.get<{ tariffs: TvTariff[] }>('/api/tv_tariffs').pipe(
				pluck('tariffs')
			);
		});
	}

	public export(tariff: TvTariff): void {
		this.jsonService.saveFile(tariff, `${tariff.tv_tariff_name}.json`);
	}
}
