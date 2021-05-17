export interface Package {
	package_name: string;
	package_id: number;
	month_pay: number;
	description: string;
	smartphone_tariff_id: number;
	internet_tariff_id: number;
	tv_tariff_id: number;
	smartphone_tariff_name: string;
	internet_tariff_name: string;
	tv_tariff_name: string;
	added_by: number;
	is_active: boolean;
}
