function generateRouteInfoElements(oneRoute) {
  // let destinationName = endingPlaceData.name;
  // let destinationAddress = endingPlaceData.formatted_address;

  let splitTrafficDuration = oneRoute.legs[0].duration_in_traffic.text.split(' ');
  let splitAverageDuration = oneRoute.legs[0].duration.text.split(' ');
  msTrafficDuration = convertMS(splitTrafficDuration);
  msAverageDuration = convertMS(splitAverageDuration);

  let legSummary = oneRoute.summary;
  let trafficDuration = oneRoute.legs[0].duration_in_traffic.text;
  let averageDuration = oneRoute.legs[0].duration.text;
  let legDistance = oneRoute.legs[0].distance.text;
  let durationAnalysis;
  if (msTrafficDuration >= 0 && msTrafficDuration <= msAverageDuration + 60000){
    durationAnalysis = 'The traffic is normal. You should leave now';
  }
  else {
    durationAnalysis = 'Ouch!  We can alert you when it cools down';
  }
  console.log(`Traffic: ${trafficDuration}`);
  console.log(`Average: ${averageDuration}`);
  return `
    <div class='routeinfoContainer'>
      <div class='routeinfo'>
        <div class='legsummaryDiv'>via ${legSummary}</div>
        <div class='distanceDiv'>${oneRoute.legs[0].distance.text}</span></div>
      </div>
      <div class='trafficdurationDiv'>${trafficDuration}</div>
    </div>
  `
}

function generateStartingElements(){
  return `
  <a href='' class='startinglocation'>
    <img class='startinglocationImg' src='img/departdot.svg' alt='Current Location Icon'/>
    <div class='startinglocationTxt'>${startingPlaceData.name}</div>
  </a>
  `
}

function generateFromlocationElements(){
  return `
  <div class='fromlocationContainer'>
    <div class='fromlocationDiv'>From <span>${startingPlaceData.name}</span></div>
  </div>
  `
}

function generateEndingElements(){
  return `
  <div class='endinglocation'>
    <img class='endinglocationImg' src='img/smallredpin.svg' alt='Destination Icon'/>
    <div class='endinglocationTxt'>${endingPlaceData.name}</div>
  </div>
  `
}

function generateEndingDetailedElements(){
  let operatingstatus;
  if (endingPlaceData.opening_hours){
    endingPlaceData.opening_hours.open_now ? operatingstatus = 'Open' : operatingstatus = 'Closed';
  }
  else {
    operatingstatus = '';
  }
  let ratingnum;
  let reviewsnum;
  endingPlaceData.reviews ? reviewsnum = `(${endingPlaceData.reviews.length})` : reviewsnum = '';
  let ratingStars
  if (endingPlaceData.rating){
    ratingnum = endingPlaceData.rating;
    ratingStars = generateRatingStars();
  }
  else {
    ratingnum = ''
    ratingStars = ''
  }

  return `
    <div class='destinationNameContainer'>
      <div class='destinationName'>${endingPlaceData.name}</div>
      <div class='ratingsDisplayContainer'>
        <div class='ratingsnumDisplay'>${ratingnum}</div>
        <div class='ratingsstarsDisplay'>${ratingStars}</div>
        <div class='reviewsnumDisplay'>${reviewsnum}</div>
        <div class='operatingstatusDisplay'>${operatingstatus}</div>
      </div>
    </div>
  `
}

function generateRatingStars(){
  return `
  <div class='ratingstars'>
    <div id='ratingstarsTop' style='width=0%'><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
    <div id='ratingstarsBottom'><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
  </div>
  `
}
