import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetaListEasyComponent } from './beta-list-easy.component';

describe('BetaListEasyComponent', () => {
  let component: BetaListEasyComponent;
  let fixture: ComponentFixture<BetaListEasyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BetaListEasyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BetaListEasyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
