// lib/app.ts
import express = require('express');
const WeatherData = require('./weatherdata');
const WeatherImage = require('./weatherimage');

// Create a new express application instance
async function run() {
    // const app: express.Application = express();

    const weatherConfig: any = {
        agent: "ken@faubel.org",
        lat: "41.7476",
        lon: "-70.6676",
        title: "Forecast for Onset, MA"
    }

    const weatherImage = new WeatherImage(weatherConfig);

    const imageStream = weatherImage.getImageStream();

    // console.log("__dirname: " + __dirname);
    const fs = require('fs');
    const out = fs.createWriteStream(__dirname +'/../test.png');

    imageStream.pipe(out);
    // tslint:disable-next-line:no-console
    out.on('finish', () =>  console.log('The PNG file was created.\n'));
}

run();

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });