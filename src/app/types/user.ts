import { Nullable } from './common';

export type User = {
	user_id: number;
	name: string;
	surname: string;
	second_name: string;
	login: string;
	mail: string;
	register_date: Date;
	role: Nullable<string>;
	password: string;
	is_verified: boolean;
};

export type UserToUpdate = {
	name: string;
	surname: string;
	second_name: string;
	login: string;
	mail: string;
	old_password: string;
	new_password: string;
};

export type UserResponse = {
	error: Nullable<string>;
	user: Nullable<User>;
	status: string;
	token?: Nullable<string>;
	refreshToken?: Nullable<string>;
};

export type RefreshTokenResponse = {
	token?: Nullable<string>;
	refreshToken?: Nullable<string>;
};
