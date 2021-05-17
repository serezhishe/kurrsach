import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from '@app/services';
import { JsonService } from '@app/services/json/json.service';
import { Abonent } from '@app/types';
import { EditAbonentComponent } from '../edit-abonent/edit-abonent.component';

@Component({
  selector: 'app-abonent-info',
  templateUrl: './abonent-info.component.html',
  styleUrls: ['./abonent-info.component.less']
})
export class AbonentInfoComponent {
	constructor(
		private userService: UserService,
		private router: Router,
		private http: HttpClient,
		public dialog: MatDialog,
		private jsonService: JsonService,
	) {}

	public abonents$ = this.userService.getAbonentsById();

	public addAbonent(): void {
		this.router.navigateByUrl('addAbonent');
	}

	public deleteAbonent(id: number): void {
		this.http.delete('/api/abonents?id=' + id).subscribe(() => {
			this.abonents$ = this.userService.getAbonentsById();
		});
	}

	public onEdit(abonentData: Abonent): void {
		const dialogRef = this.dialog.open(EditAbonentComponent, {
			width: '500px',
			data: abonentData,
			disableClose: true,
		});

		dialogRef.afterClosed().subscribe(() => {
			this.abonents$ = this.userService.getAbonentsById();
		});
	}

	public export(abonent: Abonent): void {
		const fullName = `${this.userService.user$.value!.surname} ${this.userService.user$.value!.name} ${this.userService.user$.value!.second_name}`;
		this.jsonService.saveFile(abonent, `${fullName}.json`);
	}
}
