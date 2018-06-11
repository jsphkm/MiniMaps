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
    js_file.src = 'https://maps.googleapis.com/maps/api/js?callback=initMap&key=AIzaSyAln4UsUGOrVtX4MGg4e0mGXY2GK-helLE&language=' + lang;
    document.getElementsByTagName('head')[0].appendChild(js_file);
  }
});

function startendlistener(directionsService, directionsDisplay, map){
  var onChangeHandler = function() {
    let start = document.getElementById('start').value
    let end = document.getElementById('end').value
    if (start && end) {
      calculateAndDisplayRoute(directionsService, directionsDisplay);
    }
    else {
      console.log('only one address is typed');
      if (start == '') {
        $('#start').focus();
        if (end) {
          displayOneLocation(end, map);
        }
      }
      else if (end == '') {
        $('#end').focus();
        if (start) {
          displayOneLocation(start, map);
        }
      }
    }
  };
  document.getElementById('start').addEventListener('change', onChangeHandler);
  document.getElementById('end').addEventListener('change', onChangeHandler);
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



var map, infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:34.0522, lng: -118.2437},
    mapTypeControl: false,
    gestureHandling: 'cooperative',
    zoom: 6
  });

  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('listofDirections'));

  var control = document.getElementById('leftpanelcontainer');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(control);

  startendlistener(directionsService, directionsDisplay, map);


  infoWindow = new google.maps.InfoWindow;

  //Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      var icon = {
        url: 'img/bluedot.svg',
        scaledSize: new google.maps.Size(25, 25),
      };

      var userMarker = new google.maps.Marker({
        position: pos,
        map: map,
        icon: icon
      });

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      //infoWindow.open(map, userMarker);

      map.setCenter(pos);
      map.setZoom(16);
    },
    function() {
      handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  }
  else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function displayOneLocation(loc, map){

  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({'address': loc}, function(results, status){
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location
      });
    }
    else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  })
  console.log(loc);
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
  'Error: The Geolocation service failed.' :
  'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var start = document.getElementById('start').value;
  var end = document.getElementById('end').value;
  directionsService.route({
    origin: start,
    destination: end,
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    }
    else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
