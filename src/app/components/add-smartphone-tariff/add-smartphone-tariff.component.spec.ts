import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSmartphoneTariffComponent } from './add-smartphone-tariff.component';

describe('AddTariffComponent', () => {
	let component: AddSmartphoneTariffComponent;
	let fixture: ComponentFixture<AddSmartphoneTariffComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddSmartphoneTariffComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddSmartphoneTariffComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
