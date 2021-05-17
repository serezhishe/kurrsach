export interface InternetTariff {
	internet_tariff_name: string;
	internet_tariff_id: number;
	month_pay: number;
	description: string;
	included_home_gb_cost: number;
	over_home_gb_cost: number;
	included_home_gb_count: number;
	added_by: number;
	max_speed: number;
	is_active: boolean;
}
