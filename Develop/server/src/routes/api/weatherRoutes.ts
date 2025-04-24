import { Router, type Request, type Response } from "express";
const router = Router();

import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

// ✅ POST Request with city name to retrieve weather data
router.post("/", async (req: Request, res: Response) => {
  try {
    console.log("📩 POST /api/weather hit");
    console.log("🧾 Request body:", req.body);

    const { city } = req.body;

    if (!city) {
      console.log("❌ No city provided");
      return res.status(400).json({ error: "City is required" });
    }

    const weatherData = await WeatherService.getWeatherData(city);
    await HistoryService.addCity(city);

    res.status(200).json(weatherData);
    return;
  } catch (err) {
    console.error("🔥 Error in POST /api/weather:", err);
    res.status(500).json({ error: "Failed to fetch weather data" });
    return;
  }
});

// ✅ GET search history
router.get("/history", async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getCities();
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch search history" });
  }
});

// ✅ BONUS: DELETE city from search history
router.delete("/history/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await HistoryService.removeCity(id);
    res.status(200).json({ message: "City deleted from history" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete city from history" });
  }
});

export default router;
