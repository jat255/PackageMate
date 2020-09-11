const axios = require('axios');
const fs = require('fs');
const playwright = require('playwright');

const uspsTracker = (trackingNumber) => {
  let url = process.env.USPS_URL
  let xml = `<TrackRequest USERID=\"${process.env.USPS_USERNAME}\"><TrackID ID=\"${trackingNumber}\"></TrackID></TrackRequest>`
  
  return axios.get(`${url}${xml}`)
    .then(res => {
      return res.data
    })
    .catch(err => {return err})
}

const upsTracker = (trackingNumber) => {
  let url = process.env.UPS_URL

  return axios.get(`${url}${trackingNumber}`, {
    headers: {
      'AccessLicenseNumber': `${process.env.UPS_ACCESS_KEY}`
    }
  })
    .then(res => {
      return res.data
    })
    .catch(err => {return err})
}

const fedExTracker = (trackingNumber) => {
  const url = `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}&locale=en_US`;

  // async function to scrape status from fedex website (since API is
  // unreliable...)
  return (async () => {
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const STATUS_SELECTOR = 'ul.redesignTravelHistory';
    await page.waitForSelector(STATUS_SELECTOR);
    const results = await page.$(STATUS_SELECTOR);
    const text = await results.evaluate(element => element.innerText);
    const res = text.split('\n')
    await browser.close();
    return res;
  })();
  
}

const onTracTracker = (trackingNumber) => {
  const url = `https://www.ontrac.com/trackingresults.asp?tracking_number=${trackingNumber}`;

  // async function to scrape status from ontrac website (since API is
  // unavailable...)
  return (async () => {
    const browser = await playwright.chromium.launch();
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
  console.log(res)
  return res;
  // Returns array of ["date", "time", "status", "location"]
  })();
}

trackers = {
  usps: uspsTracker,
  ups: upsTracker,
  fedex: fedExTracker,
  ontrac: onTracTracker
}

module.exports = trackers;
