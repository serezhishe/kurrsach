import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartphoneTariffsComponent } from './smartphone-tariffs.component';

describe('SmartphoneTariffsComponent', () => {
  let component: SmartphoneTariffsComponent;
  let fixture: ComponentFixture<SmartphoneTariffsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartphoneTariffsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartphoneTariffsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
