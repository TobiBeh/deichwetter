import { Injectable } from '@angular/core';
import ApexCharts from 'apexcharts';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  createChart(element: HTMLElement, allTimes: number[], temperatures: number[], xMin: number, xMax: number): ApexCharts {
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
          data: allTimes.map((time, index) => [time, temperatures[index]]),
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
      yaxis: {
        title: {
          text: 'Temperature (°C)',
        },
      },
      stroke: {
        curve: 'smooth',
        width: 2, // Linienbreite
        colors: ['#40E0D0'], // Primärfarbe (Türkis für Standardlinie)
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'vertical', // Farbverlauf vertikal
          gradientToColors: ['#FF0000'], // Übergang von Türkis zu Rot
          stops: [-100, 50, 100], // Verlauf basierend auf 0%, 50%, 100%
          shadeIntensity: 1, // Stärke des Farbverlaufs
          colorStops: [
            {
              offset: -100,
              color: '#F95CCA', // Rosa für Werte > 40
              opacity: 1
            },
            {
              offset: 50,
              color: '#1E62BC', // Blau für Werte um 5
              opacity: 1
            },
            {
              offset: 200,
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

    return new ApexCharts(element, options);
  }
}