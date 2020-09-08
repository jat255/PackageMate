import React from 'react';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import TabContainer from 'react-bootstrap/TabContainer'
import Table from 'react-bootstrap/Table'

import uspsLogo from '../img/usps.svg'
import fedexLogo from '../img/fedex.svg'
import upsLogo from '../img/ups.svg'
import ontracLogo from '../img/ontrac.svg'


const getUrl = (trackingNumber, carrier) => {
  if ( carrier === 'USPS' ){
    return `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`
  } else if ( carrier === 'UPS' ) {
    return `https://www.ups.com/track?loc=en_US&tracknum=${trackingNumber}`
  } else if ( carrier === 'FedEx' ) {
    return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}&locale=en_US`
  } else {
    return null
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
  return (
    <img src={svgPath} height="24px"/>
    )
}

const getLocaleDateString = (utcDate) => {
  let d = new Date(utcDate)
  return d.toLocaleString()
}

const ListPackages = ({ activePackages, archivedPackages, archivePacakge, updateAllPackages }) => {
  return (
    <TabContainer defaultActiveKey="active" style={{fontSize: 10}}>
      <Tabs fill defaultActiveKey="active" id="package-tabs">
        <Tab eventKey="active" title="Active">
          <Table striped hover size="sm" style={{fontSize: 12}}>
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
                            target='_blank'
                          >
                            {pkg.trackingNumber}
                          </a>
                        </td>
                        <td className='align-middle'>{pkg.description}</td>
                        <td className='align-middle'>{pkg.lastStatus}</td>
                        <td className='align-middle'>{getLocaleDateString(pkg.lastUpdate)}</td>
                        <td className='align-middle'>U</td>
                        <td className='align-middle'>X</td>
                      </tr> 
                    )})) 
                  :
                  <tr>
                    <td colSpan="6">No packages found in database!</td>
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
                  <th>Status</th>
                </tr>
            </thead>
            <tbody>
              {
                  archivedPackages && archivedPackages.length > 0 ?
                  (archivedPackages.map(pkg => {
                    return (
                      <tr key={pkg._id}>
                        <td className='align-middle'>{getLogo(pkg.carrier)}</td>
                        <td className='align-middle'>
                          <a 
                            href={'' + getUrl(pkg.trackingNumber, pkg.carrier)}
                            target='_blank'
                          >
                            {pkg.trackingNumber}
                          </a>
                        </td>
                        <td className='align-middle'>{pkg.description}</td>
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
    // <ListGroup>
    //     {
    //       todos &&
    //         todos.length > 0 ?
    //           (
    //             todos.map(todo => {
    //                 return (
    //                     <ListGroup.Item key={todo._id} onClick={() => deleteTodo(todo._id)}>{todo.action}</ListGroup.Item>
    //                 )
    //             })
    //           )
    //           :
    //           (
    //             <ListGroup.Item variant='warning'>No packages have been tracked!</ListGroup.Item>
    //           )
    //     }
    // </ListGroup>
  )
}

export default ListPackages
