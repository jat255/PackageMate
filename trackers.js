const axios = require('axios');

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
  return Promise.reject(`FedEx tracking not yet implemented`);
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
