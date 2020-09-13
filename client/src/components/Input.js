import React, { Component } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsps } from '@fortawesome/free-brands-svg-icons'
import { faFedex } from '@fortawesome/free-brands-svg-icons'
import { faUps } from '@fortawesome/free-brands-svg-icons'


// code to wait for an element to be present
// from https://stackoverflow.com/a/47776379
function rafAsync() {
  return new Promise(resolve => {
      requestAnimationFrame(resolve); //faster than set time out
  });
}
async function waitForElement(selector) {
  let querySelector = document.querySelector(selector);
  while (querySelector === null) {
      querySelector = document.querySelector(selector);
      await rafAsync()
  }
  return querySelector;
}  

class Input extends Component {
  state = {
    dropDownValue: "Carrier",
    carrier: "",
    trackingNumber: "",
    description: ""
  }

  carrierIcons = {
    USPS: <FontAwesomeIcon icon={faUsps} />,
    FedEx: <FontAwesomeIcon icon={faFedex} />,
    UPS: <FontAwesomeIcon icon={faUps} />,
  }

  addPackage = () => {
    const pkg = {
      carrier: this.state.carrier,
      trackingNumber: this.state.trackingNumber,
      description: this.state.description
    }
    if (pkg.carrier && pkg.trackingNumber && pkg.trackingNumber.length > 0) {
      axios.post('/api/packages', pkg)
        .then(res => {
          if (res.data) {
            this.props.getPackages();
            this.setState({
              trackingNumber: "",
              carrier: "",
              description: "",
              dropDownValue: "Carrier"
            })
            // this is hacky and dumb, but we wait for the new button
            // to be added to the package list and then click the update button
            // so we get some progress indication (rather than just making)
            // a call to the API. There's surely a way to do this in react I don't
            // know about
            waitForElement(`#updateButton-${res.data._id}`) //use whichever selector you want
              .then(() => {
                  document.getElementById(`updateButton-${res.data._id}`).click()
              });
          }
        })
        .catch(err => console.log(err))
    } else {
      console.log('Tracking number and Carrier required')
    }
  }

  handleTrackingNumberChange = (e) => {
    this.setState({
      trackingNumber: e.target.value
    })
  }
  handleCarrierChange = (e) => {
    this.setState({
      carrier: e.target.value
    })
  }
  handleDescriptionChange = (e) => {
    this.setState({
      description: e.target.value
    })
  }
  changeDropDownValue(text) {
    this.setState({
      dropDownValue: text,
      carrier: text
    })
  }
  createDropdownItems() {
    let items = [];
    for (let i = 0; i <= this.props.possibleCarriers.length; i++) {
      let c = this.props.possibleCarriers[i]
      if (c in this.carrierIcons) {
        items.push(
          <Dropdown.Item as="button" key={i} onClick={(e) => this.changeDropDownValue(c)} >
            {this.carrierIcons[c]} {c}
          </Dropdown.Item>
        );
      } else {
        items.push(
          <Dropdown.Item as="button" key={i} onClick={(e) => this.changeDropDownValue(c)} >
            {c}
          </Dropdown.Item>
        )
      }
    }
    return items;
  }

  render() {
    return (
      <Row>
        <Col>
          <InputGroup className="mb-3">
            <DropdownButton
              as={InputGroup.Prepend}
              key="carrier-dropdown"
              variant="outline-primary"
              title={this.state.dropDownValue}
              id="input-group-dropdown-1"
            >
              {
                this.props.possibleCarriers &&
                  this.props.possibleCarriers.length > 0
                  ?
                  this.createDropdownItems()
                  :
                  <Dropdown.Item variant='warning'>No supported carriers were found!</Dropdown.Item>
              }
            </DropdownButton>

            <FormControl
              placeholder="Tracking number"
              aria-label="Tracking number"
              onChange={this.handleTrackingNumberChange}
              value={this.state.trackingNumber}
              onKeyPress={event => {
                if (event.key === "Enter") {
                  this.addPackage();
                }
              }}
            />

            <InputGroup.Append>
              <FormControl
                placeholder="Description (optional)"
                aria-label="Description (optional)"
                onChange={this.handleDescriptionChange}
                id='description-input'
                value={this.state.description}
                onKeyPress={event => {
                  if (event.key === "Enter") {
                    this.addPackage();
                  }
                }}
              />
            </InputGroup.Append>
            <InputGroup.Append>
              <Button variant="outline-success" onClick={this.addPackage}>Add Package</Button>
            </InputGroup.Append>
          </InputGroup>
        </Col>
      </Row>
    )
  }
}

export default Input
