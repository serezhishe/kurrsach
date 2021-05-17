import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InternetTariff, Package, SmartphoneTariff, TvTariff } from '@app/types';
import { Observable } from 'rxjs';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class TariffsService {
	constructor(
		private http: HttpClient,
		private userService: UserService,
	) { }

	public addSmartphoneTarriff(smartphoneTariffData: Partial<SmartphoneTariff>, img: File): Observable<void> {
		const data = new FormData();
		data.append('file', img!);
		data.append('added_by', this.userService.user$.value!.user_id + '');
		Object.keys(smartphoneTariffData).forEach(key => {
			data.append(key, (smartphoneTariffData as any)[key]);
		});
		return this.http.post<void>(
			'/api/add_smartphone_tariff?smartphone_tariff_name=' + smartphoneTariffData.smartphone_tariff_name,
			data,
		);
	}

	public addInternetTarriff(internetTariffData: Partial<InternetTariff>, img: File): Observable<void> {
		const data = new FormData();
		data.append('file', img!);
		data.append('added_by', this.userService.user$.value!.user_id + '');
		Object.keys(internetTariffData).forEach(key => {
			data.append(key, (internetTariffData as any)[key]);
		});
		return this.http.post<void>(
			'/api/add_internet_tariff?internet_tariff_name=' + internetTariffData.internet_tariff_name,
			data,
		);
	}

	public addTvTarriff(tvTariffData: Partial<TvTariff>, img: File): Observable<void> {
		const data = new FormData();
		data.append('file', img!);
		data.append('added_by', this.userService.user$.value!.user_id + '');
		Object.keys(tvTariffData).forEach(key => {
			data.append(key, (tvTariffData as any)[key]);
		});
		return this.http.post<void>(
			'/api/add_tv_tariff?tv_tariff_name=' + tvTariffData.tv_tariff_name,
			data,
		);
	}

	public addPackage(packageData: Partial<Package>, img: File): Observable<void> {
		const data = new FormData();
		data.append('file', img!);
		data.append('added_by', this.userService.user$.value!.user_id + '');
		Object.keys(packageData).forEach(key => {
			data.append(key, (packageData as any)[key]);
		});
		return this.http.post<void>(
			'/api/add_package?package_name=' + packageData.package_name,
			data,
		);
	}
}
