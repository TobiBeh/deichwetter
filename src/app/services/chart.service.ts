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

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  constructor(private translate: TranslateService) {}

  createChart(
    element: HTMLElement,
    allTimes: number[],
    chartConfig: ChartConfig,
    xMin: number,
    xMax: number,
    annotations: any[] = [],
    chartHeight: number
  ): ApexCharts {
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
          color: '#363737' // dunkles Grau
        }
      },
      xaxis: {
        type: 'datetime',
        min: xMin,
        max: xMax,
        labels: { format: 'HH:mm' },
        title: { text: xAxisTitle },
      },
      tooltip: {
        x: {
          format: 'dd MMM HH:mm',
        },
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      grid: {
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      },
      annotations: {
        xaxis: annotations,
      },
      yaxis: {
        show: true,
        // Kein title hier, da wir jetzt den Titel oben als Chart-Titel nutzen
      },
      dataLabels: {
        enabled: false
      }
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

      // Oben weiß (kalt), in der Mitte blau, unten rot (heiß)
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
        }
      ],
      colors: colors,
      fill: fillOptions,
      yaxis: chartConfig.yaxis 
        ? { ...commonOptions.yaxis, ...chartConfig.yaxis }
        : commonOptions.yaxis
    };

    const chart = new ApexCharts(element, options);
    chart.render();
    return chart;
  }

  createAnnotationsForDays(allTimes: number[]): any[] {
    const annotations = [];
    for (let i = 0; i < allTimes.length; i += 24) {
      const utcDate = new Date(allTimes[i]);
      const dayStartUTC = Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
      const dayEndUTC = dayStartUTC + 24 * 60 * 60 * 1000;

      if ((i / 24) % 2 === 1) {
        annotations.push({
          x: dayStartUTC,
          x2: dayEndUTC,
          fillColor: 'rgba(0, 0, 0, 0.15)',
        });
      }
    }
    return annotations;
  }
}
