import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepFileComponent } from './prep-file.component';

describe('PrepFileComponent', () => {
  let component: PrepFileComponent;
  let fixture: ComponentFixture<PrepFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrepFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrepFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
