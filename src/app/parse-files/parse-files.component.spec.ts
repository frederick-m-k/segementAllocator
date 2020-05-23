import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParseFilesComponent } from './parse-files.component';

describe('ParseFilesComponent', () => {
  let component: ParseFilesComponent;
  let fixture: ComponentFixture<ParseFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParseFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParseFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
