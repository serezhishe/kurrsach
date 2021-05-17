import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PASSWORRD_REGEX } from '@app/constants';
import { UserService } from '@app/services';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.less']
})
export class UserInfoComponent implements OnInit {
	public error: string | null = null;
	public form: FormGroup = new FormGroup(
		{
			login: new FormControl('', [
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
			mail: new FormControl('', [Validators.email]),
			name: new FormControl('', [
				Validators.pattern(/^[A-Za-z][a-zA-Z]+$/),
			]),
			second_name: new FormControl('', [
				Validators.pattern(/^[A-Za-z][a-zA-Z]+$/),
			]),
			surname: new FormControl('', [
				Validators.pattern(/^[A-Za-z][a-zA-Z]+$/),
			]),
			old_password: new FormControl('', [Validators.required]),
			new_password: new FormControl('', [
				Validators.pattern(PASSWORRD_REGEX),
			]),
			confirm_password: new FormControl(''),
		},
		(control) => {
			const newPassword = control.get('new_password')?.value;
			const confirmPassword = control.get('confirm_password')?.value;
			if (!newPassword || !confirmPassword) {
				return null;
			}
			return newPassword !== confirmPassword
				? { passwordsDoNotMatch: true }
				: null;
		}
	);

	private existingUsers: string[] = [];

	constructor(
		private userService: UserService
	) {}

	public ngOnInit(): void {
		this.userService.user$.subscribe(user => {
			if (user) {
				this.form.setValue({
					login: user.login,
					mail: user.mail,
					name: user.name,
					second_name: user.second_name,
					surname: user.surname,
					old_password: '',
					new_password: '',
					confirm_password: '',
				});
			}
		});
	}

	public submit(): void {
		if (this.form.valid) {
			const userData = this.form.value;
			this.userService.updateUser(userData).subscribe((response) => {
				if (!response.error && response.status === 'user.already_exist') {
					this.existingUsers.push(userData.login);
					this.form.controls.login.updateValueAndValidity();
				} else if (response.status === 'user.updated') {
					this.form.setErrors(null);
					this.form.controls.old_password.reset();
					this.form.controls.old_password.setErrors(null);
					this.form.controls.new_password.reset();
					this.form.controls.new_password.setErrors(null);
					this.form.controls.confirm_password.reset();
					this.form.controls.confirm_password.setErrors(null);
				} else if (response.status === 'password.not_matched') {
					this.form.controls.old_password.setErrors({ wrongPassword: true });
				}
			});
		}
	}
}
