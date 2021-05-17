import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UserService } from '@app/services';
import { JsonService } from '@app/services/json/json.service';
import { Package } from 'backend/types';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.less']
})
export class PackagesComponent {
	public packages$ = this.http.get<{ packages: Package[] }>('/api/packages').pipe(
		pluck('packages')
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

	getSafeHTML(value: string): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(value);
	}

	public navigate(): void {
		this.router.navigateByUrl('/login');
	}

	public addPackage(): void {
		this.router.navigateByUrl('/addPackage');
	}

	public deletePackage(id: number): void {
		this.http.delete('/api/packages?id=' + id).subscribe(() => {
			this.packages$ = this.http.get<{ packages: Package[] }>('/api/packages').pipe(
				pluck('packages'),
			);
		});
	}

	public export(packageData: Package): void {
		this.jsonService.saveFile(packageData, `${packageData.package_name}.json`);
	}
}
