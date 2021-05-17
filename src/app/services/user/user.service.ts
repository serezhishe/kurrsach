import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Abonent, User, UserResponse, UserToUpdate } from '@app/types';
import { Nullable } from '@app/types/common';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, pluck, tap } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	public user$ = new BehaviorSubject<Nullable<User>>(this.storage.getItem('user'));
	public isAuthorized$ = this.user$.pipe(map(user => !!user));
	public isVerified$ = this.user$.pipe(map(user => !!user?.is_verified));
	public canAddTariffs$ = this.user$.pipe(map(user => !!user?.role));
	public isAdmin$ = this.user$.pipe(map(user => user?.role === 'admin'));

	private storageSubscription: Subscription;

	constructor(
		private storage: StorageService,
		private http: HttpClient,
	) {
		this.storageSubscription = this.storage.subscribeOnValue<User>('user').subscribe(user => this.user$.next(user));
	}

	public login(loginData: { login: string, password: string }): Observable<UserResponse> {
		return this.http.post<UserResponse>('/api/login', loginData).pipe(
			tap(response => {
				if (!response.error && response.user) {
					this.storage.setItem('user', response.user);
					this.user$.next(response.user);
				}
			}),
		);
	}

	public register(userData: Partial<User>): Observable<UserResponse> {
		return this.http.post<UserResponse>('/api/create_user', userData).pipe(
			tap(response => {
				if (!response.error && response.user && response.status === 'user.created') {
					this.storage.setItem('user', response.user);
					this.user$.next(response.user);
				}
			}),
		);
	}

	public updateUser(userData: Partial<UserToUpdate>): Observable<UserResponse> {
		return this.http.patch<UserResponse>('/api/update_user', userData).pipe(
			tap(response => {
				if (!response.error && response.user && response.status === 'user.updated') {
					this.storage.setItem('user', response.user);
					this.user$.next(response.user);
				}
			}),
		);
	}

	public logout(): void {
		this.user$.next(null);
		this.storageSubscription.unsubscribe();
		this.storage.removeItem('user');
		this.storage.removeItem('refreshToken');
		this.storage.removeItem('token');
	}

	public verify(verifyCode: string): Observable<boolean> {
		return this.http.post<{ status: string; error: Nullable<string> }>('/api/verify', {
			verify_code: verifyCode,
			login: this.user$.value?.login,
		}).pipe(
			map(resp => {
				if (!resp.error && resp.status === 'code.verified') {
					this.storage.setItem('user', {
						...this.user$.value!,
						is_verified: true,
					});
					this.user$.next({
						...this.user$.value!,
						is_verified: true,
					});
					return true;
				}
				return false;
			})
		);
	}

	public sendAnotherCode(): Observable<void> {
		return this.http.post<void>('/api/reverify', this.user$.value);
	}

	public getAbonentsById(): Observable<Abonent[]> {
		return this.http.post<{ abonents: Abonent[] }>('/api/abonentsByUser', { user_id: this.user$.value?.user_id }).pipe(
			pluck('abonents'),
		);
	}

	public addAbonent(abonent: Partial<Abonent>): Observable<void> {
		return this.http.post<void>('/api/add_abonent', { ...abonent, user_id: this.user$.value?.user_id });
	}

	public editAbonent(abonent: Partial<Abonent>): Observable<void> {
		return this.http.patch<void>('/api/edit_abonent', { ...abonent, user_id: this.user$.value?.user_id });
	}

	public setRole(userId: number, role: Nullable<string>): Observable<void> {
		return this.http.patch<void>('/api/add_role', { user_id: userId, role });
	}
}
