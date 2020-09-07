const uspsParser = (response) => {
  const jsdom = require("jsdom");
  const dom = new jsdom.JSDOM(response);
  const stat = dom.window.document.querySelector("TrackSummary").textContent;
  
  return stat;
}

const upsParser = (response) => {
  return 'UPS parser not yet implemented';
}

const fedExParser = (response) => {
  return 'FedEx parser not yet implemented';
}

const onTracParser = (response) => {
  return 'OnTrac parser not yet implemented';
}

parsers = {
  usps: uspsParser,
  ups: upsParser,
  fedex: fedExParser,
  ontrac: onTracParser
}

module.exports = parsers;
