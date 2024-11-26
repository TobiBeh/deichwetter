import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NominatimService {
  private apiUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  searchLocations(query: string): Observable<any[]> {
    const params = {
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '10',
    };

    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map((results) => {
        // Sortiere Ergebnisse: Städte zuerst, dann nach Namenslänge
        return results.sort((a, b) => {
          const isACity = a.type === 'city' ? 1 : 0;
          const isBCity = b.type === 'city' ? 1 : 0;

          if (isACity !== isBCity) {
            return isBCity - isACity; // Städte zuerst
          }

          return a.display_name.length - b.display_name.length; // Kürzere Namen zuerst
        });
      })
    );
  }
}
