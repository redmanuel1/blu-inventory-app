import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorytransactionComponent } from './inventorytransaction.component';

describe('InventorytransactionComponent', () => {
  let component: InventorytransactionComponent;
  let fixture: ComponentFixture<InventorytransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventorytransactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventorytransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
