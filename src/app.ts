// lib/app.ts
//import express = require('express');
import stream = require('stream');
import util = require('util');
const logger = require("./logger");
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
        title: "Forecast for Onset, MA",
        days: 4
    }
   
    const weatherImage = new WeatherImage(logger);

    const result = await weatherImage.getImageStream(weatherConfig);
    const imageStream = result.stream;
    logger.info("Expires: " + result.expires);

    // console.log("__dirname: " + __dirname);
    const fs = require('fs');
    const out = fs.createWriteStream(__dirname +'/../test.png');

    const finished = util.promisify(stream.finished);

    imageStream.pipe(out);
    // tslint:disable-next-line:no-console
    out.on('finish', () =>  logger.info('The PNG file was created.\n'));

    await finished(out);
}

run();

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });