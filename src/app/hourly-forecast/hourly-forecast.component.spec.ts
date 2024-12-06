import { TestBed } from '@angular/core/testing';
import { HourlyForecastComponent } from './hourly-forecast.component';
import { WeatherService } from '../services/weather.service';
import { ChartService } from '../services/chart.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('HourlyForecastComponent', () => {
  let component: HourlyForecastComponent;

  beforeEach(async () => {
    // Mock WeatherService
    const weatherServiceMock = {
      getLocation: () => of(null),
      getHourlyWeather: () => of({ hourly: { time: [], temperature_2m: [], precipitation_probability: [] } })
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [HourlyForecastComponent],
      providers: [
        { provide: WeatherService, useValue: weatherServiceMock },
        ChartService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(HourlyForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
