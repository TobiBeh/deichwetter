import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NominatimService } from '../services/nominatim.service';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './current-weather.component.html',
  styleUrls: ['./current-weather.component.css'],
})
export class CurrentWeatherComponent {
  searchControl = new FormControl('');
  suggestions: any[] = [];
  selectedLocation: string = '';
  weatherData: any = null;
  highlightedIndex: number = -1; // Index für die Vorschlagsnavigation

  constructor(
    private nominatimService: NominatimService,
    private weatherService: WeatherService
  ) {
    this.initializeSearch();
  }

  private initializeSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.nominatimService.searchLocations(query || ''))
      )
      .subscribe((results) => {
        this.suggestions = results;
        this.highlightedIndex = -1; // Reset des Navigationsindex
      });
  }

  onSelectSuggestion(suggestion: any): void {
    const fullDisplayName = suggestion.display_name;
    this.selectedLocation = fullDisplayName.split(',')[0].trim();
    this.suggestions = [];
    this.weatherService
      .getCurrentWeather(suggestion.lat, suggestion.lon)
      .subscribe((weather) => {
        this.weatherData = weather.current_weather;
        this.searchControl.setValue('', { emitEvent: false }); // Suchzeile leeren
      });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        this.highlightedIndex =
          (this.highlightedIndex + 1) % this.suggestions.length;
        break;
      case 'ArrowUp':
        this.highlightedIndex =
          (this.highlightedIndex - 1 + this.suggestions.length) %
          this.suggestions.length;
        break;
      case 'Enter':
        if (this.highlightedIndex >= 0) {
          this.onSelectSuggestion(this.suggestions[this.highlightedIndex]);
        }
        break;
      default:
        break;
    }
  }

  // Gibt die passende Icon-Klasse für den Wettercode zurück
  getWeatherIcon(weatherCode: number): string {
    const weatherIcons: { [key: number]: string } = {
      0: 'wi wi-day-sunny', // Klarer Himmel
      1: 'wi wi-day-cloudy', // Leicht bewölkt
      2: 'wi wi-cloudy', // Bewölkt
      3: 'wi wi-rain', // Regen
      4: 'wi wi-snow', // Schnee
    };
    return weatherIcons[weatherCode] || 'wi wi-na'; // Fallback für unbekannte Codes
  }

  // Gibt eine Beschreibung des Wetters basierend auf dem Wettercode zurück
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

  // Gibt die Windrichtung als Text zurück
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
