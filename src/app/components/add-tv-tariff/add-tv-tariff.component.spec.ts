import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTvTariffComponent } from './add-tv-tariff.component';

describe('AddTvTariffComponent', () => {
  let component: AddTvTariffComponent;
  let fixture: ComponentFixture<AddTvTariffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTvTariffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTvTariffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
