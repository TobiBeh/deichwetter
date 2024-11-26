import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { CurrentWeatherComponent } from './current-weather/current-weather.component';
import { HourlyForecastComponent } from './hourly-forecast/hourly-forecast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    CurrentWeatherComponent,
    HourlyForecastComponent,
  ],
  template: `
    <app-header></app-header>
    <div class="p-4 space-y-4">
      <app-current-weather></app-current-weather>
      <app-hourly-forecast></app-hourly-forecast>
    </div>
  `,
})
export class AppComponent {}
