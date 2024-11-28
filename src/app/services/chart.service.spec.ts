import { TestBed } from '@angular/core/testing';
import { ChartService } from './chart.service';
import ApexCharts from 'apexcharts';

describe('ChartService', () => {
  let service: ChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a chart', () => {
    const element = document.createElement('div');
    const allTimes = [Date.now()];
    const temperatures = [20];
    const xMin = Date.now();
    const xMax = xMin + 24 * 60 * 60 * 1000;

    const chart = service.createChart(element, allTimes, temperatures, xMin, xMax);
    expect(chart).toBeInstanceOf(ApexCharts);
  });
});