const uspsParser = (response) => {
  const jsdom = require("jsdom");
  const dom = new jsdom.JSDOM(response);
  const stat = dom.window.document.querySelector("TrackSummary").textContent;
  
  return stat;
}

const upsParser = (response) => {
  let lastActivity = response[0].trackResponse.shipment[0].package[0].activity[0];
  // response format:
  //
  // {
  //   location: {
  //     address: {
  //       city: 'Denver',
  //       stateProvince: 'CO',
  //       postalCode: '80239',
  //       country: 'US'
  //     }
  //   },
  //   status: {
  //     type: 'I',
  //     description: 'Package departed UPS Mail Innovations facility enroute to USPS for induction',
  //     code: 'ZR'
  //   },
  //   date: '20200905',
  //   time: '122200'
  // }
  var tc = require("timezonecomplete");

  let city = `${lastActivity.location.address.city}`
  city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  let state = `${lastActivity.location.address.stateProvince}`
  let desc = `${lastActivity.status.description}`
  let dateRegex = /(\d{4})(\d{2})(\d{2})/;
  let dateArray = dateRegex.exec(`${lastActivity.date}`); 
  let timeRegex = /(\d{2})(\d{2})(\d{2})/;
  let timeArray = timeRegex.exec(`${lastActivity.time}`); 

  // create tz-aware datetime object:
  let updateDate = new tc.DateTime(
    (+dateArray[1]),
    (+dateArray[2]),
    (+dateArray[3]),
    (+timeArray[1]),
    (+timeArray[2]),
    (+timeArray[3]),
  );

  let stat = `${city}, ${state} (${updateDate.format("yyyy-MM-dd hh:mm a")}) – ${desc}`
  
  return stat
}

const fedExParser = (response) => {
  var tc = require("timezonecomplete");

  // response format:
  //  [
  //    'Thursday, January 21, 2021',
  //    '9:09 PM\tDENVER, CO\t',
  //    'In transit',
  //    'Tuesday, January 19, 2021',
  //    '12:00 AM\tHAMMOND, IN\t',
  //    'Picked up',
  //    'Expand History'
  //  ]
  // first three values are the latest status
  // console.log(`response: ${response}`)
  const res = response[0]
  const dayAndDate = res[0];
  // console.log(`dayAndDate: ${dayAndDate}`)
  const timeAndLocation = res[1];
  // console.log(`timeAndLocation: ${timeAndLocation}`)
  const details = res[2];
  // console.log(`details: ${details}`)
  let [time, cityState] = timeAndLocation.split('\t')
  // console.log(`time: ${time}; cityState: ${cityState};`)
  let [city, state] = cityState.split(', ');
  // console.log(`city: ${city}; state: ${state}`)
  city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  // console.log(`city: ${city}`)
  let dateTime = new tc.DateTime(
    `${dayAndDate} - ${time}`,
    "EEEE, MMMM d, yyyy - h:mm aa"
  )
  // console.log(`dateTime: ${dateTime}`)
  let stat = `${city}, ${state} (${dateTime.format("yyyy-MM-dd hh:mm a")}) - ${details}`
  // console.log(`stat: ${stat}`)
  return stat;
}

const onTracParser = (response) => {
  var tc = require("timezonecomplete");
  
  // response format:
  // [
  //   09/08/20,                                # date
  //   05:03PM,                                 # time
  //   Delivered                                # status
  //   BOULDER, CO                              # location
  // ]
  const res = response[0];
  let [city, state] = res[3].split(', ');
  city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  let dateTime = new tc.DateTime(
    `${res[0]} - ${res[1]}`,
    "MM/dd/yy - hh:mmaa"
  )

  let stat = `${city}, ${state} (${dateTime.format("yyyy-MM-dd hh:mm a")}) - ${res[2]}`
  return stat;
}

parsers = {
  usps: uspsParser,
  ups: upsParser,
  fedex: fedExParser,
  ontrac: onTracParser
}

module.exports = parsers;
