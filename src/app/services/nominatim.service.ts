import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NominatimService {
  private apiUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  // Methode zur Suche nach Standorten anhand eines Strings
  searchLocations(query: string): Observable<any[]> {
    const params = {
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '10',
    };
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  // Methode zur Reverse-Geokodierung (Koordinaten -> Adresse)
  reverseGeocode(lat: number, lon: number): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    return this.http.get<any>(url);
  }

  // Extrahiert einen benutzerfreundlichen Standortnamen aus der Antwort
  getFormattedLocation(address: any): string {
    if (address.city) return address.city;
    if (address.town) return address.town;
    if (address.village) return address.village;
    if (address.state) return address.state;
    if (address.country) return address.country;
    return 'Unbekannter Standort';
  }

  // Methode zur Geolokalisierung des Nutzers (Browser API)
  getCurrentPosition(options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      } else {
        reject('Geolocation not supported by this browser.');
      }
    });
  }

  // Methode zur Extraktion des kurzen Ortsnamens aus einem display_name
  getShortLocationName(displayName: string): string {
    return displayName.split(',')[0].trim();
  }
}