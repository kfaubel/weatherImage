const convert = require('xml-js');
const axios = require('axios');

// Onset" https://forecast.weather.gov/MapClick.php?lat=41.7476&lon=-70.6676&FcstType=digitalDWML
// NOLA   https://forecast.weather.gov/MapClick.php?lat=29.9537&lon=-90.0777&FcstType=digitalDWML

// New data source : https://www.weather.gov/documentation/services-web-api
// Not all data is present

module.exports = class WeatherData {
    private lat: string = "";
    private lon: string = "";
    private rainScaleFactor = 1000; // Rain at .2 in/hr will be scaled to 100 (full range)
    private weatherJson: any = null; //
    // private urlTemplate: string = `https://forecast.weather.gov/MapClick.php?lat=${this.lat}&lon=${this.lon}&FcstType=digitalDWML`;  //Onset
    // private url: string = "";
    // private agent: string = "";

    constructor() {
        // this.lat = config.lat;
        // this.lon = config.lon;
        // this.agent = config.agent;

        // this.url = `https://forecast.weather.gov/MapClick.php?lat=${this.lat}&lon=${this.lon}&FcstType=digitalDWML`;
    }

    // time                     "2019-07-08T17:00:00-04:00" weatherJson.dwml.data.time-layout.start-valid-time[i]._text
    // hourly temp              "72"                        weatherJson.dwml.data.parameters.temperature[2].value[i]._text
    // dew point                "58"                        weatherJson.dwml.data.parameters.temperature[0].value[i]._text
    // heat index               "72"                        weatherJson.dwml.data.parameters.temperature[1].value[i]._text
    // cloud cover              "0" - "100"                 weatherJson.dwml.data.parameters.cloud-amount.value[i]._text
    // prob of precip           "0" - "100"                 weatherJson.dwml.data.parameters.probability-of-precipitation.value[i]._text
    // humidity                 "42"                        weatherJson.dwml.data.parameters.humidity.value[i]._text
    // wind speed  sustained    "4"                         weatherJson.dwml.data.parameters.wind-speed[0].value[i]._text  
    // wind speed  gust         ???                         weatherJson.dwml.data.parameters.wind-speed[1].value[i]._text
    // direction (degrees true) "0" - "359"                 weatherJson.dwml.data.parameters.direction.value[i]._text
    // QPF (amount of rain)     "0.0100"                    weatherJson.dwml.data.parameters.hourly-qpf.value[i]._text
    //
    // One data point per hour.
    // for heat index, no index if weatherJson.dwml.data.parameters.temperature[1].value[i]._attributes["xsi:nil"] == "true"
    // for wind gusts, no gusts if weatherJson.dwml.data.parameters.wind-speed[1].value[i]._attributes["xsi:nil"] == "true"

    public timeString (index: number): number {return this.weatherJson.dwml.data["time-layout"]["start-valid-time"][index]._text};
    public temperature(index: number): number {return this.weatherJson.dwml.data.parameters.temperature[2].value[index]._text};
    public dewPoint   (index: number): number {return this.weatherJson.dwml.data.parameters.temperature[0].value[index]._text};
    public cloudCover (index: number): number {return this.weatherJson.dwml.data.parameters["cloud-amount"].value[index]._text};
    public precipProb (index: number): number {return this.weatherJson.dwml.data.parameters["probability-of-precipitation"].value[index]._text};
    public windSpeed  (index: number): number {return this.weatherJson.dwml.data.parameters["wind-speed"][0].value[index]._text};
    public precipAmt  (index: number): number {return this.weatherJson.dwml.data.parameters["hourly-qpf"].value[index]._text};

    public async getWeatherData(config) {
        let weatherXml: string = "";
        if (config.zip !== undefined  && config.mapQuestKey !== undefined) {
            const mapQuestUrl = `http://www.mapquestapi.com/geocoding/v1/address?key=${config.mapQuestKey}&location=${config.zip}`

            await axios.get(mapQuestUrl)
            .then((response: any) => {
                // handle success
                config.lat = response.data.results[0].locations[0].latLng.lat;
                config.lon = response.data.results[0].locations[0].latLng.lng;
            })
            .catch((error: string) => {
                // handle error
                // tslint:disable-next-line:no-console
                console.log("Error: " + error);
                weatherXml = "";
            })
            .finally(() => {
                // always executed
            });
        }

        if (config.lat === undefined || config.lon === undefined) {
            console.log("No lat/lon provided.")
            return null;
        }

        if (Number.isNaN(Number.parseFloat(config.lat)) && Number.isNaN(Number.parseFloat(config.lat))) {
            console.log("Lat/lon are not numbers");
            return null;
        }

        const url = `https://forecast.weather.gov/MapClick.php?lat=${config.lat}&lon=${config.lon}&FcstType=digitalDWML`;
        

        // tslint:disable-next-line:no-console
        console.log("URL: " + url);

        const headers = {
            'Access-Control-Allow-Origin': '*',
            'User-agent': config.agent
        };

        await axios.get(url)
            .then((response: any) => {
                // handle success
                //console.log("Success: " + response.data);
                weatherXml = response.data;
            })
            .catch((error: string) => {
                // handle error
                // tslint:disable-next-line:no-console
                console.log("Error: " + error);
                weatherXml = "";
            })
            .finally(() => {
                // always executed
            });

        if (weatherXml === "") {
            return false;
        }

        let weatherString: string = "";
        try {
            weatherString = convert.xml2json(weatherXml, { compact: true, spaces: 4 });
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.log("XML to JSON failed: " + e);
            return false;
        }

        if (weatherString === "") {
            // tslint:disable-next-line:no-console
            console.log("XML to JSON failed since weatherString is empty: ");
            return false;
        }

        try {
            this.weatherJson = JSON.parse(weatherString);
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.log("Parse JSON failed: " + e);
            return false;
        }

        if (this.weatherJson === undefined) {
            // tslint:disable-next-line:no-console
            console.log("weatherJSON is undefined");
            return false;
        }

        // tslint:disable-next-line:no-console
        // console.log("JSON: " + JSON.stringify(this.weatherJson, null, 4));
        
        // Fix up the rain forcast data: 
        //  - handle nil attributes (missing _text) 
        //  - scale by 1000.
        for (let i: number = 0; i < 120; i++) {
            if (this.weatherJson.dwml.data.parameters["hourly-qpf"].value[i].hasOwnProperty("_text") === true) {
                this.weatherJson.dwml.data.parameters["hourly-qpf"].value[i]._text 
                    = Math.min(this.weatherJson.dwml.data.parameters["hourly-qpf"].value[i]._text * this.rainScaleFactor, 100);
            } else {
                this.weatherJson.dwml.data.parameters["hourly-qpf"].value[i]._text = "0.0";
            }
        }

        return true;
    }
}
