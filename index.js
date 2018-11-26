function loadGoogleJS() {
  $('#searchtoinput').focus();
  if (document.querySelectorAll('#map').length > 0) {
    let language;
    if (document.querySelector('html').lang) {
      language = document.querySelector('html').lang;
    } else {
      language = 'en';
    }
    const jsFile = document.createElement('script');
    jsFile.type = 'text/javascript';
    jsFile.src = `https://maps.googleapis.com/maps/api/js?&callback=initMap&key=AIzaSyAln4UsUGOrVtX4MGg4e0mGXY2GK-helLE&libraries=places&language=${language}`;
    document.getElementsByTagName('head')[0].appendChild(jsFile);
  }
}

let map;
const markers = [];
let yourlocationmarker = null;
const enterkeycode = 13;
const escapekeycode = 27;
let geoPos;
let start;
let end;
let directionsService;
let directionsRenderer;
let latlng;
let directionserviceData;
let startingPlaceData;
let endingPlaceData;
let icon;
let icons;
let startingIdKeeper;
let endingIdKeeper;
let currentstartingId;
let currentendingId;
let searchfromAutocomplete;
let searchtoAutocomplete;
let inputbuffer;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 34.0522, lng: -118.2437 },
    mapTypeControl: false,
    gestureHandling: 'cooperative',
    zoom: 6,
    disableDefaultUI: true,
    keyboardShortcuts: true,
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
    },
  };

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
  directionsRenderer.setMap(map);

  const searchfromInput = document.getElementById('searchfrominput');
  const searchtoInput = document.getElementById('searchtoinput');
  searchfromAutocomplete = new google.maps.places.Autocomplete(searchfromInput);
  searchtoAutocomplete = new google.maps.places.Autocomplete(searchtoInput);

  const trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);
  topsearchinputEventHandler();
}

function removeIntroContents() {
  if ($('.intromessage').length) {
    $('.intromessage').remove();
  }
  if ($('.firstgeobtncontainer').length) {
    $('.firstgeobtncontainer').remove();
  }
  if ($('.logoimg').attr('src', 'img/logo.svg')) {
    $('.logoimg').attr('src', 'img/logoicon.svg');
    $('.logoimg').addClass('smallicon');
  }
}

function fetchYourGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      geoPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      start = geoPos;

      if (!yourlocationmarker) {
        const userMarker = new google.maps.Marker({
          position: geoPos,
          map,
          icon,
        });
        yourlocationmarker = userMarker;
      } else {
        yourlocationmarker.setMap(null);
        const userMarker = new google.maps.Marker({
          position: geoPos,
          map,
          icon,
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
    });
  }
}

function bluecrosshairEventHandler() {
  $('.geolocationButton').on('click', () => {
    if (latlng) {
      map.setCenter(latlng);
      map.setZoom(16);
    } else {
      fetchYourGeolocation();
    }
  });
}

function topsearchinputEventHandler() {
  $('.topsearchcontainer input').focus(() => {
    saveinputBuffer();
  });

  $(document).on('keyup submit', '.topsearchform', (e) => {
    if (e) { e.preventDefault(); }
    if (e.which === enterkeycode || e.type === 'submit') {
      e.preventDefault();
      if ($('#searchfrominput').val() === '') {
        document.getElementById('searchfrominput').focus();
        if ($('.topsearchform div:first-child').hasClass('hideElement')) {
          toggleInputDisplay();
        }
      }
      if ($('#searchfrominput').val() !== '' && $('#searchtoinput').val() === '') {
        document.getElementById('searchtoinput').focus();
      }
    }
    if (e.which === escapekeycode) {
      document.activeElement.value = inputbuffer;
    }
    if (e.type === 'keyup') {
      if (end && !(end === document.getElementById('searchtoinput').value)) {
        directionsRenderer.setMap(null);
        resetMap();
      }
    }
  });

  google.maps.event.addListener(searchfromAutocomplete, 'place_changed', () => {
    handleinputvalues();
  });

  google.maps.event.addListener(searchtoAutocomplete, 'place_changed', () => {
    handleinputvalues();
  });
}

function saveinputBuffer() {
  if (document.activeElement.value) {
    inputbuffer = document.activeElement.value;
  }
}

function handleinputvalues() {
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
  } else {
    directionsRenderer.setMap(null);
    directionsRenderer.set('directions', null);
  }
}

function resolveHandler(start, end) {
  const dsResolveReady = runDirectionServiceAPI(start, end);
  dsResolveReady.then((directionserviceResponse) => {
    directionserviceData = directionserviceResponse;
    currentstartingId = directionserviceResponse.geocoded_waypoints[0].place_id;
    currentendingId = directionserviceResponse.geocoded_waypoints[1].place_id;
    if (startingIdKeeper === currentstartingId) {
      checkEndingPlaceData();
    } else {
      startingIdKeeper = currentstartingId;
      runPlacesAPI(currentstartingId).then((place) => {
        startingPlaceData = place;
        checkEndingPlaceData();
      });
    }
  });
}

function checkEndingPlaceData() {
  if (!(endingIdKeeper == currentendingId)) {
    endingIdKeeper = currentendingId;
    runPlacesAPI(currentendingId).then((place) => {
      endingPlaceData = place;
      processDirectionAndPlacesData();
    });
  } else {
    processDirectionAndPlacesData();
  }
}

function processDirectionAndPlacesData() {
  const ratingStarsElements = generateEndingDetailedElements();
  if ($('.infoaside').length) {
    $('.infoaside').remove();
  }
  $('main').append(generateasideElements());
  $('.mapsection').css('height', '40vh');
  $('.shortbusinessinfoContainer').html('');
  $('.shortbusinessinfoContainer').html(ratingStarsElements);
  if ($('.ratingstars').length) {
    const ratingratio = `${(endingPlaceData.rating / 5) * 100}%`;
    document.getElementById('ratingstarsTop').style.width = ratingratio;
  }
  const statustext = $('.operatingstatusDisplay').text();
  if (statustext === 'Open') {
    $('.operatingstatusDisplay').css('color', '#00FF88');
  }
  if (statustext === 'Closed') {
    $('.operatingstatusDisplay').css('color', '#E41517');
  }
  if (!(/[a-z]/i.test(document.getElementById('searchfrominput').value))) {
    let startingname = '';
    if (!(startingPlaceData.formatted_address.includes(startingPlaceData.name))) {
      startingname = `${startingPlaceData.name}, `;
    }
    document.getElementById('searchfrominput').value = `${startingname}${startingPlaceData.formatted_address}`;
  }
  if ($('.hourslistcontainer').length) {
    $('.hourslistcontainer').remove();
  }
  renderRouteElements();
  renderQuickAccessElements();
  renderDirectionsElements();
  hourslistHandler();
  directionsRenderer.setMap(map);
  saveinputBuffer();
  toggleView();
}

function renderDirectionsElements() {
  const directionsdiv = $('<div/>').attr('id', 'directions');
  directionsdiv.attr('class', 'hideElement');
  $('.routescontainer').prepend(directionsdiv);
  directionsRenderer.setPanel(document.getElementById('directions'));
}

function hourslistHandler() {
  $('.openinghourscontainer').on('click', () => {
    if ($('main').css('flex-direction') != 'row-reverse') {
      $('.mapsection').toggleClass('hideElement');
      toggleArrow();
    }
    renderHoursList();
  });
}

function toggleArrow() {
  if (!$('.mapsection').hasClass('hideElement')) {
    $('.arrowimg').attr('src', 'img/flatarrow.svg');
  } else {
    $('.arrowimg').attr('src', 'img/downarrow.svg');
  }
}

function renderHoursList() {
  if ($('.hourslistcontainer').length) {
    $('.hourslistcontainer').remove();
  } else {
    const hours = generateHoursElements();
    $('.infocontainer').append(hours);
  }
}

function renderQuickAccessElements() {
  if ($('.quickaccesscontainer').length) {
    $('.quickaccesscontainer').remove();
  }
  if ($('.infolist').length) {
    $('.infolist').remove();
  }
  $('.infocontainer').append(generateQuickaccessElements());

  $('.sharecontainer').on('click', () => {
    if (navigator.share !== undefined) {
      navigator.share({
        title: endingPlaceData.name,
        url: endingPlaceData.url,
      });
    }
  });
}

function renderRouteElements() {
  if ($('.routescontainer')) {
    $('.routescontainer').remove();
  }
  const routesdiv = $('<div/>').attr('class', 'routescontainer');
  const appendedroutesdiv = routesdiv.append(generateRouteInfoElements(directionserviceData.routes[0]));

  $('.infocontainer').prepend(appendedroutesdiv);
}

function resetMap() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function runDirectionServiceAPI(start, end) {
  const deferred = $.Deferred();
  const trafficModel = map.get('traffic');

  directionsService.route({
    origin: start,
    destination: end,
    travelMode: 'DRIVING',
    provideRouteAlternatives: true,
    drivingOptions: {
      departureTime: new Date(),
    },
  }, (response, status) => {
    if (status === 'OK') {
      resetMap();
      directionsRenderer.setMap(map);
      directionsRenderer.setDirections(response);
      const leg = response.routes[0].legs[0];
      makeMarker(leg.start_location, icons.start, 'Start Position');
      makeMarker(leg.end_location, icons.end, 'End Position');
      const directionserviceResponse = response;
      deferred.resolve(directionserviceResponse);
    } else {
      deferred.reject(0);
    }
  });
  removeIntroContents();
  return deferred.promise();
}

function makeMarker(position, iconimage, title) {
  const marker = new google.maps.Marker({
    position,
    map,
    icon: iconimage,
    title,
  });
  markers.push(marker);
}

function runPlacesAPI(locationId) {
  const deferred = $.Deferred();
  const service = new google.maps.places.PlacesService(map);

  service.getDetails({
    placeId: locationId,
  }, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      deferred.resolve(place);
    } else {
      deferred.reject(0);
    }
  });
  return deferred.promise();
}

function convertMS(splitduration) {
  const days = splitduration[splitduration.findIndex(a => a === 'days' || a === 'day') - 1];
  const hours = splitduration[splitduration.findIndex(a => a === 'hours' || a === 'hour') - 1];
  const mins = splitduration[splitduration.findIndex(a => a === 'mins' || a === 'min') - 1];
  const converteddays = days ? days * 24 * 60 * 60 * 1000 : 0;
  const convertedhours = hours ? hours * 60 * 60 * 1000 : 0;
  const convertedmins = mins ? mins * 60 * 1000 : 0;
  const sum = converteddays + convertedhours + convertedmins;
  return sum;
}

function toggleView() {
  $('.arrowcontainer').on('click', () => {
    $('.mapsection').toggleClass('hideElement');
    if (!$('.mapsection').hasClass('hideElement')) {
      $('.arrowimg').attr('src', 'img/flatarrow.svg');
    } else {
      $('.arrowimg').attr('src', 'img/downarrow.svg');
    }
  });
}

function toggleInputDisplay() {
  $('.topsearchform div:first-child').toggleClass('hideElement');
  if ($('.expandarrowimg').attr('src') === 'img/expandarrow.svg') {
    $('.expandarrowimg').attr('src', 'img/collapsearrow.svg');
  } else {
    $('.expandarrowimg').attr('src', 'img/expandarrow.svg');
  }
  $('.logocontainer').toggleClass('hideElement');
  if ($('.intromessage').length) {
    $('.intromessage').remove();
  }
  if ($('.firstgeobtncontainer').length) {
    $('.firstgeobtncontainer').toggleClass('hideElement');
  }
}

function firstfetchgeoloc() {
  $('.firstgeobtn').on('click', () => {
    fetchYourGeolocation();
  });
}

function loadmaster() {
  loadGoogleJS();
  firstfetchgeoloc();
  bluecrosshairEventHandler();
  $('.expandarrow').click(() => {
    toggleInputDisplay();
  });
}

$(loadmaster);
