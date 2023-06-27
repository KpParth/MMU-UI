import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NurseWorklistTabsComponent } from './nurse-worklist-tabs.component';

describe('NurseWorklistTabsComponent', () => {
  let component: NurseWorklistTabsComponent;
  let fixture: ComponentFixture<NurseWorklistTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NurseWorklistTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NurseWorklistTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
