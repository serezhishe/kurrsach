import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAbonentComponent } from './edit-abonent.component';

describe('EditAbonentComponent', () => {
  let component: EditAbonentComponent;
  let fixture: ComponentFixture<EditAbonentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditAbonentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAbonentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
