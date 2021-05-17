import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from '@app/services';
import { Nullable } from '@app/types';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.less']
})
export class AllUsersComponent {
	@ViewChild(MatSort, { static: true }) sort!: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

	public displayedColumns: string[] = [
		'name',
		'user_id',
		'login',
		'mail',
		'register_date',
		'role',
		'abonent_id',
		'phone_number',
		'balance',
		'internet_tariff_id',
		'smartphone_tariff_id',
		'tv_tariff_id',
		'package_id',
		'left_gb_count',
		'left_home_gb_count',
		'left_minute_count',
		'left_sms_count',
		'actions',
	];
	public dataSource = this.http.get<any>('/api/all_users').pipe(
		map((response: any) => {
			const usersData = response.users.map((user: any) => ({
				...user,
				register_date: new Date(user.register_date).toDateString(),
			}));
			const tableDataSource = new MatTableDataSource(usersData);
			tableDataSource.sort = this.sort;
			tableDataSource.paginator = this.paginator;
			return tableDataSource;
		}),
	);


	constructor(
		private http: HttpClient,
		private userService: UserService,
	) {}

	public setRole(role: Nullable<string>, userId: number): void {
		if (role === 'null') {
			role = null;
		}
		this.userService.setRole(userId, role).subscribe(() => {
			this.dataSource = this.http.get<any>('/api/all_users').pipe(
				map((response: any) => {
					const usersData = response.users.map((user: any) => ({
						...user,
						register_date: new Date(user.register_date).toDateString(),
					}));
					const tableDataSource = new MatTableDataSource(usersData);
					tableDataSource.sort = this.sort;
					tableDataSource.paginator = this.paginator;
					return tableDataSource;
				}),
			);
		});
	}

	public deleteAbonent(abonentId: number): void {
		this.http.delete('/api/abonents?id=' + abonentId).subscribe(() => {
			this.dataSource = this.http.get<any>('/api/all_users').pipe(
				map((response: any) => {
					const usersData = response.users.map((user: any) => ({
						...user,
						register_date: new Date(user.register_date).toDateString(),
					}));
					const tableDataSource = new MatTableDataSource(usersData);
					tableDataSource.sort = this.sort;
					tableDataSource.paginator = this.paginator;
					return tableDataSource;
				}),
			);
		});
	}

	public deleteUser(userId: number): void {
		this.http.delete('/api/users?id=' + userId).subscribe(() => {
			this.dataSource = this.http.get<any>('/api/all_users').pipe(
				map((response: any) => {
					const usersData = response.users.map((user: any) => ({
						...user,
						register_date: new Date(user.register_date).toDateString(),
					}));
					const tableDataSource = new MatTableDataSource(usersData);
					tableDataSource.sort = this.sort;
					tableDataSource.paginator = this.paginator;
					return tableDataSource;
				}),
			);
		});
	}
}
