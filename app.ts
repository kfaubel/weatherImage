// lib/app.ts
import express = require('express');
const WeatherData = require('./build/weatherdata');
const WeatherImage = require('./build/weatherimage');

// Create a new express application instance
async function run() {
    const app: express.Application = express();

    console.log(WeatherData);

    const weatherData = new WeatherData("lat-lon");

    await weatherData.updateData();

    const weatherImage = new WeatherImage(weatherData);

    const stream = weatherImage.getImageStream();




    const fs = require('fs');
    const out = fs.createWriteStream(__dirname + '/test.png');

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