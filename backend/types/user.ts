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
	verify_code: Nullable<string>;
};
