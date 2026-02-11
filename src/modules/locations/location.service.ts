import { Injectable } from '@nestjs/common';
import { Country, State, City as CSCity } from 'country-state-city';
import { LocationQueryDto } from './dto/location.dto';

@Injectable()
export class LocationsService {
  private transform(data: any[], isCountry = false) {
    return data.map((item) => ({
      label: item.name,
      value: isCountry ? item.isoCode : item.name,
    }));
  }

  async getLocations({ country, state }: LocationQueryDto) {
    // 1️⃣ Return all countries
    if (!country && !state) {
      const countries = Country.getAllCountries();
      return this.transform(countries, true);
    }

    // 2️⃣ Return states of a country
    if (country && !state) {
      const states = State.getStatesOfCountry(country);
      console.log('States:', states);
      return this.transform(states,true);
    }

    // 3️⃣ Return cities of a state
    if (country && state) {
      const cities = CSCity.getCitiesOfState(country, state);
      console.log('Cities:', cities,true);

      return cities.map((city) => ({
        label: city.name,
        value: city.name,
      }));
    }

    return [];
  }
}
