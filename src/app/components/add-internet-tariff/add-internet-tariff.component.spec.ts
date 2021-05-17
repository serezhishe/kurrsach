import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInternetTariffComponent } from './add-internet-tariff.component';

describe('AddInternetTariffComponent', () => {
  let component: AddInternetTariffComponent;
  let fixture: ComponentFixture<AddInternetTariffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddInternetTariffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInternetTariffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
