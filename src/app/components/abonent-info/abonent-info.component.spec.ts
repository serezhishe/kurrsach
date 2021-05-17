import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbonentInfoComponent } from './abonent-info.component';

describe('AbonentInfoComponent', () => {
  let component: AbonentInfoComponent;
  let fixture: ComponentFixture<AbonentInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbonentInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbonentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
