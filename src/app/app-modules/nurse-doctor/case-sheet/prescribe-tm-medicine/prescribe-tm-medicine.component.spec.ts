import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescribeTmMedicineComponent } from './prescribe-tm-medicine.component';

describe('PrescribeTmMedicineComponent', () => {
  let component: PrescribeTmMedicineComponent;
  let fixture: ComponentFixture<PrescribeTmMedicineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrescribeTmMedicineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescribeTmMedicineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
