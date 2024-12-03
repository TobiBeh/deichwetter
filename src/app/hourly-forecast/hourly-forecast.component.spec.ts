import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../services/weather.service';
import { ChartService } from '../services/chart.service';
import ApexCharts from 'apexcharts';

@Component({
    selector: 'app-hourly-forecast',
    imports: [CommonModule],
    templateUrl: './hourly-forecast.component.html',
    styleUrls: ['./hourly-forecast.component.css']
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

  constructor(
    private weatherService: WeatherService,
    private chartService: ChartService
  ) { }

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

      const now = new Date().getTime(); // Aktueller Zeitstempel in lokaler Zeit
      const firstDataPoint = this.allTimes[0]; // Erster Zeitstempel aus den Daten

      // Setze xMin auf den aktuellen Zeitpunkt oder den ersten Datenpunkt, je nachdem, welcher später ist
      this.xMin = Math.max(now, firstDataPoint);
      this.xMax = this.xMin + this.visibleRange;

      // Existierenden Chart löschen und neuen erstellen
      if (this.chart) {
        this.chart.destroy();
      }

      const chartElement = document.querySelector('#chart') as HTMLElement;
      if (chartElement) {
        this.chart = this.chartService.createChart(chartElement, this.allTimes, this.temperatures, this.xMin, this.xMax);
        this.chart.render(); // Ensure the chart is rendered
      }
    });
  }

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent): void {
    if (!this.isMouseOverChart) return; // Nur handeln, wenn Maus über Diagramm

    event.preventDefault(); // Standard-Scrolling deaktivieren

    // Dynamische Anpassung des Deltas für flüssigeres Scrollen
    const baseDelta = this.scrollFactor;
    const deltaMultiplier = event.deltaY > 100 ? 1.5 : event.deltaY < 10 ? 0.5 : 1; // Einfache Multiplikation basierend auf Geschwindigkeit
    const delta = (event.deltaY < 0 ? -baseDelta : baseDelta) * deltaMultiplier;

    this.updateChartRange(delta);
  }

  updateChartRange(delta: number): void {
    const now = new Date().getTime(); // Aktueller lokaler Zeitpunkt

    this.xMin += delta;
    this.xMax += delta;

    // Grenzen prüfen und stoppen, wenn die Daten ausgehen oder der aktuelle Zeitpunkt unterschritten wird
    if (this.xMin < Math.max(this.allTimes[0], now)) {
      this.xMin = Math.max(this.allTimes[0], now);
      this.xMax = this.xMin + this.visibleRange;
    }
    if (this.xMax > this.allTimes[this.allTimes.length - 1]) {
      this.xMax = this.allTimes[this.allTimes.length - 1];
      this.xMin = this.xMax - this.visibleRange;
    }

    // Chart sofort aktualisieren
    if (this.chart) {
      this.chart.updateOptions({
        xaxis: {
          min: this.xMin,
          max: this.xMax,
        },
      });
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