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
  return Promise.reject(`OnTrac tracking not yet implemented`);
}

trackers = {
  usps: uspsTracker,
  ups: upsTracker,
  fedex: fedExTracker,
  ontrac: onTracTracker
}

module.exports = trackers;
