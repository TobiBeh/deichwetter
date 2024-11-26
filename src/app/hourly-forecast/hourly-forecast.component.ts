import { Component, OnInit, OnDestroy, HostListener, Renderer2 } from '@angular/core';
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
export class HourlyForecastComponent implements OnInit, OnDestroy {
  private chart: ApexCharts | null = null;
  private visibleRange = 24 * 60 * 60 * 1000; // 24 Stunden in Millisekunden
  private scrollFactor = 2 * 60 * 60 * 1000; // 2 Stunden pro Scroll-Einheit
  private allTimes: number[] = [];
  private temperatures: number[] = [];
  private xMin: number = 0;
  private xMax: number = 0;
  private isMouseOverChart: boolean = false; // Zustand des Mauszeigers

  constructor(private weatherService: WeatherService, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.weatherService.getLocation().subscribe((location) => {
      if (location) {
        this.loadHourlyWeather(location.latitude, location.longitude);
      }
    });
  }

  loadHourlyWeather(lat: string, lon: string): void {
    this.weatherService.getHourlyWeather(lat, lon).subscribe((data: any) => {
      this.allTimes = data.hourly.time.map((time: string) => new Date(time).getTime());
      this.temperatures = data.hourly.temperature_2m;
  
      const now = this.allTimes[0]; // Beginne bei den frühesten Daten
      this.xMin = now;
      this.xMax = now + this.visibleRange;
  
      // Annotationen für jeden zweiten Tag erstellen
      const annotations = [];
      for (let i = 0; i < this.allTimes.length; i++) {
        const dayStart = new Date(this.allTimes[i]).setHours(0, 0, 0, 0); // Tagesanfang
        const dayEnd = dayStart + 24 * 60 * 60 * 1000; // Tagesende
  
        // Nur jeden zweiten Tag markieren
        if ((i / 24) % 2 === 1) {
          annotations.push({
            x: dayStart,
            x2: dayEnd,
            fillColor: 'rgba(0, 0, 0, 0.25)', // Leicht graue Hintergrundfarbe
          });
        }
      }
  
      const options = {
        chart: {
          type: 'line',
          height: 350,
          animations: {
            enabled: true,
            easing: 'linear',
            dynamicAnimation: {
              speed: 300,
            },
          },
          zoom: {
            enabled: false, // Zoom deaktivieren
          },
          toolbar: {
            tools: {
              pan: false, // Kein manuelles Panning
              zoom: false, // Kein Zoom
            },
          },
        },
        series: [
          {
            name: 'Temperature (°C)',
            data: this.allTimes.map((time, index) => [time, this.temperatures[index]]),
          },
        ],
        xaxis: {
          type: 'datetime',
          min: this.xMin,
          max: this.xMax,
          labels: {
            format: 'HH:mm',
          },
          title: {
            text: 'Time',
          },
        },
        yaxis: {
          title: {
            text: 'Temperature (°C)',
          },
        },
        stroke: {
          curve: 'smooth',
        },
        tooltip: {
          x: {
            format: 'dd MMM HH:mm',
          },
        },
        annotations: {
          xaxis: annotations, // Annotationen für jeden zweiten Tag
        },
      };
  
      // Existierenden Chart löschen und neuen erstellen
      if (this.chart) {
        this.chart.destroy();
      }
  
      const chartElement = document.querySelector('#chart');
      if (chartElement) {
        this.chart = new ApexCharts(chartElement, options);
        this.chart.render();
      }
    });
  }
  

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent): void {
    if (!this.isMouseOverChart) return; // Nur handeln, wenn Maus über Diagramm

    event.preventDefault(); // Standard-Scrolling deaktivieren
    const delta = event.deltaY < 0 ? -this.scrollFactor : this.scrollFactor;

    this.xMin += delta;
    this.xMax += delta;

    // Grenzen für die X-Achse prüfen
    if (this.xMin < this.allTimes[0]) {
      this.xMin = this.allTimes[0];
      this.xMax = this.xMin + this.visibleRange;
    }
    if (this.xMax > this.allTimes[this.allTimes.length - 1]) {
      this.xMax = this.allTimes[this.allTimes.length - 1];
      this.xMin = this.xMax - this.visibleRange;
    }

    // Chart-Optionen aktualisieren
    if (this.chart) {
      this.chart.updateOptions(
        {
          xaxis: {
            min: this.xMin,
            max: this.xMax,
          },
        },
        false, // Redraw
        true   // Animate
      );
    }
    
  }

  // Maus betritt das Diagramm
  onMouseEnter(): void {
    this.isMouseOverChart = true;
  }

  // Maus verlässt das Diagramm
  onMouseLeave(): void {
    this.isMouseOverChart = false;
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
