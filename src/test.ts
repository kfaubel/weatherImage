// lib/app.ts
//import express = require('express');
import stream = require('stream');
import util = require('util');
const logger = require("./logger");
const fs = require('fs');

import { WeatherImage } from './weatherimage';

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
        name: "Onset",
        lat: "41.75",
        lon: "-70.644",
        title: "Forecast for Onset, MA",
        days: 5
    }
   
    // "[{\"name\": \"Onset\", \"lat\": \"41.75\", \"lon\": \"-70.644\", \"title\": \"Forecast for Onset, MA\", \"days\": \"5\"}]"
    
    const weatherImage = new WeatherImage(logger);

    const result = await weatherImage.getImageStream(weatherConfig);
    
    // We now get result.jpegImg
    logger.info(`Writing from data: image.jpg`);

    if (result !== null && result.jpegImg !== null ) {
        fs.writeFileSync('image.jpg', result.jpegImg.data);
    } else {
        logger.error("test.ts: no jpegImg returned from weatherImage.getImageStream")
    }

    if (result !== null && result.stream !== null ) {
        logger.info(`Writing from stream: image2.jpg`);

        const out = fs.createWriteStream('image2.jpg');
        const finished = util.promisify(stream.finished);

        result.stream.pipe(out);
        out.on('finish', () =>  logger.info('The jpg from a stream file was created.'));

        await finished(out); 
    } else {
        logger.error("test.ts: no stream returned from weatherImage.getImageStream")
    }
    
    logger.info("done"); 
}

run();