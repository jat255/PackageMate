import React, { Component } from 'react';
import axios from 'axios';

import Input from './Input';
import ListPackages from './ListPackages';
import UpdateButton from './UpdateButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShippingFast } from '@fortawesome/free-solid-svg-icons'

// This is the main app component

class Package extends Component {

  state = {
    activePackages: [],
    archivedPackages: [],
    possibleCarriers: [],
  }

  componentDidMount() {
    this.getPackages();
    this.getCarriers();
  }

  getCarriers = () => {
    axios.get('/api/carriers')
      .then(res => {
        if (res.data) {
          this.setState({
            possibleCarriers: res.data
          })
        }
      })
      .catch(err => console.log(err));
  }

  getPackages = () => {
    axios.get('/api/packages/active')
      .then(res => {
        if (res.data) {
          this.setState({
            activePackages: res.data
          })
        }
      })
      .catch(err => console.log(err));
    axios.get('/api/packages/archived')
      .then(res => {
        if (res.data) {
          this.setState({
            archivedPackages: res.data
          })
        }
      })
      .catch(err => console.log(err))
  }

  updateAllPackages = () => {
    var arrayLength = this.state.activePackages.length;
    for (var i = 0; i < arrayLength; i++) {
        let pkg = this.state.activePackages[i];
          axios.get(`/api/packages/update/${pkg._id}`)
          .then(() => this.getPackages())
          .catch(err => console.log(err))
    }
  }

  archivePackage = (id) => {
    axios.delete(`/api/packages/${id}`)
      .then(res => {
        if (res.data) {
          this.getPackages()
        }
      })
      .catch(err => console.log(err))
  }

  render() {
    return (
      <Container fluid className="p-3">
        <Row>
          <Col>
            <h1 className="header"><FontAwesomeIcon icon={faShippingFast} /> Auto-Package Tracker</h1>
          </Col>
        </Row>
        <Input
          possibleCarriers={this.state.possibleCarriers}
          getPackages={this.getPackages} />{' '}
        <UpdateButton 
          updateAllPackages={this.updateAllPackages}/>
        <ListPackages 
          activePackages={this.state.activePackages} 
          archivedPackages={this.state.archivedPackages}
          archivePackage={this.archivePackage} />
      </Container>
    )
  }
}

export default Package;
