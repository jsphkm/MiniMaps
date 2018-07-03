function loadGoogleJS(){
  $('#topsearchinput').focus();
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
  }
}

var map;
var markers = [];
var yourlocationmarker;
let enterkeycode = 13;
let downarrowkeycode = 40;
//let customstartingPos;
let geoPos;
let start;
let end;
let directionsService;
let directionsRenderer;
let msAverageDuration;
let msTrafficDuration;
let latlng;
let directionserviceData;
let startingPlaceData;
let endingPlaceData;
let icon;
let icons;
let startingIdKeeper;
let endingIdKeeper;
let currentstartingId;
let currentendingId

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:34.0522, lng: -118.2437},
    mapTypeControl: false,
    gestureHandling: 'cooperative',
    zoom: 6,
    disableDefaultUI: true,
    keyboardShortcuts: true
  });

  icon = {
    url: 'img/bluedot.svg',
    scaledSize: new google.maps.Size(25, 25),
  };

  icons = {
    start: {
      url: 'img/departdot.svg',
      scaledSize: new google.maps.Size(20, 20),
      },
    end: {
      url: 'img/redpin.svg',
      scaledSize: new google.maps.Size(40, 40),
      }
  };

  directionsService = new google.maps.DirectionsService;
  directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});
  //directionsRenderer.setPanel(document.getElementById('directions'));
  directionsRenderer.setMap(map);

  var topsearchInput = document.getElementById('topsearchinput');
  var topsearchAutocomplete = new google.maps.places.Autocomplete(topsearchInput);
  //$('#listofsuggestions').append($('.pac-container'));

  var trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);
}

function fetchYourGeolocation(){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      geoPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      start = geoPos;

      if (!yourlocationmarker) {
        var userMarker = new google.maps.Marker({
          position: geoPos,
          map: map,
          icon: icon
        });
        yourlocationmarker = userMarker;
      }
      else {
        yourlocationmarker.setMap(null);
        var userMarker = new google.maps.Marker({
          position: geoPos,
          map: map,
          icon: icon
        });
        yourlocationmarker = userMarker;
      }
      map.setCenter(latlng);
      map.setZoom(16);
      //$('#startinputid').val(`${geoPos.lat}, ${geoPos.lng}`);
      //$('#endinputid').focus();
      if (end) {
        onEnterHandler();
      }
    },
    function() {
      console.log('Fetching denied');
      handleLocationError(false);
    });
  }
}

function handleLocationError(browserHasGeolocation) {
  // infoWindow.setContent(browserHasGeolocation ?
  // 'Error: The Geolocation service failed.' :
  // 'Error: Your browser doesn\'t support geolocation.');
  // infoWindow.open(map);
  // TODO: Need to handle the geolocation error message
}

function bluecrosshairEventHandler(){
  $('.geolocationButton').on('click', function(){
    if (latlng) {
      map.setCenter(latlng);
      map.setZoom(16);
    }
    else {
      fetchYourGeolocation();
    }
  })
}

function topsearchinputEventHandler(){
  $(document).on('keyup submit', '.topsearchform', function(e){
    e.preventDefault();
    if (e.keyCode ==  enterkeycode){
      inputlocationTypeHandler();
      onEnterHandler();
    }
    if (end && !(end == document.getElementById('topsearchinput').value)){
      directionsRenderer.setMap(null);
      resetMap();
    }
  });
}

function inputlocationTypeHandler(){
  if ($('#topsearchinput').attr('placeholder') == 'Go where?'){
    end = document.getElementById('topsearchinput').value;
  }
  if ($('#topsearchinput').attr('placeholder') == 'From where?'){
    start = document.getElementById('topsearchinput').value;
    $('#topsearchinput').attr('placeholder', 'Go where?');
  }
}

function onEnterHandler() {
  console.log('This start value is being passed at enterhandler');
  console.log(start);
  if (!(start)) {
    $('#topsearchinput').attr('placeholder', 'From where?');
  }
  if (start && end) {
    resolveHandler(start, end);
    //tryTextSearch(end);
  }
  else {
    directionsRenderer.setMap(null);
    directionsRenderer.set('directions', null);
    $('#topsearchinput').focus();
  }
}

function resolveHandler(start, end){
  let dsResolveReady = runDirectionServiceAPI(start, end);
  dsResolveReady.then(directionserviceResponse => {
    directionserviceData = directionserviceResponse;
    currentstartingId = directionserviceResponse.geocoded_waypoints[0].place_id;
    currentendingId = directionserviceResponse.geocoded_waypoints[1].place_id;
    if (startingIdKeeper == currentstartingId) {
      checkEndingPlaceData()
    }
    else {
      startingIdKeeper = currentstartingId;
      runPlacesAPI(currentstartingId).then(place => {
        startingPlaceData = place;
        checkEndingPlaceData();
      });
    }
  })
}

function checkEndingPlaceData(){
  if (!(endingIdKeeper == currentendingId)) {
    endingIdKeeper = currentendingId;
    runPlacesAPI(currentendingId).then(place => {
      endingPlaceData = place;
      processDirectionAndPlacesData();
    })
  }
  else {
    processDirectionAndPlacesData();
  }
}


function processDirectionAndPlacesData(){
  let fastestRoute = directionserviceData.routes[0];
  let routeinfoElements = generateRouteInfoElements(fastestRoute);
  let startingElements = generateStartingElements();
  let fromlocationElements = generateFromlocationElements();
  let endingElements = generateEndingElements()
  let ratingStarsElements = generateEndingDetailedElements()
  $('.shortbusinessinfoContainer').html('');
  $('.shortbusinessinfoContainer').html(ratingStarsElements);
  $('.routestatuscontainer').html('');
  $('.locationbuttonsContainer').html(startingElements);
  if ($('.ratingstars').length) {
    let ratingratio = `${(endingPlaceData.rating / 5)*100}%`;
    document.getElementById('ratingstarsTop').style.width = ratingratio;
  }
  let statustext = $('.operatingstatusDisplay').text();
  if (statustext == 'Open'){
    $('.operatingstatusDisplay').css('color', '#33ed0e');
  }
  if (statustext == 'Closed'){
    $('.operatingstatusDisplay').css('color', '#e80001');
  }
  $('.routestatuscontainer').html(routeinfoElements);
  $('.routeinfo').append(fromlocationElements);
  $('.locationbuttonsContainer').append(endingElements);

  currentlocationClickHandler()
}

// function tryTextSearch(loc){
//   let service = new google.maps.places.PlacesService(map);
//   let request = {query: loc};
//   service.textSearch(request, callback);
//   function callback(results, status) {
//     if(status == google.maps.places.PlacesServiceStatus.OK) {
//       console.log(results);
//       console.log('places success');
//     }
//     else {
//       console.log('places failed');
//     }
//   }
// }

function currentlocationClickHandler(){
  $('.startinglocation').on('click', function(e){
    e.preventDefault();
    console.log('a tag successfully stopped!');
    $('#topsearchinput').attr('placeholder', 'From where?');
    $('#topsearchinput').val('');
    $('#topsearchinput').focus();
  })
}

function resetMap() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function runDirectionServiceAPI(start, end) {
  let deferred = $.Deferred();
  let trafficModel = map.get('traffic');

  directionsService.route({
    origin: start,
    destination: end,
    travelMode: 'DRIVING',
    provideRouteAlternatives: true,
    drivingOptions: {
      departureTime: new Date()
    }
  }, function(response, status) {
    if (status === 'OK') {
      directionsRenderer.setMap(map);
      directionsRenderer.setDirections(response);
      let leg = response.routes[0].legs[0];
      makeMarker(leg.start_location, icons.start, 'Start Position');
      makeMarker(leg.end_location, icons.end, 'End Position');
      console.log(response);
      let directionserviceResponse = response;
      deferred.resolve(directionserviceResponse);
    }
    else {
      window.alert('Directions request failed due to ' + status);
      deferred.reject(0);
    }
  });
  return deferred.promise();
}

function makeMarker(position, iconimage, title){
  let marker = new google.maps.Marker({
    position: position,
    map: map,
    icon: iconimage,
    title: title
  });
  markers.push(marker);
}

function runPlacesAPI(locationId){
  let deferred = $.Deferred();
  let service = new google.maps.places.PlacesService(map);

  service.getDetails({
    placeId: locationId
  }, function(place, status){
    if (status == google.maps.places.PlacesServiceStatus.OK){
      console.log(place);
      console.log('above is the newly fetched place data');
      deferred.resolve(place);
    }
    else {
      console.log('runplaces failed');
      deferred.reject(0);
    }
  })
  return deferred.promise();
}

function convertMS(splitduration){
  let days = splitduration[splitduration.findIndex(a => a === 'days' || a === 'day') - 1];
  let hours = splitduration[splitduration.findIndex(a => a === 'hours' || a === 'hour') - 1];
  let mins = splitduration[splitduration.findIndex(a => a === 'mins' || a === 'min') - 1];

  let converteddays;
  let convertedhours;
  let convertedmins;

  days ? converteddays = days*24*60*60*1000 : converteddays = 0;
  hours ? convertedhours = hours*60*60*1000 : convertedhours = 0;
  mins ? convertedmins = mins*60*1000 : convertedmins = 0;
  let sum = converteddays + convertedhours + convertedmins;
  return sum;
}


function loadmaster(){
  loadGoogleJS();
  fetchYourGeolocation();
  bluecrosshairEventHandler();
  topsearchinputEventHandler();
}

$(loadmaster);
