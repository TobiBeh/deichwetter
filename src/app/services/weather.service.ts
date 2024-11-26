import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  // Wetterdaten abrufen
  getCurrentWeather(lat: string, lon: string): Observable<any> {
    const params = {
      latitude: lat,
      longitude: lon,
      current_weather: 'true',
    };

    return this.http.get(this.baseUrl, { params });
  }
}
