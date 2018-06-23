
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

function renderReminderElements(){
  $('.alertmenucontainer').append(generateReminderElements());
  //var inputTimeValue = document.querySelector('input[type="time"]');
  Date.prototype.addMinutes = function(m) {
   this.setTime(this.getTime() + (m*60*1000));
   return this;
  }

  //alert(new Date().addMinutes(30));
  let currentTimePlusHalfHour = new Date().addMinutes(30);
  //let currentTimePlusHalfHour = new Date();
  let currenthours = currentTimePlusHalfHour.getHours();
  let formattedhours = currenthours < 10 ? `0${currenthours}` : currenthours;
  let currentminutes = currentTimePlusHalfHour.getMinutes();
  let formattedminutes = currentminutes < 10 ? `0${currentminutes}` : currentminutes;
  let formattedcurrenttime = `${formattedhours}:${formattedminutes}`
  $('.alerttimeinput').val(formattedcurrenttime);
}



function generateReminderElements(){
  return `
    <div class='alertscontainer'>
      <div class='remindertitle'>Reminder Options</div>
      <img class='alertbellimg' src="img/alertbell.svg" alt="alertbell" />
      <div class='alerttimecontainer'>
        <div class='arrivebycontainer'>
          <span class='arrivebytext'>Arrive By</span>
          <input class='alerttimeinput' type="time" name="alerttime" value="" />
        </div>
        <div class='alertbeforecontainer'>
          <span class='alertbeforetext'>Alert in Advance</span>
          <input class='alertbeforehourinput' type="number" name="beforetime" min='0' max='12' placeholder='0'/>
          <span class='alerthourstext'>Hrs</span>
          <input class='alertbeforeminutesinput' type="number" name="beforetime" min='0' max='59' placeholder='30'/>
          <span class='alerthourstext'>Mins</span>
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

  $(document).on('keyup', 'input', function(e){
    if (e.type == 'keyup' && $('.pac-container').length) {
      $('#listofsuggestions').append($('.pac-container'));
    }
    if (e.keyCode ==  enterkeycode && e.target.type !== 'submit') {
        console.log(e.type);
        onChangeHandler();
        console.log('event enter and focusout');
    }
  })

  function onChangeHandler() {

    resetMap();
    let start = document.getElementById('start').value
    let end = document.getElementById('end').value
    if (start && end) {
      directionsRenderer.setMap(map);
      let maxDuration = renderDirectionServiceAndDuration(directionsService, directionsRenderer);
      //console.log(maxDuration);
      $('.alertmenucontainer').append(renderReminderElements());
      enableBrowserNotification();
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
          routedurationArray.push(response.routes[i].legs[j].duration.value);
          console.log(response.routes[i].legs[j].duration.value);
          console.log('that was the duration value');
        }
      }
      maxDuration = Math.max(...routedurationArray);
      deferred.resolve(maxDuration);
    }
    else {
      deferred.reject(window.alert('Directions request failed due to ' + status));
    }
  });
  console.log(deferred.promise());
  console.log('this is the promise');
  return deferred.promise();
}
