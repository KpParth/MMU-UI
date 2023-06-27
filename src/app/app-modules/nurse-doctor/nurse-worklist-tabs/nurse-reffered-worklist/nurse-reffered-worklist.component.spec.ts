import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NurseRefferedWorklistComponent } from './nurse-reffered-worklist.component';

describe('NurseRefferedWorklistComponent', () => {
  let component: NurseRefferedWorklistComponent;
  let fixture: ComponentFixture<NurseRefferedWorklistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NurseRefferedWorklistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NurseRefferedWorklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
