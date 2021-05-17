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
export class RoleGuardGuard implements CanActivate {
	constructor(private userService: UserService, private router: Router) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		_state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return combineLatest([
			this.userService.canAddTariffs$,
			this.userService.isAdmin$,
		]).pipe(
			map(([canAddTariffs, isAdmin]) => {
				if (!canAddTariffs) {
					this.router.navigateByUrl('/main');
					return false;
				}

				if (!isAdmin && route.url[0].path === 'allUsers') {
					this.router.navigateByUrl('/main');
					return false;
				}

				return true;
			})
		);
	}
}
