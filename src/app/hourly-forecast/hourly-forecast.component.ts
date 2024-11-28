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

  constructor(private weatherService: WeatherService, private renderer: Renderer2) { }

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

      // Annotationen für jeden zweiten Tag erstellen
      const annotations = [];
      for (let i = 0; i < this.allTimes.length; i += 24) {
        const utcDate = new Date(this.allTimes[i]);

        // Berechne 0 Uhr UTC für den Startzeitpunkt
        const dayStartUTC = Date.UTC(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate()
        );

        // Berechne 0 Uhr UTC für den nächsten Tag (Endzeitpunkt)
        const dayEndUTC = dayStartUTC + 24 * 60 * 60 * 1000; // 24 Stunden später

        // Nur jeden zweiten Tag markieren
        if ((i / 24) % 2 === 1) {
          annotations.push({
            x: dayStartUTC,
            x2: dayEndUTC,
            fillColor: 'rgba(0, 0, 0, 0.15)', // Leicht graue Hintergrundfarbe
          });
        }
      }



      const options = {
        chart: {
          type: 'line',
          height: 350,
          animations: {
            enabled: false, // Deaktiviert für direktes Feedback
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
          width: 3, // Linienbreite
          colors: ['#40E0D0'], // Primärfarbe (Türkis für Standardlinie)
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical', // Farbverlauf vertikal
            gradientToColors: ['#FF0000'], // Übergang von Türkis zu Rot
            stops: [0, 50, 100], // Verlauf basierend auf 0%, 50%, 100%
            shadeIntensity: 1, // Stärke des Farbverlaufs
            colorStops: [
              {
                offset: 0,
                color: '#F95CCA', // Rosa für Werte > 40
                opacity: 1
              },
              {
                offset: 50,
                color: '#1E62BC', // Blau für Werte um 5
                opacity: 1
              },
              {
                offset: 100,
                color: '#FFFFFF', // Weiß für Werte < -5
                opacity: 1
              }
            ]
          },
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
