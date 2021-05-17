import { Injectable } from '@angular/core';
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor,
	HttpResponse,
	HttpClient,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService, UserService } from '@app/services';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { RefreshTokenResponse, UserResponse } from '@app/types';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
	constructor(
		private storage: StorageService,
		private http: HttpClient,
	) {}

	intercept(
		request: HttpRequest<unknown>,
		next: HttpHandler
	): Observable<HttpEvent<unknown>> {
		const token = this.storage.getItem<string>('token');
		if (token) {
			request = request.clone({
				setHeaders: {
					Authorization: token!,
				}
			});
		}
		return next.handle(request).pipe(
			tap((evt) => {
				if (evt instanceof HttpResponse) {
					const body = evt.body as UserResponse;
					if (!body.error && body.token) {
						this.storage.setItem('token', body.token);
						this.storage.setItem('refreshToken', body.refreshToken);
					}
				}
			}),
			catchError((err) => {
				if (err.status === 401 && err.error === 'invalid token.') {
					const refreshToken = this.storage.getItem<string>(
						'refreshToken'
					);
					return this.http
						.post<RefreshTokenResponse>('/api/refreshToken', {
							refreshToken,
						})
						.pipe(
							switchMap((response) => {
								return next.handle(
									request.clone({
										setHeaders: {
											Authorization: response.token!,
										},
									})
								);
							})
						);
				}
				throw Error(err.error);
			})
		);
	}
}
