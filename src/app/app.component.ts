import { Component } from '@angular/core';
import { CurrentWeatherComponent } from './current-weather/current-weather.component';
import { HeaderComponent } from './header/header.component';
import { HourlyForecastComponent } from './hourly-forecast/hourly-forecast.component';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CurrentWeatherComponent, HeaderComponent, HourlyForecastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'deichwetter';
}
