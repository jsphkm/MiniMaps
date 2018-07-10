function loadGoogleJS(){
  $('#searchtoinput').focus();
  if (document.querySelectorAll('#map').length > 0)
  {
    if (document.querySelector('html').lang) {
      lang = document.querySelector('html').lang;
    }
    else {
      lang = 'en';
    }
    var js_file = document.createElement('script');
    js_file.type = 'text/javascript';
    js_file.src = 'https://maps.googleapis.com/maps/api/js?&callback=initMap&key=AIzaSyAln4UsUGOrVtX4MGg4e0mGXY2GK-helLE&libraries=places&language=' + lang;
    document.getElementsByTagName('head')[0].appendChild(js_file);
  }
}

var map;
var markers = [];
var yourlocationmarker;
let enterkeycode = 13;
let escapekeycode = 27;
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
let searchfromAutocomplete;
let searchtoAutocomplete;
let inputbuffer;

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

  var searchfromInput = document.getElementById('searchfrominput');
  var searchtoInput = document.getElementById('searchtoinput');
  searchfromAutocomplete = new google.maps.places.Autocomplete(searchfromInput);
  searchtoAutocomplete = new google.maps.places.Autocomplete(searchtoInput);
  // $('#autocomplete').append($('.pac-container'));

  var trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);
  topsearchinputEventHandler();
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
      $('#searchfrominput').val(`${geoPos.lat}, ${geoPos.lng}`);
      $('#searchtoinput').focus();
      if (end) {
        onEnterHandler();
      }
    },
    function() {
      toggleInputDisplay()
    });
  }
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
  $( '.topsearchcontainer input' ).focus(function() {
    saveinputBuffer();
  });

  $(document).on('keyup keypress submit', '.topsearchform', function(e){
    if (e.which == enterkeycode || e.type == 'submit') {
      e.preventDefault();
      if ($('#searchfrominput').val() == '') {
        document.getElementById('searchfrominput').focus();
      }
      if ($('#searchfrominput').val() !== '' && $('#searchtoinput').val() == '') {
        document.getElementById('searchtoinput').focus();
      }
    }
    if (e.which == escapekeycode) {
      document.activeElement.value = inputbuffer;
    }
    if (e.type == 'keyup'){
      if (end && !(end == document.getElementById('searchtoinput').value)) {
        directionsRenderer.setMap(null);
        resetMap();
      }
    }
  });

  google.maps.event.addListener(searchfromAutocomplete, 'place_changed', function() {
      var data = $('#topsearchform').serialize();
      handleinputvalues();
  });

  google.maps.event.addListener(searchtoAutocomplete, 'place_changed', function() {
    handleinputvalues();
  });
}

function saveinputBuffer(){
  if (document.activeElement.value) {
    inputbuffer = document.activeElement.value;
  };
}

function handleinputvalues(){
  if (!(document.getElementById('searchfrominput').value)) {
    $('#searchfrominput').focus();
  }
  if (document.getElementById('searchfrominput').value && !(document.getElementById('searchtoinput').value)) {
    $('#searchtoinput').focus();
  }
  end = document.getElementById('searchtoinput').value;
  start = document.getElementById('searchfrominput').value;
  onEnterHandler();
}

function onEnterHandler() {

  if (start && end) {
    resolveHandler(start, end);
  }
  else {
    directionsRenderer.setMap(null);
    directionsRenderer.set('directions', null);
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
  let ratingStarsElements = generateEndingDetailedElements()
  if ($('.infoaside').length) {
    $('.infoaside').remove();
  }
  $('main').append(generateasideElements());
  $('.mapsection').css('height', '40vh');
  $('.shortbusinessinfoContainer').html('');
  $('.shortbusinessinfoContainer').html(ratingStarsElements);
  if ($('.ratingstars').length) {
    let ratingratio = `${(endingPlaceData.rating / 5)*100}%`;
    document.getElementById('ratingstarsTop').style.width = ratingratio;
  }
  let statustext = $('.operatingstatusDisplay').text();
  if (statustext == 'Open'){
    $('.operatingstatusDisplay').css('color', '#00FF88');
  }
  if (statustext == 'Closed'){
    $('.operatingstatusDisplay').css('color', '#E41517');
  }
  if (!(/[a-z]/i.test(document.getElementById('searchfrominput').value))){
    let startingname = '';
    if (!(startingPlaceData.formatted_address.includes(startingPlaceData.name))){
      startingname = `${startingPlaceData.name}, `;
    }
    document.getElementById('searchfrominput').value = `${startingname}${startingPlaceData.formatted_address}`;
  }
  if ($('.hourslistcontainer').length){
    $('.hourslistcontainer').remove()
  }
  renderRouteElements();
  renderQuickAccessElements();
  renderDirectionsElements();
  hourslistHandler();
  directionsRenderer.setMap(map);
  saveinputBuffer();
  toggleView();
}

function renderDirectionsElements(){
  let directionsdiv = $('<div/>').attr('id', 'directions');
  directionsdiv.attr('class', 'hideElement');
  $('.routescontainer').prepend(directionsdiv);
  directionsRenderer.setPanel(document.getElementById('directions'));
}

function hourslistHandler(){
  $('.openinghourscontainer').on('click', function(){
    if ($('main').css('flex-direction') != 'row-reverse'){
      $('.mapsection').toggleClass('hideElement');
      toggleArrow();
    }
    renderHoursList();
  });
}

function toggleArrow(){
  if (!$('.mapsection').hasClass('hideElement')) {
    $('.arrowimg').attr('src', 'img/flatarrow.svg');
  }
  else {
    $('.arrowimg').attr('src', 'img/downarrow.svg');
  }
}

function renderHoursList(){
  if ($('.hourslistcontainer').length){
    $('.hourslistcontainer').remove();
  }
  else{
    let hours = generateHoursElements();
    $('.infocontainer').append(hours);
  }
}

function renderQuickAccessElements(){
  if ($('.quickaccesscontainer').length){
    $('.quickaccesscontainer').remove();
  }
  if ($('.infolist').length){
    $('.infolist').remove();
  }
  $('.infocontainer').append(generateQuickaccessElements());

  $('.sharecontainer').on('click', function(){
    if (navigator.share !== undefined) {
      navigator.share({
        title: endingPlaceData.name,
        url: endingPlaceData.url
      })
    }
  })
}

function renderRouteElements(){

  if ($('.routescontainer')){
    $('.routescontainer').remove();
  }
  let routesdiv = $('<div/>').attr('class', 'routescontainer');
  let appendedroutesdiv = routesdiv.append(generateRouteInfoElements(directionserviceData.routes[0]));

  $('.infocontainer').prepend(appendedroutesdiv);
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
      resetMap();
      directionsRenderer.setMap(map);
      directionsRenderer.setDirections(response);
      let leg = response.routes[0].legs[0];
      makeMarker(leg.start_location, icons.start, 'Start Position');
      makeMarker(leg.end_location, icons.end, 'End Position');
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
      deferred.resolve(place);
    }
    else {
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

function toggleView(){
  $('.arrowcontainer').on('click', function(){
    $('.mapsection').toggleClass('hideElement');
    //$('header').toggleClass('hideElement');
    if (!$('.mapsection').hasClass('hideElement')) {
      $('.arrowimg').attr('src', 'img/flatarrow.svg');
    }
    else {
      $('.arrowimg').attr('src', 'img/downarrow.svg');
    }
  });
}

function toggleInputDisplay(){
  $('.topsearchform div:first-child').toggleClass('hideElement');
  if ($('.expandarrowimg').attr('src') == 'img/expandarrow.svg') {
    $('.expandarrowimg').attr('src', 'img/collapsearrow.svg');
  }
  else {
    $('.expandarrowimg').attr('src', 'img/expandarrow.svg');
  }
}

function loadmaster(){
  loadGoogleJS();
  fetchYourGeolocation();
  bluecrosshairEventHandler();
  $('.expandarrow').click(function(){
    toggleInputDisplay();
  });
}

$(loadmaster);
