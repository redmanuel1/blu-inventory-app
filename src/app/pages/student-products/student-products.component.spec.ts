import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentProductsComponent } from './student-products.component';

describe('StudentProductsComponent', () => {
  let component: StudentProductsComponent;
  let fixture: ComponentFixture<StudentProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentProductsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
