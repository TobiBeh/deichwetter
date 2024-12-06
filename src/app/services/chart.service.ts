import { Injectable } from '@angular/core';
import ApexCharts, { ApexOptions } from 'apexcharts';
import { TranslateService } from '@ngx-translate/core';

export interface ChartConfig {
  id: string;
  type: 'line' | 'area';
  seriesNameKey: string;
  yaxisTitleKey: string;
  color: string;
  data: [number, number][];
  gradient?: boolean;
  yaxis?: ApexOptions['yaxis'];
}

interface ChartInstance {
  chart: ApexCharts;
  allTimes: number[];
  chartConfig: ChartConfig;
  xMin: number;
  xMax: number;
  chartHeight: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private charts: ChartInstance[] = [];

  constructor(private translate: TranslateService) {
    // Listener für Änderungen im prefers-color-scheme
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', (e) => {
      const isDarkMode = e.matches;
      this.updateCharts(isDarkMode);
    });
  }

  createChart(
    element: HTMLElement,
    allTimes: number[],
    chartConfig: ChartConfig,
    xMin: number,
    xMax: number,
    chartHeight: number
  ): ApexCharts {
    // CSS-Variablen auslesen
    const rootStyle = getComputedStyle(document.documentElement);
    const chartBg = rootStyle.getPropertyValue('--chart-bg').trim();
    const chartTextColor = rootStyle.getPropertyValue('--chart-text-color').trim();

    // Prüfen, ob wir im Dark Mode sind anhand des chartBg
    const isDarkMode = chartBg !== '#ffffff'; // Annahme: nur weiß ist Hellmodus

    // Generiere Annotations basierend auf dem aktuellen Modus
    const dynamicAnnotations = this.createAnnotationsForDays(allTimes, isDarkMode);

    const seriesName = this.translate.instant(chartConfig.seriesNameKey);
    const chartTitleText = this.translate.instant(chartConfig.yaxisTitleKey);
    const xAxisTitle = this.translate.instant('chart.time');

    const commonOptions: Partial<ApexOptions> = {
      chart: {
        group: 'weather',
        zoom: { enabled: false },
        toolbar: {
          tools: {
            pan: false,
            zoom: false,
            download: false,
          },
        },
        animations: { enabled: false },
        background: chartBg,
      },
      title: {
        text: chartTitleText,
        align: 'left',
        margin: 0,
        offsetX: 0,
        offsetY: 20,
        floating: false,
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: 'Nunito, sans-serif',
          color: chartTextColor,
        },
      },
      xaxis: {
        type: 'datetime',
        min: xMin,
        max: xMax,
        labels: {
          format: 'HH:mm',
          style: {
            colors: chartTextColor,
          },
        },
        title: {
          text: xAxisTitle,
          style: { color: chartTextColor },
        },
      },
      tooltip: {
        x: {
          format: 'dd MMM HH:mm',
        },
        theme: isDarkMode ? 'dark' : 'light', // Tooltip an Dark-/Light-Mode anpassen
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      grid: {
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        // Optional: borderColor: rootStyle.getPropertyValue('--chart-grid-color').trim(),
      },
      annotations: {
        xaxis: dynamicAnnotations,
      },
      yaxis: {
        show: true,
        labels: {
          style: {
            colors: chartTextColor,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
    };

    let fillOptions: ApexOptions['fill'] = { type: 'solid', opacity: 0.35 };
    let colors = [chartConfig.color];

    if (chartConfig.gradient) {
      const rangeMin = -10;
      const rangeMax = 35;
      const toPercent = (value: number): number => {
        const range = rangeMax - rangeMin;
        const relative = ((value - rangeMin) / range) * 100;
        return Math.max(0, Math.min(100, relative));
      };

      const coldStop = toPercent(-10);
      const zeroStop = toPercent(0);
      const hotStop = toPercent(35);

      const colorStops = [
        {
          offset: coldStop,
          color: '#FFFFFF',
          opacity: 1,
        },
        {
          offset: zeroStop,
          color: '#1E62BC',
          opacity: 1,
        },
        {
          offset: hotStop,
          color: '#F95CCA',
          opacity: 1,
        },
      ];

      fillOptions = {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'vertical',
          shadeIntensity: 1,
          colorStops: colorStops,
        },
      };
    }

    // Y-Achse mergen und Farbe erzwingen:
    let mergedYaxis: ApexOptions['yaxis'] = chartConfig.yaxis
      ? { ...commonOptions.yaxis, ...chartConfig.yaxis }
      : commonOptions.yaxis;

    // Sicherstellen, dass Label-Farbe gesetzt ist
    if (!mergedYaxis) {
      mergedYaxis = {};
    }

    if (Array.isArray(mergedYaxis)) {
      mergedYaxis = mergedYaxis.map(axis => ({
        ...axis,
        labels: {
          ...axis.labels,
          style: {
            ...axis.labels?.style,
            colors: chartTextColor,
          },
        },
      }));
    } else {
      if (!mergedYaxis.labels) {
        mergedYaxis.labels = {};
      }
      if (!mergedYaxis.labels.style) {
        mergedYaxis.labels.style = {};
      }
      mergedYaxis.labels.style.colors = chartTextColor;
    }

    const options: ApexOptions = {
      ...commonOptions,
      chart: {
        ...commonOptions.chart,
        id: chartConfig.id,
        type: chartConfig.type,
        height: chartHeight,
      },
      series: [
        {
          name: seriesName,
          type: chartConfig.type,
          data: chartConfig.data,
        },
      ],
      colors: colors,
      fill: fillOptions,
      yaxis: mergedYaxis,
      annotations: {
        xaxis: dynamicAnnotations,
      },
    };

    const chart = new ApexCharts(element, options);
    chart.render();

    // Speichere die Chart-Instanz mit den notwendigen Konfigurationsdaten
    this.charts.push({
      chart,
      allTimes,
      chartConfig,
      xMin,
      xMax,
      chartHeight,
    });

    return chart;
  }

  updateCharts(isDarkMode: boolean) {
    const rootStyle = getComputedStyle(document.documentElement);
    const chartBg = rootStyle.getPropertyValue('--chart-bg').trim();
    const chartTextColor = rootStyle.getPropertyValue('--chart-text-color').trim();

    this.charts.forEach(chartInstance => {
      const { chart, allTimes, chartConfig, xMin, xMax, chartHeight } = chartInstance;

      // Generiere neue Annotations basierend auf dem aktuellen Modus
      const newAnnotations = this.createAnnotationsForDays(allTimes, isDarkMode);

      // Aktualisiere die Chart-Optionen
      chart.updateOptions({
        chart: {
          background: chartBg,
        },
        title: {
          style: {
            color: chartTextColor,
          },
        },
        xaxis: {
          labels: {
            style: {
              colors: chartTextColor,
            },
          },
          title: {
            style: { color: chartTextColor },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: chartTextColor,
            },
          },
        },
        tooltip: {
          theme: isDarkMode ? 'dark' : 'light',
        },
        annotations: {
          xaxis: newAnnotations,
        },
      });
    });
  }

  createAnnotationsForDays(allTimes: number[], isDarkMode: boolean): any[] {
    const annotations = [];
    const fillColor = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';

    for (let i = 0; i < allTimes.length; i += 24) {
      const utcDate = new Date(allTimes[i]);
      const dayStartUTC = Date.UTC(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth(),
        utcDate.getUTCDate()
      );
      const dayEndUTC = dayStartUTC + 24 * 60 * 60 * 1000;

      if ((i / 24) % 2 === 1) {
        annotations.push({
          x: dayStartUTC,
          x2: dayEndUTC,
          fillColor: fillColor,
        });
      }
    }
    return annotations;
  }

  destroyCharts(): void {
    for (const chartInstance of this.charts) {
      chartInstance.chart.destroy();
    }
    this.charts = [];
  }
}
