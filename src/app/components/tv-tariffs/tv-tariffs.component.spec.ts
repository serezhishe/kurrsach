import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvTariffsComponent } from './tv-tariffs.component';

describe('TvTariffsComponent', () => {
  let component: TvTariffsComponent;
  let fixture: ComponentFixture<TvTariffsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TvTariffsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TvTariffsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
