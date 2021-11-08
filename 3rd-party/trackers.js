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
      console.log(`UPS tracker res: ${res.data}`);
      return res.data
    })
    .catch(err => {return err})
}

const fedExTracker = (trackingNumber) => {
  const url = `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}&locale=en_US`;
  // async function to scrape status from fedex website (since API is
  // unreliable...)
  return (async () => {
    const browser = await playwright.chromium.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto(url);
    const STATUS_SELECTOR = 'table.travel-history-table';
    const DELIVERY_DATE_SELECTOR = '[data-test-id=delivery-date-text]';
    await page.waitForSelector(STATUS_SELECTOR);
    let results = await page.$(STATUS_SELECTOR);
    let text = await results.evaluate(element => element.innerText);
    let res = text.split('\n')

    // get expected delivery date
    await page.waitForSelector(DELIVERY_DATE_SELECTOR)
    results = await page.$(DELIVERY_DATE_SELECTOR);
    text = await results.evaluate(element => element.innerText);
    if (text) {
      res.push(text);
    }

    console.log(`Fedex tracker res: ${res}`);
    await browser.close();
    return res;
  })();
  
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
    const EXP_DELIVERY_SELECTOR = ''

    console.log(`Ontrac tracker res: ${res}`);

    return res;
    // Returns array of ["date", "time", "status", "location"]
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
