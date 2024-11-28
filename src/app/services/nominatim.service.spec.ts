import { TestBed } from '@angular/core/testing';
import { NominatimService } from './nominatim.service';
import { HttpClientModule } from '@angular/common/http';

describe('NominatimService', () => {
  let service: NominatimService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(NominatimService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});