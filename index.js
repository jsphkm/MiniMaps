
document.addEventListener('DOMContentLoaded', function () {

  $('#start').focus();
  if (document.querySelectorAll('#map').length > 0)
  {
    if (document.querySelector('html').lang)
      lang = document.querySelector('html').lang;
    else
      lang = 'en';

    var js_file = document.createElement('script');
    js_file.type = 'text/javascript';
    js_file.src = 'https://maps.googleapis.com/maps/api/js?callback=initMap&key=AIzaSyAln4UsUGOrVtX4MGg4e0mGXY2GK-helLE&libraries=places&language=' + lang;
    document.getElementsByTagName('head')[0].appendChild(js_file);
    toggleLeftPanel();
  }
});

function toggleLeftPanel() {
  $('.sideflapbutton').click(function(e) {
    e.preventDefault();
    $('#map').toggleClass('mapoverflow');
    $('.leftpanelcontainer').toggleClass('leftpanelcollapsed');
  });
}

function arrowkeyboardcontrolHandler() {
  $(document).on('focusin', '.leftpanelcontainer', function(e){
    map.set('keyboardShortcuts', false);
  });
  $(document).on('blur', '.leftpanelcontainer', function(e){
    map.set('keyboardShortcuts', true);
  });

}

function enableBrowserNotification(){

  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.');
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
}

function renderReminderElements(maxDurationTime){
  $('.remindercontainer').append(generateReminderElements());
  $('.alerthourstext').on('click', event => {
    $('.alertbeforeinput').focus();
  });
  Date.prototype.addMinutes = function(m) {
    this.setTime(this.getTime() + (m*60*1000));
    return this;
  }

  Date.prototype.addDuration = function(m) {
    console.log(m);
    this.setTime(this.getTime() + (m));
    return this;
  }

  let currentTime = new Date();
  let currentTimePlusHalfHour = currentTime.addMinutes(30);
  console.log(`currentTimePlusHalfHour: ${currentTimePlusHalfHour}`);
  let arrivalTime = currentTimePlusHalfHour.addDuration(maxDurationTime);
  console.log(`arrivalTime: ${arrivalTime}`);
  let currenthours = currentTimePlusHalfHour.getHours();
  let formattedhours = currenthours < 10 ? `0${currenthours}` : currenthours;
  let currentminutes = currentTimePlusHalfHour.getMinutes();
  let formattedminutes = currentminutes < 10 ? `0${currentminutes}` : currentminutes;
  let formattedcurrenttime = `${formattedhours}:${formattedminutes}`
  $('.alerttimeinput').val(formattedcurrenttime);

  let preptime = $('.alertbeforeinput').val();
  $('.minutetext').text(preptime.toString());
  // $('.leavetime').text(currentTimePlusHalfHour);
  const departTime = new Date(currentTime - (maxDurationTime));
  let departhours = departTime.getHours();
  let formatteddeparthours = departhours < 10 ? `0${departhours}` : departhours;
  let ampm = departhours >= 12 ? 'PM' : 'AM';
  let departminutes = departTime.getMinutes();
  let formatteddepartminutes = departminutes < 10 ? `0${departminutes}` : departminutes;
  let formatteddeparttime = `${formatteddeparthours}:${formatteddepartminutes} ${ampm}`
  $('.leavetime').text(formatteddeparttime);

  $('.timeinput').on('input', event => {
    let arrivaltime = $('.alerttimeinput').val();
    let preptime = $('.alertbeforeinput').val();
    $('.minutetext').text(preptime.toString());
    currentTime.setHours(`${arrivaltime[0]}${arrivaltime[1]}`);
    currentTime.setMinutes(`${arrivaltime[3]}${arrivaltime[4]}`);
    const departTime = new Date(currentTime - (maxDurationTime));
    let departhours = departTime.getHours();
    let formatteddeparthours = departhours < 10 ? `0${departhours}` : departhours;
    let ampm = departhours >= 12 ? 'PM' : 'AM';
    let departminutes = departTime.getMinutes();
    let formatteddepartminutes = departminutes < 10 ? `0${departminutes}` : departminutes;
    let formatteddeparttime = `${formatteddeparthours}:${formatteddepartminutes} ${ampm}`
    $('.leavetime').text(formatteddeparttime);
  })
}



function generateReminderElements(){
  return `
    <div class='alertscontainer'>
      <div class='alertheadercontainer'>
        <div class='remindertitle'>Reminder Options</div>
        <div class='turnon'>
          TURN ON
        </div>
      </div>
      <div class='alerttimecontainer'>
        <div class='arrivebycontainer'>
          <span class='arrivebytext'>Arrival</span>
          <div class='arrivalinputcontainer'>
            <input class='alerttimeinput timeinput' type="time" name="alerttime" value="" />
            <span class='inputunderline'></span>
          </div>
          <span class='alertbeforetext'>Alert</span>
          <div class='alertinputcontainer'>
            <input class='alertbeforeinput timeinput' type="number" name="beforetime" min='0' max='720' placeholder='MM' value="30"/>
            <span class='alerthourstext'>Mins</span>
            <span class='inputunderline'></span>
          </div>
        </div>
        <div class='alertdescription'>
          <span class='youwillreceive'>
            You will receive a
          </span>
          <span class='minutetext'>
          </span>
          <span class='reminderat'>
            mins reminder to leave by
          </span>
          <span class='leavetime'>
          </span>
        </div>
      </div>
    </div>
  `
}


var map, infoWindow;
var markers = [];
var yourlocationmarker;
let enterkeycode = 13;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:34.0522, lng: -118.2437},
    mapTypeControl: false,
    gestureHandling: 'cooperative',
    zoom: 6
  });

  var directionsService = new google.maps.DirectionsService;
  var directionsRenderer = new google.maps.DirectionsRenderer;
  directionsRenderer.setPanel(document.getElementById('listofdirections'));

  var originInput = document.getElementById('start');
  var destinationInput = document.getElementById('end');

  var originAutocomplete = new google.maps.places.Autocomplete(originInput);
  var destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);

  $('#listofsuggestions').append(originAutocomplete);
  $('#listofsuggestions').append(destinationAutocomplete);

  var control = document.getElementById('leftpanelcontainer');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(control);
  infoWindow = new google.maps.InfoWindow;

  startendlistener(directionsService, directionsRenderer, originAutocomplete, destinationAutocomplete);

  renderYourLocationButton();
  arrowkeyboardcontrolHandler();
}


function renderYourLocationButton(){
  var controlDiv = document.createElement('div');
  var firstChild = document.createElement('button');
  firstChild.id = 'yourlocButton';
  firstChild.title = 'Your Location';
  controlDiv.appendChild(firstChild);

  var secondChild = document.createElement('div');
  secondChild.id = 'yourlocImg';
  firstChild.appendChild(secondChild);

  google.maps.event.addListener(map, 'dragend', function() {
    $('#yourlocImg').css('background-position', '0px 0px');
  });

  firstChild.addEventListener('click', function(){
    var imgX = '0';
    var animationInterval = setInterval(function(){
      if(imgX == '-18') imgX = '0';
      else imgX = '-18';
      $('#yourlocImg').css('background-position', imgX + 'px 0px');
    }, 500);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        var icon = {
          url: 'img/bluedot.svg',
          scaledSize: new google.maps.Size(25, 25),
        };

        if (!yourlocationmarker) {
          var userMarker = new google.maps.Marker({
            position: pos,
            map: map,
            icon: icon
          });
          yourlocationmarker = userMarker;
        }
        else {
          yourlocationmarker.setMap(null);
          var userMarker = new google.maps.Marker({
            position: pos,
            map: map,
            icon: icon
          });
          yourlocationmarker = userMarker;
        }


        map.setCenter(latlng);
        map.setZoom(16);
        clearInterval(animationInterval);
        $('#yourlocImg').css('background-position', '-144px 0px');
      },
      function() {
        handleLocationError(true, infoWindow, map.getCenter());
      });
    }
    else {
      clearInterval(animationInterval);
      $('#yourlocImg').css('background-position', '0px 0px');
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });

  controlDiv.index = 1;
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
}

function startendlistener(directionsService, directionsRenderer, originAutocomplete, destinationAutocomplete){

  $(document).on('keyup', '.addressinput', function(e){
    if (e.type == 'keyup' && $('.pac-container').length) {
      $('#listofsuggestions').append($('.pac-container'));
    }
    if (e.keyCode ==  enterkeycode && e.target.type !== 'submit') {
        console.log(e.type);
        onChangeHandler();
    }
  })

  function onChangeHandler() {

    resetMap();
    let start = document.getElementById('start').value
    let end = document.getElementById('end').value
    if (start && end) {
      directionsRenderer.setMap(map);
      let foo = renderDirectionServiceAndDuration(directionsService, directionsRenderer);
      foo.then( maxDurationTime => {
        $('.remindercontainer').html("");
        //$('.remindercontainer').append(renderReminderElements());
        renderReminderElements(maxDurationTime);
        enableBrowserNotification();
      })

    }
    else {
      directionsRenderer.setMap(null);
      directionsRenderer.set('directions', null);
      if (start == '') {
        $('#start').focus();
        if (end) {
          displayOneLocation(end, directionsRenderer);
        }
      }
      else if (end == '') {
        $('#end').focus();
        if (start) {
          displayOneLocation(start, directionsRenderer);
        }
      }
      else {
        $('#start').focus();
      }
    }
  };
}


function resetMap() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

var transmodeElements = document.getElementsByClassName('transmodebutton');
for (let i = 0; i < transmodeElements.length; i++) {
  transmodeElements[i].addEventListener("click", function() {
    $("#start").focus();
  })
}

$('.transmodebutton').on('click', function() {
  $(this).toggleClass('selectedmode');
  $(this).prop('checked', true);
})

$('.reversebutton').on('click', function() {
  let start = $('#start').val();
  let end = $('#end').val();
  $('#start').val(end);
  $('#end').val(start);
  start = $('#start').val();
  end = $('#end').val();
  if (start == '') {
    $('#start').focus();
  }
  else if (end == '') {
    $('#end').focus();
  }
})


function displayOneLocation(loc, directionsRenderer){

  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({'address': loc}, function(results, status){
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location
      });

      map.setZoom(16)
      map.panTo(marker.position);
      markers.push(marker);
    }
    else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  })
}


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
  'Error: The Geolocation service failed.' :
  'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

function renderDirectionServiceAndDuration(directionsService, directionsRenderer) {

  let routedurationArray = [];
  var deferred = $.Deferred();
  let maxDuration;

  var start = document.getElementById('start').value;
  var end = document.getElementById('end').value;
  directionsService.route({
    origin: start,
    destination: end,
    travelMode: 'DRIVING',
    provideRouteAlternatives: true
  }, function(response, status) {
    if (status === 'OK') {
      directionsRenderer.setDirections(response);
      for (let i = 0; i < response.routes.length; i++){
        for (let j = 0; j < response.routes[i].legs.length; j++){
          //routedurationArray.push(response.routes[i].legs[j].duration.value);
          let splitduration = response.routes[i].legs[j].duration.text.split(' ');
          let days = splitduration[splitduration.findIndex(a => a === 'days' || a === 'day') - 1];
          let hours = splitduration[splitduration.findIndex(a => a === 'hours' || a === 'hour') - 1];
          let mins = splitduration[splitduration.findIndex(a => a === 'mins' || a === 'min') - 1];

          let converteddays;
          let convertedhours;
          let convertedmins;
          days ? converteddays = days*24*60*60*1000 : converteddays = 0;
          hours ? convertedhours = hours*60*60*1000 : convertedhours = 0;
          mins ? convertedmins = mins*60*1000 : convertedmins = 0;
          let routeduration = converteddays + convertedhours + convertedmins;
          routedurationArray.push(routeduration);
        }
      }
      console.log(routedurationArray);
      maxDuration = Math.max(...routedurationArray);
      deferred.resolve(maxDuration);
    }
    else {
      window.alert('Directions request failed due to ' + status);
      deferred.reject(0);
    }
  });
  return deferred.promise();
}
