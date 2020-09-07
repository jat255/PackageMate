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
  return 'FedEx parser not yet implemented';
}

const onTracParser = (response) => {
  return 'OnTrac parser not yet implemented';
}

parsers = {
  usps: uspsParser,
  ups: upsParser,
  fedex: fedExParser,
  ontrac: onTracParser
}

module.exports = parsers;
