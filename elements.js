function generateRouteInfoElements(oneRoute) {
  let splitTrafficDuration = oneRoute.legs[0].duration_in_traffic.text.split(' ');
  let splitAverageDuration = oneRoute.legs[0].duration.text.split(' ');
  msTrafficDuration = convertMS(splitTrafficDuration);
  msAverageDuration = convertMS(splitAverageDuration);

  let legSummary = oneRoute.summary;
  let trafficDuration = oneRoute.legs[0].duration_in_traffic.text;
  let averageDuration = oneRoute.legs[0].duration.text;
  let legDistance = oneRoute.legs[0].distance.text;
  let durationAnalysis;
  let colorduration;
  if (msTrafficDuration >= 0 && msTrafficDuration <= msAverageDuration + 60000){
    durationAnalysis = 'The traffic is normal. You should leave now';
    colorduration = `<div class='trafficdurationDiv goodduration'>${trafficDuration}</div>`;
    colordescription = `<div class='legsummaryDiv goodsummary'>Fastest via ${legSummary}</div>`;
  }
  else {
    durationAnalysis = 'Ouch!  We can alert you when it cools down';
    colorduration = `<div class='trafficdurationDiv badduration'>${trafficDuration}</div>`;
    colordescription = `<div class='legsummaryDiv badsummary'>Fastest via ${legSummary}</div>`;
  }

  console.log(durationAnalysis);
  console.log(`Traffic: ${trafficDuration}`);
  console.log(`Average: ${averageDuration}`);
  return `
    <div class='routeinfocontainer'>
      <div class='routeinfo'>
        ${colorduration}
        ${colordescription}
      </div>
    </div>
  `;
}

function generateEndingDetailedElements(){
  let ratingnum;
  let ratingStars;
  let operatingstatus;
  let reviewsnum;
  let ratingNumStarsElements = '';
  let reviewsNumElements = '';
  let operatingstatusElements = '';

  if ("rating" in endingPlaceData){
    ratingnum = endingPlaceData.rating;
    ratingStars = generateRatingStars();
    ratingNumStarsElements = `
      <div class='ratingsnumDisplay'>${ratingnum}</div>
      <div class='ratingsstarsDisplay'>${ratingStars}</div>`;
  }
  if (endingPlaceData.reviews){
    reviewsnum = `(${endingPlaceData.reviews.length})`
    reviewsNumElements = `
      <div class='reviewsnumDisplay'>${reviewsnum}</div>
    `
  }

  if (endingPlaceData.opening_hours){
    endingPlaceData.opening_hours.open_now ? operatingstatus = 'Open' : operatingstatus = 'Closed';
    operatingstatusElements = `
      <div class='operatingstatusDisplay'>${operatingstatus}</div>
    `
  }

  return `
    <div class='destinationNameContainer'>
      <div class='destinationName'>${endingPlaceData.name}</div>
      <div class='ratingsDisplayContainer'>
        ${ratingNumStarsElements}
        ${reviewsNumElements}
        ${operatingstatusElements}
      </div>
      <div class='destinationaddress'>
        ${endingPlaceData.formatted_address}
      </div>
    </div>
  `;
}

function generateRatingStars(){
  return `
  <div class='ratingstars'>
    <div id='ratingstarsTop' style='width=0%'><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
    <div id='ratingstarsBottom'><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
  </div>
  `;
}

function generateQuickaccessElements(){
  let phonenumber = '';
  let openinghours = '';
  let website = '';
  if (endingPlaceData.international_phone_number){
    phonenumber = `
      <a href='tel:${endingPlaceData.international_phone_number}' class='quickphonecontainer' role='button' tabindex='7'>
        <div class='qadiv quickphone'>
          <img class='qaimg' src='img/bluephone.svg' />
        </div>
        <div class='qadesc'>CALL</div>
      </a>`
  }
  if (endingPlaceData.opening_hours){
    openinghours = `
      <button class='openinghourscontainer' tabindex='6'>
        <div class='qadiv openinghours'>
          <img class='qaimg' src='img/bluehours.svg' />
        </div>
        <div class='qadesc'>HOURS</div>
      </button>`
  }
  let share = `
    <button class='sharecontainer' tabindex='9'>
      <div class='qadiv share'>
        <img class='qaimg' src='img/blueshare.svg' />
      </div>
      <div class='qadesc'>SHARE</div>
      <div class='sharelink'>${endingPlaceData.url}</div>
    </button>

    `
  if (endingPlaceData.website){
    website = `
      <button onclick='window.open(endingPlaceData.website, "_blank")' class='websitecontainer' tabindex='8'>
        <div class='qadiv website'>
          <img class='qaimg' src='img/bluewebsite.svg' />
        </div>
        <div class='qadesc'>WEBSITE</div>
      </button>`
  }
  return `
    <div class='quickaccesscontainer'>
      ${openinghours}${phonenumber}${website}${share}
    </div>
    <div class='infolist'>
      <ul>
        <li>${endingPlaceData.formatted_phone_number}</li>
        <li>${endingPlaceData.website}</li>
        <li>${endingPlaceData.url}</li>
      </ul>
    </div>
  `;
}

function generateHoursElements(){
  if ($('.hourslistcontainer').length){
    $('.hourslistcontainer').remove()
  }
  let routesdiv = $('<div/>').attr('class', 'hourslistcontainer');
  let routesul = $('<ul/>').attr('class', 'hourslistul');
  if (endingPlaceData.opening_hours) {
    for (let i = 0; i < endingPlaceData.opening_hours.weekday_text.length; i++){
      routesul.append(`<li>${endingPlaceData.opening_hours.weekday_text[i]}</li>`);
    }
  }
  routesdiv.append(routesul);
  return routesdiv;
}

function generateasideElements(){
  return `
    <aside class='infoaside'>
      <div class='infocontainer'>
        <div class='shortbusinessinfoContainer'></div>
      </div>
    </aside>
  `
}
