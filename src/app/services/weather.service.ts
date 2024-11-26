import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  getCurrentWeather(lat: string, lon: string): Observable<any> {
    const params = {
      latitude: lat,
      longitude: lon,
      current_weather: 'true',
    };
    return this.http.get<any>(this.baseUrl, { params });
  }

  getWeatherDescription(weatherCode: number): string {
    const weatherDescriptions: { [key: number]: string } = {
      0: 'Clear Sky',
      1: 'Partly Cloudy',
      2: 'Cloudy',
      3: 'Rain',
      4: 'Snow',
    };
    return weatherDescriptions[weatherCode] || 'Unknown Condition';
  }

  getWeatherIcon(weatherCode: number): string {
    const weatherIcons: { [key: number]: string } = {
      0: 'wi wi-day-sunny',
      1: 'wi wi-day-cloudy',
      2: 'wi wi-cloudy',
      3: 'wi wi-rain',
      4: 'wi wi-snow',
    };
    return weatherIcons[weatherCode] || 'wi wi-na';
  }

  getWindDirection(degree: number): string {
    if (degree >= 337.5 || degree < 22.5) return 'N';
    if (degree >= 22.5 && degree < 67.5) return 'NE';
    if (degree >= 67.5 && degree < 112.5) return 'E';
    if (degree >= 112.5 && degree < 157.5) return 'SE';
    if (degree >= 157.5 && degree < 202.5) return 'S';
    if (degree >= 202.5 && degree < 247.5) return 'SW';
    if (degree >= 247.5 && degree < 292.5) return 'W';
    if (degree >= 292.5 && degree < 337.5) return 'NW';
    return '';
  }
}
