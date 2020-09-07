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
  return Promise.reject(`UPS tracking not yet implemented`);
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
