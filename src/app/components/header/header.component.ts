import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '@app/services';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.less'],
})
export class HeaderComponent {
	public isLoginShown$: Observable<boolean> = combineLatest([
		this.router.events.pipe(
			filter((event) => event instanceof NavigationEnd),
			map((event) => {
				const url = (event as NavigationEnd).urlAfterRedirects;
				return (
					url.includes('login') ||
					url.includes('register') ||
					url.includes('verify')
				);
			})
		),
		this.userService.isAuthorized$,
	]).pipe(map(([isLoginRoute, isAuthed]) => !isLoginRoute && !isAuthed));

	public isAuth$: Observable<boolean> = this.userService.isAuthorized$;
	public isAdmin$: Observable<boolean> = this.userService.isAdmin$;

	constructor(
		private router: Router,
		private userService: UserService,
	) {}

	public navigateToLogin(): void {
		this.router.navigateByUrl('/login');
	}

	public navigateToMain(): void {
		this.router.navigateByUrl('/main');
	}

	public navigateToAccount(): void {
		this.router.navigateByUrl('/account');
	}

	public navigateToAllUsers(): void {
		this.router.navigateByUrl('/allUsers');
	}

	public logout(): void {
		this.userService.logout();
		this.router.navigateByUrl('/login');
	}
}
