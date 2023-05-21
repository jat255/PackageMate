const util = require('util')

const uspsParser = (response) => {
  const jsdom = require("jsdom");
  const dom = new jsdom.JSDOM(response);
  let stat 
  try {
    stat = dom.window.document.querySelector("TrackSummary").textContent;
  } catch (error) {
    console.error(error);
    try {
      stat = dom.window.document.querySelector("Description").textContent;
    } catch (error) {
      console.error(error);
      stat = "Could not parse USPS response";
    }
  }
  
  return stat;
}

const upsParser = (response) => {
  // console.debug("response:")
  // console.debug(util.inspect(response, depth=null));
  // console.debug("response[0].trackResponse.shipment[0]")
  // console.debug(util.inspect(response[0].trackResponse.shipment[0], depth=null))
  console.debug("response[0].trackResponse.shipment[0].package[0].deliveryDate[0].date")
  try {
    console.debug(util.inspect(response[0].trackResponse.shipment[0].package[0].deliveryDate[0].date, depth=null))  }
  catch(err) {
    console.debug("No delivery date found")
  }
  console.debug(" ")
  console.debug("lastActivity")
  let lastActivity = response[0].trackResponse.shipment[0].package[0].activity[0];
  console.debug(util.inspect(lastActivity))
  console.debug(" ")
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
  let expectedDeliveryDate;
  console.debug("getting expectedDeliveryDate")
  try {
    expectedDeliveryDate = response[0].trackResponse.shipment[0].package[0].deliveryDate[0].date;
  } catch(err) {
    console.debug('expectedDeliveryDate undefined!');
    expectedDeliveryDate = '';
  }
  console.debug(`expectedDeliveryDate: ${expectedDeliveryDate}`)
  console.debug(" ")
  // date is in '20211117' format
  var tc = require("timezonecomplete");

  let city = `${lastActivity.location.address.city}`
  city = titleCase(city);
  console.debug(`city: ${city}`);
  let state = `${lastActivity.location.address.stateProvince}`
  console.debug(`state: ${state}`);

  let location;
  if (city == '' && state == '') {
    location = 'Unknown location';
  } else if (city == '') {
    location = state;
  } else if (state == '') {
    location = city;
  } else {
    location = `${city}, ${state}`;
  }
  console.debug(`location: ${location}`);

  let desc = `${lastActivity.status.description}`
  console.debug(`desc: ${desc}`);
  let dateRegex = /(\d{4})(\d{2})(\d{2})/;
  let dateArray = dateRegex.exec(`${lastActivity.date}`); 
  console.debug(`dateArray: ${dateArray}`);
  let expectedDateArray = dateRegex.exec(expectedDeliveryDate);
  console.debug(`expectedDateArray: ${expectedDateArray}`);
  let expectedDateStr = 'Unknown';
  if (expectedDateArray !== null) {
    let expectedDate = new tc.DateTime(
      (+expectedDateArray[1]),
      (+expectedDateArray[2]),
      (+expectedDateArray[3])
    );
    expectedDateStr = expectedDate.format("yyyy-MM-dd"); 
  }
  console.debug(`expectedDateStr: ${expectedDateStr}`);
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

  let stat = `${location} (${updateDate.format("yyyy-MM-dd hh:mm a")}) – ${desc}
Expected: ${expectedDateStr}`
  
  return stat
}

const fedExParser = (response) => {
  // response looks like:
  // {
  //   "transactionId": "4686ea11-12da-4f30-a25c-3498bb76fade",
  //   "output": {
  //     "completeTrackResults": [
  //       {
  //         "trackingNumber": "277053421731",
  //         "trackResults": [
  //           {
  //             "trackingNumberInfo": {
  //               "trackingNumber": "277053421731",
  //               "trackingNumberUniqueId": "12024~277053421731~FDEG",
  //               "carrierCode": "FDXG"
  //             },
  //             "additionalTrackingInfo": {
  //               "nickname": "",
  //               "hasAssociatedShipments": false
  //             },
  //             "shipperInformation": {
  //               "contact": {},
  //               "address": {
  //                 "city": "Memphis",
  //                 "stateOrProvinceCode": "TN",
  //                 "countryCode": "US",
  //                 "residential": false,
  //                 "countryName": "United States"
  //               }
  //             },
  //             "recipientInformation": {
  //               "contact": {},
  //               "address": {
  //                 "city": "HOLDERNESS",
  //                 "stateOrProvinceCode": "NH",
  //                 "countryCode": "US",
  //                 "residential": false,
  //                 "countryName": "United States"
  //               }
  //             },
  //             "latestStatusDetail": {
  //               "code": "DP",
  //               "derivedCode": "IT",
  //               "statusByLocale": "In transit",
  //               "description": "Departed FedEx location",
  //               "scanLocation": {
  //                 "city": "MEMPHIS",
  //                 "stateOrProvinceCode": "TN",
  //                 "countryCode": "US",
  //                 "residential": false,
  //                 "countryName": "United States"
  //               },
  //               "delayDetail": {
  //                 "status": "ON_TIME"
  //               }
  //             },
  //             "dateAndTimes": [
  //               {
  //                 "type": "ESTIMATED_DELIVERY",
  //                 "dateTime": "2022-08-25T00:00:00-06:00"
  //               },
  //               {
  //                 "type": "COMMITMENT",
  //                 "dateTime": "2022-08-25T00:00:00-06:00"
  //               },
  //               {
  //                 "type": "ACTUAL_PICKUP",
  //                 "dateTime": "2022-08-22T00:00:00-06:00"
  //               },
  //               {
  //                 "type": "SHIP",
  //                 "dateTime": "2022-08-22T00:00:00-06:00"
  //               },
  //               {
  //                 "type": "ACTUAL_TENDER",
  //                 "dateTime": "2022-08-22T00:00:00-06:00"
  //               },
  //               {
  //                 "type": "ANTICIPATED_TENDER",
  //                 "dateTime": "2022-08-22T00:00:00-06:00"
  //               }
  //             ],
  //             "availableImages": [],
  //             "packageDetails": {
  //               "packagingDescription": {
  //                 "type": "YOUR_PACKAGING",
  //                 "description": "Package"
  //               },
  //               "physicalPackagingType": "PACKAGE",
  //               "sequenceNumber": "1",
  //               "count": "1",
  //               "weightAndDimensions": {
  //                 "weight": [
  //                   {
  //                     "value": "5.3",
  //                     "unit": "LB"
  //                   },
  //                   {
  //                     "value": "2.4",
  //                     "unit": "KG"
  //                   }
  //                 ]
  //               },
  //               "packageContent": []
  //             },
  //             "shipmentDetails": {
  //               "possessionStatus": true
  //             },
  //             "scanEvents": [
  //               {
  //                 "date": "2022-08-23T09:59:57-05:00",
  //                 "eventType": "DP",
  //                 "eventDescription": "Departed FedEx location",
  //                 "exceptionCode": "",
  //                 "exceptionDescription": "",
  //                 "scanLocation": {
  //                   "streetLines": [
  //                     ""
  //                   ],
  //                   "city": "MEMPHIS",
  //                   "stateOrProvinceCode": "TN",
  //                   "postalCode": "38106",
  //                   "countryCode": "US",
  //                   "residential": false,
  //                   "countryName": "United States"
  //                 },
  //                 "locationId": "0381",
  //                 "locationType": "FEDEX_FACILITY",
  //                 "derivedStatusCode": "IT",
  //                 "derivedStatus": "In transit"
  //               },
  //               {
  //                 "date": "2022-08-22T17:07:00-05:00",
  //                 "eventType": "AR",
  //                 "eventDescription": "Arrived at FedEx location",
  //                 "exceptionCode": "",
  //                 "exceptionDescription": "",
  //                 "scanLocation": {
  //                   "streetLines": [
  //                     ""
  //                   ],
  //                   "city": "MEMPHIS",
  //                   "stateOrProvinceCode": "TN",
  //                   "postalCode": "38106",
  //                   "countryCode": "US",
  //                   "residential": false,
  //                   "countryName": "United States"
  //                 },
  //                 "locationId": "0381",
  //                 "locationType": "FEDEX_FACILITY",
  //                 "derivedStatusCode": "IT",
  //                 "derivedStatus": "In transit"
  //               },
  //               {
  //                 "date": "2022-08-22T10:37:00-05:00",
  //                 "eventType": "OC",
  //                 "eventDescription": "Shipment information sent to FedEx",
  //                 "exceptionCode": "",
  //                 "exceptionDescription": "",
  //                 "scanLocation": {
  //                   "streetLines": [
  //                     ""
  //                   ],
  //                   "postalCode": "38118",
  //                   "countryCode": "US",
  //                   "residential": false,
  //                   "countryName": "United States"
  //                 },
  //                 "locationType": "CUSTOMER",
  //                 "derivedStatusCode": "IN",
  //                 "derivedStatus": "Initiated"
  //               },
  //               {
  //                 "date": "2022-08-22T00:00:00",
  //                 "eventType": "PU",
  //                 "eventDescription": "Picked up",
  //                 "exceptionCode": "",
  //                 "exceptionDescription": "",
  //                 "scanLocation": {
  //                   "streetLines": [
  //                     ""
  //                   ],
  //                   "city": "OLIVE BRANCH",
  //                   "stateOrProvinceCode": "MS",
  //                   "postalCode": "38654",
  //                   "countryCode": "US",
  //                   "residential": false,
  //                   "countryName": "United States"
  //                 },
  //                 "locationId": "0386",
  //                 "locationType": "PICKUP_LOCATION",
  //                 "derivedStatusCode": "PU",
  //                 "derivedStatus": "Picked up"
  //               }
  //             ],
  //             "availableNotifications": [
  //               "ON_DELIVERY",
  //               "ON_EXCEPTION"
  //             ],
  //             "deliveryDetails": {
  //               "deliveryAttempts": "0",
  //               "deliveryOptionEligibilityDetails": [
  //                 {
  //                   "option": "INDIRECT_SIGNATURE_RELEASE",
  //                   "eligibility": "POSSIBLY_ELIGIBLE"
  //                 },
  //                 {
  //                   "option": "REDIRECT_TO_HOLD_AT_LOCATION",
  //                   "eligibility": "POSSIBLY_ELIGIBLE"
  //                 },
  //                 {
  //                   "option": "REROUTE",
  //                   "eligibility": "POSSIBLY_ELIGIBLE"
  //                 },
  //                 {
  //                   "option": "RESCHEDULE",
  //                   "eligibility": "POSSIBLY_ELIGIBLE"
  //                 },
  //                 {
  //                   "option": "RETURN_TO_SHIPPER",
  //                   "eligibility": "POSSIBLY_ELIGIBLE"
  //                 },
  //                 {
  //                   "option": "DISPUTE_DELIVERY",
  //                   "eligibility": "POSSIBLY_ELIGIBLE"
  //                 },
  //                 {
  //                   "option": "SUPPLEMENT_ADDRESS",
  //                   "eligibility": "INELIGIBLE"
  //                 }
  //               ]
  //             },
  //             "originLocation": {
  //               "locationContactAndAddress": {
  //                 "address": {
  //                   "city": "OLIVE BRANCH",
  //                   "stateOrProvinceCode": "MS",
  //                   "countryCode": "US",
  //                   "residential": false,
  //                   "countryName": "United States"
  //                 }
  //               }
  //             },
  //             "lastUpdatedDestinationAddress": {
  //               "city": "HOLDERNESS",
  //               "stateOrProvinceCode": "NH",
  //               "countryCode": "US",
  //               "residential": false,
  //               "countryName": "United States"
  //             },
  //             "serviceDetail": {
  //               "type": "GROUND_HOME_DELIVERY",
  //               "description": "FedEx Home Delivery",
  //               "shortDescription": "HD"
  //             },
  //             "standardTransitTimeWindow": {
  //               "window": {
  //                 "ends": "2022-08-25T00:00:00-06:00"
  //               }
  //             },
  //             "estimatedDeliveryTimeWindow": {
  //               "window": {}
  //             },
  //             "goodsClassificationCode": "",
  //             "returnDetail": {}
  //           }
  //         ]
  //       }
  //     ]
  //   }
  // }
  console.debug('Parsing Fedex response[0]');
  console.debug(JSON.stringify(response[0], undefined, 2));
  response = response[0];

  if (response && typeof response === 'object' && 'error' in response) {
    console.debug('Found error, so returning error message')
    return response.error;
  }

  console.debug("Loading timezonecomplete")
  var tc = require("timezonecomplete");

  console.debug("Extracting trackResults")
  let trackResults = response.output.completeTrackResults[0].trackResults[0];
  console.debug(`trackResults: ${JSON.stringify(trackResults, undefined, 2)}`);

  // catch tracking error early
  if (trackResults && typeof trackResults === 'object' && 'error' in trackResults) {
    console.debug('Found error in track results, returning error message:');
    console.debug(trackResults.error.message)
    return trackResults.error.message;
  }

  let scanEvents = trackResults.scanEvents;
  console.debug(`scanEvents: ${JSON.stringify(scanEvents, undefined, 2)}`);

  let latestScan = scanEvents[0];
  console.debug(`latestScan: ${JSON.stringify(latestScan, undefined, 2)}`);
  
  let dateAndTimes = trackResults.dateAndTimes;
  console.debug(`dateAndTimes: ${JSON.stringify(dateAndTimes, undefined, 2)}`);
  
  // get expected delivery date
  const estimatedDate = dateAndTimes.find(item => item.type === 'ESTIMATED_DELIVERY');
  console.debug(`estimatedDate: ${JSON.stringify(estimatedDate, undefined, 2)}`);

  let estimatedDateText
  if (estimatedDate === undefined) {
    estimatedDateText = 'Expected date unknown'
  } else {
    estimatedDateText = `Expected: ${new tc.DateTime(estimatedDate.dateTime).format('YYYY-MM-dd')}`
  }
  console.debug(`estimatedDateText: ${estimatedDateText}`)

  // get current location and status
  let locationString;
  let city = latestScan.scanLocation.city;
  console.debug(`city: ${city}`)
  let state = latestScan.scanLocation.stateOrProvinceCode;
  console.debug(`state: ${state}`)
  
  if (city === undefined && state === undefined) {
    locationString = 'Unknown location'
  } else {
    locationString = `${titleCase(city).trim()}, ${state}`
  }
  console.debug(`locationString: ${locationString}`)


  let desc = latestScan.eventDescription;
  console.debug(`desc: ${desc}`)

  let scanDate = new tc.DateTime(latestScan.date).format("(yyyy-MM-dd hh:mm a)")
  console.debug(`scanDate: ${scanDate}`)

  let status = `${locationString} ${scanDate} - ${desc}
  ${estimatedDateText}`
  console.debug(`status: ${status}`)


  return status
}

const onTracParser = (response) => {
  var tc = require("timezonecomplete");
  let res = response[0];
  // response format:
  // {
  //   expected_date: '05/23/23',
  //   event_summary: 'Package en route.',
  //   event_detail: 'The package arrived at an originating OnTrac location and is on its way to your local OnTrac facility for final delivery.',
  //   event_location: 'PHOENIX, AZ',
  //   event_date: '05/20/23 at 6:55 PM'
  // }
  let [city, state] = res.event_location.split(', ');
  city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  console.debug(`city, state: ${city}, ${state}`);
  let [event_date, event_time] = res.event_date.split(' at ');
  let dateTime = new tc.DateTime(
    `${event_date} - ${event_time}`,
    "MM/dd/yy - hh:mm aa"
  )

  let stat = `${city}, ${state} (${dateTime.format("yyyy-MM-dd hh:mm a")}) - ${res.event_summary} <br> ${res.event_detail} <br> Expected: ${res.expected_date}`;
  console.debug(`stat: ${stat}`)
  // Expected: ${res[res.length - 1]}`;
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

  console.debug("parsing progressTracker")
  console.debug(response[0])
  const res = JSON.parse(response[0]['progressTracker'])
  console.debug('got res')

  if ('errors' in res) {
    return `Error from parser: ${titleCase(res.errors[0].errorMessage)}`
  }

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
  if (str == '') return '';
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
