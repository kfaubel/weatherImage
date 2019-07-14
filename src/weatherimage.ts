const { createCanvas, loadImage } = require('canvas');
const WeatherData = require('./weatherdata');

//export function generateImage(wData: any) {
module.exports = class WeatherImage {
    private weatherData: any;

    constructor(weatherData: any) {
        this.weatherData = weatherData;
    }

    public getImageStream() {
        const wData = this.weatherData;
        const imageHeight: number = 1080; //800;
        const imageWidth: number  = 1920; //1280;

        // Screen origin is the upper left corner
        const  chartOriginX = 100;               // In from the left edge
        const  chartOriginY = imageHeight - 80;       // Down from the top (Was: Up from the bottom edge)

        // The chartWidth will be smaller than the imageWidth but must be a multiple of 120
        // The chartHeight will be smaller than the imageHeight but must be a multiple of 100
        const  chartWidth = 1680; // 1080;
        const  chartHeight = 900; //600;

        const  daysToShow = 5;                                        // for 5 days
        const  hoursToShow = daysToShow * 24;                         //   120
        const  verticalGridLines = daysToShow * 4;                    //   20     every 6 hours  (0-20 for 21 total vertical lines)
        const  verticalMajorGridInterval = 4;                         //   4       every 4th vertical lins is a day 
        const  verticalGridSpacing = chartWidth / verticalGridLines;  // horizontal spacing between the vertical lines. 1080 pixels split into 20 chunks
        const  pointsPerHour = chartWidth / hoursToShow;

        const  fullScaleDegrees = 100;
        const  horizontalGridLines = fullScaleDegrees/10;             // The full scale is devided into a grid of 10Each represents 10 degrees, percent or miles per hour
        const  horizontalMajorGridInterval = 100                      // draw lines at 0 and 100
        const  horizontalGridSpacing = chartHeight / horizontalGridLines;  // vertical spacing between the horizontal lines. 600 pixels split into 10 chunks
        const  pointsPerDegree            = chartHeight/100;

        const title: string = 'Title';
        const topLegendLeftIndent = imageWidth - 400;
        

        const largeFont: string = '48px sans-serif';
        const mediumFont: string = '28px sans-serif';

        const regularStroke: number = 3;
        const heavyStroke: number = 6;

        const canvas = createCanvas(imageWidth, imageHeight);
        const ctx = canvas.getContext('2d');

        // Canvas reference
        // origin is upper right
        // coordinates are x, y, width, height in that order
        // to set a color: ctx.fillStyle = 'rgb(255, 255, 0)'
        //                 ctx.fillStyle = 'Red'
        //                 ctx.setFillColor(r, g, b, a);


        // Fill the bitmap
        ctx.fillStyle = 'rgb(0, 0, 50)';
        ctx.fillRect(0, 0, imageWidth, imageHeight);

        // Draw the title
        ctx.fillStyle = 'white';
        ctx.font = largeFont;
        let textWidth: number = ctx.measureText(title).width;
        ctx.fillText(title, (imageWidth - textWidth) / 2, 40);

        // Draw the color key labels        
        ctx.font = mediumFont;

        ctx.fillStyle = 'red';
        ctx.fillText("Temperature", topLegendLeftIndent, 30);

        ctx.fillStyle = 'green';
        ctx.fillText("Dew Point", topLegendLeftIndent, 60);

        ctx.fillStyle = 'yellow';
        ctx.fillText("Wind Speed", topLegendLeftIndent, 90);

        let startX: number;
        let startY: number;
        let endX: number;
        let endY: number;

        // We need to skip past the time that has past today.  Start at current hour.
        const firstHour: number = new Date().getHours(); // 0-23

        // Draw the cloud cover in the background (filled)
        ctx.fillStyle = 'rgb(50, 50, 50)';

        // if there are 120 hours to show, and first hour is 0
        // we want to access wData in the range 0-119
        // since each iteration uses i and i+1, we want to loop from 0-118
        //
        // if we start 10 hours into the day, we will loop from 10-118
        for (let i: number = firstHour; i < (hoursToShow - 1); i++) {
            startX = chartOriginX + i * pointsPerHour;
            endX   = chartOriginX + (i + 1) * pointsPerHour;
            startY = chartOriginY - wData.cloudCover(i) * pointsPerDegree;
            endY   = chartOriginY - wData.cloudCover(i + 1) * pointsPerDegree;

            console.log("Cover: [" + i + "] = " + " StartX: " + startX + " EndX: " + endX);

            ctx.beginPath();
            ctx.moveTo(startX, chartOriginY);          // Start at bottom left
            ctx.lineTo(startX, startY);     // Up to the height of startY
            ctx.lineTo(endX, endY);         // across the top to endY       
            ctx.lineTo(endX, chartOriginY);            // down to the bottom right
            ctx.lineTo(startX, chartOriginY);          // back to the bottom left
            ctx.fill();
        }

        startX = chartOriginX + (hoursToShow -1) * pointsPerHour;
        endX   = chartOriginX + (hoursToShow) * pointsPerHour;
        startY = chartOriginY - wData.cloudCover(hoursToShow - 1) * pointsPerDegree;
        endY   = chartOriginY - wData.cloudCover(hoursToShow) * pointsPerDegree;

        ctx.beginPath();
        ctx.moveTo(startX, chartOriginY);          // Start at bottom left
        ctx.lineTo(startX, startY);     // Up to the height of startY
        ctx.lineTo(endX, endY);         // across the top to endY       
        ctx.lineTo(endX, chartOriginY);            // down to the bottom right
        ctx.lineTo(startX, chartOriginY);          // back to the bottom left
        ctx.fill();




        // Draw the rain amount in the background over the clouds (filled)
        ctx.fillStyle = 'rgb(40, 120, 140)';  // A little more blue

        // if there are 120 hours to show, and first hour is 0
        // we want to access wData in the range 0-119
        // since each iteration uses i and i+1, we want to loop from 0-118
        //
        // if we start 10 hours into the day, we will loop from 10-119
        for (let i: number = firstHour; i <= (hoursToShow - 1); i++) {
            startX = chartOriginX + i * pointsPerHour;
            endX = chartOriginX + (i + 1) * pointsPerHour;
            startY = chartOriginY - wData.precipAmt(i)  * pointsPerDegree;
            endY = chartOriginY - wData.precipAmt(i + 1)  * pointsPerDegree;

            //console.log("Cover: [" + i + "] = " + " StartX: " + startX + " Precip: " + wData.precipAmt(i) + " Y1: " + (chartOriginY - startY) + " Y2: " + (chartOriginY - endY));

            ctx.beginPath();
            ctx.moveTo(startX, chartOriginY);          // Start at bottom left
            ctx.lineTo(startX, startY);     // Up to the height of startY
            ctx.lineTo(endX, endY);         // across the top to endY       
            ctx.lineTo(endX, chartOriginY);            // down to the bottom right
            ctx.lineTo(startX, chartOriginY);          // back to the bottom left
            ctx.fill();
        }

        startX = chartOriginX + (hoursToShow -1) * pointsPerHour;
        endX   = chartOriginX + (hoursToShow) * pointsPerHour;
        startY = chartOriginY - wData.precipAmt(hoursToShow - 1) * pointsPerDegree;
        endY   = chartOriginY - wData.precipAmt(hoursToShow) * pointsPerDegree;

        ctx.beginPath();
        ctx.moveTo(startX, chartOriginY);          // Start at bottom left
        ctx.lineTo(startX, startY);     // Up to the height of startY
        ctx.lineTo(endX, endY);         // across the top to endY       
        ctx.lineTo(endX, chartOriginY);            // down to the bottom right
        ctx.lineTo(startX, chartOriginY);          // back to the bottom left
        ctx.fill();

        // Draw the grid lines
        ctx.strokeStyle = 'rgb(100, 100, 100)';

        // Draw the vertical lines
        ctx.lineWidth = regularStroke;
        for (let i: number = 0; i <= verticalGridLines; i++) {
            startX = chartOriginX + (i * verticalGridSpacing);
            endX = chartOriginX + (i * verticalGridSpacing);
            startY = chartOriginY;
            endY = chartOriginY - (chartHeight);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Draw the major vertical lines
        ctx.lineWidth = heavyStroke;
        for (let i: number = 0; i <= verticalGridLines; i += verticalMajorGridInterval) {
            startX = chartOriginX + (i * verticalGridSpacing);
            endX = chartOriginX + (i * verticalGridSpacing);
            startY = chartOriginY;
            endY = chartOriginY - (chartHeight);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Draw the horizontal lines
        ctx.lineWidth = regularStroke;
        for (let i: number = 0; i <= horizontalGridLines; i++) {
            startX = chartOriginX;
            endX = chartOriginX + chartWidth;
            startY = chartOriginY - (i * horizontalGridSpacing);
            endY = chartOriginY - (i * horizontalGridSpacing);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Draw the major horizontal lines (typically at 0 and 100)
        ctx.lineWidth = heavyStroke;
        for (let i: number = 0; i <= horizontalGridLines; i += horizontalMajorGridInterval) {
            startX = chartOriginX;
            endX = chartOriginX + chartWidth;
            startY = chartOriginY - (i * horizontalGridSpacing);
            endY = chartOriginY - (i * horizontalGridSpacing);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Draw an orange line at 75 degrees
        ctx.strokeStyle = 'orange';
        startX = chartOriginX;
        endX = chartOriginX + chartWidth;
        startY = chartOriginY - (horizontalGridSpacing * 75) / 10;
        endY = chartOriginY - (horizontalGridSpacing * 75) / 10;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw an blue line at 32 degrees
        ctx.strokeStyle = 'rgb(0, 0, 200)';
        startX = chartOriginX;
        endX = chartOriginX + chartWidth;
        startY = chartOriginY - (horizontalGridSpacing * 32) / 10;
        endY = chartOriginY - (horizontalGridSpacing * 32) / 10;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw the axis labels
        ctx.font = mediumFont;
        ctx.fillStyle = 'rgb(200, 200, 200)';

        for (let i: number = 0; i <= horizontalGridLines; i++) {
            // i = 0, 1 ..10    labelString = "0", "10" .. "100"
            let labelString: string = (i * (fullScaleDegrees/horizontalGridLines)).toString(); 

            let labelStringWdth: number = ctx.measureText(labelString).width;
            let x: number = chartOriginX - 50;
            let y: number = chartOriginY + 10 - (i * horizontalGridSpacing);
            ctx.fillText(labelString, x - labelStringWdth / 2, y);
            console.log("Label: " + labelString + " at X: " + x + " Y: " + y)
        }       

        let weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i: number = 0; i < (hoursToShow / 24); i++) {
            let date = new Date(Date.parse(wData.timeString(i * 24)));
            let dayStr: string = weekday[date.getDay()];
            let dayStrWdth: number = ctx.measureText(dayStr).width;


            let x: number = chartOriginX + (i * 4 + 2) * verticalGridSpacing;
            let y: number = chartOriginY + 40;

            ctx.fillText(dayStr, x - dayStrWdth / 2, y);
        }

        ctx.lineWidth = heavyStroke;

        // Deaw the temperature line
        ctx.strokeStyle = 'rgb(255, 40, 40)';
        ctx.beginPath();
        ctx.moveTo(chartOriginX + pointsPerHour * firstHour, chartOriginY - (wData.temperature(0) * chartHeight) / fullScaleDegrees);
        for (let i: number =  0; i <= (hoursToShow - firstHour - 1); i++) {
            ctx.lineTo(chartOriginX + pointsPerHour * (i + firstHour), chartOriginY - (wData.temperature(i) * chartHeight) / fullScaleDegrees);
        }
        ctx.lineTo(chartOriginX + pointsPerHour * hoursToShow, chartOriginY - (wData.temperature(hoursToShow - firstHour) * chartHeight) / fullScaleDegrees);
        ctx.stroke();

        // Deaw the dew point line
        ctx.strokeStyle = 'rgb(140, 240, 0)';
        ctx.beginPath();
        ctx.moveTo(chartOriginX + pointsPerHour * firstHour, chartOriginY - (wData.dewPoint(0) * chartHeight) / fullScaleDegrees);
        for (let i: number =  0; i <= (hoursToShow - firstHour - 1); i++) {
            ctx.lineTo(chartOriginX + pointsPerHour * (i + firstHour), chartOriginY - (wData.dewPoint(i) * chartHeight) / fullScaleDegrees);
        }
        ctx.lineTo(chartOriginX + pointsPerHour * hoursToShow, chartOriginY - (wData.dewPoint(hoursToShow - firstHour) * chartHeight) / fullScaleDegrees);        
        ctx.stroke();

        // Deaw the wind speed line
        ctx.strokeStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(chartOriginX + pointsPerHour * firstHour, chartOriginY - (wData.windSpeed(firstHour) * chartHeight) / fullScaleDegrees);
        for (let i: number =  0; i <= (hoursToShow - firstHour - 1); i++) {
            ctx.lineTo(chartOriginX + pointsPerHour * (i + firstHour), chartOriginY - (wData.windSpeed(i) * chartHeight) / fullScaleDegrees);
        }
        ctx.lineTo(chartOriginX + pointsPerHour * hoursToShow, chartOriginY - (wData.windSpeed(hoursToShow - firstHour) * chartHeight) / fullScaleDegrees);
        ctx.stroke();




        // PNG-encoded, zlib compression level 3 for faster compression but bigger files, no filtering
        //const buf2 = canvas.toBuffer('image/png', { compressionLevel: 3, filters: canvas.PNG_FILTER_NONE })
        return canvas.createPNGStream();
    }
}
