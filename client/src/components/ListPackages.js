import React from 'react';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import TabContainer from 'react-bootstrap/TabContainer'
import Table from 'react-bootstrap/Table'

import LaddaButton, { XS } from 'react-ladda';

import uspsLogo from '../img/usps.svg'
import fedexLogo from '../img/fedex.svg'
import upsLogo from '../img/ups.svg'
import ontracLogo from '../img/ontrac.svg'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons'

import UpdateOnePackage from './UpdateOneButton'

const getUrl = (trackingNumber, carrier) => {
  if ( carrier === 'USPS' ){
    return `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`
  } else if ( carrier === 'UPS' ) {
    return `https://www.ups.com/track?loc=en_US&tracknum=${trackingNumber}`
  } else if ( carrier === 'FedEx' ) {
    return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}&locale=en_US`
  } else {
    return `https://www.ontrac.com/trackingresults.asp?tracking_number=${trackingNumber}`
  }
}

const getLogo = (carrier) => {
  let logo
  if ( carrier === 'USPS' ){
    logo = uspsLogo
  } else if ( carrier === 'UPS' ) {
    logo = upsLogo
  } else if ( carrier === 'FedEx' ) {
    logo = fedexLogo
  } else if ( carrier === 'OnTrac' ) {
    logo = ontracLogo
  } else {
    logo = null
  }
  const svgPath = `${logo}#svgView(preserveAspectRatio(none))`;
  const altText = `${carrier} logo`
  return (
    <img alt={altText} src={svgPath} height="24px"/>
    )
}

const getLocaleDateString = (utcDate) => {
  let d = new Date(utcDate)
  return d.toLocaleString()
}

const ListPackages = ({ activePackages, archivedPackages, archivePackage, updateOnePackage, getPackages }) => {
  return (
    <TabContainer defaultActiveKey="active" style={{fontSize: 10}}>
      <Tabs fill defaultActiveKey="active" id="package-tabs">
        <Tab eventKey="active" title="Active">
          <Table responsive striped hover size="sm" style={{fontSize: 12}}>
          <thead>
                <tr>
                  <th>Carrier</th>
                  <th>Tracking #</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Last update</th>
                  <th>Update</th>
                  <th>Archive?</th>
                </tr>
              </thead>
              <tbody>
                {
                  activePackages && activePackages.length > 0 ?
                  (activePackages.map(pkg => {
                    return (
                      <tr key={pkg._id}>
                        <td className='align-middle'>{getLogo(pkg.carrier)}</td>
                        <td className='align-middle'>
                          <a 
                            href={'' + getUrl(pkg.trackingNumber, pkg.carrier)}
                            target='_blank' rel="noopener noreferrer"
                          >
                            {pkg.trackingNumber}
                          </a>
                        </td>
                        <td className='align-middle'>{pkg.description}</td>
                        <td className='align-middle'>{pkg.lastStatus}</td>
                        <td className='align-middle'>{getLocaleDateString(pkg.lastUpdate)}</td>
                        <td className='align-middle'>
                          <UpdateOnePackage 
                            pkg={pkg}
                            updateOnePackage={updateOnePackage}
                            getPackages={getPackages}
                          />
                        </td>
                        <td className='align-middle'>
                          <LaddaButton 
                            onClick={() => archivePackage(pkg._id)}
                            data-size={XS}
                            className='btn btn-outline-danger'>
                            <FontAwesomeIcon icon={faBoxOpen}/>
                          </LaddaButton>
                        </td>
                      </tr> 
                    )})) 
                  :
                  <tr>
                    <td colSpan="7">No active packages found in database!</td>
                  </tr>
                }
              </tbody>
          </Table>
        </Tab>
        <Tab eventKey="archived" title="Archived">
          <Table striped hover size="sm" style={{fontSize: 12}}>
            <thead>
                <tr>
                  <th>Carrier</th>
                  <th>Tracking #</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
            </thead>
            <tbody>
              {
                  archivedPackages && archivedPackages.length > 0 ?
                  (archivedPackages.sort((a, b) => {
                    // sort in descending order (newest first)
                    return new Date(b.lastUpdate) - new Date(a.lastUpdate);
                    }).map(pkg => {
                    return (
                      <tr key={pkg._id}>
                        <td className='align-middle'>{getLogo(pkg.carrier)}</td>
                        <td className='align-middle'>
                          <a 
                            href={'' + getUrl(pkg.trackingNumber, pkg.carrier)}
                            target='_blank' rel="noopener noreferrer"
                          >
                            {pkg.trackingNumber}
                          </a>
                        </td>
                        <td className='align-middle'>{pkg.description}</td>
                        <td className='align-middle'>{getLocaleDateString(pkg.lastUpdate)}</td>
                        <td className='align-middle'>{pkg.lastStatus}</td>
                      </tr> 
                    )})) 
                  :
                  <tr>
                    <td colSpan="4">No packages found in database!</td>
                  </tr>
                }
              </tbody>
          </Table>        
          </Tab>
      </Tabs>
    </TabContainer>
  )
}

export default ListPackages
