import { Component, OnInit } from '@angular/core';
import { TranslateService, TranslateModule} from '@ngx-translate/core';
import { CurrentWeatherComponent } from './current-weather/current-weather.component';
import { HeaderComponent } from './header/header.component';
import { HourlyForecastComponent } from './hourly-forecast/hourly-forecast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CurrentWeatherComponent, HeaderComponent, HourlyForecastComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService) {
    const browserLang = navigator.language.split('-')[0];
    console.log('Browser language:', browserLang);
    this.translate.setDefaultLang('en');
  }

  async ngOnInit(): Promise<void> {
    const browserLang = navigator.language.split('-')[0];
    const languageToUse = browserLang.match(/en|de/) ? browserLang : 'en';

    // Warten, bis die Übersetzungen geladen wurden
    await this.translate.use(languageToUse).toPromise();
    console.log('Translations loaded for language:', languageToUse);
  }
}
