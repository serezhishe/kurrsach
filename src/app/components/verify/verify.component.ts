import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@app/services';
import { Nullable } from '@app/types/common';
import { map } from 'rxjs/operators';

@Component({
	selector: 'app-verify',
	templateUrl: './verify.component.html',
	styleUrls: ['./verify.component.less'],
})
export class VerifyComponent {
	public error: Nullable<string> = null;
	public code = '';
	public email$ = this.userService.user$.pipe(
		map(user => user?.mail),
	);
	public shouldShowHint = false;

	constructor(
		private userService: UserService,
		private router: Router,
	) {}

	public setCode(code: string): void {
		this.code = code;
	}

	public verify(): void {
		this.shouldShowHint = false;
		this.userService.verify(this.code).subscribe(isVerified => {
			const { redirect } = window.history.state;
			if (isVerified) {
				this.router.navigateByUrl(`/${redirect || 'account'}`);
			} else {
				this.error = 'Verify code is wrong';
			}
		});
	}

	public sendAnotherCode(): void {
		this.userService.sendAnotherCode().subscribe(() => {
			this.code = '';
			this.error = null;
			this.shouldShowHint = true;
		});
	}
}
