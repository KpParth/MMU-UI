import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvisionalSearchComponent } from './provisional-search.component';

describe('ProvisionalSearchComponent', () => {
  let component: ProvisionalSearchComponent;
  let fixture: ComponentFixture<ProvisionalSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvisionalSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvisionalSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
