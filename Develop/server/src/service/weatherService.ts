import dotenv from "dotenv";
dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

class WeatherService {
  private geoBaseUrl = `${process.env.API_BASE_URL}/geo/1.0/direct`;
  private forecastBaseUrl = `${process.env.API_BASE_URL}/data/2.5/forecast`;
  private apiKey = process.env.API_KEY || "";
  private city: string = "";

  private async fetchLocationData(query: string) {
    const url = `${this.geoBaseUrl}?q=${query}&limit=1&appid=${this.apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0];
  }

  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  private buildForecastQuery(coordinates: Coordinates): string {
    return `${this.forecastBaseUrl}?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
  }

  private async fetchAndDestructureLocationData() {
    const locationData = await this.fetchLocationData(this.city);
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    const url = this.buildForecastQuery(coordinates);
    const res = await fetch(url);
    const data = await res.json();
    return data;
  }

  private parseCurrentWeather(response: any) {
    const entry = response.list?.[0]; // take first 3-hour block as current weather
    return {
      city: response.city?.name || "Unknown",
      date: new Date().toISOString().split("T")[0],
      icon: entry?.weather?.[0]?.icon || "",
      iconDescription: entry?.weather?.[0]?.description || "",
      tempF: entry?.main?.temp || 0,
      windSpeed: entry?.wind?.speed || 0,
      humidity: entry?.main?.humidity || 0,
    };
  }

  private buildForecastArray(city: string, weatherData: any) {
    const daily: { [date: string]: any } = {};

    weatherData.list.forEach((entry: any) => {
      const date = entry.dt_txt.split(" ")[0];
      if (!daily[date]) {
        daily[date] = {
          city,
          date,
          icon: entry.weather?.[0]?.icon || "",
          iconDescription: entry.weather?.[0]?.description || "",
          tempF: entry.main?.temp || 0,
          windSpeed: entry.wind?.speed || 0,
          humidity: entry.main?.humidity || 0,
        };
      }
    });

    return Object.values(daily).slice(0, 5);
  }

  async getWeatherData(city: string) {
    this.city = city;

    try {
      const coordinates = await this.fetchAndDestructureLocationData();
      const forecastRaw = await this.fetchWeatherData(coordinates);

      if (!forecastRaw?.city?.name) {
        console.error("Invalid forecast response:", forecastRaw);
        throw new Error("Invalid data returned from weather API");
      }

      const current = this.parseCurrentWeather(forecastRaw);
      const forecast = this.buildForecastArray(
        forecastRaw.city.name,
        forecastRaw
      );

      return [current, ...forecast];
    } catch (error) {
      console.error("WeatherService Error:", error);
      throw error;
    }
  }
}

export default new WeatherService();
