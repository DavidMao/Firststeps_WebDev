"use strict";
var weather = (function(self, $) {
  ////////////////////////////////
  // Globals
  ////////////////////////////////
  var apiKey = '6d05918df78bd79bb525d1ceb521cb63';

  var loc_name = "SEATTLE, WA";
  var lati = 47.61167908;
  var longi = -122.33325958;

  var fullTable = true;
  var hourlyData;
  var dailyData;

  ////////////////////////////////
  // Icon stuff
  ////////////////////////////////
  var skycons = new Skycons({
    color: '#fff'
  });

  ////////////////////////////////
  // Location stuff
  ////////////////////////////////
  function checkGeolocationAndRun() {
    if ($('#useGeolocation').text() === 'YES') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updatePosition, showError);
      } else {
        $(function() {
          $('#error_dialog').html('Geolocation is not supported by this browser. Defaulting to Seattle.');
          $('#error_dialog').dialog();
        });
        displayLocation(false);
        run();
      }
    } else {
      displayLocation(false);
      run();
    }
  }

  function displayLocation(usingGeolocation) {
    if (usingGeolocation) {
      var geocoder = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng(lati,longi);

      geocoder.geocode({latLng: latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {

          var cityFound = false;
          var stateFound = false;
          var cityName = '';
          var stateName = '';

          if (results !== null) {
            for (var i = 0; i < results.length; i++) {
              for (var j = 0; j < results[i].address_components.length; j++) {
                for (var k = 0; k < results[i].address_components[j].types.length; k++) {
                  if (results[i].address_components[j].types[k] === 'locality') {
                    cityName = results[i].address_components[j].long_name;
                    cityFound = true;
                  }
                  if (results[i].address_components[j].types[k] === 'administrative_area_level_1') {
                    stateName = results[i].address_components[j].short_name;
                    stateFound = true;
                  }
                }
              }
            }
            if (cityFound) {
              loc_name = cityName;
              if (stateFound && cityName !== stateName) {
                loc_name += ', ' + stateName;
              }
            } else {
              loc_name = '';
            }
          }
        } else {
          console.log('Reverse Geocode failed.');
          loc_name = '';
        }
        $('#locationName').html(loc_name);
      });
    } else {
      $('#locationName').html(loc_name);
    }
  }

  function showError(error) {
    var errorString = '';
    var errorStringList = {
      PERMISSION_DENIED: 'User denied the request for Geolocation. Defaulting to Seattle.',
      POSITION_UNAVAILABLE: 'Location information is unavailable. Defaulting to Seattle.',
      TIMEOUT: 'The request to get user location timed out. Defaulting to Seattle.',
      UNKNOWN_ERROR: 'An unknown error occurred. Defaulting to Seattle.'
    }
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorString = errorStringList.PERMISSION_DENIED;
        break;
      case error.POSITION_UNAVAILABLE:
        errorString = errorStringList.POSITION_UNAVAILABLE;
        break;
      case error.TIMEOUT:
        errorString = errorStringList.TIMEOUT;
        break;
      case error.UNKNOWN_ERROR:
        errorString = errorStringList.UNKNOWN_ERROR;
        break;
    }
    $(function() {
      $('#error_dialog').html(errorString);
      $('#error_dialog').dialog();
    });
    displayLocation(false);
    run();
  }

  function updatePosition(position) {
    lati = position.coords.latitude;
    longi = position.coords.longitude;
    displayLocation(true);
    run();
  }

  ////////////////////////////////
  // Main
  ////////////////////////////////

  function run() {
    $.ajax({
      url: 'https://api.forecast.io/forecast/' + apiKey + '/' + lati + ',' + longi,
      dataType: 'jsonp',
      success: function(json) {
        var currData = json.currently;
        hourlyData = json.hourly.data;
        dailyData = json.daily.data;

        // Background
        displayBackground(currData.icon);

        // currently
        displayCurrently(currData, dailyData[0]);

        // display hourly and daily forecast
        displayTables(true);
      }
    });
    skycons.play();
  }

  function convertEpoch(epoch) {
    var date = new Date(parseFloat(epoch + '000'));
    var readableDate = date.getMonth() + 1 + '.' +
        date.getDate() + '.' +
        date.getFullYear();
    var hoursRaw = date.getHours();
    var hours = ((hoursRaw+11) % 12) + 1;
    var amPm = date.getHours() > 11 ? 'PM' : 'AM';
    var rawMin = date.getMinutes();
    var minutes = rawMin > 9 ? rawMin : '0' + rawMin;
    var readableTime = hours + ':' + minutes + amPm;

    var weekdayShort = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

    var weekdayLong = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    var dateTime = {};
    dateTime.date = readableDate;
    dateTime.time = readableTime;
    dateTime.hours = hours + amPm;
    dateTime.dayShort = weekdayShort[date.getDay()];
    dateTime.dayLong = weekdayLong[date.getDay()];

    return dateTime;
  }

  function displayBackground(icon) {
    var backgrounds = {};
    backgrounds['clear-day'] = '../../img/weather/clear-day.jpg';
    backgrounds['clear-night'] = '../../img/weather/clear-night.jpg';
    backgrounds.rain = '../../img/weather/rain_2.jpg';
    backgrounds.snow = '../../img/weather/snow.jpg';
    backgrounds.sleet = '../../img/weather/snow.jpg';
    backgrounds.wind = '../../img/weather/cloudy_1.jpg';
    backgrounds.fog = '../../img/weather/cloudy_1.jpg';
    backgrounds.cloudy = '../../img/weather/cloudy_1.jpg';
    backgrounds['partly-cloudy-day'] = '../../img/weather/cloudy_1.jpg';
    backgrounds['partly-cloudy-night'] = '../../img/weather/night.jpg';

    $('.background').css('backgroundImage', 'url(' + backgrounds[icon] + ')');
  }

  function displayCurrently(currRaw, dailyRaw) {
    var dateTime = convertEpoch(currRaw.time);
    var currIcon = currRaw.icon;
    var currTime = dateTime.dayLong + ' ' + dateTime.date;
    var currSummary = currRaw.summary;
    var currTemp = Math.round(currRaw.temperature) + '&#176;F';
    var currAppTemp = Math.round(currRaw.apparentTemperature * 10)/10 + '&#176;F';
    var currPrecipProbInt = Math.round(currRaw.precipProbability * 100);
    var currPrecipProb = currPrecipProbInt + '%';
    var currPrecipIntensity = Math.round(currRaw.precipIntensity * 1000)/1000;
    var currPrecipType = (currPrecipProbInt > 0) ? currRaw.precipType : 'none';
    var currWindSpeed = Math.round(currRaw.windSpeed * 100)/100 + 'MPH';
    var sunriseTime = convertEpoch(dailyRaw.sunriseTime).time;
    var sunsetTime = convertEpoch(dailyRaw.sunsetTime).time;

    skycons.set('currWeatherIcon', currIcon);

    $('#currDateTime').html(currTime);
    $('#currSummary').html(currSummary);
    $('#currTemp').html(currTemp);

    $('#currApparentTemp').html(currAppTemp);
    $('#currPrecipProb').html(currPrecipProb);

    if (currPrecipProbInt > 0) {
      $('#currPrecipTypeLabel').html(' Type: ');
      $('#currPrecipType').html(currPrecipType);

      $('#currPrecipIntensityLabel').html(' Intensity: ');
      $('#currPrecipIntensity').html(currPrecipIntensity);
    }
    $('#currWindSpeed').html(currWindSpeed);
    $('#sunRiseSetTime').html(sunriseTime + ' | ' + sunsetTime);
  }

  function displayHourly() {
    var hourlyHourArray = [];
    var hourlyTempArray = [];
    var hourlyPrecipProbArray = [];
    var hourlyPrecipTypeArray = [];

    for (var i = 0; i <= 21; i=i+3) {
      hourlyHourArray.push(convertEpoch(hourlyData[i].time).hours);
      hourlyTempArray.push(Math.round(hourlyData[i].apparentTemperature) + '&#176;F');
      var hourlyPrecipProb = Math.round(hourlyData[i].precipProbability * 100);
      hourlyPrecipTypeArray.push((hourlyPrecipProb > 0) ? hourlyData[i].precipType : 'none');
      hourlyPrecipProb += '%';
      hourlyPrecipProbArray.push(hourlyPrecipProb);
    }

    var numCol = (fullTable) ? hourlyHourArray.length : hourlyHourArray.length/2;
    var r = [], j = -1;
    r[++j] = '<tr>';
    for (var i = 0; i < numCol; i++) {
      r[++j] = '<td class="tableHead">' + hourlyHourArray[i] + '</td>';
    }
    r[++j] = '</tr><tr>';
    for (var i = 0; i < numCol; i++) {
      r[++j] = '<td>' + hourlyTempArray[i] + '</td>';
    }
    r[++j] = '</tr><tr>';
    for (var i = 0; i < numCol; i++) {
      r[++j] = '<td>' + hourlyPrecipProbArray[i] + '</td>';
    }
    r[++j] = '</tr>';
    $('#hourlyConditions').html(r.join(''));
  }

  function displayDaily() {
    var dailyDayArray = [];
    var dailyIconArray = [];
    var dailyTempHighArray = [];
    var dailyTempLowArray = [];
    var dailyPrecipProbArray = [];
    var dailyPrecipTypeArray = [];

    for (var i = 0; i < dailyData.length; i++) {
      dailyDayArray.push(convertEpoch(dailyData[i].time).dayShort);
      dailyIconArray.push(dailyData[i].icon);
      dailyTempHighArray.push(Math.round(dailyData[i].apparentTemperatureMax) + '&#176;F');
      dailyTempLowArray.push(Math.round(dailyData[i].apparentTemperatureMin) + '&#176;F');
      var dailyPrecipProb = Math.round(dailyData[i].precipProbability * 100);
      dailyPrecipTypeArray.push((dailyPrecipProb > 0) ? dailyData[i].precipType : 'none');
      dailyPrecipProb += '%';
      dailyPrecipProbArray.push(dailyPrecipProb);
    }

    var DAILY_ICON_TEXT = 'dailyIcon';

    var numCol = (fullTable) ? dailyDayArray.length : dailyDayArray.length/2;
    var r = [], j = -1;
    r[++j] = '<tr>';
    for (var i = 0; i < numCol; i++) {
      r[++j] = '<td class="tableHead">' + dailyDayArray[i] + '</td>';
    }
    r[++j] = '</tr><tr>';
    for (var i = 0; i < numCol; i++) {
      r[++j] = '<td><canvas id="' + DAILY_ICON_TEXT + i + '"width="50" height="50"></canvas></td>';
    }
    r[++j] = '</tr><tr>';
    for (var i = 0; i < numCol; i++) {
      r[++j] = '<td>' + dailyTempHighArray[i] + ' | ' + dailyPrecipProbArray[i] + '</td>';
    }
    r[++j] = '</tr>';
    $('#dailyConditions').html(r.join(''));

    for (var i = 0; i < numCol; i++) {
      skycons.set(DAILY_ICON_TEXT+i, dailyIconArray[i]);
    }
  }

  function displayTables(isNewLoad) {
    var width = $( window ).width();
    if (isNewLoad) {
      fullTable = (width > 600);
    } else {
      if (width > 600 && fullTable === false) {
        fullTable = true;
      } else if (width < 600 && fullTable === true) {
        fullTable = false;
      } else {
        return;
      }
    }
    displayHourly();
    displayDaily();
  }

  $( document ).ready(function() {
    checkGeolocationAndRun();
  });

  ////////////////////////////////
  // Window Handlers
  ////////////////////////////////

  $( window ).resize(function() {
    displayTables(false);
  });

  return self;
}(weather || {}, jQuery));
