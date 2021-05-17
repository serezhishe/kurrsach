import jwt = require('express-jwt');
import * as JWT from 'jsonwebtoken';
import { Request } from 'express';
import { User, Nullable } from './types';

export class JWTService {
	public isAuthorizedMiddleware;
	private secretKey: string;
	private tokenExpiration: string | number = '40m';
	private refreshTokenExpiration: string | number = '2d';

	constructor(secret: string) {
		this.secretKey = secret;

		this.isAuthorizedMiddleware = jwt({
			secret,
			algorithms: ['HS512'],
			userProperty: 'token',
			getToken: this.getTokenFromHeader,
		}).unless({
			path: [
				'/',
				/.js/,
				/images/,
				'/api/login',
				'/api/create_user',
				'/api/refreshToken',
				'/api/verify',
				'/api/smartphone_tariffs',
				'/api/internet_tariffs',
				'/api/tv_tariffs',
				'/api/packages',
			],
		});
	}

	public generateToken(user: Omit<User, 'password'>): string {
		const data = {
			login: user.login,
			user_id: user.user_id,
			role: user.role,
		};

		return JWT.sign({ data }, this.secretKey, {
			expiresIn: this.tokenExpiration,
			algorithm: 'HS512',
		});
	}

	public generateRefreshToken(user: Omit<User, 'password'>): string {
		const data = {
			login: user.login,
			user_id: user.user_id,
		};
		return JWT.sign({ data }, this.secretKey, {
			expiresIn: this.refreshTokenExpiration,
			algorithm: 'HS512',
		});
	}

	private getTokenFromHeader = (req: Request): Nullable<string> => {
		return req.headers.authorization;
	}

	public verify(token: string): string | object {
		return JWT.verify(token, this.secretKey, {});
	}
}
