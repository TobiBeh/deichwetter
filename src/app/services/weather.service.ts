import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';
  private locationSubject = new BehaviorSubject<{ latitude: string; longitude: string } | null>(null);

  constructor(private http: HttpClient, private translate: TranslateService) {}

  // Aktuellen Ort speichern
  setLocation(latitude: string, longitude: string): void {
    this.locationSubject.next({ latitude, longitude });
  }

  // Ort abrufen
  getLocation(): Observable<{ latitude: string; longitude: string } | null> {
    return this.locationSubject.asObservable();
  }

  // Aktuelles Wetter abrufen
  getCurrentWeather(lat: string, lon: string): Observable<any> {
    const params = {
      latitude: lat,
      longitude: lon,
      current_weather: 'true',
      daily: 'temperature_2m_max,temperature_2m_min',
      timezone: 'auto'
    };
    return this.http.get<any>(this.baseUrl, { params });
  }

  // Stündliche Wetterdaten abrufen
  getHourlyWeather(lat: string, lon: string): Observable<any> {
    const params = {
      latitude: lat,
      longitude: lon,
      hourly: 'temperature_2m,precipitation_probability',
    };
    return this.http.get<any>(this.baseUrl, { params });
  }

  // Wetterbeschreibung
  getWeatherDescription(weatherCode: number): string {
    const weatherDescriptions: { [key: number]: string } = {
      0: 'clearSky',
      1: 'mainlyClear',
      2: 'partlyCloudy',
      3: 'overcast',
      45: 'fog',
      48: 'depositingRimeFog',
      51: 'lightDrizzle',
      53: 'moderateDrizzle',
      55: 'denseDrizzle',
      56: 'lightFreezingDrizzle',
      57: 'denseFreezingDrizzle',
      61: 'slightRain',
      63: 'moderateRain',
      65: 'heavyRain',
      66: 'lightFreezingRain',
      67: 'heavyFreezingRain',
      71: 'slightSnowfall',
      73: 'moderateSnowfall',
      75: 'heavySnowfall',
      77: 'snowGrains',
      80: 'slightRainShowers',
      81: 'moderateRainShowers',
      82: 'violentRainShowers',
      85: 'slightSnowShowers',
      86: 'heavySnowShowers',
      95: 'thunderstorm',
      96: 'thunderstormWithSlightHail',
      99: 'thunderstormWithHeavyHail',
    };
    return this.translate.instant(weatherDescriptions[weatherCode] || 'unknownCondition');
  }

  // Wettericon
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

  // Windrichtung
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
