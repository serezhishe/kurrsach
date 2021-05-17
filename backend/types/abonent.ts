import { Nullable } from './common';

export interface Abonent {
	abonent_id: number;
	user_id: number;
	smartphone_tariff_id: Nullable<number>;
	internet_tariff_id: Nullable<number>;
	tv_tariff_id: Nullable<number>;
	package_id: Nullable<number>;
	balance: number;
	left_minute_count: number;
	left_gb_count: number;
	left_home_gb_count: number;
	left_sms_count: number;
	phone_number: string;
}
