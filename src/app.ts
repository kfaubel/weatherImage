// lib/app.ts
import express = require('express');
const WeatherData = require('./weatherdata');
const WeatherImage = require('./weatherimage');

// Create a new express application instance
async function run() {
    const app: express.Application = express();

    const weatherData = new WeatherData("41.7476", "-77.6676");

    const result: string = await  weatherData.updateData();

    if (!result) {
        console.log("Failed to get data, no image available.")
        return;
    }

    const weatherImage = new WeatherImage(weatherData);

    const stream = weatherImage.getImageStream();

    //console.log("__dirname: " + __dirname);
    const fs = require('fs');
    const out = fs.createWriteStream(__dirname +'/../test.png');

    stream.pipe(out);
    out.on('finish', () =>  console.log('The PNG file was created.'));
}

run();

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });