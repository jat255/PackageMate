# Self-hosted package tracking

This is a simple app using MongoDB, Express.js, React, and Node to allow a user
to create _package_ records and fetch their status from the carriers' APIs.

It requires access to the carriers' API tools, which differs a bit for each carrier. The
following links have more information on how to create accounts and get credientials.

### Tracking APIs:

USPS: 
  - https://www.usps.com/business/web-tools-apis/track-and-confirm-api_files/track-and-confirm-api.htm#_Toc41911503
  - Sign up here (free): https://www.usps.com/business/web-tools-apis/documentation-updates.htm

UPS: 
 - https://www.ups.com/upsdeveloperkit/
 - Sign up here (free, but need a UPS account with payment method attached): https://www.ups.com/upsdeveloperkit/announcements

Fedex: 
 - https://www.fedex.com/en-us/developer/web-services.html
 - Sign up here: https://www.fedex.com/en-us/developer/web-services/process.html#develop

## Initial setup

Rename the `.env.example` file to `.env`, and replace the values indicated with ones
that make sense for you (where MongoDB is installed, and your API credentials for each
service).