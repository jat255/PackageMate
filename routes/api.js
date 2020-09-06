const express = require('express');
const router = express.Router();
const Package = require('../models/package');

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
      res.json({
        carrier: data.carrier,
        trackingNumber: data.trackingNumber
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
