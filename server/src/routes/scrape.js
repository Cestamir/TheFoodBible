import dotenv from "dotenv";
dotenv.config({path: '../.env'})
import express from "express";
const router = express.Router();

import { runAllRecipeScraper } from "../../../scrapers/AllScraper.ts";
import { runFruitScraper } from "../../../scrapers/FruitScraper.ts";
import { runHerbsScraper } from "../../../scrapers/HerbsScraper.ts";
import { runRestItemsScraper } from "../../../scrapers/RestScraper.ts";
import { runSeedScraper } from "../../../scrapers/SeedScraper.ts";
import { runVegetableScraper } from "../../../scrapers/VegetableScraper.ts";

router.post("/:source", async (req, res) => {
  const { source } = req.params;

  try {
    let result;
    switch (source) {   
      case "recipes":
        result = await runAllRecipeScraper();
        break;
      case "fruits":
        result = await runFruitScraper();
        break;
      case "vegetables":
        result = await runVegetableScraper();
        break;
      case "herbs":
        result = await runHerbsScraper();
        break;
      case "restItems":
        result = await runRestItemsScraper();
        break;
      case "seeds":
        result = await runSeedScraper();
        break;
      default:
        return res.status(400).json({ ok: false, error: "Unknown source" });
    }

    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;