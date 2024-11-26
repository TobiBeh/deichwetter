import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NominatimService } from '../services/nominatim.service';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], // Nur ReactiveFormsModule
  templateUrl: './current-weather.component.html',
  styleUrls: ['./current-weather.component.css'],
})
export class CurrentWeatherComponent {
  searchControl = new FormControl('');
  suggestions: any[] = [];

  constructor(private nominatimService: NominatimService) {
    this.initializeSearch();
  }

  // Initialisiere Suche mit automatischer Vorschlagsfunktion
  private initializeSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.nominatimService.searchLocations(query || ''))
      )
      .subscribe((results) => {
        this.suggestions = results; // Vorschläge aktualisieren
      });
  }
  
  

  // Suche auslösen (manuell)
  onSearch(): void {
    const query = this.searchControl.value;
    if (query) {
      this.nominatimService.searchLocations(query).subscribe((results) => {
        this.suggestions = results;
        console.log('Search results:', results);
      });
    }
  }

  // Vorschlag auswählen
  onSelectSuggestion(suggestion: any): void {
    // Setze den ausgewählten Vorschlag in das Eingabefeld
    this.searchControl.setValue(suggestion.display_name, { emitEvent: false }); // Kein valueChanges-Event
    this.suggestions = []; // Vorschläge sofort leeren
  
    console.log('Selected location:', suggestion);
  }
  
  
}
