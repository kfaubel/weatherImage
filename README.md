# WeatherImage
Generate a weather image for a given (US) location using NWS data.  This image is particualry useful if you have a photo frame that can take a list of URLs for the images you want to see.  

I particualry like this way to visualize five days of weather in a single glance. 
* The red line is the temperature.
* The green is the dew point
* The yellow is the wind speed (mph)
* The daily highs and the daily lows are easy to see as a trend.  
* The orange reference line is 75F or the middle of the comfort range
* The blue reference line is 32F for freezing 
* The gray background shows the cloud cover
* The dark blue in the background shows the likelyhood of precipitaiton (0-100%)
* The light blue in the background shows the amount of rain.

I also find the dew point to be a better indication of comfort than humitity.  At night as the temperature cools and approaches the dew point the relative humitity increases.  During the day the difference increases so the relative humidity actualy decreases even though it is hotter.

### Dew Point
* <60 comfortable
* 60-65 sticky
* 65-70 uncomfortable
* 70-75 oppresive
* 75+ miserable

## Install
```
git clone https://github.com/kfaubel/weatherImage.git

npm install

npm start # Runs the app.ts file with embedded parameters
```
# Usage
## Lat/lon
This generates a 1920x1080 image that has a 5 day forecast for the given lat/lon.  

This can be used as a component by importing WeatherImage and calling getImageStream
and then piping the stream to a file or anywhere else.
```
const WeatherImage = require('./weatherimage');
    ...
    const weatherConfig: any = {
        agent: "user@domain.com",
        lat: "41.7476",
        lon: "-70.6676",
        title: "Forecast for Onset, MA"
    }

    const weatherImage = new WeatherImage();

    const imageStream = await weatherImage.getImageStream(weatherConfig);
    
```

## Zip code
The second form takes a zip code but requires a (free) mapquest key.
```
const WeatherImage = require('./weatherimage');
    ...
    const weatherConfig: any = {
        agent: "user@domain.com",
        zip: "02558",
        mapQuestKey: mapQuestKey.mapQuestKey,
        title: "Forecast for Onset, MA"
    }

    const weatherImage = new WeatherImage();

    const imageStream = await weatherImage.getImageStream(weatherConfig);
    
```
# Sample
The app.ts file is helpful to try it out.

You can just use the index.js file as a component of a bigger 
solution.

# Feedback
Feedback is always welcome.
