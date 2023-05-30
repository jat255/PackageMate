const util = require('util')
const axios = require('axios');
const playwright = require('playwright');

const uspsTracker = (trackingNumber) => {
  let url = "https://secure.shippingapis.com/ShippingAPI.dll?API=TrackV2&XML=";
  let xml = `<TrackRequest USERID=\"${process.env.USPS_USERNAME}\"><TrackID ID=\"${trackingNumber}\"></TrackID></TrackRequest>`
  console.debug(`Using url ${url} with  xml ${xml}`);
  return axios.get(`${url}${xml}`)
    .then(res => {
      console.log(`USPS tracker res: ${res.data}`);
      return res.data
    })
    .catch(err => { 
      return err 
    })
}

const upsTracker = (trackingNumber) => {
  let url = "https://onlinetools.ups.com/track/v1/details/"

  return axios.get(`${url}${trackingNumber}`, {
    headers: {
      'AccessLicenseNumber': `${process.env.UPS_ACCESS_KEY}`
    }
  })
    .then(res => {
      console.log(`UPS tracker res: ${util.inspect(res.data, depth = null)}`);
      return res.data
    })
    .catch(err => { return err })
}

const fedExTracker = (trackingNumber) => {
  // get bearer token

  let url = `${process.env.FEDEX_API_URL}/oauth/token`

  let params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', process.env.FEDEX_API_KEY);
  params.append('client_secret', process.env.FEDEX_SECRET_KEY);

  let options = {
    method: 'POST',
    url: url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: params
  };

  console.debug(`Getting Fedex tracking information for ${trackingNumber}`)

  // first get access_token at auth endpoint
  return axios.request(options)
    .then((response) => {
      // if we succeeded, save access token and use to call Track API
      console.debug("FedEx: Got API access tokent")
      let access_token = response.data.access_token;
      let track_url = `${process.env.FEDEX_API_URL}/track/v1/trackingnumbers`
      let track_options = {
        method: 'POST', url: track_url,
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        data: {
          trackingInfo: [
            {
              'trackingNumberInfo': {
                'trackingNumber': trackingNumber
              }
            }
          ],
          'includeDetailedScans': true
        }
      };
      return axios.request(track_options)
        .then((response) => {
          console.log(`Fedex tracker res: ${util.inspect(response.data, depth = 4)}`);
          return response.data;
        }).catch((error) => {
          console.error('Fedex tracker error:')
          console.error(error);
          return { 'error': `Error getting tracking info: ${error.toJSON().message}` }
        })
    }).catch((error) => {
      console.error(error);
      return { 'error': `Error authenticating to API: ${error.toJSON().message}` }
    });
}

const onTracTracker = (trackingNumber) => {
  const url = `https://www.ontrac.com/tracking/?number=${trackingNumber}`;

  // async function to scrape status from ontrac website (since API is
  // unavailable...)
  return (async () => {
    const browser = await playwright.chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url);

    // Get expected delivery date
    const EXP_DELIVERY_SELECTOR = 'p[name="ExpectedDeliveryDateFormatted"]';
    await page.waitForSelector(EXP_DELIVERY_SELECTOR);
    const exp_delivery_res = await page.$(EXP_DELIVERY_SELECTOR);
    let exp_delivery_date = await exp_delivery_res.evaluate(element => element.innerText);

    const LATEST_EVENT_SELECTOR = 'p[name="EventShortDescriptionFormatted"]';
    await page.waitForSelector(LATEST_EVENT_SELECTOR);
    const latest_event_res = await page.$(LATEST_EVENT_SELECTOR);
    let latest_event_text = await latest_event_res.evaluate(el => el.innerText);

    const LATEST_EVENT_DETAIL_SELECTOR = 'p[name="EventLongDescriptionFormatted"]';
    await page.waitForSelector(LATEST_EVENT_DETAIL_SELECTOR);
    const latest_event_detail_res = await page.$(LATEST_EVENT_DETAIL_SELECTOR);
    let latest_event_detail_text = await latest_event_detail_res.evaluate(el => el.innerText);

    const LOCATION_SELECTOR = 'p[name="EventCityFormatted"]';
    await page.waitForSelector(LOCATION_SELECTOR);
    const location_res = await page.$(LOCATION_SELECTOR);
    let location_text = await location_res.evaluate(el => el.innerText);

    const EVENT_DATE_SELECTOR = 'p[name="EventLastDateFormatted"]';
    await page.waitForSelector(EVENT_DATE_SELECTOR);
    const event_date_res = await page.$(EVENT_DATE_SELECTOR);
    let event_date_text = await event_date_res.evaluate(el => el.innerText);

    let res = {
      expected_date: exp_delivery_date,
      event_summary: latest_event_text,
      event_detail: latest_event_detail_text,
      event_location: location_text,
      event_date: event_date_text
    }

    // console.log(`Ontrac tracker res: ${res}`);
    console.debug(`Ontrac tracker res: ${util.inspect(res, depth = null)}`);

    // Returns object with keys of 
    // ["expected_date", "event_summary", "event_detail", "event_location", "event_date"]
    return res;
  })();
}

amazonTracker = (trackingNumber) => {
  let url = `https://track.amazon.com/api/tracker/${trackingNumber}`
  console.debug(`Fetching Amazon status with url: ${url}`);
  return axios.get(url)
    .then(res => {
      // console.debug(`returning Amazon ${res.data}`)
      return res.data
    })
    .catch(err => { return err })
}

trackers = {
  usps: uspsTracker,
  ups: upsTracker,
  fedex: fedExTracker,
  ontrac: onTracTracker,
  amazon: amazonTracker
}

module.exports = trackers;
