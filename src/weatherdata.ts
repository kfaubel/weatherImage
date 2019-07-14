const convert = require('xml-js');
const axios = require('axios');

// Onset" https://forecast.weather.gov/MapClick.php?lat=41.7476&lon=-70.6676&FcstType=digitalDWML
// NOLA   https://forecast.weather.gov/MapClick.php?lat=29.9537&lon=-90.0777&FcstType=digitalDWML

// New data source : https://www.weather.gov/documentation/services-web-api
// Not all data is present

module.exports = class WeatherData {
    private lat: string = "";
    private lon: string = "";
    private rainScaleFactor = 500; // Rain at .2 in/hr will be scaled to 100 (full range)
    private weatherJson: any = null; //
    //private urlTemplate: string = `https://forecast.weather.gov/MapClick.php?lat=${this.lat}&lon=${this.lon}&FcstType=digitalDWML`;  //Onset
    private url: string = "";
    private agent: string = "";

    constructor(config) {
        this.lat = config.lat;
        this.lon = config.lon;
        this.agent = config.agent;

        this.url = `https://forecast.weather.gov/MapClick.php?lat=${this.lat}&lon=${this.lon}&FcstType=digitalDWML`;
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

    timeString (index: number): number {return this.weatherJson.dwml.data["time-layout"]["start-valid-time"][index]._text};
    temperature(index: number): number {return this.weatherJson.dwml.data.parameters.temperature[2].value[index]._text};
    dewPoint   (index: number): number {return this.weatherJson.dwml.data.parameters.temperature[0].value[index]._text};
    cloudCover (index: number): number {return this.weatherJson.dwml.data.parameters["cloud-amount"].value[index]._text};
    precipProb (index: number): number {return this.weatherJson.dwml.data.parameters["probability-of-precipitation"].value[index]._text};
    windSpeed  (index: number): number {return this.weatherJson.dwml.data.parameters["wind-speed"][0].value[index]._text};
    precipAmt  (index: number): number {return this.weatherJson.dwml.data.parameters["hourly-qpf"].value[index]._text};

    async updateData() {
        let weatherXml: string = "";

        console.log("URL: " + this.url);

        let headers = {
            'User-agent': this.agent,
            'Access-Control-Allow-Origin': '*'
          };
      

        await axios.get(this.url)
            .then(function (response: any) {
                // handle success
                //console.log("Success: " + response.data);
                weatherXml = response.data;
            })
            .catch(function (error: string) {
                // handle error
                console.log("Error: " + error);
                weatherXml = "";
            })
            .finally(function () {
                // always executed
            });

        if (weatherXml === "") {
            return false;
        }

        let weatherString: string = "";
        try {
            weatherString = convert.xml2json(weatherXml, { compact: true, spaces: 4 });
        } catch (e) {
            console.log("XML to JSON failed: " + e);
            return false;
        }

        if (weatherString === "") {
            console.log("XML to JSON failed since weatherString is empty: ");
            return false;
        }

        try {
            this.weatherJson = JSON.parse(weatherString);
        } catch (e) {
            console.log("Parse JSON failed: " + e);
            return false;
        }

        if (this.weatherJson === undefined) {
            console.log("weatherJSON is undefined");
            return false;
        }

        console.log("JSON: " + JSON.stringify(this.weatherJson, null, 4));
        
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


    // Define an array to hold the string before we create the forecast points
    // 0 = time
    // 1 = hourly
    // 2 = dew point
    // 3 = heat index
    // 4 = cloud cover
    // 5 = prob of precip    Defined as floating but we only see 0-100
    // 6 = wind speed
    // 7 = direction (degrees true)
    // 8 = QPF (amount of rain)


//     String[][] allPoints = new String[9][168];
//     for (int i = 0; i <= 8; i++) {
//         for (int j = 0; j < 168; j++) {
//             allPoints[i][j] = "?";
//         }
//     }

//     // Fill a tempo list since the UI thread may still be accessing the old one.
//     ArrayList<DisplayForecastWeekly.ForecastPoint> tempForecastPointsList = new ArrayList<>();


//     int i = 0;
//     // Get all the time strings by looking for start-valid-time
//     try {
//         NodeList nodeList = doc.getElementsByTagName("start-valid-time");

//         if (nodeList != null) {
//             for (i = 0; i < nodeList.getLength(); i++) {
//                 if (i < 168) {
//                     Node node = nodeList.item(i);
//                     allPoints[0][i] = node.getTextContent();
//                 }
//             }
//         }
//     } catch (Exception e) {
//         Klog.e(TAG, "Getting start-valid-time: " + e.toString());
//     }

//     // <temperature type="hourly" time-layout="k-p1h-n1-0">
//     //     <value>65</value>
//     try {
//         String xPathStr = "/dwml/data/parameters/temperature[@type=\"hourly\"]/value";
//         XPathFactory xPathfactory = XPathFactory.newInstance();
//         XPath xpath = xPathfactory.newXPath();
//         XPathExpression expr = xpath.compile(xPathStr);
//         NodeList nodeList = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

//         if (nodeList != null) {
//             for (i = 0; i < nodeList.getLength(); i++) {
//                 if (i < 168) {
//                     Node node = nodeList.item(i);
//                     allPoints[1][i] = node.getTextContent();
//                     //Klog.v(TAG, "hourly[" + i + "]: " + node.getTextContent());
//                 }
//             }
//         }
//     } catch (Exception e) {
//         Klog.e(TAG, "Getting temperature[hourly](" + i + "): " + e.toString());
//     }

//     // <temperature type="dew point" time-layout="k-p1h-n1-0">
//     //     <value>65</value>
//     try {
//         String xPathStr = "/dwml/data/parameters/temperature[@type=\"dew point\"]/value";
//         XPathFactory xPathfactory = XPathFactory.newInstance();
//         XPath xpath = xPathfactory.newXPath();
//         XPathExpression expr = xpath.compile(xPathStr);
//         NodeList nodeList = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

//         if (nodeList != null) {
//             for (i = 0; i < nodeList.getLength(); i++) {
//                 if (i < 168) {
//                     Node node = nodeList.item(i);
//                     allPoints[2][i] = node.getTextContent();
//                 }
//             }
//         }
//     } catch (Exception e) {
//         Klog.e(TAG, "Getting temperature[dew point](" + i + "): : " + e.toString());
//     }

//     // <temperature type="heat index" time-layout="k-p1h-n1-0">
//     //     <value>65</value>
//     try {
//         String xPathStr = "/dwml/data/parameters/temperature[@type=\"heat index\"]/value";
//         XPathFactory xPathfactory = XPathFactory.newInstance();
//         XPath xpath = xPathfactory.newXPath();
//         XPathExpression expr = xpath.compile(xPathStr);
//         NodeList nodeList = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

//         if (nodeList != null) {
//             for (i = 0; i < nodeList.getLength(); i++) {
//                 if (i < 168) {
//                     Node node = nodeList.item(i);
//                     allPoints[3][i] = node.getTextContent();
//                 }
//             }
//         }
//     } catch (Exception e) {
//         Klog.e(TAG, "Getting heat index: " + e.toString());
//         e.printStackTrace();
//     }

//     // <cloud-amount type="total" units="percent" time-layout="k-p1h-n1-0">
//     //     <value>65</value>
//     try {
//         String xPathStr = "/dwml/data/parameters/cloud-amount/value";
//         XPathFactory xPathfactory = XPathFactory.newInstance();
//         XPath xpath = xPathfactory.newXPath();
//         XPathExpression expr = xpath.compile(xPathStr);
//         NodeList nodeList = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

//         if (nodeList != null) {
//             for (i = 0; i < nodeList.getLength(); i++) {
//                 if (i < 168) {
//                     Node node = nodeList.item(i);
//                     allPoints[4][i] = node.getTextContent();
//                 }
//             }
//         }
//     } catch (Exception e) {
//         Klog.e(TAG, "Getting cloud-amount: " + e.toString());
//     }

//     // <probability-of-precipitation type="floating" units="percent" time-layout="k-p1h-n1-0">...</probability-of-precipitation>
//     //     <value>65</value>
//     try {
//         String xPathStr = "/dwml/data/parameters/probability-of-precipitation/value";  //title[@lang='en']"
//         XPathFactory xPathfactory = XPathFactory.newInstance();
//         XPath xpath = xPathfactory.newXPath();
//         XPathExpression expr = xpath.compile(xPathStr);
//         NodeList nodeList = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

//         if (nodeList != null) {
//             for (i = 0; i < nodeList.getLength(); i++) {
//                 if (i < 168) {
//                     Node node = nodeList.item(i);
//                     allPoints[5][i] = node.getTextContent();
//                 }
//             }
//         }
//     } catch (Exception e) {
//         Klog.e(TAG, "Getting temperature[dew point]: " + e.toString());
//     }

//     // <wind-speed type="sustained" time-layout="k-p1h-n1-0">...</wind-speed>
//     //     <value>65</value>
//     try {
//         String xPathStr = "/dwml/data/parameters/wind-speed[@type=\"sustained\"]/value";
//         XPathFactory xPathfactory = XPathFactory.newInstance();
//         XPath xpath = xPathfactory.newXPath();
//         XPathExpression expr = xpath.compile(xPathStr);
//         NodeList nodeList = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

//         if (nodeList != null) {
//             for (i = 0; i < nodeList.getLength(); i++) {
//                 if (i < 168) {
//                     Node node = nodeList.item(i);
//                     allPoints[6][i] = node.getTextContent();
//                 }
//             }
//         }
//     } catch (Exception e) {
//         Klog.e(TAG, "Getting temperature[dew point]: " + e.toString());
//     }

//     // <<direction type="wind" units="degrees true" time-layout="k-p1h-n1-0">
//     //     <value>65</value>
//     try {
//         String xPathStr = "/dwml/data/parameters/direction/value";
//         XPathFactory xPathfactory = XPathFactory.newInstance();
//         XPath xpath = xPathfactory.newXPath();
//         XPathExpression expr = xpath.compile(xPathStr);
//         NodeList nodeList = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

//         if (nodeList != null) {
//             for (i = 0; i < nodeList.getLength(); i++) {
//                 if (i < 168) {
//                     Node node = nodeList.item(i);
//                     allPoints[7][i] = node.getTextContent();
//                 }
//             }
//         }
//     } catch (Exception e) {
//         Klog.e(TAG, "Getting temperature[dew point]: " + e.toString());
//     }

//     // <hourly-qpf type="floating" units="inches" time-layout="k-p1h-n1-0">
//     //   <value>0.0100</value>
//     try {
//         String xPathStr = "/dwml/data/parameters/hourly-qpf/value";
//         XPathFactory xPathfactory = XPathFactory.newInstance();
//         XPath xpath = xPathfactory.newXPath();
//         XPathExpression expr = xpath.compile(xPathStr);
//         NodeList nodeList = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

//         if (nodeList != null) {
//             for (i = 0; i < nodeList.getLength(); i++) {
//                 if (i < 168) {
//                     Node node = nodeList.item(i);
//                     allPoints[8][i] = node.getTextContent();
//                 }
//             }
//         }
//     } catch (Exception e) {
//         Klog.e(TAG, "Getting temperature[dew point]: " + e.toString());
//     }

//     for (i = 0; i < 168; i++) {
//         ForecastPoint point = new ForecastPoint(allPoints[0][i],
//                                                 allPoints[1][i],
//                                                 allPoints[2][i],
//                                                 allPoints[3][i],
//                                                 allPoints[4][i],
//                                                 allPoints[5][i],
//                                                 allPoints[6][i],
//                                                 allPoints[7][i],
//                                                 allPoints[8][i]);
//         tempForecastPointsList.add(i, point);
//     }

//     // Block the UI thread from using trendList while we change it.
//     synchronized(lock) {
//         forecastPointsList = tempForecastPointsList;
//     }
// }
