import { Knex, knex } from 'knex';
import {
	Abonent,
	InternetTariff,
	Package,
	SmartphoneTariff,
	TvTariff,
	User,
} from './types';
// import * as dotenv from 'dotenv';

// dotenv.config();
// export const dbRoot = knex({
// 	client: 'mysql2',
// 	connection: {
// 		host: process.env.DB_HOST,
// 		user: process.env.DB_USER,
// 		password: process.env.DB_PASS,
// 		database: process.env.DB_NAME,
// 	}
// });

// export const users = dbRoot<User>('users');
// export const packages = dbRoot<Package>('packages');
// export const tvTariffs = dbRoot<TvTariff>('tv_tariff');
// export const internetTariffs = dbRoot<InternetTariff>('internet_tariffs');
// export const smartphoneTariffs = dbRoot<SmartphoneTariff>('smartphone_tariffs');

export interface DBConfig {
	host: string;
	user: string;
	password: string;
	database: string;
}

// tslint:disable: typedef
export class DbService {
	public dbRoot: Knex<any, unknown[]>;
	public get users() {
		return this.dbRoot<User>('users');
	}
	public get abonents() {
		return this.dbRoot<Abonent>('abonents');
	}
	public get packages() {
		return this.dbRoot<Package>('packages');
	}
	public get tv_tariffs() {
		return this.dbRoot<TvTariff>('tv_tariffs');
	}
	public get internet_tariffs() {
		return this.dbRoot<InternetTariff>('internet_tariffs');
	}
	public get smartphone_tariffs() {
		return this.dbRoot<SmartphoneTariff>('smartphone_tariffs');
	}

	constructor(config: DBConfig) {
		this.dbRoot = knex({
			client: 'mysql2',
			connection: config,
		});
	}

	public async getAbonentsByUserId(userId: number): Promise<Abonent[]> {
		return await this.users
			.select(
				'abonent_id',
				'users.user_id',
				'abonents.smartphone_tariff_id',
				'abonents.internet_tariff_id',
				'abonents.tv_tariff_id',
				'abonents.package_id',
				'smartphone_tariff_name',
				'internet_tariff_name',
				'tv_tariff_name',
				'package_name',
				'balance',
				'left_minute_count',
				'left_gb_count',
				'left_sms_count',
				'phone_number'
			)
			.join<Abonent>('abonents', 'abonents.user_id', '=', 'users.user_id')
			.leftJoin<Package>('packages', {
				'packages.package_id': 'abonents.package_id',
			})
			.leftJoin<TvTariff>('tv_tariffs', function() {
				this.on(function() {
					this.on(
						'packages.tv_tariff_id',
						'=',
						'tv_tariffs.tv_tariff_id'
					);
					this.orOn(
						'abonents.tv_tariff_id',
						'=',
						'tv_tariffs.tv_tariff_id'
					);
				});
			})
			.leftJoin<InternetTariff>('internet_tariffs', function() {
				this.on(function() {
					this.on(
						'packages.internet_tariff_id',
						'=',
						'internet_tariffs.internet_tariff_id'
					);
					this.orOn(
						'abonents.internet_tariff_id',
						'=',
						'internet_tariffs.internet_tariff_id'
					);
				});
			})
			.leftJoin<SmartphoneTariff>('smartphone_tariffs', function() {
				this.on(function() {
					this.on(
						'packages.smartphone_tariff_id',
						'=',
						'smartphone_tariffs.smartphone_tariff_id'
					);
					this.orOn(
						'abonents.smartphone_tariff_id',
						'=',
						'smartphone_tariffs.smartphone_tariff_id'
					);
				});
			})
			.where('users.user_id', userId);
	}

	public async getAllTelephoneNumbers(): Promise<string[]> {
		return await this.abonents.select('phone_number');
	}

	public async getAllUserInfo(): Promise<(User & Abonent)[]> {
		return (await this.users.select(
			'abonents.abonent_id',
			'abonents.balance',
			'abonents.internet_tariff_id',
			'abonents.left_gb_count',
			'abonents.left_home_gb_count',
			'abonents.left_minute_count',
			'abonents.left_sms_count',
			'users.login',
			'users.mail',
			'users.name',
			'abonents.package_id',
			'users.password',
			'abonents.phone_number',
			'users.register_date',
			'users.role',
			'users.second_name',
			'abonents.smartphone_tariff_id',
			'users.surname',
			'abonents.tv_tariff_id',
			'users.user_id',
			'users.verify_code',
		).leftJoin('abonents', 'users.user_id', 'abonents.user_id'));
	}

	public async getUserByLogin(login: string): Promise<User> {
		return (await this.users.select('*').where({ login }))[0];
	}

	public async setUserRole(userId: number, role: string): Promise<number> {
		return await this.users.update({ role }).where({ user_id: userId });
	}

	public async addAbonent(abonent: Partial<Abonent>): Promise<number[]> {
		return await this.abonents.insert(abonent);
	}

	public async updateAbonent(abonent: Partial<Abonent>): Promise<number[]> {
		return await this.abonents.update(abonent).where('abonent_id', abonent.abonent_id);
	}

	public async addUser(user: Partial<User>): Promise<number[]> {
		return await this.users.insert(user);
	}

	public async updateUser(
		user: Partial<User>,
		login: string
	): Promise<number> {
		return await this.users.update(user).where({ login });
	}

	public async addSmartphoneTariff(
		smartphoneTariff: Partial<SmartphoneTariff>
	): Promise<number[]> {
		return await this.smartphone_tariffs.insert(smartphoneTariff);
	}

	public async getSmartphoneTariffs(): Promise<SmartphoneTariff[]> {
		return await this.smartphone_tariffs
			.select('*')
			.where('is_active', true);
	}

	public async getSmartphoneTariffById(
		tariffId: number
	): Promise<SmartphoneTariff> {
		return (
			await this.smartphone_tariffs
				.select('*')
				.where('smartphone_tariff_id', tariffId)
		)[0];
	}

	public async addInternetTariff(
		internetTariff: Partial<InternetTariff>
	): Promise<number[]> {
		return await this.internet_tariffs.insert(internetTariff);
	}

	public async getInternetTariffs(): Promise<InternetTariff[]> {
		return await this.internet_tariffs.select('*').where('is_active', true);
	}

	public async getInternetTariffById(
		tariffId: number
	): Promise<InternetTariff> {
		return (
			await this.internet_tariffs
				.select('*')
				.where('internet_tariff_id', tariffId)
		)[0];
	}

	public async addTvTariff(tvTariff: Partial<TvTariff>): Promise<number[]> {
		return await this.tv_tariffs.insert(tvTariff);
	}

	public async getTvTariffs(): Promise<TvTariff[]> {
		return await this.tv_tariffs.select('*').where('is_active', true);
	}

	public async getTvTariffById(tariffId: number): Promise<TvTariff> {
		return (
			await this.tv_tariffs.select('*').where('tv_tariff_id', tariffId)
		)[0];
	}

	public async addPackage(packageData: Partial<Package>): Promise<number[]> {
		return await this.packages.insert(packageData);
	}

	public async getPackageById(packageId: number): Promise<Package> {
		return (
			await this.packages
				.select('*')
				.join<TvTariff>(
					'tv_tariffs',
					'packages.tv_tariff_id',
					'tv_tariffs.tv_tariff_id'
				)
				.join<InternetTariff>(
					'internet_tariffs',
					'packages.internet_tariff_id',
					'internet_tariffs.internet_tariff_id'
				)
				.join<SmartphoneTariff>(
					'smartphone_tariffs',
					'packages.smartphone_tariff_id',
					'smartphone_tariffs.smartphone_tariff_id'
				)
				.where('package_id', packageId)
		)[0];
	}

	public async getPackages(): Promise<Package[]> {
		return await this.packages
			.select('*')
			.join<TvTariff>(
				'tv_tariffs',
				'packages.tv_tariff_id',
				'tv_tariffs.tv_tariff_id'
			)
			.join<InternetTariff>(
				'internet_tariffs',
				'packages.internet_tariff_id',
				'internet_tariffs.internet_tariff_id'
			)
			.join<SmartphoneTariff>(
				'smartphone_tariffs',
				'packages.smartphone_tariff_id',
				'smartphone_tariffs.smartphone_tariff_id'
			)
			.where('packages.is_active', true);
	}

	public async deleteSmartphoneTariffs(id: number): Promise<number> {
		return await this.smartphone_tariffs.update({ is_active: false }).where('smartphone_tariff_id', id);
	}

	public async deleteInternetTariffs(id: number): Promise<number> {
		return await this.packages.update({ is_active: false }).where('package_id', id);
	}

	public async deleteTvTariffs(id: number): Promise<number> {
		return await this.tv_tariffs.update({ is_active: false }).where('tv_tariff_id', id);
	}

	public async deletePackages(id: number): Promise<number> {
		return await this.internet_tariffs.update({ is_active: false }).where('internet_tariff_id', id);
	}

	public async deleteAbonent(id: number): Promise<number> {
		return await this.abonents.delete().where('abonent_id', id);
	}

	public async deleteUser(id: number): Promise<number> {
		await this.abonents.delete().where('user_id', id);
		return await this.users.delete().where('user_id', id);
	}
}
