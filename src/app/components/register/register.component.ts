import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PASSWORRD_REGEX } from '@app/constants';
import { UserService } from '@app/services';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.less'],
})
export class RegisterComponent {
	public error: string | null = null;
	public form: FormGroup = new FormGroup(
		{
			login: new FormControl('', [
				Validators.required,
				Validators.minLength(5),
				Validators.maxLength(20),
				Validators.pattern(/^[A-Za-z][A-Za-z\d]+$/),
				(control) => {
					if (this.existingUsers?.includes(control.value)) {
						return { userAlreadyExist: true };
					}
					return null;
				}
			]),
			mail: new FormControl('', [Validators.required, Validators.email]),
			name: new FormControl('', [
				Validators.required,
				Validators.pattern(/^[A-Za-z][a-zA-Z]+$/),
			]),
			second_name: new FormControl('', [
				Validators.required,
				Validators.pattern(/^[A-Za-z][a-zA-Z]+$/),
			]),
			surname: new FormControl('', [
				Validators.required,
				Validators.pattern(/^[A-Za-z][a-zA-Z]+$/),
			]),
			password: new FormControl('', [
				Validators.required,
				Validators.pattern(PASSWORRD_REGEX),
			]),
			confirm_password: new FormControl('', [Validators.required]),
		},
		(control) => {
			const password = control.get('password')?.value;
			const confirmPassword = control.get('confirm_password')?.value;
			if (!password || !confirmPassword) {
				return null;
			}
			return password !== confirmPassword
				? { passwordsDoNotMatch: true }
				: null;
		}
	);

	private existingUsers: string[] = [];

	constructor(
		private router: Router,
		private userService: UserService
	) {}

	public submit(): void {
		if (this.form.valid) {
			const userData = this.form.value;
			this.userService.register(userData).subscribe((response) => {
				if (!response.error && response.user && response.status === 'user.already_exist') {
					this.existingUsers.push(userData.login);
					this.form.controls.login.updateValueAndValidity();
				} else if (response.status === 'user.created') {
					this.error = null;
					this.router.navigateByUrl('/account');
				}
			});
		}
	}

	public navigateToLogin(): void {
		this.router.navigateByUrl('/login');
	}
}
