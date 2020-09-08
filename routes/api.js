const express = require('express');
const router = express.Router();
const Package = require('../models/package');
const trackers = require('../3rd-party/trackers')
const parsers = require('../3rd-party/parsers')

router.get('/carriers', (req, res, next) => {
  // endpoint to return allowable carriers that
  // we know how to handle
  res.json(Package.schema.path('carrier').enumValues)
})

router.get('/packages', (req, res, next) => {
  // this will return all the data
  // to the client
  Package.find({})
    .then(data => res.json(data))
    .catch(next)
});

router.get('/packages/active', (req, res, next) => {
  // this will return packages with isArchived === false 
  Package.find({isArchived: false})
    .then(data => res.json(data))
    .catch(next)
});

router.get('/packages/update/:id', (req, res, next) => {
  // update a package's status via third-party API
  Package.findById(req.params.id)
    .then(data => {
      if ( data.carrier === 'USPS' ){
        r = trackers.usps(data.trackingNumber);
      } else if ( data.carrier === 'FedEx') {
        r = trackers.fedex(data.trackingNumber);
      } else if ( data.carrier === 'UPS' ) {
        r = trackers.ups(data.trackingNumber);
      } else if ( data.carrier === 'OnTrac' ) {
        r = trackers.ontrac(data.trackingNumber);
      } else {
        r = Promise.reject(`Did not know how to process carrier: ${data.carrier}`);
      }
      // once the promise has returned, parse the result (method depends on carrier)
      Promise.all([r])
      .then(results => {
        if ( data.carrier === 'USPS' ){
          stat = parsers.usps(results);
        } else if ( data.carrier === 'FedEx') {
          stat = parsers.fedex(results);
        } else if ( data.carrier === 'UPS' ) {
          stat = parsers.ups(results);
        } else if ( data.carrier === 'OnTrac' ) {
          stat = parsers.ontrac(results);
        } else {
          stat = 'Could not parse tracker response'
        }
        // send status in response
        res.json({
          carrier: data.carrier,
          trackingNumber: data.trackingNumber,
          status: stat
        })
      })
      .catch(results => {
        res.json({
          carrier: data.carrier,
          trackingNumber: data.trackingNumber,
          status: results[0]
        })
      })
    })
    .catch(next)
});

router.get('/packages/archived', (req, res, next) => {
  // this will return packages with isArchived === true
  Package.find({isArchived: true})
    .then(data => res.json(data))
    .catch(next)
});

router.post('/packages', (req, res, next) => {
  // adds a package with the given carrier and Tracking number;
  // dateAdded, lastStatus, and isArchived have default values
    if(req.body.carrier && req.body.trackingNumber){
        Package.create(req.body)
          .then(data => res.json(data))
          .catch(next)
    } else {
      res.json({
        error: "Tracking number and carrier must be provided"
    })
    }
});

router.delete('/packages/:id', (req, res, next) => {
    Package.updateOne(
        {"_id": req.params.id},
        {isArchived: true})
      .then(data => res.json(data))
      .catch(next)
});

module.exports = router;
