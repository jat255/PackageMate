import React, { Component } from 'react';
import axios from 'axios';

import 'ladda/dist/ladda-themeless.min.css';

import Input from './Input';
import ListPackages from './ListPackages';
import UpdateAllButton from './UpdateAllButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShippingFast } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

// This is the main app component

class Package extends Component {

  state = {
    activePackages: [],
    archivedPackages: [],
    possibleCarriers: [],
    updateProgress: 0.0
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

  updateOnePackage = (pkg) => {
    return axios.get(`/api/packages/update/${pkg._id}`)
  }

  updateAllPackages = () => {
    var arrayLength = this.state.activePackages.length;
    var numFinished = 0.0
    var promList = []
    this.setState({
      loading: true
    })

    var updateNum = () => {
      this.getPackages();
      numFinished += 1;
      this.setState({
        updateProgress: numFinished / arrayLength
      })
    }

    for (let i = 0; i < arrayLength; i++) {
        let pkg = this.state.activePackages[i];
        let p = axios.get(`/api/packages/update/${pkg._id}`)
        promList.push(p)
        p.then(() => updateNum())
        .catch(err => console.log(err))
    }
    Promise.all(promList)
      .then(() => {
        this.setState({
          loading: false
        })
      })
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
      <Container fluid className="p-3 main-container">
        <Row>
          <Col>
            <h1 className="header"><FontAwesomeIcon icon={faShippingFast} /> PackageMate <FontAwesomeIcon icon={faShippingFast} /></h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button
              id='github-btn'
              variant='outline-dark'
              href='https://github.com/jat255/PackageMate'
              size='sm'
              target='_blank'
              rel='noreferrer'
              >
                <FontAwesomeIcon icon={faGithub} /> View project on GitHub
            </Button>
          </Col>
        </Row>
        <Row id='alert-row'>
          <Col>
            <Alert key='info' variant='info'>
              The Amazon tracker is not currently working, 
              so any packages added for Amazon will return 
              "Invalid Tracking_id". See <a 
                 href="https://github.com/jat255/PackageMate/issues/11" 
                 target="_blank" rel="noreferrer">this issue</a> for details/updates.
            </Alert>
          </Col>
        </Row>
        <Input
          possibleCarriers={this.state.possibleCarriers}
          getPackages={this.getPackages} />{' '}
        <UpdateAllButton 
          updateProgress={this.state.updateProgress}
          updateAllPackages={this.updateAllPackages}
          loading={this.state.loading} />
        <ListPackages 
          activePackages={this.state.activePackages} 
          archivedPackages={this.state.archivedPackages}
          archivePackage={this.archivePackage}
          updateOnePackage={this.updateOnePackage}
          getPackages={this.getPackages} />
      </Container>
    )
  }
}

export default Package;
