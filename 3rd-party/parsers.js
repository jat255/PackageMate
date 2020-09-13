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
  // [
  //   Saturday , 7/11/2020,                                # date
  //   10:03 am,                                            # time
  //   Boulder, CO,                                         # location
  //   Delivered,                                           # status
  //   Left at front door.                                  # status more details (not always present)   
  // ]
  const res = response[0];
  let [city, state] = res[2].split(', ');
  city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  let dateTime = new tc.DateTime(
    `${res[0]} - ${res[1]}`,
    "EEEE , M/dd/yyy - h:mm aa"
  )
  let details = res[3] + (res.length > 4 ? `: ${res[4]}` : '')

  let stat = `${city}, ${state} (${dateTime.format("yyyy-MM-dd hh:mm a")}) - ${details}`
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
