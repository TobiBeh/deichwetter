import { Injectable } from '@angular/core';
import ApexCharts from 'apexcharts';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  constructor(private translate: TranslateService) {}

  createChart(
    element: HTMLElement,
    allTimes: number[],
    temperatures: number[],
    precipitationProbabilities: number[],
    xMin: number,
    xMax: number
  ): ApexCharts {
    // Hier ggf. die Übersetzungen laden
    const temperatureSeriesName = this.translate.instant('chart.temperature');
    const precipitationSeriesName = this.translate.instant('chart.precipitation');
    const xAxisTitle = this.translate.instant('chart.time');
    const temperatureYAxisTitle = this.translate.instant('chart.temperature_yaxis');
    const precipitationYAxisTitle = this.translate.instant('chart.precipitation_yaxis');

    // Annotationen für jeden zweiten Tag erstellen
    const annotations = [];
    for (let i = 0; i < allTimes.length; i += 24) {
      const utcDate = new Date(allTimes[i]);
      const dayStartUTC = Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
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
        height: 450,
        animations: {
          enabled: false,
        },
        zoom: {
          enabled: false,
        },
        toolbar: {
          tools: {
            pan: false,
            zoom: false,
            download: false,
          },
        },
      },
      series: [
        {
          name: temperatureSeriesName, // Übersetzter Name
          type: 'line',
          data: allTimes.map((time, index) => [time, temperatures[index]]),
        },
        {
          name: precipitationSeriesName, // Übersetzter Name
          type: 'area',
          data: allTimes.map((time, index) => [time, precipitationProbabilities[index]]),
          yAxisIndex: 1,
        },
      ],
      xaxis: {
        type: 'datetime',
        min: xMin,
        max: xMax,
        labels: {
          format: 'HH:mm',
        },
        title: {
          text: xAxisTitle, // Übersetzter Achsentitel
        },
      },
      yaxis: [
        {
          title: {
            text: temperatureYAxisTitle, // Übersetzter Achsentitel
          },
          opposite: false,
        },
        {
          max: 100,
          min: 0,
          opposite: true,
          title: {
            text: precipitationYAxisTitle, // Übersetzter Achsentitel
          },
          tickAmount: 5,
          labels: {
            formatter: (value: number) => `${value}%`,
          },
        },
      ],
      grid: {
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
      },
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: ['#40E0D0', '#76a5af'],
      },
      fill: {
        type: ['gradient','solid'],
        gradient: {
          shade: 'dark',
          type: 'vertical',
          gradientToColors: ['#FF0000'],
          stops: [0, 50, 100],
          shadeIntensity: 1,
          colorStops: [
            {
              offset: 0,
              color: '#F95CCA',
              opacity: 1,
            },
            {
              offset: 50,
              color: '#1E62BC',
              opacity: 1,
            },
            {
              offset: 100,
              color: '#FFFFFF',
              opacity: 1,
            },
          ],
        },
        opacity: 0.35,
      },
      tooltip: {
        x: {
          format: 'dd MMM HH:mm',
        },
      },
      annotations: {
        xaxis: annotations,
      },
    };

    const chart = new ApexCharts(element, options);
    chart.render();
    return chart;
  }
}
