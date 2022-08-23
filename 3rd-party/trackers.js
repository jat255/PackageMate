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
    .catch(err => {return err})
}

const upsTracker = (trackingNumber) => {
  let url = "https://onlinetools.ups.com/track/v1/details/"

  return axios.get(`${url}${trackingNumber}`, {
    headers: {
      'AccessLicenseNumber': `${process.env.UPS_ACCESS_KEY}`
    }
  })
    .then(res => {
      console.log(`UPS tracker res: ${util.inspect(res.data, depth=null)}`);
      return res.data
    })
    .catch(err => {return err})
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
  const url = `https://www.ontrac.com/trackingresults.asp?tracking_number=${trackingNumber}`;

  // async function to scrape status from ontrac website (since API is
  // unavailable...)
  return (async () => {
    const browser = await playwright.chromium.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto(url);
    
    // Click on "See Details link"
    const DETAILS_SELECTOR = 'div.trackNumber a';
    await page.waitForSelector(DETAILS_SELECTOR)
    const results = await page.$(DETAILS_SELECTOR);
    results.click();

    // Get most recent event
    const EVENT_SELECTOR = '//tbody[@id="OnTracEvents"]/tr'
    await page.waitForSelector(EVENT_SELECTOR)
    const results2 = await page.$(EVENT_SELECTOR);
    const text = await results2.evaluate(element => element.innerText);
    let res = text.split(/[\n\t]+/)
    res = res.slice(0, res.length - 1)

    // get expected delivery date (if present)
    // const EXP_DELIVERY_SELECTOR = '#trackOverview > div > ul > li.trackDestination > ul > li:nth-child(2) > ul > li'
    // await page.waitForSelector(EXP_DELIVERY_SELECTOR)
    // results = await page.$(EXP_DELIVERY_SELECTOR);
    // text = await results.evaluate(element => element.innerText);
    // if (text) {
    //   res.push(text);
    // }

    console.log(`Ontrac tracker res: ${res}`);

    return res;
    // Returns array of ["date", "time", "status", "location", "expected"]
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
    .catch(err => {return err})
}

trackers = {
  usps: uspsTracker,
  ups: upsTracker,
  fedex: fedExTracker,
  ontrac: onTracTracker,
  amazon: amazonTracker
}

module.exports = trackers;
