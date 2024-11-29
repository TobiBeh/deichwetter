import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
export class CurrentWeatherComponent implements OnInit {
  searchControl = new FormControl('');
  suggestions: any[] = [];
  selectedLocation: string = '';
  weatherData: any = null;
  highlightedIndex: number = -1; // Für die Navigation der Vorschläge
  loading: boolean = false; // Loading indicator

  constructor(
    private nominatimService: NominatimService,
    private weatherService: WeatherService
  ) {
    this.initializeSearch();
  }

  ngOnInit(): void {
    this.loading = true; // Start loading indicator

    this.nominatimService.getCurrentPosition().then(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Parallele Verarbeitung von Reverse-Geokodierung und Wetterdaten
        forkJoin({
          location: this.nominatimService.reverseGeocode(latitude, longitude),
          weather: this.weatherService.getCurrentWeather(latitude.toString(), longitude.toString())
        }).pipe(
          catchError((error) => {
            console.error('Fehler beim Laden der Daten:', error);
            this.loading = false; // Stop loading indicator on error
            return of({ location: null, weather: null });
          })
        ).subscribe(
          ({ location, weather }) => {
            if (location && weather) {
              // Standortname aus strukturierter Adresse extrahieren
              const address = location.address;
              this.selectedLocation = this.nominatimService.getFormattedLocation(address);
              this.weatherData = {
                ...weather.current_weather,
                temperature_max: weather.daily.temperature_2m_max[0],
                temperature_min: weather.daily.temperature_2m_min[0]
              };
              this.weatherService.setLocation(latitude.toString(), longitude.toString());
            }
            this.loading = false; // Stop loading indicator
          }
        );
      },
      (error) => {
        console.error('Fehler bei der Geolokalisierung:', error);
        this.loading = false; // Stop loading indicator on error
      }
    );
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
        this.highlightedIndex = -1; // Reset des Index
      });
  }

  onSelectSuggestion(suggestion: any): void {
    this.selectedLocation = this.nominatimService.getShortLocationName(
      suggestion.display_name
    );
    this.suggestions = [];
    this.weatherService
      .getCurrentWeather(suggestion.lat, suggestion.lon)
      .subscribe((weather) => {
        this.weatherData = {
          ...weather.current_weather,
          temperature_max: weather.daily.temperature_2m_max[0],
          temperature_min: weather.daily.temperature_2m_min[0]
        };
        this.searchControl.setValue('', { emitEvent: false }); // Suchzeile leeren
      });
    this.weatherService.setLocation(suggestion.lat, suggestion.lon);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.suggestions || this.suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        this.highlightedIndex =
          (this.highlightedIndex + 1) % this.suggestions.length;
        event.preventDefault(); // Verhindert das Scrollen
        break;

      case 'ArrowUp':
        this.highlightedIndex =
          (this.highlightedIndex - 1 + this.suggestions.length) %
          this.suggestions.length;
        event.preventDefault(); // Verhindert das Scrollen
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

  getWeatherIcon(weatherCode: number): string {
    return this.weatherService.getWeatherIcon(weatherCode);
  }

  getWeatherDescription(weatherCode: number): string {
    return this.weatherService.getWeatherDescription(weatherCode);
  }

  getWindDirection(degree: number): string {
    return this.weatherService.getWindDirection(degree);
  }
}