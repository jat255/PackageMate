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
  console.log(`response: ${response}`)
  const res = response[0]
  var arrayLength = res.length;
  for (var i = 0; i < arrayLength; i++) {
      console.log(`res[${i}]: ${res[i]}`);
  }
  const dayAndDate = res[2].trim();
  console.log(`dayAndDate: ${dayAndDate}`);
  const timeAndLocation = res[4];
  console.log(`timeAndLocation: ${timeAndLocation}`);
  const details = res[5];
  console.log(`details: ${details}`);
  let [time, cityState] = timeAndLocation.split('\t');
  time = time.trim();
  console.log(`time: ${time}; cityState: ${cityState};`);
  let [city, state] = cityState.split(', ');
  console.log(`city: ${city}; state: ${state}`);
  city = titleCase(city).trim();
  console.log(`city: ${city}`);
  console.log(`parsing dateTime: ${dayAndDate} - ${time}`);
  let dateTime = new tc.DateTime(
    `${dayAndDate} - ${time}`,
    "EEEE, MMMM d, yyyy - h:mm aa"
  );
  console.log(`dateTime: ${dateTime}`)
  let stat = `${city}, ${state} (${dateTime.format("yyyy-MM-dd hh:mm a")}) - ${details}
              Expected: ${res[res.length - 1]}`;
  console.log(`stat: ${stat}`)
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

  let stat = `${city}, ${state} (${dateTime.format("yyyy-MM-dd hh:mm a")}) - ${res[2]}`;
  return stat;
}

const amazonParser = (response) => {
  console.debug("Parsing Amazon response")
  var tc = require("timezonecomplete");
  // console.debug("loaded timezonecomplete")
  // response format:

  // { progressTracker:
  //   '{"progressMeter":{"milestoneList":[{"position":0,"mileStoneType":"NORMAL","eventSummary":{"statusElement":{"translatorString":{"localisedStringId":"swa_rex_shipping_label_created","fieldValueMap":null},"statusCode":null},"reasonElement":null,"metaDataElement":{"translatorString":{"localisedStringId":null,"fieldValueMap":null}},"timeElement":null},"isActive":true},{"position":1,"mileStoneType":"NORMAL","eventSummary":{"statusElement":{"translatorString":{"localisedStringId":"swa_rex_intransit","fieldValueMap":null},"statusCode":null},"reasonElement":null,"metaDataElement":{"translatorString":{"localisedStringId":null,"fieldValueMap":null}},"timeElement":"2021-06-08T03:00:00.000Z"},"isActive":true},{"position":2,"mileStoneType":"NORMAL","eventSummary":{"statusElement":{"translatorString":{"localisedStringId":"swa_rex_ofd","fieldValueMap":null},"statusCode":null},"reasonElement":null,"metaDataElement":{"translatorString":{"localisedStringId":null,"fieldValueMap":null}},"timeElement":"2021-06-08T21:41:45.000Z"},"isActive":true},{"position":3,"mileStoneType":"NORMAL","eventSummary":{"statusElement":{"translatorString":{"localisedStringId":"swa_rex_delivered","fieldValueMap":null},"statusCode":null},"reasonElement":null,"metaDataElement":{"translatorString":{"localisedStringId":null,"fieldValueMap":null}},"timeElement":"2021-06-08T21:41:45.000Z"},"isActive":true}]},"customerRescheduleRequestInfo":null,"errors":null,"summary":{"status":"Delivered","metadata":{"deliveryAddressId":{"stringValue":"XQI6PNXLLXFBJN4NYWJHYHJWYN4NJBFXLLXNP6IQXMHFRAQPXTQ2EIA4G28ARFHM","type":"STRING"},"promisedDeliveryDate":{"date":"2021-06-10T06:59:59.000Z","type":"DATE"},"expectedDeliveryDate":{"date":"2021-06-09T03:00:00.000Z","type":"DATE"},"trackingStatus":{"stringValue":"DELIVERED","type":null},"creationDate":{"date":"2021-06-07T19:12:05.156Z","type":null},"deliveryDate":{"date":"2021-06-08T21:41:45.000Z","type":"DATE"},"lastLegCarrier":{"stringValue":"Amazon","type":"STRING"}},"proofOfDelivery":null},"expectedDeliveryDate":"2021-06-09T03:00:00.000Z","legType":"FORWARD","hasDeliveryDelayed":false,"trackerSource":"MCF"}',
  //  eventHistory:
  //   '{"eventHistory":[{"eventCode":"CreationConfirmed","statusSummary":{"localisedStringId":"swa_rex_detail_creation_confirmed","fieldValueMap":null},"eventTime":"2021-06-07T19:12:20.000Z","location":null,"subReasonCode":null,"eventMetadata":{"eventImage":null}},{"eventCode":"Received","statusSummary":{"localisedStringId":"swa_rex_arrived_at_sort_center","fieldValueMap":null},"eventTime":"2021-06-08T04:11:25.000Z","location":{"addressId":null,"city":"Aurora","stateProvince":"CO","countryCode":"US","postalCode":"80011"},"subReasonCode":null,"eventMetadata":{"eventImage":null}},{"eventCode":"Departed","statusSummary":{"localisedStringId":"swa_rex_detail_departed","fieldValueMap":null},"eventTime":"2021-06-08T06:26:13.000Z","location":{"addressId":null,"city":"Aurora","stateProvince":"CO","countryCode":"US","postalCode":"80011"},"subReasonCode":null,"eventMetadata":{"eventImage":null}},{"eventCode":"Received","statusSummary":{"localisedStringId":"swa_rex_arrived_at_sort_center","fieldValueMap":null},"eventTime":"2021-06-08T09:30:16.000Z","location":{"addressId":null,"city":"THORNTON","stateProvince":"CO","countryCode":"US","postalCode":"80241"},"subReasonCode":null,"eventMetadata":{"eventImage":null}},{"eventCode":"OutForDelivery","statusSummary":{"localisedStringId":"swa_rex_detail_arrived_at_delivery_Center","fieldValueMap":null},"eventTime":"2021-06-08T16:13:52.000Z","location":{"addressId":null,"city":"THORNTON","stateProvince":"CO","countryCode":"US","postalCode":"80241"},"subReasonCode":"NONE","eventMetadata":{"eventImage":null}},{"eventCode":"Delivered","statusSummary":{"localisedStringId":"swa_rex_detail_delivered","fieldValueMap":null},"eventTime":"2021-06-08T21:41:45.000Z","location":{"addressId":"XQI6PNXLLXFBJN4NYWJHYHJWYN4NJBFXLLXNP6IQXMHFRAQPXTQ2EIA4G28ARFHM","city":null,"stateProvince":null,"countryCode":null,"postalCode":null},"subReasonCode":"DELIVERED_TO_HOUSEHOLD_MEMBER","eventMetadata":{"eventImage":null}}],"errors":null,"summary":{"status":null,"metadata":null,"proofOfDelivery":null},"trackerSource":"MCF"}',
  //  addresses:
  //   '{"XQI6PNXLLXFBJN4NYWJHYHJWYN4NJBFXLLXNP6IQXMHFRAQPXTQ2EIA4G28ARFHM":{"state":"CO","city":"BOULDER","country":"US","fullAddress":null}}',
  //  eligibleActions: null,
  //  proofOfDeliveryImage: null,
  //  notificationWeblabTreatment: null,
  //  claimYourPackageWeblabTreatment: null,
  //  packageMarketplaceDetail: null,
  //  returnDetails: null,
  //  shipperBrandingDetails: null,
  //  geocodeDetails: null }

  // console.debug("parsing progressTracker")
  // console.debug(response)
  const res = JSON.parse(response[0]['progressTracker'])
  // console.debug('got res')

  // console.debug('parsing eventHistory')
  const hist = JSON.parse(response[0]['eventHistory'])['eventHistory']
  // console.debug('getting last_event')
  const last_event = hist[hist.length - 1]

  let eventCode = last_event['eventCode'];
  if (eventCode == 'OutForDelivery') {
    eventCode = 'Out for delivery';
  }
  let eventTime = last_event['eventTime'];
  let dateTime;
  let dateStr = '';
  if (eventTime) {
    dateTime = new tc.DateTime(eventTime, tc.utc())
    dateTime = dateTime.convert(tc.local())
    dateStr = dateTime.format('yyyy-MM-dd hh:mm a')
  }
  let city = last_event['location']['city'];
  if (city) {
    city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    city = `${city}, `
  } else {
    city = ''
  }
  let state = last_event['location']['state'];
  if (!state) {
    state = ''
  }

  const summary = res['summary']
  const edd = res['expectedDeliveryDate']
  let eddStr = '';
  if (edd) {
    edd_dt = new tc.DateTime(edd, tc.utc())
    edd_dt = edd_dt.convert(tc.local())
    eddStr = ` - Expected: ${edd_dt.format('yyyy-MM-dd')}`
  }

  let stat = `${city}${state} (${dateStr}) - ${eventCode}${eddStr}`
  console.debug(`Status is "${stat}"`)
  return stat;
}

function titleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ');
}

parsers = {
  usps: uspsParser,
  ups: upsParser,
  fedex: fedExParser,
  ontrac: onTracParser,
  amazon: amazonParser
}

module.exports = parsers;
