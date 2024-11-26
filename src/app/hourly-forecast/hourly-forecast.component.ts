import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import ApexCharts from 'apexcharts';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-hourly-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hourly-forecast.component.html',
  styleUrls: ['./hourly-forecast.component.css'],
})
export class HourlyForecastComponent implements OnInit {
  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    // Beobachte Standortänderungen und lade die stündlichen Wetterdaten
    this.weatherService.getLocation().subscribe((location) => {
      if (location) {
        this.loadHourlyWeather(location.latitude, location.longitude);
      }
    });
  }

  loadHourlyWeather(lat: string, lon: string): void {
    this.weatherService.getHourlyWeather(lat, lon).subscribe((data) => {
      const temperatures = data.hourly.temperature_2m;
      const hours = data.hourly.time;

      const options = {
        chart: {
          type: 'line',
          height: 350,
        },
        series: [
          {
            name: 'Temperature (°C)',
            data: temperatures,
          },
        ],
        xaxis: {
          categories: hours,
        },
        title: {
          text: 'Hourly Weather Forecast',
        },
        yaxis: {
          title: {
            text: 'Temperature (°C)',
          },
        },
      };

      // Entferne alte Charts und rendere einen neuen
      const existingChart = document.querySelector('#chart') as HTMLElement;
      if (existingChart) {
        existingChart.innerHTML = ''; // Leere den Container
      }

      const chart = new ApexCharts(document.querySelector('#chart'), options);
      chart.render();
    });
  }
}
