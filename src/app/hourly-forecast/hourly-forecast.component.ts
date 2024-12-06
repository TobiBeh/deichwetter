import { Component, OnInit, OnDestroy, HostListener, ViewChildren, QueryList, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../services/weather.service';
import { ChartService, ChartConfig } from '../services/chart.service';
import ApexCharts from 'apexcharts';

@Component({
  selector: 'app-hourly-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hourly-forecast.component.html',
  styleUrls: ['./hourly-forecast.component.css']
})
export class HourlyForecastComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartContainerWrapper', { static: true }) chartContainerWrapper!: ElementRef;
  @ViewChildren('chartContainer') chartContainers!: QueryList<ElementRef>;

  chartConfigs: ChartConfig[] = [];
  charts: ApexCharts[] = [];

  private visibleRange = 24 * 60 * 60 * 1000; // 24h
  private scrollFactor = 2 * 60 * 60 * 1000;
  private allTimes: number[] = [];
  private temperatures: number[] = [];
  private precipitationProbabilities: number[] = [];
  private xMin: number = 0;
  private xMax: number = 0;
  private isMouseOverChart: boolean = false;

  constructor(
    private weatherService: WeatherService,
    private chartService: ChartService
  ) {}

  ngOnInit(): void {
    this.weatherService.getLocation().subscribe((location) => {
      if (location) {
        this.loadHourlyWeather(location.latitude, location.longitude);
      }
    });
  }

  ngAfterViewInit(): void {
    // Hier ist der View initialisiert, aber wir laden erst die Daten, dann erstellen wir die Charts
  }

  loadHourlyWeather(lat: string, lon: string): void {
    this.weatherService.getHourlyWeather(lat, lon).subscribe((data: any) => {
      this.allTimes = data.hourly.time.map((time: string) => new Date(time).getTime());
      this.temperatures = data.hourly.temperature_2m;
      this.precipitationProbabilities = data.hourly.precipitation_probability;

      const now = new Date().getTime();
      const firstDataPoint = this.allTimes[0];

      this.xMin = Math.max(now, firstDataPoint);
      this.xMax = this.xMin + this.visibleRange;

      this.destroyCharts();

      // Beispiel: 2 Charts (Temperatur & Niederschlag)
      this.chartConfigs = [
        {
          id: 'tempChart',
          type: 'line',
          seriesNameKey: 'chart.temperature',
          yaxisTitleKey: 'chart.temperature_yaxis',
          color: '#40E0D0',
          data: this.allTimes.map((time, i) => [time, this.temperatures[i]]),
          gradient: true
        },
        {
          id: 'precipChart',
          type: 'area',
          seriesNameKey: 'chart.precipitation',
          yaxisTitleKey: 'chart.precipitation_yaxis',
          color: '#76a5af',
          data: this.allTimes.map((time, i) => [time, this.precipitationProbabilities[i]]),
          gradient: false,
          yaxis: {
            max: 100,
            min: 0,
            tickAmount: 5,
            labels: {
              formatter: (value: number) => `${value}%`
            }
          }
        }
      ];

      // Kurz warten, damit die DOM-Elemente für die Charts vorhanden sind
      setTimeout(() => {
        const annotations = this.chartService.createAnnotationsForDays(this.allTimes);
        
        const containerHeight = this.chartContainerWrapper.nativeElement.offsetHeight;
        const chartCount = this.chartConfigs.length;
        const heightPerChart = Math.floor(containerHeight / chartCount);

        this.chartContainers.forEach((container, index) => {
          const chartConfig = this.chartConfigs[index];
          const chart = this.chartService.createChart(
            container.nativeElement,
            this.allTimes,
            chartConfig,
            this.xMin,
            this.xMax,
            annotations,
            heightPerChart // Übergabe der berechneten Höhe
          );
          this.charts.push(chart);
        });
      });
    });
  }

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent): void {
    if (!this.isMouseOverChart) return;
    event.preventDefault();

    const baseDelta = this.scrollFactor;
    const deltaMultiplier = event.deltaY > 100 ? 1.5 : event.deltaY < 10 ? 0.5 : 1;
    const delta = (event.deltaY < 0 ? -baseDelta : baseDelta) * deltaMultiplier;

    this.updateChartRange(delta);
  }

  updateChartRange(delta: number): void {
    const now = new Date().getTime();

    this.xMin += delta;
    this.xMax += delta;

    if (this.xMin < Math.max(this.allTimes[0], now)) {
      this.xMin = Math.max(this.allTimes[0], now);
      this.xMax = this.xMin + this.visibleRange;
    }
    if (this.xMax > this.allTimes[this.allTimes.length - 1]) {
      this.xMax = this.allTimes[this.allTimes.length - 1];
      this.xMin = this.xMax - this.visibleRange;
    }

    for (const chart of this.charts) {
      chart.updateOptions({
        xaxis: {
          min: this.xMin,
          max: this.xMax,
        },
      }, false, false);
    }
  }

  onMouseEnter(): void {
    this.isMouseOverChart = true;
  }

  onMouseLeave(): void {
    this.isMouseOverChart = false;
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  destroyCharts(): void {
    for (const chart of this.charts) {
      chart.destroy();
    }
    this.charts = [];
  }
}
