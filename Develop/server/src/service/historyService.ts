import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

// ✅ Add this for __dirname support in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Define a City class with name and id properties
class City {
  constructor(public name: string, public id: string = uuidv4()) {}
}

// ✅ Complete the HistoryService class
class HistoryService {
  private filePath = path.join(__dirname, "../db/db.json");

  // ✅ Define a read method
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      return []; // if file doesn't exist or is empty
    }
  }

  // ✅ Define a write method
  private async write(cities: City[]) {
    await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2));
  }

  // ✅ Define a getCities method
  async getCities(): Promise<City[]> {
    return await this.read();
  }

  // ✅ Define an addCity method
  async addCity(cityName: string): Promise<void> {
    const cities = await this.read();
    // avoid duplicates
    const exists = cities.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );
    if (!exists) {
      cities.push(new City(cityName));
      await this.write(cities);
    }
  }

  // ✅ BONUS: Define a removeCity method
  async removeCity(id: string): Promise<void> {
    let cities = await this.read();
    cities = cities.filter((city) => city.id !== id);
    await this.write(cities);
  }
}

export default new HistoryService();
