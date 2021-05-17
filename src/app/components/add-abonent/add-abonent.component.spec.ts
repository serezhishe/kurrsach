import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAbonentComponent } from './add-abonent.component';

describe('AddAbonentComponent', () => {
  let component: AddAbonentComponent;
  let fixture: ComponentFixture<AddAbonentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAbonentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAbonentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
