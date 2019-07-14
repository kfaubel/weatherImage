// This is used when embedding this in a larger solution
// Use app.ts for local testing and to build a stand alone solution
const WeatherApi = {
    WeatherData = require('./build/weatherdata'),
    WeatherImage = require('./build/weatherimage')
}

module.exports = WeatherApi;