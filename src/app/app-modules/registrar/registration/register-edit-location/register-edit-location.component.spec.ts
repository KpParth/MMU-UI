import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterEditLocationComponent } from './register-edit-location.component';

describe('RegisterEditLocationComponent', () => {
  let component: RegisterEditLocationComponent;
  let fixture: ComponentFixture<RegisterEditLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterEditLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterEditLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
