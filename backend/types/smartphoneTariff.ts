export interface SmartphoneTariff {
	smartphone_tariff_name: string;
	smartphone_tariff_id: number;
	month_pay: number;
	description: string;
	included_minute_cost: number;
	included_gb_cost: number;
	included_sms_cost: number;
	over_minute_cost: number;
	over_gb_cost: number;
	over_sms_cost: number;
	included_minute_count: number;
	included_gb_count: number;
	included_sms_count: number;
	added_by: number;
	is_active: boolean;
}
