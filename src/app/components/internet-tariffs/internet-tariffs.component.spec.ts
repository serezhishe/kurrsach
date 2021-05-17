import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternetTariffsComponent } from './internet-tariffs.component';

describe('InternetTariffsComponent', () => {
  let component: InternetTariffsComponent;
  let fixture: ComponentFixture<InternetTariffsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InternetTariffsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InternetTariffsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
