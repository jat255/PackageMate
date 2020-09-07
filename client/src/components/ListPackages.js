import React from 'react';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import TabContainer from 'react-bootstrap/TabContainer'
import Table from 'react-bootstrap/Table'

const ListPackages = ({ activePackages, archivedPackages, archivePacakge }) => {
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
                        <td>{pkg.carrier}</td>
                        <td>{pkg.trackingNumber}</td>
                        <td>{pkg.description}</td>
                        <td>{pkg.lastStatus}</td>
                        <td>{pkg.lastUpdate}</td>
                        <td>U</td>
                        <td>X</td>
                      </tr> 
                    )})) 
                  :
                  <td colSpan="6">No packages found in database!</td>
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
                  <th>Delivered Date</th>
                  <th>Archive?</th>
                </tr>
            </thead>
            <tbody>
              {
                  archivedPackages && archivedPackages.length > 0 ?
                  (archivedPackages.map(pkg => {
                    return (
                      <tr key={pkg._id}>
                        <td>{pkg.carrier}</td>
                        <td>{pkg.trackingNumber}</td>
                        <td>{pkg.description}</td>
                        <td>{pkg.lastStatus}</td>
                        <td>{pkg.lastUpdate}</td>
                        <td>X</td>
                      </tr> 
                    )})) 
                  :
                  <td colSpan="6">No packages found in database!</td>
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
