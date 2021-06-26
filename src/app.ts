// lib/app.ts
//import express = require('express');
import stream = require('stream');
import util = require('util');
const logger = require("./logger");
const fs = require('fs');

const WeatherImage = require('./weatherimage');

const mapQuestKey = require('../mapquestkey.json');

// Create a new express application instance
async function run() {
    // const app: express.Application = express();

    // const weatherConfig: any = {
    //     agent: "ken@faubel.org",
    //     lat: "41.7476",
    //     lon: "-70.6676",
    //     //zip: "01827",
    //     //mapQuestKey: mapQuestKey.mapQuestKey,
    //     title: "Forecast for Onset, MA"
    // }

    // https://forecast.weather.gov/MapClick.php?lat=42.96&lon=-77.44&FcstType=digitalDWML
    // https://forecast.weather.gov/MapClick.php?lat=41.75&lon=-70.644&FcstType=digitalDWML
    
    const weatherConfig: any = {
        agent: "ken@faubel.org",
        lat: "41.75",
        lon: "-70.644",
        title: "Forecast for Boston, MA",
        days: 4
    }
   
    const weatherImage = new WeatherImage(logger);

    const result = await weatherImage.getImageStream(weatherConfig);
    logger.info("Looks promising");
    
    // We now get result.jpegImg
    fs.writeFileSync('image.jpg', result.jpegImg.data);

    logger.info("done");
}

run();