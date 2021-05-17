import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '@app/services';
import { Nullable } from '@app/types/common';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.less'],
})
export class LoginComponent implements OnInit{
	@Output() public loginSubmit = new EventEmitter<{ username: string, password: string }>();

	public error: Nullable<string> = null;
	public form: FormGroup = new FormGroup({
		login: new FormControl('', [Validators.required]),
		password: new FormControl('', [Validators.required]),
	});

	constructor(
		private userService: UserService,
		private router: Router,
	) {}

	public ngOnInit(): void {
		this.form.valueChanges.subscribe(() => {
			this.error = null;
		});
	}

	public submit(): void {
		if (this.form.valid) {
			this.userService.login(this.form.value).subscribe(response => {
				if (!response.error && response.user) {
					this.router.navigateByUrl('/account');
				} else {
					switch (response.status) {
						case 'password.not_matched':
							this.error = 'Password is wrong';
							break;
						case 'user.not_exist':
							this.error = 'User does not exist';
							break;
						default:
							break;
					}
				}
			});
		}
	}

	public navigateToRegister(): void {
		this.router.navigateByUrl('/register');
	}
}
