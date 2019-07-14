// This is used when embedding this in a larger solution
// Use app.ts for local testing and to build a stand alone solution
const WeatherData = require('./build/weatherdata');
const WeatherImage = require('./build/weatherimage');

const WeatherApi = {
    WeatherData: WeatherData,
    WeatherImage: WeatherImage
}

module.exports = WeatherApi;