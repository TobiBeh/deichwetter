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
  highlightedIndex: number = -1; // Für die Navigation der Vorschläge

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
        this.weatherData = weather.current_weather;
        this.searchControl.setValue('', { emitEvent: false }); // Suchzeile leeren
      });
  }

  onKeyDown(event: KeyboardEvent): void {
    // Überprüfen, ob es Vorschläge gibt
    if (!this.suggestions || this.suggestions.length === 0) return;
  
    // Verarbeite das gedrückte Schlüssel-Event
    switch (event.key) {
      case 'ArrowDown':
        // Nächster Vorschlag
        this.highlightedIndex =
          (this.highlightedIndex + 1) % this.suggestions.length;
        event.preventDefault(); // Verhindert das Scrollen
        break;
  
      case 'ArrowUp':
        // Vorheriger Vorschlag
        this.highlightedIndex =
          (this.highlightedIndex - 1 + this.suggestions.length) %
          this.suggestions.length;
        event.preventDefault(); // Verhindert das Scrollen
        break;
  
      case 'Enter':
        // Vorschlag auswählen
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
