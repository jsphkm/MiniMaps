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
    colordescription = `<div class='legsummaryDiv goodsummary'>via ${legSummary}</div>`;
  }
  else {
    durationAnalysis = 'Ouch!  We can alert you when it cools down';
    colorduration = `<div class='trafficdurationDiv badduration'>${trafficDuration}</div>`;
    colordescription = `<div class='legsummaryDiv badsummary'>via ${legSummary}</div>`;
  }

  let routes = `
    <div class='routesicon' tabindex='10'>
      <img role='img' class='qaimg' src='img/bluecar.svg' alt='route icon' />
    </div>`

  console.log(durationAnalysis);
  console.log(`Traffic: ${trafficDuration}`);
  console.log(`Average: ${averageDuration}`);
  return `
    <div role='button' class='routeinfocontainer'>
      <div class='routeinfo'>
        ${colorduration}
        ${colordescription}
      </div>
      <div class='routebuttoncontainer'>${routes}</div>
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

  //if ("rating" in endingPlaceData){
  if (endingPlaceData.hasOwnProperty('rating')){
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
      <a role='link' href='tel:${endingPlaceData.international_phone_number}' class='quickphonecontainer' role='button' tabindex='8'>
        <div class='qadiv quickphone'>
          <img role='img' class='qaimg' src='img/bluephone.svg' alt='bluephone icon'/>
        </div>
        <div class='qadesc'>CALL</div>
      </a>`
  }
  if (endingPlaceData.opening_hours){
    openinghours = `
      <button role='button' class='openinghourscontainer' tabindex='7'>
        <div class='qadiv openinghours'>
          <img role='img' class='qaimg' src='img/bluehours.svg' alt='clock icon'/>
        </div>
        <div class='qadesc'>HOURS</div>
      </button>`
  }
  if (endingPlaceData.website){
    website = `
      <button role='button' onclick='window.open(endingPlaceData.website, "_blank")' class='websitecontainer' tabindex='9'>
        <div class='qadiv website'>
          <img role='img' class='qaimg' src='img/bluewebsite.svg' alt='globe icon' />
        </div>
        <div class='qadesc'>WEBSITE</div>
      </button>`
    infowebsite = endingPlaceData.website;
  }

  return `
    <div class='quickaccesscontainer'>
      ${openinghours}${phonenumber}${website}
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
    <aside role='complementary' class='infoaside'>
      <button role='button' class='arrowcontainer'>
        <a class='arrowicon'><img class='arrowimg' src='img/flatarrow.svg' alt='flat arrow icon'></a>
      </button>
      <div class='infocontainer'>
        <div class='shortbusinessinfoContainer'></div>
      </div>
    </aside>
  `
}
