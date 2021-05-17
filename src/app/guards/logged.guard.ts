import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
	UrlTree,
} from '@angular/router';
import { UserService } from '@app/services';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class LoggedGuard implements CanActivate {
	constructor(
		private userService: UserService,
		private router: Router,
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		_state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return combineLatest([
			this.userService.isVerified$,
			this.userService.isAuthorized$,
		]).pipe(
			map(([isVerified, isAuthorized]) => {
				if (!isAuthorized && route.url[0].path !== 'login' && route.url[0].path !== 'register') {
					this.router.navigateByUrl('/login');
					return false;
				}
				if (!isVerified && route.url[0].path === 'account') {
					this.router.navigateByUrl('/verify', { state: { redirect: route.url[0].path } });
					return false;
				}
				if (isVerified && route.url[0].path === 'verify') {
					this.router.navigateByUrl('/account');
					return false;
				}
				if (isAuthorized && (route.url[0].path === 'login' || route.url[0].path === 'register')) {
					this.router.navigateByUrl('/account');
					return false;
				}
				return true;
			})
		);
	}
}
