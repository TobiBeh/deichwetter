import { Injectable } from '@angular/core';
import ApexCharts from 'apexcharts';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  createChart(element: HTMLElement, allTimes: number[], temperatures: number[], precipitationProbabilities: number[], xMin: number, xMax: number): ApexCharts {
    // Annotationen für jeden zweiten Tag erstellen
    const annotations = [];
    for (let i = 0; i < allTimes.length; i += 24) {
      const utcDate = new Date(allTimes[i]);

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
        height: 450,
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
            download: false, // Kein Download
          },
        },
      },
      series: [
        {
          name: 'Temperature (°C)',
          type: 'line',
          data: allTimes.map((time, index) => [time, temperatures[index]]),
        },
        {
          name: 'Precipitation Probability (%)',
          type: 'area',
          data: allTimes.map((time, index) => [time, precipitationProbabilities[index]]),
          yAxisIndex: 1, // Use the second y-axis
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
          text: 'Time',
        },
      },
      yaxis: [
        {
          title: {
            text: 'Temperature (°C)',
          },
          opposite: false,
        },
        {
          max: 100, // Set maximum to 100
          min: 0, // Set minimum to 0
          opposite: true,
          title: {
            text: 'Precipitation Probability (%)',
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
        colors: ['#40E0D0', '#76a5af'], // Türkis für Temperatur, Blassblau für Niederschlag
      },
      fill: {
        type: ['gradient','solid'],
        gradient: {
          shade: 'dark',
          type: 'vertical', // Farbverlauf vertikal
          gradientToColors: ['#FF0000'], // Übergang von Türkis zu Rot
          stops: [0, 50, 100],
          shadeIntensity: 1,
          colorStops: [
            {
              offset: 0,
              color: '#F95CCA', // Rosa für Werte > 40
              opacity: 1,
            },
            {
              offset: 50,
              color: '#1E62BC', // Blau für Werte um 5
              opacity: 1,
            },
            {
              offset: 100,
              color: '#FFFFFF', // Weiß für Werte < -5
              opacity: 1,
            },
          ],
        },
        opacity: 0.35, // Opazität: 0.35 für Niederschlag
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

    const chart = new ApexCharts(element, options);
    chart.render();
    return chart;
  }
}